import { resolveHubUser } from "../../../../lib/hub-auth/session";
import { redeemPgpGift } from "../../../../lib/pgp-access";

export async function POST(request: Request) {
  const user = await resolveHubUser(request);
  if (!user) return Response.json({ authenticated: false }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const code = String(body?.code || "").trim();
  if (!code) return Response.json({ error: "GIFT_CODE_REQUIRED" }, { status: 400 });

  try {
    const result = await redeemPgpGift(user.id, code);
    return Response.json({
      redeemed: true,
      alreadyRedeemed: result.alreadyRedeemed,
      cameraTier: "updatedProfile" in result ? result.updatedProfile.cameraTier : null,
      cameraScansRemaining: "updatedProfile" in result ? result.updatedProfile.cameraScansRemaining : null,
      cameraExpiresAt: "updatedProfile" in result ? result.updatedProfile.cameraExpiresAt : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "GIFT_REDEEM_FAILED";
    const status = message === "GIFT_NOT_FOUND" ? 404 : message === "GIFT_ALREADY_REDEEMED" ? 409 : 400;
    return Response.json({ error: message }, { status });
  }
}
