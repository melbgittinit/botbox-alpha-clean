'use client';

import { FormEvent, useMemo, useState } from 'react';

type ActivationData = {
  organization: { id: string; name: string };
  workforce: { id: string; recommendation_id: string; name: string; agents: { id: string; name: string; category: string }[] };
  mission: { id: string; template_id: string; name: string; objective: string; status: string; human_review_required: boolean };
  report: { id: string; title: string };
};

const fieldStyle = {
  width: '100%', borderRadius: 12, border: '1px solid rgba(121,184,255,.24)',
  background: '#0d1420', color: '#fff', padding: '13px 14px', fontSize: 16,
  boxSizing: 'border-box' as const,
};

export default function AgentXPage() {
  const [form, setForm] = useState({
    firstName: '', email: '', businessName: '', role: 'business', industry: 'small_business', mission: 'organize', challenge: 'need_systems'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activation, setActivation] = useState<ActivationData | null>(null);

  const card = useMemo(() => ({
    border: '1px solid rgba(90,170,255,.22)',
    background: 'linear-gradient(180deg, rgba(18,27,40,.96), rgba(7,11,18,.98))',
    borderRadius: 22, padding: 24, boxShadow: '0 18px 60px rgba(0,0,0,.28)'
  } as const), []);

  const button = {
    display: 'inline-block', padding: '14px 20px', borderRadius: 999,
    textDecoration: 'none', fontWeight: 800, letterSpacing: '.03em'
  } as const;

  const change = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setError(''); setActivation(null);
    try {
      const res = await fetch('/api/agent-x/activate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      const payload = await res.json();
      if (!res.ok || !payload?.ok) throw new Error(payload?.error || 'Activation failed');
      setActivation(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Activation failed');
    } finally { setLoading(false); }
  }

  return <main style={{minHeight:'100vh',background:'#05070a',color:'#f5f7fb',fontFamily:'Arial,Helvetica,sans-serif'}}>
    <section style={{padding:'76px 24px 56px',background:'radial-gradient(circle at 78% 25%,rgba(20,120,255,.23),transparent 36%),linear-gradient(180deg,#06090e,#0a111b)'}}>
      <div style={{maxWidth:1180,margin:'0 auto'}}>
        <div style={{fontSize:13,fontWeight:800,letterSpacing:'.26em',color:'#79b8ff'}}>THE BOT STORES · PREMIUM AI WORKFORCE</div>
        <h1 style={{fontSize:'clamp(56px,10vw,118px)',lineHeight:.9,margin:'24px 0 12px',letterSpacing:'-.055em'}}>AGENT X</h1>
        <div style={{fontSize:'clamp(28px,4vw,52px)',fontWeight:800,letterSpacing:'-.035em'}}>Hire Intelligence.</div>
        <p style={{fontSize:20,lineHeight:1.55,maxWidth:760,color:'#c4cedb',marginTop:22}}>Build an AI workforce around the mission you need accomplished—with clear roles, human approvals, mission tracking, and useful reports.</p>
        <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:30}}>
          <a href="#build-my-team" style={{...button,background:'#eef6ff',color:'#07111d'}}>BUILD MY TEAM</a>
          <a href="#agents" style={{...button,border:'1px solid rgba(255,255,255,.2)',color:'#fff'}}>EXPLORE AGENTS</a>
        </div>
        <div style={{marginTop:22,fontSize:14,color:'#8fa0b5'}}>Human leadership. Intelligent capability.</div>
      </div>
    </section>

    <section id="agents" style={{padding:'54px 24px'}}><div style={{maxWidth:1180,margin:'0 auto'}}>
      <div style={{fontSize:13,fontWeight:800,letterSpacing:'.2em',color:'#79b8ff'}}>THE FOUNDING SIX</div>
      <h2 style={{fontSize:'clamp(34px,5vw,60px)',margin:'12px 0 28px',letterSpacing:'-.035em'}}>Start with capability, not more software.</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16}}>
        {[
          ['Executive Assistant X','Leadership Intelligence'],['Marketing X','Growth Intelligence'],['Sales X','Opportunity Intelligence'],
          ['Customer Experience X','Relationship Intelligence'],['Operations X','Systems Intelligence'],['Research X','Market Intelligence']
        ].map(([name,type]) => <article key={name} style={card}><div style={{fontSize:12,fontWeight:800,letterSpacing:'.14em',color:'#79b8ff'}}>{type}</div><h3 style={{fontSize:25,margin:'12px 0 0'}}>{name}</h3></article>)}
      </div>
    </div></section>

    <section style={{padding:'18px 24px 58px'}}><div style={{maxWidth:1180,margin:'0 auto'}}>
      <div style={{fontSize:13,fontWeight:800,letterSpacing:'.2em',color:'#79b8ff'}}>READY-MADE WORKFORCES</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(245px,1fr))',gap:16,marginTop:18}}>
        {[
          ['Small Business X','Your first AI department.'],['Beauty Business X','Your talent built the business. Agent X builds the system behind it.'],
          ['Restaurant X','Great food deserves great systems.'],['Creator Business X','Your creativity deserves a company.']
        ].map(([name,copy]) => <article key={name} style={card}><h3 style={{fontSize:27,margin:'0 0 10px'}}>{name}</h3><p style={{color:'#aebaca',lineHeight:1.55,margin:0}}>{copy}</p></article>)}
      </div>
    </div></section>

    <section id="build-my-team" style={{padding:'62px 24px',background:'#09101a'}}><div style={{maxWidth:980,margin:'0 auto'}}>
      <div style={{fontSize:13,fontWeight:800,letterSpacing:'.2em',color:'#79b8ff'}}>BUILD MY TEAM</div>
      <h2 style={{fontSize:'clamp(36px,5vw,62px)',margin:'12px 0',letterSpacing:'-.04em'}}>What do you need accomplished?</h2>
      <p style={{fontSize:18,color:'#b6c2d1',lineHeight:1.55,maxWidth:760}}>Answer a few questions. Agent X will assemble a launch workforce and prepare Mission 001 for your review.</p>

      <form onSubmit={submit} style={{...card,marginTop:28,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16}}>
        <label><div style={{marginBottom:7,fontSize:13,color:'#9fb2ca'}}>First name</div><input value={form.firstName} onChange={e=>change('firstName',e.target.value)} style={fieldStyle}/></label>
        <label><div style={{marginBottom:7,fontSize:13,color:'#9fb2ca'}}>Email</div><input required type="email" value={form.email} onChange={e=>change('email',e.target.value)} style={fieldStyle}/></label>
        <label style={{gridColumn:'1 / -1'}}><div style={{marginBottom:7,fontSize:13,color:'#9fb2ca'}}>Business / organization name</div><input required value={form.businessName} onChange={e=>change('businessName',e.target.value)} style={fieldStyle}/></label>
        <label><div style={{marginBottom:7,fontSize:13,color:'#9fb2ca'}}>Who are you?</div><select value={form.role} onChange={e=>change('role',e.target.value)} style={fieldStyle}><option value="business">Business owner</option><option value="creator">Creator</option><option value="executive">Executive</option><option value="organization">Organization leader</option></select></label>
        <label><div style={{marginBottom:7,fontSize:13,color:'#9fb2ca'}}>Industry</div><select value={form.industry} onChange={e=>change('industry',e.target.value)} style={fieldStyle}><option value="small_business">Small business</option><option value="beauty">Beauty</option><option value="restaurant">Restaurant</option><option value="creator_business">Creator business</option><option value="other">Other</option></select></label>
        <label><div style={{marginBottom:7,fontSize:13,color:'#9fb2ca'}}>Primary mission</div><select value={form.mission} onChange={e=>change('mission',e.target.value)} style={fieldStyle}><option value="grow">Grow</option><option value="organize">Organize</option><option value="create">Create</option><option value="connect">Connect with customers</option><option value="scale">Prepare to scale</option></select></label>
        <label><div style={{marginBottom:7,fontSize:13,color:'#9fb2ca'}}>Biggest challenge</div><select value={form.challenge} onChange={e=>change('challenge',e.target.value)} style={fieldStyle}><option value="need_systems">Need better systems</option><option value="need_customers">Need more customers</option><option value="too_much_work">Too much work</option><option value="too_many_ideas">Too many ideas</option><option value="communication">Communication</option></select></label>
        <div style={{gridColumn:'1 / -1'}}><button disabled={loading} type="submit" style={{...button,border:0,cursor:'pointer',background:'#eef6ff',color:'#07111d',fontSize:15}}>{loading?'ASSEMBLING WORKFORCE…':'ASSEMBLE MY WORKFORCE'}</button></div>
        {error && <div style={{gridColumn:'1 / -1',color:'#ff9c9c'}}>We could not complete the preview activation: {error}</div>}
      </form>

      {activation && <section style={{marginTop:24,display:'grid',gap:16}}>
        <div style={{...card,border:'1px solid rgba(98,224,161,.35)'}}><div style={{fontSize:12,letterSpacing:'.18em',color:'#62e0a1',fontWeight:800}}>WORKFORCE ASSEMBLED</div><h3 style={{fontSize:34,margin:'10px 0 8px'}}>{activation.workforce.name}</h3><p style={{color:'#aebaca'}}>Prepared for {activation.organization.name}.</p><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10,marginTop:16}}>{activation.workforce.agents.map(agent=><div key={agent.id} style={{padding:14,borderRadius:12,background:'#0d1420'}}><strong>{agent.name}</strong><div style={{fontSize:13,color:'#8393a8',marginTop:5}}>{agent.category}</div></div>)}</div></div>
        <div style={card}><div style={{fontSize:12,letterSpacing:'.18em',color:'#79b8ff',fontWeight:800}}>MISSION 001 · READY FOR REVIEW</div><h3 style={{fontSize:30,margin:'10px 0'}}>{activation.mission.name}</h3><p style={{color:'#b8c5d6',lineHeight:1.55}}>{activation.mission.objective}</p><div style={{color:'#9aacbf'}}>Status: {activation.mission.status.toUpperCase()} · Human review required</div></div>
        <div style={card}><div style={{fontSize:12,letterSpacing:'.18em',color:'#79b8ff',fontWeight:800}}>FIRST REPORT CREATED</div><h3 style={{fontSize:27,margin:'10px 0'}}>{activation.report.title}</h3><p style={{color:'#aebaca'}}>Your assessment, workforce, Mission 001 and first intelligence brief are stored. Review the mission and activate it from your Command Center.</p><a href={`/agent-x/command-center?organization_id=${encodeURIComponent(activation.organization.id)}`} style={{...button,marginTop:12,background:'#79b8ff',color:'#07111d'}}>OPEN COMMAND CENTER</a></div>
      </section>}
    </div></section>
  </main>;
}
