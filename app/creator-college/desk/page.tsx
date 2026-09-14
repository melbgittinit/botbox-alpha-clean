"use client";

import { useEffect, useMemo, useState } from "react";
import { readUnifiedCreations, type UnifiedCreation } from "../lib/creatorCollegeStore";

export default function CreatorDeskPage(){
  const[creations,setCreations]=useState<UnifiedCreation[]>([]);
  useEffect(()=>{setCreations(readUnifiedCreations())},[]);
  const active=useMemo(()=>creations.find(i=>i.status==="BUILDING")||null,[creations]);
  const recent=useMemo(()=>creations.find(i=>i.status==="COMPLETE")||null,[creations]);
  const familyCount=new Set(creations.map(i=>i.familyId).filter(Boolean)).size;
  const finishedNonBrands=creations.filter(i=>i.status==="COMPLETE"&&i.kind!=="brand"&&i.kind!=="business").length;
  const hasCompletedBrand=creations.some(i=>i.status==="COMPLETE"&&i.kind==="brand");
  const hasCompletedService=creations.some(i=>i.status==="COMPLETE"&&i.kind==="service_offer");
  const hasBusiness=creations.some(i=>i.kind==="business");
  const businessReady=(hasCompletedBrand||hasCompletedService)&&!hasBusiness;
  const brandReady=finishedNonBrands>=2&&!hasCompletedBrand;

  const nextTitle=active?`Finish ${active.title}`:businessReady?"You may have a business here":brandReady?"You may have a brand here":recent?`Build from ${recent.title}`:"Start your first creation";
  const nextCopy=active?`You’re ${active.progress}% complete. Go directly back to the work.`:businessReady?"You now have a finished brand or service. Business Center can turn that proof into a simple operating system.":brandReady?`You have ${finishedNonBrands} finished creations. Brand Hall can help organize them under one recognizable identity.`:recent?"You already did the hard part. Reuse what works.":"Start with Smart Start or choose a builder.";
  const nextHref=active?active.route:businessReady?"/creator-college/business":brandReady?"/creator-college/brand-hall":recent?`/creator-college/explode?kind=${recent.kind}&id=${encodeURIComponent(recent.id)}`:"/creator-college";
  const nextLabel=active?"CONTINUE MY CREATION":businessReady?"OPEN BUSINESS CENTER":brandReady?"OPEN BRAND HALL":recent?"BUILD FROM THIS":"START CREATING";

  return <main className="cc4-shell">
    <section className="cc4-hero"><span className="cc4-eyebrow">WORK MODE</span><h1>MY CREATOR DESK</h1><p>One working home for everything you’re creating.</p></section>

    <section className="cc4-panel cc4-next"><div><span className="cc4-eyebrow">NEXT BEST ACTION</span><h2>{nextTitle}</h2><p>{nextCopy}</p></div><a className="cc4-primary" href={nextHref}>{nextLabel}</a></section>

    <section className="cc4-grid cc4-stats"><article><strong>{creations.length}</strong><span>Total creations</span></article><article><strong>{creations.filter(i=>i.status==="COMPLETE").length}</strong><span>Finished</span></article><article><strong>{familyCount}</strong><span>Creation families</span></article></section>

    <section className="cc4-section"><div className="cc4-section-head"><div><span className="cc4-eyebrow">QUICK ACTIONS</span><h2>WHAT DO YOU WANT TO MAKE?</h2></div></div><div className="cc4-grid cc4-actions-grid"><a href="/creator-college/start">⚡<b>SMART START</b><small>Use my saved audience, goals and brand</small></a><a href="/creator-college/digital">📘<b>DIGITAL PRODUCT</b><small>Create a guide, checklist, workbook or resource kit</small></a><a href="/creator-college/video">🎥<b>VIDEO SERIES</b><small>Plan scripts, visuals and posting</small></a><a href="/creator-college/event">⛪<b>CHURCH / GROUP EVENT KIT</b><small>Plan, promote, run and follow up</small></a><a href="/creator-college/service">💼<b>SIMPLE SERVICE OFFER</b><small>Create to Earn: package a skill into a sellable service</small></a><a href="/creator-college/brand-hall">◇<b>BRAND HALL</b><small>Organize creations into recognizable brands</small></a><a href="/creator-college/business">▣<b>BUSINESS CENTER</b><small>Turn proven work into an operating system</small></a><a href="/creator-college/profile">◎<b>MY CREATOR PROFILE</b><small>Update voice, look, audience and brands</small></a></div></section>

    <section className="cc4-section"><div className="cc4-section-head"><div><span className="cc4-eyebrow">RECENT WORK</span><h2>YOUR LATEST CREATIONS</h2></div><a href="/creator-college/locker">OPEN LOCKER</a></div>{creations.length===0?<div className="cc4-empty">Nothing here yet. Your first finished creation will change this page completely.</div>:<div className="cc4-grid cc4-card-grid">{creations.slice(0,12).map(item=><article className="cc4-card" key={`${item.kind}-${item.id}`}><small>{item.kind.replaceAll("_"," ").toUpperCase()} · {item.status}</small><h3>{item.title}</h3><p>{item.format}</p><div className="cc4-meter"><span style={{width:`${item.progress}%`}}/></div><b>{item.progress}%</b><a href={item.route}>{item.status==="BUILDING"?"CONTINUE":"OPEN"}</a></article>)}</div>}</section>
  </main>;
}
