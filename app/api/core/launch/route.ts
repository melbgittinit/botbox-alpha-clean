import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { verifyCoreAccessToken } from "../../../../lib/core-access";
import { canTransition } from "../../../../lib/core-state";

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
  if(entitlement.status!=="CERTIFIED" || !canTransition(entitlement.status,"ACTIVE")){
    return NextResponse.json({ok:false,error:"bot_not_certified",status:entitlement.status},{status:409});
  }

  const activatedAt=new Date();
  const updated=await prisma.botEntitlement.update({
    where:{id:entitlement.id},
    data:{status:"ACTIVE",activatedAt},
  });

  const eventId=`launch:${entitlement.id}`;
  const prior=await prisma.revenueEvent.findUnique({where:{externalEventId:eventId}});
  if(!prior){
    await prisma.revenueEvent.create({
      data:{
        externalEventId:eventId,
        prospectId:entitlement.prospectId,
        type:"BOT_LAUNCHED",
        botId:entitlement.botId,
        source:"bot-core-launch",
        metadata:{entitlementId:entitlement.id,activatedAt:activatedAt.toISOString()},
      },
    });
  }

  return NextResponse.json({
    ok:true,
    entitlementId:updated.id,
    botId:updated.botId,
    status:updated.status,
    activatedAt:updated.activatedAt,
    next:"FIRST_MISSION",
    message:"Your bot is active. Start its first mission."
  },{headers:{"Cache-Control":"no-store"}});
}
