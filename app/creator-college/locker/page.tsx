"use client";

import { useEffect, useMemo, useState } from "react";
import { familyGroups, readUnifiedCreations, type UnifiedCreation } from "../lib/creatorCollegeStore";

type Template={id:string;title:string;format:string;style:string;sourceId:string;kind:string};
const TEMPLATE_KEY="creator-college-v1-templates";

export default function CreatorLockerPage(){
  const[creations,setCreations]=useState<UnifiedCreation[]>([]);
  const[templates,setTemplates]=useState<Template[]>([]);
  useEffect(()=>{setCreations(readUnifiedCreations());setTemplates(JSON.parse(localStorage.getItem(TEMPLATE_KEY)||"[]"))},[]);
  const families=useMemo(()=>familyGroups(creations),[creations]);

  function saveTemplate(item:UnifiedCreation){const next:Template={id:`tpl-${Date.now()}`,title:`${item.title} Template`,format:item.format,style:item.style||"Clean",sourceId:item.id,kind:item.kind};const list=[next,...templates.filter(t=>t.sourceId!==item.id)];localStorage.setItem(TEMPLATE_KEY,JSON.stringify(list));setTemplates(list)}
  function deleteTemplate(id:string){const list=templates.filter(t=>t.id!==id);localStorage.setItem(TEMPLATE_KEY,JSON.stringify(list));setTemplates(list)}

  return <main className="cc4-shell"><section className="cc4-hero"><span className="cc4-eyebrow">PORTFOLIO MODE</span><h1>MY CREATOR LOCKER</h1><p>Digital products, video series, event kits, families, and reusable starting points in one place.</p></section>

    <section className="cc4-section"><div className="cc4-section-head"><div><span className="cc4-eyebrow">CREATION FAMILIES</span><h2>KEEP RELATED WORK TOGETHER</h2></div><span>{families.length} families / groups</span></div>{families.length===0?<div className="cc4-empty">Finish something in Creator College and it will appear here.</div>:<div className="cc4-family-list">{families.map(([familyId,items])=><article className="cc4-family" key={familyId}><div className="cc4-family-head"><div><small>{items.length>1?"CREATION FAMILY":"CREATION"}</small><h3>{items[0].title.replace(/ — .+$/,'')}</h3></div><b>{items.length} item{items.length===1?"":"s"}</b></div><div className="cc4-family-items">{items.map(item=><div key={`${item.kind}-${item.id}`}><span>{item.status==="COMPLETE"?"✓":"◌"}</span><div><b>{item.title}</b><small>{item.kind.replace("_"," ")} · {item.format} · {item.progress}%</small></div><div className="cc4-mini-actions"><a href={item.route}>{item.status==="BUILDING"?"CONTINUE":"OPEN"}</a><button onClick={()=>saveTemplate(item)}>SAVE AS TEMPLATE</button></div></div>)}</div></article>)}</div>}</section>

    <section className="cc4-section" id="templates"><div className="cc4-section-head"><div><span className="cc4-eyebrow">MY TEMPLATES</span><h2>START FASTER NEXT TIME</h2></div><span>{templates.length} saved</span></div>{templates.length===0?<div className="cc4-empty">Save a strong creation as a template and Creator College will remember its useful starting structure.</div>:<div className="cc4-grid cc4-card-grid">{templates.map(t=><article className="cc4-card" key={t.id}><small>{t.kind.replace("_"," ").toUpperCase()} TEMPLATE</small><h3>{t.title}</h3><p>{t.format} · {t.style}</p><div className="cc4-mini-actions"><a href={t.kind==="video_series"?"/creator-college/video":t.kind==="event_kit"?"/creator-college/event":"/creator-college"}>USE TEMPLATE</a><button onClick={()=>deleteTemplate(t.id)}>REMOVE</button></div></article>)}</div>}</section>
  </main>;
}
