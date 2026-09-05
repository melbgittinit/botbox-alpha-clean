import { fastPayStatus } from "../../../../lib/fast-pay/core";

export async function GET() {
  const base = fastPayStatus();
  const authConfigured = Boolean(
    process.env.SHOPIFY_STORE_DOMAIN &&
    process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID &&
    process.env.HUB_AUTH_ORIGIN &&
    process.env.HUB_SESSION_SECRET &&
    process.env.HUB_SESSION_SECRET.length >= 32
  );

  const liveReady = Boolean(
    base.enabled &&
    base.stripeConfigured &&
    base.webhookConfigured &&
    base.appOriginConfigured &&
    authConfigured
  );

  const status = {
    ...base,
    authConfigured,
    liveReady,
    internalMaintenanceAuthConfigured: base.internalAuthConfigured,
  };
  return Response.json(status, { status: liveReady ? 200 : 503 });
}
