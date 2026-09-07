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

function bestChannel(channels:{email:boolean;sms:boolean;voice:boolean}){
  if(channels.voice) return "VOICE";
  if(channels.sms) return "SMS";
  if(channels.email) return "EMAIL";
  return null;
}

export async function GET(request:Request){
  if(!authorized(request)) return NextResponse.json({ok:false,error:"unauthorized"},{status:401});
  if(!process.env.DATABASE_URL || process.env.BOT_FACTORY_DB_IDENTITY!=="bot-factory-revenue"){
    return NextResponse.json({ok:false,error:"factory_database_not_ready"},{status:503});
  }

  const cutoff=new Date(Date.now()-72*60*60*1000);
  const prospects=await prisma.prospect.findMany({
    where:{stage:{in:["ENGAGED","QUALIFIED","PROPOSAL","CUSTOMER","REPEAT_CUSTOMER","EARN_CANDIDATE","EARN_ACTIVE"]}},
    orderBy:{lastTouchAt:"asc"},
    take:500,
    include:{
      consent:{orderBy:{capturedAt:"desc"}},
      entitlements:true,
      events:{where:{type:{in:["FIRST_MISSION","OPT_OUT","SALES_TOUCH","EARN_INTEREST"]}},orderBy:{occurredAt:"desc"}},
    },
  });

  const queue=prospects.flatMap(prospect=>{
    const latestByChannel=new Map<string,string>();
    for(const consent of prospect.consent){
      if(!latestByChannel.has(consent.channel)) latestByChannel.set(consent.channel,consent.status);
    }

    const globalOptOut=prospect.events.some(event=>event.type==="OPT_OUT");
    const recentSalesTouch=prospect.events.some(event=>event.type==="SALES_TOUCH"&&event.occurredAt>=cutoff);
    const active=prospect.entitlements.filter(item=>item.status==="ACTIVE");
    const supportBlocked=active.some(item=>{
      const mission=prospect.events.find(event=>event.type==="FIRST_MISSION"&&event.botId===item.botId);
      const feedback=mission?feedbackFrom(mission.metadata):"UNKNOWN";
      return ["NEEDS_HELP","NOT_SURE","UNKNOWN"].includes(feedback);
    });
    if(globalOptOut || recentSalesTouch || supportBlocked) return [];

    const channels={
      email:latestByChannel.get("EMAIL")==="OPTED_IN" && Boolean(prospect.email),
      sms:latestByChannel.get("SMS")==="OPTED_IN" && Boolean(prospect.phone),
      voice:latestByChannel.get("VOICE")==="OPTED_IN" && Boolean(prospect.phone),
    };
    const channel=bestChannel(channels);
    if(!channel) return [];

    const earnInterest=prospect.events.some(event=>event.type==="EARN_INTEREST");
    const activeBotCount=active.length;
    let assignedRole="OUTBOUND_SPECIALIST";
    let objective="QUALIFY_NEED";
    let reason="ENGAGED_PROSPECT_WITH_PERMISSION";

    if(earnInterest){
      assignedRole="EARN_COACH";
      objective="QUALIFY_FOR_EARN";
      reason="EARN_INTEREST_AND_PERMISSION";
    }else if(prospect.stage==="REPEAT_CUSTOMER" || activeBotCount>1){
      assignedRole="SALES_SPECIALIST";
      objective="ASSESS_CREW_OR_NEXT_BOT";
      reason="HEALTHY_REPEAT_CUSTOMER";
    }else if(activeBotCount===1){
      assignedRole="SALES_SPECIALIST";
      objective="FIND_NEXT_BEST_BOT";
      reason="HEALTHY_ACTIVE_CUSTOMER";
    }else if(["QUALIFIED","PROPOSAL"].includes(prospect.stage)){
      assignedRole="SALES_SPECIALIST";
      objective="ADVANCE_TO_PURCHASE";
      reason="QUALIFIED_PRE_PURCHASE_OPPORTUNITY";
    }

    const priority=earnInterest || prospect.stage==="PROPOSAL" || prospect.stage==="REPEAT_CUSTOMER"?"HIGH":"NORMAL";

    return [{
      prospectId:prospect.id,
      stage:prospect.stage,
      assignedRole,
      objective,
      reason,
      priority,
      preferredChannel:channel,
      permittedChannels:channels,
      activeBots:active.map(item=>item.botId),
      preSendChecks:[
        "RECHECK_LATEST_CONSENT",
        "RECHECK_OPT_OUT_SUPPRESSION",
        "RECHECK_72H_COOLDOWN",
        "RECHECK_CUSTOMER_SUCCESS_BLOCK",
      ],
      suggestedNextAction:channel==="VOICE"?"PREPARE_REVIEWED_VOICE_CALL":channel==="SMS"?"PREPARE_REVIEWED_SMS":"PREPARE_REVIEWED_EMAIL",
      reviewRequired:true,
      executeAutomatically:false,
    }];
  });

  return NextResponse.json({
    ok:true,
    mode:"REVIEW_ONLY",
    operatingRule:"OUTBOUND_ONLY_AFTER_CENTRAL_READINESS_AND_PRE_SEND_RECHECK",
    cooldownHours:72,
    count:queue.length,
    queue,
  },{headers:{"Cache-Control":"no-store"}});
}
