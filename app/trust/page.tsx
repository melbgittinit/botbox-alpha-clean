import AgentXSiteNav from '../../components/AgentXSiteNav';

export const metadata = { title: 'Trust & Security', description: 'Human control, permissions, and data responsibility in Agent X.' };

export default function TrustPage(){
 const pillars=[
  ['Human Leadership','People define the mission, approve critical steps, and remain accountable for decisions.'],
  ['Clear Purpose','Every agent and mission should have a stated business objective and success definition.'],
  ['Visible Permissions','Recommend → Prepare → Execute with Approval → Managed Autonomy. Permissions do not silently advance.'],
  ['Customer Control','Work can be paused, reviewed, redirected, or stopped.'],
  ['Responsible Recommendations','Agent X presents assumptions, evidence limits, risks, and next steps for human judgment.'],
  ['Data Responsibility','Collect less. Protect more. Respect organization and customer boundaries.'],
 ];
 return <main style={{minHeight:'100vh',background:'#05070a',color:'#f5f7fb',fontFamily:'Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
  <AgentXSiteNav/>
  <section style={{padding:'64px 18px 80px'}}><div style={{maxWidth:1040,margin:'0 auto'}}>
   <div style={{fontSize:11,fontWeight:900,letterSpacing:'.2em',color:'#79b8ff'}}>INTELLIGENCE WITH ACCOUNTABILITY</div>
   <h1 style={{fontSize:'clamp(44px,7vw,76px)',lineHeight:.95,letterSpacing:'-.055em',margin:'14px 0'}}>Power should come with controls.</h1>
   <p style={{maxWidth:760,color:'#aebed0',fontSize:18,lineHeight:1.6}}>Agent X is being built as a human-led operating system for AI work—not as an excuse to remove judgment, accountability, or review.</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:14,marginTop:30}}>
    {pillars.map(([title,copy])=><article key={title} style={{border:'1px solid rgba(255,255,255,.07)',borderRadius:20,padding:20,background:'#08101a'}}><h2 style={{fontSize:22,margin:'0 0 8px'}}>{title}</h2><p style={{color:'#91a2b6',lineHeight:1.6,margin:0}}>{copy}</p></article>)}
   </div>
   <section style={{marginTop:24,border:'1px solid rgba(121,184,255,.18)',borderRadius:20,padding:20,background:'#0a121d'}}>
    <div style={{fontSize:11,fontWeight:900,letterSpacing:'.14em',color:'#79b8ff'}}>CURRENT PRIVATE-BUILD SECURITY POSTURE</div>
    <p style={{color:'#aab8c9',lineHeight:1.6}}>Command Center access is workspace-bound, mission and action changes pass through server-side controls, and the commerce bridges are no longer anonymously executable. Public-launch authentication, tenant isolation, audit review, and final security testing remain launch gates—not marketing claims.</p>
   </section>
  </div></section>
 </main>;
}
