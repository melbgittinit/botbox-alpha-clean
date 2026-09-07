"use client";

import { FormEvent, useState } from "react";

const VISITOR_KEY = "bot_factory_visitor_id";
const SESSION_KEY = "bot_factory_session_id";

function getId(key:string){
  try{return key===SESSION_KEY?window.sessionStorage.getItem(key)||"":window.localStorage.getItem(key)||"";}catch{return "";}
}

export default function IdentityBridge(){
  const [open,setOpen]=useState(false);
  const [purpose,setPurpose]=useState("SAVE_BUILD");
  const [preferredBot,setPreferredBot]=useState("");
  const [status,setStatus]=useState("");
  const [busy,setBusy]=useState(false);

  function launch(nextPurpose:string, bot?:string){
    setPurpose(nextPurpose);
    setPreferredBot(bot||"");
    setStatus("");
    setOpen(true);
  }

  if(typeof window!=="undefined"){
    (window as unknown as {openBotFactoryIdentity?: (purpose:string,bot?:string)=>void}).openBotFactoryIdentity=launch;
  }

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    setBusy(true); setStatus("");
    const form=new FormData(e.currentTarget);
    const payload={
      email:String(form.get("email")||""),
      phone:String(form.get("phone")||""),
      emailMarketing:form.get("emailMarketing")==="on",
      smsOptIn:form.get("smsOptIn")==="on",
      voiceCallback:form.get("voiceCallback")==="on",
      sessionId:getId(SESSION_KEY),
      visitorId:getId(VISITOR_KEY),
      purpose,
      preferredBot,
    };
    try{
      const res=await fetch("/api/revenue/identity",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const data=await res.json();
      if(!res.ok) throw new Error(data.error||"Unable to save");
      setStatus(data.persisted?"Saved securely. Your permissions are attached to this request.":"Staging check passed. Nothing was retained yet because the secure CRM connection is not enabled on this alpha.");
    }catch(err){setStatus(err instanceof Error?err.message:"Unable to save");}
    finally{setBusy(false);}
  }

  return <>
    <div style={{position:"fixed",right:18,bottom:18,zIndex:90,display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
      <button onClick={()=>launch("SAVE_BUILD")} style={pill}>SAVE / SEND MY BUILD</button>
      <button onClick={()=>launch("SALES_HELP")} style={pill}>TALK TO SALES</button>
    </div>
    {open&&<div role="dialog" aria-modal="true" style={backdrop} onMouseDown={e=>{if(e.currentTarget===e.target)setOpen(false)}}>
      <form onSubmit={submit} style={panel}>
        <button type="button" onClick={()=>setOpen(false)} aria-label="Close" style={close}>×</button>
        <div style={{fontSize:12,letterSpacing:1.8,fontWeight:800,color:"#d5b66f"}}>BOT FACTORY • PERMISSION BRIDGE</div>
        <h2 style={{fontSize:30,lineHeight:1.05,margin:"10px 0"}}>{purpose==="SALES_HELP"?"Talk to a sales specialist":"Save or send this Factory journey"}</h2>
        <p style={{opacity:.76,lineHeight:1.55}}>Email is used for the request you make here. Marketing email, text messages and a sales callback are separate choices below.</p>
        <label style={label}>Email<input name="email" type="email" required style={input} placeholder="you@example.com"/></label>
        <label style={label}>Phone <span style={{opacity:.55}}>(only needed for text/callback)</span><input name="phone" type="tel" style={input} placeholder="(555) 555-5555"/></label>
        <label style={check}><input name="emailMarketing" type="checkbox"/> Email me useful Bot Factory news and relevant bot offers.</label>
        <label style={check}><input name="smsOptIn" type="checkbox"/> Text me about this build and closely related bot help. I can opt out anytime.</label>
        <label style={check}><input name="voiceCallback" type="checkbox" defaultChecked={purpose==="SALES_HELP"}/> I want a sales callback about this request.</label>
        <button disabled={busy} style={submitBtn}>{busy?"SAVING…":purpose==="SALES_HELP"?"REQUEST SALES HELP":"SAVE MY REQUEST"}</button>
        {status&&<p style={{fontSize:13,lineHeight:1.45,marginBottom:0}}>{status}</p>}
        <p style={{fontSize:11,opacity:.55,lineHeight:1.45}}>No checkbox is pre-required for marketing. Your delivery/request and your promotional permissions are recorded separately.</p>
      </form>
    </div>}
  </>;
}

const pill:React.CSSProperties={border:"1px solid rgba(255,255,255,.2)",background:"rgba(7,9,14,.9)",color:"white",padding:"11px 14px",borderRadius:999,fontWeight:800,fontSize:11,letterSpacing:.5,backdropFilter:"blur(12px)",cursor:"pointer"};
const backdrop:React.CSSProperties={position:"fixed",inset:0,zIndex:120,background:"rgba(0,0,0,.74)",display:"grid",placeItems:"center",padding:18};
const panel:React.CSSProperties={position:"relative",width:"min(560px,100%)",maxHeight:"90vh",overflow:"auto",border:"1px solid rgba(255,255,255,.18)",background:"#0a0d13",color:"white",borderRadius:26,padding:26,boxShadow:"0 30px 100px rgba(0,0,0,.55)"};
const close:React.CSSProperties={position:"absolute",right:16,top:12,border:0,background:"transparent",color:"white",fontSize:30,cursor:"pointer"};
const label:React.CSSProperties={display:"grid",gap:7,fontSize:13,fontWeight:700,margin:"16px 0"};
const input:React.CSSProperties={width:"100%",boxSizing:"border-box",border:"1px solid rgba(255,255,255,.16)",background:"#111722",color:"white",borderRadius:12,padding:"13px 14px",fontSize:16};
const check:React.CSSProperties={display:"flex",gap:9,alignItems:"flex-start",fontSize:13,lineHeight:1.45,margin:"12px 0",fontWeight:500};
const submitBtn:React.CSSProperties={width:"100%",border:0,borderRadius:14,padding:"14px 16px",marginTop:14,background:"#f0d28a",color:"#111",fontWeight:900,cursor:"pointer"};
