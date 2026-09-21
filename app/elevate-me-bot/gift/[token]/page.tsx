"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ElevateGiftClaimPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [state, setState] = useState<"idle"|"claiming"|"claimed"|"auth"|"error">("idle");
  const [message, setMessage] = useState("");

  async function claim() {
    setState("claiming");
    const response = await fetch(`/api/elevate/gifts/${token}/claim`, { method: "POST" });
    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      setState("auth");
      return;
    }
    if (!response.ok) {
      setState("error");
      setMessage(
        data.error === "GIFT_EMAIL_MISMATCH"
          ? "This gift was sent to a different email address. Sign in with the email that received the gift."
          : data.error === "GIFT_ALREADY_CLAIMED"
            ? "This gift has already been claimed."
            : "We could not claim this gift."
      );
      return;
    }
    setState("claimed");
    setMessage(data.message || "Your Elevate Me Bot activation is now unlocked.");
  }

  useEffect(() => {
    if (token) claim();
  }, [token]);

  return (
    <main style={{minHeight:"100vh",background:"linear-gradient(145deg,#07152f,#181047 50%,#07323b)",color:"#fff",padding:"40px 18px",fontFamily:"Arial,sans-serif"}}>
      <div style={{maxWidth:720,margin:"0 auto",textAlign:"center"}}>
        <p style={{letterSpacing:".14em",textTransform:"uppercase",color:"#f3c969",fontWeight:800}}>SOMEONE BELIEVES IN YOUR NEXT LEVEL</p>
        <h1 style={{fontSize:"clamp(42px,8vw,72px)",lineHeight:.95}}>You’ve been gifted an Elevate Me Bot.</h1>

        {state === "claiming" && <p style={{fontSize:19}}>Checking your gift…</p>}

        {state === "auth" && (
          <>
            <p style={{fontSize:19,lineHeight:1.6,color:"#ddd9ef"}}>Sign in with the Shopify customer email that received this gift. You’ll return here automatically.</p>
            <a href={`/api/auth/shopify/start?next=${encodeURIComponent(`/elevate-me-bot/gift/${token}`)}`} style={{display:"inline-block",padding:"14px 20px",borderRadius:999,background:"#f3c969",color:"#111",textDecoration:"none",fontWeight:800}}>SIGN IN & CLAIM MY BOT</a>
          </>
        )}

        {state === "claimed" && (
          <>
            <div style={{fontSize:18,color:"#78e6df",fontWeight:800,margin:"18px 0"}}>✓ ELEVATE ME BOT ACTIVATED</div>
            <p style={{fontSize:19,lineHeight:1.6,color:"#ddd9ef"}}>{message}</p>
            <a href="/elevate-me-bot" style={{display:"inline-block",padding:"14px 20px",borderRadius:999,background:"#78e6df",color:"#041117",textDecoration:"none",fontWeight:800}}>OPEN MY ELEVATE ME BOT</a>
          </>
        )}

        {state === "error" && (
          <>
            <p style={{fontSize:19,lineHeight:1.6,color:"#ffd7d7"}}>{message}</p>
            <button onClick={claim} style={{padding:"14px 20px",borderRadius:999,border:0,background:"#fff",color:"#111",fontWeight:800,cursor:"pointer"}}>TRY AGAIN</button>
          </>
        )}
      </div>
    </main>
  );
}
