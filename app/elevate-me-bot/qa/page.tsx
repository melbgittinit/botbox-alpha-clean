"use client";

import { useEffect, useState } from "react";

type Check = { name: string; state: "pass"|"warn"|"fail"|"pending"; detail: string };

export default function ElevateQaPage() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    const next: Check[] = [];

    async function get(name: string, url: string, assess: (r: Response, data: any) => Check) {
      try {
        const r = await fetch(url, { cache: "no-store" });
        const data = await r.json().catch(() => ({}));
        next.push(assess(r, data));
      } catch {
        next.push({ name, state: "fail", detail: "Request failed." });
      }
    }

    await get("Launch health", "/api/elevate/health", (r, data) => ({
      name: "Launch health",
      state: r.ok && data.launchMode === "FULL_V1" ? "pass" : r.ok && data.launchMode === "CONTROLLED_LAUNCH" ? "warn" : "fail",
      detail: r.ok ? `Mode: ${data.launchMode}` : "Health endpoint unavailable."
    }));

    await get("Entitlements", "/api/elevate/entitlements", (r, data) => ({
      name: "Entitlements",
      state: r.status === 401 ? "warn" : r.ok ? "pass" : "fail",
      detail: r.status === 401 ? "Not signed in — expected for anonymous QA." : r.ok ? `Authenticated; level ${data.level}` : "Entitlement route error."
    }));

    await get("Fulfillment status", "/api/elevate/fulfillment/status", (r, data) => ({
      name: "Fulfillment status",
      state: r.ok && data.configured && data.liveOrderingEnabled ? "pass" : r.ok ? "warn" : "fail",
      detail: r.ok
        ? `Printify ${data.configured ? "connected" : "not connected"}; live ordering ${data.liveOrderingEnabled ? "enabled" : "disabled"}.`
        : "Fulfillment status route error."
    }));

    const protectedRoutes = [
      ["/api/elevate/action", { action:"next", mission:"QA check", botName:"QA Bot" }],
      ["/api/elevate/explode", { source:"QA source", mission:"QA", audience:"QA" }],
      ["/api/elevate/make-it-real", { format:"card", title:"QA", message:"QA", cta:"QA" }],
    ] as const;

    for (const [url, body] of protectedRoutes) {
      try {
        const r = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await r.json().catch(() => ({}));
        const expectedProtected = [401,403].includes(r.status);
        next.push({
          name: `Protection: ${url.split("/").pop()}`,
          state: r.ok || expectedProtected ? "pass" : "fail",
          detail: r.ok ? "Authorized route responded." : expectedProtected ? `Protected correctly (${data.error || r.status}).` : `Unexpected status ${r.status}.`
        });
      } catch {
        next.push({ name: `Protection: ${url.split("/").pop()}`, state:"fail", detail:"Request failed." });
      }
    }

    const pages = [
      "/elevate-me-bot",
      "/elevate-me-bot/explode",
      "/elevate-me-bot/gift",
      "/elevate-me-bot/make-it-real",
      "/elevate-me-bot/merch",
      "/elevate-me-bot/unlock?level=activate",
    ];

    for (const url of pages) {
      try {
        const r = await fetch(url, { method:"HEAD", cache:"no-store" });
        next.push({
          name: `Page: ${url.split("?")[0].replace("/elevate-me-bot","Bot") || "Bot"}`,
          state: r.ok ? "pass" : "fail",
          detail: `HTTP ${r.status}`
        });
      } catch {
        next.push({ name:`Page: ${url}`, state:"fail", detail:"Navigation request failed." });
      }
    }

    setChecks(next);
    setRunning(false);
  }

  useEffect(() => { run(); }, []);

  const tone = (s: Check["state"]) =>
    s === "pass" ? "#78e6df" : s === "warn" ? "#f3c969" : s === "fail" ? "#ff9b9b" : "#c9c5dd";

  return (
    <main style={{minHeight:"100vh",background:"#081229",color:"#fff",padding:"32px 16px",fontFamily:"Arial,sans-serif"}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        <p style={{letterSpacing:".14em",textTransform:"uppercase",color:"#f3c969",fontWeight:800}}>ELEVATE ME BOT • PRIORITY 4</p>
        <h1 style={{fontSize:"clamp(40px,8vw,70px)",margin:"8px 0"}}>Launch QA</h1>
        <p style={{color:"#ddd9ef",lineHeight:1.6}}>Non-charging checks only. This console does not create purchases or send provider orders.</p>
        <button onClick={run} disabled={running} style={{padding:"12px 18px",borderRadius:999,border:0,background:"#78e6df",color:"#041117",fontWeight:900,cursor:"pointer",marginBottom:18}}>
          {running ? "RUNNING…" : "RUN QA AGAIN"}
        </button>

        <div style={{display:"grid",gap:10}}>
          {checks.map((c,i)=>(
            <div key={i} style={{padding:16,borderRadius:16,background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.14)",display:"flex",justifyContent:"space-between",gap:16,alignItems:"center",flexWrap:"wrap"}}>
              <div>
                <strong>{c.name}</strong>
                <div style={{color:"#c9c5dd",marginTop:4}}>{c.detail}</div>
              </div>
              <strong style={{color:tone(c.state),textTransform:"uppercase"}}>{c.state}</strong>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
