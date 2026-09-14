import {createServer} from 'node:http';
import {createApp} from './app.mjs';
import {PostgresStore} from './store.mjs';
const env=process.env;
let store=null;
if(env.DATABASE_URL){const {default:pg}=await import('pg');store=new PostgresStore(new pg.Pool({connectionString:env.DATABASE_URL,max:5,connectionTimeoutMillis:10000}));}
const configured=Boolean(env.RESEND_API_KEY&&env.MAIL_FROM&&env.APP_ORIGIN?.startsWith('https://'));
const sendAccess=configured?async({id,email,firstName,url})=>{
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'woc-access-'+id},body:JSON.stringify({from:env.MAIL_FROM,to:[email],subject:'Your Garden Party private access link',text:'Hello '+firstName+',\n\nConfirm and keep your Garden Party using this private link:\n'+url+'\n\nThis link expires in 20 minutes and can be used once. Your private session lasts seven days. Do not forward it.\n\nThis is a requested service email. It does not subscribe you to EVE.\n\nWomen of Color — The Network'}),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error('Email provider did not accept the request.');const payload=await response.json();if(!payload.id)throw new Error('Email provider did not return a receipt.');
}:null;
const config={origin:env.APP_ORIGIN||'https://unconfigured.invalid',enabled:env.PUBLIC_WRITES_ENABLED==='true',rateSecret:env.RATE_LIMIT_SECRET};
const server=createServer(createApp({store,sendAccess,config}));server.requestTimeout=20000;server.headersTimeout=15000;
server.listen(Number(env.PORT)||10000,'0.0.0.0',()=>console.log('WOC Garden Party backend listening.'));
if(store){const timer=setInterval(()=>store.cleanup().catch(()=>console.error('WOC cleanup failed')),3600000);timer.unref();}
