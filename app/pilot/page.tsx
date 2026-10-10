import AgentXSiteNav from '../../components/AgentXSiteNav';

export const metadata = { title: 'Private Pilot', description: 'Agent X controlled pilot and pricing validation.' };

export default function PilotPage(){
 const groups=[['Beauty',3],['Restaurant',2],['Small Business',2],['Creator',2],['Organization',1]];
 return <main style={{minHeight:'100vh',background:'#05070a',color:'#f5f7fb',fontFamily:'Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
  <AgentXSiteNav/>
  <section style={{padding:'64px 18px 80px'}}><div style={{maxWidth:1000,margin:'0 auto'}}>
   <div style={{fontSize:11,fontWeight:900,letterSpacing:'.2em',color:'#79b8ff'}}>PRIVATE PILOT · STAGED</div>
   <h1 style={{fontSize:'clamp(44px,7vw,76px)',lineHeight:.95,letterSpacing:'-.055em',margin:'14px 0'}}>Prove value before broad launch.</h1>
   <p style={{maxWidth:760,color:'#aebed0',fontSize:18,lineHeight:1.6}}>Agent X is not being rushed into a public price-and-promotion cycle. The private pilot is designed to test whether the workforce, mission, prepared action, and outcome loop creates repeatable business value.</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:10,marginTop:28}}>
    {groups.map(([label,count])=><div key={String(label)} style={{padding:16,borderRadius:16,border:'1px solid rgba(121,184,255,.15)',background:'#09111b'}}><div style={{fontSize:34,fontWeight:950}}>{count}</div><div style={{fontSize:12,color:'#8fa0b5'}}>{label as string}</div></div>)}
   </div>
   <section style={{marginTop:22,border:'1px solid rgba(255,255,255,.07)',borderRadius:20,padding:20,background:'#08101a'}}>
    <h2 style={{fontSize:28,letterSpacing:'-.03em',margin:'0 0 12px'}}>What we measure</h2>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>{['Activation completion','Mission approval','Prepared action usefulness','Outcome recorded','Understanding','Ease','Trust','Value','Mission success','Repeat mission intent'].map(x=><div key={x} style={{padding:'10px 12px',borderRadius:11,background:'#0b121c',fontSize:13,color:'#b8c5d5'}}>✓ {x}</div>)}</div>
   </section>
   <section style={{marginTop:18,border:'1px solid rgba(255,217,140,.16)',borderRadius:18,padding:18,background:'rgba(255,217,140,.04)'}}>
    <strong style={{color:'#ffd98c'}}>Pricing status</strong>
    <p style={{margin:'7px 0 0',color:'#aab7c6',lineHeight:1.55}}>Public pricing is intentionally not locked on this standalone site yet. The private pilot will test willingness to pay, value delivered, usage intensity, and where individual-agent versus workforce pricing belongs before public introduction.</p>
   </section>
  </div></section>
 </main>;
}
