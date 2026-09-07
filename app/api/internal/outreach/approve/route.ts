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

function normalizeChannel(value:unknown){
  const channel=String(value||"").trim().toUpperCase();
  return ["EMAIL","SMS","VOICE"].includes(channel)?channel:null;
}

export async function POST(request:Request){
  if(!authorized(request)) return NextResponse.json({ok:false,error:"unauthorized"},{status:401});
  if(!process.env.DATABASE_URL || process.env.BOT_FACTORY_DB_IDENTITY!=="bot-factory-revenue"){
    return NextResponse.json({ok:false,error:"factory_database_not_ready"},{status:503});
  }

  let body:Record<string,unknown>;
  try{body=await request.json();}catch{return NextResponse.json({ok:false,error:"invalid_json"},{status:400});}

  const prospectId=String(body.prospectId||"").trim().slice(0,120);
  const channel=normalizeChannel(body.channel);
  const assignedRole=String(body.assignedRole||"SALES_SPECIALIST").trim().slice(0,80);
  const objective=String(body.objective||"QUALIFY_NEED").trim().slice(0,120);
  const approvalRef=String(body.approvalRef||"").trim().slice(0,120);
  if(!prospectId||!channel||!approvalRef) return NextResponse.json({ok:false,error:"missing_required_fields"},{status:400});

  const prospect=await prisma.prospect.findUnique({
    where:{id:prospectId},
    include:{
      consent:{orderBy:{capturedAt:"desc"}},
      entitlements:true,
      events:{where:{type:{in:["FIRST_MISSION","OPT_OUT","SALES_TOUCH"]}},orderBy:{occurredAt:"desc"}},
    },
  });
  if(!prospect) return NextResponse.json({ok:false,error:"prospect_not_found"},{status:404});

  const latestByChannel=new Map<string,string>();
  for(const consent of prospect.consent){
    if(!latestByChannel.has(consent.channel)) latestByChannel.set(consent.channel,consent.status);
  }

  const globalOptOut=prospect.events.some(event=>event.type==="OPT_OUT");
  const cutoff=new Date(Date.now()-72*60*60*1000);
  const recentTouch=prospect.events.find(event=>event.type==="SALES_TOUCH"&&event.occurredAt>=cutoff);
  const active=prospect.entitlements.filter(item=>item.status==="ACTIVE");
  const supportBlocked=active.some(item=>{
    const mission=prospect.events.find(event=>event.type==="FIRST_MISSION"&&event.botId===item.botId);
    const feedback=mission?feedbackFrom(mission.metadata):"UNKNOWN";
    return ["NEEDS_HELP","NOT_SURE","UNKNOWN"].includes(feedback);
  });

  const channelPermission=latestByChannel.get(channel)==="OPTED_IN";
  const hasReachableContact=channel==="EMAIL"?Boolean(prospect.email):Boolean(prospect.phone);
  const blockers:string[]=[];
  if(globalOptOut) blockers.push("GLOBAL_OPT_OUT");
  if(recentTouch) blockers.push("RECENT_SALES_TOUCH_72H_COOLDOWN");
  if(supportBlocked) blockers.push("CUSTOMER_SUCCESS_BLOCK");
  if(!channelPermission) blockers.push("CHANNEL_NOT_OPTED_IN");
  if(!hasReachableContact) blockers.push("NO_REACHABLE_CONTACT_FOR_CHANNEL");

  if(blockers.length){
    return NextResponse.json({ok:false,error:"outreach_not_ready",blockers},{status:409,headers:{"Cache-Control":"no-store"}});
  }

  const externalEventId=`sales-touch-reservation:${prospect.id}:${approvalRef}`;
  const existing=await prisma.revenueEvent.findUnique({where:{externalEventId}});
  if(existing){
    return NextResponse.json({
      ok:true,
      reserved:true,
      duplicate:true,
      touchEventId:existing.id,
      cooldownHours:72,
      status:"APPROVED_RESERVED_NOT_SENT",
    },{headers:{"Cache-Control":"no-store"}});
  }

  const touch=await prisma.revenueEvent.create({
    data:{
      externalEventId,
      prospectId:prospect.id,
      type:"SALES_TOUCH",
      agentRole:assignedRole==="EARN_COACH"?"EARN_COACH":assignedRole==="OUTBOUND_SPECIALIST"?"OUTBOUND_SPECIALIST":"SALES_SPECIALIST",
      source:"bot-factory-outreach-approval",
      metadata:{
        state:"APPROVED_RESERVED_NOT_SENT",
        channel,
        objective,
        approvalRef,
        activeBots:active.map(item=>item.botId),
      },
    },
  });

  return NextResponse.json({
    ok:true,
    reserved:true,
    duplicate:false,
    touchEventId:touch.id,
    cooldownHours:72,
    status:"APPROVED_RESERVED_NOT_SENT",
    next:"CHANNEL_EXECUTION_REQUIRES_SEPARATE_SEND_STEP",
  },{status:201,headers:{"Cache-Control":"no-store"}});
}
