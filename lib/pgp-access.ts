import crypto from "crypto";
import { prisma } from "./prisma";
import type { PgpOrderGrant } from "./pgp-entitlements";

function laterDate(a: Date | null | undefined, b: Date | null | undefined) {
  if (!a) return b || null;
  if (!b) return a;
  return a > b ? a : b;
}

function giftCode() {
  return "PGP-" + crypto.randomBytes(5).toString("hex").toUpperCase();
}

export async function syncPgpPurchaseGrants(userId: string, grants: PgpOrderGrant[]) {
  const profile = await prisma.pgpProfile.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  let state = {
    fullDigital: profile.fullDigital,
    shareCards: profile.shareCards,
    walkWithMe: profile.walkWithMe,
    goldenRanch: profile.goldenRanch,
    premiumDigital: profile.premiumDigital,
    cameraTier: profile.cameraTier,
    cameraExpiresAt: profile.cameraExpiresAt,
    cameraScansRemaining: profile.cameraScansRemaining,
    cameraScansLifetime: profile.cameraScansLifetime,
    pendingRefillScans: profile.pendingRefillScans,
    firstLookClaimed: profile.firstLookClaimed,
    opportunityBagUntil: profile.opportunityBagUntil,
  };

  for (const grant of grants) {
    let purchase = await prisma.pgpPurchaseGrant.findUnique({
      where: {
        orderId_lineItemId: {
          orderId: grant.orderId,
          lineItemId: grant.lineItemId,
        },
      },
      include: { giftCodes: true },
    });

    if (!purchase) {
      purchase = await prisma.pgpPurchaseGrant.create({
        data: {
          userId,
          orderId: grant.orderId,
          lineItemId: grant.lineItemId,
          sku: grant.sku,
          quantity: grant.quantity,
          processedAt: grant.processedAt,
          grantType: grant.grantType,
          scansGranted: grant.scansGranted,
          expiresAt: grant.expiresAt,
          gift: grant.gift,
        },
        include: { giftCodes: true },
      });

      if (!grant.gift) {
        if (grant.grantType === "FULL_DIGITAL") state.fullDigital = true;
        if (grant.grantType === "SHARE_CARDS") state.shareCards = true;
        if (grant.grantType === "WALK_WITH_ME") state.walkWithMe = true;
        if (grant.grantType === "GOLDEN_RANCH") state.goldenRanch = true;

        if (grant.grantType === "PREMIUM_DIGITAL") {
          state.premiumDigital = true;
          state.fullDigital = true;
          state.shareCards = true;
          state.walkWithMe = true;
          state.goldenRanch = true;
          state.cameraTier = "PLUS";
          state.cameraExpiresAt = laterDate(state.cameraExpiresAt, grant.expiresAt);
          state.opportunityBagUntil = laterDate(state.opportunityBagUntil, grant.expiresAt);
          state.cameraScansRemaining += grant.scansGranted;
          state.cameraScansLifetime += grant.scansGranted;
        }

        if (grant.grantType === "CAMERA_FIRST_LOOK" && !state.firstLookClaimed) {
          state.firstLookClaimed = true;
          state.cameraTier = state.cameraTier || "FIRST_LOOK";
          state.cameraScansRemaining += grant.scansGranted;
          state.cameraScansLifetime += grant.scansGranted;
        }

        if (grant.grantType === "CAMERA_40") {
          state.cameraTier = state.cameraTier === "PLUS" ? "PLUS" : "STANDARD";
          state.cameraExpiresAt = laterDate(state.cameraExpiresAt, grant.expiresAt);
          state.cameraScansRemaining += grant.scansGranted;
          state.cameraScansLifetime += grant.scansGranted;
          if (state.pendingRefillScans > 0) {
            state.cameraScansRemaining += state.pendingRefillScans;
            state.cameraScansLifetime += state.pendingRefillScans;
            state.pendingRefillScans = 0;
          }
        }

        if (grant.grantType === "CAMERA_PLUS") {
          state.cameraTier = "PLUS";
          state.cameraExpiresAt = laterDate(state.cameraExpiresAt, grant.expiresAt);
          state.opportunityBagUntil = laterDate(state.opportunityBagUntil, grant.expiresAt);
          state.cameraScansRemaining += grant.scansGranted;
          state.cameraScansLifetime += grant.scansGranted;
          if (state.pendingRefillScans > 0) {
            state.cameraScansRemaining += state.pendingRefillScans;
            state.cameraScansLifetime += state.pendingRefillScans;
            state.pendingRefillScans = 0;
          }
        }

        if (grant.grantType === "CAMERA_REFILL") {
          const active = Boolean(state.cameraExpiresAt && state.cameraExpiresAt > new Date());
          if (active || state.cameraTier === "FIRST_LOOK") {
            state.cameraScansRemaining += grant.scansGranted;
            state.cameraScansLifetime += grant.scansGranted;
          } else {
            state.pendingRefillScans += grant.scansGranted;
          }
        }
      }
    }

    if (grant.gift) {
      const missing = Math.max(0, grant.quantity - purchase.giftCodes.length);
      for (let i = 0; i < missing; i += 1) {
        let created = false;
        while (!created) {
          try {
            await prisma.pgpGiftCode.create({
              data: {
                purchaseGrantId: purchase.id,
                ordinal: purchase.giftCodes.length + i + 1,
                code: giftCode(),
              },
            });
            created = true;
          } catch {
            // Rare collision: generate another code.
          }
        }
      }
    }
  }

  return prisma.pgpProfile.update({
    where: { userId },
    data: {
      ...state,
      entitlementCheckedAt: new Date(),
    },
  });
}

export async function redeemPgpGift(userId: string, codeInput: string) {
  const code = codeInput.trim().toUpperCase();
  const gift = await prisma.pgpGiftCode.findUnique({
    where: { code },
    include: { purchaseGrant: true },
  });

  if (!gift) throw new Error("GIFT_NOT_FOUND");
  if (gift.redeemedByUserId && gift.redeemedByUserId !== userId) throw new Error("GIFT_ALREADY_REDEEMED");
  if (gift.redeemedByUserId === userId) return { gift, alreadyRedeemed: true };

  const grant = gift.purchaseGrant;
  const profile = await prisma.pgpProfile.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const scans = grant.grantType === "CAMERA_PLUS" ? 150 : 40;
  const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const updated = await prisma.$transaction(async (tx) => {
    const redeemed = await tx.pgpGiftCode.update({
      where: { id: gift.id },
      data: { redeemedByUserId: userId, redeemedAt: new Date() },
    });

    const updatedProfile = await tx.pgpProfile.update({
      where: { userId },
      data: {
        cameraTier: grant.grantType === "CAMERA_PLUS" ? "PLUS" : (profile.cameraTier === "PLUS" ? "PLUS" : "STANDARD"),
        cameraExpiresAt: laterDate(profile.cameraExpiresAt, expiry),
        opportunityBagUntil: grant.grantType === "CAMERA_PLUS"
          ? laterDate(profile.opportunityBagUntil, expiry)
          : profile.opportunityBagUntil,
        cameraScansRemaining: { increment: scans },
        cameraScansLifetime: { increment: scans },
        entitlementCheckedAt: new Date(),
      },
    });

    return { redeemed, updatedProfile };
  });

  return { ...updated, alreadyRedeemed: false };
}
