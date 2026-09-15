import { errorResponse } from "../../../../../lib/fast-pay/core";
import { handleStripeWebhookSafely } from "../../../../../lib/fast-pay/webhook-safe";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");
    const result = await handleStripeWebhookSafely(rawBody, signature);
    return Response.json({ received: true, ...result });
  } catch (error) {
    return errorResponse(error);
  }
}
