import { prisma } from "../../../../../lib/prisma";
import { resolveHubUser } from "../../../../../lib/hub-auth/session";
import { stripe } from "../../../../../lib/fast-pay/core";

export async function POST(request: Request) {
  const user = await resolveHubUser(request);
  if (!user) return Response.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const profile = await prisma.elevateProfile.findUnique({ where: { userId: user.id } });
  if (!profile?.makeItReal) return Response.json({ error: "MAKE_IT_REAL_REQUIRED" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const jobId = String(body?.jobId || "");
  const job = await prisma.elevatePrintJob.findFirst({ where: { id: jobId, userId: user.id } });
  if (!job) return Response.json({ error: "PRINT_JOB_NOT_FOUND" }, { status: 404 });
  if (job.status !== "QUOTED" || !job.retailCents || job.retailCents < 50) {
    return Response.json({ error: "PRINT_JOB_NOT_READY_FOR_PAYMENT" }, { status: 409 });
  }

  if (job.paymentRef && job.status === "PAYMENT_PENDING") {
    try {
      const prior = await stripe().checkout.sessions.retrieve(job.paymentRef);
      if (prior.url) return Response.json({ ok: true, checkoutUrl: prior.url, jobId: job.id });
    } catch {}
  }

  const origin = new URL(request.url).origin;
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items: [{
      price_data: {
        currency: job.currency,
        unit_amount: job.retailCents,
        product_data: {
          name: "Elevate Me Bot Print Job",
          description: `${job.format} • quantity ${job.quantity}`,
        },
      },
      quantity: 1,
    }],
    success_url: `${origin}/elevate-me-bot/make-it-real?print_payment=success&job=${job.id}`,
    cancel_url: `${origin}/elevate-me-bot/make-it-real?print_payment=canceled&job=${job.id}`,
    customer_email: user.email,
    metadata: {
      elevatePrintJobId: job.id,
      elevateUserId: user.id,
    },
  }, { idempotencyKey: "elevate-print-checkout:" + job.id });

  await prisma.elevatePrintJob.update({
    where: { id: job.id },
    data: { status: "PAYMENT_PENDING", paymentRef: session.id },
  });

  if (!session.url) return Response.json({ error: "CHECKOUT_URL_MISSING" }, { status: 502 });
  return Response.json({ ok: true, checkoutUrl: session.url, jobId: job.id });
}
