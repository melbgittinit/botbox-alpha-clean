import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { verifyCoreAccessToken } from "../../../../lib/core-access";
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
  if(entitlement.status!=="ACTIVE"){
    return NextResponse.json({ok:false,error:"bot_not_active",status:entitlement.status},{status:409});
  }
  if(!CONTROLLED_BOT_IDS.has(entitlement.botId)){
    return NextResponse.json({ok:false,error:"bot_not_mission_enabled"},{status:409});
  }

  const prompt=cleanTestPrompt(body.prompt);
  if(!prompt){
    return NextResponse.json({ok:false,error:"mission_required"},{status:400});
  }

  const result=controlledResultFor(entitlement.botId,prompt);
  const firstUseAt=entitlement.firstUseAt || new Date();
  if(!entitlement.firstUseAt){
    await prisma.botEntitlement.update({where:{id:entitlement.id},data:{firstUseAt,lastUseAt:firstUseAt}});
  }else{
    await prisma.botEntitlement.update({where:{id:entitlement.id},data:{lastUseAt:new Date()}});
  }

  const existing=await prisma.revenueEvent.findFirst({
    where:{prospectId:entitlement.prospectId,type:"FIRST_MISSION",botId:entitlement.botId,metadata:{path:["entitlementId"],equals:entitlement.id}},
  }).catch(()=>null);

  if(!existing){
    await prisma.revenueEvent.create({
      data:{
        prospectId:entitlement.prospectId,
        type:"FIRST_MISSION",
        botId:entitlement.botId,
        source:"bot-core-first-mission",
        metadata:{entitlementId:entitlement.id,mode:"CONTROLLED_ALPHA",feedback:"PENDING"},
      },
    });
  }

  return NextResponse.json({
    ok:true,
    entitlementId:entitlement.id,
    botId:entitlement.botId,
    status:"ACTIVE",
    missionCompleted:true,
    result,
    feedback:"PENDING",
    notice:"First Mission is running on the controlled alpha runtime. Tell us whether this helped before the Factory recommends anything else."
  },{headers:{"Cache-Control":"no-store"}});
}
