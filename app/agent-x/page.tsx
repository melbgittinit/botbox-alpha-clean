export default function AgentXPage() {
  const card = {
    border: '1px solid rgba(90,170,255,.22)',
    background: 'linear-gradient(180deg, rgba(18,27,40,.96), rgba(7,11,18,.98))',
    borderRadius: 22,
    padding: 24,
    boxShadow: '0 18px 60px rgba(0,0,0,.28)'
  } as const;

  const button = {
    display: 'inline-block',
    padding: '14px 20px',
    borderRadius: 999,
    textDecoration: 'none',
    fontWeight: 800,
    letterSpacing: '.03em'
  } as const;

  return (
    <main style={{minHeight:'100vh',background:'#05070a',color:'#f5f7fb',fontFamily:'Arial, Helvetica, sans-serif'}}>
      <section style={{padding:'76px 24px 56px',background:'radial-gradient(circle at 78% 25%, rgba(20,120,255,.23), transparent 36%), linear-gradient(180deg,#06090e,#0a111b)'}}>
        <div style={{maxWidth:1180,margin:'0 auto'}}>
          <div style={{fontSize:13,fontWeight:800,letterSpacing:'.26em',color:'#79b8ff'}}>THE BOT STORES · PREMIUM AI WORKFORCE</div>
          <h1 style={{fontSize:'clamp(56px,10vw,118px)',lineHeight:.9,margin:'24px 0 12px',letterSpacing:'-.055em'}}>AGENT X</h1>
          <div style={{fontSize:'clamp(28px,4vw,52px)',fontWeight:800,letterSpacing:'-.035em'}}>Hire Intelligence.</div>
          <p style={{fontSize:20,lineHeight:1.55,maxWidth:760,color:'#c4cedb',marginTop:22}}>Build an AI workforce around the mission you need accomplished — with clear roles, human approvals, mission tracking, and useful reports.</p>
          <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:30}}>
            <a href="#build-my-team" style={{...button,background:'#eef6ff',color:'#07111d'}}>BUILD MY TEAM</a>
            <a href="#agents" style={{...button,border:'1px solid rgba(255,255,255,.2)',color:'#fff'}}>EXPLORE AGENTS</a>
          </div>
          <div style={{marginTop:22,fontSize:14,color:'#8fa0b5'}}>Human leadership. Intelligent capability.</div>
        </div>
      </section>

      <section id="agents" style={{padding:'54px 24px'}}>
        <div style={{maxWidth:1180,margin:'0 auto'}}>
          <div style={{fontSize:13,fontWeight:800,letterSpacing:'.2em',color:'#79b8ff'}}>THE FOUNDING SIX</div>
          <h2 style={{fontSize:'clamp(34px,5vw,60px)',margin:'12px 0 28px',letterSpacing:'-.035em'}}>Start with capability, not more software.</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16}}>
            {[
              ['Executive Assistant X','Leadership Intelligence','Organize priorities, briefs, follow-through and executive workflow.'],
              ['Marketing X','Growth Intelligence','Turn audience, offers and campaigns into organized growth missions.'],
              ['Sales X','Opportunity Intelligence','Prepare prospects, conversations, follow-up and opportunity movement.'],
              ['Customer Experience X','Relationship Intelligence','Support retention, communication and customer experience missions.'],
              ['Operations X','Systems Intelligence','Create repeatable workflows, checkpoints and operating clarity.'],
              ['Research X','Market Intelligence','Gather, compare and synthesize useful market and business intelligence.']
            ].map(([name,type,copy]) => (
              <article key={name} style={card}>
                <div style={{fontSize:12,fontWeight:800,letterSpacing:'.14em',color:'#79b8ff'}}>{type}</div>
                <h3 style={{fontSize:25,margin:'12px 0 10px'}}>{name}</h3>
                <p style={{color:'#aebaca',lineHeight:1.55,margin:0}}>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{padding:'18px 24px 58px'}}>
        <div style={{maxWidth:1180,margin:'0 auto'}}>
          <div style={{fontSize:13,fontWeight:800,letterSpacing:'.2em',color:'#79b8ff'}}>READY-MADE WORKFORCES</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(245px,1fr))',gap:16,marginTop:18}}>
            {[
              ['Small Business X','Your first AI department.'],
              ['Beauty Business X','Your talent built the business. Agent X builds the system behind it.'],
              ['Restaurant X','Great food deserves great systems.'],
              ['Creator Business X','Your creativity deserves a company.']
            ].map(([name,copy]) => (
              <article key={name} style={card}>
                <h3 style={{fontSize:27,margin:'0 0 10px'}}>{name}</h3>
                <p style={{color:'#aebaca',lineHeight:1.55,margin:0}}>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="build-my-team" style={{padding:'62px 24px',background:'#09101a'}}>
        <div style={{maxWidth:980,margin:'0 auto'}}>
          <div style={{fontSize:13,fontWeight:800,letterSpacing:'.2em',color:'#79b8ff'}}>BUILD MY TEAM</div>
          <h2 style={{fontSize:'clamp(36px,5vw,62px)',margin:'12px 0 12px',letterSpacing:'-.04em'}}>What do you need accomplished?</h2>
          <p style={{fontSize:18,color:'#b6c2d1',lineHeight:1.55,maxWidth:760}}>Agent X begins with your mission, then recommends the workforce that fits the work.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:12,marginTop:26}}>
            {['Grow my business','Organize my business','Create something new','Improve customer experience','Prepare to scale'].map(item => (
              <div key={item} style={{...card,padding:18,fontWeight:800}}>{item}</div>
            ))}
          </div>
          <div style={{marginTop:28,padding:22,border:'1px solid rgba(121,184,255,.28)',borderRadius:18,background:'rgba(121,184,255,.07)'}}>
            <strong>Preview build:</strong> recommendation capture, customer activation, mission creation and reporting are the next live wiring steps. This preview intentionally does not claim those workflows are complete yet.
          </div>
        </div>
      </section>

      <section style={{padding:'62px 24px'}}>
        <div style={{maxWidth:980,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:18}}>
          <div style={card}><div style={{fontSize:13,color:'#79b8ff',fontWeight:800}}>MISSION</div><h3>Customer Growth Mission</h3><p style={{color:'#aebaca'}}>Define the objective, assign agents, surface approvals, track progress and produce a usable report.</p></div>
          <div style={card}><div style={{fontSize:13,color:'#79b8ff',fontWeight:800}}>CONTROL</div><h3>Human Approval</h3><p style={{color:'#aebaca'}}>Agent X recommends and prepares work while people retain authority for decisions and high-impact actions.</p></div>
          <div style={card}><div style={{fontSize:13,color:'#79b8ff',fontWeight:800}}>REPORT</div><h3>What Happened + What Next</h3><p style={{color:'#aebaca'}}>Every mission should end with a clear intelligence report and the next useful opportunity.</p></div>
        </div>
      </section>
    </main>
  );
}
