export type MediaPass = {
  id: string;
  name: string;
  outlet: string;
  role: string;
  email: string;
  beat: string;
  status: "PENDING REVIEW" | "VERIFIED" | "REJECTED";
  createdAt: string;
};

export type MediaReceipt = {
  id: string;
  topic: string;
  duration: number;
  transcript: string;
  truthFactIds: string[];
  websiteMentions: number;
  usage: "EDITORIAL";
  allowedEdits: "TRIM ONLY";
  commercialUse: false;
  voiceCloning: false;
  syntheticEdit: false;
  createdAt: string;
};

export type MediaInteraction = {
  id: string;
  type: "HEADLINE" | "INTERVIEW" | "PITCH" | "MATCH" | "PASS" | "OUTREACH" | "PRESS_VISIT" | "FOUNDER_REQUEST";
  topic: string;
  storyId?: string;
  detail?: string;
  createdAt: string;
};

export type MediaCoverage = {
  id: string;
  storyId: string;
  outlet: string;
  title?: string;
  url: string;
  publishedAt: string;
  verifiedAt: string;
  verification: "VERIFIED";
  source: "COVERAGE_BOT" | "HUMAN";
};

type MediaFloorState = {
  passes: MediaPass[];
  receipts: MediaReceipt[];
  interactions: MediaInteraction[];
  coverage: MediaCoverage[];
};

const g = globalThis as typeof globalThis & { __mediaFloorState?: MediaFloorState };

export const mediaState: MediaFloorState =
  g.__mediaFloorState ||
  (g.__mediaFloorState = {
    passes: [],
    receipts: [],
    interactions: [],
    coverage: [],
  });

if (!mediaState.coverage) mediaState.coverage = [];

export function makeId(prefix: string) {
  return prefix + "-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 7).toUpperCase();
}

export function recordInteraction(type: MediaInteraction["type"], topic: string, detail?: string, storyId?: string) {
  mediaState.interactions.push({
    id: makeId("INT"),
    type,
    topic,
    storyId,
    detail,
    createdAt: new Date().toISOString(),
  });
  if (mediaState.interactions.length > 1000) mediaState.interactions.splice(0, mediaState.interactions.length - 1000);
}
