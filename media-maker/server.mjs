import {getNews} from './news.mjs';
import {productionAccess} from './production-access.mjs';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
const newsPage=await readFile(new URL('./news.html',import.meta.url));
const studio=await readFile(new URL('./studio.html',import.meta.url));
const server=http.createServer(async (req,res)=>{
 const url=new URL(req.url,'http://localhost');
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
 if(url.pathname.startsWith('/api/production/')){
 const access=productionAccess(req.headers.authorization);
 res.setHeader('Cache-Control','no-store');
 res.writeHead(access.ok?503:access.status,{'Content-Type':'application/json'});
 return res.end(JSON.stringify({error:access.ok?'Video production is not enabled':access.error}));
 }
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
 if(url.pathname==='/news'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});return res.end(newsPage);}
 if(url.pathname==='/api/news'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});return res.end(JSON.stringify(await getNews()));}
 if(url.pathname==='/health'){res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:true,product:'Media Maker',features:{drafts:true,editBrief:true,captions:true,onlineRendering:false,research:false,payments:false}}));}
 if(url.pathname!=='/'&&url.pathname!=='/studio'){res.writeHead(404);return res.end('Not found');}
 res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
 res.end(req.method==='HEAD'?undefined:studio);
});
server.listen(Number(process.env.PORT)||10000,'0.0.0.0');
