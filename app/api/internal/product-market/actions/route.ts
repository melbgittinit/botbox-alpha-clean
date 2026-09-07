import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

function authorized(request:Request){
  const secret=process.env.BOT_FACTORY_INTERNAL_SECRET;
  return Boolean(secret) && request.headers.get("x-bot-factory-internal")===secret;
}

const WEIGHTS:Record<string,number>={VISIT:1,TRY_STARTED:2,TRY_COMPLETED:4,BLUEPRINT_CREATED:6,BLUEPRINT_SAVED:8,CHECKOUT_STARTED:10,PURCHASE:18,BOT_LAUNCHED:22,FIRST_MISSION:28,SECOND_BOT:34,EARN_INTEREST:36};

function feedbackFrom(metadata:unknown){
  if(!metadata || typeof metadata!=="object" || Array.isArray(metadata)) return "UNKNOWN";
  const value=(metadata as Record<string,unknown>).feedback;
  return typeof value==="string"?value:"UNKNOWN";
}

function decide(d:Record<string,number>,a:{active:number;healthy:number;needsHelp:number;unknown:number}){
  const checkoutToPurchase=d.checkouts?d.purchases/d.checkouts:0;
  const purchaseToLaunch=d.purchases?d.launches/d.purchases:0;
  const healthyActivation=a.active?a.healthy/a.active:0;
  if(a.needsHelp>0 || (a.active>=3 && healthyActivation<0.5)) return {decision:"RESCUE",reason:"CUSTOMERS_NEED_HELP_BEFORE_MORE_DEMAND"};
  if(d.purchases>=3 && purchaseToLaunch<0.6) return {decision:"FIX",reason:"PURCHASES_NOT_REACHING_LAUNCH"};
  if(d.checkouts>=5 && checkoutToPurchase<0.35) return {decision:"FIX",reason:"CHECKOUT_FRICTION_OR_OFFER_MISMATCH"};
  if(d.blueprints>=8 && d.purchases===0) return {decision:"BUILD_MORE",reason:"STRONG_BUILD_A_BOT_DEMAND_WITHOUT_PRODUCT_CONVERSION"};
  if((d.secondBots>=2 || d.earn>=2) && healthyActivation>=0.6) return {decision:"EXPAND",reason:"SUCCESS_IS_CREATING_NEXT_STEP_BEHAVIOR"};
  if(d.purchases>=3 && d.missions>=2 && healthyActivation>=0.6) return {decision:"PUSH",reason:"PROVEN_DEMAND_AND_HEALTHY_CUSTOMER_OUTCOMES"};
  if(d.score>=25 && d.purchases===0) return {decision:"FIX",reason:"INTEREST_WITHOUT_PURCHASE"};
  return {decision:"HOLD",reason:"NOT_ENOUGH_EVIDENCE"};
}

function planFor(decision:string,reason:string){
  if(decision==="PUSH") return {
    owner:"MARKETING_DIRECTOR",
    objective:"AMPLIFY_PROVEN_WINNER",
    actions:["CONSIDER_HOMEPAGE_FEATURE","STRENGTHEN_DEMO","PREPARE_PERMISSION_SAFE_CAMPAIGN_CANDIDATE"],
    successMetric:"Maintain healthy activation while increasing qualified purchases.",
  };
  if(decision==="FIX") return {
    owner:"MARKETING_DIRECTOR",
    objective:"REMOVE_FUNNEL_FRICTION",
    actions:reason.includes("LAUNCH")?["AUDIT_POST_PURCHASE_HANDOFF","AUDIT_CORE_ENTRY","CHECK_CUSTOMER_SUCCESS_BLOCKERS"]:["AUDIT_OFFER_AND_COPY","AUDIT_CHECKOUT_FRICTION","COMPARE_TRY_TO_PURCHASE_HANDOFF"],
    successMetric:"Improve the weakest conversion step before increasing traffic.",
  };
  if(decision==="RESCUE") return {
    owner:"CUSTOMER_SUCCESS",
    objective:"RESTORE_CUSTOMER_SUCCESS",
    actions:["REVIEW_NEEDS_HELP_CASES","TUNE_OR_TRAIN_WHERE_NEEDED","GUIDED_RETEST","BLOCK_UPSELL_UNTIL_HEALTHY"],
    successMetric:"Move customers from unresolved activation to useful first-mission outcomes.",
  };
  if(decision==="EXPAND") return {
    owner:"SALES_DIRECTOR",
    objective:"EXPAND_FROM_PROVEN_SUCCESS",
    actions:["ASSESS_SECOND_BOT_FIT","ASSESS_CREW_FIT","REVIEW_EARN_INTEREST_IF_PRESENT"],
    successMetric:"Generate healthy expansion revenue without harming activation quality.",
  };
  if(decision==="BUILD_MORE") return {
    owner:"PRODUCT_FACTORY",
    objective:"TURN_UNMET_DEMAND_INTO_PRODUCT",
    actions:["REVIEW_BUILD_A_BOT_REQUEST_PATTERNS","CLUSTER_UNMATCHED_NEEDS","DRAFT_PRODUCT_BRIEF","REVIEW_BEFORE_ADDING_ANY_PUBLIC_BOT"],
    successMetric:"Convert repeated unmet demand into one justified product decision.",
  };
  return {
    owner:"MARKETING_DIRECTOR",
    objective:"KEEP_OBSERVING",
    actions:["COLLECT_MORE_SIGNAL","DO_NOT_FORCE_TRAFFIC","REVIEW_AGAIN_AFTER_MORE_EVIDENCE"],
    successMetric:"Reach enough evidence for a confident PUSH, FIX, RESCUE, EXPAND or BUILD MORE decision.",
  };
}

export async function GET(request:Request){
  if(!authorized(request)) return NextResponse.json({ok:false,error:"unauthorized"},{status:401});
  if(!process.env.DATABASE_URL || process.env.BOT_FACTORY_DB_IDENTITY!=="bot-factory-revenue"){
    return NextResponse.json({ok:false,error:"factory_database_not_ready"},{status:503});
  }

  const since=new Date(Date.now()-30*24*60*60*1000);
  const events=await prisma.revenueEvent.findMany({where:{occurredAt:{gte:since}},orderBy:{occurredAt:"desc"},take:5000});
  const entitlements=await prisma.botEntitlement.findMany({where:{createdAt:{gte:since}},include:{prospect:{include:{events:{where:{type:"FIRST_MISSION"},orderBy:{occurredAt:"desc"}}}}}});

  const byBot=new Map<string,Record<string,number>>();
  for(const event of events){
    if(!event.botId) continue;
    const row=byBot.get(event.botId)||{score:0,tries:0,blueprints:0,checkouts:0,purchases:0,launches:0,missions:0,secondBots:0,earn:0};
    row.score+=(WEIGHTS[event.type]||0);
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
    const mission=entitlement.prospect.events.find(e=>e.botId===entitlement.botId);
    const feedback=mission?feedbackFrom(mission.metadata):"UNKNOWN";
    if(feedback==="HELPED") row.healthy++;
    else if(feedback==="NEEDS_HELP") row.needsHelp++;
    else row.unknown++;
    activation.set(entitlement.botId,row);
  }

  const bots=new Set([...byBot.keys(),...activation.keys()]);
  const workQueue=Array.from(bots).map(botId=>{
    const d=byBot.get(botId)||{score:0,tries:0,blueprints:0,checkouts:0,purchases:0,launches:0,missions:0,secondBots:0,earn:0};
    const a=activation.get(botId)||{active:0,healthy:0,needsHelp:0,unknown:0};
    const verdict=decide(d,a);
    const plan=planFor(verdict.decision,verdict.reason);
    return {
      botId,
      decision:verdict.decision,
      reason:verdict.reason,
      demandScore:d.score,
      owner:plan.owner,
      objective:plan.objective,
      actions:plan.actions,
      successMetric:plan.successMetric,
      reviewRequired:true,
      executeAutomatically:false,
      architectureGuard:verdict.decision==="BUILD_MORE"?"CHANGE_WARNING_REQUIRED_BEFORE_ADDING_PUBLIC_BOT":null,
    };
  }).sort((a,b)=>b.demandScore-a.demandScore);

  return NextResponse.json({
    ok:true,
    mode:"REVIEW_ONLY",
    windowDays:30,
    operatingRule:"DIAGNOSE_THEN_ASSIGN_ONE_CONCRETE_NEXT_MOVE",
    count:workQueue.length,
    workQueue,
  },{headers:{"Cache-Control":"no-store"}});
}
