import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BRIDGE1_PROMPT } from "./bridge1-prompt.js";
import { REALTIME_TOOLS } from "./realtime-tools.js";
import { closeExecutivePersistence, completeExecutiveSession, configureExecutivePersistence, createExecutiveSession, executeCoreTool, executivePersistenceHealth, executivePersistenceMode, getExecutiveMetrics, getExecutiveSession, hydrateExecutiveSessions, listReviewQueue, updateHandoffStatus } from "./executive-core.js";
import { sendReviewAlert } from "./notifications.js";
import { createPostgresStore } from "./postgres-store.js";
import { issueInviteToken, parseCookie, rateLimit, verifyInviteCode, verifyInviteToken } from "./access-control.js";

const root = fileURLToPath(new URL("../public/", import.meta.url));
const port = Number(process.env.PORT || 3000);
const model = process.env.OPENAI_REALTIME_MODEL || "gpt-realtime-2.1";
const voice = process.env.BRIDGE1_VOICE || "marin";
const allowedOrigins = new Set((process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",").map(v => v.trim()));
const reviewToken = process.env.REVIEW_TOKEN || "";
const bridgeActive = process.env.BRIDGE1_ACTIVE !== "false";
const inviteRequired = process.env.INVITE_REQUIRED === "true";
const signingSecret = process.env.SESSION_SIGNING_SECRET || "";

const types = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8", ".svg":"image/svg+xml" };

function json(res, status, body, origin) {
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.writeHead(status, { "Content-Type":"application/json; charset=utf-8", "Cache-Control":"no-store" });
  res.end(JSON.stringify(body));
}

function clientKey(req) { return req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown"; }
function hasInvite(req) { return !inviteRequired || verifyInviteToken(parseCookie(req.headers.cookie), signingSecret); }
function protectedRoute(req) { return req.url.startsWith("/api/core/") || req.url.startsWith("/api/realtime-token"); }

function safetyId(req) {
  const raw = `${req.socket.remoteAddress || "anonymous"}:${req.headers["user-agent"] || "unknown"}`;
  return `bridge1-${Buffer.from(raw).toString("base64url").slice(0,48)}`;
}

async function readJson(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 100_000) throw new Error("PAYLOAD_TOO_LARGE");
  }
  return body ? JSON.parse(body) : {};
}

async function createRealtimeSecret(req, res) {
  if (!bridgeActive) return json(res, 503, { error:"BRIDGE-1 voice sessions are temporarily paused." }, req.headers.origin);
  const key = process.env.OPENAI_API_KEY;
  if (!key) return json(res, 503, { error:"Voice service is not configured." }, req.headers.origin);
  const sessionId = new URL(req.url, "http://localhost").searchParams.get("session_id");
  if (!sessionId || !getExecutiveSession(sessionId)) return json(res, 400, { error:"A valid executive session is required." }, req.headers.origin);
  const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method:"POST",
    headers:{
      "Authorization":`Bearer ${key}`,
      "Content-Type":"application/json",
      "OpenAI-Safety-Identifier":safetyId(req)
    },
    body:JSON.stringify({
      expires_after:{ anchor:"created_at", seconds:60 },
      session:{
        type:"realtime",
        model,
        instructions:BRIDGE1_PROMPT,
        audio:{ output:{ voice } },
        tools:REALTIME_TOOLS,
        tool_choice:"auto"
      }
    })
  });
  const data = await response.json();
  if (!response.ok) return json(res, response.status, { error:"Unable to begin the private voice session." }, req.headers.origin);
  return json(res, 200, { value:data.value, expires_at:data.expires_at, model }, req.headers.origin);
}

async function serveStatic(req, res) {
  const pathname = new URL(req.url, "http://localhost").pathname;
  const safePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  if (safePath.includes("..")) return json(res, 400, { error:"Invalid path" });
  try {
    const file = await readFile(join(root, safePath));
    res.writeHead(200, { "Content-Type":types[extname(safePath)] || "application/octet-stream", "X-Content-Type-Options":"nosniff", "Referrer-Policy":"strict-origin-when-cross-origin" });
    res.end(file);
  } catch {
    json(res, 404, { error:"Not found" });
  }
}

const server = http.createServer(async (req, res) => {
  try {
    res.setHeader("X-Content-Type-Options","nosniff");
    res.setHeader("Permissions-Policy","camera=(), geolocation=(), microphone=(self)");
    res.setHeader("Content-Security-Policy","default-src 'self'; connect-src 'self' https://api.openai.com; media-src 'self' blob:; style-src 'self'; script-src 'self'; frame-ancestors https://thebotstores.com https://*.myshopify.com");
    if (req.method === "OPTIONS") {
      const origin = req.headers.origin;
      if (origin && allowedOrigins.has(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.writeHead(204); return res.end();
    }
    if (req.method === "GET" && req.url === "/health") {
      try { return json(res, 200, { status:"ok", service:"bridge1-voice", persistence:await executivePersistenceHealth() }); }
      catch { return json(res, 503, { status:"degraded", service:"bridge1-voice", persistence:{ status:"error", mode:executivePersistenceMode() } }); }
    }
    if (req.method === "GET" && req.url === "/api/access") return json(res,200,{invited:hasInvite(req),required:inviteRequired},req.headers.origin);
    if (req.method === "POST" && req.url === "/api/invitations/verify") {
      const attempt=rateLimit(`invite:${clientKey(req)}`,{limit:8,windowMs:15*60*1000});
      if(!attempt.allowed){res.setHeader("Retry-After",attempt.retryAfter);return json(res,429,{error:"Too many invitation attempts."},req.headers.origin);}
      const {code}=await readJson(req);
      if(!verifyInviteCode(code))return json(res,401,{error:"Invitation not recognized."},req.headers.origin);
      const token=issueInviteToken(signingSecret);
      res.setHeader("Set-Cookie",`bridge1_invite=${token}; Max-Age=14400; Path=/; HttpOnly; Secure; SameSite=None`);
      return json(res,200,{invited:true},req.headers.origin);
    }
    if (protectedRoute(req) && !hasInvite(req)) return json(res,403,{error:"A private invitation is required."},req.headers.origin);
    if ((req.url === "/api/core/sessions" || req.url.startsWith("/api/realtime-token")) && req.method === "POST") {
      const attempt=rateLimit(`session:${clientKey(req)}`,{limit:12,windowMs:15*60*1000});
      if(!attempt.allowed){res.setHeader("Retry-After",attempt.retryAfter);return json(res,429,{error:"Please wait before starting another session."},req.headers.origin);}
    }
    if (req.method === "POST" && req.url === "/api/core/sessions") return json(res, 201, await createExecutiveSession(await readJson(req)), req.headers.origin);
    if (req.method === "GET" && req.url.startsWith("/api/core/sessions/")) {
      const session = getExecutiveSession(req.url.split("/").pop());
      return session ? json(res, 200, session, req.headers.origin) : json(res, 404, { error:"Session not found" }, req.headers.origin);
    }
    if (req.method === "POST" && /^\/api\/core\/sessions\/[^/]+\/complete$/.test(req.url)) {
      const sessionId = req.url.split("/")[4];
      try { return json(res, 200, await completeExecutiveSession(sessionId, await readJson(req)), req.headers.origin); }
      catch (error) { return json(res, 400, { error:error.message }, req.headers.origin); }
    }
    if (req.method === "POST" && req.url === "/api/core/tool") {
      const body = await readJson(req);
      try {
        const result = await executeCoreTool(body.session_id, body.name, body.arguments || {});
        if (body.name === "request_human_review" && result.status === "pending-human-review") {
          const item = listReviewQueue().find(entry => entry.session_id === body.session_id);
          if (item) sendReviewAlert(item).catch(error => console.error("Review alert failed", error));
        }
        return json(res, 200, result, req.headers.origin);
      }
      catch (error) { return json(res, 400, { error:error.message }, req.headers.origin); }
    }
    if (req.method === "GET" && req.url === "/api/review-queue") {
      if (!reviewToken || req.headers.authorization !== `Bearer ${reviewToken}`) return json(res, 401, { error:"Unauthorized" });
      return json(res, 200, { opportunities:listReviewQueue() });
    }
    if (req.method === "GET" && req.url === "/api/executive-metrics") {
      if (!reviewToken || req.headers.authorization !== `Bearer ${reviewToken}`) return json(res, 401, { error:"Unauthorized" });
      return json(res, 200, getExecutiveMetrics());
    }
    if (req.method === "POST" && req.url.startsWith("/api/review-queue/")) {
      if (!reviewToken || req.headers.authorization !== `Bearer ${reviewToken}`) return json(res, 401, { error:"Unauthorized" });
      const sessionId = req.url.split("/")[3];
      try { return json(res, 200, await updateHandoffStatus(sessionId, (await readJson(req)).status)); }
      catch (error) { return json(res, 400, { error:error.message }); }
    }
    if (req.method === "POST" && req.url.startsWith("/api/realtime-token")) return await createRealtimeSecret(req, res);
    if (req.method === "GET") return await serveStatic(req, res);
    return json(res, 405, { error:"Method not allowed" });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error:"The voice room encountered a temporary problem." });
  }
});

async function bootstrap() {
  const store = await createPostgresStore();
  configureExecutivePersistence(store);
  const restored = await hydrateExecutiveSessions();
  server.listen(port, "0.0.0.0", () => console.log(`BRIDGE-1 listening on ${port}; persistence=${executivePersistenceMode()}; restored=${restored}`));
}

async function shutdown() {
  server.close(async () => { await closeExecutivePersistence(); process.exit(0); });
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
bootstrap().catch(error => { console.error("BRIDGE-1 failed to start", error); process.exit(1); });
