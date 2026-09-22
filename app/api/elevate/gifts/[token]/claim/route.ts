import { prisma } from "../../../../../../lib/prisma";
import { resolveHubUser } from "../../../../../../lib/hub-auth/session";
import { recordElevateEvent } from "../../../../../../lib/elevate-events";

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  const user = await resolveHubUser(request);
  if (!user) return Response.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const { token } = await context.params;
  const gift = await prisma.elevateGift.findUnique({ where: { token } });
  if (!gift) return Response.json({ error: "GIFT_NOT_FOUND" }, { status: 404 });

  if (gift.claimedAt) {
    return Response.json({
      ok: gift.claimedByUserId === user.id,
      error: gift.claimedByUserId === user.id ? undefined : "GIFT_ALREADY_CLAIMED",
    }, { status: gift.claimedByUserId === user.id ? 200 : 409 });
  }

  if (gift.recipientEmail !== user.email.toLowerCase()) {
    return Response.json({ error: "GIFT_EMAIL_MISMATCH" }, { status: 403 });
  }

  const giverProfile = await prisma.elevateProfile.findUnique({ where: { userId: gift.giverUserId } });
  const claimedCount = await prisma.elevateGift.count({
    where: { giverUserId: gift.giverUserId, claimedAt: { not: null } },
  });
  if (!giverProfile || claimedCount >= giverProfile.giftCreditsPurchased) {
    return Response.json({ error: "GIFT_CREDIT_UNAVAILABLE" }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.elevateGift.update({
      where: { id: gift.id },
      data: { claimedByUserId: user.id, claimedAt: new Date() },
    }),
    prisma.elevateProfile.upsert({
      where: { userId: user.id },
      update: { activated: true },
      create: {
        userId: user.id,
        activated: true,
        powerUp: false,
        makeItReal: false,
        giftCreditsPurchased: 0,
      },
    }),
  ]);

  await recordElevateEvent({
    userId: user.id,
    cycleKey: gift.cycleKey,
    eventType: "gift_claimed",
    offer: "gift",
    amountCents: 199,
    success: true,
  });

  return Response.json({
    ok: true,
    activated: true,
    recipientName: gift.recipientName,
    message: gift.message,
  });
}
