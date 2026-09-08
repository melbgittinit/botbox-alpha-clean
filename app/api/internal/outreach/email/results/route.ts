import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

function text(value:unknown,max:number){
  return String(value||"").trim().slice(0,max);
}

function verifySignature(raw:string,signature:string,secret:string){
  const expected=createHmac("sha256",secret).update(raw).digest("hex");
  const a=Buffer.from(expected);
  const b=Buffer.from(signature.trim().toLowerCase());
  return a.length===b.length && timingSafeEqual(a,b);
}

const ALLOWED=new Set(["DELIVERED","BOUNCED","COMPLAINED","REJECTED","UNSUBSCRIBED"]);

export async function POST(request:Request){
  if(!process.env.DATABASE_URL || process.env.BOT_FACTORY_DB_IDENTITY!=="bot-factory-revenue"){
    return NextResponse.json({ok:false,error:"factory_database_not_ready"},{status:503});
  }
  const secret=process.env.BOT_FACTORY_EMAIL_WEBHOOK_SECRET;
  if(!secret) return NextResponse.json({ok:false,error:"email_webhook_not_configured"},{status:503});

  const raw=await request.text();
  const signature=request.headers.get("x-bot-factory-email-signature")||"";
  if(!signature || !verifySignature(raw,signature,secret)){
    return NextResponse.json({ok:false,error:"invalid_signature"},{status:401});
  }

  let body:Record<string,unknown>;
  try{body=JSON.parse(raw);}catch{return NextResponse.json({ok:false,error:"invalid_json"},{status:400});}

  const eventId=text(body.eventId,200);
  const type=text(body.type,40).toUpperCase();
  const email=text(body.email,320).toLowerCase();
  const providerMessageId=text(body.providerMessageId||body.messageId,200);
  const reason=text(body.reason,500);
  const hardBounce=Boolean(body.hardBounce) || type==="REJECTED";
  if(!eventId||!email||!ALLOWED.has(type)){
    return NextResponse.json({ok:false,error:"invalid_event"},{status:400});
  }

  const externalEventId=`email-result:${eventId}`;
  const existing=await prisma.revenueEvent.findUnique({where:{externalEventId}});
  if(existing){
    return NextResponse.json({ok:true,duplicate:true,eventId:existing.id},{headers:{"Cache-Control":"no-store"}});
  }

  const prospect=await prisma.prospect.findFirst({where:{email:{equals:email,mode:"insensitive"}}});
  if(!prospect){
    return NextResponse.json({ok:true,ignored:true,reason:"prospect_not_found"},{status:202,headers:{"Cache-Control":"no-store"}});
  }

  const shouldSuppressEmail=type==="COMPLAINED" || type==="UNSUBSCRIBED" || type==="REJECTED" || (type==="BOUNCED"&&hardBounce);

  if(shouldSuppressEmail){
    await prisma.consentRecord.create({
      data:{
        prospectId:prospect.id,
        channel:"EMAIL",
        status:"OPTED_OUT",
        scope:type==="UNSUBSCRIBED"?"EMAIL_MARKETING_OPT_OUT":"EMAIL_DELIVERABILITY_SUPPRESSION",
        source:"email-provider-result",
        evidenceRef:eventId,
      },
    });
  }

  const resultEvent=await prisma.revenueEvent.create({
    data:{
      externalEventId,
      prospectId:prospect.id,
      type:"SALES_TOUCH",
      source:"bot-factory-email-result",
      metadata:{
        channel:"EMAIL",
        state:type,
        providerMessageId:providerMessageId||null,
        reason:reason||null,
        hardBounce,
        emailSuppressed:shouldSuppressEmail,
      },
    },
  });

  return NextResponse.json({
    ok:true,
    duplicate:false,
    status:type,
    emailSuppressed:shouldSuppressEmail,
    resultEventId:resultEvent.id,
  },{status:201,headers:{"Cache-Control":"no-store"}});
}
