import { prisma } from "../../../../lib/prisma";
import { resolveHubUser } from "../../../../lib/hub-auth/session";

export async function POST(request: Request) {
  const user = await resolveHubUser(request);
  if (!user) return Response.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const profile = await prisma.wmrProfile.findUnique({ where: { userId: user.id } });
  if (!profile?.forReal) return Response.json({ error: "FOR_REAL_REQUIRED" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const eventName = String(body?.eventName || "").trim().slice(0, 80);
  if (!/^[a-z0-9_.:-]{2,80}$/i.test(eventName)) {
    return Response.json({ error: "INVALID_EVENT_NAME" }, { status: 400 });
  }
  const payload = body?.payload && typeof body.payload === "object" && !Array.isArray(body.payload) ? body.payload : null;
  const event = await prisma.wmrEvent.create({ data: { userId: user.id, eventName, payload } });
  return Response.json({ ok: true, id: event.id });
}
