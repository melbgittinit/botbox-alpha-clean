import { prisma } from "../../../../../lib/prisma";
import { resolveHubUser } from "../../../../../lib/hub-auth/session";

export async function POST(request: Request) {
  const user = await resolveHubUser(request);
  if (!user) return Response.json({ authenticated: false }, { status: 401 });

  const now = new Date();
  const profile = await prisma.pgpProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return Response.json({ error: "PGP_ACCESS_REQUIRED" }, { status: 403 });

  const timedActive = Boolean(profile.cameraExpiresAt && profile.cameraExpiresAt > now);
  const firstLookActive = profile.cameraTier === "FIRST_LOOK";
  if (!timedActive && !firstLookActive) {
    return Response.json({ error: "CAMERA_PASS_INACTIVE", expiresAt: profile.cameraExpiresAt }, { status: 403 });
  }

  const consumed = await prisma.pgpProfile.updateMany({
    where: {
      userId: user.id,
      cameraScansRemaining: { gt: 0 },
    },
    data: {
      cameraScansRemaining: { decrement: 1 },
    },
  });

  if (consumed.count !== 1) {
    return Response.json({ error: "NO_SCANS_REMAINING" }, { status: 402 });
  }

  const updated = await prisma.pgpProfile.findUnique({ where: { userId: user.id } });
  return Response.json({
    consumed: true,
    cameraTier: updated?.cameraTier || null,
    scansRemaining: updated?.cameraScansRemaining || 0,
    expiresAt: updated?.cameraExpiresAt || null,
  });
}
