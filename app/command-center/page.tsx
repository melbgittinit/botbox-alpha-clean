import Link from 'next/link';
import AgentXSiteNav from '../../components/AgentXSiteNav';

export const metadata = { title: 'Command Center Access', description: 'Private Agent X workspace access.' };

export default function CommandCenterAccessPage(){
 return <main style={{minHeight:'100vh',background:'#05070a',color:'#f5f7fb',fontFamily:'Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
  <AgentXSiteNav/>
  <section style={{padding:'72px 18px 80px'}}><div style={{maxWidth:820,margin:'0 auto'}}>
   <div style={{fontSize:11,fontWeight:900,letterSpacing:'.2em',color:'#79b8ff'}}>AGENT X · PRIVATE WORKSPACE ACCESS</div>
   <h1 style={{fontSize:'clamp(44px,7vw,76px)',lineHeight:.95,letterSpacing:'-.055em',margin:'14px 0'}}>Command Center</h1>
   <p style={{color:'#aebed0',fontSize:18,lineHeight:1.6}}>The Command Center is not a public dashboard. Workspace access is created after an Agent X activation or verified purchase claim and is bound to that organization’s workspace.</p>
   <div style={{marginTop:24,padding:20,borderRadius:20,border:'1px solid rgba(121,184,255,.18)',background:'#09111b'}}>
    <div style={{fontSize:11,fontWeight:900,letterSpacing:'.14em',color:'#79b8ff'}}>CURRENT ACCESS MODEL</div>
    <div style={{display:'grid',gap:9,marginTop:12,color:'#b9c6d5',fontSize:13,lineHeight:1.5}}>
      <div>1. Build My Team or complete an eligible activation.</div>
      <div>2. Agent X creates the organization workspace and Mission 001.</div>
      <div>3. A signed workspace session opens the correct Command Center.</div>
      <div>4. Missions, actions, outcomes, and reports remain permission-gated.</div>
    </div>
   </div>
   <p style={{color:'#76899f',fontSize:13,lineHeight:1.55,marginTop:18}}>A conventional account sign-in is a public-launch requirement still in build. We are not presenting a fake sign-in screen before authenticated account ownership is finished.</p>
   <Link href="/#build-my-team" style={{display:'inline-flex',minHeight:48,alignItems:'center',padding:'0 17px',borderRadius:999,textDecoration:'none',background:'#eef6ff',color:'#07111d',fontWeight:900,fontSize:12,marginTop:10}}>BUILD MY TEAM</Link>
  </div></section>
 </main>;
}
