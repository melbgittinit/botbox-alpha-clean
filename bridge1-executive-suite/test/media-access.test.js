import test from "node:test";
import assert from "node:assert/strict";
import { getMediaAccessMetrics, listMediaAccessRequests, submitMediaAccessRequest, updateMediaAccessStatus } from "../src/media-access.js";

test("media access requires explicit contact consent", async () => {
  await assert.rejects(() => submitMediaAccessRequest({ name:"Reporter", business_email:"reporter@example.com", outlet:"Example News", reporting_focus:"Agent governance", request_type:"interview", contact_consent:false }), /MEDIA_CONSENT_REQUIRED/);
});

test("media access enters human review and never issues an invitation automatically", async () => {
  const result = await submitMediaAccessRequest({ name:"Reporter", business_email:"reporter@example.com", outlet:"Example News", reporting_focus:"Agent governance", request_type:"interview", contact_consent:true });
  assert.equal(result.status, "pending-media-review");
  assert.ok(result.request_id);
  const item = listMediaAccessRequests().find(request => request.id === result.request_id);
  assert.equal(item.status, "pending-media-review");
  assert.equal(item.contact_consent, true);
  assert.ok(Date.parse(item.expires_at) > Date.now());
  assert.equal(getMediaAccessMetrics().invitations_issued, 0);
  const updated = await updateMediaAccessStatus(result.request_id, "approved-for-scheduling");
  assert.equal(updated.request_status, "approved-for-scheduling");
});
