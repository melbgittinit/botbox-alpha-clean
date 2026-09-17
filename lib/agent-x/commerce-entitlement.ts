export type PaidOrderItem = {
  line_item_id: string;
  sku: string;
  quantity: number;
};

export async function ingestPaidOrderEntitlements(input: {
  supabaseUrl: string;
  publishableKey: string;
  bridgeSecret: string;
  webhookId: string;
  eventId?: string | null;
  topic: string;
  shopDomain: string;
  orderId: string;
  customerId?: string | null;
  orderName?: string | null;
  email?: string | null;
  paidAt?: string | null;
  payloadSha256: string;
  items: PaidOrderItem[];
}) {
  const response = await fetch(`${input.supabaseUrl}/rest/v1/rpc/agent_x_ingest_paid_order_bridge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: input.publishableKey,
      Authorization: `Bearer ${input.publishableKey}`,
    },
    body: JSON.stringify({
      p_secret: input.bridgeSecret,
      p_webhook_id: input.webhookId,
      p_event_id: input.eventId || null,
      p_topic: input.topic,
      p_shop_domain: input.shopDomain,
      p_order_id: input.orderId,
      p_customer_id: input.customerId || null,
      p_order_name: input.orderName || null,
      p_email: input.email || null,
      p_paid_at: input.paidAt || null,
      p_payload_sha256: input.payloadSha256,
      p_items: input.items,
    }),
    cache: 'no-store',
  });

  let data: any = null;
  try { data = await response.json(); } catch { data = null; }
  if (!response.ok || !data?.ok) {
    throw new Error('entitlement_ingest_failed');
  }
  return data;
}

export async function reverseOrderEntitlements(input: {
  supabaseUrl: string;
  publishableKey: string;
  bridgeSecret: string;
  webhookId: string;
  eventId?: string | null;
  topic: 'orders/cancelled' | 'refunds/create';
  shopDomain: string;
  orderId: string;
  payloadSha256: string;
  status: 'cancelled' | 'refunded';
  lineItemIds?: string[] | null;
  metadata?: Record<string, unknown>;
}) {
  const response = await fetch(`${input.supabaseUrl}/rest/v1/rpc/agent_x_ingest_reversal_webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: input.publishableKey,
      Authorization: `Bearer ${input.publishableKey}`,
    },
    body: JSON.stringify({
      p_secret: input.bridgeSecret,
      p_webhook_id: input.webhookId,
      p_event_id: input.eventId || null,
      p_topic: input.topic,
      p_shop_domain: input.shopDomain,
      p_order_id: input.orderId,
      p_payload_sha256: input.payloadSha256,
      p_status: input.status,
      p_line_item_ids: input.lineItemIds ?? null,
      p_metadata: input.metadata || {},
    }),
    cache: 'no-store',
  });

  let data: any = null;
  try { data = await response.json(); } catch { data = null; }
  if (!response.ok || !data?.ok) {
    throw new Error('entitlement_reversal_failed');
  }
  return data;
}
