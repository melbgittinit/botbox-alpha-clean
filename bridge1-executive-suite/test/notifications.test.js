import test from "node:test";
import assert from "node:assert/strict";
import { buildReviewAlert } from "../src/notifications.js";

test("alert excludes transcript and private contact details", () => {
  const alert = buildReviewAlert({ priority:"high", organization:"Example Co", recommended_agent:"Opportunity Agent", investment_class:"institutional", handoff_id:"h-1", participant:{ business_email:"private@example.com" }, transcript:"secret transcript" });
  assert.match(alert.subject, /high-priority/i);
  assert.match(alert.text, /protected BRIDGE-1 review dashboard/i);
  assert.doesNotMatch(alert.text, /private@example.com|secret transcript/i);
});
