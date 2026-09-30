import test from "node:test";
import assert from "node:assert/strict";
import { buildMediaAccessAlert, buildReviewAlert } from "../src/notifications.js";

test("alert excludes transcript and private contact details", () => {
  const alert = buildReviewAlert({ priority:"high", organization:"Example Co", recommended_agent:"Opportunity Agent", investment_class:"institutional", handoff_id:"h-1", participant:{ business_email:"private@example.com" }, transcript:"secret transcript" });
  assert.match(alert.subject, /high-priority/i);
  assert.match(alert.text, /protected BRIDGE-1 review dashboard/i);
  assert.doesNotMatch(alert.text, /private@example.com|secret transcript/i);
});

test("media alert keeps contact details in the protected dashboard", () => {
  const alert = buildMediaAccessAlert({ id:"m-1", outlet:"Example News", request_type:"interview", reporting_focus:"Responsible enterprise agents", business_email:"reporter@example.com" });
  assert.match(alert.subject, /media access request/i);
  assert.match(alert.text, /No invitation has been issued automatically/i);
  assert.doesNotMatch(alert.text, /reporter@example.com/i);
});
