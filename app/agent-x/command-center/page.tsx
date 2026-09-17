'use client';

import { useEffect, useState } from 'react';

type CommandCenterData = {
  organization: { id: string; name: string; industry: string };
  workforce: {
    id: string; name: string; status: string;
    agents: { id: string; name: string; category: string; permission_level: string; status: string }[];
  } | null;
  missions: { id: string; name: string; objective: string; status: string; human_review_required: boolean; agents: { id: string; name: string; status: string }[] }[];
  reports: { id: string; title: string; summary: string; completed: string[]; insights: string[]; recommendations: string[]; limitations: string[] }[];
};

const panel = {
  border: '1px solid rgba(90,170,255,.22)',
  background: 'linear-gradient(180deg, rgba(18,27,40,.96), rgba(7,11,18,.98))',
  borderRadius: 20,
  padding: 22,
} as const;

export default function AgentXCommandCenterPage() {
  const [data, setData] = useState<CommandCenterData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState('');

  const load = async () => {
    const organizationId = new URLSearchParams(window.location.search).get('organization_id');
    if (!organizationId) {
      setError('Missing organization ID. Complete Build My Team first.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/agent-x/command-center?organization_id=${encodeURIComponent(organizationId)}`, { cache: 'no-store' });
      const payload = await res.json();
      if (!res.ok || !payload?.ok) throw new Error(payload?.error || 'Command Center unavailable');
      setData(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Command Center unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (missionId: string) => {
    if (!data) return;
    setApproving(missionId);
    setError('');
    try {
      const res = await fetch('/api/agent-x/command-center', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve_mission', organizationId: data.organization.id, missionId }),
      });
      const payload = await res.json();
      if (!res.ok || !payload?.ok) throw new Error(payload?.error || 'Mission approval failed');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mission approval failed');
    } finally {
      setApproving('');
    }
  };

  return <main style={{minHeight:'100vh',background:'#05070a',color:'#f5f7fb',fontFamily:'Arial, Helvetica, sans-serif',padding:'42px 22px 70px'}}>
    <div style={{maxWidth:1180,margin:'0 auto'}}>
      <div style={{fontSize:12,letterSpacing:'.24em',fontWeight:800,color:'#79b8ff'}}>AGENT X · COMMAND CENTER</div>
      <h1 style={{fontSize:'clamp(42px,7vw,78px)',letterSpacing:'-.045em',margin:'12px 0 8px'}}>Today’s Intelligence Brief</h1>
      <p style={{color:'#9fb0c4',fontSize:18,maxWidth:760,lineHeight:1.55,marginTop:0}}>Who is helping, what is happening, what happened, and what needs your approval next.</p>

      {loading && <div style={{...panel,marginTop:26}}>Loading your Agent X workspace…</div>}
      {error && <div style={{...panel,marginTop:26,border:'1px solid rgba(255,120,120,.35)',color:'#ffb4b4'}}>{error}</div>}

      {data && <>
        <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14,marginTop:28}}>
          <div style={panel}><div style={{fontSize:12,color:'#79b8ff',fontWeight:800}}>ORGANIZATION</div><h2 style={{margin:'10px 0 4px',fontSize:25}}>{data.organization.name}</h2><div style={{color:'#8fa0b5'}}>{data.organization.industry.replaceAll('_',' ')}</div></div>
          <div style={panel}><div style={{fontSize:12,color:'#79b8ff',fontWeight:800}}>ACTIVE AGENTS</div><div style={{fontSize:38,fontWeight:900,marginTop:8}}>{data.workforce?.agents.length || 0}</div><div style={{color:'#8fa0b5'}}>{data.workforce?.name || 'No workforce'}</div></div>
          <div style={panel}><div style={{fontSize:12,color:'#79b8ff',fontWeight:800}}>MISSIONS</div><div style={{fontSize:38,fontWeight:900,marginTop:8}}>{data.missions.length}</div><div style={{color:'#8fa0b5'}}>Ready + active</div></div>
          <div style={panel}><div style={{fontSize:12,color:'#79b8ff',fontWeight:800}}>REPORTS</div><div style={{fontSize:38,fontWeight:900,marginTop:8}}>{data.reports.length}</div><div style={{color:'#8fa0b5'}}>Intelligence briefs</div></div>
        </section>

        <section style={{marginTop:24}}>
          <div style={{fontSize:12,letterSpacing:'.18em',fontWeight:800,color:'#79b8ff',marginBottom:12}}>MY WORKFORCE</div>
          <div style={{...panel,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12}}>
            {data.workforce?.agents.map(agent => <div key={agent.id} style={{padding:15,borderRadius:13,background:'#0d1420'}}><strong>{agent.name}</strong><div style={{fontSize:13,color:'#8ea0b8',marginTop:6}}>{agent.category}</div><div style={{fontSize:12,color:'#6fd6a7',marginTop:7}}>Permission: {agent.permission_level.replaceAll('_',' ')}</div></div>)}
          </div>
        </section>

        <section style={{marginTop:24}}>
          <div style={{fontSize:12,letterSpacing:'.18em',fontWeight:800,color:'#79b8ff',marginBottom:12}}>MY MISSIONS</div>
          <div style={{display:'grid',gap:14}}>{data.missions.map(mission => <div key={mission.id} style={panel}>
            <div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><div><div style={{fontSize:12,fontWeight:800,color:mission.status==='active'?'#62e0a1':'#79b8ff'}}>{mission.status.toUpperCase()}</div><h2 style={{fontSize:28,margin:'8px 0'}}>{mission.name}</h2></div>{mission.status==='ready' && <button onClick={()=>approve(mission.id)} disabled={approving===mission.id} style={{alignSelf:'flex-start',background:'#eef6ff',color:'#07111d',border:0,borderRadius:999,padding:'12px 17px',fontWeight:900,cursor:'pointer'}}>{approving===mission.id?'APPROVING…':'APPROVE MISSION'}</button>}</div>
            <p style={{color:'#b6c3d3',lineHeight:1.55,maxWidth:820}}>{mission.objective}</p>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}>{mission.agents.map(agent=><span key={agent.id} style={{fontSize:13,padding:'7px 10px',borderRadius:999,background:'#0d1420',color:'#afbdce'}}>{agent.name} · {agent.status}</span>)}</div>
            <div style={{fontSize:12,color:'#8fa0b5',marginTop:14}}>Human review required before activation.</div>
          </div>)}</div>
        </section>

        <section style={{marginTop:24}}>
          <div style={{fontSize:12,letterSpacing:'.18em',fontWeight:800,color:'#79b8ff',marginBottom:12}}>MY REPORTS</div>
          <div style={{display:'grid',gap:14}}>{data.reports.map(report => <article key={report.id} style={panel}>
            <h2 style={{fontSize:27,margin:'0 0 10px'}}>{report.title}</h2><p style={{color:'#b6c3d3',lineHeight:1.55}}>{report.summary}</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:14,marginTop:18}}>
              <div><strong>Completed</strong>{report.completed.map(x=><div key={x} style={{color:'#9fb0c4',marginTop:7}}>✓ {x}</div>)}</div>
              <div><strong>Insights</strong>{report.insights.map(x=><div key={x} style={{color:'#9fb0c4',marginTop:7}}>• {x}</div>)}</div>
              <div><strong>Next</strong>{report.recommendations.map(x=><div key={x} style={{color:'#9fb0c4',marginTop:7}}>→ {x}</div>)}</div>
            </div>
            <details style={{marginTop:18,color:'#8fa0b5'}}><summary>Limitations & guardrails</summary>{report.limitations.map(x=><div key={x} style={{marginTop:7}}>• {x}</div>)}</details>
          </article>)}</div>
        </section>
      </>}
    </div>
  </main>;
}
