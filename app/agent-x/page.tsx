'use client';

import { FormEvent, useState } from 'react';

type ActivationData = {
  organization: { id: string; name: string };
  workforce: {
    id: string;
    recommendation_id: string;
    name: string;
    agents: { id: string; name: string; category: string }[];
  };
  mission: {
    id: string;
    template_id: string;
    name: string;
    objective: string;
    status: string;
    human_review_required: boolean;
  };
  report: { id: string; title: string };
};

const fieldStyle = {
  width: '100%',
  borderRadius: 14,
  border: '1px solid rgba(121,184,255,.22)',
  background: '#0b1320',
  color: '#fff',
  padding: '14px 14px',
  fontSize: 16,
  outline: 'none',
  boxSizing: 'border-box' as const,
};

export default function AgentXPage() {
  const [form, setForm] = useState({
    firstName: '',
    email: '',
    businessName: '',
    role: 'business',
    industry: 'small_business',
    mission: 'organize',
    challenge: 'need_systems',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activation, setActivation] = useState<ActivationData | null>(null);
  const [customOrganization, setCustomOrganization] = useState(false);

  const change = (key: string, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setActivation(null);
    setCustomOrganization(false);

    if (form.role === 'executive' || form.role === 'organization') {
      setCustomOrganization(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/agent-x/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const payload = await res.json();
      if (!res.ok || !payload?.ok) {
        throw new Error(payload?.error || 'Activation failed');
      }
      setActivation(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Activation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ax-landing">
      <style>{`
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }
        .ax-landing {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background: #05070a;
          color: #f5f7fb;
          font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .ax-landing:before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 84% 4%, rgba(49,135,255,.17), transparent 29%),
            linear-gradient(rgba(255,255,255,.016) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.016) 1px, transparent 1px);
          background-size: auto, 42px 42px, 42px 42px;
          mask-image: linear-gradient(to bottom, black, transparent 82%);
        }
        .ax-wrap {
          max-width: 1180px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        .ax-hero {
          padding: max(74px, calc(54px + env(safe-area-inset-top))) 24px 70px;
          background:
            radial-gradient(circle at 76% 28%, rgba(20,120,255,.18), transparent 38%),
            linear-gradient(180deg, #06090e, #090f18);
        }
        .ax-hero-grid {
          display: grid;
          grid-template-columns: minmax(0,1.35fr) minmax(320px,.65fr);
          gap: 42px;
          align-items: center;
        }
        .ax-kicker {
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .24em;
          color: #79b8ff;
        }
        .ax-title {
          font-size: clamp(64px,10vw,122px);
          line-height: .86;
          margin: 23px 0 14px;
          letter-spacing: -.068em;
          font-weight: 930;
        }
        .ax-subtitle {
          font-size: clamp(31px,4.3vw,56px);
          font-weight: 880;
          letter-spacing: -.045em;
          line-height: 1;
        }
        .ax-lead {
          font-size: 20px;
          line-height: 1.55;
          max-width: 760px;
          color: #b8c5d5;
          margin-top: 22px;
        }
        .ax-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 30px;
        }
        .ax-cta, .ax-open {
          min-height: 50px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 20px;
          border-radius: 999px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 950;
          letter-spacing: .045em;
        }
        .ax-cta.primary { background: #eef6ff; color: #07111d; }
        .ax-cta.secondary {
          border: 1px solid rgba(255,255,255,.18);
          color: #fff;
          background: rgba(255,255,255,.025);
        }
        .ax-stage {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 18px;
          padding: 9px 11px;
          border-radius: 999px;
          border: 1px solid rgba(121,184,255,.27);
          background: #09131f;
          color: #9fbfe8;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .08em;
        }
        .ax-status-rail {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 17px;
        }
        .ax-status-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 34px;
          padding: 0 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(8,13,20,.82);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .08em;
          color: #aebed1;
        }
        .ax-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #62e0a1;
          box-shadow: 0 0 15px rgba(98,224,161,.62);
        }
        .ax-console {
          border: 1px solid rgba(121,184,255,.24);
          border-radius: 28px;
          padding: 20px;
          background:
            radial-gradient(circle at 72% 0%, rgba(121,184,255,.16), transparent 34%),
            linear-gradient(180deg, rgba(17,27,41,.97), rgba(6,10,16,.99));
          box-shadow: 0 30px 90px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.06);
        }
        .ax-mark {
          width: 68px;
          height: 68px;
          border-radius: 20px;
          display: grid;
          place-items: center;
          font-size: 26px;
          font-weight: 950;
          letter-spacing: -.08em;
          background: linear-gradient(145deg,#15263a,#080d14);
          border: 1px solid rgba(121,184,255,.28);
        }
        .ax-console-eyebrow {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .17em;
          color: #79b8ff;
          margin-top: 18px;
        }
        .ax-console-title {
          font-size: 25px;
          letter-spacing: -.035em;
          margin: 8px 0 5px;
        }
        .ax-console-copy {
          font-size: 13px;
          line-height: 1.55;
          color: #8fa0b5;
        }
        .ax-flow { display: grid; gap: 9px; margin-top: 18px; }
        .ax-flow-row {
          display: grid;
          grid-template-columns: 34px 1fr auto;
          align-items: center;
          gap: 10px;
          padding: 11px;
          border-radius: 14px;
          background: #0b121c;
          border: 1px solid rgba(255,255,255,.06);
        }
        .ax-flow-num {
          width: 34px;
          height: 34px;
          border-radius: 11px;
          display: grid;
          place-items: center;
          background: #101d2c;
          color: #79b8ff;
          font-size: 11px;
          font-weight: 900;
        }
        .ax-flow-label { font-size: 13px; font-weight: 850; }
        .ax-flow-state {
          font-size: 10px;
          font-weight: 900;
          color: #86deb0;
          letter-spacing: .08em;
        }
        .ax-trust {
          display: grid;
          grid-template-columns: repeat(4,minmax(0,1fr));
          gap: 10px;
          padding: 0 24px;
          transform: translateY(-22px);
        }
        .ax-trust-item {
          padding: 16px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,.07);
          background: #080d14;
          box-shadow: 0 18px 50px rgba(0,0,0,.24);
        }
        .ax-trust-label {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .12em;
          color: #7389a3;
        }
        .ax-trust-value {
          margin-top: 6px;
          font-size: 14px;
          font-weight: 850;
          color: #dce8f5;
        }
        .ax-section { padding: 60px 24px; }
        .ax-section.tight { padding-top: 24px; }
        .ax-section-kicker {
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .2em;
          color: #79b8ff;
        }
        .ax-section-title {
          font-size: clamp(35px,5vw,61px);
          line-height: 1;
          letter-spacing: -.045em;
          margin: 12px 0 28px;
        }
        .ax-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit,minmax(235px,1fr));
          gap: 15px;
        }
        .ax-card {
          border: 1px solid rgba(90,170,255,.20);
          background: linear-gradient(180deg,rgba(18,27,40,.96),rgba(7,11,18,.98));
          border-radius: 22px;
          padding: 24px;
          box-shadow: 0 18px 60px rgba(0,0,0,.23);
          transition: transform .2s ease, border-color .2s ease;
        }
        .ax-card:hover {
          transform: translateY(-2px);
          border-color: rgba(121,184,255,.35);
        }
        .ax-how {
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 14px;
        }
        .ax-step {
          padding: 21px;
          border-radius: 20px;
          background: #09111b;
          border: 1px solid rgba(255,255,255,.07);
        }
        .ax-step-num {
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .15em;
          color: #79b8ff;
        }
        .ax-step h3 {
          font-size: 24px;
          letter-spacing: -.03em;
          margin: 10px 0 8px;
        }
        .ax-step p {
          color: #91a2b6;
          line-height: 1.55;
          margin: 0;
        }
        .ax-accountability {
          display: grid;
          grid-template-columns: minmax(0,.85fr) minmax(0,1.15fr);
          gap: 30px;
          align-items: start;
        }
        .ax-accountability-copy {
          color: #aab8c9;
          line-height: 1.65;
          font-size: 17px;
        }
        .ax-accountability-grid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 12px;
        }
        .ax-principle {
          min-height: 132px;
          padding: 18px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,.07);
          background: #08101a;
        }
        .ax-principle strong { display: block; font-size: 16px; }
        .ax-principle span {
          display: block;
          color: #8496ac;
          line-height: 1.5;
          margin-top: 7px;
          font-size: 13px;
        }
        .ax-builder {
          padding: 66px 24px;
          background:
            radial-gradient(circle at 18% 12%,rgba(36,115,225,.10),transparent 35%),
            #08101a;
        }
        .ax-form {
          margin-top: 28px;
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 16px;
        }
        .ax-field-wide { grid-column: 1 / -1; }
        .ax-field-label {
          margin-bottom: 7px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .035em;
          color: #9fb2ca;
        }
        .ax-submit {
          min-height: 52px;
          border: 0;
          border-radius: 999px;
          padding: 0 20px;
          background: #eef6ff;
          color: #07111d;
          font-size: 14px;
          font-weight: 950;
          letter-spacing: .035em;
          cursor: pointer;
        }
        .ax-submit:disabled { opacity: .68; cursor: wait; }
        .ax-error {
          grid-column: 1 / -1;
          padding: 13px 14px;
          border-radius: 13px;
          background: rgba(255,120,120,.07);
          border: 1px solid rgba(255,120,120,.20);
          color: #ffb0b0;
          line-height: 1.45;
        }
        .ax-result-grid { margin-top: 24px; display: grid; gap: 14px; }
        .ax-agent-result {
          display: grid;
          grid-template-columns: repeat(auto-fit,minmax(180px,1fr));
          gap: 10px;
          margin-top: 16px;
        }
        .ax-open { background: #79b8ff; color: #07111d; margin-top: 12px; }
        .ax-staged-handoff {
          min-height: 50px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-top: 12px;
          padding: 0 18px;
          border-radius: 999px;
          border: 1px solid rgba(121,184,255,.28);
          color: #9fc8f6;
          background: #0a1420;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .05em;
        }
        .ax-footer {
          padding: 28px 24px max(42px,calc(28px + env(safe-area-inset-bottom)));
          text-align: center;
          color: #5f7289;
          font-size: 12px;
          letter-spacing: .04em;
        }
        @media (max-width: 820px) {
          .ax-hero-grid, .ax-accountability { grid-template-columns: 1fr; }
          .ax-console { max-width: 620px; }
          .ax-trust {
            grid-template-columns: repeat(2,minmax(0,1fr));
            transform: none;
            padding-top: 14px;
          }
          .ax-how { grid-template-columns: 1fr; }
          .ax-title { font-size: clamp(62px,17vw,94px); }
        }
        @media (max-width: 620px) {
          .ax-hero {
            padding-left: 14px;
            padding-right: 14px;
            padding-bottom: 46px;
          }
          .ax-section, .ax-builder { padding-left: 14px; padding-right: 14px; }
          .ax-kicker { font-size: 10px; letter-spacing: .19em; line-height: 1.45; }
          .ax-subtitle { font-size: clamp(29px,9vw,42px); }
          .ax-lead { font-size: 16px; }
          .ax-actions { display: grid; grid-template-columns: 1fr; }
          .ax-cta { width: 100%; }
          .ax-stage {
            display: flex;
            width: 100%;
            border-radius: 14px;
            line-height: 1.35;
          }
          .ax-console { border-radius: 22px; padding: 17px; }
          .ax-trust {
            grid-template-columns: 1fr 1fr;
            padding-left: 14px;
            padding-right: 14px;
          }
          .ax-section-title { font-size: clamp(34px,11vw,50px); }
          .ax-form, .ax-accountability-grid { grid-template-columns: 1fr; }
          .ax-field-wide { grid-column: auto; }
          .ax-submit { width: 100%; }
          .ax-result-grid { margin-top: 18px; }
        }
        @media (max-width: 390px) {
          .ax-trust { grid-template-columns: 1fr; }
          .ax-flow-row { grid-template-columns: 34px 1fr; }
          .ax-flow-state { grid-column: 2; }
        }
      `}</style>

      <section className="ax-hero">
        <div className="ax-wrap ax-hero-grid">
          <div>
            <div className="ax-kicker">AGENT X · INTELLIGENCE WORKFORCE PLATFORM</div>
            <h1 className="ax-title">AGENT X</h1>
            <div className="ax-subtitle">Hire Intelligence.</div>
            <p className="ax-lead">
              Build an AI workforce around the mission you need accomplished—with clear roles,
              human approvals, mission tracking, and useful reports.
            </p>
            <div className="ax-actions">
              <a href="#build-my-team" className="ax-cta primary">BUILD MY TEAM</a>
              <a href="#agents" className="ax-cta secondary">EXPLORE AGENTS</a>
            </div>
            <div className="ax-stage">PRIVATE BUILD · STANDALONE AGENT X PLATFORM</div>
            <div className="ax-status-rail">
              <div className="ax-status-chip"><span className="ax-dot"></span>HUMAN-LED</div>
              <div className="ax-status-chip">APPROVAL-GATED</div>
              <div className="ax-status-chip">MISSION-BASED</div>
            </div>
          </div>

          <aside className="ax-console" aria-label="How Agent X works">
            <div className="ax-mark">AX</div>
            <div className="ax-console-eyebrow">FROM NEED TO WORKFORCE</div>
            <h2 className="ax-console-title">One mission. The right intelligence around it.</h2>
            <p className="ax-console-copy">
              Agent X starts with what needs to get done, assembles the right capabilities,
              then puts the mission behind human approval.
            </p>
            <div className="ax-flow">
              <div className="ax-flow-row">
                <div className="ax-flow-num">01</div>
                <div className="ax-flow-label">Define the mission</div>
                <div className="ax-flow-state">YOU LEAD</div>
              </div>
              <div className="ax-flow-row">
                <div className="ax-flow-num">02</div>
                <div className="ax-flow-label">Assemble the workforce</div>
                <div className="ax-flow-state">AGENT X</div>
              </div>
              <div className="ax-flow-row">
                <div className="ax-flow-num">03</div>
                <div className="ax-flow-label">Review before activation</div>
                <div className="ax-flow-state">APPROVAL</div>
              </div>
              <div className="ax-flow-row">
                <div className="ax-flow-num">04</div>
                <div className="ax-flow-label">Track reports + next moves</div>
                <div className="ax-flow-state">COMMAND</div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <div className="ax-wrap ax-trust" aria-label="Agent X trust model">
        <div className="ax-trust-item">
          <div className="ax-trust-label">CONTROL MODEL</div>
          <div className="ax-trust-value">Human leadership</div>
        </div>
        <div className="ax-trust-item">
          <div className="ax-trust-label">PERMISSIONS</div>
          <div className="ax-trust-value">No automatic escalation</div>
        </div>
        <div className="ax-trust-item">
          <div className="ax-trust-label">MISSION GATE</div>
          <div className="ax-trust-value">Review before activation</div>
        </div>
        <div className="ax-trust-item">
          <div className="ax-trust-label">REPORTING</div>
          <div className="ax-trust-value">Visible recommendations</div>
        </div>
      </div>

      <section className="ax-section tight">
        <div className="ax-wrap">
          <div className="ax-section-kicker">HOW IT WORKS</div>
          <h2 className="ax-section-title">From business need to controlled action.</h2>
          <div className="ax-how">
            <article className="ax-step">
              <div className="ax-step-num">01 · TELL US THE MISSION</div>
              <h3>Start with the outcome.</h3>
              <p>Choose the role, industry, mission and challenge. Agent X begins with what needs to be accomplished—not a generic tool list.</p>
            </article>
            <article className="ax-step">
              <div className="ax-step-num">02 · ASSEMBLE INTELLIGENCE</div>
              <h3>Build the right team.</h3>
              <p>Agent X matches capabilities into a workforce and prepares Mission 001 with assigned agents and a clear objective.</p>
            </article>
            <article className="ax-step">
              <div className="ax-step-num">03 · YOU APPROVE</div>
              <h3>Stay in command.</h3>
              <p>The mission enters the Command Center for human review, permissions, reporting and next-step recommendations.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="agents" className="ax-section">
        <div className="ax-wrap">
          <div className="ax-section-kicker">THE FOUNDING SIX</div>
          <h2 className="ax-section-title">Start with capability, not more software.</h2>
          <div className="ax-card-grid">
            {[
              ['Executive Assistant X','Leadership Intelligence'],
              ['Marketing X','Growth Intelligence'],
              ['Sales X','Opportunity Intelligence'],
              ['Customer Experience X','Relationship Intelligence'],
              ['Operations X','Systems Intelligence'],
              ['Research X','Market Intelligence'],
            ].map(([name,type], index) => (
              <article key={name} className="ax-card">
                <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}>
                  <div style={{fontSize:11,fontWeight:900,letterSpacing:'.14em',color:'#79b8ff'}}>{type}</div>
                  <div style={{fontSize:11,fontWeight:900,color:'#566b84'}}>0{index + 1}</div>
                </div>
                <h3 style={{fontSize:25,letterSpacing:'-.025em',margin:'14px 0 8px'}}>{name}</h3>
                <p style={{fontSize:13,lineHeight:1.5,color:'#8597ad',margin:0}}>
                  A defined intelligence capability that can be assigned to missions inside an Agent X workforce.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ax-section tight">
        <div className="ax-wrap">
          <div className="ax-section-kicker">READY-MADE WORKFORCES</div>
          <h2 className="ax-section-title">Start with a team built around the business.</h2>
          <div className="ax-card-grid">
            {[
              ['Small Business X','Your first AI department.'],
              ['Beauty Business X','Your talent built the business. Agent X builds the system behind it.'],
              ['Restaurant X','Great food deserves great systems.'],
              ['Creator Business X','Your creativity deserves a company.'],
            ].map(([name,copy]) => (
              <article key={name} className="ax-card">
                <div style={{fontSize:10,fontWeight:900,letterSpacing:'.14em',color:'#79b8ff'}}>WORKFORCE</div>
                <h3 style={{fontSize:27,letterSpacing:'-.03em',margin:'10px 0 10px'}}>{name}</h3>
                <p style={{color:'#aebaca',lineHeight:1.55,margin:0}}>{copy}</p>
                <div style={{fontSize:11,color:'#647991',marginTop:16}}>
                  Mission-ready · Human-controlled · Report-driven
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ax-section">
        <div className="ax-wrap ax-accountability">
          <div>
            <div className="ax-section-kicker">INTELLIGENCE WITH ACCOUNTABILITY</div>
            <h2 className="ax-section-title" style={{marginBottom:18}}>Power should come with controls.</h2>
            <p className="ax-accountability-copy">
              Agent X is designed around human leadership. It can recommend, prepare and support
              approved work, but permissions should remain visible, deliberate and revocable.
              Recommendations are not guarantees, and higher-risk actions can require another human gate.
            </p>
          </div>
          <div className="ax-accountability-grid">
            {[
              ['Human Leadership','People decide the mission, approvals and escalation level.'],
              ['Clear Purpose','Every agent is assigned to a defined business objective.'],
              ['Visible Permissions','Capability and permission levels stay explicit.'],
              ['Customer Control','Work can be paused, reviewed or redirected.'],
              ['Responsible Recommendations','Outputs are presented for judgment, not blind acceptance.'],
              ['Data Responsibility','Collect less, protect more, and respect business boundaries.'],
            ].map(([title,copy]) => (
              <div key={title} className="ax-principle">
                <strong>{title}</strong>
                <span>{copy}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="build-my-team" className="ax-builder">
        <div style={{maxWidth:980,margin:'0 auto',position:'relative',zIndex:1}}>
          <div className="ax-section-kicker">BUILD MY TEAM</div>
          <h2 className="ax-section-title" style={{marginBottom:12}}>What do you need accomplished?</h2>
          <p style={{fontSize:18,color:'#b6c2d1',lineHeight:1.55,maxWidth:760,marginTop:0}}>
            Answer a few questions. Agent X will assemble a launch workforce and prepare Mission 001 for your review.
          </p>

          <form onSubmit={submit} className="ax-card ax-form">
            <label>
              <div className="ax-field-label">First name</div>
              <input value={form.firstName} onChange={e=>change('firstName',e.target.value)} style={fieldStyle}/>
            </label>
            <label>
              <div className="ax-field-label">Email</div>
              <input required type="email" value={form.email} onChange={e=>change('email',e.target.value)} style={fieldStyle}/>
            </label>
            <label className="ax-field-wide">
              <div className="ax-field-label">Business / organization name</div>
              <input required value={form.businessName} onChange={e=>change('businessName',e.target.value)} style={fieldStyle}/>
            </label>
            <label>
              <div className="ax-field-label">Who are you?</div>
              <select value={form.role} onChange={e=>change('role',e.target.value)} style={fieldStyle}>
                <option value="business">Business owner</option>
                <option value="creator">Creator</option>
                <option value="executive">Executive</option>
                <option value="organization">Organization leader</option>
              </select>
            </label>
            <label>
              <div className="ax-field-label">Industry</div>
              <select value={form.industry} onChange={e=>change('industry',e.target.value)} style={fieldStyle}>
                <option value="small_business">Small business</option>
                <option value="beauty">Beauty</option>
                <option value="restaurant">Restaurant</option>
                <option value="creator_business">Creator business</option>
                <option value="organization">Organization</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              <div className="ax-field-label">Primary mission</div>
              <select value={form.mission} onChange={e=>change('mission',e.target.value)} style={fieldStyle}>
                <option value="grow">Grow</option>
                <option value="organize">Organize</option>
                <option value="create">Create</option>
                <option value="connect">Connect with customers</option>
                <option value="scale">Prepare to scale</option>
              </select>
            </label>
            <label>
              <div className="ax-field-label">Biggest challenge</div>
              <select value={form.challenge} onChange={e=>change('challenge',e.target.value)} style={fieldStyle}>
                <option value="need_systems">Need better systems</option>
                <option value="need_customers">Need more customers</option>
                <option value="too_much_work">Too much work</option>
                <option value="too_many_ideas">Too many ideas</option>
                <option value="communication">Communication</option>
                <option value="need_information">Need better information</option>
              </select>
            </label>
            <div className="ax-field-wide">
              <button disabled={loading} type="submit" className="ax-submit">
                {loading ? 'ASSEMBLING WORKFORCE…' : 'ASSEMBLE MY WORKFORCE'}
              </button>
            </div>
            {error && (
              <div className="ax-error">
                We could not complete the preview activation: {error}
              </div>
            )}
          </form>

          {customOrganization && (
            <section className="ax-result-grid">
              <div className="ax-card" style={{border:'1px solid rgba(121,184,255,.42)'}}>
                <div style={{fontSize:11,letterSpacing:'.18em',color:'#79b8ff',fontWeight:900}}>
                  CUSTOM ORGANIZATION WORKFORCE
                </div>
                <h3 style={{fontSize:34,letterSpacing:'-.035em',margin:'10px 0 8px'}}>
                  Your workforce should be designed around your organization.
                </h3>
                <p style={{color:'#b8c5d6',lineHeight:1.6,maxWidth:760}}>
                  Executive and organization deployments can involve multiple departments,
                  permissions, data boundaries and approval paths. We do not force those needs
                  into a small-business template.
                </p>
                <div className="ax-staged-handoff">
                  PRIVATE ORGANIZATION WORKFORCE · INTRODUCTION PATH IN BUILD
                </div>
              </div>
            </section>
          )}

          {activation && (
            <section className="ax-result-grid">
              <div className="ax-card" style={{border:'1px solid rgba(98,224,161,.35)'}}>
                <div style={{fontSize:11,letterSpacing:'.18em',color:'#62e0a1',fontWeight:900}}>
                  WORKFORCE ASSEMBLED
                </div>
                <h3 style={{fontSize:34,letterSpacing:'-.035em',margin:'10px 0 8px'}}>
                  {activation.workforce.name}
                </h3>
                <p style={{color:'#aebaca'}}>Prepared for {activation.organization.name}.</p>
                <div className="ax-agent-result">
                  {activation.workforce.agents.map(agent=>(
                    <div key={agent.id} style={{padding:14,borderRadius:13,background:'#0d1420',border:'1px solid rgba(255,255,255,.05)'}}>
                      <strong>{agent.name}</strong>
                      <div style={{fontSize:13,color:'#8393a8',marginTop:5}}>{agent.category}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ax-card">
                <div style={{fontSize:11,letterSpacing:'.18em',color:'#79b8ff',fontWeight:900}}>
                  MISSION 001 · READY FOR REVIEW
                </div>
                <h3 style={{fontSize:30,letterSpacing:'-.03em',margin:'10px 0'}}>
                  {activation.mission.name}
                </h3>
                <p style={{color:'#b8c5d6',lineHeight:1.55}}>
                  {activation.mission.objective}
                </p>
                <div style={{color:'#9aacbf'}}>
                  Status: {activation.mission.status.toUpperCase()} · Human review required
                </div>
              </div>

              <div className="ax-card">
                <div style={{fontSize:11,letterSpacing:'.18em',color:'#79b8ff',fontWeight:900}}>
                  FIRST REPORT CREATED
                </div>
                <h3 style={{fontSize:27,letterSpacing:'-.03em',margin:'10px 0'}}>
                  {activation.report.title}
                </h3>
                <p style={{color:'#aebaca'}}>
                  Your assessment, workforce, Mission 001 and first intelligence brief are stored.
                  Review the mission and activate it from your Command Center.
                </p>
                <a
                  href={`/agent-x/command-center?organization_id=${encodeURIComponent(activation.organization.id)}`}
                  className="ax-open"
                >
                  OPEN COMMAND CENTER
                </a>
              </div>
            </section>
          )}
        </div>
      </section>

      <footer className="ax-footer">
        AGENT X · STANDALONE PRIVATE BUILD · INTENDED HOME: XAGENTX.SI
      </footer>
    </main>
  );
}
