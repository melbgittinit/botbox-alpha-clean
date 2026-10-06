'use client';

import { useEffect, useState } from 'react';

type CommandCenterData = {
  organization: { id: string; name: string; industry: string };
  workforce: {
    id: string; name: string; status: string;
    agents: { id: string; name: string; category: string; permission_level: string; status: string }[];
  } | null;
  missions: { id: string; template_id?: string; name: string; objective: string; success_definition?: string; status: string; human_review_required: boolean; agents: { id: string; name: string; status: string }[] }[];
  reports: { id: string; mission_id?: string; title: string; summary: string; completed: string[]; insights: string[]; recommendations: string[]; limitations: string[] }[];
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
  const opportunities = data
    ? Array.from(new Set(data.reports.flatMap(report => report.recommendations))).slice(0, 8)
    : [];
  const readyMission = data?.missions.find(mission => mission.status === 'ready');
  const activeMission = data?.missions.find(mission => mission.status === 'active');
  const nextAction = readyMission
    ? { eyebrow: 'APPROVAL NEEDED', title: `Review and approve ${readyMission.name}`, copy: 'Agent X has assembled the mission, objective and assigned agents. Your approval is the next gate.', href: '#missions', label: 'REVIEW MISSION' }
    : activeMission
      ? { eyebrow: 'MISSION ACTIVE', title: `Review ${activeMission.name}`, copy: 'The mission is approved. Review its scope, assigned agents and current permission boundaries before any additional execution step.', href: '#missions', label: 'VIEW ACTIVE MISSION' }
      : opportunities.length > 0
        ? { eyebrow: 'NEXT OPPORTUNITY', title: opportunities[0], copy: 'This recommendation came from your latest intelligence brief and is waiting for human review.', href: '#opportunities', label: 'REVIEW OPPORTUNITIES' }
        : { eyebrow: 'WORKSPACE READY', title: 'Review your workforce and first intelligence brief', copy: 'Your Agent X workspace is assembled. Start with the workforce, reports and guardrails below.', href: '#workforce', label: 'VIEW WORKFORCE' };

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

  return <main className="ax-shell" style={{minHeight:'100vh',background:'#05070a',color:'#f5f7fb',fontFamily:'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',padding:'42px 22px 70px'}}>
    <style>{`
      .ax-shell{position:relative;overflow:hidden;padding-top:max(32px,env(safe-area-inset-top));padding-bottom:max(72px,calc(56px + env(safe-area-inset-bottom)))}
      .ax-shell:before{content:'';position:fixed;inset:0;pointer-events:none;background:radial-gradient(circle at 82% 0%,rgba(49,135,255,.15),transparent 28%),linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px);background-size:auto,38px 38px,38px 38px;mask-image:linear-gradient(to bottom,black,transparent 78%)}
      .ax-wrap{max-width:1180px;margin:0 auto;position:relative;z-index:1}
      .ax-console-head{display:flex;justify-content:space-between;gap:24px;align-items:flex-start}
      .ax-console-copy{min-width:0}
      .ax-mark{width:86px;height:86px;flex:0 0 auto;border-radius:24px;display:grid;place-items:center;border:1px solid rgba(121,184,255,.32);background:radial-gradient(circle at 35% 25%,rgba(121,184,255,.26),transparent 45%),linear-gradient(145deg,#111d2b,#070b11);box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 24px 70px rgba(0,0,0,.34);font-size:31px;font-weight:950;letter-spacing:-.08em;color:#edf7ff}
      .ax-kicker{font-size:12px;letter-spacing:.24em;font-weight:800;color:#79b8ff}
      .ax-title{font-size:clamp(44px,7vw,82px);font-weight:880;letter-spacing:-.058em;margin:12px 0 8px;line-height:.92;text-wrap:balance}
      .ax-lead{color:#a8b7c9;font-size:18px;max-width:760px;line-height:1.55;margin-top:0;text-wrap:pretty}
      .ax-status-rail{display:flex;gap:9px;flex-wrap:wrap;margin-top:17px}
      .ax-status-chip{display:inline-flex;align-items:center;gap:7px;min-height:34px;padding:0 10px;border-radius:999px;border:1px solid rgba(255,255,255,.08);background:rgba(8,13,20,.82);font-size:11px;font-weight:850;letter-spacing:.08em;color:#aebed1}
      .ax-status-dot{width:7px;height:7px;border-radius:999px;background:#79b8ff;box-shadow:0 0 16px rgba(121,184,255,.85)}
      .ax-status-dot.green{background:#62e0a1;box-shadow:0 0 16px rgba(98,224,161,.65)}
      .ax-stage{display:inline-flex;align-items:center;gap:8px;margin-top:14px;padding:8px 11px;border-radius:999px;border:1px solid rgba(121,184,255,.28);background:#0a1420;color:#9fbfe8;font-size:12px;font-weight:800;letter-spacing:.08em}
      .ax-nav{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}
      .ax-nav a{min-height:44px;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;font-size:12px;font-weight:800;letter-spacing:.08em;color:#b7c8dc;padding:8px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.10);background:#0a0f16}
      .ax-overview{scroll-margin-top:88px}
      .ax-action-row{display:flex;justify-content:space-between;align-items:flex-end;gap:18px;flex-wrap:wrap;margin-top:8px}
      .ax-primary{min-height:48px;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;background:#eef6ff;color:#07111d;border-radius:999px;padding:12px 16px;font-size:12px;font-weight:900;letter-spacing:.05em}
      .ax-summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:16px}
      .ax-section{margin-top:24px;scroll-margin-top:88px}
      .ax-agent-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}
      .ax-agent-card{padding:15px;border-radius:13px;background:#0d1420}
      .ax-mission-head{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
      .ax-approve{min-height:48px;align-self:flex-start;background:#eef6ff;color:#07111d;border:0;border-radius:999px;padding:12px 17px;font-weight:900;cursor:pointer}
      .ax-readiness{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:16px}
      .ax-opportunity-grid,.ax-control-grid,.ax-report-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px}
      .ax-control-grid{grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px}
      .ax-report-grid{gap:14px;margin-top:18px}
      .ax-workspace{margin-top:18px;padding:18px;border-radius:16px;border:1px solid rgba(121,184,255,.16);background:linear-gradient(180deg,rgba(8,16,26,.96),rgba(6,10,16,.98))}
      .ax-workspace-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;flex-wrap:wrap}
      .ax-workspace-label{font-size:11px;font-weight:900;letter-spacing:.14em;color:#79b8ff}
      .ax-evidence{display:inline-flex;align-items:center;min-height:30px;padding:0 9px;border-radius:999px;border:1px solid rgba(255,217,140,.20);background:rgba(255,217,140,.06);color:#ffd98c;font-size:10px;font-weight:900;letter-spacing:.08em}
      .ax-workspace-grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:14px;margin-top:14px}
      .ax-workspace-block{padding:15px;border-radius:13px;background:#0b121c;border:1px solid rgba(255,255,255,.05)}
      .ax-workspace-block h4{font-size:12px;letter-spacing:.09em;color:#8fa6c1;margin:0 0 10px}
      .ax-workspace-list{display:grid;gap:8px}
      .ax-workspace-item{color:#b7c4d4;line-height:1.5;font-size:13px}
      .ax-workspace-item strong{color:#eef6ff}
      .ax-success{margin-top:14px;padding:13px 14px;border-radius:13px;background:rgba(98,224,161,.06);border:1px solid rgba(98,224,161,.14);color:#9fdcbb;font-size:13px;line-height:1.5}
      .ax-trust-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:16px}
      .ax-trust-item{padding:12px 13px;border-radius:14px;border:1px solid rgba(255,255,255,.07);background:#090f17}
      .ax-trust-label{font-size:10px;font-weight:900;letter-spacing:.13em;color:#7890ab}
      .ax-trust-value{font-size:13px;font-weight:800;color:#d9e5f2;margin-top:5px}
      .ax-panel{transition:border-color .2s ease,transform .2s ease}
      .ax-panel:hover{border-color:rgba(121,184,255,.34)}
      .ax-state-card{margin-top:26px;border:1px solid rgba(121,184,255,.22);background:linear-gradient(180deg,rgba(18,27,40,.96),rgba(7,11,18,.98));border-radius:20px;padding:22px;overflow:hidden}
      .ax-state-eyebrow{font-size:11px;font-weight:900;letter-spacing:.15em;color:#79b8ff}
      .ax-state-title{font-size:24px;letter-spacing:-.025em;margin:8px 0 6px}
      .ax-state-copy{color:#91a2b6;line-height:1.55;margin:0}
      .ax-retry{min-height:46px;margin-top:16px;border:0;border-radius:999px;padding:0 16px;background:#eef6ff;color:#07111d;font-weight:900;cursor:pointer}
      .ax-skeleton{height:14px;border-radius:999px;background:linear-gradient(90deg,rgba(255,255,255,.05),rgba(121,184,255,.15),rgba(255,255,255,.05));background-size:220% 100%;animation:axShimmer 1.35s linear infinite}
      .ax-skeleton.big{height:34px;max-width:480px;margin-top:12px}.ax-skeleton.mid{max-width:700px;margin-top:12px}.ax-skeleton.short{max-width:280px;margin-top:12px}
      .ax-empty{padding:24px;border-radius:15px;border:1px dashed rgba(121,184,255,.22);background:rgba(8,14,22,.72);text-align:left}
      .ax-empty-mark{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:#0d1825;border:1px solid rgba(121,184,255,.18);font-weight:950;color:#79b8ff;margin-bottom:12px}
      .ax-empty strong{display:block;font-size:16px}.ax-empty span{display:block;color:#8fa0b5;line-height:1.5;margin-top:6px;font-size:13px}
      @keyframes axShimmer{to{background-position:-220% 0}}
      @media (max-width:720px){
        .ax-shell{padding-left:14px!important;padding-right:14px!important}
        .ax-console-head{gap:12px}
        .ax-mark{width:58px;height:58px;border-radius:18px;font-size:22px}
        .ax-kicker{font-size:10px;letter-spacing:.19em;line-height:1.45}
        .ax-title{font-size:clamp(40px,13vw,60px);margin-top:10px}
        .ax-lead{font-size:16px;line-height:1.5}
        .ax-status-rail{gap:7px}.ax-status-chip{font-size:10px;letter-spacing:.06em}
        .ax-stage{display:flex;width:100%;box-sizing:border-box;border-radius:14px;line-height:1.35}
        .ax-nav{position:sticky;top:max(8px,env(safe-area-inset-top));z-index:20;flex-wrap:nowrap;overflow-x:auto;margin-left:-14px;margin-right:-14px;padding:10px 14px;background:linear-gradient(180deg,rgba(5,7,10,.98),rgba(5,7,10,.88));backdrop-filter:blur(14px);-webkit-overflow-scrolling:touch;scrollbar-width:none}
        .ax-nav::-webkit-scrollbar{display:none}
        .ax-nav a{flex:0 0 auto}
        .ax-overview,.ax-section{scroll-margin-top:86px}
        .ax-action-row{align-items:stretch}
        .ax-primary{width:100%;box-sizing:border-box}
        .ax-summary-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
        .ax-agent-grid,.ax-opportunity-grid,.ax-control-grid,.ax-report-grid,.ax-workspace-grid{grid-template-columns:1fr}
        .ax-mission-head{display:block}
        .ax-approve{width:100%;margin-top:12px}
        .ax-readiness{grid-template-columns:repeat(2,minmax(0,1fr))}
        .ax-trust-strip{grid-template-columns:repeat(2,minmax(0,1fr))}
      }
      @media (max-width:390px){
        .ax-summary-grid,.ax-readiness,.ax-trust-strip{grid-template-columns:1fr}
      }
    `}</style>
    <div className="ax-wrap" style={{maxWidth:1180,margin:'0 auto'}}>
      <header className="ax-console-head">
        <div className="ax-console-copy">
          <div className="ax-kicker">AGENT X · COMMAND CENTER · STAGING PREVIEW</div>
          <h1 className="ax-title">Today’s Intelligence Brief</h1>
          <p className="ax-lead">Who is helping, what is happening, what happened, and what needs your approval next.</p>
          <div className="ax-status-rail" aria-label="System status">
            <div className="ax-status-chip"><span className="ax-status-dot green"></span>HUMAN CONTROLLED</div>
            <div className="ax-status-chip"><span className="ax-status-dot"></span>PRIVATE PREVIEW</div>
            <div className="ax-status-chip">PERMISSION-GATED</div>
          </div>
        </div>
        <div className="ax-mark" aria-hidden="true">AX</div>
      </header>
      <div className="ax-stage">STAGING ONLY · NOT PUBLISHED TO THE BOT STORES</div>
      <div className="ax-trust-strip" aria-label="Agent X trust controls">
        <div className="ax-trust-item"><div className="ax-trust-label">CONTROL MODEL</div><div className="ax-trust-value">Human-led</div></div>
        <div className="ax-trust-item"><div className="ax-trust-label">MISSION GATE</div><div className="ax-trust-value">Approval required</div></div>
        <div className="ax-trust-item"><div className="ax-trust-label">PERMISSIONS</div><div className="ax-trust-value">No auto-escalation</div></div>
        <div className="ax-trust-item"><div className="ax-trust-label">RECOMMENDATIONS</div><div className="ax-trust-value">Human review</div></div>
      </div>
      <nav className="ax-nav" aria-label="Command Center sections">
        {[['Overview','#overview'],['Workforce','#workforce'],['Missions','#missions'],['Opportunities','#opportunities'],['Reports','#reports']].map(([label,href]) => <a key={href} href={href}>{label}</a>)}
      </nav>

      {loading && <div className="ax-state-card" aria-live="polite" aria-busy="true">
        <div className="ax-state-eyebrow">INITIALIZING COMMAND CENTER</div>
        <div className="ax-skeleton big"></div>
        <div className="ax-skeleton mid"></div>
        <div className="ax-skeleton short"></div>
      </div>}
      {error && !loading && <div className="ax-state-card" role="alert" style={{border:'1px solid rgba(255,120,120,.30)'}}>
        <div className="ax-state-eyebrow" style={{color:'#ffb4b4'}}>WORKSPACE NEEDS ATTENTION</div>
        <h2 className="ax-state-title">Agent X could not open this command center.</h2>
        <p className="ax-state-copy">{error}</p>
        <button className="ax-retry" onClick={()=>{setLoading(true);setError('');load();}}>TRY AGAIN</button>
      </div>}

      {data && <>
        <section id="overview" className="ax-overview" style={{...panel,marginTop:28,border:'1px solid rgba(121,184,255,.38)',background:'radial-gradient(circle at 86% 20%,rgba(33,126,255,.18),transparent 34%),linear-gradient(180deg,rgba(19,31,48,.98),rgba(7,11,18,.98))'}}>
          <div style={{fontSize:12,fontWeight:900,letterSpacing:'.16em',color:readyMission?'#ffd98c':activeMission?'#62e0a1':'#79b8ff'}}>{nextAction.eyebrow}</div>
          <div className="ax-action-row">
            <div style={{maxWidth:760}}><h2 style={{fontSize:'clamp(28px,4vw,43px)',letterSpacing:'-.035em',margin:'0 0 8px'}}>{nextAction.title}</h2><p style={{color:'#aebed0',lineHeight:1.6,margin:0}}>{nextAction.copy}</p></div>
            <a className="ax-primary" href={nextAction.href}>{nextAction.label}</a>
          </div>
        </section>

        <section className="ax-summary-grid">
          <div style={panel}><div style={{fontSize:12,color:'#79b8ff',fontWeight:800}}>ORGANIZATION</div><h2 style={{margin:'10px 0 4px',fontSize:25}}>{data.organization.name}</h2><div style={{color:'#8fa0b5'}}>{data.organization.industry.replaceAll('_',' ')}</div></div>
          <div style={panel}><div style={{fontSize:12,color:'#79b8ff',fontWeight:800}}>ASSIGNED AGENTS</div><div style={{fontSize:38,fontWeight:900,marginTop:8}}>{data.workforce?.agents.length || 0}</div><div style={{color:'#8fa0b5'}}>{data.workforce?.name || 'No workforce'}</div></div>
          <div style={panel}><div style={{fontSize:12,color:'#79b8ff',fontWeight:800}}>MISSIONS</div><div style={{fontSize:38,fontWeight:900,marginTop:8}}>{data.missions.length}</div><div style={{color:'#8fa0b5'}}>Ready + active</div></div>
          <div style={panel}><div style={{fontSize:12,color:'#79b8ff',fontWeight:800}}>REPORTS</div><div style={{fontSize:38,fontWeight:900,marginTop:8}}>{data.reports.length}</div><div style={{color:'#8fa0b5'}}>Intelligence briefs</div></div>
          <div style={panel}><div style={{fontSize:12,color:'#79b8ff',fontWeight:800}}>OPPORTUNITIES</div><div style={{fontSize:38,fontWeight:900,marginTop:8}}>{opportunities.length}</div><div style={{color:'#8fa0b5'}}>Suggested next moves</div></div>
        </section>

        <section id="workforce" className="ax-section">
          <div style={{fontSize:12,letterSpacing:'.18em',fontWeight:800,color:'#79b8ff',marginBottom:12}}>MY WORKFORCE</div>
          <div className="ax-agent-grid ax-panel" style={panel}>
            {data.workforce?.agents?.length ? data.workforce.agents.map(agent => <div key={agent.id} className="ax-agent-card"><strong>{agent.name}</strong><div style={{fontSize:13,color:'#8ea0b8',marginTop:6}}>{agent.category}</div><div style={{fontSize:12,color:'#6fd6a7',marginTop:7}}>Permission: {agent.permission_level.replaceAll('_',' ')}</div><div style={{fontSize:12,color:'#7f91a7',marginTop:5}}>Status: {agent.status.replaceAll('_',' ')}</div></div>) : <div className="ax-empty"><div className="ax-empty-mark">AX</div><strong>No workforce assigned yet</strong><span>Agent assignments will appear here after Build My Team creates the staged workforce.</span></div>}
          </div>
        </section>

        <section id="missions" className="ax-section">
          <div style={{fontSize:12,letterSpacing:'.18em',fontWeight:800,color:'#79b8ff',marginBottom:12}}>MY MISSIONS</div>
          <div style={{display:'grid',gap:14}}>{data.missions.length ? data.missions.map(mission => {
            const missionReports = data.reports.filter(report => report.mission_id === mission.id);
            const workingBrief = missionReports.find(report => report.title.includes('Working Brief'));
            return <div key={mission.id} className="ax-panel" style={panel}>
              <div className="ax-mission-head"><div><div style={{fontSize:12,fontWeight:800,color:mission.status==='active'?'#62e0a1':'#79b8ff'}}>{mission.status.toUpperCase()}</div><h2 style={{fontSize:28,margin:'8px 0'}}>{mission.name}</h2></div>{mission.status==='ready' && <button className="ax-approve" onClick={()=>approve(mission.id)} disabled={approving===mission.id}>{approving===mission.id?'APPROVING…':'APPROVE MISSION'}</button>}</div>
              <p style={{color:'#b6c3d3',lineHeight:1.55,maxWidth:820}}>{mission.objective}</p>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}>{mission.agents.map(agent=><span key={agent.id} style={{fontSize:13,padding:'7px 10px',borderRadius:999,background:'#0d1420',color:'#afbdce'}}>{agent.name} · {agent.status}</span>)}</div>
              <div className="ax-readiness">
                {[
                  ['Objective defined', Boolean(mission.objective)],
                  ['Agents assigned', mission.agents.length > 0],
                  ['Human approval', mission.status !== 'ready'],
                  ['Working brief', Boolean(workingBrief)],
                ].map(([label,complete]) => <div key={String(label)} style={{padding:'10px 12px',borderRadius:11,background:'#0b121c',border:'1px solid rgba(255,255,255,.07)',fontSize:12,color:complete?'#8fe7b8':'#9caec2'}}>{complete?'✓':'○'} {String(label)}</div>)}
              </div>
              <div style={{fontSize:12,color:'#8fa0b5',marginTop:14}}>{mission.status === 'ready' ? 'Human review required before activation.' : 'Mission approved. Agent X has prepared the first working brief; external actions remain permission-gated.'}</div>

              {mission.status === 'active' && <div className="ax-workspace">
                <div className="ax-workspace-head">
                  <div>
                    <div className="ax-workspace-label">MISSION WORKSPACE</div>
                    <h3 style={{fontSize:24,letterSpacing:'-.025em',margin:'8px 0 0'}}>{workingBrief?.title || 'Working brief pending'}</h3>
                  </div>
                  <div className="ax-evidence">INPUT-BASED · HUMAN REVIEW</div>
                </div>
                {workingBrief ? <>
                  <p style={{color:'#aebed0',lineHeight:1.58,margin:'12px 0 0'}}>{workingBrief.summary}</p>
                  <div className="ax-workspace-grid">
                    <div className="ax-workspace-block">
                      <h4>MISSION HYPOTHESES + PRIORITIES</h4>
                      <div className="ax-workspace-list">{workingBrief.insights.map((item,index)=><div key={item} className="ax-workspace-item"><strong>{String(index+1).padStart(2,'0')}.</strong> {item}</div>)}</div>
                    </div>
                    <div className="ax-workspace-block">
                      <h4>7-DAY ACTION PATH</h4>
                      <div className="ax-workspace-list">{workingBrief.recommendations.map(item=><div key={item} className="ax-workspace-item">→ {item}</div>)}</div>
                    </div>
                  </div>
                  {mission.success_definition && <div className="ax-success"><strong style={{color:'#c8f0d8'}}>Success definition:</strong> {mission.success_definition}</div>}
                  <details style={{marginTop:14,color:'#8fa0b5'}}><summary>Evidence limits + guardrails</summary>{workingBrief.limitations.map(item=><div key={item} style={{marginTop:8,fontSize:13,lineHeight:1.5}}>• {item}</div>)}</details>
                </> : <div className="ax-empty" style={{marginTop:14}}><div className="ax-empty-mark">W</div><strong>Working brief is being prepared</strong><span>Refresh the workspace if the mission was just approved. External action remains blocked until a reviewed brief is available.</span></div>}
              </div>}
            </div>;
          }) : <div className="ax-empty"><div className="ax-empty-mark">01</div><strong>No mission prepared yet</strong><span>Your first mission will appear here with its objective, assigned agents, readiness gates and human approval control.</span></div>}</div>
        </section>

        <section id="opportunities" className="ax-section">
          <div style={{fontSize:12,letterSpacing:'.18em',fontWeight:800,color:'#79b8ff',marginBottom:12}}>MY OPPORTUNITIES</div>
          <div style={panel}>
            {opportunities.length > 0 ? <div className="ax-opportunity-grid">
              {opportunities.map((opportunity,index)=><div key={opportunity} style={{padding:15,borderRadius:13,background:'#0d1420'}}><div style={{fontSize:11,fontWeight:900,letterSpacing:'.12em',color:'#79b8ff'}}>OPPORTUNITY {String(index+1).padStart(2,'0')}</div><div style={{marginTop:8,color:'#c7d3e2',lineHeight:1.5}}>{opportunity}</div></div>)}
            </div> : <div style={{color:'#8fa0b5'}}>Opportunities will appear here as Agent X reports generate recommended next moves.</div>}
            <div style={{fontSize:12,color:'#7f91a7',marginTop:14}}>These are recommendations for human review—not guarantees, commitments, or automatic actions.</div>
          </div>
        </section>

        <section className="ax-section">
          <div style={{fontSize:12,letterSpacing:'.18em',fontWeight:800,color:'#79b8ff',marginBottom:12}}>HUMAN CONTROL</div>
          <div style={panel}>
            <div className="ax-control-grid">
              {['Recommend','Prepare','Execute with Approval','Managed Autonomy'].map((level,index)=><div key={level} style={{padding:14,borderRadius:13,background:'#0d1420',border:index===0?'1px solid rgba(121,184,255,.35)':'1px solid rgba(255,255,255,.06)'}}><div style={{fontSize:11,fontWeight:900,color:index===0?'#79b8ff':'#8294aa'}}>LEVEL {index+1}</div><div style={{fontWeight:800,marginTop:6}}>{level}</div></div>)}
            </div>
            <p style={{fontSize:13,color:'#8fa0b5',lineHeight:1.55,margin:'14px 0 0'}}>Permissions do not automatically advance. Agent X remains inside the configured permission level, and higher-risk actions can require additional human approval.</p>
          </div>
        </section>

        <section id="reports" className="ax-section">
          <div style={{fontSize:12,letterSpacing:'.18em',fontWeight:800,color:'#79b8ff',marginBottom:12}}>MY REPORTS</div>
          <div style={{display:'grid',gap:14}}>{data.reports.length ? data.reports.map(report => <article key={report.id} className="ax-panel" style={panel}>
            <h2 style={{fontSize:27,margin:'0 0 10px'}}>{report.title}</h2><p style={{color:'#b6c3d3',lineHeight:1.55}}>{report.summary}</p>
            <div className="ax-report-grid">
              <div><strong>Completed</strong>{report.completed.map(x=><div key={x} style={{color:'#9fb0c4',marginTop:7}}>✓ {x}</div>)}</div>
              <div><strong>Insights</strong>{report.insights.map(x=><div key={x} style={{color:'#9fb0c4',marginTop:7}}>• {x}</div>)}</div>
              <div><strong>Next</strong>{report.recommendations.map(x=><div key={x} style={{color:'#9fb0c4',marginTop:7}}>→ {x}</div>)}</div>
            </div>
            <details style={{marginTop:18,color:'#8fa0b5'}}><summary>Limitations & guardrails</summary>{report.limitations.map(x=><div key={x} style={{marginTop:7}}>• {x}</div>)}</details>
          </article>) : <div className="ax-empty"><div className="ax-empty-mark">R</div><strong>No intelligence brief yet</strong><span>Reports will appear here after Agent X prepares a reviewed intelligence brief for this workspace.</span></div>}</div>
        </section>
      </>}
    </div>
  </main>;
}
