import { createHash, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API = "https://api.elevenlabs.io";
const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
const effects: Record<string, { text: string; duration_seconds: number }> = {
  "reception-bell": { text: "One gentle strike on a polished brass hotel reception desk bell. Clear warm ding, delicate natural decay in a quiet grand lobby. Isolated sound effect, no voices, no music.", duration_seconds: 2 },
  "elevator-arrival": { text: "A refined vintage hotel elevator arriving: a soft mechanical settling sound followed by two delicate warm bell notes. No voices, no music, no alarm.", duration_seconds: 3 },
  "mystery-key": { text: "An antique brass key turns in an old hotel lock, a small precise mechanical click followed by a very quiet door movement. Intimate and intriguing, no voices, no music.", duration_seconds: 3 },
};

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers });
}

function authorize(request: Request): Response | null {
  const token = process.env.HOTEL_AUDIO_OPERATOR_TOKEN || "";
  const expiry = Date.parse(process.env.HOTEL_AUDIO_OPERATOR_EXPIRES_AT || "");
  if (token.length < 32 || !Number.isFinite(expiry) || Date.now() >= expiry) return json({ error: "studio_disabled" }, 503);
  const supplied = request.headers.get("authorization") || "";
  const hash = (value: string) => createHash("sha256").update(value).digest();
  if (!timingSafeEqual(hash(supplied), hash(`Bearer ${token}`))) return json({ error: "unauthorized" }, 401);
  if (!process.env.ELEVENLABS_API_KEY?.trim()) return json({ error: "elevenlabs_key_missing" }, 503);
  return null;
}

async function provider(path: string, method = "GET", body?: unknown) {
  return fetch(`${API}${path}`, {
    method,
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY!.trim(), "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(method === "GET" ? 20000 : 60000),
  });
}

async function providerError(response: Response) {
  // Never echo provider messages: they may contain account information or submitted text.
  let code = "provider_error";
  let requiredPermission: string | undefined;
  try {
    const result = await response.json();
    if (typeof result?.detail?.status === "string" && /^[a-z0-9_]{1,80}$/.test(result.detail.status)) code = result.detail.status;
    if (code === "missing_permissions" && typeof result?.detail?.message === "string") {
      requiredPermission = result.detail.message.match(/\b(voices_read|voices_write|voice_generation|text_to_speech|sound_generation)\b/)?.[1];
    }
  } catch { /* Non-JSON provider error. */ }
  return json({ error: code, provider: "elevenlabs", provider_status: response.status, ...(requiredPermission ? { required_permission: requiredPermission } : {}) }, 502);
}

function voiceSummary(voice: Record<string, unknown>) {
  return Object.fromEntries([
    "voice_id", "name", "description", "labels", "preview_url", "category", "accent", "gender", "age",
    "language", "public_owner_id", "rate", "free_users_allowed", "high_quality_base_model_ids",
  ].filter(key => voice[key] !== undefined).map(key => [key, voice[key]]));
}

export async function GET(request: Request) {
  const rejected = authorize(request);
  if (rejected) return rejected;
  const query = new URL(request.url).searchParams;
  const action = query.get("action") || "voices";
  if (!["voices", "library", "status"].includes(action)) return json({ error: "invalid_action" }, 400);
  if (action === "status") return json({ key_configured: true, provider: "elevenlabs", generation_enabled: process.env.HOTEL_AUDIO_GENERATION_ENABLED === "true", note: "Configuration only; use voices to verify provider authentication." });
  const parameters = new URLSearchParams({ page_size: "50" });
  for (const key of ["search", "gender", "age", "accent", "language"]) {
    const value = query.get(key);
    if (value) {
      if (value.length > 120) return json({ error: "query_too_long" }, 400);
      parameters.set(key, value);
    }
  }
  if (action === "voices") {
    parameters.set("voice_type", "saved");
    const page = query.get("next_page_token");
    if (page && page.length <= 1000) parameters.set("next_page_token", page);
  } else {
    parameters.set("include_custom_rates", "false");
    const page = query.get("page");
    if (page && /^\d{1,3}$/.test(page)) parameters.set("page", page);
  }
  try {
    const response = await provider(`${action === "voices" ? "/v2/voices" : "/v1/shared-voices"}?${parameters}`);
    if (!response.ok) return providerError(response);
    const result = await response.json();
    return json({ provider: "elevenlabs", voices: (result.voices || []).map(voiceSummary), has_more: !!result.has_more, next_page_token: result.next_page_token || null });
  } catch { return json({ error: "provider_unavailable", provider: "elevenlabs" }, 502); }
}

// Operator-only generation. No consumer page calls this endpoint.
// The provider key's own credit limit is the durable spending limit.
let generationBusy = false;
export async function POST(request: Request) {
  const rejected = authorize(request);
  if (rejected) return rejected;
  if (process.env.HOTEL_AUDIO_GENERATION_ENABLED !== "true") return json({ error: "generation_disabled" }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return json({ error: "json_required" }, 415);
  if (Number(request.headers.get("content-length") || 0) > 6000) return json({ error: "body_too_large" }, 413);
  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (Buffer.byteLength(text) > 6000) return json({ error: "body_too_large" }, 413);
    body = JSON.parse(text);
    if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "invalid_body" }, 400);
  } catch { return json({ error: "invalid_json" }, 400); }
  let path: string;
  let payload: Record<string, unknown>;
  if (body.action === "voice-design") {
    if (typeof body.voice_description !== "string" || body.voice_description.length < 20 || body.voice_description.length > 1000) return json({ error: "description_requires_20_to_1000_characters" }, 400);
    if (typeof body.text !== "string" || body.text.length < 100 || body.text.length > 300) return json({ error: "audition_requires_100_to_300_characters" }, 400);
    path = "/v1/text-to-voice/design?output_format=mp3_44100_128";
    payload = { voice_description: body.voice_description, text: body.text, auto_generate_text: false, model_id: "eleven_ttv_v3", loudness: 0, guidance_scale: 5, should_enhance: false };
  } else if (body.action === "sound-effect") {
    const effect = typeof body.cue_id === "string" && Object.hasOwn(effects, body.cue_id) ? effects[body.cue_id] : null;
    if (!effect) return json({ error: "unknown_sound_cue" }, 400);
    path = "/v1/sound-generation?output_format=mp3_44100_128";
    payload = { ...effect, model_id: "eleven_text_to_sound_v2", loop: false, prompt_influence: 0.5 };
  } else if (body.action === "speech") {
    const allowed = (process.env.HOTEL_AUDIO_APPROVED_VOICE_IDS || "").split(",").map(x => x.trim()).filter(Boolean);
    if (typeof body.voice_id !== "string" || !/^[A-Za-z0-9]{10,80}$/.test(body.voice_id) || !allowed.includes(body.voice_id)) return json({ error: "voice_not_approved" }, 403);
    if (typeof body.text !== "string" || !body.text.trim() || body.text.length > 800) return json({ error: "speech_requires_1_to_800_characters" }, 400);
    path = `/v1/text-to-speech/${encodeURIComponent(body.voice_id)}?output_format=mp3_44100_128`;
    payload = { text: body.text, model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: 0.95 } };
  } else return json({ error: "invalid_action" }, 400);
  if (generationBusy) return json({ error: "generation_in_progress" }, 409);
  generationBusy = true;
  try {
    const response = await provider(path, "POST", payload);
    if (!response.ok) return providerError(response);
    if (body.action === "voice-design") {
      const raw = await response.text();
      if (raw.length > 15_000_000) return json({ error: "invalid_preview_size" }, 502);
      const result = JSON.parse(raw);
      if (!Array.isArray(result.previews) || result.previews.length < 1 || result.previews.length > 5) return json({ error: "invalid_previews" }, 502);
      const previews = result.previews.map((preview: Record<string, unknown>) => {
        if (typeof preview.audio_base_64 !== "string" || preview.audio_base_64.length < 100 || !/^[A-Za-z0-9+/=\s]+$/.test(preview.audio_base_64)) throw new Error("invalid_preview_audio");
        return { audio_base_64: preview.audio_base_64, generated_voice_id: preview.generated_voice_id, media_type: preview.media_type, duration_secs: preview.duration_secs };
      });
      return json({ provider: "elevenlabs", text: result.text, previews, note: "Auditions only. No voice saved or installed." });
    }
    const type = response.headers.get("content-type") || "";
    if (!type.includes("audio/") && !type.includes("application/octet-stream")) return json({ error: "unexpected_provider_response" }, 502);
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength < 100 || bytes.byteLength > 15_000_000) return json({ error: "invalid_audio_size" }, 502);
    const resultHeaders: Record<string, string> = { ...headers, "Content-Type": "audio/mpeg", "Content-Disposition": "attachment; filename=hotel-audio.mp3" };
    const cost = response.headers.get("character-cost");
    if (cost && /^\d+(\.\d+)?$/.test(cost)) resultHeaders["X-ElevenLabs-Character-Cost"] = cost;
    return new Response(bytes, { headers: resultHeaders });
  } catch { return json({ error: "provider_unavailable_do_not_auto_retry", provider: "elevenlabs" }, 502); }
  finally { generationBusy = false; }
}
