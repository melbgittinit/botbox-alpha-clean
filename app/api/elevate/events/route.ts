import { resolveHubUser } from "../../../../lib/hub-auth/session";
import { recordElevateEvent } from "../../../../lib/elevate-events";
import { normalizeElevateCycleKey } from "../../../../lib/elevate-attribution";

const allowedEvents = new Set([
  "page_view",
  "preview_run",
  "unlock_open",
  "checkout_intent",
  "unlock_verify",
  "activation_gate_hit",
  "client_error",
]);

const allowedOffers = new Set(["activate", "gift", "power", "real"]);
const offerAmounts: Record<string, number> = {
  activate: 100,
  gift: 199,
  power: 299,
  real: 799,
};

function clean(value: unknown, max = 160) {
  const text = String(value || "").trim();
  return text ? text.slice(0, max) : null;
}

function cleanPayload(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const output: Record<string, string | number | boolean | null> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>).slice(0, 20)) {
    const safeKey = key.slice(0, 60);
    if (typeof raw === "string") output[safeKey] = raw.slice(0, 240);
    else if (typeof raw === "number" && Number.isFinite(raw)) output[safeKey] = raw;
    else if (typeof raw === "boolean" || raw === null) output[safeKey] = raw as boolean | null;
  }
  return output;
}

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== requestUrl.host) {
        return Response.json({ error: "ORIGIN_NOT_ALLOWED" }, { status: 403 });
      }
    } catch {
      return Response.json({ error: "INVALID_ORIGIN" }, { status: 403 });
    }
  }

  const body = await request.json().catch(() => null);
  const eventType = clean(body?.eventType, 80);
  if (!eventType || !allowedEvents.has(eventType)) {
    return Response.json({ error: "INVALID_EVENT" }, { status: 400 });
  }

  const rawOffer = clean(body?.offer, 40);
  const offer = rawOffer && allowedOffers.has(rawOffer) ? rawOffer : null;
  const user = await resolveHubUser(request).catch(() => null);
  const cycleKey = normalizeElevateCycleKey(body?.cycleKey);

  if (user && cycleKey) {
    await import("../../../../lib/prisma").then(({ prisma }) =>
      prisma.elevateProfile.updateMany({
        where: { userId: user.id },
        data: { lastCycleKey: cycleKey, lastCycleAt: new Date() },
      })
    ).catch(() => null);
  }

  await recordElevateEvent({
    userId: user?.id || null,
    sessionId: clean(body?.sessionId, 160),
    cycleKey,
    eventType,
    surface: clean(body?.surface, 40),
    offer,
    amountCents: offer ? offerAmounts[offer] : null,
    success: typeof body?.success === "boolean" ? body.success : null,
    channel: clean(body?.channel, 80),
    source: clean(body?.source, 160),
    payload: cleanPayload(body?.payload),
  });

  return Response.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
