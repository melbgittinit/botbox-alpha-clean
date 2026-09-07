import { createHmac, timingSafeEqual } from "crypto";

type CoreTokenPayload = { entitlementId:string; exp:number };

function secret(){
  const value=process.env.BOT_FACTORY_COMMERCE_SECRET;
  if(!value) throw new Error("commerce_secret_not_configured");
  return value;
}

function sign(encoded:string){
  return createHmac("sha256",secret()).update(encoded).digest("base64url");
}

export function issueCoreAccessToken(entitlementId:string,ttlSeconds=86400){
  const payload:CoreTokenPayload={entitlementId,exp:Math.floor(Date.now()/1000)+ttlSeconds};
  const encoded=Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifyCoreAccessToken(token:string):CoreTokenPayload|null{
  try{
    const [encoded,sig]=token.split(".");
    if(!encoded||!sig) return null;
    const expected=sign(encoded);
    const a=Buffer.from(sig); const b=Buffer.from(expected);
    if(a.length!==b.length || !timingSafeEqual(a,b)) return null;
    const payload=JSON.parse(Buffer.from(encoded,"base64url").toString("utf8")) as CoreTokenPayload;
    if(!payload.entitlementId || !payload.exp || payload.exp<Math.floor(Date.now()/1000)) return null;
    return payload;
  }catch{return null;}
}
