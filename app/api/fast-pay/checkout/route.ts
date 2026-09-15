import { createCheckout, errorResponse } from "../../../../lib/fast-pay/core";
import { resolveFastPayAccount } from "../../../../lib/fast-pay/session-account";

export async function POST(request: Request) {
  try {
    const { user, account } = await resolveFastPayAccount(request);
    const body = await request.json();
    const result = await createCheckout(
      account.id,
      user.email,
      String(body?.offerKey || ""),
      body?.idempotencyKey ? String(body.idempotencyKey) : undefined
    );
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
