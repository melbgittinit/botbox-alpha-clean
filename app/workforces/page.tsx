import Link from 'next/link';
import AgentXSiteNav from '../../components/AgentXSiteNav';

export const metadata = { title: 'Workforces', description: 'Ready-made Agent X workforce configurations.' };

const workforces = [
  ['Small Business X','Your first AI department.',['Executive Assistant X','Marketing X','Customer Experience X','Operations X']],
  ['Beauty Business X','Your talent built the business. Agent X builds the system behind it.',['Marketing X','Customer Experience X','Operations X','Executive Assistant X']],
  ['Restaurant X','Great food deserves great systems.',['Marketing X','Customer Experience X','Operations X','Research X']],
  ['Creator Business X','Your creativity deserves a company.',['Executive Assistant X','Marketing X','Research X','Operations X']],
];

export default function WorkforcesPage(){
  return <main style={{minHeight:'100vh',background:'#05070a',color:'#f5f7fb',fontFamily:'Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
    <AgentXSiteNav/>
    <section style={{padding:'64px 18px 80px'}}><div style={{maxWidth:1120,margin:'0 auto'}}>
      <div style={{fontSize:11,fontWeight:900,letterSpacing:'.2em',color:'#79b8ff'}}>AGENT X WORKFORCES</div>
      <h1 style={{fontSize:'clamp(44px,7vw,78px)',lineHeight:.95,letterSpacing:'-.055em',margin:'14px 0'}}>Start with a team built around the business.</h1>
      <p style={{maxWidth:760,color:'#aebed0',fontSize:18,lineHeight:1.6}}>Each workforce combines defined Agent X capabilities around a practical operating context. The mission still stays human-led and permission-gated.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(245px,1fr))',gap:14,marginTop:30}}>
        {workforces.map(([name,copy,agents])=><article key={String(name)} style={{border:'1px solid rgba(121,184,255,.18)',borderRadius:22,padding:22,background:'linear-gradient(180deg,rgba(17,27,41,.96),rgba(7,11,18,.99))'}}>
          <div style={{fontSize:10,fontWeight:900,letterSpacing:'.14em',color:'#79b8ff'}}>WORKFORCE</div>
          <h2 style={{fontSize:28,letterSpacing:'-.035em',margin:'10px 0 8px'}}>{name as string}</h2>
          <p style={{color:'#9eafc2',lineHeight:1.55}}>{copy as string}</p>
          <div style={{display:'grid',gap:7,marginTop:16}}>{(agents as string[]).map(agent=><div key={agent} style={{fontSize:13,color:'#c4d1df',padding:'9px 10px',borderRadius:10,background:'#0b121c'}}>• {agent}</div>)}</div>
        </article>)}
      </div>
      <div style={{marginTop:28}}><Link href="/#build-my-team" style={{display:'inline-flex',minHeight:48,alignItems:'center',padding:'0 17px',borderRadius:999,textDecoration:'none',background:'#eef6ff',color:'#07111d',fontWeight:900,fontSize:12}}>BUILD MY TEAM</Link></div>
    </div></section>
  </main>;
}
