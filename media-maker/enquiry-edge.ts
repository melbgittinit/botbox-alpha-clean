const expectedHash="152dcfeb64e8a9d54eea42400b1941e293489745cbc2724d867c80fcf983ea2e";
const reply=(status,data)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const digest=async x=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(x))),b=>b.toString(16).padStart(2,'0')).join('');
Deno.serve(async req=>{
 if(req.method!=='POST')return reply(405,{error:'Method not allowed'});
 const token=req.headers.get('x-media-key')||'';if(token.length>200||await digest(token)!==expectedHash)return reply(401,{error:'Unauthorized'});
 try{
 const raw=await req.text();if(raw.length>12000)return reply(413,{error:'Request too large'});const p=JSON.parse(raw),f=p.fields;
 if(!/^[0-9a-f-]{36}$/.test(p.requestId)||!f||p.consent!==true||typeof p.email!=='string'||p.email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email))return reply(400,{error:'Valid contact and consent required'});
 const names=['Outlet','Package','Market','Audience','Segment','Format','Deadline','Budget','Story'];
 const fields={};for(const k of names){if(typeof f[k]!=='string'||f[k].length>(k==='Story'?3000:200))return reply(400,{error:'Invalid request fields'});fields[k]=f[k].trim()}
 if(['Outlet','Market','Audience','Story'].some(k=>!fields[k]))return reply(400,{error:'Complete required fields'});
 const payload={fields,email:p.email.trim().toLowerCase(),consent:true,test:p.test===true},hash=await digest(JSON.stringify(payload)),reference='MM-'+p.requestId.toUpperCase();
 const base=Deno.env.get('SUPABASE_URL')+'/rest/v1/media_maker_enquiries',key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 const headers={apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'};
 const saved=await fetch(base,{method:'POST',headers:{...headers,Prefer:'return=minimal'},body:JSON.stringify({request_id:p.requestId,reference,payload_hash:hash,payload,status:payload.test?'TEST':'New'})});
 if(saved.status===409){const existing=await fetch(base+'?request_id=eq.'+encodeURIComponent(p.requestId)+'&select=reference,payload_hash',{headers});if(!existing.ok)return reply(503,{error:'Unable to confirm saved request'});const rows=await existing.json();if(rows[0]?.payload_hash!==hash)return reply(409,{error:'Request changed; rebuild before submitting'});return reply(200,{reference:rows[0].reference,status:'Saved',duplicate:true})}
 if(!saved.ok)return reply(503,{error:'Request could not be saved; retry with the same request'});
 return reply(201,{reference,status:'Saved'});
 }catch{return reply(400,{error:'Invalid or unavailable request'})}
});