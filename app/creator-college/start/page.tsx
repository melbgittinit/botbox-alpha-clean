"use client";

import { useEffect, useMemo, useState } from "react";
import { getCreatorPersistence } from "../lib/persistenceAdapter";

type BrandKit={id:string;name:string;type:string;audience:string;voice:string;look:string;notes:string};
type Profile={audience:string;goals:string[];voice:string;look:string;creationTypes:string[];brandKits:BrandKit[]};

const PROFILE_KEY="creator-college-v1-profile";
const blank:Profile={audience:"",goals:[],voice:"Warm",look:"Clean",creationTypes:[],brandKits:[]};

export default function SmartStartPage(){
 const[profile,setProfile]=useState<Profile>(blank);
 const[selectedBrand,setSelectedBrand]=useState("");
 const[starting,setStarting]=useState("");
 useEffect(()=>{try{setProfile(JSON.parse(localStorage.getItem(PROFILE_KEY)||JSON.stringify(blank)))}catch{setProfile(blank)}},[]);
 const brand=profile.brandKits.find(b=>b.id===selectedBrand);
 const audience=brand?.audience||profile.audience;
 const look=brand?.look||profile.look||"Clean";
 const voice=brand?.voice||profile.voice||"Warm";
 const recommendations=useMemo(()=>{
  const preferred=profile.creationTypes;
  const goal=profile.goals;
  return[
   {title:"MAKE A DIGITAL PRODUCT",kind:"digital_product" as const,why:preferred.includes("Guides")||preferred.includes("Products")?"Matches what you already like to create.":"A flexible first build you can finish and reuse.",tag:"BEST MATCH"},
   {title:"CREATE A 5-VIDEO SERIES",kind:"video_series" as const,why:preferred.includes("Video")?"Video is already one of your preferred creation types.":"A fast way to turn one idea into multiple pieces.",tag:"FAST START"},
   {title:"BUILD A SIMPLE SERVICE OFFER",kind:"service_offer" as const,why:goal.includes("Income")||goal.includes("Business")?"Fits your saved income/business goal.":"A practical path from skill to useful offer.",tag:"CREATE TO EARN"},
  ];
 },[profile]);

 async function start(kind:"digital_product"|"video_series"|"service_offer"){
  if(starting)return;
  setStarting(kind);
  const persistence=getCreatorPersistence();
  const now=new Date().toISOString();
  const sell=profile.goals.includes("Income");

  if(kind==="digital_product"){
   const id=`cc-${Date.now()}`;
   const raw={id,title:"Untitled Creation",subtitle:"",idea:"",audience:audience||"",result:"",format:"Mini Guide",outline:[],sections:[],style:look,useMode:sell?"Sell it":"Keep it for me",step:"idea",progress:8,status:"BUILDING" as const,updatedAt:now,brandKitId:brand?.id,voiceProfile:voice};
   await persistence.save({id,kind,status:"BUILDING",title:raw.title,progress:raw.progress,updatedAt:now,raw});
   await persistence.setActive(kind,id);
   window.location.href="/creator-college/digital";
   return;
  }

  if(kind==="video_series"){
   const id=`video-${Date.now()}`;
   const raw={id,title:"Untitled Video Series",audience:audience||"",goal:"",format:"5 short videos",episodes:[],style:look,posting:"",useMode:sell?"Create to Earn":"Creator use",step:0,progress:5,status:"BUILDING" as const,updatedAt:now,brandKitId:brand?.id,voiceProfile:voice};
   await persistence.save({id,kind,status:"BUILDING",title:raw.title,progress:raw.progress,updatedAt:now,raw});
   await persistence.setActive(kind,id);
   window.location.href="/creator-college/video";
   return;
  }

  const id=`service-${Date.now()}`;
  const raw={id,skill:"",problem:"",customer:audience||"",offer:"",delivery:"Digital / Remote",scope:[],priceTier:"Core",priceNote:"",promo:"",salesMessage:"",followup:"",step:0,progress:5,status:"BUILDING" as const,updatedAt:now,brandKitId:brand?.id,voiceProfile:voice};
  await persistence.save({id,kind,status:"BUILDING",title:"Simple Service Offer",progress:raw.progress,updatedAt:now,raw});
  await persistence.setActive(kind,id);
  window.location.href="/creator-college/service";
 }

 return <main className="cc4-shell"><section className="cc4-hero"><span className="cc4-eyebrow">SMART START</span><h1>USE WHAT CREATOR COLLEGE ALREADY KNOWS.</h1><p>Your saved settings are suggestions, not rules. Change anything for this project whenever you want.</p></section>
 <section className="cc4-panel"><div><small>YOUR USUAL SETTINGS</small><h2>{audience||"No usual audience saved yet"}</h2><p>{voice} voice · {look} look{profile.goals.length?` · ${profile.goals.join(" / ")}`:""}</p></div><a className="cc4-primary" href="/creator-college/profile">CHANGE MY PROFILE</a></section>
 {profile.brandKits.length>0&&<section className="cc4-section"><div className="cc4-section-head"><div><span className="cc4-eyebrow">WHO IS THIS FOR?</span><h2>USE A SAVED BRAND KIT?</h2></div></div><div className="cc5-chips"><button className={!selectedBrand?"selected":""} onClick={()=>setSelectedBrand("")}>START FRESH</button>{profile.brandKits.map(b=><button key={b.id} className={selectedBrand===b.id?"selected":""} onClick={()=>setSelectedBrand(b.id)}>{b.name}</button>)}</div>{brand&&<div className="cc5-prefill"><b>Here’s what I’ll reuse:</b><span>{brand.audience||profile.audience||"Audience not set"}</span><span>{brand.voice} voice</span><span>{brand.look} look</span></div>}</section>}
 <section className="cc4-section"><div className="cc4-section-head"><div><span className="cc4-eyebrow">RECOMMENDED FOR YOU</span><h2>THREE GOOD STARTS.</h2></div></div><div className="cc4-card-grid cc4-grid">{recommendations.map(r=><article className="cc4-card" key={r.title}><small>{r.tag}</small><h3>{r.title}</h3><p>{r.why}</p><button className="cc5-start" disabled={!!starting} onClick={()=>void start(r.kind)}>{starting===r.kind?"OPENING…":"START WITH MY SETTINGS"}</button></article>)}</div></section>
 </main>;
}
