export const CAMERA_PLANS = {
  free_trial: { label:'Free Trial', includedLooks:3, durationDays:60 },
  camera_30: { label:'30-Day Opportunity Camera Pass', includedLooks:40, durationDays:30 }
};

export function normalizeCameraEntitlement(payload={}) {
  const plan = CAMERA_PLANS[payload.cameraPlan] ? payload.cameraPlan : 'free_trial';
  const def = CAMERA_PLANS[plan];
  const includedLooks = Number.isInteger(payload.cameraIncludedLooks)
    ? Math.max(0,payload.cameraIncludedLooks)
    : def.includedLooks;
  const looksUsed = Number.isInteger(payload.cameraLooksUsed)
    ? Math.max(0,Math.min(includedLooks,payload.cameraLooksUsed))
    : 0;
  const expiresAt = payload.cameraExpiresAt || payload.expiresAt || null;
  return {
    plan,
    label:def.label,
    includedLooks,
    looksUsed,
    looksRemaining:Math.max(0,includedLooks-looksUsed),
    expiresAt,
    expired:expiresAt ? Date.parse(expiresAt) < Date.now() : false
  };
}

export function canUseCamera(entitlement) {
  return Boolean(entitlement) && !entitlement.expired && entitlement.looksRemaining > 0;
}

export function consumeLookPayload(payload={}) {
  const ent = normalizeCameraEntitlement(payload);
  if (!canUseCamera(ent)) return null;
  return {
    ...payload,
    cameraPlan:ent.plan,
    cameraIncludedLooks:ent.includedLooks,
    cameraLooksUsed:ent.looksUsed + 1,
    cameraExpiresAt:ent.expiresAt
  };
}

export function upgradeCameraPayload(payload={}, plan='camera_30', now=Date.now()) {
  const def = CAMERA_PLANS[plan];
  if (!def) return null;
  const cameraExpiresAt = new Date(now + def.durationDays*86400000).toISOString();
  return {
    ...payload,
    cameraPlan:plan,
    cameraIncludedLooks:def.includedLooks,
    cameraLooksUsed:0,
    cameraExpiresAt
  };
}

export function cameraStatus(entitlement) {
  if (!entitlement) return {allowed:false,reason:'EARN_MODE_PROFILE_REQUIRED'};
  if (entitlement.expired) return {allowed:false,reason:'CAMERA_PASS_EXPIRED'};
  if (entitlement.looksRemaining <= 0) return {allowed:false,reason:'CAMERA_PASS_REQUIRED'};
  return {allowed:true,reason:null};
}
