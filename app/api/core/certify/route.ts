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
  const configurationComplete=body.configurationComplete===true;
  const testAccepted=body.testAccepted===true;
  const safetyClear=body.safetyClear===true;
  const reviewer=String(body.reviewer||"controlled-alpha-review").trim().slice(0,80);

  if(!entitlementId){
    return NextResponse.json({ok:false,error:"entitlement_required"},{status:400});
  }
  if(!configurationComplete || !testAccepted || !safetyClear){
    return NextResponse.json({ok:false,error:"certification_requirements_incomplete"},{status:409});
  }

  const entitlement=await prisma.botEntitlement.findUnique({where:{id:entitlementId}});
  if(!entitlement){
    return NextResponse.json({ok:false,error:"entitlement_not_found"},{status:404});
  }
  if(entitlement.status!=="TEST_REQUIRED" || !canTransition(entitlement.status,"CERTIFIED")){
    return NextResponse.json({ok:false,error:"not_ready_for_certification",status:entitlement.status},{status:409});
  }

  const recentTests=await prisma.revenueEvent.findMany({
    where:{
      prospectId:entitlement.prospectId,
      botId:entitlement.botId,
      type:"TRY_COMPLETED",
      source:"bot-core-purchased-test",
    },
    orderBy:{occurredAt:"desc"},
    take:20,
  });
  const qualifyingTest=recentTests.find((event:any)=>{
    const metadata=event.metadata as Record<string,unknown>|null;
    return metadata?.entitlementId===entitlement.id && metadata?.mode==="PURCHASED_CORE_TEST";
  });
  if(!qualifyingTest){
    return NextResponse.json({ok:false,error:"purchased_core_test_required"},{status:409});
  }

  const updated=await prisma.botEntitlement.update({
    where:{id:entitlement.id},
    data:{status:"CERTIFIED"},
  });

  await prisma.revenueEvent.create({
    data:{
      prospectId:entitlement.prospectId,
      type:"SALES_TOUCH",
      botId:entitlement.botId,
      agentRole:"CUSTOMER_SUCCESS",
      source:"bot-core-certification",
      metadata:{
        entitlementId:entitlement.id,
        action:"CERTIFIED",
        reviewer,
        qualifyingTestEventId:qualifyingTest.id,
        configurationComplete,
        testAccepted,
        safetyClear,
      },
    },
  });

  return NextResponse.json({
    ok:true,
    entitlementId:updated.id,
    botId:updated.botId,
    status:updated.status,
    launch:"UNLOCKED",
    next:"LAUNCH_BOT",
    message:"Core requirements satisfied. This bot is certified and ready for launch."
  },{headers:{"Cache-Control":"no-store"}});
}
