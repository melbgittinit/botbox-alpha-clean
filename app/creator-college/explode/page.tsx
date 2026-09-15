"use client";

import { useEffect, useState } from "react";
import { findUnifiedCreation, type CreationKind, type UnifiedCreation } from "../lib/creatorCollegeStore";
import { getCreatorPersistence } from "../lib/persistenceAdapter";

type Move={label:string;title:string;copy:string;route:string;reuse:string;kind:CreationKind};
const moves:Record<string,Move[]>={
 digital_product:[
  {label:"BEST NEXT MOVE",title:"5-Video Series",copy:"Turn the core ideas into five short videos.",route:"/creator-college/video",reuse:"74% reused",kind:"video_series"},
  {label:"FASTEST TO MAKE",title:"Simple Service Offer",copy:"Turn the result into a small done-for-you service.",route:"/creator-college/service",reuse:"68% reused",kind:"service_offer"},
  {label:"BEST FOR REACH",title:"Church / Group Kit",copy:"Adapt the content into a group experience.",route:"/creator-college/event",reuse:"62% reused",kind:"event_kit"}],
 video_series:[
  {label:"BEST NEXT MOVE",title:"Digital Guide",copy:"Turn the scripts into a readable guide or workbook.",route:"/creator-college/digital",reuse:"82% reused",kind:"digital_product"},
  {label:"BEST TO EARN",title:"Simple Service Offer",copy:"Package the expertise behind the series into a service.",route:"/creator-college/service",reuse:"64% reused",kind:"service_offer"},
  {label:"BEST FOR SCALE",title:"Starter Brand",copy:"Give the series and its related work a recognizable identity.",route:"/creator-college/brand",reuse:"58% reused",kind:"brand"}],
 event_kit:[
  {label:"BEST NEXT MOVE",title:"Repeatable Event Brand",copy:"Turn the one-time event into a recognizable series.",route:"/creator-college/brand",reuse:"78% reused",kind:"brand"},
  {label:"FASTEST TO MAKE",title:"Digital Resource Kit",copy:"Package the materials into a reusable guide or kit.",route:"/creator-college/digital",reuse:"72% reused",kind:"digital_product"},
  {label:"BEST TO EARN",title:"Event Planning Service",copy:"Offer the event system as a service to another group.",route:"/creator-college/service",reuse:"66% reused",kind:"service_offer"}],
 service_offer:[
  {label:"BEST NEXT MOVE",title:"Starter Brand",copy:"Give the offer a recognizable identity and message.",route:"/creator-college/brand",reuse:"76% reused",kind:"brand"},
  {label:"FASTEST TO MAKE",title:"Client Guide",copy:"Turn the process into a simple client-facing guide.",route:"/creator-college/digital",reuse:"70% reused",kind:"digital_product"},
  {label:"BEST FOR SCALE",title:"Business Starter System",copy:"Turn the proven offer into a repeatable operating system.",route:"/creator-college/business",reuse:"84% reused",kind:"business"}],
 brand:[
  {label:"BEST NEXT MOVE",title:"Business Starter System",copy:"Turn the brand into a customer, offer, sales, and operations system.",route:"/creator-college/business",reuse:"86% reused",kind:"business"},
  {label:"BEST FOR REACH",title:"5-Video Launch Series",copy:"Introduce the brand through five focused videos.",route:"/creator-college/video",reuse:"68% reused",kind:"video_series"},
  {label:"BEST TO EARN",title:"Simple Service Offer",copy:"Give the brand a clear first commercial offer.",route:"/creator-college/service",reuse:"74% reused",kind:"service_offer"}],
 business:[
  {label:"BEST NEXT MOVE",title:"Launch Video Series",copy:"Turn the business message into a focused introduction campaign.",route:"/creator-college/video",reuse:"66% reused",kind:"video_series"},
  {label:"FASTEST TO MAKE",title:"Customer Guide",copy:"Create a simple guide that supports sales or onboarding.",route:"/creator-college/digital",reuse:"72% reused",kind:"digital_product"},
  {label:"BEST FOR GROWTH",title:"Event / Workshop Kit",copy:"Turn the business into a live group experience or workshop.",route:"/creator-college/event",reuse:"61% reused",kind:"event_kit"}],
};

function text(raw:Record<string,unknown>,...keys:string[]){for(const key of keys){const value=raw[key];if(typeof value==="string"&&value.trim())return value.trim()}return ""}

export default function ExplodePage(){
 const[item,setItem]=useState<UnifiedCreation|null|undefined>(undefined);
 const[building,setBuilding]=useState("");
 useEffect(()=>{const params=new URLSearchParams(window.location.search);setItem(findUnifiedCreation(params.get("kind")||"",params.get("id")||""))},[]);

 async function buildFrom(move:Move){
  if(!item||building)return;
  setBuilding(move.title);
  const persistence=getCreatorPersistence();
  const raw=item.raw as Record<string,unknown>;
  const now=new Date().toISOString();
  const familyId=(typeof item.familyId==="string"&&item.familyId)||`family-${item.id}`;
  const audience=text(raw,"audience","customer");
  const coreResult=text(raw,"result","offer","goal","purpose","promise");
  const baseTitle=item.title;
  let id="";let seed:Record<string,unknown>={};let title=move.title;

  if(move.kind==="digital_product"){
   id=`cc-${Date.now()}`;title=`${baseTitle} — Guide`;
   seed={id,title,subtitle:`Built from ${baseTitle}`,idea:coreResult||`Build from ${baseTitle}`,audience,result:coreResult,format:"Mini Guide",outline:[],sections:[],style:text(raw,"style","look")||"Clean",useMode:"Keep it for me",step:"outline",progress:55,status:"BUILDING",updatedAt:now,parentId:item.id,familyId,sourceId:item.id,derivedType:"explode-digital"};
  }else if(move.kind==="video_series"){
   id=`video-${Date.now()}`;title=`${baseTitle} — Video Series`;
   seed={id,title,audience,goal:coreResult,format:"5 short videos",episodes:[],style:text(raw,"style","look")||"Natural",posting:"",useMode:"Creator use",step:4,progress:45,status:"BUILDING",updatedAt:now,parentId:item.id,familyId,sourceId:item.id};
  }else if(move.kind==="service_offer"){
   id=`service-${Date.now()}`;title=`${baseTitle} Service`;
   seed={id,skill:text(raw,"skill","position","purpose"),problem:coreResult,customer:audience,offer:coreResult?`Help ${audience||"customers"} achieve ${coreResult}`:"",delivery:"Digital / Remote",scope:[],priceTier:"Core",priceNote:"",promo:"",salesMessage:"",followup:"",step:2,progress:30,status:"BUILDING",updatedAt:now,parentId:item.id,familyId,sourceId:item.id};
  }else if(move.kind==="event_kit"){
   id=`event-${Date.now()}`;title=`${baseTitle} Event`;
   seed={id,title,eventType:"Workshop / Group Experience",purpose:coreResult,audience,feeling:"Useful and welcoming",tagline:`Built from ${baseTitle}`,style:text(raw,"style","look")||"Modern",timeline:[],promo:[],materials:[],followup:[],step:2,progress:30,status:"BUILDING",updatedAt:now,parentId:item.id,familyId,sourceId:item.id};
  }else if(move.kind==="brand"){
   id=`brand-${Date.now()}`;title=`${baseTitle} Brand`;
   seed={id,name:title,brandType:"Creator Brand",purpose:coreResult,audience,position:"",promise:coreResult,personality:text(raw,"voice","voiceProfile")||"Warm",style:text(raw,"style","look")||"Modern",tagline:"",shortDescription:`A brand built from ${baseTitle}.`,voice:text(raw,"voice","voiceProfile")||"Warm",assets:[],connectedIds:[`${item.kind}:${item.id}`],step:2,progress:30,status:"BUILDING",updatedAt:now,parentId:item.id,familyId,sourceId:item.id};
  }else{
   id=`business-${Date.now()}`;title=`${baseTitle} Business`;
   seed={id,name:title,sourceId:item.id,customer:audience,offer:coreResult,delivery:"Digital / Remote",pricePosition:"Core",salesMessage:"",operations:["Inquiry","Confirm fit","Collect payment / approval","Deliver","Follow up","Ask for feedback / referral"],growth:"More customers",step:1,progress:22,status:"BUILDING",updatedAt:now,parentId:item.id,familyId};
  }

  await persistence.save({id,kind:move.kind,status:"BUILDING",title,progress:Number(seed.progress||5),updatedAt:now,raw:seed});
  await persistence.setActive(move.kind,id);
  window.location.href=move.route;
 }

 if(item===undefined)return <main className="cc4-shell"><section className="cc4-hero"><h1>OPENING EXPLODE THIS…</h1></section></main>;
 if(!item)return <main className="cc4-shell"><section className="cc4-hero"><h1>CREATION NOT FOUND.</h1></section></main>;
 const options=moves[item.kind]||moves.digital_product;
 return <main className="cc4-shell"><section className="cc4-hero"><span className="cc4-eyebrow">EXPLODE THIS</span><h1>ONE CREATION SHOULD NEVER HAVE TO STAY ONE CREATION.</h1><p>We’re using <b>{item.title}</b> as the source. The next creation now inherits useful context and stays connected to the original.</p></section><section className="cc4-section"><div className="cc4-grid cc4-card-grid">{options.map(o=><article className="cc4-card" key={o.title}><small>{o.label}</small><h3>{o.title}</h3><p>{o.copy}</p><b>{o.reuse}</b><button className="cc5-start" disabled={!!building} onClick={()=>void buildFrom(o)}>{building===o.title?"BUILDING…":"BUILD FROM MY ORIGINAL"}</button></article>)}</div></section><section className="cc5-smart-panel"><div><span className="cc4-eyebrow">CREATION FAMILY</span><h2>KEEP THE ORIGINAL AT THE CENTER.</h2><p>Anything you build next is connected with source, parent and family references so the Locker can keep the body of work together.</p></div><a className="cc4-primary" href="/creator-college/locker">OPEN MY LOCKER</a></section></main>;
}
