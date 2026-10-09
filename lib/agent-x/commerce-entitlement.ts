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
  const response = await fetch(`${input.supabaseUrl}/functions/v1/agent-x-commerce-bridge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-agent-x-commerce-secret': input.bridgeSecret,
    },
    body: JSON.stringify({
      action: 'ingest_paid_order',
      payload: {
        webhookId: input.webhookId,
        eventId: input.eventId || null,
        topic: input.topic,
        shopDomain: input.shopDomain,
        orderId: input.orderId,
        customerId: input.customerId || null,
        orderName: input.orderName || null,
        email: input.email || null,
        paidAt: input.paidAt || null,
        payloadSha256: input.payloadSha256,
        items: input.items,
      },
    }),
    cache: 'no-store',
  });

  let envelope: any = null;
  try { envelope = await response.json(); } catch { envelope = null; }
  const data = envelope?.data;
  if (!response.ok || !envelope?.ok || !data?.ok) {
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
  const response = await fetch(`${input.supabaseUrl}/functions/v1/agent-x-commerce-bridge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-agent-x-commerce-secret': input.bridgeSecret,
    },
    body: JSON.stringify({
      action: 'reverse_order',
      payload: {
        webhookId: input.webhookId,
        eventId: input.eventId || null,
        topic: input.topic,
        shopDomain: input.shopDomain,
        orderId: input.orderId,
        payloadSha256: input.payloadSha256,
        status: input.status,
        lineItemIds: input.lineItemIds ?? null,
        metadata: input.metadata || {},
      },
    }),
    cache: 'no-store',
  });

  let envelope: any = null;
  try { envelope = await response.json(); } catch { envelope = null; }
  const data = envelope?.data;
  if (!response.ok || !envelope?.ok || !data?.ok) {
    throw new Error('entitlement_reversal_failed');
  }
  return data;
}
