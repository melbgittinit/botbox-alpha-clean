"use client";

import { useEffect, useState } from "react";

type Need = "make" | "done" | "reach" | "earn" | "better" | "next";
type Surface = "hub" | "botstores";

const checkout = {
  activate: "https://urbanspirit.biz/products/elevate-me-bot-activation-power-levels?variant=53879074324773",
  gift: "https://urbanspirit.biz/products/elevate-me-bot-activation-power-levels?variant=53879074357541",
  power: "https://urbanspirit.biz/products/elevate-me-bot-activation-power-levels?variant=53879074390309",
  real: "https://urbanspirit.biz/products/elevate-me-bot-activation-power-levels?variant=53879074423077",
};

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSurface(params.get("surface") === "botstores" ? "botstores" : "hub");
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

  function saveAndRun(n: Need = need) {
    try {
      localStorage.setItem(
        "elevate_me_bot_profile",
        JSON.stringify({ botName, mission, need: n, surface, updatedAt: new Date().toISOString() })
      );
    } catch {}
    setNeed(n);
    setResult(firstElevation(n, mission));
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
            <button onClick={() => saveAndRun()} style={{ ...button, background: "#f3c969", color: "#111" }}>PREVIEW MY FIRST ELEVATION</button>
            <a href={checkout.activate} style={{ ...button, background: "#fff", color: "#111" }}>ACTIVATE FOR $1</a>
          </div>
        </section>

        {result && (
          <section style={{ ...card, marginBottom: 18, background: "rgba(255,255,255,.12)" }}>
            <div style={{ color: "#78e6df", fontWeight: 800 }}>✓ ELEVATION COMPLETE</div>
            <h2 style={{ fontSize: 30, margin: "8px 0" }}>{botName || "Your Bot"} says:</h2>
            <ol style={{ lineHeight: 1.75, fontSize: 18 }}>
              {result.map((r, i) => <li key={i}>{r}</li>)}
            </ol>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
              <button onClick={() => saveAndRun("reach")} style={{ ...button, background: "#fff", color: "#111" }}>SEND IT • 1 / 5 / 50</button>
              <a href={checkout.power} style={{ ...button, background: "#16b8c4", color: "#041117" }}>EXPLODE IT • POWER UP $2.99</a>
              <a href={checkout.gift} style={{ ...button, background: "#7d4df5", color: "#fff" }}>GIFT A BOT • $1.99</a>
            </div>
          </section>
        )}

        <section style={{ ...card, marginBottom: 18 }}>
          <div style={{ color: "#78e6df", fontWeight: 800, letterSpacing: ".08em" }}>ONE-TOUCH HOME</div>
          <h2 style={{ fontSize: 30 }}>What should we elevate next?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 12 }}>
            {needs.map(n => (
              <button key={n.id} onClick={() => saveAndRun(n.id)} style={{ textAlign: "left", padding: 18, borderRadius: 17, border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.06)", color: "#fff", cursor: "pointer" }}>
                <strong style={{ display: "block", fontSize: 18 }}>{n.label.toUpperCase()}</strong>
                <span style={{ color: "#c9c5dd", fontSize: 14 }}>One touch → useful next action</span>
              </button>
            ))}
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
          <div style={card}>
            <div style={{ color: "#78e6df", fontWeight: 800 }}>$2.99 POWER UP</div>
            <h3>More powers. More momentum.</h3>
            <p>EXPLODE, Reach My People, Sell Something, Help Me Earn, Plan This, Remix It, and better saved-project continuity.</p>
            <a href={checkout.power} style={{ ...button, background: "#16b8c4", color: "#041117" }}>POWER UP</a>
          </div>
          <div style={card}>
            <div style={{ color: "#f3c969", fontWeight: 800 }}>$7.99 MAKE IT REAL</div>
            <h3>Move from digital to real-world results.</h3>
            <p>Print My Stuff, HUB merch access, physical promo pathways, order/ship connections, and Creator College Freshman.</p>
            <a href={checkout.real} style={{ ...button, background: "#f3c969", color: "#111" }}>MAKE IT REAL</a>
          </div>
        </section>

        <footer style={{ textAlign: "center", color: "#b9b4ca", paddingTop: 32, fontSize: 14 }}>
          Customize → $1 Activate → $2.99 Power Up → $7.99 Make It Real → Creator
        </footer>
      </div>
    </main>
  );
}
