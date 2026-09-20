import { prisma } from "../../../../lib/prisma";
import { resolveHubUser } from "../../../../lib/hub-auth/session";

export async function GET(request: Request) {
  const user = await resolveHubUser(request);
  if (!user) return Response.json({ authenticated: false }, { status: 401 });

  const profile = await prisma.wmrProfile.findUnique({ where: { userId: user.id } });
  const entitlements = {
    wmrBase: Boolean(profile?.wmrBase),
    forReal: Boolean(profile?.forReal),
    bwfPassport: Boolean(profile?.bwfPassport),
    vipMe: Boolean(profile?.vipMe),
  };
  return Response.json({
    authenticated: true,
    entitlements,
    capabilities: {
      sevenDaySprint: entitlements.wmrBase || entitlements.forReal,
      persistentPlan: entitlements.forReal,
      richCircleSync: entitlements.forReal,
      evidenceSync: entitlements.forReal,
      bwfPassport: entitlements.bwfPassport,
      vipMe: entitlements.vipMe,
    },
    checkedAt: profile?.entitlementCheckedAt || null,
  }, { headers: { "cache-control": "no-store" } });
}
