'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '../../../../lib/supabase/browser';

export default function CreatorLockerPage(){
  const params=useParams();
  const creatorId=params?.creatorId;
  const [creator,setCreator]=useState(null);
  const [projects,setProjects]=useState([]);
  const [badges,setBadges]=useState([]);
  const [completions,setCompletions]=useState([]);
  const [entitlements,setEntitlements]=useState([]);
  const [loading,setLoading]=useState(true);
  const [activating,setActivating]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');

  useEffect(()=>{if(creatorId)load();},[creatorId]);

  async function load(){
    setLoading(true);setError('');
    const supabase=getSupabaseBrowserClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){window.location.replace('/parent/sign-in');return;}

    const {data:creatorRow,error:creatorError}=await supabase
      .from('creators')
      .select('id,display_name,age_band,creator_name,avatar_key,creator_status,creator_mix,creator_style,credits_total,created_at,updated_at')
      .eq('id',creatorId)
      .maybeSingle();
    if(creatorError||!creatorRow){setError(creatorError?.message||'Creator not found or not available to this account.');setLoading(false);return;}
    setCreator(creatorRow);

    const [projectResult,badgeResult,completionResult,entitlementResult]=await Promise.all([
      supabase.from('projects').select('id,title,project_type,content_json,created_at,updated_at').eq('creator_id',creatorId).order('created_at',{ascending:false}),
      supabase.from('creator_badges').select('id,badge_slug,earned_at').eq('creator_id',creatorId).order('earned_at',{ascending:false}),
      supabase.from('mission_completions').select('id,mission_slug,completed_at').eq('creator_id',creatorId).order('completed_at',{ascending:false}),
      supabase.from('entitlements').select('id,program_slug,status,source,starts_at,expires_at,created_at').eq('creator_id',creatorId)
    ]);

    const firstError=projectResult.error||badgeResult.error||completionResult.error||entitlementResult.error;
    if(firstError){setError(firstError.message);setLoading(false);return;}
    setProjects(projectResult.data||[]);
    setBadges(badgeResult.data||[]);
    setCompletions(completionResult.data||[]);
    setEntitlements(entitlementResult.data||[]);
    setLoading(false);
  }

  async function activateSemesterOne(){
    setActivating(true);setNotice('Activating Semester One in staging…');setError('');
    const supabase=getSupabaseBrowserClient();
    const {error:rpcError}=await supabase.rpc('grant_staging_semester_one',{p_creator_id:creatorId});
    if(rpcError){setError(rpcError.message);setNotice('');setActivating(false);return;}
    setNotice('Semester One is active for this staging Creator.');
    setActivating(false);
    await load();
  }

  const activeSemester=useMemo(()=>entitlements.some((e)=>e.program_slug==='semester-one'&&e.status==='active'),[entitlements]);
  const mix=Array.isArray(creator?.creator_mix)?creator.creator_mix:[];
  const styles=Array.isArray(creator?.creator_style)?creator.creator_style:[];

  return <main className="app"><div className="shell">
    <div className="brand">CREATOR COLLEGE<b>SECURE CREATOR LOCKER</b></div>
    <section className="card">
      {loading&&<p className="lead">Opening secure Locker…</p>}
      {error&&<><div className="notice">{error}</div><div className="actions"><a className="btn secondary" href="/parent">Back to Dashboard</a></div></>}
      {notice&&<div className="notice">{notice}</div>}
      {!loading&&!error&&creator&&<>
        <div className="eye">PRIVATE FAMILY VIEW</div>
        <div className="avatar" style={{fontSize:64}}>{creator.avatar_key||'💡'}</div>
        <h1 className="title">{creator.creator_name||creator.display_name}</h1>
        <p className="lead">Ages {creator.age_band||'Junior'} • {creator.credits_total||0} Creator Credits • {activeSemester?'Semester One active':'Open House visitor'}</p>
        <div className="notice">Creator Credits are achievement points only. This profile is private and controlled by the grown-up account.</div>

        <div className="eye" style={{marginTop:26}}>CREATOR MIX</div>
        <div className="mix">
          {mix.length?mix.map((item,i)=><div key={item.key||i}><em>#{i+1}</em><b>{item.label||item.key||'Creator School'}</b><p className="muted">Signal {item.score??''}</p></div>):<div><b>Creator Mix</b><p className="muted">Complete the Open House quiz to populate this.</p></div>}
        </div>
        {styles.length>0&&<div className="schools">{styles.map((style)=><span key={style}>{style}</span>)}</div>}

        <div className="eye" style={{marginTop:28}}>CREATOR LOCKER</div>
        <div className="campus">
          {projects.length===0&&<div className="tile"><small>EMPTY</small><b>No saved creations yet.</b></div>}
          {projects.map((project)=>{
            const content=project.content_json||{};
            return <div className="tile" key={project.id}>
              <small>{(project.project_type||'creation').replaceAll('_',' ').toUpperCase()}</small>
              <h2 style={{margin:'8px 0'}}>{project.title}</h2>
              {content.idea&&<p>{content.idea}</p>}
              {content.problem&&<p className="muted"><b>Problem noticed:</b> {content.problem}</p>}
              {content.audience&&<p className="muted">Made for: {content.audience}</p>}
              <p className="muted">Saved {new Date(project.created_at).toLocaleDateString()}</p>
            </div>;
          })}
        </div>

        <div className="eye" style={{marginTop:28}}>BADGES & PROGRESS</div>
        <div className="campus">
          {badges.map((badge)=><div className="tile" key={badge.id}><small>BADGE EARNED</small><h2 style={{margin:'8px 0'}}>🏅 {badge.badge_slug.replaceAll('-',' ')}</h2><p className="muted">{new Date(badge.earned_at).toLocaleDateString()}</p></div>)}
          {completions.map((item)=><div className="tile" key={item.id}><small>MISSION COMPLETE</small><b>{item.mission_slug.replaceAll('-',' ')}</b><p className="muted">Completed {new Date(item.completed_at).toLocaleDateString()}</p></div>)}
        </div>

        <div className="reward">
          <b>{activeSemester?'SEMESTER ONE ACTIVE':'NEXT: SEMESTER ONE — I CAN CREATE'}</b>
          <span>{activeSemester?'Continue into the six-mission Creator journey.':'6 missions • First Show • First Product • Story World • AI Lab • Creator Showcase'}</span>
        </div>

        {activeSemester?<div className="actions"><a className="btn primary" href={`/semester-one/${creatorId}/mission-1`}>Start Mission 1 — My Creator Identity →</a></div>:<>
          <div className="tile"><small>FOUNDING STUDENT STAGING OFFER</small><h2>$19 one-time</h2><p className="muted">Shopify product remains DRAFT. The control below simulates the entitlement only for this signed-in parent’s staging Creator.</p></div>
          <button className="btn primary" disabled={activating} onClick={activateSemesterOne}>{activating?'Activating…':'STAGING TEST — Activate Semester One'}</button>
        </>}

        <div className="actions">
          <a className="btn secondary" href="/parent">Back to Grown-up Dashboard</a>
          <a className="btn secondary" href="/">Open Creator Campus</a>
        </div>
      </>}
    </section>
  </div></main>;
}
