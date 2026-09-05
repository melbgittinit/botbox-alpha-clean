'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '../../../lib/supabase/browser';

const KEY='ccj-open-house-v3';
const schools={video:'Video & TV',voice:'Voice & Podcasting',design:'Design',stories:'Stories',ai:'AI & Digital Creation',business:'Creator Business',ideas:'Big Ideas'};
const picks=[['videos',{video:3,voice:1,stories:1}],['design',{design:3,stories:1,business:1}],['invent',{ideas:3,ai:1,business:1}],['stories',{stories:3,voice:1,video:1}],['tech',{ai:3,ideas:2}],['products',{business:3,design:1,ideas:1}],['perform',{voice:3,video:2}],['worlds',{stories:2,design:1,ideas:2}]];
function score(selected){const r={video:0,voice:0,design:0,stories:0,ai:0,business:0,ideas:0};selected.forEach((id)=>{const p=picks.find((x)=>x[0]===id);if(p)Object.entries(p[1]).forEach(([k,v])=>r[k]+=v)});return Object.entries(r).sort((a,b)=>b[1]-a[1]).slice(0,3)}

export default function ClaimOpenHouse(){
  const [saved,setSaved]=useState(null);
  const [status,setStatus]=useState('Checking secure session…');
  const [busy,setBusy]=useState(false);
  const [userEmail,setUserEmail]=useState('');
  const mix=useMemo(()=>score(saved?.picks||[]),[saved]);

  useEffect(()=>{
    async function load(){
      try{const raw=localStorage.getItem(KEY);if(raw)setSaved(JSON.parse(raw));}catch{}
      const supabase=getSupabaseBrowserClient();
      const {data:{user}}=await supabase.auth.getUser();
      if(!user){window.location.replace('/parent/sign-in');return;}
      setUserEmail(user.email||'');
      setStatus('Ready to save this Creator journey securely.');
    }
    load();
  },[]);

  async function claim(){
    if(!saved) return;
    setBusy(true);setStatus('Saving securely…');
    const supabase=getSupabaseBrowserClient();
    const creatorMix=mix.map(([key,value])=>({key,label:schools[key],score:value}));
    const {data,error}=await supabase.rpc('save_open_house',{
      p_parent_first_name:saved.parent||'',
      p_creator_display_name:saved.creator||'Creator',
      p_age_band:saved.age||'8-10',
      p_creator_name:saved.creator||'',
      p_avatar_key:saved.avatar||'🎥',
      p_creator_mix:creatorMix,
      p_creator_style:saved.styles||[],
      p_idea_title:saved.name||'My First Creator Idea',
      p_idea_content:{audience:saved.audience||'',problem:saved.problem||'',idea:saved.idea||'',source:'open-house'}
    });
    setBusy(false);
    if(error){setStatus(`Could not save yet: ${error.message}`);return;}
    localStorage.setItem('ccj-last-creator-id',data);
    setStatus('Saved! This Creator journey is now attached to your secure grown-up account.');
  }

  async function signOut(){const supabase=getSupabaseBrowserClient();await supabase.auth.signOut();window.location.replace('/');}

  return <main className="app"><div className="shell"><div className="brand">CREATOR COLLEGE<b>GROWN-UP CLAIM</b></div><section className="card">
    <div className="eye">SECURE PARENT ACCOUNT</div><h1 className="title">Claim this Open House.</h1>
    <p className="lead">Signed in as <b>{userEmail||'grown-up'}</b>. Saving here moves the Creator ID, first idea, badge and credits from this device into the secure staging database.</p>
    {!saved&&<div className="notice">No Open House journey was found on this device. Complete the free Open House first.</div>}
    {saved&&<><div className="id"><small>READY TO SAVE</small><div className="avatar">{saved.avatar||'💡'}</div><h2>{saved.creator||'Creator'}</h2><p className="muted">{saved.name||'My First Creator Idea'}</p><p>{saved.idea||''}</p></div><div className="mix">{mix.map(([k],i)=><div key={k}><em>#{i+1}</em><b>{schools[k]}</b></div>)}</div><button className="btn primary" disabled={busy} onClick={claim}>{busy?'Saving…':'Save Creator Journey Securely'}</button></>}
    <div className="notice" style={{marginTop:18}}>{status}</div>
    <div className="actions"><a className="btn secondary" href="/locker">View Locker</a><a className="btn secondary" href="/">Back to Open House</a><button className="btn secondary" onClick={signOut}>Sign out</button></div>
  </section></div></main>;
}
