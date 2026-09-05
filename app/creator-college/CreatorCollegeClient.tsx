"use client";

import { useEffect, useMemo, useState } from "react";

type Step =
  | "campus"
  | "compass"
  | "idea"
  | "audience"
  | "result"
  | "format"
  | "name"
  | "outline"
  | "content"
  | "design"
  | "review"
  | "use_mode"
  | "complete"
  | "locker";

type ProductSection = { title: string; body: string };

type Creation = {
  id: string;
  title: string;
  subtitle: string;
  idea: string;
  audience: string;
  result: string;
  format: string;
  outline: string[];
  sections: ProductSection[];
  style: string;
  useMode: string;
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

const buildSteps: Step[] = ["idea", "audience", "result", "format", "name", "outline", "content", "design", "review", "use_mode"];
const progressByStep: Record<Step, number> = {
  campus: 0,
  compass: 0,
  idea: 8,
  audience: 16,
  result: 25,
  format: 34,
  name: 43,
  outline: 55,
  content: 70,
  design: 82,
  review: 90,
  use_mode: 96,
  complete: 100,
  locker: 100,
};

function newCreation(): Creation {
  return {
    id: `cc-${Date.now()}`,
    title: "Untitled Creation",
    subtitle: "",
    idea: "",
    audience: "",
    result: "",
    format: "Mini Guide",
    outline: [],
    sections: [],
    style: "Clean",
    useMode: "Keep it for me",
    step: "idea",
    progress: 8,
    status: "BUILDING",
    updatedAt: new Date().toISOString(),
  };
}

function normalizeCreation(raw: Partial<Creation>): Creation {
  return {
    ...newCreation(),
    ...raw,
    subtitle: raw.subtitle ?? "",
    outline: raw.outline ?? [],
    sections: raw.sections ?? (raw.outline ?? []).map((title) => ({ title, body: "" })),
    style: raw.style ?? "Clean",
    useMode: raw.useMode ?? "Keep it for me",
  };
}

function coachDraft(section: string, creation: Creation) {
  return `${section} is where we make “${creation.title}” practical for ${creation.audience || "the people you want to help"}. Start with the most useful point, explain it in plain language, and give the reader one small action they can take right away. Keep the focus on this result: ${creation.result || "help them move forward with confidence"}.`;
}

function improveText(text: string, mode: "shorter" | "warmer" | "stronger") {
  if (!text.trim()) return text;
  if (mode === "shorter") return text.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ");
  if (mode === "warmer") return `You can do this one step at a time. ${text}`;
  return `${text}\n\nNext move: choose one action and do it today.`;
}

export default function CreatorCollegeClient() {
  const [step, setStep] = useState<Step>("campus");
  const [compassIndex, setCompassIndex] = useState(0);
  const [compassAnswers, setCompassAnswers] = useState<Record<string, string>>({});
  const [creation, setCreation] = useState<Creation | null>(null);
  const [creations, setCreations] = useState<Creation[]>([]);
  const [saved, setSaved] = useState(true);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as Partial<Creation>[];
    const list = raw.map(normalizeCreation);
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
    setActiveSection(0);
    setStep("idea");
  }

  function resume(item: Creation) {
    setCreation(normalizeCreation(item));
    setActiveSection(0);
    setStep(item.step === "complete" ? "complete" : item.step);
  }

  function completeCreation() {
    if (!creation) return;
    const finished = { ...creation, step: "complete" as Step, progress: 100, status: "COMPLETE" as const, updatedAt: new Date().toISOString() };
    setCreation(finished);
    setStep("complete");
  }

  function buildSections() {
    if (!creation) return;
    const sections = creation.outline.filter(Boolean).map((title, index) => ({
      title,
      body: creation.sections[index]?.body ?? "",
    }));
    patch({ sections });
    setActiveSection(0);
    move("content");
  }

  function updateSection(index: number, next: Partial<ProductSection>) {
    if (!creation) return;
    const sections = creation.sections.map((section, idx) => idx === index ? { ...section, ...next } : section);
    patch({ sections });
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
    if (compassIndex === compassQuestions.length) return <main className="cc-shell cc-focus"><button className="cc-back" onClick={() => {setCompassIndex(0); setStep("campus")}}>← CAMPUS</button><section className="cc-result"><span className="cc-eyebrow">CREATOR COMPASS</span><h1>WE FOUND 3 GOOD STARTS FOR YOU.</h1><div className="cc-grid result-grid">{[["BEST MATCH","📘","MAKE A DIGITAL PRODUCT","Turn something you know into a useful mini guide."],["FAST START","🎥","CREATE A 5-VIDEO SERIES","Turn one idea into five short pieces of content."],["CREATE TO EARN","💼","BUILD A SIMPLE SERVICE OFFER","Package a skill into an offer someone can use."]].map(([tag,icon,title,copy],idx)=><article className="cc-tile" key={title}><small>{tag}</small><span className="cc-icon">{icon}</span><h3>{title}</h3><p>{copy}</p><button onClick={idx===0?startDigitalProduct:()=>alert("This starter lane is queued after the Digital Product Builder.")}>BUILD THIS</button></article>)}</div></section></main>;
    return <main className="cc-shell cc-focus"><button className="cc-back" onClick={() => setStep("campus")}>← CAMPUS</button><section className="cc-question"><div className="cc-progress"><span style={{width:`${((compassIndex+1)/compassQuestions.length)*100}%`}}/></div><span className="cc-eyebrow">CREATOR COMPASS · {compassIndex+1} OF {compassQuestions.length}</span><h1>{q.title}</h1><div className="cc-options">{q.options.map((option)=><button key={String(option)} className={compassAnswers[q.key]===String(option)?"selected":""} onClick={()=>setCompassAnswers({...compassAnswers,[q.key]:String(option)})}>{option}</button>)}</div><button className="primary" disabled={!compassAnswers[q.key]} onClick={()=>setCompassIndex(compassIndex+1)}>{compassIndex===compassQuestions.length-1?"SHOW ME WHAT I CAN MAKE":"NEXT"}</button></section></main>;
  }

  if (step === "locker") {
    const list = creations.length ? creations : creation ? [creation] : [];
    return <main className="cc-shell"><header className="cc-topbar"><button onClick={()=>setStep("campus")}>← CAMPUS</button><div className="cc-brandmark"><strong>MY CREATOR LOCKER</strong></div></header><section className="cc-section"><div className="cc-section-head"><div><span className="cc-eyebrow">YOUR BODY OF WORK</span><h1>WHAT YOU’VE BUILT</h1></div></div>{list.length===0?<div className="cc-empty"><h2>Your Locker is ready.</h2><p>Finish your first creation and it will live here.</p><button className="primary" onClick={()=>setStep("compass")}>START CREATING</button></div>:<div className="cc-grid">{list.map(item=><article className="cc-tile" key={item.id}><small>{item.status}</small><span className="cc-icon">📘</span><h3>{item.title}</h3><p>{item.format} · {item.progress}% complete</p><button onClick={()=>resume(item)}>{item.status==="COMPLETE"?"OPEN":"CONTINUE"}</button></article>)}</div>}</section></main>;
  }

  if (!creation) return null;

  if (step === "complete") {
    return <main className="cc-shell cc-focus"><section className="cc-complete"><div className="cc-cap giant">🎓</div><span className="cc-eyebrow">CREATION COMPLETE</span><h1>YOU MADE IT.</h1><div className={`cc-product-preview style-${creation.style.toLowerCase()}`}><small>{creation.format}</small><h2>{creation.title}</h2><p>{creation.subtitle || creation.result}</p><span>Created for {creation.audience}</span></div><p><b>{creation.useMode}</b> · {creation.sections.length} sections · {creation.style} style</p><div className="cc-actions"><button className="primary" onClick={()=>setStep("locker")}>SAVE TO MY CREATOR LOCKER</button><button className="secondary" onClick={()=>window.print()}>PRINT / SAVE AS PDF</button><button className="secondary" onClick={()=>{const copy={...creation,id:`cc-${Date.now()}`,title:`${creation.title} — New Version`,status:"BUILDING" as const,step:"idea" as Step,progress:8};setCreation(copy);setStep("idea")}}>MAKE ANOTHER LIKE THIS</button></div></section></main>;
  }

  const stepTitle: Record<string,string> = {
    idea:"START WITH SOMETHING YOU ALREADY KNOW.",
    audience:"WHO IS THIS FOR?",
    result:"WHAT SHOULD THIS HELP THEM DO?",
    format:"WHAT SHOULD THIS BECOME?",
    name:"LET’S GIVE IT A NAME.",
    outline:"BUILD THE STRUCTURE.",
    content:"WRITE THE REAL THING.",
    design:"MAKE IT LOOK FINISHED.",
    review:"CHECK IT BEFORE YOU FINISH.",
    use_mode:"WHAT DO YOU WANT THIS TO DO?",
  };
  const currentIndex = buildSteps.indexOf(step);

  return <main className="cc-shell cc-focus"><header className="cc-builder-head"><button className="cc-back" onClick={()=>setStep("campus")}>← CAMPUS</button><div><strong>{creation.title}</strong><small>{saved?"Saved ✓":"Saving…"}</small></div></header><section className="cc-builder"><div className="cc-progress"><span style={{width:`${creation.progress}%`}}/></div><span className="cc-eyebrow">{step.replace("_"," ").toUpperCase()} · STEP {currentIndex+1} OF {buildSteps.length}</span><h1>{stepTitle[step]}</h1>
    {step==="idea"&&<><p>What could you help somebody understand, do, plan, solve, or avoid?</p><textarea value={creation.idea} onChange={e=>patch({idea:e.target.value})} placeholder="Tell us what you know, care about, or want to share…"/><button className="primary" disabled={!creation.idea.trim()} onClick={()=>move("audience")}>USE THIS IDEA</button></>}
    {step==="audience"&&<><p>Describe the person or group this would help most.</p><input value={creation.audience} onChange={e=>patch({audience:e.target.value})} placeholder="Example: women restarting a walking routine"/><button className="primary" disabled={!creation.audience.trim()} onClick={()=>move("result")}>NEXT</button></>}
    {step==="result"&&<><p>After using this, I want them to be able to…</p><textarea value={creation.result} onChange={e=>patch({result:e.target.value})} placeholder="Example: restart a daily walking habit without feeling overwhelmed"/><button className="primary" disabled={!creation.result.trim()} onClick={()=>move("format")}>KEEP THIS RESULT</button></>}
    {step==="format"&&<><p>I’d start with a Mini Guide: easy to finish, easy to share, and flexible enough to sell or give away later.</p><div className="cc-options compact">{["Mini Guide","Checklist","Workbook","Planner","Challenge","Resource Kit"].map(f=><button key={f} className={creation.format===f?"selected":""} onClick={()=>patch({format:f})}>{f}</button>)}</div><button className="primary" onClick={()=>move("name")}>BUILD THIS FORMAT</button></>}
    {step==="name"&&<><p>Choose a clear working title and optional subtitle.</p><input value={creation.title==="Untitled Creation"?"":creation.title} onChange={e=>patch({title:e.target.value||"Untitled Creation"})} placeholder="Example: Walking Again"/><input value={creation.subtitle} onChange={e=>patch({subtitle:e.target.value})} placeholder="Optional subtitle: A gentle 7-day restart"/><button className="primary" disabled={creation.title==="Untitled Creation"} onClick={()=>move("outline")}>USE THIS NAME</button></>}
    {step==="outline"&&<><p>One section per line. Keep the first version small enough to finish.</p><textarea className="outline" value={creation.outline.join("\n")} onChange={e=>patch({outline:e.target.value.split("\n").map(v=>v.trim()).filter(Boolean)})} placeholder={"Welcome\nWhat You Need to Know\nStep One\nStep Two\nCommon Mistakes\nQuick Action Plan\nWhat’s Next"}/><div className="cc-inline-actions"><button className="secondary" onClick={()=>patch({outline:["Welcome","What You Need to Know","Your First Step","The Better Way","Common Mistakes","Quick Action Plan","What’s Next"]})}>COACH: BUILD MY OUTLINE</button><button className="primary" disabled={creation.outline.length<3} onClick={buildSections}>WRITE MY PRODUCT</button></div></>}
    {step==="content"&&<><p>Write it yourself or let Creator Coach give you a strong first draft. You stay in control.</p><div className="cc-section-tabs">{creation.sections.map((s,idx)=><button key={`${s.title}-${idx}`} className={activeSection===idx?"selected":""} onClick={()=>setActiveSection(idx)}>{idx+1}. {s.title}</button>)}</div>{creation.sections[activeSection]&&<div className="cc-editor"><input value={creation.sections[activeSection].title} onChange={e=>updateSection(activeSection,{title:e.target.value})}/><textarea value={creation.sections[activeSection].body} onChange={e=>updateSection(activeSection,{body:e.target.value})} placeholder="Write here, or use Creator Coach for a first draft…"/><div className="cc-coach-actions"><button onClick={()=>updateSection(activeSection,{body:coachDraft(creation.sections[activeSection].title,creation)})}>COACH DRAFT</button><button onClick={()=>updateSection(activeSection,{body:improveText(creation.sections[activeSection].body,"shorter")})}>SHORTEN</button><button onClick={()=>updateSection(activeSection,{body:improveText(creation.sections[activeSection].body,"warmer")})}>WARMER</button><button onClick={()=>updateSection(activeSection,{body:improveText(creation.sections[activeSection].body,"stronger")})}>STRONGER</button></div></div>}<button className="primary" disabled={creation.sections.some(s=>!s.body.trim())} onClick={()=>move("design")}>MY CONTENT IS READY</button></>}
    {step==="design"&&<><p>Choose a polished direction. V1 keeps the design simple so you can finish instead of fiddling forever.</p><div className="cc-style-grid">{["Clean","Bold","Elegant","Warm","Modern","Faith"].map(style=><button key={style} className={`cc-style-card ${creation.style===style?"selected":""}`} onClick={()=>patch({style})}><span className={`cc-style-swatch style-${style.toLowerCase()}`}></span><b>{style}</b><small>Preview direction</small></button>)}</div><div className={`cc-product-preview style-${creation.style.toLowerCase()}`}><small>{creation.format}</small><h2>{creation.title}</h2><p>{creation.subtitle || creation.result}</p><span>For {creation.audience}</span></div><button className="primary" onClick={()=>move("review")}>USE THIS LOOK</button></>}
    {step==="review"&&<><p>Creator Coach checks the essentials before you finish.</p><div className="cc-review-list"><div><span>✓</span><b>Clear audience</b><small>{creation.audience}</small></div><div><span>✓</span><b>Useful promise</b><small>{creation.result}</small></div><div><span>{creation.sections.every(s=>s.body.trim())?"✓":"!"}</span><b>Complete sections</b><small>{creation.sections.filter(s=>s.body.trim()).length} of {creation.sections.length} written</small></div><div><span>✓</span><b>Visual direction</b><small>{creation.style}</small></div></div><button className="primary" disabled={!creation.sections.every(s=>s.body.trim())} onClick={()=>move("use_mode")}>READY TO FINISH</button></>}
    {step==="use_mode"&&<><p>Your creation does not have to become a business. Pick what you want it to do now.</p><div className="cc-options">{["Keep it for me","Share it","Give it away","Build my audience","Sell it","Use with my group","Create for a client"].map(mode=><button key={mode} className={creation.useMode===mode?"selected":""} onClick={()=>patch({useMode:mode})}>{mode}</button>)}</div><button className="primary" onClick={completeCreation}>COMPLETE MY CREATION</button></>}
    <div className="cc-coach"><span>✦</span><div><b>CREATOR COACH</b><p>{step==="content"?"Finish one section at a time. Useful beats perfect.":"Start small. Finish something. Then elevate it."}</p></div></div>
  </section></main>;
}
