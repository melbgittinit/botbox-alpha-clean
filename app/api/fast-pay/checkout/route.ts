import { createCheckout, errorResponse, resolveInternalAccount } from "../../../../lib/fast-pay/core";

export async function POST(request: Request) {
  try {
    const { user, account } = await resolveInternalAccount(request);
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
