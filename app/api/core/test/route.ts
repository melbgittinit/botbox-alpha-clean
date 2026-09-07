import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { verifyCoreAccessToken } from "../../../../lib/core-access";
import { canTransition } from "../../../../lib/core-state";
import { CONTROLLED_BOT_IDS, cleanTestPrompt, controlledResultFor } from "../../../../lib/controlled-test";

export async function POST(request:Request){
  if(!process.env.DATABASE_URL || process.env.BOT_FACTORY_DB_IDENTITY!=="bot-factory-revenue"){
    return NextResponse.json({ok:false,error:"factory_database_not_ready"},{status:503});
  }

  let body:any;
  try{body=await request.json();}catch{
    return NextResponse.json({ok:false,error:"invalid_json"},{status:400});
  }

  const token=String(body.token||"");
  const payload=verifyCoreAccessToken(token);
  if(!payload){
    return NextResponse.json({ok:false,error:"invalid_or_expired_core_access"},{status:401});
  }

  const entitlement=await prisma.botEntitlement.findUnique({where:{id:payload.entitlementId}});
  if(!entitlement){
    return NextResponse.json({ok:false,error:"entitlement_not_found"},{status:404});
  }
  if(!CONTROLLED_BOT_IDS.has(entitlement.botId)){
    return NextResponse.json({ok:false,error:"bot_not_test_enabled"},{status:409});
  }
  if(!["CONFIGURING","TEST_REQUIRED"].includes(entitlement.status)){
    return NextResponse.json({ok:false,error:"core_test_not_available",status:entitlement.status},{status:409});
  }

  const prompt=cleanTestPrompt(body.prompt);
  const result=controlledResultFor(entitlement.botId,prompt);

  let nextStatus=entitlement.status;
  if(entitlement.status==="CONFIGURING" && canTransition(entitlement.status,"TEST_REQUIRED")){
    const updated=await prisma.botEntitlement.update({where:{id:entitlement.id},data:{status:"TEST_REQUIRED"}});
    nextStatus=updated.status;
  }

  await prisma.revenueEvent.create({
    data:{
      prospectId:entitlement.prospectId,
      type:"TRY_COMPLETED",
      botId:entitlement.botId,
      source:"bot-core-purchased-test",
      metadata:{entitlementId:entitlement.id,mode:"PURCHASED_CORE_TEST"}
    }
  });

  return NextResponse.json({
    ok:true,
    mode:"PURCHASED_CORE_TEST",
    entitlementId:entitlement.id,
    botId:entitlement.botId,
    status:nextStatus,
    result,
    certification:"PENDING_REVIEW",
    notice:"Purchased Core Test Track uses the same controlled alpha runtime as public TRY, but it is tied to this paid entitlement. Passing this test does not yet auto-certify the bot."
  },{headers:{"Cache-Control":"no-store"}});
}
