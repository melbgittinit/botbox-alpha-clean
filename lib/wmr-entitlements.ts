const WMR_PRODUCTS = {
  wmrBase: "gid://shopify/Product/10442248716581",
  forReal: "gid://shopify/Product/10674737414437",
  bwfPassport: "gid://shopify/Product/10674737545509",
  vipMe: "gid://shopify/Product/10656738869541",
};

export type WmrEntitlements = {
  wmrBase: boolean;
  forReal: boolean;
  bwfPassport: boolean;
  vipMe: boolean;
};

export async function fetchWmrEntitlements(graphqlEndpoint: string, accessToken: string): Promise<WmrEntitlements> {
  const found = new Set<string>();
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
        query: `query WmrCustomerOrders($after: String) {
          customer {
            orders(first: 100, after: $after) {
              nodes {
                lineItems(first: 100) {
                  nodes { productId }
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

    if (!response.ok) throw new Error(`WMR entitlement lookup failed (${response.status}).`);
    const payload = await response.json() as {
      data?: { customer?: { orders?: { nodes?: Array<{ lineItems?: { nodes?: Array<{ productId?: string | null }> } }>; pageInfo?: { hasNextPage?: boolean; endCursor?: string | null } } } };
      errors?: Array<{ message?: string }>;
    };
    if (payload.errors?.length) throw new Error("WMR entitlement lookup returned an error.");

    for (const order of payload.data?.customer?.orders?.nodes || []) {
      for (const item of order.lineItems?.nodes || []) if (item.productId) found.add(item.productId);
    }

    const pageInfo = payload.data?.customer?.orders?.pageInfo;
    after = pageInfo?.hasNextPage ? pageInfo.endCursor || null : null;
    pages += 1;
  } while (after && pages < 10);

  return {
    wmrBase: found.has(WMR_PRODUCTS.wmrBase),
    forReal: found.has(WMR_PRODUCTS.forReal),
    bwfPassport: found.has(WMR_PRODUCTS.bwfPassport),
    vipMe: found.has(WMR_PRODUCTS.vipMe),
  };
}
