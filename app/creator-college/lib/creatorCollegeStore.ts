export type CreationKind="digital_product"|"video_series"|"event_kit"|"service_offer"|"brand"|"business";
export type UnifiedCreation={
 id:string; title:string; kind:CreationKind; format:string; progress:number;
 status:"BUILDING"|"COMPLETE"; updatedAt:string; familyId?:string; parentId?:string; style?:string; route:string; builderRoute:string; raw:any;
};

export const STORAGE_BY_KIND:Record<CreationKind,{key:string;activeKey:string;builderRoute:string}>={
 digital_product:{key:"creator-college-v1-creations",activeKey:"creator-college-v1-active",builderRoute:"/creator-college"},
 video_series:{key:"creator-college-v1-video-projects",activeKey:"creator-college-v1-video-active",builderRoute:"/creator-college/video"},
 event_kit:{key:"creator-college-v1-event-projects",activeKey:"creator-college-v1-event-active",builderRoute:"/creator-college/event"},
 service_offer:{key:"creator-college-v1-service-projects",activeKey:"creator-college-v1-service-active",builderRoute:"/creator-college/service"},
 brand:{key:"creator-college-v1-brand-projects",activeKey:"creator-college-v1-brand-active",builderRoute:"/creator-college/brand"},
 business:{key:"creator-college-v1-business-projects",activeKey:"creator-college-v1-business-active",builderRoute:"/creator-college/business"},
};

function read(key:string){if(typeof window==="undefined")return[];try{return JSON.parse(localStorage.getItem(key)||"[]")}catch{return[]}}
function routeFor(kind:CreationKind,id:string,status:"BUILDING"|"COMPLETE"){return status==="COMPLETE"?`/creator-college/receipt?kind=${kind}&id=${encodeURIComponent(id)}`:`/creator-college/open?kind=${kind}&id=${encodeURIComponent(id)}`}

export function readUnifiedCreations():UnifiedCreation[]{
 const digital=read(STORAGE_BY_KIND.digital_product.key).map((x:any)=>({id:x.id,title:x.title,kind:"digital_product" as const,format:x.format||"Digital Product",progress:x.progress||0,status:x.status||"BUILDING",updatedAt:x.updatedAt||"",familyId:x.familyId,parentId:x.parentId,style:x.style,builderRoute:STORAGE_BY_KIND.digital_product.builderRoute,route:routeFor("digital_product",x.id,x.status||"BUILDING"),raw:x}));
 const video=read(STORAGE_BY_KIND.video_series.key).map((x:any)=>({id:x.id,title:x.title,kind:"video_series" as const,format:x.format||"Video Series",progress:x.progress||0,status:x.status||"BUILDING",updatedAt:x.updatedAt||"",familyId:x.familyId,parentId:x.parentId,style:x.style,builderRoute:STORAGE_BY_KIND.video_series.builderRoute,route:routeFor("video_series",x.id,x.status||"BUILDING"),raw:x}));
 const events=read(STORAGE_BY_KIND.event_kit.key).map((x:any)=>({id:x.id,title:x.title,kind:"event_kit" as const,format:x.eventType||"Event Kit",progress:x.progress||0,status:x.status||"BUILDING",updatedAt:x.updatedAt||"",familyId:x.familyId,parentId:x.parentId,style:x.style,builderRoute:STORAGE_BY_KIND.event_kit.builderRoute,route:routeFor("event_kit",x.id,x.status||"BUILDING"),raw:x}));
 const services=read(STORAGE_BY_KIND.service_offer.key).map((x:any)=>({id:x.id,title:x.offer||x.skill||"Simple Service Offer",kind:"service_offer" as const,format:"Simple Service Offer",progress:x.progress||0,status:x.status||"BUILDING",updatedAt:x.updatedAt||"",familyId:x.familyId,parentId:x.parentId,style:"Business",builderRoute:STORAGE_BY_KIND.service_offer.builderRoute,route:routeFor("service_offer",x.id,x.status||"BUILDING"),raw:x}));
 const brands=read(STORAGE_BY_KIND.brand.key).map((x:any)=>({id:x.id,title:x.name||"Starter Brand",kind:"brand" as const,format:x.brandType||"Starter Brand",progress:x.progress||0,status:x.status||"BUILDING",updatedAt:x.updatedAt||"",style:x.style,builderRoute:STORAGE_BY_KIND.brand.builderRoute,route:routeFor("brand",x.id,x.status||"BUILDING"),raw:x}));
 const businesses=read(STORAGE_BY_KIND.business.key).map((x:any)=>({id:x.id,title:x.name||"Business Starter System",kind:"business" as const,format:"Business Starter System",progress:x.progress||0,status:x.status||"BUILDING",updatedAt:x.updatedAt||"",style:"Business",builderRoute:STORAGE_BY_KIND.business.builderRoute,route:routeFor("business",x.id,x.status||"BUILDING"),raw:x}));
 return [...digital,...video,...events,...services,...brands,...businesses].sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

export function findUnifiedCreation(kind:string,id:string){return readUnifiedCreations().find(item=>item.kind===kind&&item.id===id)||null}
export function familyGroups(items:UnifiedCreation[]){const map=new Map<string,UnifiedCreation[]>();for(const item of items){const key=item.familyId||`solo-${item.kind}-${item.id}`;map.set(key,[...(map.get(key)||[]),item])}return Array.from(map.entries())}
