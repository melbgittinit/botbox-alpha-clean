import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

function authorized(request:Request){
  const secret=process.env.BOT_FACTORY_INTERNAL_SECRET;
  return Boolean(secret) && request.headers.get("x-bot-factory-internal")===secret;
}

function text(value:unknown,max:number){
  return String(value||"").trim().slice(0,max);
}

function metadataObject(value:unknown):Record<string,unknown>{
  return value && typeof value==="object" && !Array.isArray(value)?value as Record<string,unknown>:{};
}

export async function POST(request:Request){
  if(!authorized(request)) return NextResponse.json({ok:false,error:"unauthorized"},{status:401});
  if(!process.env.DATABASE_URL || process.env.BOT_FACTORY_DB_IDENTITY!=="bot-factory-revenue"){
    return NextResponse.json({ok:false,error:"factory_database_not_ready"},{status:503});
  }

  const sendUrl=process.env.BOT_FACTORY_SMS_SEND_URL;
  const sendToken=process.env.BOT_FACTORY_SMS_SEND_TOKEN;
  const from=process.env.BOT_FACTORY_SMS_FROM;
  if(!sendUrl || !sendToken || !from){
    return NextResponse.json({
      ok:false,
      error:"sms_provider_not_configured",
      required:["BOT_FACTORY_SMS_SEND_URL","BOT_FACTORY_SMS_SEND_TOKEN","BOT_FACTORY_SMS_FROM"],
      status:"EXECUTION_BLOCKED_NO_PROVIDER",
    },{status:503,headers:{"Cache-Control":"no-store"}});
  }

  let body:Record<string,unknown>;
  try{body=await request.json();}catch{return NextResponse.json({ok:false,error:"invalid_json"},{status:400});}

  const prospectId=text(body.prospectId,120);
  const approvalRef=text(body.approvalRef,120);
  const touchEventId=text(body.touchEventId,120);
  let message=text(body.message,1200);
  if(!prospectId||!approvalRef||!touchEventId||!message){
    return NextResponse.json({ok:false,error:"missing_required_fields"},{status:400});
  }

  if(!/\bSTOP\b/i.test(message)){
    message=`${message}\nReply STOP to opt out.`.slice(0,1200);
  }

  const prospect=await prisma.prospect.findUnique({
    where:{id:prospectId},
    include:{consent:{orderBy:{capturedAt:"desc"}},events:{where:{type:{in:["OPT_OUT","SALES_TOUCH"]}},orderBy:{occurredAt:"desc"}}},
  });
  if(!prospect || !prospect.phone) return NextResponse.json({ok:false,error:"prospect_phone_not_found"},{status:404});

  const reservation=prospect.events.find(event=>event.id===touchEventId && event.type==="SALES_TOUCH");
  if(!reservation) return NextResponse.json({ok:false,error:"reservation_not_found"},{status:404});
  const reservationMeta=metadataObject(reservation.metadata);
  if(reservation.source!=="bot-factory-outreach-approval" || reservationMeta.state!=="APPROVED_RESERVED_NOT_SENT" || reservationMeta.channel!=="SMS" || reservationMeta.approvalRef!==approvalRef){
    return NextResponse.json({ok:false,error:"reservation_mismatch"},{status:409});
  }

  const latestSmsConsent=prospect.consent.find(consent=>consent.channel==="SMS");
  const optOutAfterApproval=prospect.events.some(event=>event.type==="OPT_OUT" && event.occurredAt>=reservation.occurredAt);
  const consentValid=latestSmsConsent?.status==="OPTED_IN";
  if(optOutAfterApproval || !consentValid){
    return NextResponse.json({
      ok:false,
      error:"fresh_readiness_failed",
      blockers:[...(optOutAfterApproval?["OPT_OUT_AFTER_APPROVAL"]:[]),...(!consentValid?["SMS_NOT_OPTED_IN"]:[])],
    },{status:409,headers:{"Cache-Control":"no-store"}});
  }

  const sendEventExternalId=`sms-send:${prospect.id}:${approvalRef}`;
  const existingSend=await prisma.revenueEvent.findUnique({where:{externalEventId:sendEventExternalId}});
  if(existingSend){
    return NextResponse.json({ok:true,duplicate:true,status:"ALREADY_SENT_OR_RECORDED",sendEventId:existingSend.id},{headers:{"Cache-Control":"no-store"}});
  }

  const contentHash=createHash("sha256").update(message).digest("hex");
  let providerResponse:Response;
  try{
    providerResponse=await fetch(sendUrl,{
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":`Bearer ${sendToken}`},
      body:JSON.stringify({
        from,
        to:prospect.phone,
        message,
        metadata:{prospectId:prospect.id,approvalRef,touchEventId},
      }),
      cache:"no-store",
    });
  }catch{
    return NextResponse.json({ok:false,error:"sms_provider_unreachable",status:"NOT_SENT"},{status:502});
  }

  let providerBody:unknown=null;
  try{providerBody=await providerResponse.json();}catch{providerBody=null;}
  if(!providerResponse.ok){
    return NextResponse.json({ok:false,error:"sms_provider_rejected",providerStatus:providerResponse.status,status:"NOT_SENT"},{status:502});
  }

  const providerObject=metadataObject(providerBody);
  const providerMessageId=text(providerObject.id||providerObject.messageId||providerObject.sid,200)||null;
  const sendEvent=await prisma.revenueEvent.create({
    data:{
      externalEventId:sendEventExternalId,
      prospectId:prospect.id,
      type:"SALES_TOUCH",
      agentRole:reservation.agentRole,
      source:"bot-factory-sms-send",
      metadata:{
        state:"SENT",
        channel:"SMS",
        approvalRef,
        touchEventId,
        providerMessageId,
        contentHash,
        stopLanguageIncluded:true,
      },
    },
  });

  return NextResponse.json({
    ok:true,
    duplicate:false,
    status:"SENT",
    channel:"SMS",
    sendEventId:sendEvent.id,
    providerMessageId,
  },{status:201,headers:{"Cache-Control":"no-store"}});
}
