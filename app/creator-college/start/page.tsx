"use client";

import { useEffect, useMemo, useState } from "react";

type BrandKit={id:string;name:string;type:string;audience:string;voice:string;look:string;notes:string};
type Profile={audience:string;goals:string[];voice:string;look:string;creationTypes:string[];brandKits:BrandKit[]};

type Creation={id:string;title:string;subtitle:string;idea:string;audience:string;result:string;format:string;outline:string[];sections:{title:string;body:string}[];style:string;useMode:string;step:string;progress:number;status:"BUILDING"|"COMPLETE";updatedAt:string;brandKitId?:string;voiceProfile?:string};

const PROFILE_KEY="creator-college-v1-profile";
const STORAGE_KEY="creator-college-v1-creations";
const ACTIVE_KEY="creator-college-v1-active";
const blank:Profile={audience:"",goals:[],voice:"Warm",look:"Clean",creationTypes:[],brandKits:[]};

export default function SmartStartPage(){
 const[profile,setProfile]=useState<Profile>(blank);
 const[selectedBrand,setSelectedBrand]=useState("");
 useEffect(()=>{setProfile(JSON.parse(localStorage.getItem(PROFILE_KEY)||JSON.stringify(blank)))},[]);
 const brand=profile.brandKits.find(b=>b.id===selectedBrand);
 const audience=brand?.audience||profile.audience;
 const look=brand?.look||profile.look||"Clean";
 const voice=brand?.voice||profile.voice||"Warm";
 const recommendations=useMemo(()=>{
  const preferred=profile.creationTypes;
  const goal=profile.goals;
  const rows=[
   {title:"MAKE A DIGITAL PRODUCT",format:"Mini Guide",why:preferred.includes("Guides")||preferred.includes("Products")?"Matches what you already like to create.":"A flexible first build you can finish and reuse.",tag:"BEST MATCH"},
   {title:"CREATE A 5-VIDEO SERIES",format:"5-Video Series",why:preferred.includes("Video")?"Video is already one of your preferred creation types.":"A fast way to turn one idea into multiple pieces.",tag:"FAST START"},
   {title:"BUILD A SIMPLE SERVICE OFFER",format:"Service Offer",why:goal.includes("Income")||goal.includes("Business")?"Fits your saved income/business goal.":"A practical path from skill to useful offer.",tag:"CREATE TO EARN"},
  ];return rows;
 },[profile]);
 function start(format:string){
  const id=`cc-${Date.now()}`;
  const item:Creation={id,title:"Untitled Creation",subtitle:"",idea:"",audience:audience||"",result:"",format:format==="5-Video Series"?"Mini Guide":format==="Service Offer"?"Mini Guide":format,outline:[],sections:[],style:look,useMode:profile.goals.includes("Income")?"Sell it":"Keep it for me",step:"idea",progress:8,status:"BUILDING",updatedAt:new Date().toISOString(),brandKitId:brand?.id,voiceProfile:voice};
  const list=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]") as Creation[];
  localStorage.setItem(STORAGE_KEY,JSON.stringify([item,...list.filter(i=>i.id!==id)]));
  localStorage.setItem(ACTIVE_KEY,id);
  window.location.href="/creator-college";
 }
 return <main className="cc4-shell"><section className="cc4-hero"><span className="cc4-eyebrow">SMART START</span><h1>USE WHAT CREATOR COLLEGE ALREADY KNOWS.</h1><p>Your saved settings are suggestions, not rules. Change anything for this project whenever you want.</p></section>
 <section className="cc4-panel"><div><small>YOUR USUAL SETTINGS</small><h2>{audience||"No usual audience saved yet"}</h2><p>{voice} voice · {look} look{profile.goals.length?` · ${profile.goals.join(" / ")}`:""}</p></div><a className="cc4-primary" href="/creator-college/profile">CHANGE MY PROFILE</a></section>
 {profile.brandKits.length>0&&<section className="cc4-section"><div className="cc4-section-head"><div><span className="cc4-eyebrow">WHO IS THIS FOR?</span><h2>USE A SAVED BRAND KIT?</h2></div></div><div className="cc5-chips"><button className={!selectedBrand?"selected":""} onClick={()=>setSelectedBrand("")}>START FRESH</button>{profile.brandKits.map(b=><button key={b.id} className={selectedBrand===b.id?"selected":""} onClick={()=>setSelectedBrand(b.id)}>{b.name}</button>)}</div>{brand&&<div className="cc5-prefill"><b>Here’s what I’ll reuse:</b><span>{brand.audience||profile.audience||"Audience not set"}</span><span>{brand.voice} voice</span><span>{brand.look} look</span></div>}</section>}
 <section className="cc4-section"><div className="cc4-section-head"><div><span className="cc4-eyebrow">RECOMMENDED FOR YOU</span><h2>THREE GOOD STARTS.</h2></div></div><div className="cc4-card-grid cc4-grid">{recommendations.map(r=><article className="cc4-card" key={r.title}><small>{r.tag}</small><h3>{r.title}</h3><p>{r.why}</p><button className="cc5-start" onClick={()=>start(r.format)}>START WITH MY SETTINGS</button></article>)}</div></section>
 </main>
}
