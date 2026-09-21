"use client";

import { useEffect, useMemo, useState } from "react";

const offers = {
  activate: {
    label: "$1 Activate",
    href: "https://urbanspirit.biz/products/elevate-me-bot-activation-power-levels?variant=53879074324773",
    required: "activated",
    unlocked: "ACTIVATE UNLOCKED",
  },
  power: {
    label: "$2.99 Power Up",
    href: "https://urbanspirit.biz/products/elevate-me-bot-activation-power-levels?variant=53879074390309",
    required: "powerUp",
    unlocked: "POWER UP UNLOCKED",
  },
  real: {
    label: "$7.99 Make It Real",
    href: "https://urbanspirit.biz/products/elevate-me-bot-activation-power-levels?variant=53879074423077",
    required: "makeItReal",
    unlocked: "MAKE IT REAL UNLOCKED",
  },
} as const;

type Level = keyof typeof offers;

export default function ElevateUnlockPage() {
  const [level, setLevel] = useState<Level>("activate");
  const [surface, setSurface] = useState<"hub"|"botstores">("hub");
  const offer = offers[level] || offers.activate;
  const [state, setState] = useState<"idle"|"checking"|"auth"|"locked"|"unlocked"|"error">("idle");
  const [message, setMessage] = useState("");

  const returnPath = useMemo(
    () => `/elevate-me-bot/unlock?level=${level}&surface=${surface}`,
    [level, surface]
  );

  async function verify() {
    setState("checking");
    try {
      const response = await fetch("/api/elevate/entitlements", { cache: "no-store" });
      if (response.status === 401) {
        setState("auth");
        return;
      }
      const data = await response.json();
      const owns = Boolean(data.entitlements?.[offer.required]);
      if (owns) {
        setState("unlocked");
        setMessage(offer.unlocked);
      } else {
        setState("locked");
        setMessage("We do not see that purchase on this Shopify customer account yet.");
      }
    } catch {
      setState("error");
      setMessage("We could not verify the purchase right now.");
    }
  }

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const nextLevel = (search.get("level") || "activate") as Level;
    const nextSurface = search.get("surface") === "botstores" ? "botstores" : "hub";
    setLevel(offers[nextLevel] ? nextLevel : "activate");
    setSurface(nextSurface);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("elevate_pending_unlock", JSON.stringify({ level, surface, startedAt: new Date().toISOString() }));
    } catch {}
    verify();
  }, [level, surface]);

  return (
    <main style={{minHeight:"100vh",background:"linear-gradient(145deg,#07152f,#181047 50%,#07323b)",color:"#fff",padding:"40px 18px",fontFamily:"Arial,sans-serif"}}>
      <div style={{maxWidth:760,margin:"0 auto",textAlign:"center"}}>
        <p style={{letterSpacing:".14em",textTransform:"uppercase",color:"#f3c969",fontWeight:800}}>ELEVATE ME BOT • LEVEL UP</p>
        <h1 style={{fontSize:"clamp(44px,9vw,78px)",lineHeight:.94,margin:"10px 0"}}>{offer.label}</h1>
        <p style={{fontSize:19,lineHeight:1.6,color:"#ddd9ef"}}>Buy the level in Shopify, then come back here and let your Bot verify the purchase and light up the new capability.</p>

        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",margin:"24px 0"}}>
          {state !== "unlocked" && (
            <a href={offer.href} style={{display:"inline-block",padding:"14px 20px",borderRadius:999,background:"#f3c969",color:"#111",textDecoration:"none",fontWeight:900}}>BUY {offer.label.toUpperCase()}</a>
          )}
          <button onClick={verify} style={{padding:"14px 20px",borderRadius:999,border:"1px solid rgba(255,255,255,.45)",background:"transparent",color:"#fff",fontWeight:800,cursor:"pointer"}}>VERIFY MY PURCHASE</button>
        </div>

        {state === "auth" && (
          <div style={{padding:22,borderRadius:20,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.17)"}}>
            <p>Sign in with the Shopify customer account used for the purchase. You’ll return to this unlock screen automatically.</p>
            <a href={`/api/auth/shopify/start?next=${encodeURIComponent(returnPath)}`} style={{display:"inline-block",padding:"13px 18px",borderRadius:999,background:"#fff",color:"#111",textDecoration:"none",fontWeight:800}}>SIGN IN & VERIFY</a>
          </div>
        )}

        {state === "locked" && (
          <div style={{padding:22,borderRadius:20,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.17)"}}>
            <strong style={{color:"#ffd36d"}}>PURCHASE NOT VERIFIED YET</strong>
            <p style={{color:"#ddd9ef"}}>{message}</p>
          </div>
        )}

        {state === "unlocked" && (
          <div style={{padding:28,borderRadius:24,background:"rgba(120,230,223,.14)",border:"1px solid rgba(120,230,223,.55)",boxShadow:"0 18px 60px rgba(0,0,0,.28)"}}>
            <div style={{fontSize:52}}>⚡</div>
            <h2 style={{fontSize:36,margin:"8px 0",color:"#78e6df"}}>NEW POWER UNLOCKED</h2>
            <p style={{fontSize:20,fontWeight:800}}>{message}</p>
            <a href={level === "power" ? "/elevate-me-bot/explode" : `/elevate-me-bot?surface=${surface}`} style={{display:"inline-block",marginTop:12,padding:"14px 20px",borderRadius:999,background:"#78e6df",color:"#041117",textDecoration:"none",fontWeight:900}}>
              {level === "power" ? "USE EXPLODE NOW" : "RETURN TO MY BOT"}
            </a>
          </div>
        )}

        {state === "checking" && <p style={{color:"#78e6df",fontWeight:800}}>Checking your Shopify purchase…</p>}
        {state === "error" && <p style={{color:"#ffd7d7"}}>{message}</p>}
      </div>
    </main>
  );
}
