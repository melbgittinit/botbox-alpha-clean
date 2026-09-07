import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

function authorized(request:Request){
  const secret=process.env.BOT_FACTORY_INTERNAL_SECRET;
  return Boolean(secret) && request.headers.get("x-bot-factory-internal")===secret;
}

const BOT_TO_LANE:Record<string,string>={
  mebot:"PERSONAL_FAMILY",
  fam:"PERSONAL_FAMILY",
  coffee:"PERSONAL_FAMILY",
  wbells:"PERSONAL_FAMILY",
  mtc:"PERSONAL_FAMILY",
  pop:"OPPORTUNITY",
  zipper:"BUSINESS_GROWTH",
  impostr:"BUSINESS_GROWTH",
  tvme:"CREATOR_MEDIA",
  slide:"BUSINESS_GROWTH",
  tracking:"BUSINESS_GROWTH",
  elevate:"OPPORTUNITY",
  beauty:"BUSINESS_GROWTH",
  register:"OPPORTUNITY",
  creator:"CREATOR_MEDIA",
  fundus:"ORGANIZATION",
  freemoney:"OPPORTUNITY",
  ufo:"SPECIALTY",
};

const LANE_SPECIALIST:Record<string,string>={
  PERSONAL_FAMILY:"PERSONAL_FAMILY_SPECIALIST",
  BUSINESS_GROWTH:"BUSINESS_GROWTH_SPECIALIST",
  CREATOR_MEDIA:"CREATOR_MEDIA_SPECIALIST",
  ORGANIZATION:"ORGANIZATION_SPECIALIST",
  OPPORTUNITY:"OPPORTUNITY_SPECIALIST",
  SPECIALTY:"SPECIALTY_SPECIALIST",
  EARN:"EARN_COACH",
};

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

  const prospects=await prisma.prospect.findMany({
    where:{stage:{in:["CUSTOMER","REPEAT_CUSTOMER","EARN_CANDIDATE"]}},
    orderBy:{lastTouchAt:"asc"},
    take:250,
    include:{
      entitlements:true,
      consent:{orderBy:{capturedAt:"desc"}},
      events:{where:{type:{in:["FIRST_MISSION","SECOND_BOT","EARN_INTEREST"]}},orderBy:{occurredAt:"desc"}},
    },
  });

  const routes=prospects.flatMap(prospect=>{
    const active=prospect.entitlements.filter(item=>item.status==="ACTIVE");
    if(!active.length) return [];

    const supportBlocked=active.some(item=>{
      const event=prospect.events.find(e=>e.type==="FIRST_MISSION"&&e.botId===item.botId);
      const feedback=event?feedbackFrom(event.metadata):"UNKNOWN";
      return ["NEEDS_HELP","NOT_SURE","UNKNOWN"].includes(feedback);
    });
    if(supportBlocked) return [];

    const latestByChannel=new Map<string,string>();
    for(const consent of prospect.consent){
      if(!latestByChannel.has(consent.channel)) latestByChannel.set(consent.channel,consent.status);
    }
    const channels={
      email:latestByChannel.get("EMAIL")==="OPTED_IN",
      sms:latestByChannel.get("SMS")==="OPTED_IN",
      voice:latestByChannel.get("VOICE")==="OPTED_IN",
    };

    const earnInterest=prospect.events.some(event=>event.type==="EARN_INTEREST");
    const lanes=new Set(active.map(item=>BOT_TO_LANE[item.botId]||"SPECIALTY"));
    const lane=earnInterest?"EARN":Array.from(lanes)[0]||"SPECIALTY";
    const specialist=LANE_SPECIALIST[lane]||"SALES_SPECIALIST";

    const activeBotCount=active.length;
    const hasSecondBot=prospect.events.some(event=>event.type==="SECOND_BOT")||activeBotCount>1;
    const objective=earnInterest?"QUALIFY_FOR_EARN":hasSecondBot?"ASSESS_CREW_FIT":"FIND_NEXT_BEST_BOT";
    const priority=earnInterest?"HIGH":prospect.stage==="REPEAT_CUSTOMER"?"HIGH":"NORMAL";

    return [{
      prospectId:prospect.id,
      stage:prospect.stage,
      activeBots:active.map(item=>item.botId),
      activeBotCount,
      lane,
      assignedSpecialist:specialist,
      objective,
      priority,
      permittedChannels:channels,
      contactAllowed:Boolean(channels.email||channels.sms||channels.voice),
      supportBlocked:false,
      reviewRequired:true,
      executeAutomatically:false,
      note:"Operational sales routing only. This does not create a new public Factory district or public-facing bot.",
    }];
  });

  return NextResponse.json({
    ok:true,
    mode:"REVIEW_ONLY",
    count:routes.length,
    routes,
  },{headers:{"Cache-Control":"no-store"}});
}
