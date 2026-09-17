import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { verifyShopifyWebhook } from '../../../../../lib/agent-x/shopify-webhook';
import { reverseOrderEntitlements } from '../../../../../lib/agent-x/commerce-entitlement';

const EXPECTED_TOPIC = 'orders/cancelled';
const EXPECTED_SHOP = 'vy827r-0t.myshopify.com';

export async function POST(request: Request) {
  const shopifySecret = process.env.SHOPIFY_WEBHOOK_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_AGENT_X_SUPABASE_URL;
  const publishableKey = process.env.AGENT_X_SUPABASE_PUBLISHABLE_KEY;
  const bridgeSecret = process.env.AGENT_X_COMMERCE_BRIDGE_SECRET;

  if (!shopifySecret || !supabaseUrl || !publishableKey || !bridgeSecret) {
    return NextResponse.json({ error: 'commerce_bridge_not_configured' }, { status: 503 });
  }

  const rawBody = Buffer.from(await request.arrayBuffer());
  const hmac = request.headers.get('x-shopify-hmac-sha256') || '';
  const topic = request.headers.get('x-shopify-topic') || '';
  const shop = request.headers.get('x-shopify-shop-domain') || '';
  const webhookId = request.headers.get('x-shopify-webhook-id') || '';
  const eventId = request.headers.get('x-shopify-event-id') || '';

  if (!verifyShopifyWebhook(rawBody, hmac, shopifySecret)) {
    return NextResponse.json({ error: 'invalid_hmac' }, { status: 401 });
  }
  if (topic !== EXPECTED_TOPIC) return NextResponse.json({ error: 'unexpected_topic' }, { status: 400 });
  if (shop !== EXPECTED_SHOP) return NextResponse.json({ error: 'unexpected_shop' }, { status: 403 });
  if (!webhookId) return NextResponse.json({ error: 'missing_webhook_id' }, { status: 400 });

  let payload: any;
  try { payload = JSON.parse(rawBody.toString('utf8')); }
  catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  const orderId = String(payload?.admin_graphql_api_id || payload?.id || '');
  if (!orderId) return NextResponse.json({ error: 'missing_order_id' }, { status: 400 });
  const payloadSha256 = createHash('sha256').update(rawBody).digest('hex');

  try {
    const result = await reverseOrderEntitlements({
      supabaseUrl,
      publishableKey,
      bridgeSecret,
      webhookId,
      eventId: eventId || null,
      topic: EXPECTED_TOPIC,
      shopDomain: shop,
      orderId,
      payloadSha256,
      status: 'cancelled',
      lineItemIds: null,
      metadata: {
        source: 'shopify_orders_cancelled',
        cancel_reason: payload?.cancel_reason || null,
      },
    });
    return NextResponse.json({ ok: true, status: result.status, duplicate: !!result.duplicate, updated_entitlements: result.updated_entitlements || 0 });
  } catch (error) {
    console.error('Agent X order-cancelled bridge failure', error);
    return NextResponse.json({ error: 'entitlement_reversal_failed' }, { status: 500 });
  }
}
