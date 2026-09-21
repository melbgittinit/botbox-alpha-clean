type PrintifyAddress = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  country: string;
  region?: string;
  address1: string;
  address2?: string;
  city: string;
  zip: string;
};

const baseUrl = "https://api.printify.com/v1";

function config() {
  const token = process.env.PRINTIFY_API_TOKEN;
  const shopId = process.env.PRINTIFY_SHOP_ID;
  if (!token || !shopId) return null;
  return { token, shopId };
}

function headers(token: string) {
  return {
    "content-type": "application/json;charset=utf-8",
    authorization: "Bearer " + token,
    "user-agent": "Seriously-Satisfying-HUB/1.0",
  };
}

export function printifyConfigured() {
  return Boolean(config());
}

export async function printifyShippingQuote(args: {
  productId: string;
  variantId: number;
  quantity: number;
  address: PrintifyAddress;
}) {
  const cfg = config();
  if (!cfg) throw new Error("PRINTIFY_NOT_CONFIGURED");

  const response = await fetch(baseUrl + "/shops/" + cfg.shopId + "/orders/shipping.json", {
    method: "POST",
    headers: headers(cfg.token),
    body: JSON.stringify({
      line_items: [{
        product_id: args.productId,
        variant_id: args.variantId,
        quantity: args.quantity,
      }],
      address_to: args.address,
    }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("PRINTIFY_QUOTE_FAILED_" + response.status);
  return response.json() as Promise<Record<string, number>>;
}

export async function createPrintifyOrder(args: {
  externalId: string;
  productId: string;
  variantId: number;
  quantity: number;
  shippingMethod: number;
  address: PrintifyAddress;
}) {
  const cfg = config();
  if (!cfg) throw new Error("PRINTIFY_NOT_CONFIGURED");

  const response = await fetch(baseUrl + "/shops/" + cfg.shopId + "/orders.json", {
    method: "POST",
    headers: headers(cfg.token),
    body: JSON.stringify({
      external_id: args.externalId,
      label: args.externalId,
      line_items: [{
        product_id: args.productId,
        variant_id: args.variantId,
        quantity: args.quantity,
        external_id: args.externalId + "-1",
      }],
      shipping_method: args.shippingMethod,
      send_shipping_notification: true,
      address_to: args.address,
    }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("PRINTIFY_ORDER_FAILED_" + response.status);
  return response.json() as Promise<{ id?: string; status?: string }>;
}