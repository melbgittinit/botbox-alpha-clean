import { recordElevateOutboundCycle } from "../../../../../lib/elevate-outbound-control";

export async function GET() {
  const cycle = await recordElevateOutboundCycle({
    cycleKey: "elevate-2026-09-22-1100-1400-et",
    windowStart: new Date("2026-09-22T15:00:00Z"),
    windowEnd: new Date("2026-09-22T18:00:00Z"),
    evidence: {
      verifiedSends: 0,
      sendEvidenceComplete: true,
      deliverabilityIssue: false,
      supportIssue: false,
      channelCostVerified: false,
      notes: [
        "Urban Spirit Gmail: no verified Elevate campaign sends in this 3-hour window; unrelated messages excluded.",
        "First governor bootstrap cycle. No outbound expansion authorized without positive verified contribution."
      ]
    }
  });

  return Response.json({
    ok: true,
    cycle: {
      id: cycle.id,
      cycleKey: cycle.cycleKey,
      governorState: cycle.governorState,
      verifiedSends: cycle.verifiedSends,
      visits: cycle.visits,
      activations: cycle.activations,
      giftPurchases: cycle.giftPurchases,
      powerUps: cycle.powerUps,
      makeItReal: cycle.makeItReal,
      verifiedRevenueCents: cycle.verifiedRevenueCents,
      verifiedCostCents: cycle.verifiedCostCents,
      verifiedRefundCents: cycle.verifiedRefundCents,
      knownContributionCents: cycle.knownContributionCents,
      economicsComplete: cycle.economicsComplete,
      allowedGrowthPct: cycle.allowedGrowthPct,
      maxNextSends: cycle.maxNextSends,
      nextAction: cycle.nextAction,
      reasons: cycle.reasons
    }
  }, { headers: { "cache-control": "no-store" } });
}
