export type UnifiedCreation={
 id:string; title:string; kind:"digital_product"|"video_series"|"event_kit"|"service_offer"|"brand"|"business"; format:string; progress:number;
 status:"BUILDING"|"COMPLETE"; updatedAt:string; familyId?:string; parentId?:string; style?:string; route:string; raw:unknown;
};

const DIGITAL_KEY="creator-college-v1-creations";
const VIDEO_KEY="creator-college-v1-video-projects";
const EVENT_KEY="creator-college-v1-event-projects";
const SERVICE_KEY="creator-college-v1-service-projects";
const BRAND_KEY="creator-college-v1-brand-projects";
const BUSINESS_KEY="creator-college-v1-business-projects";

function read(key:string){if(typeof window==="undefined")return[];try{return JSON.parse(localStorage.getItem(key)||"[]")}catch{return[]}}

export function readUnifiedCreations():UnifiedCreation[]{
 const digital=read(DIGITAL_KEY).map((x:any)=>({id:x.id,title:x.title,kind:"digital_product" as const,format:x.format||"Digital Product",progress:x.progress||0,status:x.status||"BUILDING",updatedAt:x.updatedAt||"",familyId:x.familyId,parentId:x.parentId,style:x.style,route:"/creator-college",raw:x}));
 const video=read(VIDEO_KEY).map((x:any)=>({id:x.id,title:x.title,kind:"video_series" as const,format:x.format||"Video Series",progress:x.progress||0,status:x.status||"BUILDING",updatedAt:x.updatedAt||"",familyId:x.familyId,parentId:x.parentId,style:x.style,route:"/creator-college/video",raw:x}));
 const events=read(EVENT_KEY).map((x:any)=>({id:x.id,title:x.title,kind:"event_kit" as const,format:x.eventType||"Event Kit",progress:x.progress||0,status:x.status||"BUILDING",updatedAt:x.updatedAt||"",familyId:x.familyId,parentId:x.parentId,style:x.style,route:"/creator-college/event",raw:x}));
 const services=read(SERVICE_KEY).map((x:any)=>({id:x.id,title:x.offer||x.skill||"Simple Service Offer",kind:"service_offer" as const,format:"Simple Service Offer",progress:x.progress||0,status:x.status||"BUILDING",updatedAt:x.updatedAt||"",familyId:x.familyId,parentId:x.parentId,style:"Business",route:"/creator-college/service",raw:x}));
 const brands=read(BRAND_KEY).map((x:any)=>({id:x.id,title:x.name||"Starter Brand",kind:"brand" as const,format:x.brandType||"Starter Brand",progress:x.progress||0,status:x.status||"BUILDING",updatedAt:x.updatedAt||"",style:x.style,route:"/creator-college/brand",raw:x}));
 const businesses=read(BUSINESS_KEY).map((x:any)=>({id:x.id,title:x.name||"Business Starter System",kind:"business" as const,format:"Business Starter System",progress:x.progress||0,status:x.status||"BUILDING",updatedAt:x.updatedAt||"",style:"Business",route:"/creator-college/business",raw:x}));
 return [...digital,...video,...events,...services,...brands,...businesses].sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

export function familyGroups(items:UnifiedCreation[]){
 const map=new Map<string,UnifiedCreation[]>();
 for(const item of items){const key=item.familyId||`solo-${item.kind}-${item.id}`;map.set(key,[...(map.get(key)||[]),item])}
 return Array.from(map.entries());
}
