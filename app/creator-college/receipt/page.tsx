"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { findUnifiedCreation } from "../lib/creatorCollegeStore";

function details(kind:string,raw:any){
 if(kind==="video_series")return[{k:"TYPE",v:"Video Series"},{k:"FOR",v:raw.audience||"Audience not set"},{k:"RESULT",v:`${raw.episodes?.length||0} episodes ready`},{k:"USE",v:raw.useMode||raw.goal||"Creator use"}];
 if(kind==="event_kit")return[{k:"TYPE",v:raw.eventType||"Event Kit"},{k:"FOR",v:raw.audience||"Audience not set"},{k:"RESULT",v:`${(raw.promo?.length||0)+(raw.materials?.length||0)} event assets`},{k:"USE",v:raw.purpose||"Group use"}];
 if(kind==="service_offer")return[{k:"TYPE",v:"Service Offer"},{k:"FOR",v:raw.customer||"Customer not set"},{k:"RESULT",v:raw.offer||raw.skill||"Service packaged"},{k:"USE",v:"Create to Earn"}];
 if(kind==="brand")return[{k:"TYPE",v:raw.brandType||"Starter Brand"},{k:"FOR",v:raw.audience||"Audience not set"},{k:"RESULT",v:`${raw.connectedIds?.length||0} connected creations`},{k:"USE",v:"Brand growth"}];
 if(kind==="business")return[{k:"TYPE",v:"Business Starter System"},{k:"FOR",v:raw.customer||"Customer not set"},{k:"RESULT",v:raw.offer||"Operating business system"},{k:"USE",v:"Business growth"}];
 return[{k:"TYPE",v:raw.format||"Digital Product"},{k:"FOR",v:raw.audience||"Audience not set"},{k:"RESULT",v:raw.result||`${raw.sections?.length||0} sections`},{k:"USE",v:raw.useMode||"Creator use"}];
}
export default function ReceiptPage(){const params=useSearchParams();const item=useMemo(()=>findUnifiedCreation(params.get("kind")||"",params.get("id")||""),[params]);if(!item)return <main className="cc4-shell"><section className="cc4-hero"><h1>CREATION NOT FOUND.</h1><p>This receipt belongs to work saved on this device.</p></section></main>;const rows=details(item.kind,item.raw);return <main className="cc4-shell"><section className="cc4-hero"><span className="cc4-eyebrow">CREATOR RECEIPT</span><h1>YOU MADE SOMETHING.</h1><p>You didn’t complete a lesson. You created a finished piece of work.</p></section><section className="cc5-smart-panel"><div><span className="cc4-eyebrow">{item.kind.replaceAll("_"," ").toUpperCase()}</span><h2>{item.title}</h2><div className="cc4-review-list">{rows.map(r=><div key={r.k}><span>✓</span><b>{r.k}</b><small>{r.v}</small></div>)}</div></div></section><section className="cc4-section"><div className="cc4-grid cc4-actions-grid"><a href={`/creator-college/explode?kind=${item.kind}&id=${encodeURIComponent(item.id)}`}>✹<b>EXPLODE THIS</b><small>Build the next useful thing from it</small></a><a href={`/creator-college/open?kind=${item.kind}&id=${encodeURIComponent(item.id)}`}>↺<b>OPEN ORIGINAL</b><small>Return to the exact saved project</small></a><a href="/creator-college/locker">▦<b>MY LOCKER</b><small>See all finished work</small></a><a href="/creator-college/desk">✦<b>MY CREATOR DESK</b><small>Choose the next move</small></a></div></section></main>}
