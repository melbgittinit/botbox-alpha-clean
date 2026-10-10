import Link from 'next/link';
import AgentXSiteNav from '../../components/AgentXSiteNav';

export const metadata = {
  title: 'Pricing',
  description: 'Staged Agent X pricing architecture for private pilot validation.',
};

const tiers = [
  ['Individual Agent X','$99','One defined intelligence capability assigned inside the Agent X mission system.'],
  ['Ready-Made Workforce','$299','A four-agent workforce configured around a business context and Mission 001.'],
  ['Organization Workforce','Private scope','Department, permissions, data boundaries, reporting, and pilot design are scoped before activation.'],
];

export default function PricingPage(){
  return <main style={{minHeight:'100vh',background:'#05070a',color:'#f5f7fb',fontFamily:'Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
    <AgentXSiteNav/>
    <section style={{padding:'64px 18px 84px'}}><div style={{maxWidth:1040,margin:'0 auto'}}>
      <div style={{fontSize:11,fontWeight:900,letterSpacing:'.2em',color:'#79b8ff'}}>STAGED PRICE ARCHITECTURE</div>
      <h1 style={{fontSize:'clamp(44px,7vw,78px)',lineHeight:.95,letterSpacing:'-.055em',margin:'14px 0'}}>Price the intelligence after we prove the value.</h1>
      <p style={{maxWidth:760,color:'#aebed0',fontSize:18,lineHeight:1.6}}>These are the current private-build price points, not a final public promise. Pilot evidence will determine whether usage, deliverables, workforce depth, and organization requirements justify changes before launch.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:14,marginTop:30}}>
        {tiers.map(([name,price,copy])=><article key={name} style={{border:'1px solid rgba(121,184,255,.18)',borderRadius:22,padding:22,background:'linear-gradient(180deg,rgba(17,27,41,.96),rgba(7,11,18,.99))'}}>
          <div style={{fontSize:10,fontWeight:900,letterSpacing:'.13em',color:'#79b8ff'}}>PRIVATE BUILD</div>
          <h2 style={{fontSize:25,letterSpacing:'-.03em',margin:'10px 0 5px'}}>{name}</h2>
          <div style={{fontSize:34,fontWeight:950,letterSpacing:'-.04em'}}>{price}</div>
          <p style={{color:'#98a9bd',lineHeight:1.55}}>{copy}</p>
        </article>)}
      </div>
      <section style={{marginTop:22,padding:20,borderRadius:20,border:'1px solid rgba(255,217,140,.16)',background:'rgba(255,217,140,.04)'}}>
        <strong style={{color:'#ffd98c'}}>No public checkout yet.</strong>
        <p style={{color:'#aab7c6',lineHeight:1.55,margin:'7px 0 0'}}>The standalone Shopify property will become the commerce layer once it is claimed and configured. Until then, these values remain staged and no Agent X product is being publicly sold from this site.</p>
      </section>
      <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:22}}>
        <Link href="/#build-my-team" style={{display:'inline-flex',minHeight:48,alignItems:'center',padding:'0 17px',borderRadius:999,textDecoration:'none',background:'#eef6ff',color:'#07111d',fontWeight:900,fontSize:12}}>BUILD MY TEAM</Link>
        <Link href="/pilot" style={{display:'inline-flex',minHeight:48,alignItems:'center',padding:'0 17px',borderRadius:999,textDecoration:'none',border:'1px solid rgba(255,255,255,.13)',color:'#dbe7f4',fontWeight:900,fontSize:12}}>VIEW PILOT</Link>
      </div>
    </div></section>
  </main>;
}
