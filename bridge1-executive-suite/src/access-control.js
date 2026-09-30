import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
const buckets = new Map();
export function hashInviteCode(code){return createHash("sha256").update(String(code).trim()).digest("hex");}
export function verifyInviteCode(code,configuredHashes=process.env.INVITE_CODES_SHA256||""){
  if(!code||!configuredHashes)return false;const candidate=Buffer.from(hashInviteCode(code));
  return configuredHashes.split(",").map(v=>v.trim()).filter(Boolean).some(hash=>{const expected=Buffer.from(hash);return expected.length===candidate.length&&timingSafeEqual(expected,candidate);});
}
export function issueInviteToken(secret,ttlSeconds=14400){const payload=Buffer.from(JSON.stringify({exp:Math.floor(Date.now()/1000)+ttlSeconds,nonce:randomBytes(12).toString("hex")})).toString("base64url");const signature=createHmac("sha256",secret).update(payload).digest("base64url");return `${payload}.${signature}`;}
export function verifyInviteToken(token,secret){if(!token||!secret||!token.includes("."))return false;const[payload,signature]=token.split(".");const expected=createHmac("sha256",secret).update(payload).digest("base64url");const a=Buffer.from(signature),b=Buffer.from(expected);if(a.length!==b.length||!timingSafeEqual(a,b))return false;try{return JSON.parse(Buffer.from(payload,"base64url").toString()).exp>Date.now()/1000;}catch{return false;}}
export function parseCookie(header="",name="bridge1_invite"){for(const part of header.split(";")){const[key,...value]=part.trim().split("=");if(key===name)return value.join("=");}return null;}
export function rateLimit(key,{limit=10,windowMs=900000}={}){const now=Date.now(),bucket=buckets.get(key);if(!bucket||bucket.resetAt<=now){buckets.set(key,{count:1,resetAt:now+windowMs});return{allowed:true,remaining:limit-1};}bucket.count+=1;return{allowed:bucket.count<=limit,remaining:Math.max(0,limit-bucket.count),retryAfter:Math.ceil((bucket.resetAt-now)/1000)};}
