import test from "node:test";
import assert from "node:assert/strict";
import { completeExecutiveSession, createExecutiveSession, getExecutiveMetrics, prepareBrief, requestHumanReview, updateOpportunity } from "../src/executive-core.js";

async function qualifiedSession() {
  const session = await createExecutiveSession({ sampler:"fresh-opportunity" });
  await updateOpportunity(session.id, {
    organization:"Example Enterprise", role:"Chief Growth Officer",
    business_gap:"Campaign interest disappears after the campaign ends.",
    recommended_agent:"Commerce and Opportunity Intelligence Agent",
    primary_users:["customers", "brand team"], commercial_value:["continuity", "qualified demand"],
    pilot_scope:"One audience, one journey and one supervised channel for 90 days.",
    success_measures:["qualified conversations", "return engagement", "handoff completion"],
    timeline:"Q1", decision_authority:"executive-sponsor", investment_class:"institutional"
  });
  return session;
}

test("brief requires adequate context", async () => {
  const session = await createExecutiveSession();
  assert.equal((await prepareBrief(session.id)).status, "needs_context");
});

test("institutional opportunity produces non-binding brief", async () => {
  const session = await qualifiedSession();
  const result = await prepareBrief(session.id);
  assert.equal(result.status, "prepared");
  assert.equal(result.brief.non_binding, true);
  assert.equal(result.brief.indicative_commercial_class, "institutional");
});

test("handoff fails without explicit dual consent", async () => {
  const session = await qualifiedSession();
  await prepareBrief(session.id);
  const result = await requestHumanReview(session.id, { contact_permission:true, share_summary:false });
  assert.equal(result.status, "consent_required");
});

test("qualified consented opportunity enters high-priority human review", async () => {
  const session = await qualifiedSession();
  await prepareBrief(session.id);
  const result = await requestHumanReview(session.id, {
    contact_permission:true, share_summary:true, name:"Executive", role:"CGO", organization:"Example Enterprise", preferred_contact:"email"
  });
  assert.equal(result.status, "pending-human-review");
  assert.equal(result.priority, "high");
});

test("session completion is idempotent and included in aggregate funnel metrics", async () => {
  const session = await createExecutiveSession();
  const first = await completeExecutiveSession(session.id, { outcome:"visitor-ended" });
  const second = await completeExecutiveSession(session.id, { outcome:"technical-interruption" });
  assert.equal(first.outcome, "visitor-ended");
  assert.equal(second.outcome, "visitor-ended");
  const metrics = getExecutiveMetrics();
  assert.ok(metrics.sessions_started >= 1);
  assert.ok(metrics.sessions_completed >= 1);
  assert.equal(typeof metrics.review_request_rate, "number");
});
