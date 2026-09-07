import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { canTransition } from "../../../../lib/core-state";

function safeEqualHex(a:string,b:string){
  try{
    const ba=Buffer.from(a,"hex");
    const bb=Buffer.from(b,"hex");
    return ba.length===bb.length && timingSafeEqual(ba,bb);
  }catch{return false;}
}

export async function POST(request:Request){
  if(!process.env.DATABASE_URL || process.env.BOT_FACTORY_DB_IDENTITY!=="bot-factory-revenue"){
    return NextResponse.json({ok:false,error:"factory_database_not_ready"},{status:503});
  }
  const secret=process.env.BOT_FACTORY_COMMERCE_SECRET;
  if(!secret){
    return NextResponse.json({ok:false,error:"commerce_secret_not_configured"},{status:503});
  }

  const raw=await request.text();
  const supplied=(request.headers.get("x-bot-factory-signature")||"").trim();
  const expected=createHmac("sha256",secret).update(raw).digest("hex");
  if(!safeEqualHex(supplied,expected)){
    return NextResponse.json({ok:false,error:"invalid_signature"},{status:401});
  }

  let body:any;
  try{body=JSON.parse(raw);}catch{
    return NextResponse.json({ok:false,error:"invalid_json"},{status:400});
  }

  const entitlementId=String(body.entitlementId||"").trim();
  if(!entitlementId){
    return NextResponse.json({ok:false,error:"entitlement_required"},{status:400});
  }

  const entitlement=await prisma.botEntitlement.findUnique({where:{id:entitlementId}});
  if(!entitlement){
    return NextResponse.json({ok:false,error:"entitlement_not_found"},{status:404});
  }
  if(!canTransition(entitlement.status,"CONFIGURING")){
    return NextResponse.json({ok:false,error:"invalid_core_transition",status:entitlement.status},{status:409});
  }

  const updated=await prisma.botEntitlement.update({
    where:{id:entitlement.id},
    data:{status:"CONFIGURING"},
  });

  return NextResponse.json({
    ok:true,
    entitlementId:updated.id,
    botId:updated.botId,
    status:updated.status,
    core:{identity:"PENDING",skills:"PENDING",personalization:"PENDING",test:"PENDING",certification:"PENDING",launch:"LOCKED"},
    message:"Your bot is in the Core. Configuration can begin."
  },{status:200,headers:{"Cache-Control":"no-store"}});
}
