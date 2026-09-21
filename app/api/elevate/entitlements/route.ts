import { prisma } from "../../../../lib/prisma";
import { resolveHubUser } from "../../../../lib/hub-auth/session";

export async function GET(request: Request) {
  const user = await resolveHubUser(request);
  if (!user) {
    return Response.json(
      {
        authenticated: false,
        entitlements: {
          activated: false,
          powerUp: false,
          makeItReal: false,
          giftCreditsPurchased: 0,
        },
        capabilities: {
          starterActions: false,
          send: false,
          earnMode: false,
          explode: false,
          reachMyPeople: false,
          sellSomething: false,
          planThis: false,
          remixIt: false,
          printMyStuff: false,
          hubMerch: false,
          creatorCollegeFreshman: false,
        },
      },
      { status: 401, headers: { "cache-control": "no-store" } }
    );
  }

  const profile = await prisma.elevateProfile.findUnique({ where: { userId: user.id } });
  const entitlements = {
    activated: Boolean(profile?.activated),
    powerUp: Boolean(profile?.powerUp),
    makeItReal: Boolean(profile?.makeItReal),
    giftCreditsPurchased: profile?.giftCreditsPurchased || 0,
  };

  return Response.json(
    {
      authenticated: true,
      user: { email: user.email, displayName: user.displayName },
      entitlements,
      level: entitlements.makeItReal ? "MAKE_IT_REAL" : entitlements.powerUp ? "POWER_UP" : entitlements.activated ? "ACTIVATE" : "CUSTOMIZE",
      capabilities: {
        starterActions: entitlements.activated,
        send: entitlements.activated,
        earnMode: entitlements.activated,
        explode: entitlements.powerUp,
        reachMyPeople: entitlements.powerUp,
        sellSomething: entitlements.powerUp,
        planThis: entitlements.powerUp,
        remixIt: entitlements.powerUp,
        printMyStuff: entitlements.makeItReal,
        hubMerch: entitlements.makeItReal,
        creatorCollegeFreshman: entitlements.makeItReal,
      },
      checkedAt: profile?.entitlementCheckedAt || null,
    },
    { headers: { "cache-control": "no-store" } }
  );
}
