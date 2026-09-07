"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const VISITOR_KEY = "bot_factory_visitor_id";
const SESSION_KEY = "bot_factory_session_id";

function randomId(prefix:string){
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function getOrCreate(key:string,prefix:string,session=false){
  const store=session?window.sessionStorage:window.localStorage;
  let id=store.getItem(key);
  if(!id){ id=randomId(prefix); store.setItem(key,id); }
  return id;
}

async function sendEvent(payload:Record<string,unknown>){
  try{
    await fetch("/api/revenue/event",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload),
      keepalive:true,
    });
  }catch{
    // Analytics must never block the Factory experience.
  }
}

export default function RevenueTracker(){
  const pathname=usePathname();

  useEffect(()=>{
    const visitorId=getOrCreate(VISITOR_KEY,"vis");
    const sessionId=getOrCreate(SESSION_KEY,"ses",true);
    const params=new URLSearchParams(window.location.search);
    const referrerHost=(()=>{try{return document.referrer?new URL(document.referrer).hostname:""}catch{return ""}})();

    sendEvent({
      eventId:randomId("evt"),
      visitorId,
      sessionId,
      type:"VISIT",
      path:pathname,
      metadata:{
        utm_source:params.get("utm_source")||"",
        utm_medium:params.get("utm_medium")||"",
        utm_campaign:params.get("utm_campaign")||"",
        referrer_host:referrerHost,
      },
    });
  },[pathname]);

  useEffect(()=>{
    const handler=(event:MouseEvent)=>{
      const target=(event.target as HTMLElement | null)?.closest("button,a") as HTMLElement | null;
      if(!target) return;
      const label=(target.textContent||"").replace(/\s+/g," ").trim().slice(0,100);
      if(!label) return;
      const upper=label.toUpperCase();
      let type:string|undefined;
      if(upper.includes("TRY IT")||upper.includes("TRY A BOT")) type="TRY_STARTED";
      else if(upper.includes("BUILD MY BOT")||upper.includes("CUSTOMIZE")) type="BLUEPRINT_CREATED";
      else if(upper.includes("TAKE THIS BOT")||upper.includes("GET IT")) type="CHECKOUT_STARTED";
      else if(upper.includes("EARN")) type="EARN_INTEREST";
      else if(upper.includes("GIFT")) type="GIFT";
      if(!type) return;

      const visitorId=getOrCreate(VISITOR_KEY,"vis");
      const sessionId=getOrCreate(SESSION_KEY,"ses",true);
      const article=target.closest("article");
      const botName=article?.querySelector("h3")?.textContent?.trim();
      sendEvent({
        eventId:randomId("evt"), visitorId, sessionId, type, path:window.location.pathname,
        metadata:{action:"click",label, district:article?.getAttribute("data-district")||""},
        botId:botName||undefined,
      });
    };
    document.addEventListener("click",handler,true);
    return()=>document.removeEventListener("click",handler,true);
  },[]);

  return null;
}
