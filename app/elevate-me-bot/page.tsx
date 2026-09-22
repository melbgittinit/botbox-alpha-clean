"use client";

import { useEffect, useState } from "react";

type Need = "make" | "done" | "reach" | "earn" | "better" | "next";
type Surface = "hub" | "botstores";
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
  activate: "https://urbanspirit.biz/products/elevate-me-bot-activation-power-levels?variant=53879074324773",
  gift: "https://urbanspirit.biz/products/elevate-me-bot-activation-power-levels?variant=53879074357541",
  power: "https://urbanspirit.biz/products/elevate-me-bot-activation-power-levels?variant=53879074390309",
  real: "https://urbanspirit.biz/products/elevate-me-bot-activation-power-levels?variant=53879074423077",
};

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
    try {
      const saved = JSON.parse(raw);
      const key = String(saved?.key || "").trim().toUpperCase();
      const at = Number(saved?.at || 0);
      if (/^ELV-\d{8}-[A-Z0-9]{2,12}$/.test(key) && at > 0 && Date.now() - at <= 7 * 24 * 60 * 60 * 1000) {
        return key;
      }
    } catch {}
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
    return null;
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
        payload: {
          utm_campaign: params.get("utm_campaign"),
          ...payload,
        },
      }),
    });
  } catch {}
}

const needs: { id: Need; label: string }[] = [
  { id: "make", label: "Make Something" },
  { id: "done", label: "Get It Done" },
  { id: "reach", label: "Reach My People" },
  { id: "earn", label: "Earn Something" },
  { id: "better", label: "Make It Better" },
  { id: "next", label: "My Next Move" },
];

function firstElevation(need: Need, mission: string) {
  const subject = mission.trim() || "what matters most to you";
  const plans: Record<Need, string[]> = {
    make: [
      `Create one useful thing today around “${subject}.”`,
      "Keep it small enough to finish in 15 minutes.",
      "When it is ready, use SEND IT to put it in front of someone."
    ],
    done: [
      `Pick the smallest unfinished step connected to “${subject}.”`,
      "Complete that step before adding another.",
      "Mark it done, then ask your Bot for the next move."
    ],
    reach: [
      `Choose one useful message about “${subject}.”`,
      "Prepare one version for 1 person, one for 5, and one for 50.",
      "Share the smallest version first and learn from the response."
    ],
    earn: [
      `Identify one honest way “${subject}” could help someone else.`,
      "Package that value in one clear sentence.",
      "Use your share path or Earn Mode connection to test interest."
    ],
    better: [
      `Choose one existing item connected to “${subject}.”`,
      "Make the headline clearer and the next action easier.",
      "Save the improved version before creating anything new."
    ],
    next: [
      `Today’s move: make one visible step toward “${subject}.”`,
      "Do not build the whole plan—complete one useful action.",
      "Return after completion and let your Bot choose the next move."
    ],
  };
  return plans[need];
}

const card: React.CSSProperties = {
  background: "rgba(255,255,255,.08)",
  border: "1px solid rgba(255,255,255,.17)",
  borderRadius: 22,
  padding: 22,
  boxShadow: "0 18px 60px rgba(0,0,0,.22)"
};

const button: React.CSSProperties = {
  display: "inline-block",
  padding: "13px 18px",
  borderRadius: 999,
  border: 0,
  textDecoration: "none",
  fontWeight: 800,
  cursor: "pointer"
};

export default function ElevateMeBotPage() {
  const [botName, setBotName] = useState("Nova");
  const [mission, setMission] = useState("");
  const [need, setNeed] = useState<Need>("next");
  const [surface, setSurface] = useState<Surface>("hub");
  const [result, setResult] = useState<string[] | null>(null);
  const [resultTitle, setResultTitle] = useState("Your next Elevation");
  const [resultSource, setResultSource] = useState<"ai"|"structured"|"local">("local");
  const [resultExtra, setResultExtra] = useState<string | null>(null);
  const [runningAction, setRunningAction] = useState(false);
  const [access, setAccess] = useState<ElevateAccess>({
    authenticated: false,
    level: "CUSTOMIZE",
    entitlements: { activated: false, powerUp: false, makeItReal: false, giftCreditsPurchased: 0 },
  });
  const [checkingAccess, setCheckingAccess] = useState(true);

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
        if (parsed.need) setNeed(parsed.need);
      }
    } catch {}
  }, []);

  function signInUrl() {
    const cycleKey = getElevateCycleKey();
    const qs = new URLSearchParams({ surface });
    if (cycleKey) qs.set("elv", cycleKey);
    return `/api/auth/shopify/start?next=${encodeURIComponent(`/elevate-me-bot?${qs.toString()}`)}`;
  }

  async function saveAndRun(n: Need = need, preview = false) {
    if (!preview && !access.entitlements.activated) {
      trackElevateEvent("activation_gate_hit", surface, "activate", { action: n });
      window.location.href = signInUrl();
      return;
    }
    try {
      localStorage.setItem(
        "elevate_me_bot_profile",
        JSON.stringify({ botName, mission, need: n, surface, updatedAt: new Date().toISOString() })
      );
    } catch {}
    setNeed(n);

    if (preview) {
      trackElevateEvent("preview_run", surface, undefined, { action: n });
      setResultTitle("Preview Elevation");
      setResultSource("local");
      setResultExtra(null);
      setResult(firstElevation(n, mission));
      return;
    }

    setRunningAction(true);
    try {
      const response = await fetch("/api/elevate/action", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: n, mission, botName }),
      });
      if (!response.ok) throw new Error("ACTION_FAILED");
      const data = await response.json();
      setResultTitle(data.result?.title || "Your next Elevation");
      setResultSource(data.result?.source || "structured");
      setResultExtra(data.result?.result || null);
      setResult(Array.isArray(data.result?.steps) ? data.result.steps : firstElevation(n, mission));
    } catch {
      setResultTitle("Your next Elevation");
      setResultSource("structured");
      setResultExtra(null);
      setResult(firstElevation(n, mission));
    } finally {
      setRunningAction(false);
    }
  }

  const bg = surface === "botstores"
    ? "linear-gradient(145deg,#090312,#19072e 50%,#062430)"
    : "linear-gradient(145deg,#07152f,#181047 50%,#07323b)";

  return (
    <main style={{ minHeight: "100vh", background: bg, color: "#fff", padding: "28px 16px 64px", fontFamily: "Arial,sans-serif" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <header style={{ textAlign: "center", padding: "18px 0 28px" }}>
          <div style={{ letterSpacing: ".16em", textTransform: "uppercase", color: "#f3c969", fontSize: 13, fontWeight: 800 }}>
            {surface === "botstores" ? "THE BOT STORES • FULL FUNCTION BOT" : "SERIOUSLY SATISFYING HUB • FEATURED BOT"}
          </div>
          <h1 style={{ fontSize: "clamp(46px,9vw,92px)", lineHeight: .94, margin: "12px 0 10px" }}>ELEVATE ME BOT</h1>
          <p style={{ maxWidth: 760, margin: "0 auto", fontSize: 20, color: "#ddd9ef", lineHeight: 1.5 }}>
            Customize it. Tell it what you need. Then use one touch to elevate something real.
          </p>
        </header>

        <section style={{ ...card, marginBottom: 18, padding: "14px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <strong>MY BOT LEVEL: {checkingAccess ? "CHECKING…" : access.level.replaceAll("_", " ")}</strong>
            <span style={{ color: "#c9c5dd", fontSize: 14 }}>
              ACTIVATE {access.entitlements.activated ? "✓" : "🔒"} · POWER UP {access.entitlements.powerUp ? "✓" : "🔒"} · MAKE IT REAL {access.entitlements.makeItReal ? "✓" : "🔒"}
            </span>
          </div>
        </section>

        <section style={{ ...card, marginBottom: 18 }}>
          <div style={{ color: "#f3c969", fontWeight: 800, letterSpacing: ".08em" }}>0 • CUSTOMIZE + SURVEY — INCLUDED</div>
          <h2 style={{ fontSize: 30, marginBottom: 8 }}>Build the Bot around you.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
            <label>
              <span style={{ display: "block", marginBottom: 7, fontWeight: 700 }}>Bot name</span>
              <input value={botName} onChange={e => setBotName(e.target.value)} style={{ width: "100%", padding: 13, borderRadius: 12, border: "1px solid #6b6790", background: "#0a1028", color: "#fff", boxSizing: "border-box" }} />
            </label>
            <label>
              <span style={{ display: "block", marginBottom: 7, fontWeight: 700 }}>What are we elevating?</span>
              <input value={mission} onChange={e => setMission(e.target.value)} placeholder="My business, confidence, audience, money..." style={{ width: "100%", padding: 13, borderRadius: 12, border: "1px solid #6b6790", background: "#0a1028", color: "#fff", boxSizing: "border-box" }} />
            </label>
          </div>
          <div style={{ marginTop: 18 }}>
            <div style={{ fontWeight: 700, marginBottom: 9 }}>What would help most right now?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {needs.map(n => (
                <button key={n.id} onClick={() => setNeed(n.id)} style={{ ...button, background: need === n.id ? "#f3c969" : "#fff", color: "#111" }}>
                  {n.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section style={{ ...card, marginBottom: 18, borderColor: "rgba(243,201,105,.55)" }}>
          <div style={{ color: "#f3c969", fontWeight: 800, letterSpacing: ".08em" }}>1 • $1 ACTIVATE</div>
          <h2 style={{ fontSize: 32, margin: "8px 0" }}>Your first real Elevation.</h2>
          <p style={{ color: "#ddd9ef", lineHeight: 1.6, maxWidth: 800 }}>
            Activation is not payment for customization. It starts the operating Bot: first Elevation, basic one-touch actions, Send 1 • 5 • 50, Share My Bot, basic Earn Mode, and limited weekly Elevations.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <button onClick={() => saveAndRun(need, true)} style={{ ...button, background: "#f3c969", color: "#111" }}>PREVIEW MY FIRST ELEVATION</button>
            {access.entitlements.activated
    ? <span style={{ ...button, background: "#78e6df", color: "#041117" }}>ACTIVATED ✓</span>
    : <a onClick={() => trackElevateEvent("unlock_open", surface, "activate")} href={`/elevate-me-bot/unlock?level=activate&surface=${surface}${getElevateCycleKey() ? `&elv=${encodeURIComponent(getElevateCycleKey()!)}` : ""}`} style={{ ...button, background: "#fff", color: "#111" }}>ACTIVATE FOR $1</a>}
  {!access.entitlements.activated && (
    <a href={signInUrl()} style={{ ...button, background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,.45)" }}>I ALREADY PURCHASED • VERIFY</a>
  )}
          </div>
        </section>

        {result && (
          <section style={{ ...card, marginBottom: 18, background: "rgba(255,255,255,.12)" }}>
            <div style={{ color: "#78e6df", fontWeight: 800 }}>✓ ELEVATION COMPLETE</div>
            <h2 style={{ fontSize: 30, margin: "8px 0" }}>{resultTitle}</h2><div style={{fontSize:12,letterSpacing:".08em",textTransform:"uppercase",color:"#c9c5dd"}}>{resultSource === "ai" ? "AI-assisted" : resultSource === "structured" ? "Smart structured mode" : "Preview mode"}</div>
            <ol style={{ lineHeight: 1.75, fontSize: 18 }}>
              {result.map((r, i) => <li key={i}>{r}</li>)}
            </ol>{resultExtra && <div style={{marginTop:14,padding:14,borderRadius:14,background:"rgba(255,255,255,.07)",whiteSpace:"pre-wrap",lineHeight:1.6}}>{resultExtra}</div>}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
              <button onClick={() => saveAndRun("reach")} style={{ ...button, background: "#fff", color: "#111" }}>
    {access.entitlements.activated ? "SEND IT • 1 / 5 / 50" : "SEND IT • ACTIVATE TO USE"}
  </button>
              {access.entitlements.powerUp
    ? <a href="/elevate-me-bot/explode" style={{ ...button, background: "#16b8c4", color: "#041117" }}>EXPLODE THIS ✓</a>
    : <a href={`/elevate-me-bot/unlock?level=power&surface=${surface}${getElevateCycleKey() ? `&elv=${encodeURIComponent(getElevateCycleKey()!)}` : ""}`} style={{ ...button, background: "#16b8c4", color: "#041117" }}>EXPLODE IT • POWER UP $2.99</a>}
              {access.entitlements.giftCreditsPurchased > 0
    ? <a href="/elevate-me-bot/gift" style={{ ...button, background: "#7d4df5", color: "#fff" }}>
        USE MY GIFT CREDIT{access.entitlements.giftCreditsPurchased > 1 ? "S" : ""} • {access.entitlements.giftCreditsPurchased}
      </a>
    : <a onClick={() => trackElevateEvent("checkout_intent", surface, "gift")} href={checkout.gift} style={{ ...button, background: "#7d4df5", color: "#fff" }}>GIFT A BOT • $1.99</a>}
            </div>
          </section>
        )}

        <section style={{ ...card, marginBottom: 18 }}>
          <div style={{ color: "#78e6df", fontWeight: 800, letterSpacing: ".08em" }}>ONE-TOUCH HOME</div>
          <h2 style={{ fontSize: 30 }}>What should we elevate next?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 12 }}>
            {needs.map(n => (
              <button key={n.id} onClick={() => saveAndRun(n.id)} style={{ textAlign: "left", padding: 18, borderRadius: 17, border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.06)", color: "#fff", cursor: "pointer", opacity: access.entitlements.activated ? 1 : .68 }}>
                <strong style={{ display: "block", fontSize: 18 }}>{n.label.toUpperCase()}</strong>
                <span style={{ color: "#c9c5dd", fontSize: 14 }}>{access.entitlements.activated ? (runningAction ? "Working…" : "One touch → AI-assisted useful action") : "Activate to unlock this one-touch action"}</span>
              </button>
            ))}
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
          <div style={card}>
            <div style={{ color: "#78e6df", fontWeight: 800 }}>$2.99 POWER UP</div>
            <h3>More powers. More momentum.</h3>
            <p>EXPLODE, Reach My People, Sell Something, Help Me Earn, Plan This, Remix It, and better saved-project continuity.</p>
            {access.entitlements.powerUp
    ? <a href="/elevate-me-bot/explode" style={{ ...button, background: "#78e6df", color: "#041117" }}>OPEN POWER UP TOOLS ✓</a>
    : <a onClick={() => trackElevateEvent("unlock_open", surface, "power")} href={`/elevate-me-bot/unlock?level=power&surface=${surface}`} style={{ ...button, background: "#16b8c4", color: "#041117" }}>POWER UP</a>}
          </div>
          <div style={card}>
            <div style={{ color: "#f3c969", fontWeight: 800 }}>$7.99 MAKE IT REAL</div>
            <h3>Move from digital to real-world results.</h3>
            <p>Print My Stuff, HUB merch access, physical promo pathways, order/ship connections, and Creator College Freshman.</p>
            {access.entitlements.makeItReal
    ? <a href="/elevate-me-bot/make-it-real" style={{ ...button, background: "#f3c969", color: "#111" }}>PRINT MY STUFF ✓</a>
    : <a onClick={() => trackElevateEvent("unlock_open", surface, "real")} href={`/elevate-me-bot/unlock?level=real&surface=${surface}${getElevateCycleKey() ? `&elv=${encodeURIComponent(getElevateCycleKey()!)}` : ""}`} style={{ ...button, background: "#f3c969", color: "#111" }}>MAKE IT REAL</a>}
          </div>
        </section>

        <footer style={{ textAlign: "center", color: "#b9b4ca", paddingTop: 32, fontSize: 14 }}>
          Customize → $1 Activate → $2.99 Power Up → $7.99 Make It Real → Creator
        </footer>
      </div>
    </main>
  );
}
