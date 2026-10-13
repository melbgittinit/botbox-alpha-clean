"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Need = "make" | "done" | "reach" | "earn" | "better" | "next";
type Surface = "hub" | "botstores";
type LiftResult = {
  source: "ai" | "structured";
  title: string;
  readout: { focus: string; friction: string; leverage: string };
  firstMove: { title: string; why: string; action: string; timebox: string };
  deliverable: { title: string; content: string };
  path: string[];
  boost: string;
  steps?: string[];
  result?: string;
};

type ElevateAccess = {
  authenticated: boolean;
  level: "CUSTOMIZE" | "ACTIVATE" | "POWER_UP" | "MAKE_IT_REAL";
  entitlements: {
    activated: boolean;
    powerUp: boolean;
    makeItReal: boolean;
    giftCreditsPurchased: number;
  };
};

const checkout = {
  gift: "https://urbanspirit.biz/products/elevate-me-bot-activation-power-levels?variant=53879074357541",
};

const BOT_IMAGE = "https://cdn.shopify.com/s/files/1/1982/3607/files/Elevate_Me_Bot__A_Brighter_You_1.jpg?v=1790122086";

const needs: { id: Need; label: string; hint: string }[] = [
  { id: "make", label: "Make Something", hint: "Turn the idea into a first useful version." },
  { id: "done", label: "Get It Done", hint: "Break through the thing that is stuck." },
  { id: "reach", label: "Reach My People", hint: "Create the message and path to the right audience." },
  { id: "earn", label: "Earn Something", hint: "Find the clearest value and a testable offer." },
  { id: "better", label: "Make It Better", hint: "Improve the part that matters most." },
  { id: "next", label: "My Next Move", hint: "Choose the move that creates momentum now." },
];

const quickStarts: { label: string; need: Need; mission: string; outcome: string; blocker: string; context: string }[] = [
  {
    label: "GET MORE CUSTOMERS",
    need: "reach",
    mission: "I have a good local business, but not enough of the right people are responding.",
    outcome: "A clearer message and a practical way to reach more likely customers this week.",
    blocker: "People may not immediately understand why they should choose me or act now.",
    context: "Use a small-budget, relationship-first approach before recommending paid promotion.",
  },
  {
    label: "TURN AN IDEA INTO MONEY",
    need: "earn",
    mission: "I have an idea or skill that could help people, but I have not turned it into a simple offer yet.",
    outcome: "One clear offer I can test without spending a lot of money.",
    blocker: "The idea feels too broad and I am not sure what somebody would actually pay for.",
    context: "Keep the first test small, honest and low-risk. Do not assume demand until it is tested.",
  },
  {
    label: "GET UNSTUCK TODAY",
    need: "done",
    mission: "I have something important I keep putting off and I need visible progress today.",
    outcome: "A finish line and one action I can complete in the next 20 minutes.",
    blocker: "The task feels too large and I keep planning instead of finishing.",
    context: "Prioritize a status-changing action over polishing or adding more ideas.",
  },
];

const modeConfig: Record<Need, {
  mode: string;
  verb: string;
  outputLabel: string;
  pathLabel: string;
  accent: string;
  glow: string;
}> = {
  make: {
    mode: "MAKE STUDIO",
    verb: "BUILDING",
    outputLabel: "FIRST VERSION MADE FOR YOU",
    pathLabel: "BUILD PATH",
    accent: "#f3c969",
    glow: "rgba(243,201,105,.16)",
  },
  done: {
    mode: "DONE ENGINE",
    verb: "UNBLOCKING",
    outputLabel: "COMPLETION TOOL",
    pathLabel: "FINISH PATH",
    accent: "#78e6df",
    glow: "rgba(120,230,223,.15)",
  },
  reach: {
    mode: "REACH AMPLIFIER",
    verb: "AMPLIFYING",
    outputLabel: "READY-TO-SEND ASSET",
    pathLabel: "1 / 5 / 50 PATH",
    accent: "#83d7ff",
    glow: "rgba(131,215,255,.15)",
  },
  earn: {
    mode: "EARN LAB",
    verb: "TESTING VALUE",
    outputLabel: "OFFER / EARNING TEST",
    pathLabel: "VALUE PATH",
    accent: "#f3c969",
    glow: "rgba(243,201,105,.17)",
  },
  better: {
    mode: "BETTER BENCH",
    verb: "IMPROVING",
    outputLabel: "UPGRADED VERSION",
    pathLabel: "IMPROVEMENT PATH",
    accent: "#bba5ff",
    glow: "rgba(187,165,255,.16)",
  },
  next: {
    mode: "NEXT MOVE RADAR",
    verb: "PRIORITIZING",
    outputLabel: "DECISION + STARTER",
    pathLabel: "MOMENTUM PATH",
    accent: "#78e6df",
    glow: "rgba(120,230,223,.15)",
  },
};


const hubDoors: Record<Need, { title: string; copy: string; href: string; eyebrow: string }[]> = {
  make: [
    { title: "Creator Flow", copy: "Keep building what the Bot just helped you start.", href: "https://urbanspirit.biz/pages/creator-flow", eyebrow: "BUILD" },
    { title: "Creator Lab", copy: "Move from idea to a more developed maker path.", href: "https://urbanspirit.biz/pages/creator-lab", eyebrow: "MAKE" },
    { title: "Musicverse", copy: "Enter a creative world when sound, story or atmosphere can help the idea grow.", href: "https://urbanspirit.biz/pages/musicverse", eyebrow: "EXPERIENCE" },
  ],
  done: [
    { title: "RESET", copy: "Clear noise and rebuild momentum around what matters most.", href: "https://urbanspirit.biz/pages/start-your-free-2-day-reset", eyebrow: "RESET" },
    { title: "Creator Flow", copy: "Turn the next action into a simple working sequence.", href: "https://urbanspirit.biz/pages/creator-flow", eyebrow: "MOVE" },
    { title: "Explore the HUB", copy: "Open the wider HUB only after you have your next move.", href: "https://urbanspirit.biz/pages/world-mode", eyebrow: "OPEN" },
  ],
  reach: [
    { title: "Earn Mode", copy: "Connect your message to a tracked earning path when it fits.", href: "https://urbanspirit.biz/pages/earn-mode", eyebrow: "NOW ADD" },
    { title: "The Bot Factory", copy: "Turn outreach or media ideas into specialized tools.", href: "https://urbanspirit.biz/pages/bot-factory-media-door", eyebrow: "AMPLIFY" },
    { title: "Explore the HUB", copy: "Move into broader audience and experience worlds.", href: "https://urbanspirit.biz/pages/world-mode", eyebrow: "EXPAND" },
  ],
  earn: [
    { title: "Earn Mode", copy: "Take the value test you just created into the HUB earning engine.", href: "https://urbanspirit.biz/pages/earn-mode", eyebrow: "NOW ADD" },
    { title: "SHOP BOT", copy: "Explore a business-focused Bot path for products and selling.", href: "https://urbanspirit.biz/pages/shop-bot", eyebrow: "SELL" },
    { title: "Creator Flow", copy: "Build the offer or asset before you scale it.", href: "https://urbanspirit.biz/pages/creator-flow", eyebrow: "BUILD" },
  ],
  better: [
    { title: "Creator Flow", copy: "Keep improving the thing you already have.", href: "https://urbanspirit.biz/pages/creator-flow", eyebrow: "REFINE" },
    { title: "Musicverse", copy: "Use sound and creative worlds to elevate presentation and feeling.", href: "https://urbanspirit.biz/pages/musicverse", eyebrow: "FEEL" },
    { title: "Explore the HUB", copy: "Find another HUB world that matches what you are improving.", href: "https://urbanspirit.biz/pages/world-mode", eyebrow: "EXPLORE" },
  ],
  next: [
    { title: "Explore the HUB", copy: "Let the HUB open around the direction the Bot just uncovered.", href: "https://urbanspirit.biz/pages/world-mode", eyebrow: "YOUR HUB" },
    { title: "Earn Mode", copy: "If the next move is commercial, continue into Earn Mode.", href: "https://urbanspirit.biz/pages/earn-mode", eyebrow: "EARN" },
    { title: "RESET", copy: "If the next move is personal clarity, enter a Reset path.", href: "https://urbanspirit.biz/pages/start-your-free-2-day-reset", eyebrow: "RESET" },
  ],
};

const card: React.CSSProperties = {
  background: "linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.045))",
  border: "1px solid rgba(255,255,255,.16)",
  borderRadius: 26,
  boxShadow: "0 26px 80px rgba(0,0,0,.28)",
};

const button: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px 19px",
  borderRadius: 999,
  border: 0,
  textDecoration: "none",
  fontWeight: 900,
  cursor: "pointer",
};


function ModeVisual({ need, accent, running }: { need: Need; accent: string; running: boolean }) {
  const shell: React.CSSProperties = {
    position: "absolute",
    right: 18,
    top: 18,
    width: 150,
    height: 104,
    borderRadius: 18,
    border: `1px solid ${accent}55`,
    background: "rgba(2,7,12,.66)",
    backdropFilter: "blur(10px)",
    overflow: "hidden",
    pointerEvents: "none",
    opacity: running ? 1 : .86,
    transition: "opacity .3s ease",
  };

  if (need === "make") {
    return (
      <div style={shell}>
        <div style={{ position: "absolute", inset: 10, backgroundImage: `linear-gradient(${accent}20 1px,transparent 1px),linear-gradient(90deg,${accent}20 1px,transparent 1px)`, backgroundSize: "16px 16px" }} />
        {[0,1,2].map(i => <div key={i} style={{ position: "absolute", left: 18 + i * 34, top: 24 + i * 14, width: 34, height: 24, border: `1px solid ${accent}99`, borderRadius: 6, background: `${accent}18`, animation: running ? `modeBuild 1.8s ${i * .18}s ease-in-out infinite alternate` : undefined }} />)}
        <div style={{ position: "absolute", left: 14, bottom: 9, color: accent, fontSize: 9, fontWeight: 900, letterSpacing: ".12em" }}>BLUEPRINT LIVE</div>
      </div>
    );
  }

  if (need === "done") {
    return (
      <div style={shell}>
        {[0,1,2].map(i => (
          <div key={i} style={{ position: "absolute", left: 16, right: 14, top: 18 + i * 24, height: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 16, height: 16, borderRadius: 5, border: `1px solid ${accent}`, display: "grid", placeItems: "center", color: accent, fontSize: 11, animation: running ? `modeCheck 2.2s ${i * .3}s ease-in-out infinite` : undefined }}>✓</div>
            <div style={{ height: 5, flex: 1, borderRadius: 999, background: i === 2 ? `${accent}45` : `${accent}70` }} />
          </div>
        ))}
        <div style={{ position: "absolute", left: 14, bottom: 7, color: accent, fontSize: 9, fontWeight: 900, letterSpacing: ".12em" }}>FINISH LINE</div>
      </div>
    );
  }

  if (need === "reach") {
    return (
      <div style={shell}>
        {[72,50,28].map((size, i) => <div key={size} style={{ position: "absolute", left: 75 - size / 2, top: 46 - size / 2, width: size, height: size, borderRadius: "50%", border: `1px solid ${accent}`, opacity: .75 - i * .15, animation: running ? `modePulse ${1.7 + i * .25}s ease-out infinite` : undefined }} />)}
        <div style={{ position: "absolute", left: 69, top: 40, width: 12, height: 12, borderRadius: "50%", background: accent, boxShadow: `0 0 18px ${accent}` }} />
        <div style={{ position: "absolute", left: 14, bottom: 7, color: accent, fontSize: 9, fontWeight: 900, letterSpacing: ".12em" }}>1 • 5 • 50</div>
      </div>
    );
  }

  if (need === "earn") {
    return (
      <div style={shell}>
        {[24,44,62,82].map((h, i) => <div key={h} style={{ position: "absolute", bottom: 24, left: 24 + i * 24, width: 14, height: h * .65, borderRadius: "5px 5px 2px 2px", background: `linear-gradient(180deg,${accent},${accent}45)`, transformOrigin: "bottom", animation: running ? `modeBars 1.8s ${i * .12}s ease-in-out infinite alternate` : undefined }} />)}
        <div style={{ position: "absolute", right: 18, top: 18, color: accent, fontSize: 22, fontWeight: 900 }}>↗</div>
        <div style={{ position: "absolute", left: 14, bottom: 7, color: accent, fontSize: 9, fontWeight: 900, letterSpacing: ".12em" }}>VALUE SIGNAL</div>
      </div>
    );
  }

  if (need === "better") {
    return (
      <div style={shell}>
        <div style={{ position: "absolute", left: 14, top: 16, width: 46, height: 62, borderRadius: 9, border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.035)" }}>
          <div style={{ margin: 8, height: 5, background: "rgba(255,255,255,.22)", borderRadius: 999 }} />
          <div style={{ margin: "0 8px", height: 5, width: 22, background: "rgba(255,255,255,.14)", borderRadius: 999 }} />
        </div>
        <div style={{ position: "absolute", left: 67, top: 37, color: accent, fontSize: 22, animation: running ? "modeArrow 1.3s ease-in-out infinite alternate" : undefined }}>→</div>
        <div style={{ position: "absolute", right: 14, top: 16, width: 46, height: 62, borderRadius: 9, border: `1px solid ${accent}`, background: `${accent}16`, boxShadow: running ? `0 0 22px ${accent}25` : undefined }}>
          <div style={{ margin: 8, height: 5, background: accent, borderRadius: 999 }} />
          <div style={{ margin: "0 8px", height: 5, width: 28, background: `${accent}90`, borderRadius: 999 }} />
        </div>
        <div style={{ position: "absolute", left: 14, bottom: 7, color: accent, fontSize: 9, fontWeight: 900, letterSpacing: ".12em" }}>BEFORE → BETTER</div>
      </div>
    );
  }

  return (
    <div style={shell}>
      <div style={{ position: "absolute", left: 34, top: 12, width: 76, height: 76, borderRadius: "50%", border: `1px solid ${accent}88`, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 10, borderRadius: "50%", border: `1px solid ${accent}45` }} />
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 38, height: 1, background: `linear-gradient(90deg,${accent},transparent)`, transformOrigin: "0 0", animation: running ? "modeRadar 2s linear infinite" : undefined }} />
        <div style={{ position: "absolute", right: 15, top: 22, width: 6, height: 6, borderRadius: "50%", background: accent, boxShadow: `0 0 12px ${accent}` }} />
      </div>
      <div style={{ position: "absolute", left: 14, bottom: 7, color: accent, fontSize: 9, fontWeight: 900, letterSpacing: ".12em" }}>NEXT MOVE LOCKED</div>
    </div>
  );
}

function getElevateCycleKey() {
  try {
    const params = new URLSearchParams(window.location.search);
    const incoming = (params.get("elv") || "").trim().toUpperCase();
    if (/^ELV-\d{8}-[A-Z0-9]{2,12}$/.test(incoming)) {
      localStorage.setItem("elevate_cycle_key", JSON.stringify({ key: incoming, at: Date.now() }));
      return incoming;
    }
    const raw = localStorage.getItem("elevate_cycle_key");
    if (!raw) return null;
    const saved = JSON.parse(raw);
    const key = String(saved?.key || "").trim().toUpperCase();
    const at = Number(saved?.at || 0);
    if (/^ELV-\d{8}-[A-Z0-9]{2,12}$/.test(key) && at > 0 && Date.now() - at <= 7 * 24 * 60 * 60 * 1000) return key;
    localStorage.removeItem("elevate_cycle_key");
    return null;
  } catch {
    return null;
  }
}

function getElevateSessionId() {
  try {
    const existing = localStorage.getItem("elevate_measurement_session");
    if (existing) return existing;
    const created = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `elevate-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("elevate_measurement_session", created);
    return created;
  } catch {
    return `elevate-${Date.now()}`;
  }
}

function trackElevateEvent(
  eventType: string,
  surface: Surface,
  offer?: "activate" | "gift" | "power" | "real",
  payload?: Record<string, string | number | boolean | null>
) {
  try {
    const params = new URLSearchParams(window.location.search);
    void fetch("/api/elevate/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        eventType,
        sessionId: getElevateSessionId(),
        cycleKey: getElevateCycleKey(),
        surface,
        offer,
        channel: params.get("utm_medium") || "direct",
        source: params.get("utm_source") || "direct",
        payload: { utm_campaign: params.get("utm_campaign"), ...payload },
      }),
    });
  } catch {}
}

export default function ElevateMeBotPage() {
  const [botName, setBotName] = useState("Nova");
  const [mission, setMission] = useState("");
  const [outcome, setOutcome] = useState("");
  const [blocker, setBlocker] = useState("");
  const [context, setContext] = useState("");
  const [need, setNeed] = useState<Need>("next");
  const [surface, setSurface] = useState<Surface>("hub");
  const [lift, setLift] = useState<LiftResult | null>(null);
  const [runningAction, setRunningAction] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [previewMessage, setPreviewMessage] = useState("");
  const [previewsRemaining, setPreviewsRemaining] = useState<number | null>(null);
  const [access, setAccess] = useState<ElevateAccess>({
    authenticated: false,
    level: "CUSTOMIZE",
    entitlements: { activated: false, powerUp: false, makeItReal: false, giftCreditsPurchased: 0 },
  });
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceTarget, setVoiceTarget] = useState<"mission" | "outcome" | "blocker" | "context">("mission");
  const [quickStartUsed, setQuickStartUsed] = useState(false);
  const recognitionRef = useRef<any>(null);

  const processingLabels = [
    "Reading what you really want to change…",
    "Finding the highest-leverage opening…",
    "Building something useful for you now…",
    "Packaging your first Lift…",
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const entrySurface: Surface = params.get("surface") === "botstores" ? "botstores" : "hub";
    setSurface(entrySurface);
    trackElevateEvent("page_view", entrySurface, undefined, { path: window.location.pathname });
    fetch("/api/elevate/entitlements", { cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error("NOT_AUTHENTICATED");
        return response.json();
      })
      .then(data => setAccess(data))
      .catch(() => setAccess({
        authenticated: false,
        level: "CUSTOMIZE",
        entitlements: { activated: false, powerUp: false, makeItReal: false, giftCreditsPurchased: 0 },
      }))
      .finally(() => setCheckingAccess(false));

    try {
      const saved = localStorage.getItem("elevate_me_bot_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.botName) setBotName(parsed.botName);
        if (parsed.mission) setMission(parsed.mission);
        if (parsed.outcome) setOutcome(parsed.outcome);
        if (parsed.blocker) setBlocker(parsed.blocker);
        if (parsed.context) setContext(parsed.context);
        if (parsed.need) setNeed(parsed.need);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!runningAction) {
      setProcessingStep(0);
      return;
    }
    const timer = window.setInterval(() => {
      setProcessingStep(current => Math.min(current + 1, processingLabels.length - 1));
    }, 900);
    return () => window.clearInterval(timer);
  }, [runningAction]);


  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setVoiceSupported(Boolean(SpeechRecognition));
    return () => {
      try { recognitionRef.current?.stop?.(); } catch {}
      try { window.speechSynthesis?.cancel(); } catch {}
    };
  }, []);

  function addVoiceText(target: "mission" | "outcome" | "blocker" | "context", transcript: string) {
    const clean = transcript.trim();
    if (!clean) return;
    const merge = (previous: string) => previous.trim() ? `${previous.trim()} ${clean}` : clean;
    if (target === "mission") setMission(merge);
    if (target === "outcome") setOutcome(merge);
    if (target === "blocker") setBlocker(merge);
    if (target === "context") setContext(merge);
  }

  function startVoice(target = voiceTarget) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setPreviewMessage("Voice input is not available in this browser. You can still type normally.");
      return;
    }
    try { recognitionRef.current?.stop?.(); } catch {}
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    setVoiceTarget(target);
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      setListening(true);
      setPreviewMessage("");
    };
    recognition.onresult = (event: any) => {
      const transcript = String(event?.results?.[0]?.[0]?.transcript || "");
      addVoiceText(target, transcript);
    };
    recognition.onerror = () => {
      setPreviewMessage("I couldn't catch that. Try the Talk button again or type your answer.");
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  }

  function stopVoice() {
    try { recognitionRef.current?.stop?.(); } catch {}
    setListening(false);
  }

  function speakLift() {
    if (!lift || !("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const script = [
      lift.title,
      `What I heard: ${lift.readout.focus}`,
      `Where the leverage is: ${lift.readout.leverage}`,
      `Your first move: ${lift.firstMove.action}`,
      `${lift.deliverable.title}: ${lift.deliverable.content.slice(0, 1400)}`,
      lift.boost,
    ].join(". ");
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 0.96;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function signInUrl() {
    const cycleKey = getElevateCycleKey();
    const qs = new URLSearchParams({ surface });
    if (cycleKey) qs.set("elv", cycleKey);
    return `/api/auth/shopify/start?next=${encodeURIComponent(`/elevate-me-bot?${qs.toString()}`)}`;
  }

  const fullContext = useMemo(() => [
    outcome ? `Desired outcome: ${outcome}` : "",
    blocker ? `Biggest blocker: ${blocker}` : "",
    context ? `Useful context: ${context}` : "",
  ].filter(Boolean).join("\n"), [outcome, blocker, context]);

  const signalScore = useMemo(() => {
    const scorePart = (value: string, max: number, target: number) => {
      const length = value.trim().length;
      if (!length) return 0;
      return Math.min(max, Math.max(4, Math.round((length / target) * max)));
    };
    return Math.min(100,
      scorePart(mission, 35, 140) +
      scorePart(outcome, 25, 90) +
      scorePart(blocker, 20, 90) +
      scorePart(context, 20, 220)
    );
  }, [mission, outcome, blocker, context]);

  const signalLabel = signalScore >= 80
    ? "Rich signal"
    : signalScore >= 55
      ? "Strong enough to work"
      : signalScore >= 30
        ? "Finding the signal"
        : "Needs a little more focus";

  const signalTip = signalScore >= 80
    ? "You gave the Bot enough detail for a highly specific first readout."
    : signalScore >= 55
      ? "This is enough to build a useful Lift. One more concrete detail can sharpen it further."
      : signalScore >= 30
        ? "The Bot can start, but adding the outcome or blocker will make the Lift more specific."
        : "Start with one real situation in your own words. Specific beats polished.";


  const activeMode = modeConfig[need];
  const recommendedDoors = hubDoors[need];

  function useQuickStart(example: typeof quickStarts[number]) {
    setNeed(example.need);
    setMission(example.mission);
    setOutcome(example.outcome);
    setBlocker(example.blocker);
    setContext(example.context);
    setQuickStartUsed(true);
    setPreviewMessage("");
    trackElevateEvent("quick_start_selected", surface, undefined, { action: example.need, example: example.label });
  }

  function saveProfile() {
    try {
      localStorage.setItem(
        "elevate_me_bot_profile",
        JSON.stringify({ botName, mission, outcome, blocker, context, need, surface, updatedAt: new Date().toISOString() })
      );
    } catch {}
  }

  async function runPreview() {
    if (!mission.trim()) {
      setPreviewMessage("Give the Bot one real thing to elevate first.");
      return;
    }
    setPreviewMessage("");
    setLift(null);
    setRunningAction(true);
    saveProfile();
    trackElevateEvent("preview_run", surface, undefined, { action: need, richer_intake: true, signal_score: signalScore });

    try {
      const response = await fetch("/api/elevate/preview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: need,
          mission,
          botName,
          context: fullContext,
          surface,
          sessionId: getElevateSessionId(),
        }),
      });
      const data = await response.json();
      if (response.status === 429) {
        setPreviewMessage("You have used today's free Lift previews. Activate for $1 to save your Bot and keep working.");
        setPreviewsRemaining(0);
        return;
      }
      if (!response.ok) throw new Error(data?.error || "PREVIEW_FAILED");
      setLift(data.result);
      setPreviewsRemaining(Number(data.previewsRemaining));
      window.setTimeout(() => document.getElementById("your-lift")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    } catch {
      setPreviewMessage("The Bot could not finish that Lift. Please try once more.");
    } finally {
      setRunningAction(false);
    }
  }

  async function runActivated(n: Need = need) {
    if (!access.entitlements.activated) {
      trackElevateEvent("activation_gate_hit", surface, "activate", { action: n });
      window.location.href = signInUrl();
      return;
    }
    setNeed(n);
    setLift(null);
    setRunningAction(true);
    saveProfile();
    try {
      const response = await fetch("/api/elevate/action", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: n, mission, botName, context: fullContext }),
      });
      if (!response.ok) throw new Error("ACTION_FAILED");
      const data = await response.json();
      setLift(data.result);
      window.setTimeout(() => document.getElementById("your-lift")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    } catch {
      setPreviewMessage("That Elevation did not finish. Try it again.");
    } finally {
      setRunningAction(false);
    }
  }

  const bg = surface === "botstores"
    ? "radial-gradient(circle at 50% -15%,rgba(80,224,234,.17),transparent 35%),linear-gradient(145deg,#08020f,#160625 55%,#041d25)"
    : "radial-gradient(circle at 50% -15%,rgba(80,224,234,.18),transparent 34%),radial-gradient(circle at 15% 20%,rgba(243,201,105,.10),transparent 25%),linear-gradient(145deg,#030712,#0a1230 52%,#05252d)";

  return (
    <main style={{ minHeight: "100vh", background: bg, color: "#fff", fontFamily: "Arial,sans-serif", overflowX: "hidden" }}>
      <style>{`
        @keyframes elevatePulse {
          0%,100% { transform: scale(1); opacity:.65; }
          50% { transform: scale(1.06); opacity:1; }
        }
        @keyframes elevateScan {
          0% { transform: translateY(-10%); opacity:0; }
          20% { opacity:.9; }
          80% { opacity:.9; }
          100% { transform: translateY(680%); opacity:0; }
        }
        @keyframes elevateFloat {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes hubReveal {
          0% { opacity:0; transform:translateY(18px) scale(.985); filter:blur(6px); }
          100% { opacity:1; transform:translateY(0) scale(1); filter:blur(0); }
        }
        @keyframes hubGlow {
          0%,100% { box-shadow:0 0 0 rgba(120,230,223,0); }
          50% { box-shadow:0 0 44px rgba(120,230,223,.13); }
        }

        @keyframes capsuleIn {
          0% { opacity:0; transform:translateY(18px) scale(.94); }
          35% { opacity:1; transform:translateY(0) scale(1); }
          70% { opacity:1; transform:translateY(-10px) scale(.985); }
          100% { opacity:.15; transform:translateY(-42px) scale(.84); }
        }
        @keyframes capsuleOut {
          0% { opacity:0; transform:translateY(32px) scale(.92); filter:blur(8px); }
          100% { opacity:1; transform:translateY(0) scale(1); filter:blur(0); }
        }
        @keyframes dataOrbit {
          0% { transform:rotate(0deg); }
          100% { transform:rotate(360deg); }
        }

        @keyframes modeBuild {
          0% { transform:translateY(0) scale(.96); opacity:.55; }
          100% { transform:translateY(-5px) scale(1); opacity:1; }
        }
        @keyframes modeCheck {
          0%,35% { opacity:.32; transform:scale(.9); }
          55%,100% { opacity:1; transform:scale(1); }
        }
        @keyframes modePulse {
          0% { transform:scale(.58); opacity:.9; }
          100% { transform:scale(1.2); opacity:0; }
        }
        @keyframes modeBars {
          0% { transform:scaleY(.55); opacity:.65; }
          100% { transform:scaleY(1.06); opacity:1; }
        }
        @keyframes modeArrow {
          0% { transform:translateX(-3px); opacity:.55; }
          100% { transform:translateX(4px); opacity:1; }
        }
        @keyframes modeRadar {
          0% { transform:rotate(0deg); }
          100% { transform:rotate(360deg); }
        }
        .elevate-input::placeholder { color:#7e829c; }
        .elevate-choice:hover { transform:translateY(-2px); border-color:rgba(120,230,223,.55)!important; }
        @media (max-width: 820px) {
          .elevate-console-grid { grid-template-columns:1fr!important; }
          .elevate-bot-stage { min-height:460px!important; }
          .elevate-result-grid { grid-template-columns:1fr!important; }
        }
      `}</style>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "26px 16px 72px" }}>
        <header style={{ textAlign: "center", padding: "14px 0 24px" }}>
          <div style={{ letterSpacing: ".17em", textTransform: "uppercase", color: "#f3c969", fontSize: 12, fontWeight: 900 }}>
            {surface === "botstores" ? "THE BOT STORES • FULL FUNCTION BOT" : "SERIOUSLY SATISFYING HUB • ENTER THE BOT"}
          </div>
          <h1 style={{ fontSize: "clamp(48px,9vw,96px)", lineHeight: .92, margin: "12px 0 12px", letterSpacing: "-.045em" }}>ELEVATE ME BOT</h1>
          <p style={{ maxWidth: 820, margin: "0 auto", fontSize: "clamp(18px,2.2vw,24px)", color: "#ddd9ef", lineHeight: 1.5 }}>
            Don’t ask for another generic plan. Put one real thing inside the Bot and leave with a clearer direction, a first move, and something already made for you.
          </p>
        </header>

        <section className="elevate-console-grid" style={{ display: "grid", gridTemplateColumns: ".88fr 1.12fr", gap: 22, alignItems: "stretch", marginTop: 14 }}>
          <div className="elevate-bot-stage" style={{ ...card, minHeight: 650, position: "relative", overflow: "hidden", background: "radial-gradient(circle at 50% 38%,rgba(89,236,244,.20),transparent 25%),linear-gradient(180deg,rgba(4,10,18,.96),rgba(3,5,10,.98))" }}>
            <div style={{ position: "absolute", inset: 20, border: "1px solid rgba(120,230,223,.14)", borderRadius: 22, pointerEvents: "none" }} />
            <div style={{ position: "absolute", left: 18, top: 18, zIndex: 3, padding: "8px 11px", borderRadius: 999, border: `1px solid ${activeMode.accent}55`, background: "rgba(2,7,12,.72)", color: activeMode.accent, fontSize: 10, fontWeight: 900, letterSpacing: ".12em", backdropFilter: "blur(8px)" }}>
              {activeMode.mode}
            </div>
            <ModeVisual need={need} accent={activeMode.accent} running={runningAction} />
            <div style={{ position: "absolute", left: "8%", right: "8%", bottom: 26, height: 2, background: `linear-gradient(90deg,transparent,${activeMode.accent},transparent)`, opacity: .65 }} />
            <img
              src={BOT_IMAGE}
              alt="Elevate Me Bot black edition"
              loading="eager"
              style={{ width: "100%", height: "100%", maxHeight: 650, objectFit: "cover", objectPosition: "center top", display: "block", borderRadius: 26, opacity: runningAction ? .72 : 1, transition: "opacity .4s ease", animation: "elevateFloat 6s ease-in-out infinite" }}
            />
            {runningAction && (
              <>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 0%,rgba(120,230,223,.08) 42%,transparent 72%)", animation: "elevateScan 2.8s linear infinite" }} />
                <div style={{ position: "absolute", inset: "8% 10% auto", height: 170, display: "grid", placeItems: "center", pointerEvents: "none" }}>
                  <div style={{ position: "absolute", width: 140, height: 140, borderRadius: "50%", border: "1px solid rgba(120,230,223,.35)", animation: "dataOrbit 7s linear infinite" }}>
                    <div style={{ position: "absolute", top: -5, left: "50%", width: 10, height: 10, borderRadius: "50%", background: "#f3c969", boxShadow: "0 0 18px #f3c969" }} />
                    <div style={{ position: "absolute", bottom: 8, right: 8, width: 8, height: 8, borderRadius: "50%", background: "#78e6df", boxShadow: "0 0 16px #78e6df" }} />
                  </div>
                  <div style={{ width: "78%", maxWidth: 360, padding: "14px 16px", borderRadius: 18, border: "1px solid rgba(120,230,223,.34)", background: "rgba(3,8,14,.78)", backdropFilter: "blur(12px)", animation: "capsuleIn 3.4s ease-in-out infinite" }}>
                    <div style={{ color: activeMode.accent, fontSize: 10, fontWeight: 900, letterSpacing: ".12em" }}>INPUT ENTERING {activeMode.mode}</div>
                    <div style={{ marginTop: 7, color: "#f5f2f8", fontSize: 14, lineHeight: 1.35 }}>
                      {mission.trim() ? mission.trim().slice(0, 110) : "Your goal is entering the Bot…"}{mission.trim().length > 110 ? "…" : ""}
                    </div>
                  </div>
                </div>

                <div style={{ position: "absolute", left: 22, right: 22, bottom: 22, padding: "18px 20px", borderRadius: 18, background: "rgba(2,7,12,.86)", border: "1px solid rgba(120,230,223,.42)", backdropFilter: "blur(12px)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                    <div style={{ color: activeMode.accent, fontSize: 11, fontWeight: 900, letterSpacing: ".14em" }}>{activeMode.mode} • {activeMode.verb}</div>
                    <div style={{ color: "#f3c969", fontSize: 12, fontWeight: 900 }}>SIGNAL {signalScore}/100</div>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800 }}>{processingLabels[processingStep]}</div>
                  <div style={{ height: 5, background: "rgba(255,255,255,.10)", borderRadius: 999, marginTop: 13, overflow: "hidden" }}>
                    <div style={{ width: `${((processingStep + 1) / processingLabels.length) * 100}%`, height: "100%", background: "linear-gradient(90deg,#78e6df,#f3c969)", transition: "width .5s ease" }} />
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{ ...card, padding: "24px 22px" }}>
            <div style={{ color: "#78e6df", fontWeight: 900, letterSpacing: ".12em", fontSize: 11 }}>STEP INSIDE • FREE LIFT PREVIEW</div>
            <h2 style={{ fontSize: "clamp(30px,4vw,48px)", lineHeight: 1, margin: "10px 0 10px" }}>Give the Bot enough to help.</h2>
            <p style={{ color: "#cfc9dd", lineHeight: 1.55, marginTop: 0 }}>
              Three strong answers are better than a long form. The last field is optional if you want the Bot to see more.
            </p>

            <div style={{ marginTop: 15, padding: "14px 14px 12px", borderRadius: 17, border: "1px solid rgba(243,201,105,.18)", background: "rgba(243,201,105,.045)" }}>
              <div style={{ color: "#f3c969", fontSize: 10, fontWeight: 900, letterSpacing: ".12em" }}>DON'T KNOW WHAT TO TYPE? TRY THE BOT WITH A REAL STARTER</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                {quickStarts.map(example => (
                  <button
                    key={example.label}
                    onClick={() => useQuickStart(example)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,.18)",
                      background: "rgba(255,255,255,.055)",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    {example.label}
                  </button>
                ))}
              </div>
              {quickStartUsed && (
                <div style={{ marginTop: 9, color: "#aaa6b8", fontSize: 11, lineHeight: 1.4 }}>
                  Starter loaded. Change any words to make it yours—or run it as-is to see how the Lift works.
                </div>
              )}
            </div>

            <div style={{ display: "grid", gap: 14, marginTop: 20 }}>
              <label>
                <span style={{ display: "block", marginBottom: 7, fontWeight: 900 }}>1. What are we elevating?</span>
                <textarea className="elevate-input" value={mission} onFocus={() => setVoiceTarget("mission")} onChange={e => setMission(e.target.value)} placeholder="Example: I have a catering business but I’m not getting enough weekday orders." rows={3} style={{ width: "100%", boxSizing: "border-box", resize: "vertical", padding: 14, borderRadius: 15, border: "1px solid #474e69", background: "#070d1d", color: "#fff", fontSize: 16, lineHeight: 1.45 }} />
              </label>

              <label>
                <span style={{ display: "block", marginBottom: 7, fontWeight: 900 }}>2. What would a real lift look like?</span>
                <input className="elevate-input" value={outcome} onFocus={() => setVoiceTarget("outcome")} onChange={e => setOutcome(e.target.value)} placeholder="More bookings, finish the project, stronger confidence, a better offer…" style={{ width: "100%", boxSizing: "border-box", padding: 14, borderRadius: 15, border: "1px solid #474e69", background: "#070d1d", color: "#fff", fontSize: 16 }} />
              </label>

              <label>
                <span style={{ display: "block", marginBottom: 7, fontWeight: 900 }}>3. What is getting in the way?</span>
                <input className="elevate-input" value={blocker} onFocus={() => setVoiceTarget("blocker")} onChange={e => setBlocker(e.target.value)} placeholder="I don’t know what to say, no time, low response, too many choices…" style={{ width: "100%", boxSizing: "border-box", padding: 14, borderRadius: 15, border: "1px solid #474e69", background: "#070d1d", color: "#fff", fontSize: 16 }} />
              </label>

              <label>
                <span style={{ display: "block", marginBottom: 7, fontWeight: 900 }}>4. Anything useful the Bot should know? <span style={{ color: "#8c92aa", fontWeight: 600 }}>Optional</span></span>
                <textarea className="elevate-input" value={context} onFocus={() => setVoiceTarget("context")} onChange={e => setContext(e.target.value)} placeholder="Paste a draft, describe the audience, mention what you already tried, or leave this blank." rows={3} style={{ width: "100%", boxSizing: "border-box", resize: "vertical", padding: 14, borderRadius: 15, border: "1px solid #474e69", background: "#070d1d", color: "#fff", fontSize: 15, lineHeight: 1.45 }} />
              </label>
            </div>

            <div style={{ marginTop: 16, padding: "15px 16px", borderRadius: 17, background: "rgba(120,230,223,.055)", border: "1px solid rgba(120,230,223,.20)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                <div>
                  <div style={{ color: "#78e6df", fontSize: 10, fontWeight: 900, letterSpacing: ".13em" }}>INPUT SIGNAL</div>
                  <strong style={{ display: "block", marginTop: 4, fontSize: 18 }}>{signalLabel}</strong>
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: signalScore >= 55 ? "#f3c969" : "#fff" }}>{signalScore}<span style={{ color: "#7f8398", fontSize: 13 }}>/100</span></div>
              </div>
              <div style={{ height: 7, marginTop: 10, borderRadius: 999, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
                <div style={{ width: `${signalScore}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#16b8c4,#78e6df,#f3c969)", transition: "width .25s ease" }} />
              </div>
              <p style={{ margin: "9px 0 0", color: "#aaa6b8", fontSize: 12, lineHeight: 1.45 }}>{signalTip}</p>
              <div style={{ marginTop: 7, color: "#73778d", fontSize: 10 }}>This measures usable input detail—not your odds of success.</div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontWeight: 900 }}>What kind of Lift do you want?</div>
                <div style={{ color: activeMode.accent, fontSize: 10, fontWeight: 900, letterSpacing: ".10em" }}>{activeMode.mode}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 9 }}>
                {needs.map(n => (
                  <button className="elevate-choice" key={n.id} onClick={() => setNeed(n.id)} style={{ textAlign: "left", padding: 13, borderRadius: 15, border: need === n.id ? "1px solid #f3c969" : "1px solid rgba(255,255,255,.13)", background: need === n.id ? "rgba(243,201,105,.13)" : "rgba(255,255,255,.035)", color: "#fff", cursor: "pointer", transition: "all .2s ease" }}>
                    <strong style={{ display: "block", fontSize: 14 }}>{n.label}</strong>
                    <span style={{ display: "block", color: "#aaa5bc", fontSize: 11, lineHeight: 1.35, marginTop: 4 }}>{n.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 22 }}>
              <button onClick={runPreview} disabled={runningAction} style={{ ...button, background: "#f3c969", color: "#111", minWidth: 220, opacity: runningAction ? .65 : 1 }}>
                {runningAction ? "BUILDING MY LIFT…" : "PUT IT IN THE BOT"}
              </button>
              {voiceSupported && (
                <button
                  onClick={() => listening ? stopVoice() : startVoice()}
                  style={{ ...button, background: listening ? "#78e6df" : "rgba(120,230,223,.10)", color: listening ? "#041117" : "#bff7f3", border: "1px solid rgba(120,230,223,.42)" }}
                >
                  {listening ? "LISTENING… TAP TO STOP" : "🎙 TALK TO NOVA"}
                </button>
              )}
              <input value={botName} onChange={e => setBotName(e.target.value)} aria-label="Bot name" style={{ width: 115, padding: "12px 13px", borderRadius: 999, border: "1px solid rgba(255,255,255,.19)", background: "rgba(255,255,255,.05)", color: "#fff", textAlign: "center", fontWeight: 800 }} />
              <span style={{ color: "#9995ab", fontSize: 12 }}>Bot name</span>
            </div>
            {voiceSupported && (
              <div style={{ marginTop: 9, color: "#8e8aa0", fontSize: 11, lineHeight: 1.4 }}>
                Tap a field, then Talk to Nova. Your spoken words go into that part of the Bot intake. Text remains available at all times.
              </div>
            )}

            {previewMessage && <div style={{ marginTop: 14, padding: 13, borderRadius: 14, background: "rgba(243,201,105,.09)", border: "1px solid rgba(243,201,105,.25)", color: "#f5e0a2" }}>{previewMessage}</div>}
            {previewsRemaining !== null && previewsRemaining > 0 && <div style={{ marginTop: 10, color: "#9995ab", fontSize: 12 }}>{previewsRemaining} free Lift preview{previewsRemaining === 1 ? "" : "s"} remaining in this preview window.</div>}
          </div>
        </section>

        {lift && (
          <section id="your-lift" style={{ marginTop: 26, scrollMarginTop: 18 }}>
            <div style={{ ...card, padding: "28px 24px", borderColor: activeMode.glow, background: `radial-gradient(circle at 86% 0%,${activeMode.glow},transparent 30%),linear-gradient(145deg,rgba(14,24,48,.96),rgba(5,12,22,.98))`, animation: "capsuleOut .65s ease both" }}>
              <div style={{ marginBottom: 16, padding: "11px 14px", borderRadius: 14, border: `1px solid ${activeMode.accent}`, background: activeMode.glow, color: activeMode.accent, fontSize: 11, fontWeight: 900, letterSpacing: ".12em" }}>
                LIFT CAPSULE RETURNED • YOUR INPUT HAS BEEN TRANSFORMED
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
                <div>
                  <div style={{ color: activeMode.accent, fontWeight: 900, letterSpacing: ".14em", fontSize: 11 }}>✓ {activeMode.mode} COMPLETE</div>
                  <h2 style={{ fontSize: "clamp(34px,5vw,58px)", lineHeight: 1, margin: "9px 0 0" }}>{lift.title}</h2>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <div style={{ padding: "9px 13px", borderRadius: 999, border: "1px solid rgba(120,230,223,.3)", color: "#9df1ec", fontSize: 11, fontWeight: 900 }}>
                    {lift.source === "ai" ? "AI-ASSISTED LIFT" : "SMART LIFT"} · INPUT {signalScore}/100
                  </div>
                  {typeof window !== "undefined" && "speechSynthesis" in window && (
                    <button onClick={speakLift} style={{ padding: "9px 13px", borderRadius: 999, border: "1px solid rgba(243,201,105,.35)", background: "rgba(243,201,105,.08)", color: "#f3c969", fontSize: 11, fontWeight: 900, cursor: "pointer" }}>
                      {speaking ? "■ STOP VOICE" : "🔊 HEAR MY LIFT"}
                    </button>
                  )}
                </div>
              </div>

              <div className="elevate-result-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12, marginTop: 24 }}>
                {[
                  ["WHAT I HEARD", lift.readout.focus],
                  ["WHAT MAY BE HOLDING IT BACK", lift.readout.friction],
                  ["WHERE THE LEVERAGE IS", lift.readout.leverage],
                ].map(([title, copy]) => (
                  <article key={title} style={{ padding: 18, borderRadius: 18, border: "1px solid rgba(255,255,255,.11)", background: "rgba(255,255,255,.045)" }}>
                    <div style={{ color: "#f3c969", fontWeight: 900, fontSize: 11, letterSpacing: ".09em" }}>{title}</div>
                    <p style={{ margin: "9px 0 0", color: "#e7e3ee", lineHeight: 1.55 }}>{copy}</p>
                  </article>
                ))}
              </div>

              <div style={{ marginTop: 16, padding: 22, borderRadius: 20, background: "linear-gradient(135deg,rgba(243,201,105,.15),rgba(255,255,255,.035))", border: "1px solid rgba(243,201,105,.31)" }}>
                <div style={{ color: "#f3c969", fontSize: 11, fontWeight: 900, letterSpacing: ".11em" }}>YOUR FIRST MOVE • {lift.firstMove.timebox}</div>
                <h3 style={{ margin: "8px 0 7px", fontSize: 28 }}>{lift.firstMove.title}</h3>
                <p style={{ margin: 0, color: "#cfc9dd", lineHeight: 1.55 }}>{lift.firstMove.why}</p>
                <div style={{ marginTop: 14, padding: 16, borderRadius: 15, background: "rgba(0,0,0,.25)", fontSize: 18, lineHeight: 1.55 }}>{lift.firstMove.action}</div>
              </div>

              <div style={{ marginTop: 16, padding: 22, borderRadius: 20, background: "rgba(120,230,223,.07)", border: "1px solid rgba(120,230,223,.25)" }}>
                <div style={{ color: activeMode.accent, fontSize: 11, fontWeight: 900, letterSpacing: ".11em" }}>{activeMode.outputLabel}</div>
                <h3 style={{ margin: "8px 0 12px", fontSize: 27 }}>{lift.deliverable.title}</h3>
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, color: "#f5f3f8", fontSize: 16 }}>{lift.deliverable.content}</div>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ color: activeMode.accent, fontWeight: 900, fontSize: 11, letterSpacing: ".11em" }}>{activeMode.pathLabel}</div>
                <div className="elevate-result-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginTop: 10 }}>
                  {lift.path.map((item, index) => (
                    <div key={index} style={{ padding: 17, borderRadius: 17, background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.10)" }}>
                      <strong style={{ color: "#f3c969" }}>{index + 1}</strong>
                      <div style={{ marginTop: 7, lineHeight: 1.5 }}>{item}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 17, padding: "15px 18px", borderRadius: 16, borderLeft: "4px solid #78e6df", background: "rgba(120,230,223,.06)", fontSize: 17, lineHeight: 1.5 }}>
                {lift.boost}
              </div>

              <div style={{ marginTop: 22, padding: "20px 18px", borderRadius: 19, background: "linear-gradient(135deg,rgba(243,201,105,.16),rgba(125,77,245,.10))", border: "1px solid rgba(243,201,105,.24)" }}>
                <div style={{ color: "#f3c969", fontSize: 11, fontWeight: 900, letterSpacing: ".12em" }}>KEEP THE LIFT GOING</div>
                <h3 style={{ margin: "7px 0 8px", fontSize: 26 }}>Save the Bot and keep working for $1.</h3>
                <p style={{ margin: 0, color: "#d6d0e0", lineHeight: 1.55 }}>Activation should feel like continuing something useful—not paying to discover whether the Bot can help.</p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
                  {access.entitlements.activated
                    ? <button onClick={() => runActivated(need)} style={{ ...button, background: "#78e6df", color: "#041117" }}>RUN ANOTHER ELEVATION</button>
                    : <a href={`/elevate-me-bot/unlock?level=activate&surface=${surface}${getElevateCycleKey() ? `&elv=${encodeURIComponent(getElevateCycleKey()!)}` : ""}`} onClick={() => trackElevateEvent("unlock_open", surface, "activate")} style={{ ...button, background: "#f3c969", color: "#111" }}>ACTIVATE + SAVE MY BOT • $1</a>}
                  <button onClick={() => { setLift(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ ...button, background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,.25)" }}>CHANGE WHAT I’M ELEVATING</button>
                </div>
              </div>


              <div style={{ marginTop: 26, padding: "26px 20px", borderRadius: 24, background: "radial-gradient(circle at 50% 0%,rgba(120,230,223,.12),transparent 34%),radial-gradient(circle at 8% 100%,rgba(243,201,105,.08),transparent 30%),rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.13)", animation: "hubReveal .7s ease both" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <div>
                    <div style={{ color: "#78e6df", fontSize: 11, fontWeight: 900, letterSpacing: ".13em" }}>YOUR HUB IS OPENING</div>
                    <h3 style={{ margin: "8px 0 8px", fontSize: "clamp(30px,4vw,44px)", lineHeight: 1 }}>You do not need the whole HUB. Start here.</h3>
                  </div>
                  <div style={{ padding: "8px 12px", borderRadius: 999, background: "rgba(120,230,223,.08)", border: "1px solid rgba(120,230,223,.22)", color: "#a9f0ec", fontSize: 10, fontWeight: 900, letterSpacing: ".10em" }}>
                    PERSONALIZED FROM THIS LIFT
                  </div>
                </div>
                <p style={{ margin: "0 0 18px", color: "#cfc9dd", lineHeight: 1.55, maxWidth: 790 }}>
                  Elevate Me Bot used what you asked for to narrow the HUB down to the places most likely to matter next.
                </p>

                <a
                  href={recommendedDoors[0].href}
                  onClick={() => trackElevateEvent("hub_door_open", surface, undefined, { action: need, door: recommendedDoors[0].title, position: 1 })}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0,1fr) auto",
                    gap: 18,
                    alignItems: "center",
                    padding: "24px 22px",
                    borderRadius: 22,
                    border: `1px solid ${activeMode.accent}`,
                    background: `linear-gradient(135deg,${activeMode.glow},rgba(255,255,255,.035))`,
                    color: "#fff",
                    textDecoration: "none",
                    animation: "hubGlow 3.6s ease-in-out infinite, hubReveal .72s .08s ease both",
                  }}
                >
                  <div>
                    <div style={{ color: activeMode.accent, fontSize: 11, fontWeight: 900, letterSpacing: ".13em" }}>{recommendedDoors[0].eyebrow} • BEST NEXT DOOR</div>
                    <strong style={{ display: "block", marginTop: 8, fontSize: "clamp(26px,4vw,40px)", lineHeight: 1 }}>{recommendedDoors[0].title}</strong>
                    <p style={{ margin: "10px 0 0", color: "#e1dce9", lineHeight: 1.5, maxWidth: 700 }}>{recommendedDoors[0].copy}</p>
                  </div>
                  <div style={{ width: 46, height: 46, borderRadius: "50%", display: "grid", placeItems: "center", border: `1px solid ${activeMode.accent}`, color: activeMode.accent, fontSize: 23, fontWeight: 900 }}>→</div>
                </a>

                <div className="elevate-result-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12, marginTop: 12 }}>
                  {recommendedDoors.slice(1).map((door, index) => (
                    <a
                      key={door.title}
                      href={door.href}
                      onClick={() => trackElevateEvent("hub_door_open", surface, undefined, { action: need, door: door.title, position: index + 2 })}
                      style={{
                        display: "block",
                        padding: 18,
                        borderRadius: 18,
                        border: "1px solid rgba(255,255,255,.12)",
                        background: "rgba(255,255,255,.035)",
                        color: "#fff",
                        textDecoration: "none",
                        minHeight: 142,
                        animation: `hubReveal .72s ${0.18 + index * 0.10}s ease both`,
                      }}
                    >
                      <div style={{ color: "#a9a5ba", fontSize: 10, fontWeight: 900, letterSpacing: ".12em" }}>{door.eyebrow}</div>
                      <strong style={{ display: "block", marginTop: 8, fontSize: 22 }}>{door.title}</strong>
                      <p style={{ margin: "8px 0 0", color: "#cbc6d7", lineHeight: 1.45, fontSize: 14 }}>{door.copy}</p>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section style={{ ...card, marginTop: 24, padding: "22px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <div style={{ color: "#f3c969", fontWeight: 900, letterSpacing: ".10em", fontSize: 11 }}>MY BOT LEVEL</div>
              <strong style={{ display: "block", marginTop: 5, fontSize: 21 }}>{checkingAccess ? "CHECKING…" : access.level.replaceAll("_", " ")}</strong>
            </div>
            <span style={{ color: "#c9c5dd", fontSize: 13 }}>
              ACTIVATE {access.entitlements.activated ? "✓" : "🔒"} · POWER UP {access.entitlements.powerUp ? "✓" : "🔒"} · MAKE IT REAL {access.entitlements.makeItReal ? "✓" : "🔒"}
            </span>
          </div>
        </section>

        <section style={{ ...card, marginTop: 18, padding: "22px 20px" }}>
          <div style={{ color: "#78e6df", fontWeight: 900, letterSpacing: ".10em", fontSize: 11 }}>ONE-TOUCH HOME</div>
          <h2 style={{ fontSize: 30, margin: "8px 0 14px" }}>Once activated, your Bot stays ready.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 11 }}>
            {needs.map(n => (
              <button key={n.id} onClick={() => runActivated(n.id)} style={{ textAlign: "left", padding: 17, borderRadius: 17, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.045)", color: "#fff", cursor: "pointer", opacity: access.entitlements.activated ? 1 : .68 }}>
                <strong style={{ display: "block", fontSize: 17 }}>{n.label.toUpperCase()}</strong>
                <span style={{ color: "#aaa5bc", fontSize: 13 }}>{access.entitlements.activated ? n.hint : "Activate to keep this one-touch power available."}</span>
              </button>
            ))}
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 14, marginTop: 18 }}>
          <div style={{ ...card, padding: 22 }}>
            <div style={{ color: "#78e6df", fontWeight: 900 }}>$2.99 POWER UP</div>
            <h3 style={{ fontSize: 24, marginBottom: 8 }}>More powers. More momentum.</h3>
            <p style={{ color: "#cbc5d7", lineHeight: 1.55 }}>EXPLODE, deeper reach, selling, planning, remixing and stronger saved-project continuity.</p>
            {access.entitlements.powerUp
              ? <a href="/elevate-me-bot/explode" style={{ ...button, background: "#78e6df", color: "#041117" }}>OPEN POWER UP TOOLS ✓</a>
              : <a href={`/elevate-me-bot/unlock?level=power&surface=${surface}`} onClick={() => trackElevateEvent("unlock_open", surface, "power")} style={{ ...button, background: "#16b8c4", color: "#041117" }}>POWER UP</a>}
          </div>

          <div style={{ ...card, padding: 22 }}>
            <div style={{ color: "#f3c969", fontWeight: 900 }}>$7.99 MAKE IT REAL</div>
            <h3 style={{ fontSize: 24, marginBottom: 8 }}>Move from digital to real-world results.</h3>
            <p style={{ color: "#cbc5d7", lineHeight: 1.55 }}>Print preparation, HUB merch access, physical promo pathways and Creator College connections.</p>
            {access.entitlements.makeItReal
              ? <a href="/elevate-me-bot/make-it-real" style={{ ...button, background: "#f3c969", color: "#111" }}>OPEN MAKE IT REAL ✓</a>
              : <a href={`/elevate-me-bot/unlock?level=real&surface=${surface}${getElevateCycleKey() ? `&elv=${encodeURIComponent(getElevateCycleKey()!)}` : ""}`} onClick={() => trackElevateEvent("unlock_open", surface, "real")} style={{ ...button, background: "#f3c969", color: "#111" }}>MAKE IT REAL</a>}
          </div>

          <div style={{ ...card, padding: 22 }}>
            <div style={{ color: "#bba5ff", fontWeight: 900 }}>$1.99 GIFT A BOT</div>
            <h3 style={{ fontSize: 24, marginBottom: 8 }}>Give somebody else their first Lift.</h3>
            <p style={{ color: "#cbc5d7", lineHeight: 1.55 }}>A low-cost way to send the experience to someone you think could use momentum.</p>
            {access.entitlements.giftCreditsPurchased > 0
              ? <a href="/elevate-me-bot/gift" style={{ ...button, background: "#7d4df5", color: "#fff" }}>USE MY GIFT CREDIT</a>
              : <a href={checkout.gift} onClick={() => trackElevateEvent("checkout_intent", surface, "gift")} style={{ ...button, background: "#7d4df5", color: "#fff" }}>GIFT A BOT</a>}
          </div>
        </section>
      </div>
    </main>
  );
}
