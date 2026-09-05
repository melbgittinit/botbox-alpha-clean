"use client";

import { useEffect, useMemo, useState } from "react";

type Step = "campus" | "compass" | "idea" | "audience" | "result" | "format" | "name" | "outline" | "complete" | "locker";

type Creation = {
  id: string;
  title: string;
  idea: string;
  audience: string;
  result: string;
  format: string;
  outline: string[];
  step: Step;
  progress: number;
  status: "BUILDING" | "COMPLETE";
  updatedAt: string;
};

const STORAGE_KEY = "creator-college-v1-creations";
const ACTIVE_KEY = "creator-college-v1-active";

const compassQuestions = [
  { key: "intent", title: "WHAT BRINGS YOU TO CREATOR COLLEGE?", options: ["I HAVE AN IDEA", "I HAVE A SKILL", "I WANT TO MAKE SOMETHING I CAN SELL", "I WANT TO MAKE SOMETHING FOR ME", "I'M JUST EXPLORING", "I HAVE NO IDEA YET"] },
  { key: "audience", title: "WHO WOULD YOU LIKE TO CREATE FOR?", options: ["MYSELF", "FAMILY", "CHURCH / GROUP", "CUSTOMERS", "CLIENTS", "SMALL BUSINESSES", "EVERYBODY"] },
  { key: "goal", title: "WHAT WOULD MAKE THIS WORTH DOING?", options: ["HAVE FUN", "HELP SOMEBODY", "MAKE MONEY", "BUILD AN AUDIENCE", "START SOMETHING BIGGER", "MAKE SOMETHING I'M PROUD OF"] },
  { key: "time", title: "HOW MUCH TIME DO YOU HAVE?", options: ["15 MINUTES", "30 MINUTES", "ABOUT AN HOUR", "THIS AFTERNOON", "THIS WEEKEND"] },
  { key: "interest", title: "WHAT SOUNDS MOST INTERESTING?", options: ["BOOKS / GUIDES", "VIDEO", "PRODUCTS", "DESIGN", "BUSINESS", "EVENTS", "AUDIO", "SURPRISE ME"] },
] as const;

const progressByStep: Record<Step, number> = {
  campus: 0, compass: 0, idea: 10, audience: 20, result: 35, format: 50, name: 65, outline: 82, complete: 100, locker: 100,
};

function newCreation(): Creation {
  return {
    id: `cc-${Date.now()}`,
    title: "Untitled Creation",
    idea: "",
    audience: "",
    result: "",
    format: "Mini Guide",
    outline: [],
    step: "idea",
    progress: 10,
    status: "BUILDING",
    updatedAt: new Date().toISOString(),
  };
}

export default function CreatorCollegeClient() {
  const [step, setStep] = useState<Step>("campus");
  const [compassIndex, setCompassIndex] = useState(0);
  const [compassAnswers, setCompassAnswers] = useState<Record<string, string>>({});
  const [creation, setCreation] = useState<Creation | null>(null);
  const [creations, setCreations] = useState<Creation[]>([]);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as Creation[];
    const activeId = localStorage.getItem(ACTIVE_KEY);
    setCreations(list);
    const active = list.find((item) => item.id === activeId && item.status === "BUILDING");
    if (active) setCreation(active);
  }, []);

  useEffect(() => {
    if (!creation) return;
    setSaved(false);
    const timer = setTimeout(() => {
      const next = [creation, ...creations.filter((item) => item.id !== creation.id)];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      localStorage.setItem(ACTIVE_KEY, creation.status === "BUILDING" ? creation.id : "");
      setCreations(next);
      setSaved(true);
    }, 350);
    return () => clearTimeout(timer);
  }, [creation]);

  const activeCreation = useMemo(() => {
    if (creation?.status === "BUILDING") return creation;
    return creations.find((item) => item.status === "BUILDING") ?? null;
  }, [creations, creation]);

  function patch(patchValue: Partial<Creation>) {
    setCreation((current) => current ? { ...current, ...patchValue, updatedAt: new Date().toISOString() } : current);
  }

  function move(next: Step) {
    patch({ step: next, progress: progressByStep[next] });
    setStep(next);
  }

  function startDigitalProduct() {
    const item = newCreation();
    setCreation(item);
    setStep("idea");
  }

  function resume(item: Creation) {
    setCreation(item);
    setStep(item.step === "complete" ? "locker" : item.step);
  }

  function completeCreation() {
    if (!creation) return;
    const finished = { ...creation, step: "complete" as Step, progress: 100, status: "COMPLETE" as const, updatedAt: new Date().toISOString() };
    setCreation(finished);
    setStep("complete");
  }

  if (step === "campus") {
    return (
      <main className="cc-shell">
        <header className="cc-topbar"><div className="cc-brandmark"><span>🎓</span><strong>CREATOR</strong> COLLEGE <em>• ELEVATE HUB</em></div><button onClick={() => setStep("locker")}>MY LOCKER</button></header>
        <section className="cc-hero">
          <div className="cc-cap">🎓</div>
          <div className="cc-eyebrow">CREATIVE-TECH CAMPUS</div>
          <h1>YOU’VE ALWAYS WANTED TO MAKE SOMETHING.<br/><span>NOW YOU CAN.</span></h1>
          <p>Books. Videos. Products. Brands. Businesses. Events. Ideas.</p>
          <div className="cc-actions">
            {activeCreation ? <button className="primary" onClick={() => resume(activeCreation)}>CONTINUE MY CREATION · {activeCreation.progress}%</button> : <button className="primary" onClick={() => setStep("compass")}>START MY FIRST CREATION</button>}
            <button className="secondary" onClick={() => setStep("compass")}>SHOW ME WHAT I CAN MAKE</button>
          </div>
        </section>
        <section className="cc-compass-card"><div><span>🧭</span><strong>CREATOR COMPASS</strong><p>Not sure where to start? Answer a few easy questions and we’ll point you toward something you can actually finish.</p></div><button onClick={() => setStep("compass")}>FIND MY CREATOR PATH</button></section>
        <section className="cc-section"><div className="cc-section-head"><div><span className="cc-eyebrow">THE LAB</span><h2>WHAT DO YOU WANT TO MAKE?</h2></div><p>Pick a finished result, not a class.</p></div><div className="cc-grid">
          {[
            ["📘","MAKE A DIGITAL PRODUCT","Guide, checklist, planner or resource kit","45–60 min"],
            ["🎥","CREATE A 5-VIDEO SERIES","Concept, episodes and scripts","30–45 min"],
            ["💼","BUILD A SIMPLE SERVICE OFFER","Package a skill into something useful","45 min"],
            ["⛪","MAKE A CHURCH / GROUP KIT","Promotion, materials and follow-up","45–60 min"],
            ["🎨","BUILD A STARTER BRAND","Name, message and visual direction","60 min"],
            ["✨","SURPRISE ME","Give me something I can finish today","15–60 min"],
          ].map(([icon,title,copy,time], idx) => <article className="cc-tile" key={title}><span className="cc-icon">{icon}</span><h3>{title}</h3><p>{copy}</p><small>{time} · Easy Start</small><button onClick={idx === 0 ? startDigitalProduct : () => setStep("compass")}>START</button></article>)}
        </div></section>
        <section className="cc-journey"><div>🧭<b>COMPASS</b><small>Discover</small></div><i>→</i><div>🧪<b>LAB</b><small>Build</small></div><i>→</i><div>🎬<b>STUDIO</b><small>Polish</small></div><i>→</i><div>🛒<b>MARKET</b><small>Use</small></div><i>→</i><div>🗄️<b>LOCKER</b><small>Keep</small></div><i>→</i><div>💥<b>EXPLODE</b><small>Multiply</small></div></section>
      </main>
    );
  }

  if (step === "compass") {
    const q = compassQuestions[compassIndex];
    const finished = compassIndex === compassQuestions.length;
    if (finished) return <main className="cc-shell cc-focus"><button className="cc-back" onClick={() => {setCompassIndex(0); setStep("campus")}}>← CAMPUS</button><section className="cc-result"><span className="cc-eyebrow">CREATOR COMPASS</span><h1>WE FOUND 3 GOOD STARTS FOR YOU.</h1><div className="cc-grid result-grid">{[["BEST MATCH","📘","MAKE A DIGITAL PRODUCT","Turn something you know into a useful mini guide."],["FAST START","🎥","CREATE A 5-VIDEO SERIES","Turn one idea into five short pieces of content."],["CREATE TO EARN","💼","BUILD A SIMPLE SERVICE OFFER","Package a skill into an offer someone can use."]].map(([tag,icon,title,copy],idx)=><article className="cc-tile" key={title}><small>{tag}</small><span className="cc-icon">{icon}</span><h3>{title}</h3><p>{copy}</p><button onClick={idx===0?startDigitalProduct:()=>alert("Starter plan lane is next in V1.")}>BUILD THIS</button></article>)}</div></section></main>;
    return <main className="cc-shell cc-focus"><button className="cc-back" onClick={() => setStep("campus")}>← CAMPUS</button><section className="cc-question"><div className="cc-progress"><span style={{width:`${((compassIndex+1)/compassQuestions.length)*100}%`}}/></div><span className="cc-eyebrow">CREATOR COMPASS · {compassIndex+1} OF {compassQuestions.length}</span><h1>{q.title}</h1><div className="cc-options">{q.options.map((option)=><button key={String(option)} className={compassAnswers[q.key]===String(option)?"selected":""} onClick={()=>setCompassAnswers({...compassAnswers,[q.key]:String(option)})}>{option}</button>)}</div><button className="primary" disabled={!compassAnswers[q.key]} onClick={()=>setCompassIndex(compassIndex+1)}>{compassIndex===compassQuestions.length-1?"SHOW ME WHAT I CAN MAKE":"NEXT"}</button></section></main>;
  }

  if (step === "locker") {
    const list = creations.length ? creations : creation ? [creation] : [];
    return <main className="cc-shell"><header className="cc-topbar"><button onClick={()=>setStep("campus")}>← CAMPUS</button><div className="cc-brandmark"><strong>MY CREATOR LOCKER</strong></div></header><section className="cc-section"><div className="cc-section-head"><div><span className="cc-eyebrow">YOUR BODY OF WORK</span><h1>WHAT YOU’VE BUILT</h1></div></div>{list.length===0?<div className="cc-empty"><h2>Your Locker is ready.</h2><p>Finish your first creation and it will live here.</p><button className="primary" onClick={()=>setStep("compass")}>START CREATING</button></div>:<div className="cc-grid">{list.map(item=><article className="cc-tile" key={item.id}><small>{item.status}</small><span className="cc-icon">📘</span><h3>{item.title}</h3><p>{item.format} · {item.progress}% complete</p><button onClick={()=>resume(item)}>{item.status==="COMPLETE"?"OPEN":"CONTINUE"}</button></article>)}</div>}</section></main>;
  }

  if (!creation) return null;

  if (step === "complete") {
    return <main className="cc-shell cc-focus"><section className="cc-complete"><div className="cc-cap giant">🎓</div><span className="cc-eyebrow">FIRST CREATION</span><h1>YOU MADE IT.</h1><h2>{creation.title}</h2><p>{creation.format} · Creation complete</p><div className="cc-actions"><button className="primary" onClick={()=>setStep("locker")}>SAVE TO MY CREATOR LOCKER</button><button className="secondary" onClick={()=>{const copy={...creation,id:`cc-${Date.now()}`,title:`${creation.title} — New Version`,status:"BUILDING" as const,step:"idea" as Step,progress:10};setCreation(copy);setStep("idea")}}>MAKE ANOTHER LIKE THIS</button></div></section></main>;
  }

  const stepTitle: Record<string,string> = {idea:"START WITH SOMETHING YOU ALREADY KNOW.",audience:"WHO IS THIS FOR?",result:"WHAT SHOULD THIS HELP THEM DO?",format:"WHAT SHOULD THIS BECOME?",name:"LET’S GIVE IT A NAME.",outline:"BUILD THE STRUCTURE."};
  const currentIndex = ["idea","audience","result","format","name","outline"].indexOf(step);

  return <main className="cc-shell cc-focus"><header className="cc-builder-head"><button className="cc-back" onClick={()=>setStep("campus")}>← CAMPUS</button><div><strong>{creation.title}</strong><small>{saved?"Saved ✓":"Saving…"}</small></div></header><section className="cc-builder"><div className="cc-progress"><span style={{width:`${creation.progress}%`}}/></div><span className="cc-eyebrow">{step.toUpperCase()} · STEP {currentIndex+1} OF 6</span><h1>{stepTitle[step]}</h1>
    {step==="idea"&&<><p>What could you help somebody understand, do, plan, solve, or avoid?</p><textarea value={creation.idea} onChange={e=>patch({idea:e.target.value})} placeholder="Tell us what you know, care about, or want to share…"/><button className="primary" disabled={!creation.idea.trim()} onClick={()=>move("audience")}>USE THIS IDEA</button></>}
    {step==="audience"&&<><p>Describe the person or group this would help most.</p><input value={creation.audience} onChange={e=>patch({audience:e.target.value})} placeholder="Example: women restarting a walking routine"/><button className="primary" disabled={!creation.audience.trim()} onClick={()=>move("result")}>NEXT</button></>}
    {step==="result"&&<><p>After using this, I want them to be able to…</p><textarea value={creation.result} onChange={e=>patch({result:e.target.value})} placeholder="Example: restart a daily walking habit without feeling overwhelmed"/><button className="primary" disabled={!creation.result.trim()} onClick={()=>move("format")}>KEEP THIS RESULT</button></>}
    {step==="format"&&<><p>I’d start with a Mini Guide: easy to finish, easy to share, and flexible enough to sell or give away later.</p><div className="cc-options compact">{["Mini Guide","Checklist","Workbook","Planner","Challenge","Resource Kit"].map(f=><button key={f} className={creation.format===f?"selected":""} onClick={()=>patch({format:f})}>{f}</button>)}</div><button className="primary" onClick={()=>move("name")}>BUILD THIS FORMAT</button></>}
    {step==="name"&&<><p>Choose a clear working title. You can polish it later.</p><input value={creation.title==="Untitled Creation"?"":creation.title} onChange={e=>patch({title:e.target.value||"Untitled Creation"})} placeholder="Example: Walking Again"/><button className="primary" disabled={creation.title==="Untitled Creation"} onClick={()=>move("outline")}>USE THIS NAME</button></>}
    {step==="outline"&&<><p>One section per line. Keep the first version small enough to finish.</p><textarea className="outline" value={creation.outline.join("\n")} onChange={e=>patch({outline:e.target.value.split("\n").filter(Boolean)})} placeholder={"Welcome\nWhat You Need to Know\nStep One\nStep Two\nCommon Mistakes\nQuick Action Plan\nWhat’s Next"}/><button className="primary" disabled={creation.outline.length<3} onClick={completeCreation}>COMPLETE MY FIRST CREATION</button></>}
    <aside className="cc-coach"><span>✦</span><div><strong>CREATOR COACH</strong><p>{step==="outline"?"Start small. Finish something. You can always explode it later.":"Keep moving. The goal is a finished first version, not perfection."}</p></div></aside>
  </section></main>;
}
