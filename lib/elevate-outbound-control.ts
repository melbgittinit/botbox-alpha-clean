import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { summarizeElevateEconomics } from "./elevate-economics";

export type ElevateCycleEvidence = {
  verifiedSends?: number | null;
  sendEvidenceComplete?: boolean;
  permissionedAudienceSize?: number | null;
  delivered?: number | null;
  bounced?: number | null;
  unsubscribes?: number | null;
  complaints?: number | null;
  deliverabilityIssue?: boolean | null;
  supportIssue?: boolean | null;
  knownChannelCostCents?: number | null;
  channelCostVerified?: boolean;
  notes?: string[];
};

export type ElevateGovernorState = "GREEN" | "HOLD" | "RED";

function nonNegativeInt(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
}

function uniqueCount(values: Array<string | null | undefined>) {
  return new Set(values.filter((v): v is string => Boolean(v))).size;
}

function pct(numerator: number, denominator: number) {
  return denominator > 0 ? numerator / denominator : null;
}

export async function evaluateElevateOutboundCycle(input: {
  cycleKey?: string | null;
  windowStart: Date;
  windowEnd: Date;
  evidence?: ElevateCycleEvidence;
}) {
  const evidence = input.evidence || {};
  const [events, economics, previousCycle] = await Promise.all([
    prisma.elevateEvent.findMany({
      where: {
        cycleKey: input.cycleKey || undefined,
        createdAt: { gte: input.windowStart, lt: input.windowEnd },
      },
      select: {
        userId: true,
        sessionId: true,
        eventType: true,
        offer: true,
        success: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    summarizeElevateEconomics({ since: input.windowStart, until: input.windowEnd, cycleKey: input.cycleKey || undefined }),
    prisma.elevateOutboundCycle.findFirst({
      where: { windowEnd: { lte: input.windowStart } },
      orderBy: { windowEnd: "desc" },
    }),
  ]);

  const pageEvents = events.filter(e => e.eventType === "page_view");
  const visits = uniqueCount(pageEvents.map(e => e.sessionId));
  const verifiedPurchases = events.filter(e => e.eventType === "purchase_verified" && e.success === true);
  const activations = verifiedPurchases.filter(e => e.offer === "activate").length;
  const giftPurchases = verifiedPurchases.filter(e => e.offer === "gift").length;
  const powerUps = verifiedPurchases.filter(e => e.offer === "power").length;
  const makeItReal = verifiedPurchases.filter(e => e.offer === "real").length;
  const giftClaims = events.filter(e => e.eventType === "gift_claimed" && e.success === true).length;

  const actionEvents = events.filter(e => e.eventType === "action_completed" && e.success === true);
  const usageByIdentity = new Map<string, number>();
  for (const event of actionEvents) {
    const key = event.userId || event.sessionId;
    if (!key) continue;
    usageByIdentity.set(key, (usageByIdentity.get(key) || 0) + 1);
  }
  const repeatUsers = [...usageByIdentity.values()].filter(count => count >= 2).length;

  const failures = events.filter(e =>
    e.success === false ||
    e.eventType === "action_failed" ||
    e.eventType === "client_error"
  ).length;

  const reversalSignals = events.filter(e => e.eventType === "entitlement_removed").length;
  const verifiedSends = nonNegativeInt(evidence.verifiedSends);
  const delivered = nonNegativeInt(evidence.delivered);
  const bounced = nonNegativeInt(evidence.bounced);
  const unsubscribes = nonNegativeInt(evidence.unsubscribes);
  const complaints = nonNegativeInt(evidence.complaints);
  const permissionedAudienceSize = nonNegativeInt(evidence.permissionedAudienceSize);
  const knownChannelCostCents = nonNegativeInt(evidence.knownChannelCostCents);

  const effectiveVerifiedCostCents =
    economics.verifiedCostCents +
    (evidence.channelCostVerified && knownChannelCostCents != null ? knownChannelCostCents : 0);

  const externalCostIncomplete =
    Boolean(verifiedSends && verifiedSends > 0) &&
    !(evidence.channelCostVerified && knownChannelCostCents != null);

  const economicsComplete =
    economics.incompleteEconomicSignals === 0 &&
    !externalCostIncomplete;

  const knownContributionCents =
    economics.verifiedRevenueCents -
    effectiveVerifiedCostCents -
    economics.verifiedRefundCents;

  const contributionMargin =
    economicsComplete && economics.verifiedRevenueCents > 0
      ? knownContributionCents / economics.verifiedRevenueCents
      : null;

  const refundRate = pct(economics.verifiedRefundCents, economics.verifiedRevenueCents);
  const bounceRate = verifiedSends != null && bounced != null ? pct(bounced, verifiedSends) : null;
  const complaintRate = verifiedSends != null && complaints != null ? pct(complaints, verifiedSends) : null;

  const materialRefundIssue =
    economics.verifiedRefundCents > 0 &&
    ((refundRate != null && refundRate >= 0.10) || economics.verifiedRefundCents >= 500);

  const materialDeliverabilityIssue =
    evidence.deliverabilityIssue === true ||
    (bounceRate != null && bounceRate >= 0.05) ||
    (complaintRate != null && complaintRate >= 0.003);

  const materialSupportIssue = evidence.supportIssue === true;

  const sendEvidenceComplete =
    evidence.sendEvidenceComplete === true &&
    verifiedSends != null;

  let governorState: ElevateGovernorState = "HOLD";
  const reasons: string[] = [];

  if (
    materialDeliverabilityIssue ||
    materialRefundIssue ||
    materialSupportIssue ||
    (economicsComplete && knownContributionCents < 0)
  ) {
    governorState = "RED";
    if (materialDeliverabilityIssue) reasons.push("material deliverability issue");
    if (materialRefundIssue) reasons.push("material refund issue");
    if (materialSupportIssue) reasons.push("material support issue");
    if (economicsComplete && knownContributionCents < 0) reasons.push("negative verified contribution");
  } else if (
    sendEvidenceComplete &&
    economicsComplete &&
    knownContributionCents > 0
  ) {
    governorState = "GREEN";
    reasons.push("positive verified contribution with no material issue");
  } else {
    governorState = "HOLD";
    if (!sendEvidenceComplete) reasons.push("verified send evidence incomplete");
    if (!economicsComplete) reasons.push("contribution economics incomplete");
    if (economicsComplete && knownContributionCents === 0) reasons.push("verified contribution is zero");
    if (verifiedSends === 0) reasons.push("no verified outbound sends");
  }

  const priorVerifiedSends = previousCycle?.verifiedSends ?? null;
  let maxNextSends = 0;
  let allowedGrowthPct = 0;

  if (governorState === "GREEN" && verifiedSends != null) {
    allowedGrowthPct = 25;
    maxNextSends = Math.floor(verifiedSends * 1.25);
  } else if (governorState === "HOLD") {
    allowedGrowthPct = 0;
    maxNextSends = verifiedSends ?? priorVerifiedSends ?? 0;
  } else {
    allowedGrowthPct = -100;
    maxNextSends = 0;
  }

  if (
    governorState === "GREEN" &&
    previousCycle &&
    !(
      previousCycle.governorState === "GREEN" &&
      previousCycle.knownContributionCents != null &&
      previousCycle.knownContributionCents > 0 &&
      previousCycle.materialDeliverabilityIssue === false &&
      previousCycle.materialRefundIssue === false &&
      previousCycle.materialSupportIssue === false
    )
  ) {
    allowedGrowthPct = 0;
    maxNextSends = verifiedSends ?? 0;
    reasons.push("prior verified cycle does not qualify for output growth");
  }

  const nextAction =
    governorState === "GREEN"
      ? allowedGrowthPct > 0
        ? "Maintain permissioned targeting; output may rise by no more than 25%."
        : "Maintain current permissioned output; do not increase yet."
      : governorState === "RED"
        ? "Stop new outbound for this cycle and correct the material issue before resuming."
        : "Hold output at or below the prior verified level until missing evidence or economics are resolved.";

  return {
    windowStart: input.windowStart,
    windowEnd: input.windowEnd,
    previousCycleId: previousCycle?.id || null,
    permissionedAudienceSize,
    verifiedSends,
    sendEvidenceComplete,
    delivered,
    bounced,
    unsubscribes,
    complaints,
    visits,
    activations,
    giftPurchases,
    giftClaims,
    powerUps,
    makeItReal,
    repeatUsers,
    failures,
    reversalSignals,
    verifiedRevenueCents: economics.verifiedRevenueCents,
    verifiedCostCents: effectiveVerifiedCostCents,
    verifiedRefundCents: economics.verifiedRefundCents,
    knownContributionCents,
    contributionMargin,
    economicsComplete,
    incompleteEconomicSignals:
      economics.incompleteEconomicSignals + (externalCostIncomplete ? 1 : 0),
    materialDeliverabilityIssue,
    materialRefundIssue,
    materialSupportIssue,
    governorState,
    allowedGrowthPct,
    maxNextSends,
    nextAction,
    reasons,
    sourceSnapshot: {
      cycleKey: input.cycleKey || null,
      eventCount: events.length,
      economicEntryCount: economics.entryCount,
      channelCostVerified: Boolean(evidence.channelCostVerified),
      priorVerifiedSends,
      notes: (evidence.notes || []).slice(0, 20),
    },
  };
}

export async function recordElevateOutboundCycle(input: {
  cycleKey: string;
  windowStart: Date;
  windowEnd: Date;
  evidence?: ElevateCycleEvidence;
}) {
  const cycleKey = String(input.cycleKey || "").trim().slice(0, 160);
  if (!cycleKey) throw new Error("ELEVATE_CYCLE_KEY_REQUIRED");

  const evaluation = await evaluateElevateOutboundCycle({
    cycleKey,
    windowStart: input.windowStart,
    windowEnd: input.windowEnd,
    evidence: input.evidence,
  });

  return prisma.elevateOutboundCycle.upsert({
    where: { cycleKey },
    update: {},
    create: {
      cycleKey,
      windowStart: evaluation.windowStart,
      windowEnd: evaluation.windowEnd,
      previousCycleId: evaluation.previousCycleId,
      permissionedAudienceSize: evaluation.permissionedAudienceSize,
      verifiedSends: evaluation.verifiedSends,
      sendEvidenceComplete: evaluation.sendEvidenceComplete,
      delivered: evaluation.delivered,
      bounced: evaluation.bounced,
      unsubscribes: evaluation.unsubscribes,
      complaints: evaluation.complaints,
      visits: evaluation.visits,
      activations: evaluation.activations,
      giftPurchases: evaluation.giftPurchases,
      giftClaims: evaluation.giftClaims,
      powerUps: evaluation.powerUps,
      makeItReal: evaluation.makeItReal,
      repeatUsers: evaluation.repeatUsers,
      failures: evaluation.failures,
      reversalSignals: evaluation.reversalSignals,
      verifiedRevenueCents: evaluation.verifiedRevenueCents,
      verifiedCostCents: evaluation.verifiedCostCents,
      verifiedRefundCents: evaluation.verifiedRefundCents,
      knownContributionCents: evaluation.knownContributionCents,
      contributionMarginBps:
        evaluation.contributionMargin == null
          ? null
          : Math.round(evaluation.contributionMargin * 10000),
      economicsComplete: evaluation.economicsComplete,
      incompleteEconomicSignals: evaluation.incompleteEconomicSignals,
      materialDeliverabilityIssue: evaluation.materialDeliverabilityIssue,
      materialRefundIssue: evaluation.materialRefundIssue,
      materialSupportIssue: evaluation.materialSupportIssue,
      governorState: evaluation.governorState,
      allowedGrowthPct: evaluation.allowedGrowthPct,
      maxNextSends: evaluation.maxNextSends,
      nextAction: evaluation.nextAction,
      reasons: evaluation.reasons as Prisma.InputJsonValue,
      sourceSnapshot: evaluation.sourceSnapshot as Prisma.InputJsonValue,
    },
  });
}
