"use client";

import { useEffect, useMemo, useState } from "react";

type Creation = {
  id:string; title:string; format:string; progress:number; status:"BUILDING"|"COMPLETE";
  updatedAt:string; familyId?:string; parentId?:string; style?:string; step?:string;
};

type VideoProject={id:string;title:string;progress:number;status:"BUILDING"|"COMPLETE"};

const STORAGE_KEY="creator-college-v1-creations";
const VIDEO_KEY="creator-college-v1-video-projects";

export default function CreatorDeskPage(){
  const[creations,setCreations]=useState<Creation[]>([]);
  const[videos,setVideos]=useState<VideoProject[]>([]);
  useEffect(()=>{
    setCreations(JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"));
    setVideos(JSON.parse(localStorage.getItem(VIDEO_KEY)||"[]"));
  },[]);
  const active=useMemo(()=>creations.find(i=>i.status==="BUILDING")||null,[creations]);
  const activeVideo=useMemo(()=>videos.find(i=>i.status==="BUILDING")||null,[videos]);
  const recent=useMemo(()=>creations.find(i=>i.status==="COMPLETE")||null,[creations]);
  const familyCount=new Set(creations.map(i=>i.familyId).filter(Boolean)).size;
  const templateCandidate=recent;
  const total=creations.length+videos.length;
  const finished=creations.filter(i=>i.status==="COMPLETE").length+videos.filter(i=>i.status==="COMPLETE").length;
  const nextLabel=active?`Finish ${active.title}`:activeVideo?`Finish ${activeVideo.title}`:recent?`Explode ${recent.title}`:"Start your first creation";
  const nextCopy=active?`You’re ${active.progress}% complete. Go directly back to the work.`:activeVideo?`Your video series is ${activeVideo.progress}% complete. Keep the momentum.`:recent?"You already did the hard part. Build the next useful thing from it.":"Creator Compass will give you three sensible starting points.";
  const nextHref=active?"/creator-college":activeVideo?"/creator-college/video":recent?"/creator-college":"/creator-college";
  const nextButton=active?"CONTINUE MY CREATION":activeVideo?"CONTINUE VIDEO SERIES":recent?"EXPLODE MY LAST CREATION":"START CREATING";

  return <main className="cc4-shell">
    <section className="cc4-hero"><span className="cc4-eyebrow">WORK MODE</span><h1>MY CREATOR DESK</h1><p>Pick up where you left off, reuse what already works, and keep your next move obvious.</p></section>

    <section className="cc4-panel cc4-next">
      <div><span className="cc4-eyebrow">NEXT BEST ACTION</span><h2>{nextLabel}</h2><p>{nextCopy}</p></div>
      <a className="cc4-primary" href={nextHref}>{nextButton}</a>
    </section>

    <section className="cc4-grid cc4-stats">
      <article><strong>{total}</strong><span>Total creations</span></article>
      <article><strong>{finished}</strong><span>Finished</span></article>
      <article><strong>{familyCount}</strong><span>Creation families</span></article>
    </section>

    <section className="cc4-section"><div className="cc4-section-head"><div><span className="cc4-eyebrow">QUICK ACTIONS</span><h2>WHAT DO YOU WANT TO DO?</h2></div></div><div className="cc4-grid cc4-actions-grid">
      <a href="/creator-college/start">⚡<b>SMART START</b><small>Use my saved audience, goals and brand</small></a>
      <a href="/creator-college/video">🎥<b>CREATE A 5-VIDEO SERIES</b><small>Build episodes, scripts, visuals and posting plan</small></a>
      <a href={templateCandidate?`/creator-college/locker?template=${templateCandidate.id}`:"/creator-college/locker"}>⧉<b>MAKE ANOTHER LIKE THIS</b><small>Reuse a successful structure</small></a>
      <a href="/creator-college/profile">◎<b>MY CREATOR PROFILE</b><small>Update voice, look, audience and brands</small></a>
    </div></section>

    <section className="cc4-section"><div className="cc4-section-head"><div><span className="cc4-eyebrow">RECENT WORK</span><h2>YOUR LATEST CREATIONS</h2></div><a href="/creator-college/locker">OPEN LOCKER</a></div>{total===0?<div className="cc4-empty">Nothing here yet. Your first finished creation will change this page completely.</div>:<div className="cc4-grid cc4-card-grid">{creations.slice(0,4).map(item=><article className="cc4-card" key={item.id}><small>{item.status}{item.parentId?" · FAMILY MEMBER":""}</small><h3>{item.title}</h3><p>{item.format}</p><div className="cc4-meter"><span style={{width:`${item.progress}%`}}/></div><b>{item.progress}%</b><a href="/creator-college">{item.status==="BUILDING"?"CONTINUE":"OPEN"}</a></article>)}{videos.slice(0,2).map(item=><article className="cc4-card" key={item.id}><small>{item.status} · VIDEO SERIES</small><h3>{item.title}</h3><p>5-Video Series</p><div className="cc4-meter"><span style={{width:`${item.progress}%`}}/></div><b>{item.progress}%</b><a href="/creator-college/video">{item.status==="BUILDING"?"CONTINUE":"OPEN"}</a></article>)}</div>}</section>
  </main>;
}
