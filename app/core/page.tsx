import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { verifyCoreAccessToken } from "../../lib/core-access";
import LaunchBotButton from "../../components/LaunchBotButton";

export const dynamic = "force-dynamic";

const BOT_NAMES:Record<string,string>={
  mebot:"MeBOT",fam:"FAM BOT",coffee:"Coffee Bot / QWAZY",wbells:"W. Bells",mtc:"MY MTC",pop:"POP — Predictor On Purpose",zipper:"Zipper / Lead Zeppelin",impostr:"imPOSTR",tvme:"TVME / Get ME on TV",slide:"SLIDE HustL",tracking:"Tracking Bot",elevate:"Elevate Bot",beauty:"Beauty BOT",register:"Register ME BOT",creator:"Creator Closer Bot",fundus:"Fund Us Bot",freemoney:"Free Money Bot",ufo:"UFO BOT"
};

function coreState(status:string){
  return [
    ["IDENTITY",["CONFIGURING","TEST_REQUIRED","CERTIFIED","ACTIVE"].includes(status)],
    ["SKILLS",["TEST_REQUIRED","CERTIFIED","ACTIVE"].includes(status)],
    ["PERSONALIZATION",["TEST_REQUIRED","CERTIFIED","ACTIVE"].includes(status)],
    ["TEST",["CERTIFIED","ACTIVE"].includes(status)],
    ["CERTIFIED",["CERTIFIED","ACTIVE"].includes(status)],
  ] as const;
}

export default async function CorePage({searchParams}:{searchParams:Promise<{token?:string}>}){
  const {token=""}=await searchParams;
  const payload=verifyCoreAccessToken(token);
  if(!payload || !process.env.DATABASE_URL || process.env.BOT_FACTORY_DB_IDENTITY!=="bot-factory-revenue"){
    return <main style={{minHeight:"100vh",background:"#05070b",color:"white",padding:"64px 24px",fontFamily:"Arial,sans-serif"}}><div style={{maxWidth:760,margin:"0 auto"}}><p style={{letterSpacing:2,color:"#7fb7ff"}}>BOT CORE</p><h1>Core access is not available.</h1><p style={{color:"#a9b1bf"}}>Your secure Core link may have expired, or the production revenue database is not yet attached.</p></div></main>;
  }

  const entitlement=await prisma.botEntitlement.findUnique({where:{id:payload.entitlementId}});
  if(!entitlement){
    return <main style={{minHeight:"100vh",background:"#05070b",color:"white",padding:"64px 24px",fontFamily:"Arial,sans-serif"}}><div style={{maxWidth:760,margin:"0 auto"}}><h1>Bot entitlement not found.</h1></div></main>;
  }

  const name=BOT_NAMES[entitlement.botId]||entitlement.botId;
  const items=coreState(entitlement.status);
  const canTest=["CONFIGURING","TEST_REQUIRED"].includes(entitlement.status);
  const canLaunch=entitlement.status==="CERTIFIED";
  const canMission=entitlement.status==="ACTIVE";
  return <main style={{minHeight:"100vh",background:"radial-gradient(circle at 50% 20%,#10233f,#05070b 55%)",color:"white",padding:"54px 22px 90px",fontFamily:"Arial,sans-serif"}}>
    <div style={{maxWidth:860,margin:"0 auto"}}>
      <p style={{letterSpacing:3,fontSize:13,color:"#81b7ff",fontWeight:700}}>THE BOT FACTORY • BOT CORE</p>
      <h1 style={{fontSize:"clamp(34px,7vw,68px)",margin:"12px 0 8px",lineHeight:1}}>YOUR BOT IS HEADING TO THE CORE.</h1>
      <p style={{fontSize:22,color:"#d5dbea",marginBottom:36}}>{name}</p>
      <div style={{display:"grid",gap:12}}>
        {items.map(([label,done])=><div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 20px",border:"1px solid #283a55",borderRadius:14,background:"rgba(8,14,24,.8)"}}><strong>{label}</strong><span style={{fontWeight:800,color:done?"#9be3b2":"#93a1b6"}}>{done?"✓":"PENDING"}</span></div>)}
      </div>
      <div style={{marginTop:26,padding:"22px",borderRadius:16,background:"rgba(255,255,255,.05)",border:"1px solid #283a55"}}>
        <div style={{fontSize:12,letterSpacing:2,color:"#8ca2bf"}}>CURRENT CORE STATUS</div>
        <div style={{fontSize:28,fontWeight:800,marginTop:6}}>{entitlement.status.replaceAll("_"," ")}</div>
        <p style={{color:"#b6c0cf",lineHeight:1.6,marginBottom:(canTest||canLaunch||canMission)?18:0}}>{entitlement.status==="CORE_PENDING"?"Payment is verified. Your bot is waiting to enter configuration.":entitlement.status==="CONFIGURING"?"Identity, skills and personalization are being prepared. You can now run the purchased Core Test Track.":entitlement.status==="TEST_REQUIRED"?"Configuration is ready. Your bot must pass Test Track before certification.":entitlement.status==="CERTIFIED"?"Your bot is certified. Launch is now unlocked.":entitlement.status==="ACTIVE"?"Your bot is active. Start its first mission.":"The Factory is preparing the next Core step."}</p>
        {canTest&&<Link href={`/core/test?token=${encodeURIComponent(token)}`} style={{display:"inline-block",background:"white",color:"#07101d",padding:"12px 18px",borderRadius:999,fontWeight:900,textDecoration:"none"}}>ENTER PURCHASED TEST TRACK →</Link>}
        {canLaunch&&<LaunchBotButton token={token}/>} 
        {canMission&&<Link href={`/core/mission?token=${encodeURIComponent(token)}`} style={{display:"inline-block",background:"white",color:"#07101d",padding:"12px 18px",borderRadius:999,fontWeight:900,textDecoration:"none"}}>START FIRST MISSION →</Link>}
      </div>
      <p style={{marginTop:28,color:"#748398",fontSize:13}}>Purchase does not bypass testing or certification. Launch unlocks only after the Core requirements are satisfied.</p>
    </div>
  </main>;
}
