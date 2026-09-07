import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

function authorized(request:Request){
  const secret=process.env.BOT_FACTORY_INTERNAL_SECRET;
  return Boolean(secret) && request.headers.get("x-bot-factory-internal")===secret;
}

type BotScore={
  botId:string;
  visits:number;
  tryStarts:number;
  tryCompletes:number;
  blueprintInterest:number;
  checkouts:number;
  purchases:number;
  launches:number;
  firstMissions:number;
  secondBotSignals:number;
  earnInterest:number;
  weightedDemand:number;
};

const WEIGHTS:Record<string,number>={
  VISIT:1,
  TRY_STARTED:2,
  TRY_COMPLETED:3,
  BLUEPRINT_CREATED:4,
  BLUEPRINT_SAVED:5,
  CHECKOUT_STARTED:6,
  PURCHASE:12,
  BOT_LAUNCHED:10,
  FIRST_MISSION:10,
  SECOND_BOT:12,
  EARN_INTEREST:8,
};

function ensure(map:Map<string,BotScore>,botId:string){
  if(!map.has(botId)) map.set(botId,{botId,visits:0,tryStarts:0,tryCompletes:0,blueprintInterest:0,checkouts:0,purchases:0,launches:0,firstMissions:0,secondBotSignals:0,earnInterest:0,weightedDemand:0});
  return map.get(botId)!;
}

export async function GET(request:Request){
  if(!authorized(request)) return NextResponse.json({ok:false,error:"unauthorized"},{status:401});
  if(!process.env.DATABASE_URL || process.env.BOT_FACTORY_DB_IDENTITY!=="bot-factory-revenue"){
    return NextResponse.json({ok:false,error:"factory_database_not_ready"},{status:503});
  }

  const url=new URL(request.url);
  const days=Math.min(Math.max(Number(url.searchParams.get("days")||30),1),90);
  const since=new Date(Date.now()-days*24*60*60*1000);

  const events=await prisma.revenueEvent.findMany({
    where:{occurredAt:{gte:since}},
    orderBy:{occurredAt:"desc"},
    take:5000,
  });

  const scores=new Map<string,BotScore>();
  let unattributedEvents=0;
  let supportBlocks=0;

  for(const event of events){
    if(!event.botId){ unattributedEvents++; continue; }
    const row=ensure(scores,event.botId);
    row.weightedDemand+=WEIGHTS[event.type]||0;
    if(event.type==="VISIT") row.visits++;
    if(event.type==="TRY_STARTED") row.tryStarts++;
    if(event.type==="TRY_COMPLETED") row.tryCompletes++;
    if(event.type==="BLUEPRINT_CREATED"||event.type==="BLUEPRINT_SAVED") row.blueprintInterest++;
    if(event.type==="CHECKOUT_STARTED") row.checkouts++;
    if(event.type==="PURCHASE") row.purchases++;
    if(event.type==="BOT_LAUNCHED") row.launches++;
    if(event.type==="FIRST_MISSION"){
      row.firstMissions++;
      if(event.metadata && typeof event.metadata==="object" && !Array.isArray(event.metadata)){
        const feedback=(event.metadata as Record<string,unknown>).feedback;
        if(feedback==="NEEDS_HELP"||feedback==="NOT_SURE") supportBlocks++;
      }
    }
    if(event.type==="SECOND_BOT") row.secondBotSignals++;
    if(event.type==="EARN_INTEREST") row.earnInterest++;
  }

  const ranked=Array.from(scores.values()).sort((a,b)=>b.weightedDemand-a.weightedDemand);
  const demandLeaders=ranked.slice(0,10).map(row=>({
    ...row,
    tryToPurchasePct:row.tryCompletes?Math.round((row.purchases/row.tryCompletes)*1000)/10:null,
    checkoutToPurchasePct:row.checkouts?Math.round((row.purchases/row.checkouts)*1000)/10:null,
    purchaseToLaunchPct:row.purchases?Math.round((row.launches/row.purchases)*1000)/10:null,
    launchToMissionPct:row.launches?Math.round((row.firstMissions/row.launches)*1000)/10:null,
  }));

  const actionIdeas=demandLeaders.map(row=>{
    const ideas:string[]=[];
    if(row.tryCompletes>=3 && row.purchases===0) ideas.push("IMPROVE_OFFER_OR_PRICE");
    if(row.checkouts>=2 && row.purchases===0) ideas.push("CHECK_CHECKOUT_FRICTION");
    if(row.purchases>0 && row.launches<row.purchases) ideas.push("ACTIVATION_RESCUE");
    if(row.launches>0 && row.firstMissions<row.launches) ideas.push("FIRST_MISSION_PUSH");
    if(row.secondBotSignals>0) ideas.push("FEATURE_NATURAL_NEXT_BOT_OR_CREW");
    if(row.earnInterest>0) ideas.push("EARN_QUALIFICATION_CONTENT");
    if(row.weightedDemand>=20 && row.purchases>0) ideas.push("CONSIDER_HOMEPAGE_FEATURE");
    return {botId:row.botId,ideas};
  }).filter(item=>item.ideas.length);

  return NextResponse.json({
    ok:true,
    mode:"REVIEW_ONLY",
    role:"MARKETING_DIRECTOR",
    windowDays:days,
    since,
    totals:{events:events.length,unattributedEvents,supportBlocks},
    demandLeaders,
    actionIdeas,
    factorySignals:{
      mostDemandedBot:demandLeaders[0]?.botId||null,
      mostPurchasedBot:[...demandLeaders].sort((a,b)=>b.purchases-a.purchases)[0]?.botId||null,
      strongestSecondBotSignal:[...demandLeaders].sort((a,b)=>b.secondBotSignals-a.secondBotSignals)[0]?.botId||null,
      strongestEarnSignal:[...demandLeaders].sort((a,b)=>b.earnInterest-a.earnInterest)[0]?.botId||null,
    },
    operatingRule:"OBSERVE_DEMAND_PROVE_CONVERSION_THEN_AMPLIFY",
    executeAutomatically:false,
    note:"Internal demand intelligence only. It does not change the locked public Factory architecture or automatically launch campaigns.",
  },{headers:{"Cache-Control":"no-store"}});
}
