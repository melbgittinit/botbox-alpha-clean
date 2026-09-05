"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { findUnifiedCreation } from "../lib/creatorCollegeStore";

const moves:Record<string,{label:string;title:string;copy:string;route:string;reuse:string}[]>={
 digital_product:[
  {label:"BEST NEXT MOVE",title:"5-Video Series",copy:"Turn the core ideas into five short videos.",route:"/creator-college/video",reuse:"74% reused"},
  {label:"FASTEST TO MAKE",title:"Simple Service Offer",copy:"Turn the result into a small done-for-you service.",route:"/creator-college/service",reuse:"68% reused"},
  {label:"BEST FOR REACH",title:"Church / Group Kit",copy:"Adapt the content into a group experience.",route:"/creator-college/event",reuse:"62% reused"}],
 video_series:[
  {label:"BEST NEXT MOVE",title:"Digital Guide",copy:"Turn the scripts into a readable guide or workbook.",route:"/creator-college",reuse:"82% reused"},
  {label:"BEST TO EARN",title:"Simple Service Offer",copy:"Package the expertise behind the series into a service.",route:"/creator-college/service",reuse:"64% reused"},
  {label:"BEST FOR SCALE",title:"Starter Brand",copy:"Give the series and its related work a recognizable identity.",route:"/creator-college/brand",reuse:"58% reused"}],
 event_kit:[
  {label:"BEST NEXT MOVE",title:"Repeatable Event Brand",copy:"Turn the one-time event into a recognizable series.",route:"/creator-college/brand",reuse:"78% reused"},
  {label:"FASTEST TO MAKE",title:"Digital Resource Kit",copy:"Package the materials into a reusable guide or kit.",route:"/creator-college",reuse:"72% reused"},
  {label:"BEST TO EARN",title:"Event Planning Service",copy:"Offer the event system as a service to another group.",route:"/creator-college/service",reuse:"66% reused"}],
 service_offer:[
  {label:"BEST NEXT MOVE",title:"Starter Brand",copy:"Give the offer a recognizable identity and message.",route:"/creator-college/brand",reuse:"76% reused"},
  {label:"FASTEST TO MAKE",title:"Client Guide",copy:"Turn the process into a simple client-facing guide.",route:"/creator-college",reuse:"70% reused"},
  {label:"BEST FOR SCALE",title:"Business Starter System",copy:"Turn the proven offer into a repeatable operating system.",route:"/creator-college/business",reuse:"84% reused"}],
 brand:[
  {label:"BEST NEXT MOVE",title:"Business Starter System",copy:"Turn the brand into a customer, offer, sales, and operations system.",route:"/creator-college/business",reuse:"86% reused"},
  {label:"BEST FOR REACH",title:"5-Video Launch Series",copy:"Introduce the brand through five focused videos.",route:"/creator-college/video",reuse:"68% reused"},
  {label:"BEST TO EARN",title:"Simple Service Offer",copy:"Give the brand a clear first commercial offer.",route:"/creator-college/service",reuse:"74% reused"}],
 business:[
  {label:"BEST NEXT MOVE",title:"Launch Video Series",copy:"Turn the business message into a focused introduction campaign.",route:"/creator-college/video",reuse:"66% reused"},
  {label:"FASTEST TO MAKE",title:"Customer Guide",copy:"Create a simple guide that supports sales or onboarding.",route:"/creator-college",reuse:"72% reused"},
  {label:"BEST FOR GROWTH",title:"Event / Workshop Kit",copy:"Turn the business into a live group experience or workshop.",route:"/creator-college/event",reuse:"61% reused"}],
};

export default function ExplodePage(){const params=useSearchParams();const item=useMemo(()=>findUnifiedCreation(params.get("kind")||"",params.get("id")||""),[params]);if(!item)return <main className="cc4-shell"><section className="cc4-hero"><h1>CREATION NOT FOUND.</h1></section></main>;const options=moves[item.kind]||moves.digital_product;return <main className="cc4-shell"><section className="cc4-hero"><span className="cc4-eyebrow">EXPLODE THIS</span><h1>ONE CREATION SHOULD NEVER HAVE TO STAY ONE CREATION.</h1><p>We’re using <b>{item.title}</b> as the source. The next creation should reuse what already works instead of starting from zero.</p></section><section className="cc4-section"><div className="cc4-grid cc4-card-grid">{options.map(o=><article className="cc4-card" key={o.title}><small>{o.label}</small><h3>{o.title}</h3><p>{o.copy}</p><b>{o.reuse}</b><a href={o.route}>BUILD FROM MY ORIGINAL</a></article>)}</div></section><section className="cc5-smart-panel"><div><span className="cc4-eyebrow">CREATION FAMILY</span><h2>KEEP THE ORIGINAL AT THE CENTER.</h2><p>Anything you build next should stay connected to this source so the Locker can eventually show the whole family as one body of work.</p></div><a className="cc4-primary" href="/creator-college/locker">OPEN MY LOCKER</a></section></main>}
