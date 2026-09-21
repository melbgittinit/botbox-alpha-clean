"use client";

import { useEffect, useState } from "react";

type Outputs = {
  social: string;
  text: string;
  emailSubject: string;
  emailBody: string;
  cta: string;
  followUp: string;
  send1: string;
  send5: string;
  send50: string;
};

export default function ElevateExplodePage() {
  const [source, setSource] = useState("");
  const [mission, setMission] = useState("");
  const [audience, setAudience] = useState("");
  const [outputs, setOutputs] = useState<Outputs | null>(null);
  const [state, setState] = useState<"checking"|"locked"|"ready"|"working"|"error">("checking");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("elevate_me_bot_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.mission) setMission(parsed.mission);
      }
    } catch {}

    fetch("/api/elevate/entitlements", { cache: "no-store" })
      .then(async r => {
        if (!r.ok) throw new Error("AUTH");
        return r.json();
      })
      .then(data => setState(data.entitlements?.powerUp ? "ready" : "locked"))
      .catch(() => setState("locked"));
  }, []);

  async function explode() {
    setState("working");
    const response = await fetch("/api/elevate/explode", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ source, mission, audience }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setState("error");
      return;
    }
    setOutputs(data.outputs);
    setState("ready");
  }

  const card: React.CSSProperties = {background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.17)",borderRadius:18,padding:18};

  return (
    <main style={{minHeight:"100vh",background:"linear-gradient(145deg,#07152f,#181047 50%,#07323b)",color:"#fff",padding:"36px 18px",fontFamily:"Arial,sans-serif"}}>
      <div style={{maxWidth:980,margin:"0 auto"}}>
        <p style={{letterSpacing:".14em",textTransform:"uppercase",color:"#78e6df",fontWeight:800}}>ELEVATE ME BOT • POWER UP</p>
        <h1 style={{fontSize:"clamp(44px,9vw,80px)",lineHeight:.94,margin:"10px 0"}}>EXPLODE</h1>
        <p style={{fontSize:20,lineHeight:1.55,color:"#ddd9ef",maxWidth:760}}>Turn one useful result into a ready-to-share mini campaign—without making you start over.</p>

        {state === "locked" ? (
          <section style={card}>
            <h2>EXPLODE is a $2.99 Power Up capability.</h2>
            <p>Unlock it once, then use the Power Up toolset whenever your entitlement is active.</p>
            <a href="https://urbanspirit.biz/products/elevate-me-bot-activation-power-levels?variant=53879074390309" style={{display:"inline-block",padding:"14px 20px",borderRadius:999,background:"#16b8c4",color:"#041117",textDecoration:"none",fontWeight:800}}>POWER UP FOR $2.99</a>
            <a href="/api/auth/shopify/start?next=%2Felevate-me-bot%2Fexplode" style={{display:"inline-block",marginLeft:10,padding:"14px 20px",borderRadius:999,border:"1px solid rgba(255,255,255,.4)",color:"#fff",textDecoration:"none",fontWeight:800}}>I ALREADY BOUGHT IT</a>
          </section>
        ) : (
          <>
            <section style={{...card,marginBottom:18}}>
              <label style={{display:"block",marginBottom:14}}>
                <strong style={{display:"block",marginBottom:7}}>What should I EXPLODE?</strong>
                <textarea value={source} onChange={e=>setSource(e.target.value)} rows={7} placeholder="Paste the result, idea, offer, announcement or message here." style={{width:"100%",boxSizing:"border-box",padding:14,borderRadius:12,border:"1px solid #6b6790",background:"#0a1028",color:"#fff"}} />
              </label>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
                <label><span style={{display:"block",marginBottom:7}}>What are we elevating?</span><input value={mission} onChange={e=>setMission(e.target.value)} style={{width:"100%",boxSizing:"border-box",padding:12,borderRadius:12,border:"1px solid #6b6790",background:"#0a1028",color:"#fff"}} /></label>
                <label><span style={{display:"block",marginBottom:7}}>Who is this for?</span><input value={audience} onChange={e=>setAudience(e.target.value)} placeholder="customers, church members, friends..." style={{width:"100%",boxSizing:"border-box",padding:12,borderRadius:12,border:"1px solid #6b6790",background:"#0a1028",color:"#fff"}} /></label>
              </div>
              <button onClick={explode} disabled={!source.trim() || state==="working"} style={{marginTop:16,padding:"14px 20px",borderRadius:999,border:0,background:"#16b8c4",color:"#041117",fontWeight:900,cursor:"pointer",opacity:source.trim()?1:.5}}>
                {state==="working" ? "EXPLODING…" : "EXPLODE THIS"}
              </button>
            </section>

            {outputs && (
              <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>
                {[
                  ["SOCIAL", outputs.social],
                  ["TEXT", outputs.text],
                  ["EMAIL SUBJECT", outputs.emailSubject],
                  ["EMAIL", outputs.emailBody],
                  ["CTA", outputs.cta],
                  ["FOLLOW-UP", outputs.followUp],
                  ["SEND 1", outputs.send1],
                  ["SEND 5", outputs.send5],
                  ["SEND 50", outputs.send50],
                ].map(([label,value]) => (
                  <div key={label} style={card}>
                    <strong style={{color:"#78e6df"}}>{label}</strong>
                    <p style={{whiteSpace:"pre-wrap",lineHeight:1.55}}>{value}</p>
                    <button onClick={()=>navigator.clipboard?.writeText(value)} style={{padding:"9px 13px",borderRadius:999,border:"1px solid rgba(255,255,255,.3)",background:"transparent",color:"#fff",cursor:"pointer"}}>COPY</button>
                  </div>
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
