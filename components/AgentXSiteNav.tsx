'use client';

import Link from 'next/link';

const links = [
  ['Home','/'],
  ['Workforces','/workforces'],
  ['Agents','/agents'],
  ['Trust','/trust'],
  ['Pilot','/pilot'],
];

export default function AgentXSiteNav() {
  return (
    <>
      <style>{`
        .axs-nav-shell{position:sticky;top:0;z-index:50;background:rgba(5,7,10,.86);backdrop-filter:blur(16px);border-bottom:1px solid rgba(255,255,255,.06)}
        .axs-nav{max-width:1180px;margin:0 auto;min-height:64px;padding:0 18px;display:flex;align-items:center;justify-content:space-between;gap:18px}
        .axs-brand{text-decoration:none;color:#f5f7fb;font-weight:950;letter-spacing:-.035em;font-size:18px;display:flex;align-items:center;gap:10px}
        .axs-mark{width:34px;height:34px;display:grid;place-items:center;border-radius:10px;background:linear-gradient(145deg,#15263a,#080d14);border:1px solid rgba(121,184,255,.28);font-size:13px;letter-spacing:-.07em}
        .axs-links{display:flex;align-items:center;gap:6px}
        .axs-link,.axs-command{text-decoration:none;min-height:40px;display:inline-flex;align-items:center;padding:0 10px;border-radius:999px;font-size:11px;font-weight:900;letter-spacing:.05em}
        .axs-link{color:#aebed1}
        .axs-link:hover{background:#0b121c;color:#fff}
        .axs-command{color:#07111d;background:#eef6ff;padding:0 13px}
        @media(max-width:760px){
          .axs-nav{min-height:58px;padding:0 12px;overflow:hidden}
          .axs-links{overflow-x:auto;justify-content:flex-start;scrollbar-width:none}
          .axs-links::-webkit-scrollbar{display:none}
          .axs-link{display:none}
          .axs-command{white-space:nowrap}
        }
      `}</style>
      <div className="axs-nav-shell">
        <nav className="axs-nav" aria-label="Agent X">
          <Link className="axs-brand" href="/">
            <span className="axs-mark">AX</span>
            <span>AGENT X</span>
          </Link>
          <div className="axs-links">
            {links.map(([label,href]) => <Link key={href} className="axs-link" href={href}>{label}</Link>)}
            <Link className="axs-command" href="/command-center">COMMAND CENTER</Link>
          </div>
        </nav>
      </div>
    </>
  );
}
