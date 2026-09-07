export const ENTITLEMENT_STATES = [
  "PENDING",
  "CORE_PENDING",
  "CONFIGURING",
  "TEST_REQUIRED",
  "CERTIFIED",
  "ACTIVE",
  "PAUSED",
] as const;

export type EntitlementState = typeof ENTITLEMENT_STATES[number];

const transitions: Record<EntitlementState, EntitlementState[]> = {
  PENDING: ["CORE_PENDING"],
  CORE_PENDING: ["CONFIGURING"],
  CONFIGURING: ["TEST_REQUIRED"],
  TEST_REQUIRED: ["CERTIFIED"],
  CERTIFIED: ["ACTIVE"],
  ACTIVE: ["PAUSED"],
  PAUSED: ["ACTIVE"],
};

export function canTransition(from:string,to:string){
  return (transitions[from as EntitlementState] || []).includes(to as EntitlementState);
}

export const CORE_SEQUENCE = [
  "IDENTITY",
  "SKILLS",
  "PERSONALIZATION",
  "TEST",
  "CERTIFICATION",
  "LAUNCH",
] as const;
