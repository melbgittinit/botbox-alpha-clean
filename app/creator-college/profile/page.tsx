"use client";

import { useEffect, useState } from "react";

type BrandKit={id:string;name:string;type:string;audience:string;voice:string;look:string;notes:string};
type Profile={audience:string;goals:string[];voice:string;look:string;creationTypes:string[];brandKits:BrandKit[]};

const KEY="creator-college-v1-profile";
const blank:Profile={audience:"",goals:[],voice:"Warm",look:"Clean",creationTypes:[],brandKits:[]};

export default function CreatorProfilePage(){
 const[profile,setProfile]=useState<Profile>(blank);
 const[brandName,setBrandName]=useState("");
 useEffect(()=>{setProfile(JSON.parse(localStorage.getItem(KEY)||JSON.stringify(blank)))},[]);
 function save(next:Profile){setProfile(next);localStorage.setItem(KEY,JSON.stringify(next))}
 function toggle(field:"goals"|"creationTypes",value:string){const list=profile[field];save({...profile,[field]:list.includes(value)?list.filter(v=>v!==value):[...list,value]})}
 function addBrand(){if(!brandName.trim())return;const kit:BrandKit={id:`brand-${Date.now()}`,name:brandName.trim(),type:"Personal / Project Brand",audience:profile.audience,voice:profile.voice,look:profile.look,notes:""};save({...profile,brandKits:[...profile.brandKits,kit]});setBrandName("")}
 return <main className="cc4-shell"><section className="cc4-hero"><span className="cc4-eyebrow">MY CREATOR PROFILE</span><h1>MAKE CREATOR COLLEGE FASTER NEXT TIME.</h1><p>Save the things you choose repeatedly. These are defaults, not permanent rules.</p></section>
 <section className="cc5-profile-grid">
  <article className="cc5-profile-card"><small>WHO I CREATE FOR</small><h2>My usual audience</h2><input value={profile.audience} onChange={e=>save({...profile,audience:e.target.value})} placeholder="Example: women 45+ rebuilding healthy routines"/></article>
  <article className="cc5-profile-card"><small>MY VOICE</small><h2>How I like to sound</h2><div className="cc5-chips">{["Warm","Direct","Encouraging","Professional","Bold","Conversational","Faith-centered","Fun"].map(v=><button key={v} className={profile.voice===v?"selected":""} onClick={()=>save({...profile,voice:v})}>{v}</button>)}</div></article>
  <article className="cc5-profile-card"><small>MY LOOK</small><h2>My usual visual direction</h2><div className="cc5-chips">{["Clean","Elegant","Bold","Modern","Warm","Faith","Business","Youthful","Colorful","Minimal"].map(v=><button key={v} className={profile.look===v?"selected":""} onClick={()=>save({...profile,look:v})}>{v}</button>)}</div></article>
  <article className="cc5-profile-card"><small>MY GOALS</small><h2>What I usually want</h2><div className="cc5-chips">{["Fun","Impact","Income","Audience","Business","Promotion","Learning"].map(v=><button key={v} className={profile.goals.includes(v)?"selected":""} onClick={()=>toggle("goals",v)}>{v}</button>)}</div></article>
  <article className="cc5-profile-card"><small>WHAT I MAKE</small><h2>Creation types I prefer</h2><div className="cc5-chips">{["Guides","Video","Products","Services","Events","Brands","Audio"].map(v=><button key={v} className={profile.creationTypes.includes(v)?"selected":""} onClick={()=>toggle("creationTypes",v)}>{v}</button>)}</div></article>
 </section>
 <section className="cc4-section"><div className="cc4-section-head"><div><span className="cc4-eyebrow">SAVED BRAND KITS</span><h2>REUSE YOUR IDENTITY.</h2></div></div><div className="cc5-brand-add"><input value={brandName} onChange={e=>setBrandName(e.target.value)} placeholder="Brand, church, business, client or project name"/><button onClick={addBrand}>+ SAVE BRAND KIT</button></div><div className="cc4-card-grid cc4-grid">{profile.brandKits.map(kit=><article className="cc4-card" key={kit.id}><small>{kit.type}</small><h3>{kit.name}</h3><p>{kit.audience||"Audience not set yet"}</p><p><b>{kit.voice}</b> voice · <b>{kit.look}</b> look</p><div className="cc4-mini-actions"><button onClick={()=>save({...profile,brandKits:profile.brandKits.filter(k=>k.id!==kit.id)})}>REMOVE</button></div></article>)}</div>{!profile.brandKits.length&&<div className="cc4-empty">Save a brand once and Creator College can reuse its audience, voice and visual direction later.</div>}</section>
 </main>
}
