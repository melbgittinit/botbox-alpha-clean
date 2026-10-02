import { prisma } from "../../../../lib/prisma";
import { generateElevateAction } from "../../../../lib/elevate-ai";
import { recordElevateEvent } from "../../../../lib/elevate-events";

const allowed = new Set(["make","done","reach","earn","better","next"]);
const PREVIEW_LIMIT = 2;
const PREVIEW_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const action = String(body?.action || "");
  const sessionId = String(body?.sessionId || "").trim().slice(0, 160);
  const mission = String(body?.mission || "").trim().slice(0, 500);
  const botName = String(body?.botName || "").trim().slice(0, 80);
  const context = String(body?.context || "").trim().slice(0, 3000);
  const surface = String(body?.surface || "hub").slice(0, 40);

  if (!allowed.has(action)) return Response.json({ error: "INVALID_ACTION" }, { status: 400 });
  if (!sessionId) return Response.json({ error: "SESSION_REQUIRED" }, { status: 400 });
  if (!mission) return Response.json({ error: "MISSION_REQUIRED" }, { status: 400 });

  const since = new Date(Date.now() - PREVIEW_WINDOW_MS);
  const used = await prisma.elevateEvent.count({
    where: {
      sessionId,
      eventType: "preview_completed",
      createdAt: { gte: since },
      success: true,
    },
  });

  if (used >= PREVIEW_LIMIT) {
    await recordElevateEvent({
      sessionId,
      eventType: "preview_limit_hit",
      success: false,
      surface,
      source: "elevate_preview",
      payload: { action, used, limit: PREVIEW_LIMIT },
    });
    return Response.json({ error: "PREVIEW_LIMIT", used, limit: PREVIEW_LIMIT }, { status: 429 });
  }

  try {
    const result = await generateElevateAction({
      action: action as "make"|"done"|"reach"|"earn"|"better"|"next",
      mission,
      botName,
      context,
      mode: "preview",
    });

    await recordElevateEvent({
      sessionId,
      eventType: "preview_completed",
      success: true,
      surface,
      source: "elevate_preview",
      payload: {
        action,
        resultSource: result.source,
        usage: result.usage || null,
        used: used + 1,
        limit: PREVIEW_LIMIT,
      },
    });

    return Response.json({
      ok: true,
      result,
      previewsRemaining: Math.max(0, PREVIEW_LIMIT - (used + 1)),
    }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    await recordElevateEvent({
      sessionId,
      eventType: "preview_failed",
      success: false,
      surface,
      source: "elevate_preview",
      payload: { action, error: error instanceof Error ? error.message.slice(0, 240) : "unknown" },
    });
    console.error("Elevate preview failed", error);
    return Response.json({ error: "PREVIEW_FAILED" }, { status: 502 });
  }
}
