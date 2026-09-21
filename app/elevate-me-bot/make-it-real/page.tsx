"use client";

import { useEffect, useState } from "react";

type PrintPackage = {
  label: string;
  dimensions: string;
  bleed: string;
  front: { headline: string; body: string; cta: string };
  qr: { destination: string; label: string; backupText: string } | null;
  audience: string;
  printNotes: string[];
  handoff: {
    digitalOnly: string;
    myPrinter: string;
    localPrint: string;
    fulfillmentStatus: string;
  };
};

export default function MakeItRealPage() {
  const [access, setAccess] = useState<"checking"|"locked"|"ready">("checking");
  const [format, setFormat] = useState("qr-card");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [cta, setCta] = useState("");
  const [destination, setDestination] = useState("");
  const [audience, setAudience] = useState("");
  const [pkg, setPkg] = useState<PrintPackage | null>(null);
  const [status, setStatus] = useState("");
  const [fulfillment, setFulfillment] = useState<{configured:boolean;liveOrderingEnabled:boolean;mappings:any}|null>(null);
  const [quantity, setQuantity] = useState(25);
  const [ship, setShip] = useState({firstName:"",lastName:"",email:"",phone:"",country:"US",region:"",address1:"",address2:"",city:"",zip:""});
  const [quote, setQuote] = useState<any>(null);
  const [printJob, setPrintJob] = useState<any>(null);
  const [paymentState, setPaymentState] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("elevate_me_bot_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.mission) {
          setTitle(parsed.mission);
          setAudience(parsed.mission);
        }
      }
    } catch {}

    fetch("/api/elevate/fulfillment/status", { cache: "no-store" }).then(r=>r.json()).then(setFulfillment).catch(()=>setFulfillment(null));

    const params = new URLSearchParams(window.location.search);
    const returnedJob = params.get("job");
    const printPayment = params.get("print_payment");
    if (returnedJob) {
      setPaymentState(printPayment || "");
      fetch("/api/elevate/fulfillment/job?job=" + encodeURIComponent(returnedJob), { cache: "no-store" })
        .then(async r => r.ok ? r.json() : Promise.reject())
        .then(data => setPrintJob(data.job))
        .catch(()=>{});
    }

    fetch("/api/elevate/entitlements", { cache: "no-store" })
      .then(async r => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(data => setAccess(data.entitlements?.makeItReal ? "ready" : "locked"))
      .catch(() => setAccess("locked"));
  }, []);

  async function buildPackage() {
    setStatus("Building print package…");
    setPkg(null);
    const response = await fetch("/api/elevate/make-it-real", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ format, title, message, cta, destination, audience }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus(data.error === "MAKE_IT_REAL_REQUIRED" ? "Make It Real is locked." : "Check the required fields and try again.");
      return;
    }
    setPkg(data.package);
    setStatus("Print package ready.");
  }

  async function getShippingQuote() {
    setStatus("Checking shipping…");
    setQuote(null);
    const response = await fetch("/api/elevate/fulfillment/quote", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        format,
        quantity,
        address: ship,
        artwork: { title, message, cta, destination, audience }
      }),
    });
    const data = await response.json().catch(()=>({}));
    if (!response.ok) {
      setStatus(
        data.error === "PRINT_PROVIDER_NOT_CONNECTED" ? "Print provider connection is not active yet." :
        data.error === "FORMAT_NOT_MAPPED_TO_PROVIDER" ? "This print format is not mapped to a provider product yet." :
        data.error === "SHIPPING_ADDRESS_REQUIRED" ? "Complete the shipping address first." :
        "We could not calculate shipping yet."
      );
      return;
    }
    setQuote(data);
    setPrintJob({ id: data.jobId, status: "QUOTED", retailCents: data.retailCents, artworkUrl: data.artworkUrl });
    setStatus("Print quote ready.");
  }

  async function payPrintJob() {
    if (!quote?.jobId) return;
    setStatus("Opening secure print checkout…");
    const response = await fetch("/api/elevate/fulfillment/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jobId: quote.jobId }),
    });
    const data = await response.json().catch(()=>({}));
    if (!response.ok || !data.checkoutUrl) {
      setStatus("We could not open print checkout.");
      return;
    }
    window.location.href = data.checkoutUrl;
  }

  async function refreshPrintJob() {
    const id = printJob?.id || quote?.jobId;
    if (!id) return;
    const response = await fetch("/api/elevate/fulfillment/job?job=" + encodeURIComponent(id), { cache: "no-store" });
    const data = await response.json().catch(()=>({}));
    if (response.ok) setPrintJob(data.job);
  }

  async function sendToPrint() {
    const id = printJob?.id || quote?.jobId;
    if (!id) return;
    setStatus("Sending paid job to print provider…");
    const response = await fetch("/api/elevate/fulfillment/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jobId: id }),
    });
    const data = await response.json().catch(()=>({}));
    if (!response.ok) {
      setStatus(
        data.error === "LIVE_FULFILLMENT_DISABLED" ? "Live fulfillment is not enabled yet." :
        data.error === "PRINT_JOB_NOT_PAID" ? "Payment has not been confirmed yet." :
        data.error === "PRINT_PROVIDER_NOT_CONNECTED" ? "Print provider is not connected yet." :
        "We could not submit this print job."
      );
      return;
    }
    setPrintJob((prev:any)=>({...(prev||{}), status:data.status, providerOrderId:data.providerOrderId}));
    setStatus("Print job submitted.");
  }

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
        <h1 style={{fontSize:"clamp(44px,9vw,82px)",lineHeight:.94,margin:"10px 0"}}>PRINT MY STUFF</h1>
        <p style={{fontSize:20,lineHeight:1.55,color:"#ddd9ef",maxWidth:760}}>Turn one digital result into a practical production package for a card, flyer, QR card or postcard.</p>

        {access === "locked" && (
          <section style={card}>
            <h2>Make It Real is a $7.99 capability.</h2>
            <p>Unlock print-ready production support, HUB merch pathways and Creator College Freshman access.</p>
            <a href="/elevate-me-bot/unlock?level=real" style={{display:"inline-block",padding:"14px 20px",borderRadius:999,background:"#f3c969",color:"#111",textDecoration:"none",fontWeight:900}}>UNLOCK MAKE IT REAL</a>
          </section>
        )}

        {access === "ready" && (
          <>
            <section style={{...card,marginBottom:18}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
                <label>
                  <span style={{display:"block",marginBottom:7,fontWeight:700}}>Format</span>
                  <select value={format} onChange={e=>setFormat(e.target.value)} style={{width:"100%",padding:12,borderRadius:12,background:"#0a1028",color:"#fff",border:"1px solid #6b6790"}}>
                    <option value="card">Business / Promo Card</option>
                    <option value="flyer">Flyer</option>
                    <option value="qr-card">QR Action Card</option>
                    <option value="postcard">Postcard</option>
                  </select>
                </label>
                <label>
                  <span style={{display:"block",marginBottom:7,fontWeight:700}}>Who is it for?</span>
                  <input value={audience} onChange={e=>setAudience(e.target.value)} placeholder="customers, members, guests..." style={{width:"100%",boxSizing:"border-box",padding:12,borderRadius:12,background:"#0a1028",color:"#fff",border:"1px solid #6b6790"}} />
                </label>
              </div>

              <label style={{display:"block",marginTop:14}}>
                <span style={{display:"block",marginBottom:7,fontWeight:700}}>Headline</span>
                <input value={title} onChange={e=>setTitle(e.target.value)} style={{width:"100%",boxSizing:"border-box",padding:12,borderRadius:12,background:"#0a1028",color:"#fff",border:"1px solid #6b6790"}} />
              </label>
              <label style={{display:"block",marginTop:14}}>
                <span style={{display:"block",marginBottom:7,fontWeight:700}}>Main message</span>
                <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={6} style={{width:"100%",boxSizing:"border-box",padding:12,borderRadius:12,background:"#0a1028",color:"#fff",border:"1px solid #6b6790"}} />
              </label>
              <label style={{display:"block",marginTop:14}}>
                <span style={{display:"block",marginBottom:7,fontWeight:700}}>Call to action</span>
                <input value={cta} onChange={e=>setCta(e.target.value)} placeholder="Scan to create your Bot" style={{width:"100%",boxSizing:"border-box",padding:12,borderRadius:12,background:"#0a1028",color:"#fff",border:"1px solid #6b6790"}} />
              </label>
              <label style={{display:"block",marginTop:14}}>
                <span style={{display:"block",marginBottom:7,fontWeight:700}}>QR / destination URL (optional)</span>
                <input value={destination} onChange={e=>setDestination(e.target.value)} placeholder="https://..." style={{width:"100%",boxSizing:"border-box",padding:12,borderRadius:12,background:"#0a1028",color:"#fff",border:"1px solid #6b6790"}} />
              </label>

              <button onClick={buildPackage} disabled={!title.trim()||!message.trim()||!cta.trim()} style={{marginTop:16,padding:"14px 20px",borderRadius:999,border:0,background:"#f3c969",color:"#111",fontWeight:900,cursor:"pointer",opacity:title.trim()&&message.trim()&&cta.trim()?1:.5}}>BUILD MY PRINT PACKAGE</button>
              {status && <p style={{color:"#ddd9ef"}}>{status}</p>}
            </section>


            <section style={{...card,marginTop:18}}>
              <strong style={{color:"#f3c969"}}>PRINT + SHIP CONNECTION</strong>
              <p style={{color:"#ddd9ef"}}>
                {fulfillment?.configured
                  ? "Printify is connected. Choose quantity and shipping destination to request a live shipping quote."
                  : "The print workflow is ready, but the Printify API connection and product mappings still need to be supplied before live fulfillment can run."}
              </p>

              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10}}>
                <label><span style={{display:"block",marginBottom:6}}>Quantity</span><input type="number" min={1} max={500} value={quantity} onChange={e=>setQuantity(Number(e.target.value)||1)} style={{width:"100%",boxSizing:"border-box",padding:11,borderRadius:10,background:"#0a1028",color:"#fff",border:"1px solid #6b6790"}} /></label>
                <label><span style={{display:"block",marginBottom:6}}>First name</span><input value={ship.firstName} onChange={e=>setShip({...ship,firstName:e.target.value})} style={{width:"100%",boxSizing:"border-box",padding:11,borderRadius:10,background:"#0a1028",color:"#fff",border:"1px solid #6b6790"}} /></label>
                <label><span style={{display:"block",marginBottom:6}}>Last name</span><input value={ship.lastName} onChange={e=>setShip({...ship,lastName:e.target.value})} style={{width:"100%",boxSizing:"border-box",padding:11,borderRadius:10,background:"#0a1028",color:"#fff",border:"1px solid #6b6790"}} /></label>
                <label><span style={{display:"block",marginBottom:6}}>Email</span><input value={ship.email} onChange={e=>setShip({...ship,email:e.target.value})} style={{width:"100%",boxSizing:"border-box",padding:11,borderRadius:10,background:"#0a1028",color:"#fff",border:"1px solid #6b6790"}} /></label>
                <label><span style={{display:"block",marginBottom:6}}>Address</span><input value={ship.address1} onChange={e=>setShip({...ship,address1:e.target.value})} style={{width:"100%",boxSizing:"border-box",padding:11,borderRadius:10,background:"#0a1028",color:"#fff",border:"1px solid #6b6790"}} /></label>
                <label><span style={{display:"block",marginBottom:6}}>City</span><input value={ship.city} onChange={e=>setShip({...ship,city:e.target.value})} style={{width:"100%",boxSizing:"border-box",padding:11,borderRadius:10,background:"#0a1028",color:"#fff",border:"1px solid #6b6790"}} /></label>
                <label><span style={{display:"block",marginBottom:6}}>State/region</span><input value={ship.region} onChange={e=>setShip({...ship,region:e.target.value})} style={{width:"100%",boxSizing:"border-box",padding:11,borderRadius:10,background:"#0a1028",color:"#fff",border:"1px solid #6b6790"}} /></label>
                <label><span style={{display:"block",marginBottom:6}}>ZIP/postal</span><input value={ship.zip} onChange={e=>setShip({...ship,zip:e.target.value})} style={{width:"100%",boxSizing:"border-box",padding:11,borderRadius:10,background:"#0a1028",color:"#fff",border:"1px solid #6b6790"}} /></label>
              </div>

              <button onClick={getShippingQuote} style={{marginTop:14,padding:"13px 18px",borderRadius:999,border:0,background:fulfillment?.configured?"#78e6df":"#777",color:"#041117",fontWeight:900,cursor:"pointer"}}>
                CHECK PRINT + SHIPPING
              </button>

              {quote && (
                <div style={{marginTop:14,padding:14,borderRadius:14,background:"#0a1028"}}>
                  <strong>Print job quote</strong>
                  <p>Production: {quote.productionCents != null ? "$"+(quote.productionCents/100).toFixed(2) : "—"}</p>
                  <p>Shipping: {quote.shippingCents != null ? "$"+(quote.shippingCents/100).toFixed(2) : "—"}</p>
                  <p><b>Your print price: {quote.retailCents != null ? "$"+(quote.retailCents/100).toFixed(2) : "—"}</b></p>
                  <p style={{color:"#78e6df"}}>Target margin protection: {quote.targetMarginPct}%</p>
                  {quote.artworkUrl && <p><a href={quote.artworkUrl} target="_blank" rel="noreferrer" style={{color:"#78e6df"}}>PREVIEW PROVIDER ARTWORK →</a></p>}
                  <button onClick={payPrintJob} style={{marginTop:10,padding:"13px 18px",borderRadius:999,border:0,background:"#f3c969",color:"#111",fontWeight:900,cursor:"pointer"}}>PAY PRINT JOB</button>
                </div>
              )}

              {printJob && (
                <div style={{marginTop:14,padding:14,borderRadius:14,background:"rgba(120,230,223,.09)",border:"1px solid rgba(120,230,223,.35)"}}>
                  <strong>Print job status: {printJob.status}</strong>
                  {paymentState === "success" && <p style={{color:"#78e6df"}}>Payment return received. Verify payment before sending to print.</p>}
                  <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:10}}>
                    <button onClick={refreshPrintJob} style={{padding:"11px 15px",borderRadius:999,border:"1px solid rgba(255,255,255,.35)",background:"transparent",color:"#fff",fontWeight:800,cursor:"pointer"}}>VERIFY PAYMENT</button>
                    {printJob.status === "PAID_READY_TO_SUBMIT" && (
                      <button onClick={sendToPrint} style={{padding:"11px 15px",borderRadius:999,border:0,background:"#78e6df",color:"#041117",fontWeight:900,cursor:"pointer"}}>SEND TO PRINT</button>
                    )}
                  </div>
                  {printJob.providerOrderId && <p>Provider order: {printJob.providerOrderId}</p>}
                </div>
              )}
            </section>

            {pkg && (
              <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:14}}>
                <div style={card}>
                  <strong style={{color:"#f3c969"}}>{pkg.label}</strong>
                  <h2>{pkg.dimensions}</h2>
                  <p>{pkg.bleed}</p>
                  <hr style={{borderColor:"rgba(255,255,255,.12)"}} />
                  <h3>{pkg.front.headline}</h3>
                  <p style={{whiteSpace:"pre-wrap",lineHeight:1.55}}>{pkg.front.body}</p>
                  <strong>{pkg.front.cta}</strong>
                </div>

                <div style={card}>
                  <strong style={{color:"#78e6df"}}>QR / ACTION</strong>
                  {pkg.qr ? (
                    <>
                      <p>{pkg.qr.label}</p>
                      <p style={{wordBreak:"break-all"}}>{pkg.qr.destination}</p>
                    </>
                  ) : <p>No QR destination was supplied.</p>}
                  <p>Audience: {pkg.audience}</p>
                </div>

                <div style={card}>
                  <strong style={{color:"#78e6df"}}>PRINT NOTES</strong>
                  <ul style={{lineHeight:1.65}}>
                    {pkg.printNotes.map((n,i)=><li key={i}>{n}</li>)}
                  </ul>
                </div>

                <div style={card}>
                  <strong style={{color:"#f3c969"}}>HOW TO MAKE IT REAL</strong>
                  <p><b>Digital only:</b> {pkg.handoff.digitalOnly}</p>
                  <p><b>My printer:</b> {pkg.handoff.myPrinter}</p>
                  <p><b>Local print:</b> {pkg.handoff.localPrint}</p>
                  <p style={{color:"#ffd36d"}}>{pkg.handoff.fulfillmentStatus}</p>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
