import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {token,hash,normalizeSave,normalizePlan} from './security.mjs';
import {createApp} from './app.mjs';
const plan={partyTitle:'Sister brunch',description:'A lovely afternoon',guestCount:6,durationMinutes:90,estimatedBudgetLow:50,estimatedBudgetHigh:100,menu:['Tea'],shoppingList:['Tea'],contributionSuggestions:[],checklist:['Choose a date'],conversationQuestions:['What brought you joy?'],scripture:{reference:'',text:''}};
const input={firstName:'Angela',email:'ANGELA@example.test',zipCode:'60615',passwordlessPermission:true,plan};
test('input normalization does not accept client ownership or marketing permission',()=>{const value=normalizeSave({...input,hostId:'other',eveOptIn:true});assert.equal(value.email,'angela@example.test');assert.equal(value.eveOptIn,undefined);assert.equal(value.hostId,undefined);assert.throws(()=>normalizeSave({...input,passwordlessPermission:false}));assert.throws(()=>normalizePlan({...plan,estimatedBudgetHigh:10}));assert.throws(()=>normalizePlan({...plan,guestCount:Infinity}));assert.throws(()=>normalizePlan({...plan,timeZone:'not-a-zone'}));});
test('private tokens are unguessable and stored by hash',()=>{const a=token(),b=token();assert.equal(a.length,43);assert.notEqual(a,b);assert.equal(hash(a).length,64);assert.notEqual(hash(a),a);});
test('HTTP access, ownership, replay, delivery failure and launch gate',async()=>{
 const pending=new Map(),sessions=new Map(),parties=new Map();let mail,failMail=false;
 const owner='owner-1',id='aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
 const store={health:async()=>{},rate:async()=>true,pending:async(key,secretHash,value)=>pending.set(key,{secretHash,value}),accepted:async key=>pending.get(key).accepted=true,discard:async key=>pending.delete(key),redeem:async(secretHash,sessionHash)=>{const row=[...pending.values()].find(x=>x.secretHash===secretHash&&x.accepted&&!x.used);if(!row)return null;row.used=true;sessions.set(sessionHash,{member_id:owner,party_id:id});parties.set(id,{id,host_id:owner,plan:row.value.plan,version:1});return {partyId:id};},session:async key=>sessions.get(key),party:async(key,member)=>{const p=parties.get(key);return p?.host_id===member?p:null;},update:async(key,member,version,newPlan)=>{const p=parties.get(key);if(p.host_id!==member||p.version!==version)return null;p.plan=newPlan;p.version++;return {id:key,version:p.version};},remove:async key=>parties.delete(key),logout:async key=>sessions.delete(key)};
 const config={origin:'https://garden.example.test',enabled:true,rateSecret:'test-secret-long-enough-for-thirty-two-characters'};
 const server=createServer(createApp({store,config,sendAccess:async value=>{if(failMail)throw new Error('provider failed');mail=value;}}));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 const call=(path,{method='GET',data,cookie,origin=config.origin}={})=>fetch(base+path,{method,headers:{Origin:origin,...(data?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},body:data?JSON.stringify(data):undefined});
 try{
  let r=await call('/api/parties/save',{method:'POST',data:input,origin:'https://evil.example'});assert.equal(r.status,403);assert.equal(pending.size,0);
  r=await call('/api/parties/save',{method:'POST',data:input});assert.equal(r.status,202);const answer=await r.json();assert.equal(answer.status,'check_email');assert(!JSON.stringify(answer).includes('token'));assert(mail.url.includes('/garden-party/access#'));assert(![...pending.values()][0].value.eveOptIn);
  r=await call('/api/parties/'+id);assert.equal(r.status,401);
  const magic=mail.url.split('#')[1];r=await call('/api/access/confirm',{method:'POST',data:{token:magic}});assert.equal(r.status,200);const setCookie=r.headers.get('set-cookie');assert(setCookie.includes('HttpOnly'));assert(setCookie.includes('Secure'));assert(setCookie.includes('SameSite=Lax'));const cookie=setCookie.split(';')[0];
  r=await call('/api/access/confirm',{method:'POST',data:{token:magic}});assert.equal(r.status,410);
  r=await call('/api/parties/'+id,{cookie});assert.equal(r.status,200);
  parties.set('bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',{id:'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',host_id:'another-host',plan,version:1});
  r=await call('/api/parties/bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',{cookie});assert.equal(r.status,404);
  r=await call('/api/parties/'+id,{method:'PATCH',cookie,data:{version:1,plan:{...plan,partyTitle:'Edited circle'}}});assert.equal(r.status,200);
  r=await call('/api/parties/'+id,{method:'PATCH',cookie,data:{version:1,plan}});assert.equal(r.status,409);
  failMail=true;const count=pending.size;r=await call('/api/parties/save',{method:'POST',data:input});assert.equal(r.status,502);assert.equal(pending.size,count);
  config.enabled=false;r=await call('/api/parties/save',{method:'POST',data:input});assert.equal(r.status,503);r=await call('/readyz');assert.equal(r.status,503);
  config.enabled=true;r=await call('/api/parties/'+id,{method:'DELETE',cookie,data:{}});assert.equal(r.status,200);r=await call('/api/parties/'+id,{cookie});assert.equal(r.status,404);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
