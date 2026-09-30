import { randomUUID } from "node:crypto";

const sessions = new Map();
const MAX_SESSIONS = 500;
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const allowedFields = new Set(["organization", "role", "business_gap", "recommended_agent", "primary_users", "commercial_value", "pilot_scope", "success_measures", "timeline", "decision_authority", "investment_class"]);
let persistence = { mode:"memory", save:async()=>{}, loadActive:async()=>[], deleteExpired:async()=>0, health:async()=>({status:"ok",mode:"memory"}), close:async()=>{} };

export function configureExecutivePersistence(adapter) {
  if (adapter) persistence = adapter;
}

export async function hydrateExecutiveSessions() {
  const active = await persistence.loadActive();
  for (const session of active) sessions.set(session.id, session);
  await persistence.deleteExpired();
  return active.length;
}

export function executivePersistenceMode() { return persistence.mode; }
export async function executivePersistenceHealth() { return persistence.health(); }
export async function closeExecutivePersistence() { return persistence.close(); }

function cleanText(value, max = 1200) {
  return typeof value === "string" ? value.trim().slice(0, max) : value;
}

function prune() {
  const cutoff = Date.now() - SESSION_TTL_MS;
  for (const [id, session] of sessions) if (session.updated_at < cutoff) sessions.delete(id);
  while (sessions.size >= MAX_SESSIONS) sessions.delete(sessions.keys().next().value);
}

export async function createExecutiveSession({ sampler = null } = {}) {
  prune();
  const now = Date.now();
  const session = {
    id: randomUUID(), status: "active", stage: "welcome", sampler: cleanText(sampler, 80),
    created_at: now, updated_at: now,
    opportunity: {
      organization: null, role: null, business_gap: null, recommended_agent: null,
      primary_users: [], commercial_value: [], pilot_scope: null, success_measures: [],
      timeline: null, decision_authority: "unknown", investment_class: null
    },
    consent: { save_brief: false, share_summary: false, contact_permission: false },
    participant: { name: null, role: null, organization: null, business_email: null, preferred_contact: null },
    brief: null, handoff: null, audit: [{ at: now, event: "session_created" }]
  };
  sessions.set(session.id, session);
  await persistence.save(session);
  return structuredClone(session);
}

export function getExecutiveSession(id) {
  const session = sessions.get(id);
  if (!session || session.updated_at < Date.now() - SESSION_TTL_MS) return null;
  return structuredClone(session);
}

export async function updateOpportunity(id, input = {}) {
  const session = sessions.get(id);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  for (const [key, value] of Object.entries(input)) {
    if (!allowedFields.has(key) || value == null) continue;
    session.opportunity[key] = Array.isArray(value) ? value.slice(0, 10).map(v => cleanText(v, 240)) : cleanText(value);
  }
  session.stage = session.opportunity.business_gap ? "diagnosis" : session.stage;
  if (session.opportunity.recommended_agent) session.stage = "opportunity";
  if (session.opportunity.pilot_scope) session.stage = "pilot-design";
  if (session.opportunity.investment_class) session.stage = "qualification";
  session.updated_at = Date.now();
  session.audit.push({ at: session.updated_at, event: "opportunity_updated", fields: Object.keys(input).filter(k => allowedFields.has(k)) });
  await persistence.save(session);
  return { status: "saved", stage: session.stage, opportunity: structuredClone(session.opportunity) };
}

export async function prepareBrief(id) {
  const session = sessions.get(id);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  const o = session.opportunity;
  const missing = ["business_gap", "recommended_agent", "pilot_scope", "success_measures"].filter(key => !o[key] || (Array.isArray(o[key]) && !o[key].length));
  if (missing.length) return { status: "needs_context", missing };
  session.brief = {
    brief_id: randomUUID(), created_at: new Date().toISOString(), non_binding: true,
    organization: o.organization || "Not yet identified", executive_role: o.role || "Not yet identified",
    diagnosed_gap: o.business_gap, recommended_agent: o.recommended_agent,
    primary_users: o.primary_users, commercial_value: o.commercial_value,
    pilot_scope: o.pilot_scope, success_measures: o.success_measures,
    timeline: o.timeline || "To be established", decision_authority: o.decision_authority,
    indicative_commercial_class: o.investment_class || "To be established",
    authority_notice: "Final scope, pricing, proposal and agreement require authorized human review."
  };
  session.stage = "executive-brief";
  session.updated_at = Date.now();
  session.audit.push({ at: session.updated_at, event: "brief_prepared", brief_id: session.brief.brief_id });
  await persistence.save(session);
  return { status: "prepared", brief: structuredClone(session.brief) };
}

export async function requestHumanReview(id, input = {}) {
  const session = sessions.get(id);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (input.contact_permission !== true || input.share_summary !== true) {
    return { status: "consent_required", message: "Explicit permission to contact and share the summary is required." };
  }
  if (!session.brief) return { status: "brief_required", message: "Prepare the executive brief before requesting human review." };
  session.consent = { save_brief: true, share_summary: true, contact_permission: true };
  for (const key of ["name", "role", "organization", "business_email", "preferred_contact"]) session.participant[key] = cleanText(input[key] || null, 320);
  session.handoff = { id: randomUUID(), status: "pending-human-review", requested_at: new Date().toISOString(), priority: ["institutional", "enterprise"].includes(session.opportunity.investment_class) ? "high" : "normal" };
  session.stage = "human-review";
  session.status = "qualified";
  session.updated_at = Date.now();
  session.audit.push({ at: session.updated_at, event: "human_review_requested", handoff_id: session.handoff.id });
  await persistence.save(session);
  return { status: "pending-human-review", handoff_id: session.handoff.id, priority: session.handoff.priority };
}

export async function completeExecutiveSession(id, input = {}) {
  const session = sessions.get(id);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.completed_at) return { status:session.status, outcome:session.outcome };
  const allowedOutcomes = new Set(["conversation-only", "brief-prepared", "human-review-requested", "visitor-ended", "technical-interruption"]);
  const outcome = allowedOutcomes.has(input.outcome) ? input.outcome :
    session.handoff ? "human-review-requested" : session.brief ? "brief-prepared" : "conversation-only";
  session.status = session.handoff ? "qualified" : "completed";
  session.stage = session.handoff ? "human-review" : "complete";
  session.outcome = outcome;
  session.completed_at = new Date().toISOString();
  session.updated_at = Date.now();
  session.audit.push({ at:session.updated_at, event:"session_completed", outcome });
  await persistence.save(session);
  return { status:session.status, outcome, brief_prepared:Boolean(session.brief), human_review_requested:Boolean(session.handoff) };
}

export function getExecutiveMetrics() {
  const all = [...sessions.values()];
  const count = predicate => all.filter(predicate).length;
  const sessionsStarted = all.length;
  const briefsPrepared = count(s => Boolean(s.brief));
  const reviewRequests = count(s => Boolean(s.handoff));
  return {
    generated_at:new Date().toISOString(), sessions_started:sessionsStarted,
    sessions_completed:count(s => Boolean(s.completed_at)), briefs_prepared:briefsPrepared,
    human_review_requests:reviewRequests, high_priority_requests:count(s => s.handoff?.priority === "high"),
    brief_rate:sessionsStarted ? Number((briefsPrepared / sessionsStarted).toFixed(3)) : 0,
    review_request_rate:sessionsStarted ? Number((reviewRequests / sessionsStarted).toFixed(3)) : 0
  };
}

export async function executeCoreTool(id, name, args) {
  if (name === "update_executive_opportunity") return updateOpportunity(id, args);
  if (name === "prepare_executive_brief") return prepareBrief(id);
  if (name === "request_human_review") return requestHumanReview(id, args);
  throw new Error("UNKNOWN_TOOL");
}

export function listReviewQueue() {
  return [...sessions.values()].filter(s => s.handoff).map(s => ({
    session_id: s.id, organization: s.opportunity.organization, recommended_agent: s.opportunity.recommended_agent,
    investment_class: s.opportunity.investment_class, priority: s.handoff.priority,
    handoff_id: s.handoff.id, handoff_status: s.handoff.status,
    requested_at: s.handoff.requested_at, participant: s.participant, brief: s.brief
  }));
}

export async function updateHandoffStatus(sessionId, status) {
  const allowed = new Set(["pending-human-review", "accepted-for-discovery", "deferred", "closed-not-fit"]);
  if (!allowed.has(status)) throw new Error("INVALID_HANDOFF_STATUS");
  const session = sessions.get(sessionId);
  if (!session?.handoff) throw new Error("HANDOFF_NOT_FOUND");
  session.handoff.status = status;
  session.updated_at = Date.now();
  session.audit.push({ at:session.updated_at, event:"handoff_status_updated", status });
  await persistence.save(session);
  return { status:"updated", handoff_status:status };
}
