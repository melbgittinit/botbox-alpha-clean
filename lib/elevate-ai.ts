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
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.ELEVATE_AI_MODEL || "gpt-5.6-luna",
        instructions,
        input: prompt,
        max_output_tokens: 1400,
        store: false,
      }),
      cache: "no-store",
    });

    if (!response.ok) return fallbackResult(input);
    const payload = await response.json();
    const raw = textFromResponse(payload);
    if (!raw) return fallbackResult(input);

    const cleaned = raw.replace(/^\`\`\`json\s*/i, "").replace(/\`\`\`$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    if (!parsed?.readout || !parsed?.firstMove || !parsed?.deliverable || !Array.isArray(parsed?.path)) {
      return fallbackResult(input);
    }

    const path = parsed.path.slice(0, 3).map((x: unknown) => safeString(x, 900));
    const result: LiftResult = {
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
    return result;
  } catch {
    return fallbackResult(input);
  }
}
