import { prisma } from "../../../../lib/prisma";
import { resolveHubUser } from "../../../../lib/hub-auth/session";

export async function GET(request: Request) {
  const user = await resolveHubUser(request);
  if (!user) return Response.json({ authenticated: false }, { status: 401 });

  const [profile, gifts] = await Promise.all([
    prisma.pgpProfile.findUnique({ where: { userId: user.id } }),
    prisma.pgpGiftCode.findMany({
      where: {
        purchaseGrant: { userId: user.id },
        redeemedAt: null,
      },
      include: {
        purchaseGrant: {
          select: { grantType: true, sku: true, processedAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
  ]);

  const now = new Date();
  const cameraTimedActive = Boolean(profile?.cameraExpiresAt && profile.cameraExpiresAt > now);
  const firstLookActive = profile?.cameraTier === "FIRST_LOOK" && (profile?.cameraScansRemaining || 0) > 0;
  const cameraActive = Boolean((cameraTimedActive || firstLookActive) && (profile?.cameraScansRemaining || 0) > 0);
  const opportunityBagActive = Boolean(profile?.opportunityBagUntil && profile.opportunityBagUntil > now);

  return Response.json({
    authenticated: true,
    user: { displayName: user.displayName, email: user.email },
    entitlements: {
      fullDigital: Boolean(profile?.fullDigital),
      shareCards: Boolean(profile?.shareCards),
      walkWithMe: Boolean(profile?.walkWithMe),
      goldenRanch: Boolean(profile?.goldenRanch),
      premiumDigital: Boolean(profile?.premiumDigital),
      cameraActive,
      cameraTier: profile?.cameraTier || null,
      cameraExpiresAt: profile?.cameraExpiresAt || null,
      cameraScansRemaining: profile?.cameraScansRemaining || 0,
      pendingRefillScans: profile?.pendingRefillScans || 0,
      opportunityBagActive,
      opportunityBagUntil: profile?.opportunityBagUntil || null,
    },
    gifts: gifts.map((gift) => ({
      code: gift.code,
      grantType: gift.purchaseGrant.grantType,
      sku: gift.purchaseGrant.sku,
      purchasedAt: gift.purchaseGrant.processedAt,
    })),
    checkedAt: profile?.entitlementCheckedAt || null,
  }, { headers: { "cache-control": "no-store" } });
}
