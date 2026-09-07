import { NextResponse } from "next/server";

const ALLOWED_EVENTS = new Set([
  "VISIT",
  "TRY_STARTED",
  "TRY_COMPLETED",
  "BLUEPRINT_CREATED",
  "BLUEPRINT_SAVED",
  "LEAD_CAPTURED",
  "CONSENT_CHANGED",
  "SALES_TOUCH",
  "VOICE_INTERACTION",
  "SOCIAL_ENGAGEMENT",
  "CHECKOUT_STARTED",
  "PURCHASE",
  "BOT_LAUNCHED",
  "FIRST_MISSION",
  "GIFT",
  "SECOND_BOT",
  "EARN_INTEREST",
  "EARN_QUALIFIED",
  "REFERRAL_SALE",
  "OPT_OUT",
]);

const trim = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : undefined;

const cleanMetadata = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const source = value as Record<string, unknown>;
  const allowed = ["action", "label", "district", "campaign", "utm_source", "utm_medium", "utm_campaign", "referrer_host"];
  const result: Record<string, string | number | boolean> = {};
  for (const key of allowed) {
    const v = source[key];
    if (typeof v === "string") result[key] = v.slice(0, 160);
    else if (typeof v === "number" || typeof v === "boolean") result[key] = v;
  }
  return Object.keys(result).length ? result : undefined;
};

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const type = trim(body.type, 40);
  const sessionId = trim(body.sessionId, 80);
  const eventId = trim(body.eventId, 100);
  if (!type || !ALLOWED_EVENTS.has(type) || !sessionId || !eventId) {
    return NextResponse.json({ ok: false, error: "invalid_event" }, { status: 400 });
  }

  const event = {
    eventId,
    sessionId,
    visitorId: trim(body.visitorId, 80),
    type,
    botId: trim(body.botId, 60),
    path: trim(body.path, 180),
    metadata: cleanMetadata(body.metadata),
    occurredAt: new Date().toISOString(),
    source: "bot-factory-alpha",
  };

  // STAGING GATE: this is intentionally an anonymous, no-PII event stream.
  // Render captures structured application logs; persistent CRM ingestion is the
  // next gate and will forward this exact contract into Revenue Brain.
  console.info("BOT_FACTORY_REVENUE_EVENT", JSON.stringify(event));

  return NextResponse.json(
    { ok: true, accepted: true, persistedToCrm: false, mode: "STAGING_EVENT_STREAM" },
    { status: 202, headers: { "Cache-Control": "no-store" } },
  );
}
