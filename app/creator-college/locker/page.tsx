"use client";

import { useEffect, useMemo, useState } from "react";
import { familyGroups, readUnifiedCreations, type UnifiedCreation } from "../lib/creatorCollegeStore";

type Template={id:string;title:string;format:string;style:string;sourceId:string;kind:string;seed:any};
const TEMPLATE_KEY="creator-college-v1-templates";

export default function CreatorLockerPage(){
  const[creations,setCreations]=useState<UnifiedCreation[]>([]);
  const[templates,setTemplates]=useState<Template[]>([]);
  useEffect(()=>{setCreations(readUnifiedCreations());setTemplates(JSON.parse(localStorage.getItem(TEMPLATE_KEY)||"[]"))},[]);
  const families=useMemo(()=>familyGroups(creations),[creations]);

  function seedFor(item:UnifiedCreation){const r=item.raw||{};if(item.kind==="digital_product")return{format:r.format,style:r.style,outline:r.outline||[]};if(item.kind==="video_series")return{format:r.format,style:r.style,posting:r.posting};if(item.kind==="event_kit")return{eventType:r.eventType,style:r.style,timeline:r.timeline||[]};if(item.kind==="service_offer")return{delivery:r.delivery,pricePosition:r.pricePosition,packageLevel:r.packageLevel};if(item.kind==="brand")return{brandType:r.brandType,style:r.style,voice:r.voice,assets:r.assets||[]};if(item.kind==="business")return{businessType:r.businessType,delivery:r.delivery,growthFocus:r.growthFocus};return{}}
  function saveTemplate(item:UnifiedCreation){const next:Template={id:`tpl-${Date.now()}`,title:`${item.title} Template`,format:item.format,style:item.style||"Clean",sourceId:item.id,kind:item.kind,seed:seedFor(item)};const list=[next,...templates.filter(t=>t.sourceId!==item.id)];localStorage.setItem(TEMPLATE_KEY,JSON.stringify(list));setTemplates(list)}
  function deleteTemplate(id:string){const list=templates.filter(t=>t.id!==id);localStorage.setItem(TEMPLATE_KEY,JSON.stringify(list));setTemplates(list)}

  return <main className="cc4-shell"><section className="cc4-hero"><span className="cc4-eyebrow">PORTFOLIO MODE</span><h1>MY CREATOR LOCKER</h1><p>Everything you make—plus creation families and reusable starting systems—in one place.</p></section>

    <section className="cc4-section"><div className="cc4-section-head"><div><span className="cc4-eyebrow">CREATION FAMILIES</span><h2>KEEP RELATED WORK TOGETHER</h2></div><span>{families.length} families / groups</span></div>{families.length===0?<div className="cc4-empty">Finish something in Creator College and it will appear here.</div>:<div className="cc4-family-list">{families.map(([familyId,items])=><article className="cc4-family" key={familyId}><div className="cc4-family-head"><div><small>{items.length>1?"CREATION FAMILY":"CREATION"}</small><h3>{items[0].title.replace(/ — .+$/,'')}</h3></div><b>{items.length} item{items.length===1?"":"s"}</b></div><div className="cc4-family-items">{items.map(item=><div key={`${item.kind}-${item.id}`}><span>{item.status==="COMPLETE"?"✓":"◌"}</span><div><b>{item.title}</b><small>{item.kind.replaceAll("_"," ")} · {item.format} · {item.progress}%</small></div><div className="cc4-mini-actions"><a href={item.route}>{item.status==="BUILDING"?"CONTINUE EXACT PROJECT":"OPEN RECEIPT"}</a><button onClick={()=>saveTemplate(item)}>SAVE AS TEMPLATE</button></div></div>)}</div></article>)}</div>}</section>

    <section className="cc4-section" id="templates"><div className="cc4-section-head"><div><span className="cc4-eyebrow">MY TEMPLATES</span><h2>START FASTER NEXT TIME</h2></div><span>{templates.length} saved</span></div>{templates.length===0?<div className="cc4-empty">Save a strong creation as a template. Creator College will keep the reusable structure and style while stripping project-specific content.</div>:<div className="cc4-grid cc4-card-grid">{templates.map(t=><article className="cc4-card" key={t.id}><small>{t.kind.replaceAll("_"," ").toUpperCase()} TEMPLATE</small><h3>{t.title}</h3><p>{t.format} · {t.style}</p><div className="cc4-mini-actions"><a href={`/creator-college/template?id=${encodeURIComponent(t.id)}`}>USE TEMPLATE</a><button onClick={()=>deleteTemplate(t.id)}>REMOVE</button></div></article>)}</div>}</section>
  </main>;
}
