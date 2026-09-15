import Stripe from "stripe";
import { prisma } from "../prisma";
import { FastPayError, stripe } from "./core";

async function grantCheckout(session: Stripe.Checkout.Session) {
  const transactionId = session.metadata?.fastPayTransactionId;
  if (!transactionId) return;

  await prisma.$transaction(async (tx) => {
    const transaction = await tx.fastPayTransaction.findUnique({
      where: { id: transactionId },
      include: { offer: true, account: true },
    });
    if (!transaction) throw new FastPayError(404, "TRANSACTION_NOT_FOUND", "FAST PAY transaction was not found.");
    if (transaction.status === "PAID") return;

    const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
    const stripeCustomerId = typeof session.customer === "string" ? session.customer : session.customer?.id;

    await tx.fastPayTransaction.update({
      where: { id: transaction.id },
      data: { status: "PAID", paidAt: new Date(), externalPaymentId: paymentIntentId || undefined },
    });

    if (stripeCustomerId && !transaction.account.stripeCustomerId) {
      await tx.fastPayAccount.update({ where: { id: transaction.accountId }, data: { stripeCustomerId } });
    }

    const offer = transaction.offer;
    if (!offer.actionKey || (offer.grantUnits <= 0 && !offer.grantsUnlimited)) return;

    const entitlement = await tx.fastPayEntitlement.create({
      data: {
        accountId: transaction.accountId,
        actionKey: offer.actionKey,
        sourceTransactionId: transaction.id,
        unitsGranted: offer.grantUnits,
        unitsRemaining: offer.grantUnits,
        unlimited: offer.grantsUnlimited,
        status: "ACTIVE",
      },
    });

    await tx.fastPayLedgerEntry.create({
      data: {
        accountId: transaction.accountId,
        entitlementId: entitlement.id,
        deltaUnits: offer.grantUnits,
        balanceAfter: offer.grantUnits,
        reason: offer.grantsUnlimited ? "PURCHASE_UNLIMITED" : "PURCHASE_GRANT",
        referenceType: "TRANSACTION",
        referenceId: transaction.id,
        idempotencyKey: `grant:${transaction.id}`,
      },
    });
  });
}

async function revokeByPaymentIntent(paymentIntentId: string, status: "REFUNDED" | "DISPUTED") {
  await prisma.$transaction(async (tx) => {
    const transaction = await tx.fastPayTransaction.findFirst({ where: { externalPaymentId: paymentIntentId } });
    if (!transaction || transaction.status === status) return;

    await tx.fastPayTransaction.update({ where: { id: transaction.id }, data: { status } });
    const entitlements = await tx.fastPayEntitlement.findMany({ where: { sourceTransactionId: transaction.id, status: "ACTIVE" } });

    for (const entitlement of entitlements) {
      await tx.fastPayEntitlement.update({
        where: { id: entitlement.id },
        data: { status: "REVOKED", unitsRemaining: 0, version: { increment: 1 } },
      });
      await tx.fastPayLedgerEntry.create({
        data: {
          accountId: transaction.accountId,
          entitlementId: entitlement.id,
          deltaUnits: -entitlement.unitsRemaining,
          balanceAfter: 0,
          reason: status,
          referenceType: "TRANSACTION",
          referenceId: transaction.id,
          idempotencyKey: `revoke:${status}:${entitlement.id}`,
        },
      });
    }
  });
}

export async function handleStripeWebhookSafely(rawBody: string, signature: string | null) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new FastPayError(503, "WEBHOOK_NOT_CONFIGURED", "Stripe webhook is not configured.");
  if (!signature) throw new FastPayError(400, "MISSING_SIGNATURE", "Stripe signature is required.");

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    throw new FastPayError(400, "INVALID_SIGNATURE", "Invalid Stripe webhook signature.");
  }

  const prior = await prisma.fastPayProcessedEvent.findUnique({
    where: { provider_externalEventId: { provider: "STRIPE", externalEventId: event.id } },
  });
  if (prior?.status === "PROCESSED") return { duplicate: true, eventId: event.id };

  await prisma.fastPayProcessedEvent.upsert({
    where: { provider_externalEventId: { provider: "STRIPE", externalEventId: event.id } },
    update: { status: "RECEIVED", errorCode: null },
    create: { provider: "STRIPE", externalEventId: event.id, eventType: event.type, status: "RECEIVED" },
  });

  try {
    if (event.type === "checkout.session.completed") {
      await grantCheckout(event.data.object as Stripe.Checkout.Session);
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const transactionId = session.metadata?.fastPayTransactionId;
      if (transactionId) {
        await prisma.fastPayTransaction.updateMany({ where: { id: transactionId, status: "PENDING" }, data: { status: "CANCELED" } });
      }
    } else if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
      const isFullRefund = charge.amount_refunded >= charge.amount;
      if (paymentIntentId && isFullRefund) await revokeByPaymentIntent(paymentIntentId, "REFUNDED");
    } else if (event.type === "charge.dispute.created") {
      const dispute = event.data.object as Stripe.Dispute;
      const paymentIntentId = typeof dispute.payment_intent === "string" ? dispute.payment_intent : dispute.payment_intent?.id;
      if (paymentIntentId) await revokeByPaymentIntent(paymentIntentId, "DISPUTED");
    }

    await prisma.fastPayProcessedEvent.update({
      where: { provider_externalEventId: { provider: "STRIPE", externalEventId: event.id } },
      data: { status: "PROCESSED", processedAt: new Date() },
    });
    return { duplicate: false, eventId: event.id };
  } catch (error) {
    await prisma.fastPayProcessedEvent.update({
      where: { provider_externalEventId: { provider: "STRIPE", externalEventId: event.id } },
      data: { status: "FAILED", errorCode: error instanceof FastPayError ? error.code : "PROCESSING_FAILED" },
    });
    throw error;
  }
}
