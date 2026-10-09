import { generateElevateAction } from "../../../../lib/elevate-ai";

const allowed = new Set(["make","done","reach","earn","better","next"]);
const PREVIEW_LIMIT = 2;
const PREVIEW_WINDOW_MS = 24 * 60 * 60 * 1000;

type PreviewBucket = number[];
const previewBuckets = new Map<string, PreviewBucket>();

function previewUsage(sessionId: string) {
  const now = Date.now();
  const recent = (previewBuckets.get(sessionId) || []).filter(at => now - at < PREVIEW_WINDOW_MS);
  previewBuckets.set(sessionId, recent);
  return recent;
}

function recordPreviewUse(sessionId: string) {
  const recent = previewUsage(sessionId);
  recent.push(Date.now());
  previewBuckets.set(sessionId, recent);
  return recent.length;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const action = String(body?.action || "");
  const sessionId = String(body?.sessionId || "").trim().slice(0, 160);
  const mission = String(body?.mission || "").trim().slice(0, 500);
  const botName = String(body?.botName || "").trim().slice(0, 80);
  const context = String(body?.context || "").trim().slice(0, 3000);

  if (!allowed.has(action)) return Response.json({ error: "INVALID_ACTION" }, { status: 400 });
  if (!sessionId) return Response.json({ error: "SESSION_REQUIRED" }, { status: 400 });
  if (!mission) return Response.json({ error: "MISSION_REQUIRED" }, { status: 400 });

  const used = previewUsage(sessionId).length;
  if (used >= PREVIEW_LIMIT) {
    console.log("ELEVATE_PREVIEW_LIMIT " + JSON.stringify({ sessionId, action, used, limit: PREVIEW_LIMIT }));
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

    const totalUsed = recordPreviewUse(sessionId);
    console.log("ELEVATE_PREVIEW_COMPLETE " + JSON.stringify({
      sessionId,
      action,
      resultSource: result.source,
      totalUsed,
      limit: PREVIEW_LIMIT,
      usage: result.usage || null,
    }));

    return Response.json({
      ok: true,
      result,
      previewsRemaining: Math.max(0, PREVIEW_LIMIT - totalUsed),
    }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("Elevate preview failed", {
      action,
      sessionId,
      error: error instanceof Error ? error.message : "unknown",
    });
    return Response.json({ error: "PREVIEW_FAILED" }, { status: 502 });
  }
}
