"use client";

import { useEffect, useState } from "react";

const items = [
  {
    id: "tumbler",
    name: "20oz Stainless Tumbler",
    status: "live",
    price: "$37.99",
    image: "https://cdn.shopify.com/s/files/1/1982/3607/files/192093817575625513_2048.jpg?v=1781067167",
    href: "https://urbanspirit.biz/products/priority-me-20oz-stainless-tumbler-motivational-travel-coffee-cup",
    note: "Existing HUB / Printify product available now."
  },
  {
    id: "shirt",
    name: "Elevate T-Shirt",
    status: "mapping",
    price: "Provider mapping required",
    note: "Will use controlled Printify blueprint/provider/variant mapping."
  },
  {
    id: "tote",
    name: "Elevate Tote",
    status: "mapping",
    price: "Provider mapping required",
    note: "Held until provider mapping and cost/margin quote are verified."
  },
  {
    id: "journal",
    name: "Elevate Journal",
    status: "mapping",
    price: "Provider mapping required",
    note: "Held until provider mapping and cost/margin quote are verified."
  },
  {
    id: "qr-pack",
    name: "QR Promo Card Pack",
    status: "print",
    price: "Use Print My Stuff",
    href: "/elevate-me-bot/make-it-real",
    note: "Create a QR card through the existing Make It Real print workflow."
  }
] as const;

export default function ElevateMerchPage() {
  const [access, setAccess] = useState<"checking"|"locked"|"ready">("checking");

  useEffect(() => {
    fetch("/api/elevate/entitlements", { cache: "no-store" })
      .then(async r => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(data => setAccess(data.entitlements?.makeItReal ? "ready" : "locked"))
      .catch(() => setAccess("locked"));
  }, []);

  const card: React.CSSProperties = {
    background: "rgba(255,255,255,.08)",
    border: "1px solid rgba(255,255,255,.17)",
    borderRadius: 20,
    padding: 20,
  };

  return (
    <main style={{minHeight:"100vh",background:"linear-gradient(145deg,#07152f,#181047 50%,#07323b)",color:"#fff",padding:"36px 18px",fontFamily:"Arial,sans-serif"}}>
      <div style={{maxWidth:1050,margin:"0 auto"}}>
        <p style={{letterSpacing:".14em",textTransform:"uppercase",color:"#f3c969",fontWeight:800}}>ELEVATE ME BOT • MAKE IT REAL</p>
        <h1 style={{fontSize:"clamp(44px,9vw,82px)",lineHeight:.94,margin:"10px 0"}}>PUT THIS ON SOMETHING</h1>
        <p style={{fontSize:20,lineHeight:1.55,color:"#ddd9ef",maxWidth:780}}>
          Start with a controlled catalog. Use existing HUB merchandise now, or move into custom production only when provider cost, margin and fulfillment are verified.
        </p>

        {access === "locked" && (
          <section style={card}>
            <h2>Merch is part of Make It Real.</h2>
            <a href="/elevate-me-bot/unlock?level=real" style={{display:"inline-block",padding:"14px 20px",borderRadius:999,background:"#f3c969",color:"#111",textDecoration:"none",fontWeight:900}}>UNLOCK MAKE IT REAL</a>
          </section>
        )}

        {access === "ready" && (
          <>
            <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:14}}>
              {items.map(item => (
                <div key={item.id} style={card}>
                  {"image" in item && item.image && (
                    <img src={item.image} alt={item.name} style={{width:"100%",aspectRatio:"1/1",objectFit:"cover",borderRadius:14,marginBottom:14}} />
                  )}
                  <div style={{fontSize:12,letterSpacing:".08em",textTransform:"uppercase",color:item.status==="live"?"#78e6df":item.status==="print"?"#f3c969":"#c9c5dd",fontWeight:800}}>
                    {item.status==="live" ? "AVAILABLE NOW" : item.status==="print" ? "PRINT WORKFLOW" : "CONTROLLED / NOT LIVE"}
                  </div>
                  <h2 style={{margin:"8px 0"}}>{item.name}</h2>
                  <p style={{fontWeight:800}}>{item.price}</p>
                  <p style={{color:"#ddd9ef",lineHeight:1.55}}>{item.note}</p>
                  {"href" in item && item.href ? (
                    <a href={item.href} style={{display:"inline-block",padding:"12px 16px",borderRadius:999,background:item.status==="live"?"#78e6df":"#f3c969",color:"#111",textDecoration:"none",fontWeight:900}}>
                      {item.status==="live" ? "SHOP THIS" : "BUILD THIS"}
                    </a>
                  ) : (
                    <span style={{display:"inline-block",padding:"12px 16px",borderRadius:999,border:"1px solid rgba(255,255,255,.25)",color:"#c9c5dd",fontWeight:800}}>MAPPING REQUIRED</span>
                  )}
                </div>
              ))}
            </section>

            <section style={{...card,marginTop:18}}>
              <strong style={{color:"#f3c969"}}>CONTROL RULE</strong>
              <p style={{lineHeight:1.6,color:"#ddd9ef"}}>
                No custom merch item becomes purchasable until its provider blueprint, provider, variant, production cost, shipping behavior and target margin have all been verified.
              </p>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <a href="/elevate-me-bot/make-it-real" style={{display:"inline-block",padding:"12px 16px",borderRadius:999,background:"#fff",color:"#111",textDecoration:"none",fontWeight:900}}>PRINT MY STUFF</a>
                <a href="/elevate-me-bot" style={{display:"inline-block",padding:"12px 16px",borderRadius:999,border:"1px solid rgba(255,255,255,.3)",color:"#fff",textDecoration:"none",fontWeight:800}}>BACK TO MY BOT</a>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
