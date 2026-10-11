const sources=[{id:'bbc',name:'BBC News',url:'https://feeds.bbci.co.uk/news/rss.xml'},{id:'npr',name:'NPR News',url:'https://feeds.npr.org/1001/rss.xml'}];
let cache=null,inflight=null;
const plain=s=>s.replace(/^<!\[CDATA\[|\]\]>$/g,'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").trim();
export function parseFeed(xml,source){
 const field=(item,tag)=>plain(item.match(new RegExp('<'+tag+'(?:\\s[^>]*)?>([\\s\\S]*?)</'+tag+'>','i'))?.[1]||'');
 return [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].slice(0,15).map(m=>({title:field(m[1],'title'),url:field(m[1],'link'),published:field(m[1],'pubDate'),source:source.name})).filter(x=>{try{const u=new URL(x.url);return x.title&&u.protocol==='https:'&&(['bbc.com','bbc.co.uk','npr.org'].some(h=>u.hostname===h||u.hostname.endsWith('.'+h)))}catch{return false}});
}
export async function getNews(){
 if(cache&&Date.now()-cache.time<300000)return cache.data;
 if(inflight)return inflight;
 inflight=(async()=>{
 const results=await Promise.all(sources.map(async source=>{
  try{const r=await fetch(source.url,{signal:AbortSignal.timeout(8000),headers:{'User-Agent':'MediaMakerPreview/1.0'}});if(!r.ok)throw Error('Feed unavailable');const xml=await r.text();if(xml.length>2000000)throw Error('Feed too large');const items=parseFeed(xml,source);return {source:source.name,ok:items.length>0,items};}catch{return {source:source.name,ok:false,items:[]};}
 }));
 const items=results.flatMap(r=>r.items).sort((a,b)=>(Date.parse(b.published)||0)-(Date.parse(a.published)||0));
 const data={fetchedAt:new Date().toISOString(),sources:results.map(({source,ok})=>({source,ok})),items,notice:'Publisher headlines and links; not independently verified. This preview does not cover every news source.'};cache={time:Date.now(),data};return data;
 })();try{return await inflight}finally{inflight=null}
}
