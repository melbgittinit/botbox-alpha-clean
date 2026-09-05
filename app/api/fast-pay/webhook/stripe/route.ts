import { errorResponse, handleStripeWebhook } from "../../../../../lib/fast-pay/core";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");
    const result = await handleStripeWebhook(rawBody, signature);
    return Response.json({ received: true, ...result });
  } catch (error) {
    return errorResponse(error);
  }
}
