import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

function authorized(request:Request){
  const secret=process.env.BOT_FACTORY_INTERNAL_SECRET;
  return Boolean(secret) && request.headers.get("x-bot-factory-internal")===secret;
}

function feedbackFrom(metadata:unknown){
  if(!metadata || typeof metadata!=="object" || Array.isArray(metadata)) return "PENDING";
  const value=(metadata as Record<string,unknown>).feedback;
  return typeof value==="string"?value:"PENDING";
}

export async function GET(request:Request){
  if(!authorized(request)){
    return NextResponse.json({ok:false,error:"unauthorized"},{status:401});
  }
  if(!process.env.DATABASE_URL || process.env.BOT_FACTORY_DB_IDENTITY!=="bot-factory-revenue"){
    return NextResponse.json({ok:false,error:"factory_database_not_ready"},{status:503});
  }

  const active=await prisma.botEntitlement.findMany({
    where:{status:"ACTIVE"},
    orderBy:{updatedAt:"asc"},
    take:200,
    include:{
      prospect:{
        include:{
          consent:{orderBy:{capturedAt:"desc"}},
          events:{where:{type:"FIRST_MISSION"},orderBy:{occurredAt:"desc"}},
        },
      },
    },
  });

  const queue=active.map(entitlement=>{
    const mission=entitlement.prospect.events.find(event=>event.botId===entitlement.botId);
    const feedback=mission?feedbackFrom(mission.metadata):"NO_MISSION";
    const priority=feedback==="NEEDS_HELP"?"HIGH":feedback==="NO_MISSION"?"HIGH":feedback==="NOT_SURE"?"NORMAL":"HEALTHY";
    const reason=feedback==="NEEDS_HELP"?"CUSTOMER_REQUESTED_HELP":feedback==="NO_MISSION"?"LAUNCHED_BUT_NO_FIRST_MISSION":feedback==="NOT_SURE"?"ACTIVATION_UNCERTAIN":"ACTIVATION_HEALTHY";

    const latestByChannel=new Map<string,{status:string;scope:string|null;capturedAt:Date}>();
    for(const consent of entitlement.prospect.consent){
      if(!latestByChannel.has(consent.channel)) latestByChannel.set(consent.channel,{status:consent.status,scope:consent.scope,capturedAt:consent.capturedAt});
    }

    return {
      entitlementId:entitlement.id,
      botId:entitlement.botId,
      prospectId:entitlement.prospectId,
      customer:{email:entitlement.prospect.email,phone:entitlement.prospect.phone},
      activatedAt:entitlement.activatedAt,
      firstUseAt:entitlement.firstUseAt,
      lastUseAt:entitlement.lastUseAt,
      feedback,
      priority,
      reason,
      permissions:Object.fromEntries(latestByChannel),
      recommendedAction:priority==="HIGH"?"CUSTOMER_SUCCESS_RESCUE":priority==="NORMAL"?"CHECK_IN_BEFORE_UPSELL":"NO_IMMEDIATE_ACTION",
      upsellAllowed:priority==="HEALTHY",
    };
  }).filter(item=>item.priority!=="HEALTHY");

  return NextResponse.json({ok:true,count:queue.length,queue},{headers:{"Cache-Control":"no-store"}});
}
