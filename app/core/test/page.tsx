"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function PurchasedCoreTestExperience(){
  const params=useSearchParams();
  const token=params.get("token")||"";
  const [prompt,setPrompt]=useState("");
  const [result,setResult]=useState("");
  const [notice,setNotice]=useState("");
  const [status,setStatus]=useState("");
  const [loading,setLoading]=useState(false);

  async function run(){
    if(!token){setNotice("Secure Core access token is missing.");return;}
    setLoading(true); setResult(""); setNotice("");
    try{
      const response=await fetch("/api/core/test",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({token,prompt}),
      });
      const data=await response.json();
      if(!response.ok) throw new Error(data?.error||"Core test failed");
      setResult(data.result||"");
      setNotice(data.notice||"");
      setStatus(data.status||"");
    }catch(error){
      setNotice(error instanceof Error?error.message:"The Core test could not be completed.");
    }finally{setLoading(false);}
  }

  return <main style={{minHeight:"100vh",background:"radial-gradient(circle at 50% 15%,#112640,#05070b 60%)",color:"white",padding:"48px 20px 90px",fontFamily:"Arial,sans-serif"}}>
    <div style={{maxWidth:860,margin:"0 auto"}}>
      <p style={{letterSpacing:3,fontSize:13,color:"#81b7ff",fontWeight:700}}>BOT CORE • PURCHASED TEST TRACK</p>
      <h1 style={{fontSize:"clamp(34px,7vw,64px)",lineHeight:1,margin:"12px 0 14px"}}>TEST THE BOT YOU BOUGHT.</h1>
      <p style={{fontSize:19,color:"#c8d1df",lineHeight:1.6}}>This test is tied to your paid entitlement. It is separate from the public TRY demo and is required before certification.</p>

      <div style={{marginTop:30,padding:22,border:"1px solid #29415f",borderRadius:16,background:"rgba(7,13,22,.88)"}}>
        <label htmlFor="core-prompt" style={{display:"block",fontWeight:800,marginBottom:10}}>Give your bot one real situation.</label>
        <textarea id="core-prompt" rows={7} maxLength={800} value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Use a real situation you expect this bot to help with." style={{width:"100%",boxSizing:"border-box",borderRadius:12,border:"1px solid #3b5577",background:"#09111d",color:"white",padding:14,fontSize:16}} />
        <button disabled={loading} onClick={run} style={{marginTop:14,border:0,borderRadius:999,padding:"13px 20px",fontWeight:900,cursor:"pointer",background:"white",color:"#07101d"}}>{loading?"RUNNING CORE TEST…":"RUN PURCHASED CORE TEST"}</button>
      </div>

      {result&&<div style={{marginTop:22,whiteSpace:"pre-wrap",padding:22,borderRadius:16,border:"1px solid #31527a",background:"#08111e",lineHeight:1.65}}>{result}</div>}
      {status&&<p style={{marginTop:18,color:"#9be3b2",fontWeight:800}}>CORE STATUS: {status.replaceAll("_"," ")}</p>}
      {notice&&<p style={{marginTop:14,color:"#aeb9c8",lineHeight:1.6}}>{notice}</p>}
      <div style={{marginTop:30}}><Link href={`/core?token=${encodeURIComponent(token)}`} style={{color:"#9bc4ff",fontWeight:800}}>← RETURN TO BOT CORE STATUS</Link></div>
    </div>
  </main>;
}

function LoadingCoreTest(){
  return <main style={{minHeight:"100vh",background:"#05070b",color:"white",padding:"64px 24px",fontFamily:"Arial,sans-serif"}}><div style={{maxWidth:760,margin:"0 auto"}}><p style={{letterSpacing:2,color:"#7fb7ff"}}>BOT CORE</p><h1>Preparing your purchased Test Track…</h1></div></main>;
}

export default function PurchasedCoreTestPage(){
  return <Suspense fallback={<LoadingCoreTest/>}><PurchasedCoreTestExperience/></Suspense>;
}
