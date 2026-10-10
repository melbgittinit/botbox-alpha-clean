import AgentXSiteNav from '../../components/AgentXSiteNav';

export const metadata = { title: 'Agents', description: 'The founding Agent X intelligence capabilities.' };

const agents = [
  ['Executive Assistant X','Leadership Intelligence','Priorities, meetings, follow-through, and idea-to-action execution.'],
  ['Marketing X','Growth Intelligence','Audience understanding, positioning, campaigns, and market-facing activity.'],
  ['Sales X','Opportunity Intelligence','Qualified opportunities, proposals, follow-up, and pipeline learning.'],
  ['Customer Experience X','Relationship Intelligence','Customer journey, service, feedback, retention, and experience improvement.'],
  ['Operations X','Systems Intelligence','Repeatable workflows, SOPs, operating routines, and efficiency improvements.'],
  ['Research X','Market Intelligence','Markets, competitors, opportunities, and relevant external information.'],
];

export default function AgentsPage(){
  return <main style={{minHeight:'100vh',background:'#05070a',color:'#f5f7fb',fontFamily:'Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
    <AgentXSiteNav/>
    <section style={{padding:'64px 18px 80px'}}><div style={{maxWidth:1120,margin:'0 auto'}}>
      <div style={{fontSize:11,fontWeight:900,letterSpacing:'.2em',color:'#79b8ff'}}>THE FOUNDING SIX</div>
      <h1 style={{fontSize:'clamp(44px,7vw,78px)',lineHeight:.95,letterSpacing:'-.055em',margin:'14px 0'}}>Capability, not another pile of software.</h1>
      <p style={{maxWidth:760,color:'#aebed0',fontSize:18,lineHeight:1.6}}>Agent X agents are defined intelligence roles that can be assembled into workforces and assigned to missions under explicit permissions.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(245px,1fr))',gap:14,marginTop:30}}>
        {agents.map(([name,category,copy],index)=><article key={name} style={{border:'1px solid rgba(121,184,255,.18)',borderRadius:22,padding:22,background:'#09111b'}}>
          <div style={{display:'flex',justifyContent:'space-between',gap:12}}><div style={{fontSize:10,fontWeight:900,letterSpacing:'.12em',color:'#79b8ff'}}>{category}</div><div style={{fontSize:11,fontWeight:900,color:'#5f738b'}}>0{index+1}</div></div>
          <h2 style={{fontSize:26,letterSpacing:'-.03em',margin:'12px 0 8px'}}>{name}</h2>
          <p style={{color:'#9eafc2',lineHeight:1.55,margin:0}}>{copy}</p>
          <div style={{fontSize:11,color:'#71859c',marginTop:16}}>Human-led · Permission-gated · Mission-assigned</div>
        </article>)}
      </div>
    </div></section>
  </main>;
}
