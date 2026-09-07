import { NextResponse } from "next/server";
import { CONTROLLED_BOT_IDS, cleanTestPrompt, controlledResultFor } from "../../../lib/controlled-test";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ error: "JSON required" }, { status: 415 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { botId, prompt } = body as { botId?: unknown; prompt?: unknown };
  if (typeof botId !== "string" || !CONTROLLED_BOT_IDS.has(botId)) {
    return NextResponse.json({ error: "Unknown bot" }, { status: 400 });
  }

  const cleaned = cleanTestPrompt(prompt);
  const response = NextResponse.json({
    ok: true,
    mode: "public-controlled-alpha",
    botId,
    result: controlledResultFor(botId, cleaned),
    notice: "Public demo mode. No entitlement, external AI model, customer profile, checkout, or persistent prompt storage is used here.",
  });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}
