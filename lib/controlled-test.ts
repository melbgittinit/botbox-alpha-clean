export const CONTROLLED_BOT_IDS = new Set([
  "mebot","fam","coffee","wbells","mtc","pop","zipper","impostr","tvme","slide",
  "tracking","elevate","beauty","register","creator","fundus","freemoney","ufo",
]);

export function cleanTestPrompt(value: unknown) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, 800);
}

export function controlledResultFor(botId: string, prompt: string) {
  const s = (prompt || "your example").slice(0, 160);
  const map: Record<string, string> = {
    mebot: "PRIORITY CHECK\n1. Protect the most time-sensitive responsibility.\n2. Finish one thing that removes pressure.\n3. Move one non-urgent item out of today.\n\nNEXT: block the first 25 minutes.",
    fam: `FAMILY MEMORY ENTRY\nSubject: ${s}\nCapture the memory in the teller’s own words. Add people, place and why it matters. Invite one relative to add what they remember.`,
    coffee: `MORNING RESET\nFor: ${s}\nChoose one small coffee or morning ritual, one must-do task, and one thing you can deliberately leave for later.`,
    wbells: "YOUR NEXT 5 WEDDING MOVES\n1. Confirm the decision blocking vendors.\n2. Name who owns guest-list changes.\n3. Verify the next payment.\n4. Draft the run order.\n5. Put one family decision in writing.",
    mtc: `TODAY’S ENCOURAGEMENT\nBring this concern into prayer: ${s}\nName what you can control today, one faithful action you can take, and one burden you do not need to carry alone.`,
    pop: "CALL: DIG DEEPER\nWHY: upside is visible; cost is unclear; one assumption is untested.\nNEXT: test the riskiest assumption before committing more.",
    zipper: "FIRST PROSPECTING PASS\nLikely buyers: past customers, adjacent buyers, and people already showing the problem.\nFIRST ACTION: identify 10 real prospects and personalize the first 3 approaches.",
    impostr: "CONTENT MOVE\nLead with the strongest visual. Adapt the explanation for a second channel. Save the behind-the-scenes detail for follow-up. Test one concise hook.",
    tvme: "YOUR MEDIA ANGLE\nLead with the change, result or human consequence—not simply that the business exists. Tie it to something timely. Build 3 talking points.",
    slide: `HUSTLE CONTROL\nFor: ${s}\nRank current income streams by urgency, cash potential and required effort. Pick one move that advances the strongest lane today.`,
    tracking: `TRACKING STARTER\nItem or situation: ${s}\nRecord: item • current location • responsible person • last verified • next check date.`,
    elevate: `ELEVATE PASS\nFor: ${s}\n1. Improve the strongest existing asset.\n2. Remove one friction point.\n3. Test one distribution or visibility move before adding more complexity.`,
    beauty: "BEAUTY BUSINESS QUICK MOVE\nPick one service with booking room. Contact clients naturally due to return. Build one simple promotion. Track booked appointments, not message volume.",
    register: `REGISTER / RENEW CHECK\nFor: ${s}\nList the item, registration or warranty requirement, deadline, proof/document location and reminder date. Verify the official source before acting.`,
    creator: `CREATOR CLOSER PASS\nIdea: ${s}\nWHAT YOU HAVE: name the strongest finished piece.\nWHAT IS MISSING: define the smallest gap blocking presentation or sale.\nNEXT: package the idea into one clear promise, proof item and handoff.`,
    fundus: "FUNDRAISING STARTER\nState the exact need. Break the goal into achievable supporter actions. Give each teammate one easy share/sell action. Use one QR/link destination. Report progress.",
    freemoney: "OPPORTUNITY CHECK\nLive opportunity search is not connected yet. Production results must show source, who may qualify, deadline, required materials, fit reason and verification status. No guaranteed awards.",
    ufo: `CASE STRUCTURE\nReport: ${s}\nStatus: reported—not automatically verified. Separate witness report, documentation, disputed claims and unresolved details.`,
  };
  return map[botId] || "This bot is not enabled for alpha testing yet.";
}
