import http from 'node:http';
import {readFile} from 'node:fs/promises';
const studio=await readFile(new URL('./studio.html',import.meta.url));
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
 if(url.pathname==='/health'){res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:true,product:'Media Maker',features:{drafts:true,editBrief:true,captions:true,onlineRendering:false,research:false,payments:false}}));}
 if(url.pathname!=='/'&&url.pathname!=='/studio'){res.writeHead(404);return res.end('Not found');}
 res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
 res.end(req.method==='HEAD'?undefined:studio);
});
server.listen(Number(process.env.PORT)||10000,'0.0.0.0');
