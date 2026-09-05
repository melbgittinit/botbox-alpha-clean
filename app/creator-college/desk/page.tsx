"use client";

import { useEffect, useMemo, useState } from "react";

type Creation = {
  id:string; title:string; format:string; progress:number; status:"BUILDING"|"COMPLETE";
  updatedAt:string; familyId?:string; parentId?:string; style?:string; step?:string;
};

const STORAGE_KEY="creator-college-v1-creations";

export default function CreatorDeskPage(){
  const[creations,setCreations]=useState<Creation[]>([]);
  useEffect(()=>{setCreations(JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"))},[]);
  const active=useMemo(()=>creations.find(i=>i.status==="BUILDING")||null,[creations]);
  const recent=useMemo(()=>creations.find(i=>i.status==="COMPLETE")||null,[creations]);
  const familyCount=new Set(creations.map(i=>i.familyId).filter(Boolean)).size;
  const templateCandidate=recent;

  return <main className="cc4-shell">
    <section className="cc4-hero"><span className="cc4-eyebrow">WORK MODE</span><h1>MY CREATOR DESK</h1><p>Pick up where you left off, reuse what already works, and keep your next move obvious.</p></section>

    <section className="cc4-panel cc4-next">
      <div><span className="cc4-eyebrow">NEXT BEST ACTION</span><h2>{active?`Finish ${active.title}`:recent?`Explode ${recent.title}`:"Start your first creation"}</h2><p>{active?`You’re ${active.progress}% complete. Go directly back to the work.`:recent?"You already did the hard part. Build the next useful thing from it.":"Creator Compass will give you three sensible starting points."}</p></div>
      <a className="cc4-primary" href="/creator-college">{active?"CONTINUE MY CREATION":recent?"EXPLODE MY LAST CREATION":"START CREATING"}</a>
    </section>

    <section className="cc4-grid cc4-stats">
      <article><strong>{creations.length}</strong><span>Total creations</span></article>
      <article><strong>{creations.filter(i=>i.status==="COMPLETE").length}</strong><span>Finished</span></article>
      <article><strong>{familyCount}</strong><span>Creation families</span></article>
    </section>

    <section className="cc4-section"><div className="cc4-section-head"><div><span className="cc4-eyebrow">QUICK ACTIONS</span><h2>WHAT DO YOU WANT TO DO?</h2></div></div><div className="cc4-grid cc4-actions-grid">
      <a href="/creator-college/start">⚡<b>SMART START</b><small>Use my saved audience, goals and brand</small></a>
      <a href={templateCandidate?`/creator-college/locker?template=${templateCandidate.id}`:"/creator-college/locker"}>⧉<b>MAKE ANOTHER LIKE THIS</b><small>Reuse a successful structure</small></a>
      <a href="/creator-college/locker">✹<b>EXPLODE SOMETHING</b><small>Turn one creation into several</small></a>
      <a href="/creator-college/profile">◎<b>MY CREATOR PROFILE</b><small>Update voice, look, audience and brands</small></a>
    </div></section>

    <section className="cc4-section"><div className="cc4-section-head"><div><span className="cc4-eyebrow">RECENT WORK</span><h2>YOUR LATEST CREATIONS</h2></div><a href="/creator-college/locker">OPEN LOCKER</a></div>{creations.length===0?<div className="cc4-empty">Nothing here yet. Your first finished creation will change this page completely.</div>:<div className="cc4-grid cc4-card-grid">{creations.slice(0,6).map(item=><article className="cc4-card" key={item.id}><small>{item.status}{item.parentId?" · FAMILY MEMBER":""}</small><h3>{item.title}</h3><p>{item.format}</p><div className="cc4-meter"><span style={{width:`${item.progress}%`}}/></div><b>{item.progress}%</b><a href="/creator-college">{item.status==="BUILDING"?"CONTINUE":"OPEN"}</a></article>)}</div>}</section>
  </main>;
}
