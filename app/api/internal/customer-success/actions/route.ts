import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

function authorized(request:Request){
  const secret=process.env.BOT_FACTORY_INTERNAL_SECRET;
  return Boolean(secret) && request.headers.get("x-bot-factory-internal")===secret;
}

function feedbackFrom(metadata:unknown){
  if(!metadata || typeof metadata!=="object" || Array.isArray(metadata)) return "UNKNOWN";
  const value=(metadata as Record<string,unknown>).feedback;
  return typeof value==="string"?value:"UNKNOWN";
}

function actionFor(feedback:string,hasMission:boolean){
  if(!hasMission) return {
    action:"FINISH_FIRST_MISSION",
    owner:"CUSTOMER_SUCCESS",
    messageGoal:"Help the customer complete one useful first mission before discussing another product.",
    servicePath:null,
  };
  if(feedback==="NEEDS_HELP") return {
    action:"SERVICE_RESCUE",
    owner:"CUSTOMER_SUCCESS",
    messageGoal:"Acknowledge the problem, diagnose what failed, then choose Tune It, Train It, or Retest It.",
    servicePath:"TUNE_TRAIN_RETEST",
  };
  if(feedback==="NOT_SURE" || feedback==="UNKNOWN") return {
    action:"ACTIVATION_CHECK_IN",
    owner:"CUSTOMER_SUCCESS",
    messageGoal:"Clarify whether the bot produced a useful result and offer guided retesting if needed.",
    servicePath:"GUIDED_RETEST",
  };
  return {
    action:"NO_SUPPORT_ACTION",
    owner:"CUSTOMER_SUCCESS",
    messageGoal:"Activation appears healthy. Release the customer to Sales Director review rather than sending support outreach.",
    servicePath:null,
  };
}

export async function GET(request:Request){
  if(!authorized(request)) return NextResponse.json({ok:false,error:"unauthorized"},{status:401});
  if(!process.env.DATABASE_URL || process.env.BOT_FACTORY_DB_IDENTITY!=="bot-factory-revenue"){
    return NextResponse.json({ok:false,error:"factory_database_not_ready"},{status:503});
  }

  const entitlements=await prisma.botEntitlement.findMany({
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

  const actions=entitlements.flatMap(entitlement=>{
    const mission=entitlement.prospect.events.find(event=>event.botId===entitlement.botId);
    const feedback=mission?feedbackFrom(mission.metadata):"NO_MISSION";
    const plan=actionFor(feedback,Boolean(mission));
    if(plan.action==="NO_SUPPORT_ACTION") return [];

    const latestByChannel=new Map<string,string>();
    for(const consent of entitlement.prospect.consent){
      if(!latestByChannel.has(consent.channel)) latestByChannel.set(consent.channel,consent.status);
    }

    const channels={
      email:latestByChannel.get("EMAIL")==="OPTED_IN",
      sms:latestByChannel.get("SMS")==="OPTED_IN",
      voice:latestByChannel.get("VOICE")==="OPTED_IN",
    };

    return [{
      entitlementId:entitlement.id,
      prospectId:entitlement.prospectId,
      botId:entitlement.botId,
      activation:{
        activatedAt:entitlement.activatedAt,
        firstUseAt:entitlement.firstUseAt,
        lastUseAt:entitlement.lastUseAt,
        feedback,
      },
      action:plan.action,
      owner:plan.owner,
      messageGoal:plan.messageGoal,
      servicePath:plan.servicePath,
      permittedChannels:channels,
      contactAllowed:Boolean(channels.email||channels.sms||channels.voice),
      reviewRequired:true,
      executeAutomatically:false,
      upsellBlocked:true,
    }];
  });

  return NextResponse.json({
    ok:true,
    mode:"REVIEW_ONLY",
    operatingRule:"HELP_FIRST_PROVE_SUCCESS_THEN_EXPAND",
    count:actions.length,
    actions,
  },{headers:{"Cache-Control":"no-store"}});
}
