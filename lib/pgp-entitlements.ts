const PGP_PRODUCTS = {
  camera: "gid://shopify/Product/10675379306789",
  fullDigital: "gid://shopify/Product/10675379634469",
  shareCards: "gid://shopify/Product/10675379667237",
  walkWithMe: "gid://shopify/Product/10675379700005",
  goldenRanch: "gid://shopify/Product/10675379732773",
  premiumDigital: "gid://shopify/Product/10675379765541",
};

type OrderLine = {
  id: string;
  productId?: string | null;
  variantId?: string | null;
  sku?: string | null;
  variantTitle?: string | null;
  presentmentTitle?: string | null;
  quantity: number;
};

type OrderNode = {
  id: string;
  processedAt: string;
  lineItems?: { nodes?: OrderLine[] };
};

type CustomerOrdersPayload = {
  data?: {
    customer?: {
      orders?: {
        nodes?: OrderNode[];
        pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
      };
    };
  };
  errors?: Array<{ message?: string }>;
};

export type PgpOrderGrant = {
  orderId: string;
  lineItemId: string;
  processedAt: Date;
  sku: string;
  quantity: number;
  grantType: string;
  scansGranted: number;
  expiresAt: Date | null;
  gift: boolean;
};

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function lineTitle(line: OrderLine) {
  return (line.variantTitle || line.presentmentTitle || "").toLowerCase();
}

function mapGrant(order: OrderNode, line: OrderLine): PgpOrderGrant | null {
  const processedAt = new Date(order.processedAt);
  const qty = Math.max(1, Number(line.quantity || 1));
  const title = lineTitle(line);
  const sku = String(line.sku || "").trim();

  if (line.productId === PGP_PRODUCTS.camera) {
    if (sku === "PGP-CAM-FIRSTLOOK" || title.includes("first look")) {
      return {
        orderId: order.id, lineItemId: line.id, processedAt, sku: sku || "PGP-CAM-FIRSTLOOK",
        quantity: qty, grantType: "CAMERA_FIRST_LOOK", scansGranted: 3 * qty,
        expiresAt: null, gift: false,
      };
    }
    if (sku === "PGP-CAM-REFILL-25" || title.includes("refill")) {
      return {
        orderId: order.id, lineItemId: line.id, processedAt, sku: sku || "PGP-CAM-REFILL-25",
        quantity: qty, grantType: "CAMERA_REFILL", scansGranted: 25 * qty,
        expiresAt: null, gift: false,
      };
    }
    if (sku === "PGP-CAM-40-GIFT" || title.includes("gift opportunity camera")) {
      return {
        orderId: order.id, lineItemId: line.id, processedAt, sku: sku || "PGP-CAM-40-GIFT",
        quantity: qty, grantType: "CAMERA_40", scansGranted: 40,
        expiresAt: addDays(processedAt, 30), gift: true,
      };
    }
    if (sku === "PGP-CAM-PLUS-GIFT" || title.includes("gift camera+")) {
      return {
        orderId: order.id, lineItemId: line.id, processedAt, sku: sku || "PGP-CAM-PLUS-GIFT",
        quantity: qty, grantType: "CAMERA_PLUS", scansGranted: 150,
        expiresAt: addDays(processedAt, 30), gift: true,
      };
    }
    if (sku === "PGP-CAM-PLUS" || title.includes("camera+")) {
      return {
        orderId: order.id, lineItemId: line.id, processedAt, sku: sku || "PGP-CAM-PLUS",
        quantity: qty, grantType: "CAMERA_PLUS", scansGranted: 150 * qty,
        expiresAt: addDays(processedAt, 30), gift: false,
      };
    }
    if (sku === "PGP-CAM-40" || title.includes("my opportunity camera")) {
      return {
        orderId: order.id, lineItemId: line.id, processedAt, sku: sku || "PGP-CAM-40",
        quantity: qty, grantType: "CAMERA_40", scansGranted: 40 * qty,
        expiresAt: addDays(processedAt, 30), gift: false,
      };
    }
  }

  if (line.productId === PGP_PRODUCTS.fullDigital) {
    return { orderId: order.id, lineItemId: line.id, processedAt, sku: sku || "PGP-FULL-V1", quantity: qty, grantType: "FULL_DIGITAL", scansGranted: 0, expiresAt: null, gift: false };
  }
  if (line.productId === PGP_PRODUCTS.shareCards) {
    return { orderId: order.id, lineItemId: line.id, processedAt, sku: sku || "PGP-POWER-CARDS", quantity: qty, grantType: "SHARE_CARDS", scansGranted: 0, expiresAt: null, gift: false };
  }
  if (line.productId === PGP_PRODUCTS.walkWithMe) {
    return { orderId: order.id, lineItemId: line.id, processedAt, sku: sku || "PGP-WALK-V1", quantity: qty, grantType: "WALK_WITH_ME", scansGranted: 0, expiresAt: null, gift: false };
  }
  if (line.productId === PGP_PRODUCTS.goldenRanch) {
    return { orderId: order.id, lineItemId: line.id, processedAt, sku: sku || "PGP-RANCH-V1", quantity: qty, grantType: "GOLDEN_RANCH", scansGranted: 0, expiresAt: null, gift: false };
  }
  if (line.productId === PGP_PRODUCTS.premiumDigital) {
    return {
      orderId: order.id, lineItemId: line.id, processedAt, sku: sku || "PGP-PREMIUM-V1",
      quantity: qty, grantType: "PREMIUM_DIGITAL", scansGranted: 150 * qty,
      expiresAt: addDays(processedAt, 30), gift: false,
    };
  }

  return null;
}

export async function fetchPgpOrderGrants(graphqlEndpoint: string, accessToken: string) {
  const grants: PgpOrderGrant[] = [];
  let after: string | null = null;
  let pages = 0;

  do {
    const response = await fetch(graphqlEndpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: accessToken,
        "user-agent": "Seriously-Satisfying-HUB/1.0",
      },
      body: JSON.stringify({
        query: `query PgpCustomerOrders($after: String) {
          customer {
            orders(first: 100, after: $after, sortKey: PROCESSED_AT, reverse: true) {
              nodes {
                id
                processedAt
                lineItems(first: 100) {
                  nodes { id productId variantId sku variantTitle presentmentTitle quantity }
                }
              }
              pageInfo { hasNextPage endCursor }
            }
          }
        }`,
        variables: { after },
      }),
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`PGP entitlement lookup failed (${response.status}).`);
    const payload = await response.json() as CustomerOrdersPayload;
    if (payload.errors?.length) throw new Error("PGP entitlement lookup returned an error.");

    for (const order of payload.data?.customer?.orders?.nodes || []) {
      for (const line of order.lineItems?.nodes || []) {
        const grant = mapGrant(order, line);
        if (grant) grants.push(grant);
      }
    }

    const pageInfo = payload.data?.customer?.orders?.pageInfo;
    after = pageInfo?.hasNextPage ? pageInfo.endCursor || null : null;
    pages += 1;
  } while (after && pages < 10);

  return grants;
}
