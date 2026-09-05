'use client';

import { useEffect, useMemo, useState } from 'react';

const KEY = 'ccj-open-house-v3';
const SID_KEY = 'ccj-anon-session-v1';

const schools = {
  video: 'Video & TV',
  voice: 'Voice & Podcasting',
  design: 'Design',
  stories: 'Stories',
  ai: 'AI & Digital Creation',
  business: 'Creator Business',
  ideas: 'Big Ideas'
};

const picks = [
  ['videos','🎥','Make videos',{video:3,voice:1,stories:1}],
  ['design','🎨','Draw & design',{design:3,stories:1,business:1}],
  ['invent','💡','Invent things',{ideas:3,ai:1,business:1}],
  ['stories','📚','Tell stories',{stories:3,voice:1,video:1}],
  ['tech','🧠','Build with technology',{ai:3,ideas:2}],
  ['products','🛍️','Make things people love',{business:3,design:1,ideas:1}],
  ['perform','🎙️','Talk & perform',{voice:3,video:2}],
  ['worlds','🌎','Create worlds',{stories:2,design:1,ideas:2}]
];

const blank = {
  step: 0,
  parent: '',
  email: '',
  creator: '',
  age: '8-10',
  picks: [],
  avatar: '🎥',
  styles: [],
  audience: '',
  problem: '',
  idea: '',
  name: '',
  credits: 0
};

function score(selected) {
  const result = { video:0, voice:0, design:0, stories:0, ai:0, business:0, ideas:0 };
  selected.forEach((id) => {
    const pick = picks.find((item) => item[0] === id);
    if (!pick) return;
    Object.entries(pick[3]).forEach(([key,value]) => { result[key] += value; });
  });
  return Object.entries(result).sort((a,b) => b[1]-a[1]).slice(0,3);
}

function getSessionId() {
  try {
    let id = localStorage.getItem(SID_KEY);
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem(SID_KEY,id);
    }
    return id;
  } catch {
    return 'unavailable';
  }
}

function track(event, step) {
  try {
    fetch('/api/event', {
      method: 'POST',
      headers: {'content-type':'application/json'},
      keepalive: true,
      body: JSON.stringify({ event, step, sessionId:getSessionId() })
    }).catch(()=>{});
  } catch {}
}

export default function App() {
  const [state,setState] = useState(blank);
  const [ready,setReady] = useState(false);
  const [resumed,setResumed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = {...blank,...JSON.parse(raw)};
        setState(saved);
        setResumed(saved.step > 0);
      }
    } catch {}
    setReady(true);
    track('open_house_viewed',0);
  },[]);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY,JSON.stringify(state));
  },[state,ready]);

  const mix = useMemo(() => score(state.picks),[state.picks]);
  const go = (step,event) => {
    if (event) track(event,step);
    setState((value) => ({...value,step}));
  };
  const patch = (next) => setState((value) => ({...value,...next}));
  const reset = () => {
    localStorage.removeItem(KEY);
    setState(blank);
    setResumed(false);
    track('demo_reset',0);
  };

  if (!ready) return null;

  return <main className="app"><div className="shell">
    <button className="reset" onClick={reset}>reset demo</button>
    <div className="brand">CREATOR COLLEGE<b>JUNIOR • OPEN HOUSE</b></div>
    {resumed && state.step > 0 && <div className="notice">✓ Resume My Journey — this Open House was restored from this device.</div>}
    {state.step>0 && state.step<10 && <div className="progress">{[1,2,3,4,5,6,7,8,9].map((n)=><i key={n} className={n<=state.step?'on':''}/>)}</div>}
    {state.step===0 && <Welcome go={go}/>} 
    {state.step===1 && <Adult s={state} patch={patch} go={go}/>} 
    {state.step===2 && <Creator s={state} patch={patch} go={go}/>} 
    {state.step===3 && <Quiz s={state} patch={patch} go={go}/>} 
    {state.step===4 && <Mix s={state} mix={mix} go={go}/>} 
    {state.step===5 && <ID s={state} mix={mix} patch={patch} go={go}/>} 
    {state.step===6 && <Mission s={state} patch={patch} finish={()=>{track('mission_completed',7);setState((v)=>({...v,step:7,credits:50}));}}/>} 
    {state.step===7 && <Celebrate s={state} go={go}/>} 
    {state.step===8 && <Campus s={state} go={go}/>} 
    {state.step===9 && <Parent s={state} mix={mix} go={go}/>} 
    {state.step===10 && <Schools go={go}/>} 
  </div></main>;
}

function Welcome({go}) {
  return <section className="card">
    <div className="eye">FREE CREATOR OPEN HOUSE</div>
    <h1 className="hero">Learn to Create<br/>in an AI World.</h1>
    <p className="lead">You already have ideas. Creator College Junior helps you turn them into things people can see, hear, use, and share.</p>
    <div className="schools">{Object.values(schools).map((x)=><span key={x}>{x}</span>)}</div>
    <div className="actions">
      <button className="btn primary" onClick={()=>go(1,'open_house_started')}>START MY FREE OPEN HOUSE →</button>
      <button className="btn secondary" onClick={()=>go(10,'schools_viewed')}>Explore 7 Schools</button>
    </div>
    <p className="muted">10–15 minutes • private by default • parent/grown-up check-in</p>
  </section>;
}

function Adult({s,patch,go}) {
  const ok = s.parent.trim() && /\S+@\S+\.\S+/.test(s.email);
  return <section className="card">
    <div className="eye">GROWN-UP CHECK-IN</div>
    <h1 className="title">First, a grown-up.</h1>
    <p className="lead">Young creators don’t need their own email or public account. A grown-up stays in control.</p>
    <label className="field"><b>GROWN-UP FIRST NAME</b><input className="input" value={s.parent} onChange={(e)=>patch({parent:e.target.value})}/></label>
    <label className="field"><b>GROWN-UP EMAIL</b><input className="input" type="email" value={s.email} onChange={(e)=>patch({email:e.target.value})}/></label>
    <p className="muted">Staging note: this email stays in this browser only until Supabase is connected.</p>
    <div className="actions"><button className="btn secondary" onClick={()=>go(0)}>Back</button><button className="btn primary" disabled={!ok} onClick={()=>go(2,'grownup_checkin_complete')}>Continue to Campus</button></div>
  </section>;
}

function Creator({s,patch,go}) {
  return <section className="card">
    <div className="eye">VISITING CREATOR</div>
    <h1 className="title">Who’s visiting Creator College?</h1>
    <label className="field"><b>FIRST NAME OR NICKNAME</b><input className="input" value={s.creator} onChange={(e)=>patch({creator:e.target.value})}/></label>
    <div className="grid">{['8-10','11-12'].map((age)=><button key={age} className={'choice '+(s.age===age?'on':'')} onClick={()=>patch({age})}><b>Ages {age}</b><small>Junior creator lane</small></button>)}</div>
    <button className="btn primary" disabled={!s.creator.trim()} onClick={()=>go(3,'creator_created')}>Discover My Creator Mix</button>
  </section>;
}

function Quiz({s,patch,go}) {
  function toggle(id) {
    let next = s.picks.includes(id) ? s.picks.filter((x)=>x!==id) : [...s.picks,id];
    if (next.length > 3) next = next.slice(1);
    patch({picks:next});
  }
  return <section className="card">
    <div className="eye">CREATOR QUIZ</div>
    <h1 className="title">What sounds like you?</h1>
    <p className="lead">Pick three. There are no wrong answers.</p>
    <div className="grid">{picks.map(([id,icon,label])=><button key={id} className={'choice '+(s.picks.includes(id)?'on':'')} onClick={()=>toggle(id)}><b>{icon} {label}</b><small>{s.picks.includes(id)?'Picked':'Tap to pick'}</small></button>)}</div>
    <button className="btn primary" disabled={s.picks.length!==3} onClick={()=>go(4,'quiz_completed')}>Reveal My Creator Mix</button>
  </section>;
}

function Mix({s,mix,go}) {
  return <section className="card">
    <div className="eye">YOUR CREATOR MIX</div>
    <h1 className="title">{s.creator}, look what we found.</h1>
    <p className="lead">These are starting signals, not boxes. <b>You never have to pick just one.</b></p>
    <div className="mix">{mix.map(([key,value],i)=><div key={key}><em>#{i+1}</em><b>{schools[key]}</b><p className="muted">Creator signal {value}</p></div>)}</div>
    <button className="btn primary" onClick={()=>go(5)}>Build My Creator ID</button>
  </section>;
}

function ID({s,mix,patch,go}) {
  const avatars = ['🎥','🎙️','🎨','💡','🚀','📚'];
  const styles = ['Bold','Funny','Colorful','Smart','Futuristic','Sporty','Musical','Helpful'];
  function chooseStyle(value) {
    let next = s.styles.includes(value) ? s.styles.filter((x)=>x!==value) : [...s.styles,value];
    patch({styles:next.slice(-3)});
  }
  return <section className="card">
    <div className="eye">CAMPUS PASS</div><h1 className="title">Make your Creator ID.</h1>
    <div className="pills">{avatars.map((x)=><button key={x} className={'pill '+(s.avatar===x?'on':'')} onClick={()=>patch({avatar:x})}>{x}</button>)}</div>
    <div className="pills">{styles.map((x)=><button key={x} className={'pill '+(s.styles.includes(x)?'on':'')} onClick={()=>chooseStyle(x)}>{x}</button>)}</div>
    <IdCard s={s} mix={mix}/>
    <button className="btn primary" onClick={()=>go(6,'creator_id_created')}>Start My First Creator Mission</button>
  </section>;
}

function IdCard({s,mix}) {
  return <div className="id"><small>CREATOR COLLEGE JUNIOR • OPEN HOUSE</small><div className="avatar">{s.avatar}</div><h2>{s.creator||'Visiting Creator'}</h2><p className="muted">VISITING CREATOR • Ages {s.age}</p><div className="schools">{mix.map(([key])=><span key={key}>{schools[key]}</span>)}</div></div>;
}

function Mission({s,patch,finish}) {
  const valid = s.audience && s.problem.trim() && s.idea.trim() && s.name.trim();
  return <section className="card">
    <div className="eye">FIRST CREATOR MISSION • BIG IDEAS</div>
    <h1 className="title">Invent Something That Makes Life Better.</h1>
    <p className="lead">Creators notice something that could be easier, happier, smarter, or more fun—then imagine a solution.</p>
    <div className="pills">{['Me','My Family','A Friend','Kids Like Me','Pets','Everybody'].map((x)=><button key={x} className={'pill '+(s.audience===x?'on':'')} onClick={()=>patch({audience:x})}>{x}</button>)}</div>
    <label className="field"><b>WHAT COULD BE BETTER OR MORE FUN?</b><textarea className="area" value={s.problem} onChange={(e)=>patch({problem:e.target.value})}/></label>
    <label className="field"><b>WHAT COULD YOU INVENT?</b><textarea className="area" value={s.idea} onChange={(e)=>patch({idea:e.target.value})}/></label>
    <label className="field"><b>WHAT IS IT CALLED?</b><input className="input" value={s.name} onChange={(e)=>patch({name:e.target.value})}/></label>
    <button className="btn primary" disabled={!valid} onClick={finish}>That’s My Creation!</button>
  </section>;
}

function Celebrate({s,go}) {
  return <section className="card">
    <div style={{fontSize:78}}>🎉</div><div className="eye">MISSION COMPLETE</div><h1 className="title">You made something!</h1>
    <p className="lead">{s.creator}, you noticed a problem, imagined a solution, and gave it a name. That’s creator work.</p>
    <div className="reward"><b>🏅 OPEN HOUSE CREATOR BADGE</b><span>+50 Creator Credits</span></div>
    <div className="id"><small>MY FIRST CREATOR IDEA • CREATED BY {s.creator.toUpperCase()}</small><div className="avatar">💡</div><h2>{s.name}</h2><p>{s.idea}</p><p className="muted">Made for: {s.audience}</p></div>
    <button className="btn primary" onClick={()=>go(8,'campus_viewed')}>See My Creator Campus</button>
  </section>;
}

function Campus({s,go}) {
  return <section className="card">
    <div className="eye">WELCOME TO CREATOR CAMPUS</div><h1 className="title">Welcome, {s.creator}.</h1>
    <div className="reward"><b>{s.avatar} Visiting Creator</b><span>{s.credits} Creator Credits • Creator ID + first creation saved on this device</span></div>
    <div className="campus">
      <div className="tile"><small>OPEN</small><b>Explore 7 Schools</b></div>
      <a className="tile tileLink" href="/locker" onClick={()=>track('locker_viewed',8)}><small>OPEN</small><b>My Creator Locker →</b><p>{s.name}</p></a>
      <div className="tile lock"><small>SEMESTER ONE</small><b>🎥 My First Show 🔒</b></div>
      <div className="tile lock"><small>SEMESTER ONE</small><b>🛍️ My First Product 🔒</b></div>
      <div className="tile lock"><small>SEMESTER ONE</small><b>🌎 Story World 🔒</b></div>
      <div className="tile lock"><small>SEMESTER ONE</small><b>🤖 Build With AI 🔒</b></div>
    </div>
    <button className="btn primary" onClick={()=>go(9,'parent_handoff_viewed')}>SHOW MY GROWN-UP →</button>
  </section>;
}

function Parent({s,mix,go}) {
  return <section className="card">
    <div className="eye">FOR {s.parent.toUpperCase()} • GROWN-UP</div><h1 className="title">{s.creator} just completed Open House.</h1>
    <p className="lead">They didn’t just watch something. They created something.</p>
    <div className="mix">{mix.map(([key],i)=><div key={key}><em>#{i+1}</em><b>{schools[key]}</b></div>)}</div>
    <div className="eye">SKILLS PRACTICED TODAY</div>
    <div className="skills"><div className="skill">💡 Idea development</div><div className="skill">🧩 Creative problem solving</div><div className="skill">🗣️ Explaining an idea</div><div className="skill">🏷️ Naming & positioning</div></div>
    <div className="id"><small>FIRST CREATION</small><div className="avatar">💡</div><h2>{s.name}</h2><p>{s.idea}</p></div>
    <div className="reward"><b>SEMESTER ONE • I CAN CREATE</b><span>6 missions • Creator Showcase • Digital diploma</span></div>
    <div className="tile"><small>FOUNDING STUDENT STAGING OFFER</small><h2>$19 one-time</h2><p className="muted">The Shopify product remains DRAFT until parent authentication/database staging is complete.</p></div>
    <button className="btn primary" disabled>Semester One checkout is staged</button>
    <div className="actions"><a className="btn secondary" href="/locker">View Creator Locker</a><button className="btn secondary" onClick={()=>go(8)}>Back to Campus</button></div>
  </section>;
}

function Schools({go}) {
  const icons = ['🎥','🎙️','🎨','📚','🤖','🛍️','💡'];
  return <section className="card"><div className="eye">7 SCHOOLS • 1 CREATOR YOU</div><h1 className="title">Explore what you can create.</h1><div className="campus">{Object.values(schools).map((value,i)=><div className="tile" key={value}><small>SCHOOL {i+1}</small><b>{icons[i]} {value}</b></div>)}</div><button className="btn primary" onClick={()=>go(1,'open_house_started')}>Start Free Open House</button></section>;
}
