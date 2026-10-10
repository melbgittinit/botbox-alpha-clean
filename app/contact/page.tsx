export const metadata = {
  title: "Organization Workforce",
  description: "Private organization and executive workforce introduction for Agent X.",
};

export default function AgentXContactPage() {
  return (
    <main style={{
      minHeight:'100vh',
      background:'#05070a',
      color:'#f5f7fb',
      fontFamily:'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      padding:'max(52px, calc(34px + env(safe-area-inset-top))) 20px 72px'
    }}>
      <div style={{maxWidth:920,margin:'0 auto'}}>
        <div style={{fontSize:11,fontWeight:900,letterSpacing:'.22em',color:'#79b8ff'}}>
          AGENT X · ORGANIZATION WORKFORCE
        </div>
        <h1 style={{
          fontSize:'clamp(44px,8vw,82px)',
          lineHeight:.94,
          letterSpacing:'-.055em',
          margin:'16px 0 14px'
        }}>
          Build the workforce around the organization.
        </h1>
        <p style={{fontSize:18,lineHeight:1.6,color:'#aebed0',maxWidth:760}}>
          Executive and organization deployments can involve multiple departments, permissions,
          data boundaries, approval paths, reporting needs, and staged autonomy. Agent X does not
          force those needs into a small-business template.
        </p>

        <section style={{
          marginTop:28,
          border:'1px solid rgba(121,184,255,.20)',
          borderRadius:22,
          padding:22,
          background:'linear-gradient(180deg,rgba(18,27,40,.96),rgba(7,11,18,.98))'
        }}>
          <div style={{fontSize:11,fontWeight:900,letterSpacing:'.14em',color:'#79b8ff'}}>
            PRIVATE INTRODUCTION PATH · IN BUILD
          </div>
          <h2 style={{fontSize:30,letterSpacing:'-.03em',margin:'10px 0 10px'}}>
            What we scope before activation
          </h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>
            {[
              ['Departments','Where Agent X should help—and where it should not.'],
              ['Permissions','Recommend, prepare, execute with approval, or managed autonomy.'],
              ['Data Boundaries','What information may be used and what remains restricted.'],
              ['Human Gates','Who approves missions, actions, external use, and escalation.'],
              ['Reporting','What leadership needs to see, how often, and at what level.'],
              ['Pilot Design','Start small, prove value, learn, then expand deliberately.'],
            ].map(([title,copy]) => (
              <div key={title} style={{padding:15,borderRadius:14,background:'#0b121c',border:'1px solid rgba(255,255,255,.06)'}}>
                <strong>{title}</strong>
                <div style={{fontSize:13,lineHeight:1.5,color:'#8fa0b5',marginTop:6}}>{copy}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{
          marginTop:18,
          padding:18,
          borderRadius:18,
          border:'1px solid rgba(255,217,140,.16)',
          background:'rgba(255,217,140,.04)'
        }}>
          <strong style={{color:'#ffd98c'}}>Staging note</strong>
          <div style={{fontSize:13,lineHeight:1.55,color:'#aab7c6',marginTop:6}}>
            This organization path is being built before public introduction. No live sales,
            public onboarding, or autonomous external actions are enabled from this page.
          </div>
        </section>

        <a href="/" style={{
          display:'inline-flex',
          minHeight:48,
          alignItems:'center',
          justifyContent:'center',
          marginTop:22,
          padding:'0 17px',
          borderRadius:999,
          textDecoration:'none',
          background:'#eef6ff',
          color:'#07111d',
          fontWeight:900,
          fontSize:12,
          letterSpacing:'.05em'
        }}>
          RETURN TO AGENT X
        </a>
      </div>
    </main>
  );
}
