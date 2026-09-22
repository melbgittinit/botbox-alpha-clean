import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type ElevateEconomicEntryInput = {
  idempotencyKey: string;
  userId?: string | null;
  sessionId?: string | null;
  cycleKey?: string | null;
  entryType: "REVENUE" | "COST" | "REFUND" | "ESTIMATE" | "USAGE" | "REVERSAL_SIGNAL";
  category: string;
  amountCents?: number | null;
  currency?: string;
  verified?: boolean;
  contributionEligible?: boolean;
  offer?: string | null;
  channel?: string | null;
  source: string;
  referenceType?: string | null;
  referenceId?: string | null;
  payload?: Record<string, unknown> | null;
  occurredAt?: Date;
};

function clean(value: unknown, max = 160) {
  const text = String(value || "").trim();
  return text ? text.slice(0, max) : null;
}

export async function recordElevateEconomicEntry(input: ElevateEconomicEntryInput) {
  const key = clean(input.idempotencyKey, 220);
  if (!key) throw new Error("ELEVATE_ECONOMIC_IDEMPOTENCY_KEY_REQUIRED");

  const amountCents =
    input.amountCents == null
      ? null
      : Number.isFinite(input.amountCents)
        ? Math.max(0, Math.round(Number(input.amountCents)))
        : null;

  const verified = Boolean(input.verified);
  const contributionEligible =
    Boolean(input.contributionEligible) &&
    verified &&
    amountCents != null &&
    ["REVENUE", "COST", "REFUND"].includes(input.entryType);

  try {
    const entry = await prisma.elevateEconomicEntry.upsert({
      where: { idempotencyKey: key },
      update: {},
      create: {
        idempotencyKey: key,
        userId: clean(input.userId, 160),
        sessionId: clean(input.sessionId, 160),
        cycleKey: clean(input.cycleKey, 80),
        entryType: input.entryType,
        category: clean(input.category, 100) || "UNKNOWN",
        amountCents,
        currency: clean(input.currency || "usd", 12) || "usd",
        verified,
        contributionEligible,
        offer: clean(input.offer, 40),
        channel: clean(input.channel, 80),
        source: clean(input.source, 160) || "unknown",
        referenceType: clean(input.referenceType, 80),
        referenceId: clean(input.referenceId, 220),
        payload: input.payload ? (input.payload as Prisma.InputJsonValue) : undefined,
        occurredAt: input.occurredAt || new Date(),
      },
    });

    console.log("ELEVATE_ECONOMIC_ENTRY " + JSON.stringify({
      id: entry.id,
      entryType: entry.entryType,
      category: entry.category,
      cycleKey: entry.cycleKey,
      amountCents: entry.amountCents,
      currency: entry.currency,
      verified: entry.verified,
      contributionEligible: entry.contributionEligible,
      offer: entry.offer,
      source: entry.source,
      referenceType: entry.referenceType,
      referenceId: entry.referenceId,
      occurredAt: entry.occurredAt.toISOString(),
    }));

    return entry;
  } catch (error) {
    console.warn("ELEVATE_ECONOMIC_WRITE_FAILED", {
      idempotencyKey: key,
      entryType: input.entryType,
      category: input.category,
      error: error instanceof Error ? error.message : "unknown",
    });
    return null;
  }
}

export async function summarizeElevateEconomics(input?: { since?: Date; until?: Date; cycleKey?: string | null }) {
  const entries = await prisma.elevateEconomicEntry.findMany({
    where: {
      cycleKey: input?.cycleKey || undefined,
      occurredAt: {
        gte: input?.since,
        lt: input?.until,
      },
    },
    orderBy: { occurredAt: "asc" },
  });

  let verifiedRevenueCents = 0;
  let verifiedCostCents = 0;
  let verifiedRefundCents = 0;
  let incompleteEconomicSignals = 0;

  for (const entry of entries) {
    if (entry.contributionEligible && entry.amountCents != null) {
      if (entry.entryType === "REVENUE") verifiedRevenueCents += entry.amountCents;
      if (entry.entryType === "COST") verifiedCostCents += entry.amountCents;
      if (entry.entryType === "REFUND") verifiedRefundCents += entry.amountCents;
    } else if (
      ["REVENUE", "COST", "REFUND", "REVERSAL_SIGNAL"].includes(entry.entryType) &&
      (!entry.verified || entry.amountCents == null || !entry.contributionEligible)
    ) {
      incompleteEconomicSignals += 1;
    }
  }

  const knownContributionCents =
    verifiedRevenueCents - verifiedCostCents - verifiedRefundCents;

  const contributionDirection =
    incompleteEconomicSignals > 0
      ? "INCOMPLETE"
      : knownContributionCents > 0
        ? "POSITIVE"
        : knownContributionCents < 0
          ? "NEGATIVE"
          : "ZERO";

  return {
    verifiedRevenueCents,
    verifiedCostCents,
    verifiedRefundCents,
    knownContributionCents,
    incompleteEconomicSignals,
    contributionDirection,
    entryCount: entries.length,
  };
}
