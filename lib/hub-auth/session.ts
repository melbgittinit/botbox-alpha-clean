import crypto from "crypto";
import { prisma } from "../prisma";

export const HUB_SESSION_COOKIE = "hub_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

type SessionPayload = {
  uid: string;
  exp: number;
  v: 1;
};

function b64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function sessionSecret() {
  const secret = process.env.HUB_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("HUB_SESSION_SECRET must be configured with at least 32 characters.");
  return secret;
}

function signPayload(encodedPayload: string) {
  return crypto.createHmac("sha256", sessionSecret()).update(encodedPayload).digest("base64url");
}

export function createHubSessionToken(userId: string) {
  const payload: SessionPayload = {
    uid: userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    v: 1,
  };
  const encoded = b64url(JSON.stringify(payload));
  return `${encoded}.${signPayload(encoded)}`;
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function verifyHubSessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = signPayload(encoded);
  if (!safeEqual(signature, expected)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (parsed.v !== 1 || !parsed.uid || !parsed.exp || parsed.exp <= Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = cookieHeader.split(";");
  for (const part of cookies) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export function sessionCookieHeader(token: string) {
  return `${HUB_SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; Secure; SameSite=Lax`;
}

export function clearSessionCookieHeader() {
  return `${HUB_SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

export async function resolveHubUser(request: Request) {
  const payload = verifyHubSessionToken(getCookie(request, HUB_SESSION_COOKIE));
  if (!payload) return null;
  return prisma.user.findUnique({ where: { id: payload.uid } });
}
