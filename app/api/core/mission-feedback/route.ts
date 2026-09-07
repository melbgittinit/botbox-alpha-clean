import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { verifyCoreAccessToken } from "../../../../lib/core-access";

const ALLOWED = new Set(["HELPED","NEEDS_HELP","NOT_SURE"]);

export async function POST(request:Request){
  if(!process.env.DATABASE_URL || process.env.BOT_FACTORY_DB_IDENTITY!=="bot-factory-revenue"){
    return NextResponse.json({ok:false,error:"factory_database_not_ready"},{status:503});
  }

  let body:any;
  try{body=await request.json();}catch{
    return NextResponse.json({ok:false,error:"invalid_json"},{status:400});
  }

  const token=String(body.token||"");
  const feedback=String(body.feedback||"").trim().toUpperCase();
  const payload=verifyCoreAccessToken(token);
  if(!payload){
    return NextResponse.json({ok:false,error:"invalid_or_expired_core_access"},{status:401});
  }
  if(!ALLOWED.has(feedback)){
    return NextResponse.json({ok:false,error:"invalid_feedback"},{status:400});
  }

  const entitlement=await prisma.botEntitlement.findUnique({where:{id:payload.entitlementId}});
  if(!entitlement || entitlement.status!=="ACTIVE"){
    return NextResponse.json({ok:false,error:"active_entitlement_required"},{status:409});
  }

  const firstMission=await prisma.revenueEvent.findFirst({
    where:{prospectId:entitlement.prospectId,type:"FIRST_MISSION",botId:entitlement.botId},
    orderBy:{occurredAt:"desc"},
  });
  if(!firstMission){
    return NextResponse.json({ok:false,error:"first_mission_required"},{status:409});
  }

  const previous=(firstMission.metadata && typeof firstMission.metadata==="object" && !Array.isArray(firstMission.metadata))
    ? firstMission.metadata as Record<string,unknown>
    : {};

  await prisma.revenueEvent.update({
    where:{id:firstMission.id},
    data:{metadata:{...previous,feedback,feedbackAt:new Date().toISOString()}},
  });

  if(feedback==="NEEDS_HELP"){
    await prisma.prospect.update({
      where:{id:entitlement.prospectId},
      data:{nextActionAt:new Date(),lastTouchAt:new Date()},
    });
  }

  return NextResponse.json({
    ok:true,
    feedback,
    customerSuccessPriority:feedback==="NEEDS_HELP"?"HIGH":feedback==="NOT_SURE"?"NORMAL":"HEALTHY",
    salesRecommendation:feedback==="HELPED"?"WAIT_FOR_USAGE_SIGNAL":"DO_NOT_UPSELL",
    message:feedback==="HELPED"
      ? "First mission confirmed useful. Keep using the bot before the Factory recommends anything else."
      : feedback==="NEEDS_HELP"
        ? "Support should come before any additional sales recommendation."
        : "The Factory will treat this activation as uncertain and avoid pushing another product yet."
  },{headers:{"Cache-Control":"no-store"}});
}
