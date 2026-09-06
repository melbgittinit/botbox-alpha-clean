"use client";

import { FormEvent, useMemo, useState } from "react";
import styles from "./bot-factory.module.css";

type District = "me" | "business" | "creators" | "organization" | "opportunity" | "specialty";
type Bot = {
  id: string;
  name: string;
  mark: string;
  primary: District;
  secondary?: District[];
  promise: string;
  desc: string;
  price: string;
  keywords: string[];
  demo: string;
};

type Build = {
  job: string;
  forWhom: string;
  result: string;
  personality: string;
  capabilities: string;
};

type Blueprint = Build & {
  match?: Bot;
  score: number;
  band: string;
  note: string;
};

const bots: Bot[] = [
  { id:"mebot", name:"MeBOT", mark:"ME", primary:"me", promise:"Help me manage me.", desc:"Everyday prioritizing, planning and personal support.", price:"~$2.99", keywords:["day","schedule","organize","priority","remind","life","personal","tasks"], demo:"Prioritized day + next 3 actions" },
  { id:"fam", name:"FAM BOT", mark:"FAM", primary:"me", secondary:["organization"], promise:"Keep our family story alive.", desc:"Family history, heritage, memories and a living archive.", price:"~$2.99", keywords:["family","heritage","history","memory","story","ancestor","reunion","legacy","photo"], demo:"One polished family-memory entry" },
  { id:"coffee", name:"Coffee Bot / QWAZY", mark:"☕", primary:"me", promise:"Make my morning a little better.", desc:"A light daily coffee, routine and conversation companion.", price:"~$1.99", keywords:["coffee","morning","routine","cafe","daily","habit"], demo:"Personalized morning recommendation" },
  { id:"wbells", name:"W. Bells", mark:"WB", primary:"me", promise:"Help us hold the wedding together.", desc:"Wedding planning, decisions, roles, vendors and day-of coordination.", price:"~$4.99", keywords:["wedding","bride","groom","marry","venue","guest","vendor","couple","ceremony"], demo:"Your next 5 wedding moves" },
  { id:"mtc", name:"MY MTC", mark:"MTC", primary:"me", secondary:["organization"], promise:"A little faith and strength for today.", desc:"Faith, encouragement, reflection and daily connection.", price:"~$1.99–$2.99", keywords:["faith","prayer","scripture","church","spiritual","encouragement","devotional"], demo:"Encouragement + reflection + practical action" },
  { id:"pop", name:"POP — Predictor On Purpose", mark:"POP", primary:"me", secondary:["business","opportunity"], promise:"Before you do it — run it through POP.", desc:"Decision support for ideas, opportunities and next moves.", price:"~$1.99", keywords:["decide","decision","choice","choose","risk","go","stop","opportunity","idea","evaluate"], demo:"GO / STOP / DIG DEEPER / SAVE + reasons" },
  { id:"zipper", name:"Zipper / Lead Zeppelin", mark:"ZIP", primary:"business", secondary:["organization"], promise:"Find more people who may need what you sell.", desc:"Lead discovery, buyer targeting and follow-up planning.", price:"~$4.99", keywords:["lead","customer","client","prospect","sales","sell","buyer","outreach","follow up"], demo:"Buyer types + channels + first action" },
  { id:"impostr", name:"imPOSTR", mark:"POST", primary:"business", secondary:["creators","organization"], promise:"Stop letting good content sit unused.", desc:"Plan, repurpose, place and promote content across channels.", price:"~$4.99", keywords:["content","post","social","video","caption","publish","promotion","reels","tiktok","instagram"], demo:"Where and how to use one piece of content" },
  { id:"tvme", name:"TVME / Get ME on TV", mark:"TV", primary:"business", secondary:["creators","organization"], promise:"Find the story people may want to hear.", desc:"Media-angle discovery, pitch preparation and interview readiness.", price:"~$4.99", keywords:["media","tv","press","publicity","news","interview","pitch","journalist","coverage"], demo:"Media angle + hook + talking points" },
  { id:"slide", name:"SLIDE HustL", mark:"SLD", primary:"business", promise:"Too many hustles? Put them in one place.", desc:"A pocket command center for multiple income streams and next actions.", price:"~$2.99", keywords:["hustle","side hustle","income","gig","income streams"], demo:"Organized hustles + priority" },
  { id:"tracking", name:"Tracking Bot", mark:"TRK", primary:"business", secondary:["organization"], promise:"Know what you have, where it is and who has it.", desc:"Track tools, equipment, shared assets and responsibility.", price:"~$4.99", keywords:["track","equipment","asset","tools","inventory","item","borrowed","location"], demo:"Sample asset register" },
  { id:"elevate", name:"Elevate Bot", mark:"↑", primary:"business", secondary:["creators","organization","opportunity"], promise:"Find the next move that could actually matter.", desc:"Opportunity discovery and practical improvement ranked by impact.", price:"~$1.99–$2.99", keywords:["grow","growth","improve","opportunity","audience","distribution","visibility","leverage"], demo:"3 ranked improvement opportunities" },
  { id:"beauty", name:"Beauty BOT", mark:"BTY", primary:"business", promise:"Help me run and grow my beauty business.", desc:"Booking, client follow-up, reactivation and promotion for beauty services.", price:"~$4.99", keywords:["salon","beauty","barber","nail","stylist","hair","booking","appointment","no-show"], demo:"Immediate booking and growth action plan" },
  { id:"register", name:"Register ME BOT", mark:"Rg✓", primary:"business", secondary:["opportunity","me"], promise:"Keep track of what needs registering — and what you may be missing.", desc:"Registrations, warranties, renewals, documents and opportunity reminders.", price:"~$2.99–$4.99", keywords:["register","registration","warranty","renewal","license","deadline","document","appliance"], demo:"Registration / renewal checklist" },
  { id:"creator", name:"Creator Closer Bot", mark:"CC", primary:"creators", secondary:["business"], promise:"Turn the idea into something people can understand, value and buy.", desc:"Clarify, package and finish an idea for presentation or sale.", price:"~$4.99", keywords:["creator","creative","idea","draft","unfinished","finish","package","pitch","song","book","design"], demo:"What you have + what is missing + next moves" },
  { id:"fundus", name:"Fund Us Bot", mark:"FUND", primary:"organization", promise:"Turn the need into a campaign people can actually join.", desc:"Fundraising goals, campaign structure, team selling and supporter follow-up.", price:"~$4.99", keywords:["fundraise","fundraising","fundraiser","donation","campaign","raise money","sponsor","nonprofit"], demo:"Starter fundraising campaign" },
  { id:"freemoney", name:"Free Money Bot", mark:"$", primary:"opportunity", secondary:["me","business"], promise:"Find real opportunities worth checking.", desc:"Organize legitimate grants, scholarships, programs and work opportunities.", price:"~$1.99–$2.99", keywords:["grant","scholarship","free money","assistance","program","job","quick work","funding"], demo:"Legitimate opportunities worth checking" },
  { id:"ufo", name:"UFO BOT", mark:"UFO", primary:"specialty", promise:"Track the unknown.", desc:"Explore reported UAP/UFO cases while separating reported, verified, disputed and unconfirmed information.", price:"~$2.99–$4.99", keywords:["ufo","uap","alien","sighting","unknown","unidentified","archive"], demo:"Structured case / report summary" },
];

const heroes: Record<string,string[]> = {
  all:["mebot","zipper","creator"], me:["mebot","fam","wbells"], business:["zipper","impostr","tvme"], creators:["creator","impostr","tvme"], organization:["fundus","tracking","tvme"], opportunity:["freemoney","register","elevate"], specialty:["ufo"]
};

const districts: {id:District; title:string; copy:string}[] = [
  {id:"me",title:"FOR ME",copy:"Life, family, decisions, celebrations and everyday support."},
  {id:"business",title:"FOR MY BUSINESS",copy:"Customers, visibility, organization, growth and opportunity."},
  {id:"creators",title:"FOR CREATORS",copy:"Finish, package, publish, pitch and sell the idea."},
  {id:"organization",title:"FOR MY ORGANIZATION",copy:"Fundraising, teamwork, communication, history and impact."},
];

function demoFor(bot: Bot, prompt: string){
  const s=(prompt || "your example").slice(0,100);
  const map: Record<string,string> = {
    mebot:"PRIORITY CHECK\n1. Protect the most time-sensitive responsibility.\n2. Finish one thing that removes pressure.\n3. Move one non-urgent item out of today.\n\nNEXT: block the first 25 minutes.",
    fam:`FAMILY MEMORY ENTRY\nSubject: ${s}\nCapture the memory in the teller’s own words. Add people, place and why it matters. Invite one relative to add what they remember.`,
    wbells:"YOUR NEXT 5 WEDDING MOVES\n1. Confirm the decision blocking vendors.\n2. Name who owns guest-list changes.\n3. Verify the next payment.\n4. Draft the run order.\n5. Put one family decision in writing.",
    pop:"CALL: DIG DEEPER\nWHY: upside is visible; cost is unclear; one assumption is untested.\nNEXT: test the riskiest assumption before committing more.",
    zipper:"FIRST PROSPECTING PASS\nLikely buyers: past customers, adjacent buyers, people already showing the problem.\nFirst action: identify 10 real prospects and personalize the first 3 approaches.",
    impostr:"CONTENT MOVE\nLead with the strongest visual. Adapt the explanation for a second channel. Save the behind-the-scenes detail for follow-up. Test one concise hook.",
    tvme:"YOUR MEDIA ANGLE\nLead with the change, result or human consequence—not simply that the business exists. Tie it to something timely. Build 3 talking points.",
    beauty:"BEAUTY BUSINESS QUICK MOVE\nPick one service with booking room. Contact clients naturally due to return. Build one simple promotion. Track booked appointments, not message volume.",
    fundus:"FUNDRAISING STARTER\nState the exact need. Break the goal into achievable supporter actions. Give each teammate one easy share/sell action. Use one QR/link destination. Report progress.",
    freemoney:"OPPORTUNITY CHECK\nLive opportunity search is not connected yet. Production results must show source, who may qualify, deadline, required materials, fit reason and verification status. No guaranteed awards.",
    ufo:`CASE STRUCTURE\nReport: ${s}\nStatus: reported—not automatically verified. Separate witness report, documentation, disputed claims and unresolved details.`
  };
  return map[bot.id] || `${bot.demo.toUpperCase()}\n\nStaging proof example for: ${s}\nThis confirms the interface and expected result type. Live AI is not connected yet.`;
}

export default function Home(){
  const [panel,setPanel]=useState<"lot"|"build"|"blueprint">("lot");
  const [filter,setFilter]=useState<string>("all");
  const [base,setBase]=useState<Bot|undefined>();
  const [build,setBuild]=useState<Build>({job:"",forWhom:"",result:"",personality:"",capabilities:""});
  const [blueprint,setBlueprint]=useState<Blueprint|undefined>();
  const [modalBot,setModalBot]=useState<Bot|undefined>();
  const [modalInfo,setModalInfo]=useState<"executive"|"robots"|undefined>();
  const [demoPrompt,setDemoPrompt]=useState("");
  const [demoResult,setDemoResult]=useState("");
  const [toast,setToast]=useState("");

  const visible = useMemo(()=>{
    const list = filter==="all" ? [...bots] : bots.filter(b=>b.primary===filter || b.secondary?.includes(filter as District));
    const hs=heroes[filter] || [];
    return list.sort((a,b)=>(hs.includes(a.id)?hs.indexOf(a.id):99)-(hs.includes(b.id)?hs.indexOf(b.id):99));
  },[filter]);

  function notify(message:string){ setToast(message); window.setTimeout(()=>setToast(""),4200); }
  function go(next:"lot"|"build"|"blueprint"){ setPanel(next); window.setTimeout(()=>document.getElementById("factory-work")?.scrollIntoView({behavior:"smooth"}),0); }
  function chooseDistrict(id:District){ setFilter(id); go("lot"); }
  function customize(bot:Bot){ setBase(bot); setBuild(v=>({...v,job:`Customize ${bot.name} for my needs: `})); go("build"); }

  function scoreBots(data:Build){
    const text=`${data.job} ${data.result} ${data.capabilities}`.toLowerCase();
    return bots.map(bot=>{
      let score=0;
      bot.keywords.forEach(k=>{ if(text.includes(k)) score += k.includes(" ") ? 14 : 9; });
      if(data.forWhom==="My Business" && (bot.primary==="business" || bot.secondary?.includes("business"))) score+=16;
      if(data.forWhom==="My Creative Work" && (bot.primary==="creators" || bot.secondary?.includes("creators"))) score+=16;
      if(data.forWhom==="My Organization" && (bot.primary==="organization" || bot.secondary?.includes("organization"))) score+=16;
      if(data.forWhom==="Me" && (bot.primary==="me" || bot.secondary?.includes("me"))) score+=12;
      if(base?.id===bot.id) score+=26;
      return {bot,score:Math.min(score,100)};
    }).sort((a,b)=>b.score-a.score);
  }

  function submitBuild(e:FormEvent){
    e.preventDefault();
    const best=scoreBots(build)[0];
    let band="NEW CUSTOM BUILD", note="No current prebuilt is strong enough. Keep this as a new Blueprint and demand signal for review.";
    if(best.score>=55){ band="EXCELLENT MATCH"; note="We already have a strong prebuilt starting point."; }
    else if(best.score>=35){ band="STRONG STARTING POINT"; note="A current prebuilt can handle much of this, then be customized."; }
    else if(best.score>=20){ band="POSSIBLE BASE"; note="There is a related prebuilt, but meaningful customization is needed."; }
    const bp:Blueprint={...build,score:best.score,band,note,match:best.score>=20?best.bot:undefined};
    setBlueprint(bp); go("blueprint");
  }

  function saveBlueprint(){
    if(!blueprint) return;
    try{ localStorage.setItem("bot_factory_blueprint_v1",JSON.stringify({...blueprint,match:blueprint.match?.id})); notify("Saved locally in this browser. Nothing was emailed or texted."); }
    catch{ notify("This browser blocked local storage. Nothing was sent anywhere."); }
  }

  return <main className={styles.page}>
    <div className={styles.stage}>UNPUBLISHED ALPHA — THE BOT FACTORY • live AI, checkout, messaging and production analytics are not connected yet.</div>
    <div className={styles.wrap}>
      <header className={styles.hero}>
        <div className={styles.eyebrow}>THE BOT FACTORY</div>
        <h1>Build one. Pick one.<br/><span>Put it to work.</span></h1>
        <p>A people-first showroom for useful AI agents. Build around your need, or choose one already ready to try.</p>
        <div className={styles.actions}><button className={`${styles.btn} ${styles.primary}`} onClick={()=>{setBase(undefined);go("build")}}>BUILD MY BOT</button><button className={`${styles.btn} ${styles.light}`} onClick={()=>go("lot")}>SHOP PREBUILT BOTS</button></div>
        <div className={styles.levels}><span>ONE BOT</span><b>→</b><span>MY BOT CREW</span><b>→</b><span>BOT FORCE</span><b>→</b><span>BOT EARN MODE</span></div>
      </header>

      <section className={styles.coreGrid}>
        <article className={styles.twin}><span className={styles.eyebrow}>MAKE MINE</span><h2>BUILD-A-BOT</h2><p>Tell the Factory what you need. We first check whether a proven prebuilt is already a strong starting point.</p><button className={styles.textLink} onClick={()=>{setBase(undefined);go("build")}}>Start my build →</button></article>
        <div className={styles.core}><div className={styles.coreInner}><span>BOT</span><strong>CORE</strong><small>MATCH • TEST • CERTIFY • LAUNCH</small></div></div>
        <article className={styles.twin}><span className={styles.eyebrow}>SHOW ME READY</span><h2>PREBUILT LOT</h2><p>Browse bots already designed around real-life, business, creative and organizational needs.</p><button className={styles.textLink} onClick={()=>go("lot")}>See the lot →</button></article>
      </section>

      <section>
        <div className={styles.heading}><div><span className={styles.eyebrow}>SHOP BY YOUR WORLD</span><h2>Where do you want help?</h2></div></div>
        <div className={styles.districts}>{districts.map(d=><button key={d.id} className={styles.district} onClick={()=>chooseDistrict(d.id)}><strong>{d.title}</strong><span>{d.copy}</span></button>)}</div>
      </section>

      <section id="factory-work" className={styles.work}>
        {panel==="lot" && <>
          <div className={styles.heading}><div><span className={styles.eyebrow}>PREBUILT LOT</span><h2>What would help most right now?</h2></div><button className={styles.btn} onClick={()=>{setBase(undefined);go("build")}}>Nothing quite right? Build mine</button></div>
          <div className={styles.filters}>{["all","me","business","creators","organization","opportunity","specialty"].map(f=><button key={f} className={`${styles.filter} ${filter===f?styles.filterOn:""}`} onClick={()=>setFilter(f)}>{f==="all"?"ALL":f.toUpperCase()}</button>)}</div>
          <div className={styles.note}><b>ALPHA TRY-IT RULE:</b> every demo returns a contained proof example. These outputs are scripted for interface testing; live AI is not connected yet.</div>
          <div className={styles.grid}>{visible.map(bot=><article key={bot.id} className={`${styles.card} ${(heroes[filter]||[]).includes(bot.id)?styles.cardHero:""}`}>
            <div className={styles.mark}>{bot.mark}</div><div className={styles.meta}>{bot.primary.replace("me","for me")}</div><h3>{bot.name}</h3><p className={styles.promise}>{bot.promise}</p><p className={styles.desc}>{bot.desc}</p><div className={styles.price}>Starter <b>{bot.price}</b> · provisional</div>
            <div className={styles.cardActions}><button onClick={()=>{setModalBot(bot);setDemoResult("");setDemoPrompt("")}}>TRY IT</button><button onClick={()=>notify("Checkout + ownership entitlement are intentionally not connected in this alpha.")}>TAKE THIS BOT</button><button onClick={()=>customize(bot)}>CUSTOMIZE IT</button><button onClick={()=>notify("Gift recipient data is not being collected yet. Gift flow connects after purchase is verified.")}>GIFT THIS BOT</button></div>
          </article>)}</div>
        </>}

        {panel==="build" && <>
          <div className={styles.heading}><div><span className={styles.eyebrow}>BUILD-A-BOT</span><h2>Tell us what you need. Let’s make your bot.</h2></div><button className={styles.btn} onClick={()=>go("lot")}>See what’s already built</button></div>
          {base && <div className={styles.base}><b>STARTING FROM {base.name}</b><br/><span className={styles.muted}>Keep what fits and customize around your actual need.</span></div>}
          <form className={styles.form} onSubmit={submitBuild}>
            <div className={styles.q}><label>1. What do you want your bot to help with?</label><textarea rows={4} required value={build.job} onChange={e=>setBuild({...build,job:e.target.value})} placeholder="Example: I own a salon and need more bookings and better customer follow-up."/><div className={styles.chips}>{[["Get customers","Get more customers and follow up with them"],["Plan something","Plan and coordinate an event"],["Stay organized","Keep my day and responsibilities organized"],["Create content","Create, publish and promote content"],["Help my family","Preserve family stories and memories"],["Raise money","Build a fundraising campaign"]].map(([label,value])=><button type="button" key={label} className={styles.chip} onClick={()=>setBuild({...build,job:value})}>{label}</button>)}</div></div>
            <div className={styles.q}><label>2. Who is this bot for?</label><div className={styles.choices}>{["Me","My Business","My Creative Work","My Organization","Someone Else"].map(v=><button type="button" key={v} className={`${styles.choice} ${build.forWhom===v?styles.choiceOn:""}`} onClick={()=>setBuild({...build,forWhom:v})}>{v.toUpperCase()}</button>)}</div></div>
            <div className={styles.q}><label>3. What would a good result look like?</label><textarea rows={3} required value={build.result} onChange={e=>setBuild({...build,result:e.target.value})}/></div>
            <div className={styles.q}><label>4. How should your bot feel?</label><div className={styles.choices}>{["Warm","Direct","Encouraging","Professional","Fun","Calm"].map(v=><button type="button" key={v} className={`${styles.choice} ${build.personality===v?styles.choiceOn:""}`} onClick={()=>setBuild({...build,personality:v})}>{v.toUpperCase()}</button>)}</div></div>
            <div className={styles.q}><label>5. What should it know or be able to do?</label><textarea rows={3} required value={build.capabilities} onChange={e=>setBuild({...build,capabilities:e.target.value})} placeholder="Example: booking, promotions, reminders, lead follow-up, my service menu."/></div>
            <button disabled={!build.forWhom || !build.personality} className={`${styles.btn} ${styles.primary}`} type="submit">BUILD MY BLUEPRINT</button><p className={styles.privacy}>No email or phone number is required. “Save my build” stores only in this browser during this alpha.</p>
          </form>
        </>}

        {panel==="blueprint" && blueprint && <>
          <div className={styles.heading}><div><span className={styles.eyebrow}>BOT CORE MATCH</span><h2>Your Bot Blueprint</h2></div></div>
          <div className={styles.blueprint}><article><span className={styles.eyebrow}>YOUR BUILD</span><h2>{blueprint.match?`Customize ${blueprint.match.name}`:"New custom bot"}</h2><div className={styles.spec}><div><span>JOB</span><b>{blueprint.job}</b></div><div><span>FOR</span><b>{blueprint.forWhom}</b></div><div><span>SUCCESS</span><b>{blueprint.result}</b></div><div><span>PERSONALITY</span><b>{blueprint.personality}</b></div><div><span>NEEDS / SKILLS</span><b>{blueprint.capabilities}</b></div></div></article><aside><span className={styles.badge}>{blueprint.band}</span><h2>{blueprint.match?.name || "BUILD-A-BOT"}</h2><p className={styles.muted}>{blueprint.note}</p>{blueprint.match?<p><b>{blueprint.match.promise}</b></p>:<p className={styles.muted}>No new public bot is created automatically; this remains a demand signal for review.</p>}</aside></div>
          <div className={styles.saveRow}><button className={`${styles.btn} ${styles.primary}`} onClick={()=>{if(blueprint.match){setModalBot(blueprint.match);setDemoPrompt(blueprint.job);setDemoResult(demoFor(blueprint.match,blueprint.job));}else notify("Custom runtime is not connected yet. Blueprint is preserved as the specification.")}}>TEST MY BOT</button><button className={`${styles.btn} ${styles.light}`} onClick={saveBlueprint}>SAVE MY BUILD</button><button className={styles.btn} onClick={()=>go("build")}>Edit answers</button></div><p className={styles.privacy}>Alpha save is local-only. Email/text delivery and marketing consent are intentionally not connected yet.</p>
        </>}
      </section>

      <section className={styles.later}><div><b>GIFT A BOT</b><p>Give a useful bot with a personal reveal.</p></div><div><b>MY BOT CREW</b><p>Add complementary bots after the first proves useful.</p></div><div><b>BOT EARN MODE</b><p>Sell certified bots with BOTxBOT².</p></div><div><b>SERVICE</b><p>Tune, train, upgrade and recertify.</p></div></section>
      <footer className={styles.footer}><div><b>THE BOT FACTORY</b><div className={styles.muted}>People first. Bots for real life.</div></div><div><button onClick={()=>setModalInfo("executive")}>Executive Suite</button><button onClick={()=>setModalInfo("robots")}>Looking for an actual robot? The Back Door →</button></div></footer>
    </div>

    {(modalBot || modalInfo) && <div className={styles.modal}><div className={styles.shade} onClick={()=>{setModalBot(undefined);setModalInfo(undefined)}}/><div className={styles.dialog}><button className={styles.close} onClick={()=>{setModalBot(undefined);setModalInfo(undefined)}}>×</button>{modalBot ? <><span className={styles.eyebrow}>TRY {modalBot.name}</span><h2>{modalBot.promise}</h2><p className={styles.muted}>Give the scripted alpha demo a short example. This is not live AI.</p><input className={styles.demoInput} value={demoPrompt} onChange={e=>setDemoPrompt(e.target.value)} placeholder="Type a short example…"/><button className={`${styles.btn} ${styles.primary}`} onClick={()=>setDemoResult(demoFor(modalBot,demoPrompt))}>RUN ALPHA TEST</button>{demoResult && <><div className={styles.result}>{demoResult}</div><div className={styles.saveRow}><button className={`${styles.btn} ${styles.light}`} onClick={()=>{const b=modalBot;setModalBot(undefined);customize(b)}}>CUSTOMIZE THIS BOT</button><button className={styles.btn} onClick={()=>notify("Checkout + entitlement are intentionally not connected in this alpha.")}>TAKE THIS BOT</button></div></>}</> : modalInfo==="robots" ? <><span className={styles.eyebrow}>THE BACK DOOR</span><h2>Real robots. Real machines.</h2><p className={styles.muted}>The separate physical-robot showroom remains an adjacent credibility and commerce lane. It does not redefine the main AI-agent Factory.</p></> : <><span className={styles.eyebrow}>EXECUTIVE SUITE</span><h2>Private institutional lane</h2><p className={styles.muted}>A small room for BrandBridge demonstrations and the Executive Agent. It remains secondary to the main Factory.</p></>}</div></div>}
    {toast && <div className={styles.toast}>{toast}</div>}
  </main>;
}
