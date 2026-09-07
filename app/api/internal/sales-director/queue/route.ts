import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

function authorized(request:Request){
  const secret=process.env.BOT_FACTORY_INTERNAL_SECRET;
  return Boolean(secret) && request.headers.get("x-bot-factory-internal")===secret;
}

function latestFeedback(events:{metadata:unknown;botId:string|null}[],botId:string){
  const event=events.find(item=>item.botId===botId);
  if(!event?.metadata || typeof event.metadata!=="object" || Array.isArray(event.metadata)) return "UNKNOWN";
  const value=(event.metadata as Record<string,unknown>).feedback;
  return typeof value==="string"?value:"UNKNOWN";
}

export async function GET(request:Request){
  if(!authorized(request)) return NextResponse.json({ok:false,error:"unauthorized"},{status:401});
  if(!process.env.DATABASE_URL || process.env.BOT_FACTORY_DB_IDENTITY!=="bot-factory-revenue"){
    return NextResponse.json({ok:false,error:"factory_database_not_ready"},{status:503});
  }

  const customers=await prisma.prospect.findMany({
    where:{stage:{in:["CUSTOMER","REPEAT_CUSTOMER","EARN_CANDIDATE"]}},
    orderBy:{lastTouchAt:"asc"},
    take:250,
    include:{
      entitlements:true,
      consent:{orderBy:{capturedAt:"desc"}},
      events:{where:{type:{in:["FIRST_MISSION","SECOND_BOT","EARN_INTEREST"]}},orderBy:{occurredAt:"desc"}},
    },
  });

  const queue=customers.flatMap(customer=>{
    const active=customer.entitlements.filter(item=>item.status==="ACTIVE");
    if(!active.length) return [];

    const unhealthy=active.some(item=>["NEEDS_HELP","NOT_SURE","UNKNOWN"].includes(latestFeedback(customer.events,item.botId)));
    if(unhealthy) return [];

    const latestByChannel=new Map<string,string>();
    for(const item of customer.consent){ if(!latestByChannel.has(item.channel)) latestByChannel.set(item.channel,item.status); }
    const emailAllowed=latestByChannel.get("EMAIL")==="OPTED_IN";
    const smsAllowed=latestByChannel.get("SMS")==="OPTED_IN";
    const voiceAllowed=latestByChannel.get("VOICE")==="OPTED_IN";

    const hasSecondBot=customer.events.some(event=>event.type==="SECOND_BOT") || active.length>1;
    const earnInterest=customer.events.some(event=>event.type==="EARN_INTEREST");
    const recommendation=earnInterest?"EARN_REVIEW":hasSecondBot?"CREW_RECOMMENDATION":"SECOND_BOT_RECOMMENDATION";

    return [{
      prospectId:customer.id,
      stage:customer.stage,
      activeBots:active.map(item=>item.botId),
      activeBotCount:active.length,
      recommendation,
      channels:{email:emailAllowed,sms:smsAllowed,voice:voiceAllowed},
      nextBestAction:recommendation,
      reason:"CUSTOMER_ACTIVATED_AND_NO_SUPPORT_BLOCK",
      contactAllowed:Boolean(emailAllowed||smsAllowed||voiceAllowed),
      sendAutomatically:false,
    }];
  });

  return NextResponse.json({ok:true,count:queue.length,mode:"REVIEW_ONLY",queue},{headers:{"Cache-Control":"no-store"}});
}
