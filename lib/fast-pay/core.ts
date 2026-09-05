import crypto from "crypto";
import Stripe from "stripe";
import { prisma } from "../prisma";

export class FastPayError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function fastPayEnabled() {
  return process.env.FAST_PAY_ENABLED === "true";
}

export function fastPayStatus() {
  return {
    enabled: fastPayEnabled(),
    stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
    webhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    internalAuthConfigured: Boolean(process.env.FAST_PAY_INTERNAL_TOKEN),
    appOriginConfigured: Boolean(process.env.FAST_PAY_APP_ORIGIN),
    liveReady: Boolean(
      fastPayEnabled() &&
        process.env.STRIPE_SECRET_KEY &&
        process.env.STRIPE_WEBHOOK_SECRET &&
        process.env.FAST_PAY_INTERNAL_TOKEN &&
        process.env.FAST_PAY_APP_ORIGIN
    ),
  };
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function requireInternalRequest(request: Request) {
  if (!fastPayEnabled()) {
    throw new FastPayError(503, "FAST_PAY_DISABLED", "FAST PAY is not enabled.");
  }

  const expected = process.env.FAST_PAY_INTERNAL_TOKEN;
  if (!expected) {
    throw new FastPayError(503, "FAST_PAY_AUTH_NOT_CONFIGURED", "FAST PAY internal authentication is not configured.");
  }

  const authorization = request.headers.get("authorization") || "";
  const supplied = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!supplied || !safeEqual(supplied, expected)) {
    throw new FastPayError(401, "UNAUTHORIZED", "Unauthorized FAST PAY request.");
  }
}

export async function resolveInternalAccount(request: Request) {
  requireInternalRequest(request);

  // Temporary staging bridge only. A public consumer endpoint must replace this
  // with a real authenticated HUB session before FAST PAY can be enabled live.
  const email = request.headers.get("x-hub-user-email")?.trim().toLowerCase();
  if (!email) {
    throw new FastPayError(401, "MISSING_ACTOR", "Authenticated HUB user is required.");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new FastPayError(404, "USER_NOT_FOUND", "HUB user was not found.");
  }

  const account = await prisma.fastPayAccount.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  return { user, account };
}

let stripeClient: Stripe | null = null;

export function stripe() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new FastPayError(503, "STRIPE_NOT_CONFIGURED", "Stripe is not configured.");
  }
  if (!stripeClient) stripeClient = new Stripe(secret, { maxNetworkRetries: 2 });
  return stripeClient;
}

export type ActionQuote = {
  actionKey: string;
  actionLabel: string;
  cost: number;
  unlimited: boolean;
  remaining: number | null;
  remainingAfter: number | null;
  canProceed: boolean;
  scarcity: "healthy" | "low" | "critical" | "empty";
};

function scarcityFor(remainingAfter: number | null): ActionQuote["scarcity"] {
  if (remainingAfter === null) return "healthy";
  if (remainingAfter <= 0) return "empty";
  if (remainingAfter <= 2) return "critical";
  if (remainingAfter <= 5) return "low";
  return "healthy";
}

export async function quoteAction(accountId: string, actionKey: string, requestedCost?: number): Promise<ActionQuote> {
  const action = await prisma.fastPayActionDefinition.findUnique({ where: { key: actionKey } });
  if (!action || !action.active) {
    throw new FastPayError(404, "ACTION_NOT_FOUND", "This action is not available.");
  }

  const cost = requestedCost ?? action.defaultCost;
  if (!Number.isInteger(cost) || cost < 1 || cost > 1000) {
    throw new FastPayError(400, "INVALID_COST", "Action cost must be a positive integer.");
  }

  const now = new Date();
  const entitlements = await prisma.fastPayEntitlement.findMany({
    where: {
      accountId,
      actionKey,
      status: "ACTIVE",
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    select: { unlimited: true, unitsRemaining: true },
  });

  const unlimited = entitlements.some((item) => item.unlimited);
  const remaining = unlimited ? null : entitlements.reduce((sum, item) => sum + item.unitsRemaining, 0);
  const canProceed = unlimited || (remaining ?? 0) >= cost;
  const remainingAfter = unlimited ? null : Math.max(0, (remaining ?? 0) - cost);

  return {
    actionKey,
    actionLabel: cost === 1 ? action.singularLabel : action.pluralLabel,
    cost,
    unlimited,
    remaining,
    remainingAfter,
    canProceed,
    scarcity: canProceed ? scarcityFor(remainingAfter) : "empty",
  };
}

export async function reserveAction(accountId: string, actionKey: string, idempotencyKey: string, requestedCost?: number) {
  if (!idempotencyKey || idempotencyKey.length > 255) {
    throw new FastPayError(400, "INVALID_IDEMPOTENCY_KEY", "A valid idempotency key is required.");
  }

  const existing = await prisma.fastPayUsageReservation.findUnique({ where: { idempotencyKey } });
  if (existing) return existing;

  const quote = await quoteAction(accountId, actionKey, requestedCost);
  if (!quote.canProceed) {
    throw new FastPayError(402, "INSUFFICIENT_ACTIONS", `Not enough ${quote.actionLabel} remaining.`);
  }

  return prisma.$transaction(async (tx) => {
    const duplicate = await tx.fastPayUsageReservation.findUnique({ where: { idempotencyKey } });
    if (duplicate) return duplicate;

    const now = new Date();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const candidates = await tx.fastPayEntitlement.findMany({
      where: {
        accountId,
        actionKey,
        status: "ACTIVE",
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { createdAt: "asc" },
    });

    const unlimited = candidates.find((item) => item.unlimited);
    if (unlimited) {
      return tx.fastPayUsageReservation.create({
        data: {
          accountId,
          entitlementId: unlimited.id,
          actionKey,
          units: quote.cost,
          status: "RESERVED",
          idempotencyKey,
          expiresAt,
        },
      });
    }

    for (const entitlement of candidates) {
      if (entitlement.unitsRemaining < quote.cost) continue;

      const changed = await tx.fastPayEntitlement.updateMany({
        where: {
          id: entitlement.id,
          status: "ACTIVE",
          version: entitlement.version,
          unitsRemaining: { gte: quote.cost },
        },
        data: {
          unitsRemaining: { decrement: quote.cost },
          version: { increment: 1 },
        },
      });

      if (changed.count !== 1) continue;

      const updated = await tx.fastPayEntitlement.findUniqueOrThrow({ where: { id: entitlement.id } });
      const reservation = await tx.fastPayUsageReservation.create({
        data: {
          accountId,
          entitlementId: entitlement.id,
          actionKey,
          units: quote.cost,
          status: "RESERVED",
          idempotencyKey,
          expiresAt,
        },
      });

      await tx.fastPayLedgerEntry.create({
        data: {
          accountId,
          entitlementId: entitlement.id,
          deltaUnits: -quote.cost,
          balanceAfter: updated.unitsRemaining,
          reason: "ACTION_RESERVED",
          referenceType: "RESERVATION",
          referenceId: reservation.id,
          idempotencyKey: `reserve:${idempotencyKey}`,
        },
      });

      return reservation;
    }

    throw new FastPayError(409, "BALANCE_CHANGED", "Available actions changed. Please check the remaining count and try again.");
  });
}

export async function commitReservation(accountId: string, reservationId: string) {
  const reservation = await prisma.fastPayUsageReservation.findFirst({ where: { id: reservationId, accountId } });
  if (!reservation) throw new FastPayError(404, "RESERVATION_NOT_FOUND", "Reservation was not found.");
  if (reservation.status === "COMMITTED") return reservation;
  if (reservation.status !== "RESERVED") {
    throw new FastPayError(409, "RESERVATION_NOT_ACTIVE", "Reservation is no longer active.");
  }
  return prisma.fastPayUsageReservation.update({
    where: { id: reservation.id },
    data: { status: "COMMITTED", committedAt: new Date() },
  });
}

export async function releaseReservation(accountId: string, reservationId: string, reason = "ACTION_RELEASED") {
  return prisma.$transaction(async (tx) => {
    const reservation = await tx.fastPayUsageReservation.findFirst({ where: { id: reservationId, accountId } });
    if (!reservation) throw new FastPayError(404, "RESERVATION_NOT_FOUND", "Reservation was not found.");
    if (reservation.status === "RELEASED") return reservation;
    if (reservation.status !== "RESERVED") {
      throw new FastPayError(409, "RESERVATION_NOT_ACTIVE", "Reservation is no longer active.");
    }

    const entitlement = await tx.fastPayEntitlement.findUniqueOrThrow({ where: { id: reservation.entitlementId } });
    if (!entitlement.unlimited) {
      const updated = await tx.fastPayEntitlement.update({
        where: { id: entitlement.id },
        data: { unitsRemaining: { increment: reservation.units }, version: { increment: 1 } },
      });
      await tx.fastPayLedgerEntry.create({
        data: {
          accountId,
          entitlementId: entitlement.id,
          deltaUnits: reservation.units,
          balanceAfter: updated.unitsRemaining,
          reason,
          referenceType: "RESERVATION",
          referenceId: reservation.id,
          idempotencyKey: `release:${reservation.id}`,
        },
      });
    }

    return tx.fastPayUsageReservation.update({
      where: { id: reservation.id },
      data: { status: "RELEASED", releasedAt: new Date() },
    });
  });
}

export async function createCheckout(accountId: string, userEmail: string, offerKey: string, suppliedIdempotencyKey?: string) {
  const origin = process.env.FAST_PAY_APP_ORIGIN;
  if (!origin) throw new FastPayError(503, "APP_ORIGIN_NOT_CONFIGURED", "FAST PAY app origin is not configured.");

  const offer = await prisma.fastPayOffer.findUnique({ where: { key: offerKey } });
  if (!offer || !offer.active || offer.provider !== "STRIPE") {
    throw new FastPayError(404, "OFFER_NOT_FOUND", "This purchase option is not available.");
  }

  const account = await prisma.fastPayAccount.findUniqueOrThrow({ where: { id: accountId } });
  const idempotencyKey = suppliedIdempotencyKey || crypto.randomUUID();
  if (idempotencyKey.length > 255) throw new FastPayError(400, "INVALID_IDEMPOTENCY_KEY", "Invalid idempotency key.");

  let transaction = await prisma.fastPayTransaction.findUnique({ where: { idempotencyKey } });
  if (transaction && transaction.accountId !== accountId) {
    throw new FastPayError(409, "IDEMPOTENCY_COLLISION", "Purchase request conflicts with another account.");
  }

  if (!transaction) {
    transaction = await prisma.fastPayTransaction.create({
      data: {
        accountId,
        offerId: offer.id,
        provider: "STRIPE",
        status: "PENDING",
        amountCents: offer.amountCents,
        currency: offer.currency,
        idempotencyKey,
      },
    });
  }

  if (transaction.externalCheckoutId) {
    const prior = await stripe().checkout.sessions.retrieve(transaction.externalCheckoutId);
    if (prior.url) return { transactionId: transaction.id, checkoutUrl: prior.url };
  }

  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = offer.providerPriceId
    ? { price: offer.providerPriceId, quantity: 1 }
    : {
        price_data: {
          currency: offer.currency,
          unit_amount: offer.amountCents,
          product_data: { name: offer.name, description: offer.description || undefined },
        },
        quantity: 1,
      };

  const session = await stripe().checkout.sessions.create(
    {
      mode: "payment",
      line_items: [lineItem],
      success_url: `${origin}/fast-pay-lab?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/fast-pay-lab?payment=canceled`,
      customer: account.stripeCustomerId || undefined,
      customer_email: account.stripeCustomerId ? undefined : userEmail,
      customer_creation: account.stripeCustomerId ? undefined : "always",
      metadata: {
        fastPayTransactionId: transaction.id,
        fastPayAccountId: accountId,
        fastPayOfferKey: offer.key,
      },
    },
    { idempotencyKey: `fast-pay-checkout:${transaction.id}` }
  );

  await prisma.fastPayTransaction.update({
    where: { id: transaction.id },
    data: { externalCheckoutId: session.id },
  });

  if (!session.url) throw new FastPayError(502, "CHECKOUT_URL_MISSING", "Stripe did not return a checkout URL.");
  return { transactionId: transaction.id, checkoutUrl: session.url };
}

async function grantPaidTransaction(transactionId: string, session: Stripe.Checkout.Session) {
  return prisma.$transaction(async (tx) => {
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
      data: {
        status: "PAID",
        paidAt: new Date(),
        externalPaymentId: paymentIntentId || transaction.externalPaymentId,
      },
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

async function revokeTransactionEntitlements(transactionId: string, status: "REFUNDED" | "DISPUTED") {
  return prisma.$transaction(async (tx) => {
    const transaction = await tx.fastPayTransaction.findUnique({ where: { id: transactionId } });
    if (!transaction) return;
    if (transaction.status === status) return;

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

export async function handleStripeWebhook(rawBody: string, signature: string | null) {
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
  if (prior) return { duplicate: true, eventId: event.id };

  await prisma.fastPayProcessedEvent.create({
    data: { provider: "STRIPE", externalEventId: event.id, eventType: event.type, status: "RECEIVED" },
  });

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const transactionId = session.metadata?.fastPayTransactionId;
      if (transactionId) await grantPaidTransaction(transactionId, session);
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const transactionId = session.metadata?.fastPayTransactionId;
      if (transactionId) {
        await prisma.fastPayTransaction.updateMany({
          where: { id: transactionId, status: "PENDING" },
          data: { status: "CANCELED" },
        });
      }
    } else if (event.type === "charge.refunded" || event.type === "charge.dispute.created") {
      const object = event.data.object as Stripe.Charge | Stripe.Dispute;
      const paymentIntent = "payment_intent" in object ? object.payment_intent : null;
      const paymentIntentId = typeof paymentIntent === "string" ? paymentIntent : paymentIntent?.id;
      if (paymentIntentId) {
        const transaction = await prisma.fastPayTransaction.findFirst({ where: { externalPaymentId: paymentIntentId } });
        if (transaction) {
          await revokeTransactionEntitlements(
            transaction.id,
            event.type === "charge.refunded" ? "REFUNDED" : "DISPUTED"
          );
        }
      }
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

export function errorResponse(error: unknown) {
  if (error instanceof FastPayError) {
    return Response.json({ error: error.code, message: error.message }, { status: error.status });
  }
  console.error("FAST PAY error", error);
  return Response.json({ error: "INTERNAL_ERROR", message: "FAST PAY could not complete the request." }, { status: 500 });
}
