'use client';

import { useState } from 'react';
import { getSupabaseBrowserClient } from '../../../lib/supabase/browser';

export default function ParentSignIn() {
  const [email,setEmail] = useState('');
  const [status,setStatus] = useState('');
  const [busy,setBusy] = useState(false);

  async function sendLink(e) {
    e.preventDefault();
    setBusy(true); setStatus('');
    const supabase = getSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/parent/claim`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo }
    });
    setBusy(false);
    setStatus(error ? error.message : 'Check your email for your secure sign-in link.');
  }

  return <main className="app"><div className="shell"><div className="brand">CREATOR COLLEGE<b>GROWN-UP SIGN IN</b></div><section className="card">
    <div className="eye">SECURE PARENT ACCESS</div>
    <h1 className="title">Save this Creator journey.</h1>
    <p className="lead">Enter the grown-up email used during Open House. We’ll send a secure sign-in link—no child password needed.</p>
    <form onSubmit={sendLink}>
      <label className="field"><b>GROWN-UP EMAIL</b><input className="input" type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} /></label>
      <button className="btn primary" disabled={busy}>{busy?'Sending…':'Send Secure Sign-In Link'}</button>
    </form>
    {status && <div className="notice" style={{marginTop:18}}>{status}</div>}
    <div className="actions"><a className="btn secondary" href="/">Back to Open House</a></div>
  </section></div></main>;
}
