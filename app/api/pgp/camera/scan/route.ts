import { prisma } from "../../../../../lib/prisma";
import { resolveHubUser } from "../../../../../lib/hub-auth/session";

const WORKER_URL =
  process.env.PGP_CAMERA_WORKER_URL ||
  "https://opportunity-camera-alpha.onrender.com/api/opportunity-camera/scan";

export async function POST(request: Request) {
  const user = await resolveHubUser(request);
  if (!user) {
    return Response.json(
      { authenticated: false, error: "SIGN_IN_REQUIRED" },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const imageDataUrl = String(body?.image_data_url || "");

  if (!imageDataUrl.startsWith("data:image/")) {
    return Response.json({ error: "IMAGE_REQUIRED" }, { status: 400 });
  }

  const profile = await prisma.pgpProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return Response.json(
      { error: "CAMERA_ACCESS_REQUIRED" },
      { status: 403 }
    );
  }

  const now = new Date();
  const firstLookActive =
    profile.cameraTier === "FIRST_LOOK" &&
    profile.cameraScansRemaining > 0;

  const paidActive =
    Boolean(profile.cameraExpiresAt && profile.cameraExpiresAt > now) &&
    profile.cameraScansRemaining > 0;

  if (!firstLookActive && !paidActive) {
    return Response.json(
      {
        error:
          profile.cameraScansRemaining <= 0
            ? "NO_SCANS_REMAINING"
            : "CAMERA_PASS_INACTIVE",
        cameraTier: profile.cameraTier,
        scansRemaining: profile.cameraScansRemaining,
        expiresAt: profile.cameraExpiresAt,
      },
      { status: 403 }
    );
  }

  const reserved = await prisma.pgpProfile.updateMany({
    where: {
      userId: user.id,
      cameraScansRemaining: { gt: 0 },
    },
    data: {
      cameraScansRemaining: { decrement: 1 },
    },
  });

  if (reserved.count !== 1) {
    return Response.json({ error: "NO_SCANS_REMAINING" }, { status: 402 });
  }

  let workerSucceeded = false;

  try {
    const workerSecret = process.env.PGP_CAMERA_WORKER_SECRET;
    if (!workerSecret) {
      throw new Error("PGP camera worker secret is not configured.");
    }

    const workerResponse = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-pgp-worker-secret": workerSecret,
      },
      body: JSON.stringify({ image_data_url: imageDataUrl }),
      cache: "no-store",
    });

    const data = await workerResponse.json().catch(() => ({
      error: "CAMERA_WORKER_BAD_RESPONSE",
    }));

    if (!workerResponse.ok) {
      return Response.json(
        {
          error: data?.error || "CAMERA_SCAN_FAILED",
          message: data?.message || data?.detail || "The scan could not be completed.",
        },
        { status: workerResponse.status >= 500 ? 502 : workerResponse.status }
      );
    }

    workerSucceeded = true;

    const updated = await prisma.pgpProfile.findUnique({
      where: { userId: user.id },
    });

    return Response.json({
      ...data,
      access: {
        cameraTier: updated?.cameraTier || null,
        scansRemaining: updated?.cameraScansRemaining || 0,
        expiresAt: updated?.cameraExpiresAt || null,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The scan could not be completed.";

    return Response.json(
      { error: "CAMERA_SCAN_FAILED", message },
      { status: 502 }
    );
  } finally {
    if (!workerSucceeded) {
      await prisma.pgpProfile.update({
        where: { userId: user.id },
        data: { cameraScansRemaining: { increment: 1 } },
      }).catch(() => undefined);
    }
  }
}
