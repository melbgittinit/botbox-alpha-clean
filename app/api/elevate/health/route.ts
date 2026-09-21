export async function GET() {
  const bool = (v: string | undefined) => Boolean(v && v.trim());

  const printMappings = {
    card: bool(process.env.PRINTIFY_ELEVATE_CARD_BLUEPRINT_ID) && bool(process.env.PRINTIFY_ELEVATE_CARD_PROVIDER_ID) && bool(process.env.PRINTIFY_ELEVATE_CARD_VARIANT_ID),
    flyer: bool(process.env.PRINTIFY_ELEVATE_FLYER_BLUEPRINT_ID) && bool(process.env.PRINTIFY_ELEVATE_FLYER_PROVIDER_ID) && bool(process.env.PRINTIFY_ELEVATE_FLYER_VARIANT_ID),
    qrCard: bool(process.env.PRINTIFY_ELEVATE_QR_CARD_BLUEPRINT_ID) && bool(process.env.PRINTIFY_ELEVATE_QR_CARD_PROVIDER_ID) && bool(process.env.PRINTIFY_ELEVATE_QR_CARD_VARIANT_ID),
    postcard: bool(process.env.PRINTIFY_ELEVATE_POSTCARD_BLUEPRINT_ID) && bool(process.env.PRINTIFY_ELEVATE_POSTCARD_PROVIDER_ID) && bool(process.env.PRINTIFY_ELEVATE_POSTCARD_VARIANT_ID),
  };

  const checks = {
    database: bool(process.env.DATABASE_URL),
    hubSession: bool(process.env.HUB_SESSION_SECRET),
    shopifyCustomerAuth:
      bool(process.env.SHOPIFY_STORE_DOMAIN) &&
      bool(process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID) &&
      bool(process.env.HUB_AUTH_ORIGIN),
    ai: bool(process.env.OPENAI_API_KEY),
    stripe: bool(process.env.STRIPE_SECRET_KEY),
    stripeWebhook: bool(process.env.STRIPE_WEBHOOK_SECRET),
    printify: bool(process.env.PRINTIFY_API_TOKEN) && bool(process.env.PRINTIFY_SHOP_ID),
    printMappings,
    liveFulfillment: process.env.ELEVATE_FULFILLMENT_LIVE === "true",
  };

  const criticalReady =
    checks.database &&
    checks.hubSession &&
    checks.shopifyCustomerAuth &&
    checks.stripe &&
    checks.stripeWebhook;

  return Response.json({
    product: "ELEVATE_ME_BOT",
    environment: process.env.NODE_ENV || "unknown",
    checks,
    criticalReady,
    launchMode:
      criticalReady && checks.ai && checks.printify && checks.liveFulfillment
        ? "FULL_V1"
        : criticalReady
          ? "CONTROLLED_LAUNCH"
          : "NOT_READY",
  }, { headers: { "cache-control": "no-store" } });
}
