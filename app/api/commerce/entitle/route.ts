import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

const ALLOWED_BOTS = new Set([
  "mebot","fam","coffee","wbells","mtc","pop","zipper","impostr","tvme",
  "slide","tracking","elevate","beauty","register","creator","fundus","freemoney","ufo",
]);

function safeEqualHex(a:string,b:string){
  try{
    const ba=Buffer.from(a,"hex"); const bb=Buffer.from(b,"hex");
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
  try{ body=JSON.parse(raw); }catch{
    return NextResponse.json({ok:false,error:"invalid_json"},{status:400});
  }

  const orderRef=String(body.orderRef||"").trim().slice(0,120);
  const email=String(body.email||"").trim().toLowerCase().slice(0,180);
  const botId=String(body.botId||"").trim().toLowerCase().slice(0,60);
  const paymentStatus=String(body.paymentStatus||"").trim().toUpperCase();
  const provider=String(body.provider||"UNKNOWN").trim().slice(0,40);
  if(!orderRef || !email || !ALLOWED_BOTS.has(botId)){
    return NextResponse.json({ok:false,error:"invalid_order_payload"},{status:400});
  }
  if(paymentStatus!=="PAID"){
    return NextResponse.json({ok:false,error:"payment_not_verified"},{status:409});
  }

  const existingProspect=await prisma.prospect.findFirst({where:{email}});
  const prospect=existingProspect
    ? await prisma.prospect.update({where:{id:existingProspect.id},data:{stage:"CUSTOMER",preferredBot:botId,lastTouchAt:new Date()}})
    : await prisma.prospect.create({data:{email,stage:"CUSTOMER",preferredBot:botId,source:`COMMERCE_${provider}`,lastTouchAt:new Date()}});

  const existingEntitlement=await prisma.botEntitlement.findFirst({where:{prospectId:prospect.id,botId,orderRef}});
  const entitlement=existingEntitlement
    ? await prisma.botEntitlement.update({where:{id:existingEntitlement.id},data:{status:"CORE_PENDING"}})
    : await prisma.botEntitlement.create({data:{prospectId:prospect.id,botId,orderRef,status:"CORE_PENDING"}});

  const purchaseEventId=`purchase:${provider}:${orderRef}:${botId}`;
  const priorEvent=await prisma.revenueEvent.findUnique({where:{externalEventId:purchaseEventId}});
  if(!priorEvent){
    await prisma.revenueEvent.create({data:{externalEventId:purchaseEventId,prospectId:prospect.id,type:"PURCHASE",botId,source:`commerce:${provider}`,metadata:{orderRef,paymentStatus}}});
  }

  return NextResponse.json({
    ok:true,
    entitlementId:entitlement.id,
    botId,
    status:"CORE_PENDING",
    next:"BOT_CORE_LAUNCH",
    message:"Payment verified. Your bot is heading to the Core."
  },{status:201,headers:{"Cache-Control":"no-store"}});
}
