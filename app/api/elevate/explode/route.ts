import { prisma } from "../../../../lib/prisma";
import { resolveHubUser } from "../../../../lib/hub-auth/session";
import { recordElevateEvent } from "../../../../lib/elevate-events";

function clean(value: unknown, max = 2000) {
  return String(value || "").trim().slice(0, max);
}

export async function POST(request: Request) {
  const user = await resolveHubUser(request);
  if (!user) return Response.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const profile = await prisma.elevateProfile.findUnique({ where: { userId: user.id } });
  if (!profile?.powerUp) {
    return Response.json({ error: "POWER_UP_REQUIRED" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const source = clean(body?.source);
  if (!source) return Response.json({ error: "SOURCE_REQUIRED" }, { status: 400 });

  const mission = clean(body?.mission, 200) || "this";
  const audience = clean(body?.audience, 120) || "people who would benefit";

  const short = source.length > 180 ? source.slice(0, 177) + "…" : source;
  const headline = mission.length > 70 ? mission.slice(0, 67) + "…" : mission;

  await recordElevateEvent({
    userId: user.id,
    eventType: "power_up_used",
    offer: "power",
    amountCents: 299,
    success: true,
  });

  return Response.json({
    ok: true,
    outputs: {
      social: `${headline}\n\n${source}\n\nIf this could help you or someone you know, take the next step today.`,
      text: `Quick thought for you: ${short} Want me to send you the next step?`,
      emailSubject: `A next step for ${headline}`,
      emailBody: `Hi —\n\nI wanted to share this with you because it may be useful:\n\n${source}\n\nIf it fits what you need, reply and I’ll send the next step.\n\nTake care,`,
      cta: `Take the next step with ${headline}.`,
      followUp: `Just following up on what I sent. Did any part of it fit what you need right now?`,
      send1: `I thought specifically of you: ${short}`,
      send5: `I’m sharing this with a small group because I think it could be useful: ${short}`,
      send50: `Sharing this broadly for ${audience}: ${short}`,
    },
  }, { headers: { "cache-control": "no-store" } });
}
