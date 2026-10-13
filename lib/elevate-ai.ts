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

function fallbackResult(input: ElevateAiInput): LiftResult {
  const mission = input.mission.trim() || "what matters most to you";
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
      focus: `Turn “${mission}” into one finished, visible first version.`,
      friction: "The idea is still larger than the first useful thing that can be completed.",
      leverage: "Reduce the scope until something real can be finished and shown today.",
      title: "Build the smallest version worth showing",
      action: `Create one concrete first version of “${mission}” with a clear beginning, middle and finish.`,
      deliverableTitle: "Starter blueprint",
      deliverable: `FIRST VERSION\nName: ${mission}\nPromise: One useful result for one specific person.\nBuild only: the core idea, one proof/example, and one clear next action.\nLeave everything else for version two.`,
      path: ["Finish the first version today.", "Show it to one real person and collect one reaction.", "Improve only what that reaction proves matters."],
    },
    done: {
      focus: `Move “${mission}” from unfinished to visibly completed.`,
      friction: "The work is probably being experienced as one large task instead of a sequence of finishable moves.",
      leverage: "Define the finish line, then complete only the next physical action.",
      title: "Create a finish line you can cross",
      action: `Write the exact sentence that proves “${mission}” is done, then complete the smallest action that makes that sentence more true.`,
      deliverableTitle: "Completion map",
      deliverable: `DONE LOOKS LIKE: ${mission} is complete enough to use, send, publish, book, or hand off.\nNOW: Do the smallest action that changes its status.\nNEXT: Remove the biggest blocker.\nLATER: Polish only after the working version exists.`,
      path: ["Complete one status-changing action now.", "Remove one blocker next.", "Finish and ship before polishing."],
    },
    reach: {
      focus: `Make “${mission}” easy for the right people to understand and respond to.`,
      friction: "A broad message often asks the audience to do too much interpretation.",
      leverage: "Say one useful thing to one specific person, then scale the same message outward.",
      title: "Make the message easier to answer",
      action: `Write one sentence that says who “${mission}” helps, what changes for them, and what they should do next.`,
      deliverableTitle: "1 / 5 / 50 outreach starter",
      deliverable: `FOR 1: “I thought of you because I’m working on ${mission}. If this would help, I can show you the simplest version.”\n\nFOR 5: Send the same idea personally to five people most likely to care.\n\nFOR 50: Turn the strongest response into a short post, email, QR card, or announcement.`,
      path: ["Send to one person first.", "Use their response to sharpen the wording.", "Only then expand to five and fifty."],
    },
    earn: {
      focus: `Find the clearest value inside “${mission}” that another person may willingly pay for.`,
      friction: "The earning idea may still be described as a project rather than a useful outcome.",
      leverage: "Package one outcome, one buyer, one simple offer, and one low-risk test.",
      title: "Turn the idea into a testable offer",
      action: `Describe one useful outcome “${mission}” can create for one specific customer and make a small offer around that outcome.`,
      deliverableTitle: "Offer starter",
      deliverable: `OFFER: “I help [specific person] get [specific result] through ${mission}.”\nSTART SMALL: Offer one clearly defined version before adding extras.\nTEST: Ask a few qualified people whether the result matters to them before spending on promotion.`,
      path: ["Name the buyer and result.", "Test the offer with a small qualified audience.", "Improve the offer from real response before scaling."],
    },
    better: {
      focus: `Improve the part of “${mission}” that most affects understanding or action.`,
      friction: "Improvement becomes expensive when everything is changed at once.",
      leverage: "Clarify the promise and next action before adding more features or decoration.",
      title: "Improve the highest-leverage piece first",
      action: `Rewrite the main promise of “${mission}” so a new person can understand the value and next step in seconds.`,
      deliverableTitle: "Clarity upgrade",
      deliverable: `BEFORE: “Here is ${mission}.”\nBETTER: “${mission} helps [specific person] get [specific result]. Start here: [one clear action].”\nUse that sentence to judge every headline, button and next step.`,
      path: ["Clarify the promise.", "Make the next action obvious.", "Then improve visuals or features that support those two things."],
    },
    next: {
      focus: `Choose the next move that creates visible momentum for “${mission}.”`,
      friction: "Too many possible moves can make planning feel like progress while nothing changes.",
      leverage: "Choose the action that creates proof, feedback, completion, or a customer response.",
      title: "Choose the move that changes the situation",
      action: `Within the next 20 minutes, do one action for “${mission}” that another person could see, use, answer, or verify.`,
      deliverableTitle: "Momentum card",
      deliverable: `DO NOW: One visible, verifiable action.\nDO NEXT: Use the result to choose the second move.\nDO NOT: Add another large plan until the first action creates new information.`,
      path: ["Create visible movement today.", "Use what happened to choose the next move.", "Repeat until the goal becomes a sequence of completed outcomes."],
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
    boost: "You do not need the whole answer today. You need a useful change in direction that you can see and build on.",
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
