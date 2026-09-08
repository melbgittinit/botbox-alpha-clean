import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const CCJ_VARIANT_ID = "53746665226533";
const EXPECTED_SHOP = "distributorsofurbanspiritbiblesbooks-gifts.myshopify.com";
const ALLOWED_TOPICS = new Set(["orders/paid", "refunds/create", "orders/cancelled"]);

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function base64ToBytes(value: string) {
  try {
    const raw = atob(value);
    return Uint8Array.from(raw, (c) => c.charCodeAt(0));
  } catch {
    return new Uint8Array();
  }
}

async function validShopifyHmac(rawBody: string, received: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody)),
  );
  return constantTimeEqual(signature, base64ToBytes(received));
}

function sourceOrderId(payload: any, topic: string) {
  if (topic === "refunds/create") return String(payload?.order_id ?? "");
  return String(payload?.id ?? "");
}

function containsCreatorCollegeVariant(payload: any) {
  const lines = Array.isArray(payload?.line_items) ? payload.line_items : [];
  return lines.some((line: any) => String(line?.variant_id ?? "") === CCJ_VARIANT_ID);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  // Fail closed until the private Shopify app webhook secret is configured as a
  // Supabase Edge Function secret. Never hard-code or expose this value.
  const webhookSecret = Deno.env.get("SHOPIFY_WEBHOOK_SECRET")?.trim();
  if (!webhookSecret) return json(503, { error: "webhook_not_configured" });

  const topic = (req.headers.get("x-shopify-topic") || "").toLowerCase();
  const shop = (req.headers.get("x-shopify-shop-domain") || "").toLowerCase();
  const hmac = req.headers.get("x-shopify-hmac-sha256") || "";
  const webhookId = req.headers.get("x-shopify-webhook-id") || "";
  const eventId = req.headers.get("x-shopify-event-id") || "";

  if (!ALLOWED_TOPICS.has(topic)) return json(400, { error: "unsupported_topic" });
  if (shop !== EXPECTED_SHOP) return json(401, { error: "wrong_shop" });
  if (!hmac || !webhookId) return json(401, { error: "missing_signature_headers" });

  const rawBody = await req.text();
  if (!(await validShopifyHmac(rawBody, hmac, webhookSecret))) {
    return json(401, { error: "invalid_hmac" });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const orderId = sourceOrderId(payload, topic);
  if (!orderId) return json(400, { error: "missing_order_id" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return json(503, { error: "database_not_configured" });

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (topic === "orders/paid") {
    if (!containsCreatorCollegeVariant(payload)) {
      return json(200, { status: "ignored", reason: "not_creator_college" });
    }

    // Customer-editable order fields are deliberately NOT trusted for parent or
    // Creator ownership. Until checkout carries a server-signed association,
    // valid CCJ orders enter the pending-association queue instead of unlocking.
    const { data, error } = await supabase.rpc("ccj_process_shopify_paid", {
      p_webhook_id: webhookId,
      p_event_id: eventId || null,
      p_shop_domain: shop,
      p_order_id: orderId,
      p_parent_id: null,
      p_creator_id: null,
    });
    if (error) return json(500, { error: "processor_failed" });
    return json(200, { status: data?.status || "processed" });
  }

  const { data, error } = await supabase.rpc("ccj_process_shopify_revoke", {
    p_webhook_id: webhookId,
    p_event_id: eventId || null,
    p_topic: topic,
    p_shop_domain: shop,
    p_order_id: orderId,
  });
  if (error) return json(500, { error: "processor_failed" });
  return json(200, { status: data?.status || "processed" });
});
