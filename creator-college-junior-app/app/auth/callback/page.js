'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '../../../lib/supabase/browser';

export default function AuthCallback() {
  const [message,setMessage] = useState('Signing you in…');

  useEffect(()=>{
    async function run(){
      const supabase = getSupabaseBrowserClient();
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const next = params.get('next') || '/parent/claim';
      if (!code) { setMessage('The sign-in link is missing its code. Please request a new one.'); return; }
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) { setMessage(error.message); return; }
      window.location.replace(next.startsWith('/') ? next : '/parent/claim');
    }
    run();
  },[]);

  return <main className="app"><div className="shell"><section className="card"><div className="eye">SECURE SIGN IN</div><h1 className="title">{message}</h1></section></div></main>;
}
