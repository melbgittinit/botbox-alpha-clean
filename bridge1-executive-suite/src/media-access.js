import { randomUUID } from "node:crypto";

const requests = new Map();
const MAX_REQUESTS = 500;
const MEDIA_REQUEST_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const allowedTypes = new Set(["product-demo", "executive-briefing", "interview", "fact-check"]);
const allowedStatuses = new Set(["pending-media-review", "approved-for-scheduling", "invitation-issued", "completed", "declined"]);
let persistence = { saveMediaRequest:async()=>{}, loadMediaRequests:async()=>[], deleteExpiredMediaRequests:async()=>0 };

function cleanText(value, max = 600) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";
}

function prune() {
  const now = Date.now();
  for (const [id, request] of requests) if (Date.parse(request.expires_at) <= now) requests.delete(id);
  while (requests.size >= MAX_REQUESTS) requests.delete(requests.keys().next().value);
}

export function configureMediaAccessPersistence(adapter) {
  if (adapter?.saveMediaRequest && adapter?.loadMediaRequests) persistence = adapter;
}

export async function hydrateMediaAccessRequests() {
  prune();
  await persistence.deleteExpiredMediaRequests?.();
  const active = await persistence.loadMediaRequests();
  for (const request of active) requests.set(request.id, request);
  return active.length;
}

export async function pruneExpiredMediaAccessRequests() {
  prune();
  return persistence.deleteExpiredMediaRequests?.() || 0;
}

export async function submitMediaAccessRequest(input = {}) {
  if (cleanText(input.website, 120)) return { status:"received" };
  if (input.contact_consent !== true) throw new Error("MEDIA_CONSENT_REQUIRED");

  const name = cleanText(input.name, 160);
  const businessEmail = cleanText(input.business_email, 254).toLowerCase();
  const outlet = cleanText(input.outlet, 200);
  const reportingFocus = cleanText(input.reporting_focus, 800);
  const requestType = allowedTypes.has(input.request_type) ? input.request_type : "";

  if (!name || !businessEmail || !outlet || !reportingFocus || !requestType) throw new Error("MEDIA_REQUIRED_FIELDS");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail)) throw new Error("MEDIA_INVALID_EMAIL");

  prune();
  const now = new Date();
  const request = {
    id: randomUUID(),
    status: "pending-media-review",
    request_type: requestType,
    name,
    business_email: businessEmail,
    outlet,
    reporting_focus: reportingFocus,
    contact_consent: true,
    source: "bridge1-media-experience",
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    expires_at: new Date(now.getTime() + MEDIA_REQUEST_TTL_MS).toISOString(),
    audit: [{ at:now.toISOString(), event:"media_access_requested" }]
  };
  requests.set(request.id, request);
  await persistence.saveMediaRequest(request);
  return { status:request.status, request_id:request.id, message:"Your request is waiting for authorized human review." };
}

export function listMediaAccessRequests() {
  prune();
  return [...requests.values()].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).map(value => structuredClone(value));
}

export function getMediaAccessMetrics() {
  const all = listMediaAccessRequests();
  const count = status => all.filter(item => item.status === status).length;
  return {
    generated_at:new Date().toISOString(),
    total_requests:all.length,
    pending_review:count("pending-media-review"),
    approved_for_scheduling:count("approved-for-scheduling"),
    invitations_issued:count("invitation-issued"),
    completed:count("completed")
  };
}

export async function updateMediaAccessStatus(id, status) {
  if (!allowedStatuses.has(status)) throw new Error("INVALID_MEDIA_STATUS");
  const request = requests.get(id);
  if (!request) throw new Error("MEDIA_REQUEST_NOT_FOUND");
  request.status = status;
  request.updated_at = new Date().toISOString();
  request.audit.push({ at:request.updated_at, event:"media_status_updated", status });
  await persistence.saveMediaRequest(request);
  return { status:"updated", request_status:status };
}
