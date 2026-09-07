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
      events:{where:{type:{in:["FIRST_MISSION","OPT_OUT","SALES_TOUCH"]}},orderBy:{occurredAt:"desc"}},
    },
  });

  const readiness=prospects.map(prospect=>{
    const latestByChannel=new Map<string,{status:string;scope:string|null;capturedAt:Date}>();
    for(const consent of prospect.consent){
      if(!latestByChannel.has(consent.channel)) latestByChannel.set(consent.channel,{status:consent.status,scope:consent.scope,capturedAt:consent.capturedAt});
    }

    const hasGlobalOptOut=prospect.events.some(event=>event.type==="OPT_OUT");
    const recentSalesTouch=prospect.events.find(event=>event.type==="SALES_TOUCH"&&event.occurredAt>=cutoff);

    const active=prospect.entitlements.filter(item=>item.status==="ACTIVE");
    const supportBlocked=active.some(item=>{
      const mission=prospect.events.find(event=>event.type==="FIRST_MISSION"&&event.botId===item.botId);
      const feedback=mission?feedbackFrom(mission.metadata):"UNKNOWN";
      return ["NEEDS_HELP","NOT_SURE","UNKNOWN"].includes(feedback);
    });

    const email=latestByChannel.get("EMAIL");
    const sms=latestByChannel.get("SMS");
    const voice=latestByChannel.get("VOICE");

    const emailOptIn=email?.status==="OPTED_IN";
    const smsOptIn=sms?.status==="OPTED_IN";
    const voiceOptIn=voice?.status==="OPTED_IN";

    const emailSuppressed=hasGlobalOptOut || email?.status==="OPTED_OUT" || !emailOptIn;
    const smsSuppressed=hasGlobalOptOut || sms?.status==="OPTED_OUT" || !smsOptIn;
    const voiceSuppressed=hasGlobalOptOut || voice?.status==="OPTED_OUT" || !voiceOptIn;

    const cooldownBlocked=Boolean(recentSalesTouch);
    const salesSuppressed=hasGlobalOptOut || supportBlocked || cooldownBlocked;

    const reasons:string[]=[];
    if(hasGlobalOptOut) reasons.push("GLOBAL_OPT_OUT");
    if(supportBlocked) reasons.push("CUSTOMER_SUCCESS_BLOCK");
    if(cooldownBlocked) reasons.push("RECENT_SALES_TOUCH_72H_COOLDOWN");
    if(emailSuppressed&&smsSuppressed&&voiceSuppressed) reasons.push("NO_PERMISSIONED_DIRECT_CHANNEL");

    const salesChannels={
      email:!salesSuppressed&&!emailSuppressed,
      sms:!salesSuppressed&&!smsSuppressed,
      voice:!salesSuppressed&&!voiceSuppressed,
    };

    const supportChannels={
      email:!hasGlobalOptOut&&!emailSuppressed,
      sms:!hasGlobalOptOut&&!smsSuppressed,
      voice:!hasGlobalOptOut&&!voiceSuppressed,
    };

    return {
      prospectId:prospect.id,
      stage:prospect.stage,
      hasContact:{email:Boolean(prospect.email),phone:Boolean(prospect.phone)},
      purposes:{
        SALES:{
          eligible:Boolean(salesChannels.email||salesChannels.sms||salesChannels.voice),
          channels:salesChannels,
          suppressed:salesSuppressed||(!salesChannels.email&&!salesChannels.sms&&!salesChannels.voice),
          reasons,
        },
        CUSTOMER_SUCCESS:{
          eligible:Boolean(supportChannels.email||supportChannels.sms||supportChannels.voice),
          channels:supportChannels,
          suppressed:hasGlobalOptOut||(!supportChannels.email&&!supportChannels.sms&&!supportChannels.voice),
          reasons:hasGlobalOptOut?["GLOBAL_OPT_OUT"]:(!supportChannels.email&&!supportChannels.sms&&!supportChannels.voice)?["NO_PERMISSIONED_DIRECT_CHANNEL"]:[],
        },
      },
      rawConsent:{
        email:email||null,
        sms:sms||null,
        voice:voice||null,
      },
      reviewRequired:true,
      executeAutomatically:false,
    };
  });

  return NextResponse.json({
    ok:true,
    mode:"REVIEW_ONLY",
    operatingRule:"ONE_CENTRAL_PERMISSION_AND_SUPPRESSION_DECISION_BEFORE_OUTREACH",
    cooldownHours:72,
    count:readiness.length,
    readiness,
  },{headers:{"Cache-Control":"no-store"}});
}
