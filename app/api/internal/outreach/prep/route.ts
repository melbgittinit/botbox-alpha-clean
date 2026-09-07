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

function preferredChannel(email:boolean,sms:boolean,voice:boolean){
  if(voice) return "VOICE";
  if(sms) return "SMS";
  if(email) return "EMAIL";
  return null;
}

function prepFor(channel:string,objective:string,activeBots:string[]){
  const botContext=activeBots.length?` Current active bot${activeBots.length>1?"s":""}: ${activeBots.join(", ")}.`:"";
  if(channel==="VOICE") return {
    channel,
    callObjective:objective,
    opening:"Confirm it is a good time, identify why the call is relevant, and keep the first minute focused on the customer’s current goal.",
    discoveryQuestions:["What are you trying to get done next?","What is working well right now?","Where are you still losing time, sales, or follow-through?"],
    guardrails:["Do not imply guaranteed earnings.","Do not pressure a support-blocked customer.","Stop immediately if the customer asks not to be called.","Do not record unless recording permission is separately confirmed."],
    context:botContext.trim(),
  };
  if(channel==="SMS") return {
    channel,
    messageDraft:`Hi — this is The Bot Factory team. We’re following up because there may be a useful next step connected to your Bot Factory activity.${botContext} If you’d like, we can help you figure out the best next move. Reply YES if you want help, or STOP to opt out.`,
    objective,
    guardrails:["Keep it concise.","Honor STOP immediately.","No earnings claims.","No repeated follow-up inside the cooldown window."],
  };
  return {
    channel:"EMAIL",
    subject:"A practical next step from The Bot Factory",
    messageDraft:`We’re following up because there may be a practical next step based on your Bot Factory activity.${botContext}\n\nOur goal is not to push more products before they are useful. If you want, we can help identify the next best move—whether that is getting more from what you already have, choosing another bot, or reviewing Earn Mode if that is what you asked about.\n\nIf you would rather not receive these sales follow-ups, use your opt-out preference and we’ll honor it.`,
    objective,
    guardrails:["Keep the recommendation tied to known activity.","Do not manufacture urgency.","Do not promise income or outcomes.","Respect opt-out and cooldown rules."],
  };
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
    take:250,
    include:{
      consent:{orderBy:{capturedAt:"desc"}},
      entitlements:true,
      events:{where:{type:{in:["FIRST_MISSION","OPT_OUT","SALES_TOUCH","EARN_INTEREST"]}},orderBy:{occurredAt:"desc"}},
    },
  });

  const prepared=prospects.flatMap(prospect=>{
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
    if(globalOptOut||recentSalesTouch||supportBlocked) return [];

    const email=latestByChannel.get("EMAIL")==="OPTED_IN"&&Boolean(prospect.email);
    const sms=latestByChannel.get("SMS")==="OPTED_IN"&&Boolean(prospect.phone);
    const voice=latestByChannel.get("VOICE")==="OPTED_IN"&&Boolean(prospect.phone);
    const channel=preferredChannel(email,sms,voice);
    if(!channel) return [];

    const earnInterest=prospect.events.some(event=>event.type==="EARN_INTEREST");
    const activeBotCount=active.length;
    let objective="QUALIFY_NEED";
    let assignedRole="OUTBOUND_SPECIALIST";
    if(earnInterest){objective="QUALIFY_FOR_EARN";assignedRole="EARN_COACH";}
    else if(prospect.stage==="REPEAT_CUSTOMER"||activeBotCount>1){objective="ASSESS_CREW_OR_NEXT_BOT";assignedRole="SALES_SPECIALIST";}
    else if(activeBotCount===1){objective="FIND_NEXT_BEST_BOT";assignedRole="SALES_SPECIALIST";}
    else if(["QUALIFIED","PROPOSAL"].includes(prospect.stage)){objective="ADVANCE_TO_PURCHASE";assignedRole="SALES_SPECIALIST";}

    return [{
      prospectId:prospect.id,
      stage:prospect.stage,
      assignedRole,
      objective,
      chosenChannel:channel,
      activeBots:active.map(item=>item.botId),
      preparation:prepFor(channel,objective,active.map(item=>item.botId)),
      preSendChecks:["RECHECK_LATEST_CONSENT","RECHECK_OPT_OUT_SUPPRESSION","RECHECK_72H_COOLDOWN","RECHECK_CUSTOMER_SUCCESS_BLOCK"],
      approvalStatus:"DRAFT_ONLY",
      sendAutomatically:false,
      reviewRequired:true,
    }];
  });

  return NextResponse.json({
    ok:true,
    mode:"DRAFT_ONLY",
    operatingRule:"PREPARE_THE_CONTACT_BUT_DO_NOT_SEND_WITHOUT_FRESH_READINESS_AND_REVIEW",
    count:prepared.length,
    prepared,
  },{headers:{"Cache-Control":"no-store"}});
}
