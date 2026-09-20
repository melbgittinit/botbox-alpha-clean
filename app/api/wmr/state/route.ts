import { Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import { resolveHubUser } from "../../../../lib/hub-auth/session";

const allowedKeys = new Set([
  "day","listens","richStatement","metricName","current","target","richDate","why","risk",
  "next30","next90","next365","weekly","circle","evidence","history","bwfInsights"
]);

function cleanPlan(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("INVALID_PLAN");
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (allowedKeys.has(key)) output[key] = value;
  }
  if (JSON.stringify(output).length > 200000) throw new Error("PLAN_TOO_LARGE");
  return JSON.parse(JSON.stringify(output)) as Prisma.InputJsonValue;
}

async function authorizedProfile(request: Request) {
  const user = await resolveHubUser(request);
  if (!user) return { error: Response.json({ error: "AUTH_REQUIRED" }, { status: 401 }) };
  const profile = await prisma.wmrProfile.findUnique({ where: { userId: user.id } });
  if (!profile?.forReal) return { error: Response.json({ error: "FOR_REAL_REQUIRED" }, { status: 403 }) };
  return { user, profile };
}

export async function GET(request: Request) {
  const auth = await authorizedProfile(request);
  if ("error" in auth) return auth.error;
  return Response.json({
    ok: true,
    exists: Boolean(auth.profile.planState),
    state: auth.profile.planState || null,
    updatedAt: auth.profile.updatedAt,
  }, { headers: { "cache-control": "no-store" } });
}

export async function PUT(request: Request) {
  const auth = await authorizedProfile(request);
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const state = cleanPlan(body?.state);
    const profile = await prisma.wmrProfile.update({
      where: { userId: auth.user.id },
      data: { planState: state },
    });
    return Response.json({ ok: true, updatedAt: profile.updatedAt }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "INVALID_REQUEST";
    return Response.json({ error: message }, { status: 400 });
  }
}
