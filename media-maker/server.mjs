import {writingStatus,generatePoint} from './writer.mjs';
import {getNews} from './news.mjs';
import {productionAccess} from './production-access.mjs';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
const newsPage=await readFile(new URL('./news.html',import.meta.url));
const heroVideo=Buffer.from((await readFile(new URL('./hero-loop.mp4.b64',import.meta.url),'utf8')).trim(),'base64');
const ownerPage=await readFile(new URL('./owner.html',import.meta.url));
const studio=await readFile(new URL('./studio.html',import.meta.url));
const enquiryRates=new Map();
const server=http.createServer(async (req,res)=>{
 const url=new URL(req.url,'http://localhost');
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');

 if(url.pathname==='/api/writing-status'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});return res.end(JSON.stringify(writingStatus()));}
 if(url.pathname==='/api/make-point'){
 const send=(n,d)=>{res.writeHead(n,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(d))};
 if(req.method!=='POST')return send(405,{error:'POST required'});
 if(!writingStatus().enabled)return send(503,{error:'Writing service not connected. No generated package was created.'});
 if(req.headers.origin!=='https://media-maker-studio-preview.onrender.com')return send(403,{error:'Open the studio directly'});
 if(!(req.headers['content-type']||'').startsWith('application/json'))return send(415,{error:'JSON required'});
 const key='writer:'+new Date().toISOString().slice(0,10),entry=enquiryRates.get(key)||{start:Date.now(),count:0};
 if(entry.count>=20)return send(429,{error:'Writing pilot limit reached'});entry.count++;enquiryRates.set(key,entry);
 try{let raw='',size=0;for await(const chunk of req){size+=chunk.length;if(size>24000)return send(413,{error:'Brief too large'});raw+=chunk.toString()}return send(200,await generatePoint(JSON.parse(raw)))}catch{return send(422,{error:'Package not completed. Check your evidence or provider configuration; no result has been approved.'})}
 }

 const configured=!!process.env.MEDIA_MAKER_ENQUIRY_URL&&!!process.env.MEDIA_MAKER_ENQUIRY_KEY;
 if(url.pathname==='/api/enquiry-status'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});return res.end(JSON.stringify({enabled:configured}));}
 if(url.pathname==='/api/enquiries'){
 const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 if(req.method!=='POST')return send(405,{error:'Method not allowed'});
 if(!configured)return send(503,{error:'Enquiry submission is not configured'});
 if(req.headers.origin!=='https://media-maker-studio-preview.onrender.com')return send(403,{error:'Open the studio directly to submit'});
 if(!(req.headers['content-type']||'').startsWith('application/json'))return send(415,{error:'JSON required'});
 const now=Date.now();for(const [k,v] of enquiryRates)if(now-v.start>3600000)enquiryRates.delete(k);
 const ip=(req.headers['x-forwarded-for']||req.socket.remoteAddress||'unknown').split(',')[0],rate=enquiryRates.get(ip)||{start:now,count:0};
 if(rate.count>=10||enquiryRates.size>=5000)return send(429,{error:'Too many requests; try later'});rate.count++;enquiryRates.set(ip,rate);
 let raw='',bytes=0;try{for await(const chunk of req){bytes+=chunk.length;if(bytes>12000)return send(413,{error:'Request too large'});raw+=chunk.toString()}
 const data=JSON.parse(raw);if(data.website)return send(400,{error:'Invalid request'});
 const out=await fetch(process.env.MEDIA_MAKER_ENQUIRY_URL,{method:'POST',headers:{'Content-Type':'application/json','x-media-key':process.env.MEDIA_MAKER_ENQUIRY_KEY},body:JSON.stringify(data),signal:AbortSignal.timeout(15000)});
 const result=await out.json();return send(out.status,result);
 }catch{return send(503,{error:'Unable to confirm save. Retry this same request; do not assume it was submitted.'})}
 }

 if(url.pathname.startsWith('/api/production/')){
 const access=productionAccess(req.headers.authorization);
 res.setHeader('Cache-Control','no-store');
 res.writeHead(access.ok?503:access.status,{'Content-Type':'application/json'});
 return res.end(JSON.stringify({error:access.ok?'Video production is not enabled':access.error}));
 }
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
 if(url.pathname==='/hero-loop.mp4'){res.writeHead(200,{'Content-Type':'video/mp4','Content-Length':heroVideo.length,'Cache-Control':'public,max-age=3600'});return res.end(req.method==='HEAD'?undefined:heroVideo);}
 if(url.pathname==='/owner'){res.setHeader('Cache-Control','no-store');res.setHeader('X-Robots-Tag','noindex, nofollow');res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});return res.end(ownerPage);}
 if(url.pathname==='/news'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});return res.end(newsPage);}
 if(url.pathname==='/api/news'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});return res.end(JSON.stringify(await getNews()));}
 if(url.pathname==='/health'){res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:true,product:'Media Maker',features:{drafts:true,editBrief:true,captions:true,onlineRendering:false,research:false,payments:false}}));}
 if(url.pathname!=='/'&&url.pathname!=='/studio'){res.writeHead(404);return res.end('Not found');}
 res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
 res.end(req.method==='HEAD'?undefined:studio);
});
server.listen(Number(process.env.PORT)||10000,'0.0.0.0');
