"use client";

import { useEffect, useMemo, useState } from "react";

const checkout = {
  activate: "https://urbanspirit.biz/products/elevate-me-bot-activation-power-levels?variant=53879074324773",
  gift: "https://urbanspirit.biz/products/elevate-me-bot-activation-power-levels?variant=53879074357541",
  power: "https://urbanspirit.biz/products/elevate-me-bot-activation-power-levels?variant=53879074390309",
  real: "https://urbanspirit.biz/products/elevate-me-bot-activation-power-levels?variant=53879074423077",
} as const;

function validCycle(value: string | null) {
  const candidate = String(value || "").trim().toUpperCase();
  return /^ELV-\d{8}-[A-Z0-9]{2,12}$/.test(candidate) ? candidate : "";
}

function withCycle(url: string, cycleKey: string) {
  if (!cycleKey) return url;
  try {
    const target = new URL(url, window.location.origin);
    target.searchParams.set("elv", cycleKey);
    target.searchParams.set("utm_source", "elevate_landing");
    target.searchParams.set("utm_medium", "owned");
    target.searchParams.set("utm_campaign", cycleKey);
    return target.origin === window.location.origin
      ? target.pathname + target.search + target.hash
      : target.toString();
  } catch {
    return url;
  }
}

const card: React.CSSProperties = {
  border: "1px solid rgba(243,201,105,.22)",
  borderRadius: 24,
  background: "rgba(255,255,255,.045)",
  boxShadow: "0 22px 65px rgba(0,0,0,.28)",
};

export default function ElevateSalesLanding() {
  const [cycleKey, setCycleKey] = useState("");

  function track(eventType: string, offer?: "activate"|"gift"|"power"|"real") {
    try {
      const sessionId = localStorage.getItem("elevate_measurement_session") || `elevate-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem("elevate_measurement_session", sessionId);
      void fetch("/api/elevate/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          eventType,
          sessionId,
          cycleKey: cycleKey || null,
          surface: "hub",
          offer,
          channel: "landing_page",
          source: "elevate_sales_landing",
          payload: { path: window.location.pathname },
        }),
      });
    } catch {}
  }

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const incoming = validCycle(params.get("elv") || params.get("utm_campaign"));
      if (incoming) {
        localStorage.setItem("elevate_cycle_key", JSON.stringify({ key: incoming, at: Date.now() }));
        setCycleKey(incoming);
        return;
      }
      const raw = localStorage.getItem("elevate_cycle_key");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const key = validCycle(parsed?.key || null);
      const at = Number(parsed?.at || 0);
      if (key && at > 0 && Date.now() - at <= 7 * 24 * 60 * 60 * 1000) setCycleKey(key);
    } catch {}
  }, []);

  useEffect(() => {
    track("page_view");
  }, [cycleKey]);

  const links = useMemo(() => ({
    preview: withCycle("/elevate-me-bot?surface=hub", cycleKey),
    activate: withCycle(checkout.activate, cycleKey),
    gift: withCycle(checkout.gift, cycleKey),
    power: withCycle(checkout.power, cycleKey),
    real: withCycle(checkout.real, cycleKey),
  }), [cycleKey]);

  return (
    <main style={{
      minHeight:"100vh",
      background:"radial-gradient(circle at 14% 0%,rgba(102,73,255,.23),transparent 32%),radial-gradient(circle at 86% 10%,rgba(243,201,105,.16),transparent 31%),linear-gradient(145deg,#05060b,#121035 52%,#062c35)",
      color:"#fff",
      fontFamily:"Arial,sans-serif",
      padding:"0 16px 72px"
    }}>
      <section style={{maxWidth:1160,margin:"0 auto",padding:"78px 0 44px",textAlign:"center"}}>
        <div style={{display:"inline-flex",gap:8,alignItems:"center",padding:"8px 13px",border:"1px solid rgba(120,230,223,.45)",borderRadius:999,background:"rgba(120,230,223,.08)",color:"#78e6df",fontSize:11,fontWeight:900,letterSpacing:".14em"}}>
          LIVE IN THE HUB
        </div>
        <h1 style={{fontSize:"clamp(54px,9vw,104px)",lineHeight:.9,margin:"20px 0 16px",letterSpacing:"-.04em"}}>
          ELEVATE<br/>ME BOT
        </h1>
        <p style={{maxWidth:800,margin:"0 auto",fontSize:"clamp(19px,2.1vw,26px)",lineHeight:1.45,color:"#e4def4"}}>
          Tell it what you need. Get a useful next move. Then level up only when you want more power.
        </p>
        <div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap",marginTop:26}}>
          <a href={links.preview} style={{padding:"15px 22px",borderRadius:999,background:"#f3c969",color:"#111",textDecoration:"none",fontWeight:900}}>TRY THE FREE PREVIEW</a>
          <a onClick={() => track("checkout_intent","activate")} href={links.activate} style={{padding:"15px 22px",borderRadius:999,background:"#fff",color:"#111",textDecoration:"none",fontWeight:900}}>ACTIVATE FOR $1</a>
        </div>
        <p style={{margin:"14px auto 0",maxWidth:700,color:"#bdb6cf",fontSize:13,lineHeight:1.5}}>
          One-time prepaid levels. No forced subscription. Start with the smallest useful step.
        </p>
      </section>

      <section style={{maxWidth:1160,margin:"0 auto 22px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14}}>
        {[
          ["MAKE SOMETHING","Turn an idea into a useful first version."],
          ["GET IT DONE","Break a stuck task into the next visible move."],
          ["REACH MY PEOPLE","Prepare a message or outreach path for 1, 5 or 50."],
          ["EARN SOMETHING","Shape a practical value offer or earning move."],
          ["MAKE IT BETTER","Improve what you already have before starting over."],
          ["MY NEXT MOVE","Choose one action instead of another giant plan."],
        ].map(([title,copy]) => (
          <article key={title} style={{...card,padding:20}}>
            <strong style={{display:"block",color:"#f3c969",fontSize:14,letterSpacing:".07em"}}>{title}</strong>
            <p style={{margin:"9px 0 0",color:"#d8d2e5",lineHeight:1.55}}>{copy}</p>
          </article>
        ))}
      </section>

      <section style={{maxWidth:1160,margin:"30px auto",...card,padding:"32px 26px"}}>
        <div style={{maxWidth:780}}>
          <div style={{color:"#78e6df",fontWeight:900,letterSpacing:".11em",fontSize:12}}>START SMALL · ADD POWER ONLY WHEN IT HELPS</div>
          <h2 style={{fontSize:"clamp(34px,5vw,58px)",margin:"10px 0 12px"}}>Four simple levels.</h2>
          <p style={{color:"#d8d2e5",lineHeight:1.65,fontSize:17}}>The ladder is intentionally inexpensive. Preview first, activate the working Bot for $1, then add specialized power only when you need it.</p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,marginTop:24}}>
          {[
            ["$1","ACTIVATE","Starts the operating Bot: first Elevation, basic one-touch actions and basic sharing.",links.activate],
            ["$1.99","GIFT A BOT","Give somebody else an Elevate activation experience.",links.gift],
            ["$2.99","POWER UP","Adds EXPLODE and deeper reach, selling, planning and remix powers.",links.power],
            ["$7.99","MAKE IT REAL","Adds physical-output pathways, print preparation and Creator College Freshman connections.",links.real],
          ].map(([price,title,copy,href]) => (
            <article key={title} style={{padding:20,border:"1px solid rgba(243,201,105,.24)",borderRadius:18,background:"rgba(0,0,0,.18)"}}>
              <div style={{fontSize:32,fontWeight:900,color:"#f3c969"}}>{price}</div>
              <h3 style={{margin:"6px 0 8px",fontSize:21}}>{title}</h3>
              <p style={{margin:"0 0 16px",color:"#d7d0e4",lineHeight:1.5,fontSize:14}}>{copy}</p>
              <a onClick={() => track("checkout_intent", title === "ACTIVATE" ? "activate" : title === "GIFT A BOT" ? "gift" : title === "POWER UP" ? "power" : "real")} href={href} style={{display:"inline-flex",padding:"11px 15px",borderRadius:999,border:"1px solid rgba(255,255,255,.36)",color:"#fff",textDecoration:"none",fontWeight:800,fontSize:12}}>CHOOSE {title}</a>
            </article>
          ))}
        </div>
      </section>

      <section style={{maxWidth:1160,margin:"30px auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:14}}>
        <article style={{...card,padding:24}}>
          <div style={{color:"#78e6df",fontWeight:900}}>WHAT IS ALREADY LIVE</div>
          <h3 style={{fontSize:26,margin:"9px 0 10px"}}>A working Bot—not a coming-soon card.</h3>
          <p style={{color:"#d8d2e5",lineHeight:1.6}}>Preview, activation verification, one-touch actions, Power Up, Gift a Bot, Make It Real preparation, Shopify entitlements and campaign attribution are connected to the live system.</p>
        </article>
        <article style={{...card,padding:24}}>
          <div style={{color:"#f3c969",fontWeight:900}}>CONTROLLED SALES</div>
          <h3 style={{fontSize:26,margin:"9px 0 10px"}}>Built to learn before it scales.</h3>
          <p style={{color:"#d8d2e5",lineHeight:1.6}}>Outbound activity is measured by verified sends, visits, activations, upgrades, refunds, costs and contribution—not by revenue alone.</p>
        </article>
        <article style={{...card,padding:24}}>
          <div style={{color:"#bba5ff",fontWeight:900}}>PRIVACY + PERMISSION</div>
          <h3 style={{fontSize:26,margin:"9px 0 10px"}}>Permissioned outreach first.</h3>
          <p style={{color:"#d8d2e5",lineHeight:1.6}}>The sales controller is designed to prioritize owned/permissioned audiences and hold growth when measurement, deliverability or economics are unclear.</p>
        </article>
      </section>

      <section style={{maxWidth:900,margin:"42px auto 0",textAlign:"center",padding:"36px 24px",borderRadius:28,background:"linear-gradient(135deg,rgba(243,201,105,.14),rgba(120,230,223,.09))",border:"1px solid rgba(243,201,105,.28)"}}>
        <div style={{color:"#f3c969",fontSize:12,fontWeight:900,letterSpacing:".12em"}}>READY WHEN YOU ARE</div>
        <h2 style={{fontSize:"clamp(34px,5vw,56px)",margin:"10px 0"}}>Elevate one thing today.</h2>
        <p style={{maxWidth:650,margin:"0 auto",color:"#ddd7e8",fontSize:17,lineHeight:1.6}}>Use the free preview to see the experience. Activate only if you want the working Bot.</p>
        <div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap",marginTop:22}}>
          <a href={links.preview} style={{padding:"14px 21px",borderRadius:999,background:"#f3c969",color:"#111",textDecoration:"none",fontWeight:900}}>TRY MY PREVIEW</a>
          <a onClick={() => track("checkout_intent","activate")} href={links.activate} style={{padding:"14px 21px",borderRadius:999,border:"1px solid rgba(255,255,255,.45)",color:"#fff",textDecoration:"none",fontWeight:900}}>ACTIVATE FOR $1</a>
        </div>
      </section>
    </main>
  );
}
