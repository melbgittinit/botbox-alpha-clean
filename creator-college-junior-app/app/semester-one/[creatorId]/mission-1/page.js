'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '../../../../lib/supabase/browser';

export default function MissionOnePage(){
  const params=useParams();
  const creatorId=params?.creatorId;
  const [creator,setCreator]=useState(null);
  const [status,setStatus]=useState('Checking Semester One access…');
  const [allowed,setAllowed]=useState(false);
  const [error,setError]=useState('');

  useEffect(()=>{if(creatorId)check();},[creatorId]);

  async function check(){
    const supabase=getSupabaseBrowserClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){window.location.replace('/parent/sign-in');return;}

    const {data:creatorRow,error:creatorError}=await supabase
      .from('creators')
      .select('id,display_name,creator_name,avatar_key,creator_status,credits_total')
      .eq('id',creatorId)
      .maybeSingle();
    if(creatorError||!creatorRow){setError('This Creator is not available to the signed-in grown-up account.');return;}

    const {data:entitlement,error:entitlementError}=await supabase
      .from('entitlements')
      .select('id,status,program_slug')
      .eq('creator_id',creatorId)
      .eq('program_slug','semester-one')
      .eq('status','active')
      .maybeSingle();
    if(entitlementError){setError(entitlementError.message);return;}
    if(!entitlement){setCreator(creatorRow);setStatus('Semester One is still locked for this Creator.');return;}

    setCreator(creatorRow);setAllowed(true);setStatus('Semester One access confirmed.');
  }

  return <main className="app"><div className="shell">
    <div className="brand">CREATOR COLLEGE<b>SEMESTER ONE • MISSION 1</b></div>
    <section className="card">
      <div className="eye">I CAN CREATE</div>
      <h1 className="title">My Creator Identity</h1>
      <p className="lead">The first mission helps a young Creator name what they like to make, how they like to create, and what they want to try next.</p>
      {error&&<div className="notice">{error}</div>}
      {!error&&<div className="notice">{status}</div>}
      {creator&&<div className="id"><small>{allowed?'CREATOR-IN-TRAINING':'LOCKED'}</small><div className="avatar">{creator.avatar_key||'💡'}</div><h2>{creator.creator_name||creator.display_name}</h2><p className="muted">{creator.credits_total||0} Creator Credits</p></div>}
      {allowed?<>
        <div className="campus">
          <div className="tile"><small>MISSION GOAL</small><b>Build your Creator Identity.</b><p>Choose what you love making, what tools interest you, and what kind of Creator you want to explore becoming.</p></div>
          <div className="tile"><small>YOU WILL MAKE</small><b>Creator Identity Card</b><p>A saved Semester One artifact that grows beyond the Open House Campus Pass.</p></div>
          <div className="tile"><small>REWARD</small><b>+50 Creator Credits</b><p className="muted">Completion mechanics will be added in the next backend pass.</p></div>
        </div>
        <div className="notice">Mission 1 access is genuinely entitlement-gated. This page is the first proof that Shopify/Supabase purchase access can control the Creator Campus.</div>
      </>:<p className="lead">Return to the secure Locker to activate the staging entitlement test.</p>}
      <div className="actions"><a className="btn secondary" href={`/parent/creator/${creatorId}`}>Back to Secure Locker</a><a className="btn secondary" href="/parent">Grown-up Dashboard</a></div>
    </section>
  </div></main>;
}
