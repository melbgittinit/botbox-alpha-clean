import type { ShopBotMissionResult, ShopBotSpecialist } from "./types";

const specialistLabels: Record<ShopBotSpecialist, string> = {
  FIND_IT_BOT: "Find It Bot™",
  COMPARE_BOT: "Compare Bot™",
  DEAL_BOT: "Deal Bot™",
  GIFT_BOT: "Gift Bot™",
  BUSINESS_BUYER_BOT: "Business Buyer Bot™",
};

function containsAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function extractBudget(text: string) {
  const matches = [
    ...text.matchAll(/(?:under|below|less than|budget(?: is| of)?|up to)?\s*\$\s*([0-9]{1,7}(?:,[0-9]{3})*(?:\.\d{1,2})?)/gi),
  ];
  if (!matches.length) return undefined;
  const value = Number(matches[0][1].replace(/,/g, ""));
  return Number.isFinite(value) ? value : undefined;
}

function classify(text: string): { specialist: ShopBotSpecialist; reason: string } {
  if (containsAny(text, ["gift", "birthday", "anniversary", "mother's day", "father's day", "wedding present", "christmas"])) {
    return { specialist: "GIFT_BOT", reason: "The mission is centered on choosing for another person or occasion." };
  }
  if (containsAny(text, ["compare", " versus ", " vs ", "difference between", "which is better"])) {
    return { specialist: "COMPARE_BOT", reason: "The customer already has alternatives and needs decision clarity." };
  }
  if (containsAny(text, ["deal", "cheaper", "lowest price", "price drop", "sale", "overpay", "worth it"])) {
    return { specialist: "DEAL_BOT", reason: "The mission is primarily about price intelligence and total value." };
  }
  if (containsAny(text, ["business", "startup", "start a", "equipment", "supplies", "office", "church", "organization", "creator setup", "studio"])) {
    return { specialist: "BUSINESS_BUYER_BOT", reason: "The request appears tied to a project, organization, creator setup, or income-producing use." };
  }
  return { specialist: "FIND_IT_BOT", reason: "The product or category still needs to be identified or narrowed." };
}

function getReturnChecks(text: string, specialist: ShopBotSpecialist) {
  const checks = ["Confirm intended use before recommendation", "Confirm total delivered cost before approval"];
  if (containsAny(text, ["laptop", "computer", "phone", "tablet", "camera", "microphone", "charger", "electronics"])) {
    checks.push("Confirm compatibility, ports, operating system, accessories and required standards");
  }
  if (containsAny(text, ["shirt", "shoe", "dress", "jacket", "clothing", "apparel"])) {
    checks.push("Confirm size, fit preference and merchant size chart");
  }
  if (containsAny(text, ["furniture", "desk", "chair", "room", "home"])) {
    checks.push("Confirm dimensions, space constraints, delivery access and assembly requirements");
  }
  if (specialist === "BUSINESS_BUYER_BOT") {
    checks.push("Confirm expected volume/capacity and whether required consumables or software add recurring cost");
  }
  if (specialist === "GIFT_BOT") {
    checks.push("Confirm recipient, occasion, deadline and anything the recipient should not receive");
  }
  return checks;
}

function safetyFlags(text: string) {
  const flags: string[] = [];
  const restricted = [
    "gun", "firearm", "ammo", "ammunition", "silencer", "explosive", "grenade",
    "switchblade", "taser", "pepper spray", "nicotine", "vape", "cigarette",
    "marijuana", "thc", "cbd", "steroid", "prescription drug"
  ];
  if (containsAny(text, restricted)) flags.push("RESTRICTED_PRODUCT_REVIEW");
  return flags;
}

export function buildMission(request: string): ShopBotMissionResult {
  const clean = request.trim().replace(/\s+/g, " ");
  const normalized = clean.toLowerCase();
  const { specialist, reason } = classify(normalized);
  const flags = safetyFlags(normalized);

  let nextQuestion = "What matters most: fit, quality, price, simplicity, delivery time, or something else?";
  if (specialist === "GIFT_BOT") nextQuestion = "Who is the gift for, what is the occasion, and what budget should I respect?";
  if (specialist === "COMPARE_BOT") nextQuestion = "Which exact products or models should I compare?";
  if (specialist === "DEAL_BOT") nextQuestion = "What exact product should I price-check, and what would count as a meaningful deal?";
  if (specialist === "BUSINESS_BUYER_BOT") nextQuestion = "What job must this purchase perform, and what volume or business outcome are you planning for?";

  return {
    missionId: `SB-${Date.now()}`,
    createdAt: new Date().toISOString(),
    request: clean,
    specialist,
    specialistLabel: specialistLabels[specialist],
    reason,
    budget: extractBudget(clean),
    nextQuestion,
    authority: {
      level: "LEVEL_1_RECOMMEND",
      humanApprovalRequired: true,
      paymentAuthority: false,
      delegatedSpendingAuthority: false,
      voiceAgentEnabled: false,
    },
    returnPreventionChecks: getReturnChecks(normalized, specialist),
    fraudAndTrustChecks: [
      "Verify merchant identity and current availability before presenting a purchase path",
      "Separate customer-fit reasoning from affiliate or sponsorship economics",
      "Label sponsored relationships clearly",
      "Do not create artificial urgency or unverified scarcity",
      "Create an auditable Trust Receipt before any future transaction",
    ],
    safety: {
      safeToProceed: flags.length === 0,
      flags,
    },
    trustReceipt: {
      affiliateStatus: "NOT_EVALUATED",
      sponsoredStatus: "NONE",
      transactionStatus: "NO_TRANSACTION",
      preventableReturnGoal: "ZERO_PREVENTABLE_RETURNS",
    },
  };
}
