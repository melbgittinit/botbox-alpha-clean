import { prisma } from "../../../../lib/prisma";
import { resolveHubUser } from "../../../../lib/hub-auth/session";
import { generateElevateAction } from "../../../../lib/elevate-ai";
import { recordElevateEvent } from "../../../../lib/elevate-events";

const allowed = new Set(["make","done","reach","earn","better","next"]);

export async function POST(request: Request) {
  const user = await resolveHubUser(request);
  if (!user) return Response.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const profile = await prisma.elevateProfile.findUnique({ where: { userId: user.id } });
  if (!profile?.activated) return Response.json({ error: "ACTIVATE_REQUIRED" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const action = String(body?.action || "");
  if (!allowed.has(action)) return Response.json({ error: "INVALID_ACTION" }, { status: 400 });

  const mission = String(body?.mission || "").trim().slice(0, 500);
  const botName = String(body?.botName || "").trim().slice(0, 80);
  const context = String(body?.context || "").trim().slice(0, 3000);

  try {
    const result = await generateElevateAction({
      action: action as "make"|"done"|"reach"|"earn"|"better"|"next",
      mission,
      botName,
      context,
    });

    await recordElevateEvent({
      userId: user.id,
      eventType: "action_completed",
      success: true,
      payload: { action, resultSource: result?.source || "unknown" },
    });

    return Response.json({ ok: true, result }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    await recordElevateEvent({
      userId: user.id,
      eventType: "action_failed",
      success: false,
      payload: { action, error: error instanceof Error ? error.message.slice(0, 240) : "unknown" },
    });
    console.error("Elevate action failed", error);
    return Response.json({ error: "ACTION_FAILED" }, { status: 502 });
  }
}
