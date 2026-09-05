"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { STORAGE_BY_KIND, type CreationKind } from "../lib/creatorCollegeStore";

type Template={id:string;title:string;format:string;style:string;sourceId:string;kind:CreationKind;seed:any};
const TEMPLATE_KEY="creator-college-v1-templates";

function buildDraft(t:Template){const now=new Date().toISOString();const id=`${t.kind}-${Date.now()}`;const s=t.seed||{};
 if(t.kind==="digital_product")return{id,title:"Untitled Creation",subtitle:"",idea:"",audience:"",result:"",format:s.format||"Mini Guide",outline:s.outline||[],sections:(s.outline||[]).map((title:string)=>({title,body:""})),style:s.style||"Clean",useMode:"Keep it for me",step:"idea",progress:8,status:"BUILDING",updatedAt:now};
 if(t.kind==="video_series")return{id,title:"Untitled Series",audience:"",goal:"Teach",format:s.format||"5 Short Videos",episodes:[],style:s.style||"Clean",posting:s.posting||"3x a week",useMode:"Build my audience",step:0,progress:5,status:"BUILDING",updatedAt:now};
 if(t.kind==="event_kit")return{id,title:"Untitled Event",eventType:s.eventType||"Church Event",purpose:"Bring people together",audience:"",feeling:"Connected",tagline:"",style:s.style||"Warm",timeline:s.timeline||[],promo:[],materials:[],followup:"",step:0,progress:5,status:"BUILDING",updatedAt:now};
 if(t.kind==="service_offer")return{id,skill:"",problem:"",customer:"",offer:"",delivery:s.delivery||"Done for you",pricePosition:s.pricePosition||"Starter",packageLevel:s.packageLevel||"Starter",promo:[],salesMessage:"",followup:"",step:0,progress:5,status:"BUILDING",updatedAt:now};
 if(t.kind==="brand")return{id,name:"Untitled Brand",brandType:s.brandType||"Creator / Media",purpose:"",audience:"",position:"",promise:"",personality:"Warm",style:s.style||"Modern",tagline:"",shortDescription:"",voice:s.voice||"Conversational",assets:s.assets||["Brand Name","Tagline","Short Description"],connectedIds:[],step:0,progress:5,status:"BUILDING",updatedAt:now};
 return{id,name:"Untitled Business",businessType:s.businessType||"Solo / Small Business",customer:"",offer:"",delivery:s.delivery||"Simple delivery",pricePosition:"",salesMessage:"",operations:[],growthFocus:s.growthFocus||"Get first customers",step:0,progress:5,status:"BUILDING",updatedAt:now};
}

export default function TemplateUsePage(){const params=useSearchParams();const[message,setMessage]=useState("Building a fresh draft from your template…");useEffect(()=>{const id=params.get("id");const list=JSON.parse(localStorage.getItem(TEMPLATE_KEY)||"[]") as Template[];const t=list.find(x=>x.id===id);if(!t){setMessage("Template not found on this device.");return}const cfg=STORAGE_BY_KIND[t.kind];const draft=buildDraft(t);const existing=JSON.parse(localStorage.getItem(cfg.key)||"[]");localStorage.setItem(cfg.key,JSON.stringify([draft,...existing]));localStorage.setItem(cfg.activeKey,draft.id);window.location.href=cfg.builderRoute},[params]);return <main className="cc4-shell"><section className="cc4-hero"><span className="cc4-eyebrow">MY TEMPLATE</span><h1>{message}</h1><p>The reusable structure stays. The old project-specific content does not.</p></section></main>}
