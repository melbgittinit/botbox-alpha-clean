import crypto from "crypto";
import { prisma } from "../../../../lib/prisma";
import { resolveHubUser } from "../../../../lib/hub-auth/session";
import { recordElevateEvent } from "../../../../lib/elevate-events";
import { resolveElevateCycle } from "../../../../lib/elevate-attribution";

function cleanEmail(value: unknown) {
  const email = String(value || "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export async function POST(request: Request) {
  const user = await resolveHubUser(request);
  if (!user) return Response.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const profile = await prisma.elevateProfile.findUnique({ where: { userId: user.id } });
  const cycleKey = resolveElevateCycle(request, profile);
  if (!profile || profile.giftCreditsPurchased <= 0) {
    return Response.json({ error: "NO_GIFT_CREDITS" }, { status: 403 });
  }

  const used = await prisma.elevateGift.count({ where: { giverUserId: user.id } });
  const available = Math.max(0, profile.giftCreditsPurchased - used);
  if (available <= 0) {
    return Response.json({ error: "NO_GIFT_CREDITS" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const recipientEmail = cleanEmail(body?.recipientEmail);
  if (!recipientEmail) return Response.json({ error: "INVALID_RECIPIENT_EMAIL" }, { status: 400 });

  const recipientName = String(body?.recipientName || "").trim().slice(0, 80) || null;
  const message = String(body?.message || "").trim().slice(0, 500) || null;
  const token = crypto.randomBytes(24).toString("base64url");

  const gift = await prisma.elevateGift.create({
    data: {
      giverUserId: user.id,
      recipientEmail,
      recipientName,
      message,
      cycleKey,
      token,
    },
  });

  await recordElevateEvent({
    userId: user.id,
    cycleKey,
    eventType: "gift_created",
    offer: "gift",
    amountCents: 199,
    success: true,
  });

  const origin = new URL(request.url).origin;
  return Response.json({
    ok: true,
    gift: {
      id: gift.id,
      recipientEmail,
      recipientName,
      claimUrl: `${origin}/elevate-me-bot/gift/${token}`,
    },
    remainingGiftCredits: available - 1,
  });
}
