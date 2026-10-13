type ElevateAction = "make" | "done" | "reach" | "earn" | "better" | "next";

type ElevateAiInput = {
  action: ElevateAction;
  mission: string;
  botName?: string;
  context?: string;
  mode?: "preview" | "activated";
};

type LiftResult = {
  source: "ai" | "structured";
  title: string;
  readout: {
    focus: string;
    friction: string;
    leverage: string;
  };
  firstMove: {
    title: string;
    why: string;
    action: string;
    timebox: string;
  };
  deliverable: {
    title: string;
    content: string;
  };
  path: string[];
  boost: string;
  steps: string[];
  result?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    model: string;
  };
};

function contextLine(context: string | undefined, label: string) {
  const line = String(context || "")
    .split("\n")
    .find(item => item.toLowerCase().startsWith(label.toLowerCase() + ":"));
  return line ? line.slice(line.indexOf(":") + 1).trim() : "";
}

function fallbackResult(input: ElevateAiInput): LiftResult {
  const mission = input.mission.trim() || "what matters most to you";
  const desired = contextLine(input.context, "Desired outcome");
  const blocker = contextLine(input.context, "Biggest blocker");
  const usefulContext = contextLine(input.context, "Useful context");
  const outcomePhrase = desired || "a visible improvement you can verify";
  const blockerPhrase = blocker || "the gap between the goal and the next concrete action";
  const contextNote = usefulContext ? `\nCONTEXT TO HONOR: ${usefulContext}` : "";

  const actionCopy: Record<ElevateAction, {
    focus: string;
    friction: string;
    leverage: string;
    title: string;
    action: string;
    deliverableTitle: string;
    deliverable: string;
    path: string[];
  }> = {
    make: {
      focus: `Turn “${mission}” into a first version that directly moves you toward ${outcomePhrase}.`,
      friction: `The biggest drag appears to be ${blockerPhrase}. The idea needs a smaller working form before more features are added.`,
      leverage: "Define the smallest useful version someone could actually see, use, react to, or approve today.",
      title: "Build the smallest version worth showing",
      action: `Create a one-screen, one-page, one-message, or one-demo version of “${mission}” that proves the core value before you add extras.`,
      deliverableTitle: "First-version build sheet",
      deliverable: `FIRST VERSION\nProject: ${mission}\nTarget outcome: ${outcomePhrase}\n\nCORE PROMISE\nThis first version should help one specific person get one specific result.\n\nBUILD ONLY THESE 4 PIECES\n1. A clear title that says what this is.\n2. One sentence explaining who it helps and how.\n3. One proof/example/demo element.\n4. One obvious next action.\n\nDO NOT BUILD YET\nExtra features, multiple audiences, long explanations, or polish that does not improve understanding.\n\nFIRST TEST\nShow the version to one real person and ask: “What do you think this helps you do?”${contextNote}`,
      path: ["Finish the first working version today.", "Put it in front of one real person and capture their exact reaction.", "Improve only the part their reaction proves is unclear or weak."],
    },
    done: {
      focus: `Move “${mission}” from unfinished to a verifiable finish line tied to ${outcomePhrase}.`,
      friction: `The work is likely staying open because of ${blockerPhrase}. The task needs a visible definition of done, not more planning.`,
      leverage: "Choose the next status-changing action—the move that turns the project from planned to sent, posted, booked, approved, purchased, or completed.",
      title: "Cross one real finish line",
      action: `Write “DONE = ____” for “${mission},” then complete the smallest action that changes its real-world status within 20 minutes.`,
      deliverableTitle: "Finish-line map",
      deliverable: `DONE = “${mission} is complete enough to produce ${outcomePhrase}.”\n\nNOW — STATUS-CHANGING ACTION\nDo the one action that makes the project measurably more complete: send it, schedule it, publish it, submit it, confirm it, purchase the missing item, or hand it off.\n\nBLOCKER TO REMOVE\n${blockerPhrase}\n\nIF THAT BLOCKER CANNOT BE REMOVED TODAY\nCreate a workaround that keeps the project moving instead of waiting for perfect conditions.\n\nSTOP RULE\nDo not polish anything that is not preventing completion.${contextNote}`,
      path: ["Complete one action that changes the project's status.", "Remove or route around the main blocker.", "Ship the usable version before polishing."],
    },
    reach: {
      focus: `Make “${mission}” easier for the right people to understand, care about, and respond to so you can move toward ${outcomePhrase}.`,
      friction: `The message may be asking people to interpret too much, especially with ${blockerPhrase} in the way.`,
      leverage: "Use one simple promise, one audience, and one response request—then scale only the wording that earns a real reply.",
      title: "Create a message people can answer",
      action: `Send one clear message about “${mission}” to the single person most likely to understand the value, then use that response to sharpen the 5-person and 50-person versions.`,
      deliverableTitle: "1 / 5 / 50 outreach kit",
      deliverable: `MESSAGE CORE\n“I’m working on ${mission}. The goal is ${outcomePhrase}. I thought of you because this may be useful to you or someone you know. Would you like me to show you the simplest version?”\n\nFOR 1\nSend that message personally to the best-fit person. Do not add a long explanation.\n\nFOR 5\nPersonalize the first sentence for five people who have a clear reason to care. Ask for a reply, not a vague “check this out.”\n\nFOR 50\nTurn the strongest wording into a short post/email/QR message:\n“Trying to get ${outcomePhrase}? I’m testing a simple approach through ${mission}. Reply / scan / tap if you want to see it.”\n\nWHAT TO MEASURE\nReplies, questions, clicks, and requests for more—not impressions alone.${contextNote}`,
      path: ["Send the one-person version first.", "Rewrite using the language from real replies.", "Then expand to five and fifty without changing the core promise."],
    },
    earn: {
      focus: `Find the clearest value inside “${mission}” that could help a specific buyer get ${outcomePhrase}.`,
      friction: `The earning path is probably too broad because of ${blockerPhrase}. The first offer needs one buyer, one result, one scope, and one low-risk test.`,
      leverage: "Sell the outcome before building a large product, campaign, or system around it.",
      title: "Turn the idea into a testable offer",
      action: `Create one small paid or pre-commitment offer around the most useful result “${mission}” can create, then test it with a handful of qualified people before spending on promotion.`,
      deliverableTitle: "Offer + validation card",
      deliverable: `OFFER HYPOTHESIS\n“I help [specific person] get ${outcomePhrase} through ${mission}.”\n\nFIRST PAID VERSION\nKeep it narrow: one outcome, one defined deliverable, one simple price or commitment, one clear time frame.\n\nTEST MESSAGE\n“I’m testing a simple offer for people who want ${outcomePhrase}. It uses ${mission}. I’m looking for a few people to tell me whether this result is valuable enough to act on. Want the details?”\n\nVALIDATION RULE\nDo not treat likes as demand. Look for replies, requests for details, deposits, purchases, or explicit “yes, I would pay for that.”\n\nRISK CONTROL\nDo not spend meaningfully on ads, inventory, or automation until qualified people respond to the offer.${contextNote}`,
      path: ["Name the buyer, result, scope and first price/commitment.", "Test it with a small qualified audience.", "Only scale after real response proves what people value."],
    },
    better: {
      focus: `Improve “${mission}” in the specific way most likely to create ${outcomePhrase}.`,
      friction: `The current version may be losing clarity or action because of ${blockerPhrase}.`,
      leverage: "Improve the promise and next action before changing decoration, complexity, or feature count.",
      title: "Upgrade the highest-leverage piece",
      action: `Rewrite the main promise and next action for “${mission}” so a new person can understand the value in seconds and know exactly what to do next.`,
      deliverableTitle: "Before → better upgrade",
      deliverable: `BEFORE\n“Here is ${mission}.”\n\nBETTER CORE PROMISE\n“${mission} helps [specific person] get ${outcomePhrase} without [main friction, delay, confusion, or unnecessary step].”\n\nBETTER NEXT ACTION\n“Start here: [one clear action].”\n\nQUALITY CHECK\nA new visitor should be able to answer these three questions in under 10 seconds:\n1. What is this?\n2. Is it for me?\n3. What do I do next?\n\nIMPROVE NEXT\nOnly after those three answers are clear should you change visuals, add features, or expand the page.${contextNote}`,
      path: ["Rewrite the promise around the desired outcome.", "Make the next action unmistakable.", "Then improve visuals/features that support those two things."],
    },
    next: {
      focus: `Choose the next move for “${mission}” that creates the strongest evidence toward ${outcomePhrase}.`,
      friction: `The situation is likely being slowed by ${blockerPhrase}, which can make more planning feel safer than action.`,
      leverage: "Pick the move that creates new information—proof, completion, a reply, a customer reaction, a decision, or a usable asset.",
      title: "Make the move that changes the situation",
      action: `Within 20 minutes, take one action on “${mission}” that another person or system can see, answer, use, approve, reject, or verify.`,
      deliverableTitle: "Next-move decision card",
      deliverable: `YOUR TARGET\n${outcomePhrase}\n\nDO NOW\nChoose one visible action that creates new information about “${mission}.” Examples: send the draft, contact the buyer, publish the test, ask for the decision, build the first sample, schedule the meeting, or verify the missing fact.\n\nDO NEXT\nUse what happens—not what you guessed would happen—to choose move #2.\n\nDO NOT\nCreate another long plan, redesign everything, or add new features before move #1 produces evidence.\n\nDECISION RULE\nPrefer the action that teaches you the most while risking the least.${contextNote}`,
      path: ["Create one visible, verifiable movement today.", "Use the response/result to choose the second move.", "Repeat until the goal becomes a chain of completed outcomes."],
    },
  };

  const item = actionCopy[input.action];
  return {
    source: "structured",
    title: `Your Lift: ${item.title}`,
    readout: {
      focus: item.focus,
      friction: item.friction,
      leverage: item.leverage,
    },
    firstMove: {
      title: item.title,
      why: item.leverage,
      action: item.action,
      timebox: "10–20 minutes",
    },
    deliverable: {
      title: item.deliverableTitle,
      content: item.deliverable,
    },
    path: item.path,
    boost: "You do not need the whole answer today. You need one useful change in direction, something concrete to use, and the next move after that.",
    steps: item.path.slice(0, 3),
    result: item.deliverable,
  };
}

function textFromResponse(payload: any) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) return payload.output_text.trim();
  for (const item of payload?.output || []) {
    for (const part of item?.content || []) {
      if (part?.type === "output_text" && typeof part.text === "string") return part.text.trim();
    }
  }
  return "";
}

function safeString(value: unknown, max: number) {
  return String(value || "").trim().slice(0, max);
}


function missionTerms(mission: string) {
  return mission
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length >= 4)
    .filter(word => !new Set(["this","that","with","from","have","want","need","more","what","your","about","into","some","just","really"]).has(word))
    .slice(0, 12);
}

function liftQuality(input: ElevateAiInput, result: LiftResult) {
  let score = 0;
  const combined = [
    result.title,
    result.readout.focus,
    result.readout.friction,
    result.readout.leverage,
    result.firstMove.title,
    result.firstMove.why,
    result.firstMove.action,
    result.deliverable.title,
    result.deliverable.content,
    result.path.join(" "),
  ].join(" ").toLowerCase();

  const terms = missionTerms(input.mission);
  const matchedTerms = terms.filter(term => combined.includes(term)).length;
  const specificityRatio = terms.length ? matchedTerms / terms.length : 1;

  if (result.readout.focus.length >= 45) score += 10;
  if (result.readout.friction.length >= 45) score += 8;
  if (result.readout.leverage.length >= 45) score += 10;
  if (result.firstMove.action.length >= 55) score += 12;
  if (result.firstMove.why.length >= 40) score += 8;
  if (result.deliverable.content.length >= 260) score += 18;
  if (result.deliverable.content.length >= 520) score += 8;
  if (result.path.length === 3 && result.path.every(item => item.length >= 24)) score += 10;
  if (specificityRatio >= .45) score += 10;
  if (specificityRatio >= .70) score += 4;

  const modeSignals: Record<ElevateAction, string[]> = {
    make: ["version","build","draft","blueprint","create"],
    done: ["done","finish","complete","checklist","blocker"],
    reach: ["message","send","audience","1","5","50"],
    earn: ["offer","customer","value","test","pay"],
    better: ["before","better","improve","rewrite","upgrade"],
    next: ["next","priority","now","first","move"],
  };
  if (modeSignals[input.action].some(signal => combined.includes(signal))) score += 7;

  const genericPhrases = [
    "believe in yourself",
    "stay positive",
    "take it one step at a time",
    "you've got this",
    "keep going",
    "set smart goals",
  ];
  if (genericPhrases.some(phrase => combined.includes(phrase))) score -= 12;

  return Math.max(0, Math.min(100, score));
}

function parseLiftPayload(input: ElevateAiInput, payload: any): LiftResult | null {
  const raw = textFromResponse(payload);
  if (!raw) return null;
  const cleaned = raw.replace(/^\`\`\`json\s*/i, "").replace(/\`\`\`$/i, "").trim();

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return null;
  }

  if (!parsed?.readout || !parsed?.firstMove || !parsed?.deliverable || !Array.isArray(parsed?.path)) {
    return null;
  }

  const path = parsed.path.slice(0, 3).map((x: unknown) => safeString(x, 900));
  if (path.length < 3) return null;

  return {
    source: "ai",
    title: safeString(parsed.title || "Your Elevation", 140),
    readout: {
      focus: safeString(parsed.readout.focus, 900),
      friction: safeString(parsed.readout.friction, 900),
      leverage: safeString(parsed.readout.leverage, 900),
    },
    firstMove: {
      title: safeString(parsed.firstMove.title, 180),
      why: safeString(parsed.firstMove.why, 900),
      action: safeString(parsed.firstMove.action, 1400),
      timebox: safeString(parsed.firstMove.timebox || "20 minutes", 120),
    },
    deliverable: {
      title: safeString(parsed.deliverable.title || "Made for you", 180),
      content: safeString(parsed.deliverable.content, 6500),
    },
    path,
    boost: safeString(parsed.boost, 600),
    steps: path,
    result: safeString(parsed.deliverable.content, 6500),
    usage: payload?.usage ? {
      inputTokens: Number(payload.usage.input_tokens || 0),
      outputTokens: Number(payload.usage.output_tokens || 0),
      totalTokens: Number(payload.usage.total_tokens || 0),
      model: process.env.ELEVATE_AI_MODEL || "gpt-5.6-luna",
    } : undefined,
  };
}

export async function generateElevateAction(input: ElevateAiInput): Promise<LiftResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallbackResult(input);

  const mission = input.mission.trim() || "what matters most to you";
  const context = (input.context || "").trim().slice(0, 3000);
  const mode = input.mode || "activated";

  const instructions = `You are Elevate Me Bot, a premium action-oriented AI experience inside the Seriously Satisfying HUB.
Your job is to make the user feel an immediate, concrete lift. Do not give generic encouragement and do not return a thin three-sentence plan.
Analyze what the user actually said, find the highest-leverage move, and make something useful for them now.

Return ONLY valid JSON with this exact shape:
{
  "title":"specific short title",
  "readout":{
    "focus":"what the user is really trying to change",
    "friction":"the most important obstacle or gap you can infer from the supplied information without pretending certainty",
    "leverage":"the most useful point of leverage"
  },
  "firstMove":{
    "title":"short action title",
    "why":"why this move matters",
    "action":"a specific action the user can actually take",
    "timebox":"realistic short timebox"
  },
  "deliverable":{
    "title":"name of the ready-to-use item you made",
    "content":"a substantial ready-to-use draft, script, message, checklist, offer, outline, decision aid, or other concrete asset"
  },
  "path":["today or first move","next 48 hours or next move","after that"],
  "boost":"one concise sentence that feels energizing without hype"
}

Rules:
- Make the response specific to the user's words.
- The deliverable is the heart of the experience. It must be genuinely usable, not advice about what to create.
- For MAKE: produce a first-version asset or blueprint.
- For DONE: produce a completion map/checklist and the exact first action.
- For REACH: produce actual outreach wording and a 1 / 5 / 50 path.
- For EARN: produce a clear value/offer hypothesis and a small validation test; never promise earnings.
- For BETTER: produce a concrete before/after improvement or rewritten core element.
- For NEXT: make a decision and give a prioritized move with a useful artifact.
- Use headings and line breaks inside deliverable.content when helpful.
- Do not claim outside actions were completed.
- Do not invent personal facts.
- If information is missing, make a reasonable provisional assumption and label it as such.
- Keep the total response under 900 words.
- This is ${mode === "preview" ? "a free preview that must be strong enough to demonstrate the Bot's real value" : "an activated Bot action that should feel deeper than the preview"}.`;

  const prompt = [
    `Action: ${input.action}`,
    `Mission: ${mission}`,
    input.botName ? `Bot name: ${input.botName}` : "",
    context ? `User context:\n${context}` : "",
  ].filter(Boolean).join("\n\n");

  try {
    const runModel = async (extraInstruction = "", extraInput = "") => {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.ELEVATE_AI_MODEL || "gpt-5.6-luna",
          instructions: extraInstruction ? `${instructions}\n\n${extraInstruction}` : instructions,
          input: extraInput ? `${prompt}\n\n${extraInput}` : prompt,
          max_output_tokens: 1600,
          store: false,
        }),
        cache: "no-store",
      });
      if (!response.ok) return null;
      return response.json();
    };

    const firstPayload = await runModel();
    if (!firstPayload) return fallbackResult(input);

    let result = parseLiftPayload(input, firstPayload);
    if (!result) return fallbackResult(input);

    let quality = liftQuality(input, result);

    if (quality < 72) {
      const repairInstruction = `QUALITY REPAIR PASS:
The first draft was too weak for a flagship Elevate Me Bot experience.
Rewrite it with substantially more specificity and utility.
Make the deliverable immediately usable, not generic advice.
Anchor the answer in the user's actual mission and supplied context.
Keep the same JSON schema and stay under 900 words.
Do not mention this repair pass or any quality score to the user.`;

      const repairInput = `Weak draft to replace:\n${JSON.stringify({
        title: result.title,
        readout: result.readout,
        firstMove: result.firstMove,
        deliverable: result.deliverable,
        path: result.path,
        boost: result.boost,
      })}`;

      const repairedPayload = await runModel(repairInstruction, repairInput);
      const repaired = repairedPayload ? parseLiftPayload(input, repairedPayload) : null;
      if (repaired) {
        const repairedQuality = liftQuality(input, repaired);
        if (repairedQuality >= quality) {
          result = repaired;
          quality = repairedQuality;
        }
      }
    }

    console.log("ELEVATE_LIFT_QUALITY " + JSON.stringify({
      action: input.action,
      mode,
      quality,
      source: result.source,
      repaired: quality >= 72,
    }));

    return result;
  } catch {
    return fallbackResult(input);
  }
}
