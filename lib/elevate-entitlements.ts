const ELEVATE_PRODUCT_ID = "gid://shopify/Product/10676027916581";

const ELEVATE_VARIANTS = {
  activate: "gid://shopify/ProductVariant/53879074324773",
  gift: "gid://shopify/ProductVariant/53879074357541",
  powerUp: "gid://shopify/ProductVariant/53879074390309",
  makeItReal: "gid://shopify/ProductVariant/53879074423077",
};

export type ElevateEntitlements = {
  activated: boolean;
  powerUp: boolean;
  makeItReal: boolean;
  giftCreditsPurchased: number;
};

export async function fetchElevateEntitlements(
  graphqlEndpoint: string,
  accessToken: string
): Promise<ElevateEntitlements> {
  let after: string | null = null;
  let pages = 0;
  let activated = false;
  let powerUp = false;
  let makeItReal = false;
  let giftCreditsPurchased = 0;

  do {
    const response = await fetch(graphqlEndpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: accessToken,
        "user-agent": "Seriously-Satisfying-HUB/1.0",
      },
      body: JSON.stringify({
        query: `query ElevateCustomerOrders($after: String) {
          customer {
            orders(first: 100, after: $after) {
              nodes {
                cancelledAt
                lineItems(first: 100) {
                  nodes {
                    productId
                    variantId
                    quantity
                    refundableQuantity
                  }
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

    if (!response.ok) {
      throw new Error(`Elevate entitlement lookup failed (${response.status}).`);
    }

    const payload = await response.json() as {
      data?: {
        customer?: {
          orders?: {
            nodes?: Array<{
              cancelledAt?: string | null;
              lineItems?: {
                nodes?: Array<{
                  productId?: string | null;
                  variantId?: string | null;
                  quantity?: number | null;
                  refundableQuantity?: number | null;
                }>;
              };
            }>;
            pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
          };
        };
      };
      errors?: Array<{ message?: string }>;
    };

    if (payload.errors?.length) {
      throw new Error("Elevate entitlement lookup returned an error.");
    }

    for (const order of payload.data?.customer?.orders?.nodes || []) {
      if (order.cancelledAt) continue;

      for (const item of order.lineItems?.nodes || []) {
        if (item.productId !== ELEVATE_PRODUCT_ID) continue;

        const effectiveQuantity = Math.max(
          0,
          Number.isFinite(item.refundableQuantity) ? Number(item.refundableQuantity) : Number(item.quantity || 0)
        );
        if (effectiveQuantity <= 0) continue;

        if (item.variantId === ELEVATE_VARIANTS.activate) activated = true;
        if (item.variantId === ELEVATE_VARIANTS.powerUp) {
          activated = true;
          powerUp = true;
        }
        if (item.variantId === ELEVATE_VARIANTS.makeItReal) {
          activated = true;
          powerUp = true;
          makeItReal = true;
        }
        if (item.variantId === ELEVATE_VARIANTS.gift) {
          giftCreditsPurchased += effectiveQuantity;
        }
      }
    }

    const pageInfo = payload.data?.customer?.orders?.pageInfo;
    after = pageInfo?.hasNextPage ? pageInfo.endCursor || null : null;
    pages += 1;
  } while (after && pages < 10);

  return { activated, powerUp, makeItReal, giftCreditsPurchased };
}
