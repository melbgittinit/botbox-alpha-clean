"use client";

import { useEffect, useState } from "react";

export default function ElevateGiftPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [credits, setCredits] = useState(0);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [claimUrl, setClaimUrl] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/elevate/entitlements", { cache: "no-store" })
      .then(async r => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(data => {
        setAuthenticated(true);
        setCredits(data.entitlements?.giftCreditsPurchased || 0);
      })
      .catch(() => {
        setAuthenticated(false);
        setCredits(0);
      });
  }, []);

  async function createGift() {
    setStatus("Creating your gift link…");
    setClaimUrl("");
    const response = await fetch("/api/elevate/gifts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ recipientEmail, recipientName, message }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus(data.error === "NO_GIFT_CREDITS"
        ? "No unused Gift a Bot credits are available on this account."
        : data.error === "INVALID_RECIPIENT_EMAIL"
          ? "Enter a valid recipient email."
          : "We could not create the gift link.");
      return;
    }
    setClaimUrl(data.gift.claimUrl);
    setStatus("Gift ready. Copy and send this private claim link.");
  }

  return (
    <main style={{minHeight:"100vh",background:"linear-gradient(145deg,#10051f,#22103d 55%,#07323b)",color:"#fff",padding:"36px 18px",fontFamily:"Arial,sans-serif"}}>
      <div style={{maxWidth:760,margin:"0 auto"}}>
        <p style={{letterSpacing:".14em",textTransform:"uppercase",color:"#f3c969",fontWeight:800}}>ELEVATE ME BOT • GIFT CENTER</p>
        <h1 style={{fontSize:"clamp(42px,8vw,72px)",lineHeight:.95}}>Gift an Elevate Me Bot</h1>
        <p style={{fontSize:19,lineHeight:1.6,color:"#ddd9ef"}}>Use a purchased Gift a Bot credit to create a private activation link for one person.</p>

        {!authenticated ? (
          <a href="/api/auth/shopify/start?next=%2Felevate-me-bot%2Fgift" style={{display:"inline-block",padding:"14px 20px",borderRadius:999,background:"#f3c969",color:"#111",textDecoration:"none",fontWeight:800}}>SIGN IN TO USE MY GIFT CREDITS</a>
        ) : (
          <section style={{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.18)",borderRadius:22,padding:22}}>
            <div style={{marginBottom:18,fontWeight:800}}>Purchased gift credits on account: {credits}</div>
            <label style={{display:"block",marginBottom:14}}>
              <span style={{display:"block",marginBottom:6}}>Recipient email</span>
              <input value={recipientEmail} onChange={e=>setRecipientEmail(e.target.value)} type="email" style={{width:"100%",boxSizing:"border-box",padding:13,borderRadius:12,border:"1px solid #6b6790",background:"#0a1028",color:"#fff"}} />
            </label>
            <label style={{display:"block",marginBottom:14}}>
              <span style={{display:"block",marginBottom:6}}>Recipient name (optional)</span>
              <input value={recipientName} onChange={e=>setRecipientName(e.target.value)} style={{width:"100%",boxSizing:"border-box",padding:13,borderRadius:12,border:"1px solid #6b6790",background:"#0a1028",color:"#fff"}} />
            </label>
            <label style={{display:"block",marginBottom:14}}>
              <span style={{display:"block",marginBottom:6}}>Personal message (optional)</span>
              <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={4} style={{width:"100%",boxSizing:"border-box",padding:13,borderRadius:12,border:"1px solid #6b6790",background:"#0a1028",color:"#fff"}} />
            </label>
            <button onClick={createGift} disabled={!credits} style={{padding:"14px 20px",borderRadius:999,border:0,background:"#7d4df5",color:"#fff",fontWeight:800,cursor:credits?"pointer":"not-allowed",opacity:credits?1:.5}}>CREATE PRIVATE GIFT LINK</button>
            {status && <p style={{marginTop:16,color:"#ddd9ef"}}>{status}</p>}
            {claimUrl && (
              <div style={{marginTop:16,padding:14,borderRadius:14,background:"#0a1028",wordBreak:"break-all"}}>
                <strong>Private claim link</strong>
                <div style={{marginTop:8}}>{claimUrl}</div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
