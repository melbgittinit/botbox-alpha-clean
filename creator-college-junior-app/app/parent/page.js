'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '../../lib/supabase/browser';

export default function ParentDashboard(){
  const [loading,setLoading]=useState(true);
  const [email,setEmail]=useState('');
  const [parent,setParent]=useState(null);
  const [creators,setCreators]=useState([]);
  const [projects,setProjects]=useState([]);
  const [badges,setBadges]=useState([]);
  const [entitlements,setEntitlements]=useState([]);
  const [error,setError]=useState('');

  useEffect(()=>{load();},[]);

  async function load(){
    setLoading(true);setError('');
    const supabase=getSupabaseBrowserClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){window.location.replace('/parent/sign-in');return;}
    setEmail(user.email||'');

    const {data:parentRow,error:parentError}=await supabase
      .from('parents')
      .select('id,first_name,email,created_at')
      .maybeSingle();
    if(parentError){setError(parentError.message);setLoading(false);return;}
    setParent(parentRow||null);
    if(!parentRow){setLoading(false);return;}

    const {data:creatorRows,error:creatorError}=await supabase
      .from('creators')
      .select('id,display_name,age_band,creator_name,avatar_key,creator_status,creator_mix,creator_style,credits_total,created_at,updated_at')
      .eq('parent_id',parentRow.id)
      .order('created_at',{ascending:true});
    if(creatorError){setError(creatorError.message);setLoading(false);return;}
    const safeCreators=creatorRows||[];
    setCreators(safeCreators);

    const ids=safeCreators.map((c)=>c.id);
    if(ids.length){
      const [{data:projectRows},{data:badgeRows},{data:entitlementRows}]=await Promise.all([
        supabase.from('projects').select('id,creator_id,title,project_type,mission_slug,created_at,updated_at').in('creator_id',ids).order('created_at',{ascending:false}),
        supabase.from('creator_badges').select('id,creator_id,badge_key,badge_name,earned_at').in('creator_id',ids).order('earned_at',{ascending:false}),
        supabase.from('entitlements').select('id,creator_id,product_key,status,source,granted_at,revoked_at').in('creator_id',ids)
      ]);
      setProjects(projectRows||[]);
      setBadges(badgeRows||[]);
      setEntitlements(entitlementRows||[]);
    }
    setLoading(false);
  }

  async function signOut(){
    const supabase=getSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.replace('/');
  }

  const totals=useMemo(()=>({
    creators:creators.length,
    projects:projects.length,
    credits:creators.reduce((sum,c)=>sum+(c.credits_total||0),0)
  }),[creators,projects]);

  return <main className="app"><div className="shell">
    <div className="brand">CREATOR COLLEGE<b>GROWN-UP DASHBOARD</b></div>
    <section className="card">
      <div className="eye">SECURE FAMILY VIEW</div>
      <h1 className="title">Welcome{parent?.first_name?`, ${parent.first_name}`:''}.</h1>
      <p className="lead">See each Creator’s saved work, badges, credits, and next step. Young creators do not need their own email or public profile.</p>
      <div className="notice">Signed in as {email||'grown-up'} • private by default</div>
      {loading&&<p className="lead">Loading your Creator family…</p>}
      {error&&<div className="notice">Could not load dashboard: {error}</div>}
      {!loading&&!parent&&<div className="notice">Your secure grown-up account is ready, but no Creator journey has been claimed yet. Complete Open House on this device, then save it securely.</div>}
      {!loading&&parent&&<>
        <div className="mix">
          <div><em>{totals.creators}</em><b>Creators</b><p className="muted">under this grown-up account</p></div>
          <div><em>{totals.projects}</em><b>Saved Creations</b><p className="muted">across Creator Lockers</p></div>
          <div><em>{totals.credits}</em><b>Creator Credits</b><p className="muted">achievement points, not money</p></div>
        </div>
        {creators.length===0&&<div className="notice">No Creator profiles yet. Claim a completed Open House to create the first one.</div>}
        <div className="campus">
          {creators.map((creator)=>{
            const creatorProjects=projects.filter((p)=>p.creator_id===creator.id);
            const creatorBadges=badges.filter((b)=>b.creator_id===creator.id);
            const activeSemester=entitlements.some((e)=>e.creator_id===creator.id&&e.product_key==='semester-one'&&e.status==='active');
            return <a className="tile tileLink" href={`/parent/creator/${creator.id}`} key={creator.id}>
              <small>{activeSemester?'SEMESTER ONE ACTIVE':'VISITING CREATOR'}</small>
              <div className="avatar" style={{fontSize:42,margin:'10px 0'}}>{creator.avatar_key||'💡'}</div>
              <h2 style={{margin:'0 0 6px'}}>{creator.creator_name||creator.display_name}</h2>
              <p className="muted">Ages {creator.age_band||'Junior'} • {creator.credits_total||0} credits</p>
              <p>{creatorProjects.length} saved creation{creatorProjects.length===1?'':'s'} • {creatorBadges.length} badge{creatorBadges.length===1?'':'s'}</p>
              <b>Open Secure Locker →</b>
            </a>;
          })}
        </div>
      </>}
      <div className="actions">
        <a className="btn primary" href="/">Open Free Open House</a>
        <a className="btn secondary" href="/parent/claim">Claim This Device’s Journey</a>
        <button className="btn secondary" onClick={signOut}>Sign out</button>
      </div>
    </section>
  </div></main>;
}
