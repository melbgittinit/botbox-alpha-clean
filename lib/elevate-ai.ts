type ElevateAction = "make" | "done" | "reach" | "earn" | "better" | "next";

type ElevateAiInput = {
  action: ElevateAction;
  mission: string;
  botName?: string;
  context?: string;
};

const fallback: Record<ElevateAction, (mission: string) => string[]> = {
  make: mission => [
    `Create one useful thing today around “${mission}.”`,
    "Keep it small enough to finish in 15 minutes.",
    "When it is ready, use SEND IT to put it in front of someone.",
  ],
  done: mission => [
    `Pick the smallest unfinished step connected to “${mission}.”`,
    "Complete that step before adding another.",
    "Mark it done, then ask your Bot for the next move.",
  ],
  reach: mission => [
    `Choose one useful message about “${mission}.”`,
    "Prepare one version for 1 person, one for 5, and one for 50.",
    "Share the smallest version first and learn from the response.",
  ],
  earn: mission => [
    `Identify one honest way “${mission}” could help someone else.`,
    "Package that value in one clear sentence.",
    "Use your share path or Earn Mode connection to test interest.",
  ],
  better: mission => [
    `Choose one existing item connected to “${mission}.”`,
    "Make the headline clearer and the next action easier.",
    "Save the improved version before creating anything new.",
  ],
  next: mission => [
    `Today’s move: make one visible step toward “${mission}.”`,
    "Do not build the whole plan—complete one useful action.",
    "Return after completion and let your Bot choose the next move.",
  ],
};

function fallbackResult(input: ElevateAiInput) {
  const mission = input.mission.trim() || "what matters most to you";
  return {
    source: "structured" as const,
    title: "Your next Elevation",
    steps: fallback[input.action](mission),
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

export async function generateElevateAction(input: ElevateAiInput) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallbackResult(input);

  const mission = input.mission.trim() || "what matters most to you";
  const context = (input.context || "").trim().slice(0, 3000);

  const instructions = `You are Elevate Me Bot, a concise action-oriented personal AI assistant.
Your job is to produce one immediately useful Elevation, not generic encouragement.
Keep cost and verbosity low. Return ONLY valid JSON with this shape:
{"title":"short title","steps":["step 1","step 2","step 3"],"result":"optional ready-to-use output"}
Rules:
- Exactly 3 steps.
- Each step must be specific and executable.
- Prefer a finished useful output over advice when the action asks to make, improve, reach, or earn.
- Do not claim actions were completed outside the system.
- Keep total response under 350 words.`;

  const prompt = [
    `Action: ${input.action}`,
    `Mission: ${mission}`,
    input.botName ? `Bot name: ${input.botName}` : "",
    context ? `User context or source material:\n${context}` : "",
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
        max_output_tokens: 550,
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
    if (!Array.isArray(parsed.steps) || parsed.steps.length < 3) return fallbackResult(input);

    return {
      source: "ai" as const,
      title: String(parsed.title || "Your next Elevation").slice(0, 120),
      steps: parsed.steps.slice(0, 3).map((x: unknown) => String(x).slice(0, 900)),
      result: parsed.result ? String(parsed.result).slice(0, 4000) : undefined,
    };
  } catch {
    return fallbackResult(input);
  }
}
