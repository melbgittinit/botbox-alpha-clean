import crypto from "crypto";
import { recordElevateOutboundCycle } from "../../../../lib/elevate-outbound-control";

function authorized(request: Request) {
  const configured = process.env.ELEVATE_CONTROL_TOKEN;
  if (!configured) return false;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!supplied || supplied.length !== configured.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(configured));
  } catch {
    return false;
  }
}

function asDate(value: unknown) {
  const date = new Date(String(value || ""));
  return Number.isFinite(date.getTime()) ? date : null;
}

function maybeInt(value: unknown) {
  if (value == null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.floor(number) : null;
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const windowStart = asDate(body?.windowStart);
  const windowEnd = asDate(body?.windowEnd);
  if (!windowStart || !windowEnd || windowEnd <= windowStart) {
    return Response.json({ error: "INVALID_WINDOW" }, { status: 400 });
  }

  const hours = (windowEnd.getTime() - windowStart.getTime()) / 3_600_000;
  if (hours > 3.25) {
    return Response.json({ error: "WINDOW_TOO_LARGE" }, { status: 400 });
  }

  const cycleKey = String(body?.cycleKey || "").trim().slice(0, 160);
  if (!cycleKey) {
    return Response.json({ error: "CYCLE_KEY_REQUIRED" }, { status: 400 });
  }

  const cycle = await recordElevateOutboundCycle({
    cycleKey,
    windowStart,
    windowEnd,
    evidence: {
      verifiedSends: maybeInt(body?.evidence?.verifiedSends),
      sendEvidenceComplete: body?.evidence?.sendEvidenceComplete === true,
      permissionedAudienceSize: maybeInt(body?.evidence?.permissionedAudienceSize),
      delivered: maybeInt(body?.evidence?.delivered),
      bounced: maybeInt(body?.evidence?.bounced),
      unsubscribes: maybeInt(body?.evidence?.unsubscribes),
      complaints: maybeInt(body?.evidence?.complaints),
      deliverabilityIssue:
        typeof body?.evidence?.deliverabilityIssue === "boolean"
          ? body.evidence.deliverabilityIssue
          : null,
      supportIssue:
        typeof body?.evidence?.supportIssue === "boolean"
          ? body.evidence.supportIssue
          : null,
      knownChannelCostCents: maybeInt(body?.evidence?.knownChannelCostCents),
      channelCostVerified: body?.evidence?.channelCostVerified === true,
      notes: Array.isArray(body?.evidence?.notes)
        ? body.evidence.notes.map((x: unknown) => String(x).slice(0, 300)).slice(0, 20)
        : [],
    },
  });

  return Response.json({
    ok: true,
    cycle: {
      id: cycle.id,
      cycleKey: cycle.cycleKey,
      windowStart: cycle.windowStart,
      windowEnd: cycle.windowEnd,
      verifiedSends: cycle.verifiedSends,
      visits: cycle.visits,
      activations: cycle.activations,
      giftPurchases: cycle.giftPurchases,
      giftClaims: cycle.giftClaims,
      powerUps: cycle.powerUps,
      makeItReal: cycle.makeItReal,
      repeatUsers: cycle.repeatUsers,
      failures: cycle.failures,
      verifiedRevenueCents: cycle.verifiedRevenueCents,
      verifiedCostCents: cycle.verifiedCostCents,
      verifiedRefundCents: cycle.verifiedRefundCents,
      knownContributionCents: cycle.knownContributionCents,
      economicsComplete: cycle.economicsComplete,
      governorState: cycle.governorState,
      allowedGrowthPct: cycle.allowedGrowthPct,
      maxNextSends: cycle.maxNextSends,
      nextAction: cycle.nextAction,
      reasons: cycle.reasons,
    },
  }, { headers: { "cache-control": "no-store" } });
}


export async function GET(request: Request) {
  const url = new URL(request.url);
  const configured = process.env.ELEVATE_BOOTSTRAP_TOKEN || "";
  const supplied = url.searchParams.get("bootstrap") || "";

  let bootstrapAuthorized = false;
  if (configured && supplied && configured.length === supplied.length) {
    try {
      bootstrapAuthorized = crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(configured));
    } catch {
      bootstrapAuthorized = false;
    }
  }
  if (!bootstrapAuthorized) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

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
        "First governor bootstrap cycle. No outbound expansion authorized without positive verified contribution.",
      ],
    },
  });

  return Response.json({
    ok: true,
    bootstrap: true,
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
      reasons: cycle.reasons,
    },
  }, { headers: { "cache-control": "no-store" } });
}
