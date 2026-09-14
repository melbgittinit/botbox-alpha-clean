import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {Problem,token,hash,rateKey,normalizeSave,normalizePlan,sessionFrom,text} from './security.mjs';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function body(req){let size=0,chunks=[];for await(const chunk of req){size+=chunk.length;if(size>65536)throw new Problem(413,'Please shorten your party plan.');chunks.push(chunk);}try{return JSON.parse(Buffer.concat(chunks).toString());}catch{throw new Problem(400,'We could not read those details. Please try again.');}}
function reply(res,status,value){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(value));}
export function createApp({store,sendAccess,config}){
 const allowed=new Set([config.origin,'https://womenofcolorstudybibles.com','https://www.womenofcolorstudybibles.com']);
 const enabled=()=>config.enabled&&store&&sendAccess&&config.rateSecret?.length>=32;
 return async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
  const origin=req.headers.origin;if(allowed.has(origin)){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Credentials','true');}
  try{
   const path=new URL(req.url,'https://local.invalid').pathname;
   if(req.method==='OPTIONS'){if(!allowed.has(origin))throw new Problem(403,'This request is not permitted.');res.setHeader('Access-Control-Allow-Methods','GET, POST, PATCH, DELETE, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');res.writeHead(204);return res.end();}
   if(req.method==='GET'&&path==='/healthz')return reply(res,200,{service:'woc-garden-party',version:'0.2.0',publicWritesEnabled:Boolean(enabled())});
   if(req.method==='GET'&&path==='/readyz'){if(!enabled())return reply(res,503,{ready:false});await store.health();return reply(res,200,{ready:true});}
   if(req.method==='GET'&&['/garden-party/access','/garden-party/host'].includes(path)){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(await readFile(new URL('./host.html',import.meta.url)));}
   if(req.method==='GET'&&['/host.js','/host.css'].includes(path)){res.setHeader('Content-Type',path.endsWith('.js')?'text/javascript; charset=utf-8':'text/css; charset=utf-8');return res.end(await readFile(new URL('.'+path,import.meta.url)));}
   if(!path.startsWith('/api/'))throw new Problem(404,'This page is not available.');
   if(!enabled())throw new Problem(503,'Private party saving is not open yet. Your downloaded plan is still available.');
   if(req.method!=='GET'){
    if(!allowed.has(origin))throw new Problem(403,'Please open this request from Women of Color.');
    if(!(req.headers['content-type']||'').startsWith('application/json'))throw new Problem(415,'Please use the party form to send these details.');
   }
   if(req.method==='POST'&&path==='/api/parties/save'){
    const input=normalizeSave(await body(req));
    if(!await store.rate(rateKey('email:'+input.email,config.rateSecret),3)||!await store.rate(rateKey('network:'+req.socket.remoteAddress,config.rateSecret),100))throw new Problem(429,'Please wait before requesting another private link.');
    const id=randomUUID(),secret=token();await store.pending(id,hash(secret),input);
    try{await sendAccess({id,email:input.email,firstName:input.firstName,url:config.origin+'/garden-party/access#'+secret});await store.accepted(id);}catch(error){await store.discard(id);throw new Problem(502,'We could not send your private link. Please try again shortly.');}
    return reply(res,202,{status:'check_email',message:'Check your email for a private link. Confirm it to keep your party. This does not subscribe you to EVE.'});
   }
   if(req.method==='POST'&&path==='/api/access/request'){
    const input=await body(req),email=text(input.email,254,true).toLowerCase();if(input.passwordlessPermission!==true||!/^\S+@\S+\.\S+$/.test(email))throw new Problem(400,'Enter your email and allow a private access link.');
    if(!await store.rate(rateKey('email:'+email,config.rateSecret),3)||!await store.rate(rateKey('network:'+req.socket.remoteAddress,config.rateSecret),100))throw new Problem(429,'Please wait before requesting another private link.');
    const id=randomUUID(),secret=token(),existing=await store.resumePending(id,hash(secret),email);
    if(existing){try{await sendAccess({id,email,firstName:existing.first_name,url:config.origin+'/garden-party/access#'+secret});await store.accepted(id);}catch{await store.discard(id);throw new Problem(502,'We could not send a private link. Please try again shortly.');}}
    return reply(res,202,{message:'If that email has a saved party, a new private link is on its way.'});
   }
   if(req.method==='POST'&&path==='/api/access/confirm'){
    if(!await store.rate(rateKey('confirm:'+req.socket.remoteAddress,config.rateSecret),100))throw new Problem(429,'Please wait before trying again.');
    const input=await body(req),secret=text(input.token,43,true);if(!/^[A-Za-z0-9_-]{43}$/.test(secret))throw new Problem(400,'That private link is not valid.');
    const session=token(),result=await store.redeem(hash(secret),hash(session));if(!result)throw new Problem(410,'That link has expired or was already used. Please request a new link.');
    res.setHeader('Set-Cookie','woc_host='+session+'; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800');return reply(res,200,{partyId:result.partyId});
   }
   const cookie=sessionFrom(req),session=cookie?await store.session(hash(cookie)):null;
   if(!session)throw new Problem(401,'Please open your private access link to view your party.');
   if(req.method==='GET'&&path==='/api/host')return reply(res,200,{partyId:session.party_id});
   if(req.method==='POST'&&path==='/api/logout'){await store.logout(hash(cookie));res.setHeader('Set-Cookie','woc_host=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');return reply(res,200,{signedOut:true});}
   const match=path.match(/^\/api\/parties\/([^/]+)$/);if(!match||!uuid.test(match[1]))throw new Problem(404,'Party not found.');
   const party=await store.party(match[1],session.member_id);if(!party)throw new Problem(404,'Party not found.');
   if(req.method==='GET')return reply(res,200,party);
   if(req.method==='PATCH'){const input=await body(req);if(!Number.isInteger(input.version)||input.version<1)throw new Problem(400,'Please reload your party before saving.');const result=await store.update(party.id,session.member_id,input.version,normalizePlan(input.plan));if(!result)throw new Problem(409,'Your party changed in another window. Reload before saving.');return reply(res,200,result);}
   if(req.method==='DELETE'){await store.remove(party.id,session.member_id);return reply(res,200,{deleted:true});}
   throw new Problem(405,'That action is not available.');
  }catch(error){reply(res,error instanceof Problem?error.status:500,{error:error instanceof Problem?error.message:'Something went wrong. Please try again shortly.'});if(!(error instanceof Problem))console.error('WOC request failed');}
 };
}
