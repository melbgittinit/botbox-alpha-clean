"use client";

import { useEffect, useMemo, useState } from "react";
import { readUnifiedCreations, type UnifiedCreation } from "../lib/creatorCollegeStore";

export default function CreatorDeskPage(){
  const[creations,setCreations]=useState<UnifiedCreation[]>([]);
  useEffect(()=>{setCreations(readUnifiedCreations())},[]);
  const active=useMemo(()=>creations.find(i=>i.status==="BUILDING")||null,[creations]);
  const recent=useMemo(()=>creations.find(i=>i.status==="COMPLETE")||null,[creations]);
  const familyCount=new Set(creations.map(i=>i.familyId).filter(Boolean)).size;

  return <main className="cc4-shell">
    <section className="cc4-hero"><span className="cc4-eyebrow">WORK MODE</span><h1>MY CREATOR DESK</h1><p>One working home for everything you’re creating.</p></section>

    <section className="cc4-panel cc4-next"><div><span className="cc4-eyebrow">NEXT BEST ACTION</span><h2>{active?`Finish ${active.title}`:recent?`Build from ${recent.title}`:"Start your first creation"}</h2><p>{active?`You’re ${active.progress}% complete. Go directly back to the work.`:recent?"You already did the hard part. Reuse what works.":"Start with Creator Compass or choose a builder."}</p></div><a className="cc4-primary" href={active?active.route:recent?recent.route:"/creator-college"}>{active?"CONTINUE MY CREATION":recent?"BUILD FROM THIS":"START CREATING"}</a></section>

    <section className="cc4-grid cc4-stats"><article><strong>{creations.length}</strong><span>Total creations</span></article><article><strong>{creations.filter(i=>i.status==="COMPLETE").length}</strong><span>Finished</span></article><article><strong>{familyCount}</strong><span>Creation families</span></article></section>

    <section className="cc4-section"><div className="cc4-section-head"><div><span className="cc4-eyebrow">QUICK ACTIONS</span><h2>WHAT DO YOU WANT TO MAKE?</h2></div></div><div className="cc4-grid cc4-actions-grid"><a href="/creator-college/start">⚡<b>SMART START</b><small>Use my saved audience, goals and brand</small></a><a href="/creator-college/video">🎥<b>5-VIDEO SERIES</b><small>Plan scripts, visuals and posting</small></a><a href="/creator-college/event">⛪<b>CHURCH / GROUP EVENT KIT</b><small>Plan, promote, run and follow up</small></a><a href="/creator-college/service">💼<b>SIMPLE SERVICE OFFER</b><small>Create to Earn: package a skill into a sellable service</small></a><a href="/creator-college/profile">◎<b>MY CREATOR PROFILE</b><small>Update voice, look, audience and brands</small></a></div></section>

    <section className="cc4-section"><div className="cc4-section-head"><div><span className="cc4-eyebrow">RECENT WORK</span><h2>YOUR LATEST CREATIONS</h2></div><a href="/creator-college/locker">OPEN LOCKER</a></div>{creations.length===0?<div className="cc4-empty">Nothing here yet. Your first finished creation will change this page completely.</div>:<div className="cc4-grid cc4-card-grid">{creations.slice(0,9).map(item=><article className="cc4-card" key={`${item.kind}-${item.id}`}><small>{item.kind.replace("_"," ").toUpperCase()} · {item.status}</small><h3>{item.title}</h3><p>{item.format}</p><div className="cc4-meter"><span style={{width:`${item.progress}%`}}/></div><b>{item.progress}%</b><a href={item.route}>{item.status==="BUILDING"?"CONTINUE":"OPEN"}</a></article>)}</div>}</section>
  </main>;
}
