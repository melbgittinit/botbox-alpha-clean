import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

function authorized(request:Request){
  const secret=process.env.BOT_FACTORY_INTERNAL_SECRET;
  return Boolean(secret) && request.headers.get("x-bot-factory-internal")===secret;
}

const DEMAND_WEIGHTS:Record<string,number>={
  VISIT:1,
  TRY_STARTED:2,
  TRY_COMPLETED:4,
  BLUEPRINT_CREATED:6,
  BLUEPRINT_SAVED:8,
  CHECKOUT_STARTED:10,
  PURCHASE:18,
  BOT_LAUNCHED:22,
  FIRST_MISSION:28,
  SECOND_BOT:34,
  EARN_INTEREST:36,
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

  const since=new Date(Date.now()-30*24*60*60*1000);
  const events=await prisma.revenueEvent.findMany({
    where:{occurredAt:{gte:since}},
    orderBy:{occurredAt:"desc"},
    take:5000,
  });
  const entitlements=await prisma.botEntitlement.findMany({
    where:{createdAt:{gte:since}},
    include:{prospect:{include:{events:{where:{type:"FIRST_MISSION"},orderBy:{occurredAt:"desc"}}}}},
  });

  const byBot=new Map<string,Record<string,number>>();
  for(const event of events){
    if(!event.botId) continue;
    const row=byBot.get(event.botId)||{score:0,visits:0,tries:0,blueprints:0,checkouts:0,purchases:0,launches:0,missions:0,secondBots:0,earn:0};
    row.score+=(DEMAND_WEIGHTS[event.type]||0);
    if(event.type==="VISIT") row.visits++;
    if(event.type==="TRY_STARTED"||event.type==="TRY_COMPLETED") row.tries++;
    if(event.type==="BLUEPRINT_CREATED"||event.type==="BLUEPRINT_SAVED") row.blueprints++;
    if(event.type==="CHECKOUT_STARTED") row.checkouts++;
    if(event.type==="PURCHASE") row.purchases++;
    if(event.type==="BOT_LAUNCHED") row.launches++;
    if(event.type==="FIRST_MISSION") row.missions++;
    if(event.type==="SECOND_BOT") row.secondBots++;
    if(event.type==="EARN_INTEREST") row.earn++;
    byBot.set(event.botId,row);
  }

  const activation=new Map<string,{active:number;healthy:number;needsHelp:number;unknown:number}>();
  for(const entitlement of entitlements){
    if(entitlement.status!=="ACTIVE") continue;
    const row=activation.get(entitlement.botId)||{active:0,healthy:0,needsHelp:0,unknown:0};
    row.active++;
    const event=entitlement.prospect.events.find(e=>e.botId===entitlement.botId);
    const feedback=event?feedbackFrom(event.metadata):"UNKNOWN";
    if(feedback==="HELPED") row.healthy++;
    else if(feedback==="NEEDS_HELP") row.needsHelp++;
    else row.unknown++;
    activation.set(entitlement.botId,row);
  }

  const bots=new Set([...byBot.keys(),...activation.keys()]);
  const board=Array.from(bots).map(botId=>{
    const d=byBot.get(botId)||{score:0,visits:0,tries:0,blueprints:0,checkouts:0,purchases:0,launches:0,missions:0,secondBots:0,earn:0};
    const a=activation.get(botId)||{active:0,healthy:0,needsHelp:0,unknown:0};
    const tryToPurchase=d.tries?d.purchases/d.tries:0;
    const checkoutToPurchase=d.checkouts?d.purchases/d.checkouts:0;
    const purchaseToLaunch=d.purchases?d.launches/d.purchases:0;
    const launchToMission=d.launches?d.missions/d.launches:0;
    const healthyActivation=a.active?a.healthy/a.active:0;

    let decision="HOLD";
    let reason="NOT_ENOUGH_EVIDENCE";
    if(a.needsHelp>0 || (a.active>=3 && healthyActivation<0.5)){
      decision="RESCUE"; reason="CUSTOMERS_NEED_HELP_BEFORE_MORE_DEMAND";
    }else if(d.purchases>=3 && purchaseToLaunch<0.6){
      decision="FIX"; reason="PURCHASES_NOT_REACHING_LAUNCH";
    }else if(d.checkouts>=5 && checkoutToPurchase<0.35){
      decision="FIX"; reason="CHECKOUT_FRICTION_OR_OFFER_MISMATCH";
    }else if(d.blueprints>=8 && d.purchases===0){
      decision="BUILD_MORE"; reason="STRONG_BUILD_A_BOT_DEMAND_WITHOUT_PRODUCT_CONVERSION";
    }else if((d.secondBots>=2 || d.earn>=2) && healthyActivation>=0.6){
      decision="EXPAND"; reason="SUCCESS_IS_CREATING_NEXT_STEP_BEHAVIOR";
    }else if(d.purchases>=3 && d.missions>=2 && healthyActivation>=0.6){
      decision="PUSH"; reason="PROVEN_DEMAND_AND_HEALTHY_CUSTOMER_OUTCOMES";
    }else if(d.score>=25 && d.purchases===0){
      decision="FIX"; reason="INTEREST_WITHOUT_PURCHASE";
    }

    return {
      botId,
      decision,
      reason,
      demandScore:d.score,
      signals:d,
      activation:a,
      rates:{
        tryToPurchase:Number(tryToPurchase.toFixed(3)),
        checkoutToPurchase:Number(checkoutToPurchase.toFixed(3)),
        purchaseToLaunch:Number(purchaseToLaunch.toFixed(3)),
        launchToMission:Number(launchToMission.toFixed(3)),
        healthyActivation:Number(healthyActivation.toFixed(3)),
      },
      reviewRequired:true,
      executeAutomatically:false,
    };
  }).sort((a,b)=>b.demandScore-a.demandScore);

  const summary=board.reduce<Record<string,number>>((acc,item)=>{
    acc[item.decision]=(acc[item.decision]||0)+1;
    return acc;
  },{});

  return NextResponse.json({
    ok:true,
    mode:"REVIEW_ONLY",
    windowDays:30,
    operatingRule:"OBSERVE_DEMAND_PROVE_CONVERSION_THEN_AMPLIFY",
    summary,
    board,
  },{headers:{"Cache-Control":"no-store"}});
}
