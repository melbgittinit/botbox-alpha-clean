import "./creator-college.css";

export const metadata = {
  title: "Creator College | The HUB",
  description: "Turn your ideas, skills, knowledge, and experiences into something real.",
};

const creationPaths = [
  { icon: "📘", title: "DIGITAL PRODUCT", copy: "Create a guide, checklist, workbook, planner or resource kit.", href: "/creator-college/digital", time: "45–60 min" },
  { icon: "🎥", title: "VIDEO SERIES", copy: "Turn one idea into a focused five-part video series.", href: "/creator-college/video", time: "30–45 min" },
  { icon: "⛪", title: "EVENT KIT", copy: "Plan, promote, run and follow up on a group experience.", href: "/creator-college/event", time: "45–60 min" },
  { icon: "💼", title: "SERVICE OFFER", copy: "Package a useful skill into a clear customer-facing offer.", href: "/creator-college/service", time: "45 min" },
  { icon: "🎨", title: "STARTER BRAND", copy: "Turn finished creations into a recognizable identity.", href: "/creator-college/brand", time: "60 min" },
  { icon: "▣", title: "BUSINESS SYSTEM", copy: "Turn proven work into a simple operating business system.", href: "/creator-college/business", time: "60 min" },
] as const;

export default function CreatorCollegePage() {
  return (
    <main className="cc-shell">
      <section aria-label="Creator College platform identity" style={{ background: "#050505", color: "#fff", borderBottom: "1px solid rgba(216,177,90,.28)", padding: "12px 22px", display: "flex", gap: "14px", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <a href="/hub" style={{ color: "#d8b15a", textDecoration: "none", fontWeight: 800, letterSpacing: ".08em", fontSize: "12px" }}>← THE HUB</a>
        <div style={{ textAlign: "center", flex: "1 1 320px" }}><strong style={{ letterSpacing: ".08em" }}>CREATOR COLLEGE</strong><span style={{ opacity: .62, margin: "0 9px" }}>•</span><span style={{ opacity: .78, fontSize: "13px" }}>AI Assisted — Powered by The HUB</span></div>
        <a href="/creator-college/desk" style={{ color: "#fff", textDecoration: "none", border: "1px solid rgba(255,255,255,.18)", borderRadius: "999px", padding: "7px 12px", fontSize: "12px", fontWeight: 700 }}>MY CREATOR DESK</a>
      </section>

      <section className="cc-hero" style={{ maxWidth: 1080 }}>
        <div className="cc-cap">🎓</div>
        <div className="cc-eyebrow">THE CREATION ENGINE INSIDE THE HUB</div>
        <h1>YOU’VE ALWAYS WANTED TO MAKE SOMETHING.<br/><span>NOW YOU CAN.</span></h1>
        <p style={{ maxWidth: 760, margin: "0 auto" }}>Turn your ideas, skills, knowledge and experiences into something real. Start small. Finish something. Then grow what you made.</p>
        <div className="cc-actions">
          <a className="primary" href="/creator-college/start">START MY CREATOR PATH</a>
          <a className="secondary" href="#creation-lab">SHOW ME WHAT I CAN MAKE</a>
        </div>
      </section>

      <section className="cc-compass-card">
        <div><span>⚡</span><strong>SMART START</strong><p>Use your saved audience, goals, voice and brand settings to begin faster—or start fresh.</p></div>
        <a className="primary" href="/creator-college/start">FIND MY BEST START</a>
      </section>

      <section className="cc-section" id="creation-lab">
        <div className="cc-section-head"><div><span className="cc-eyebrow">CREATION LAB</span><h2>WHAT DO YOU WANT TO MAKE?</h2></div><p>Every path leads to a finished result.</p></div>
        <div className="cc-grid">
          {creationPaths.map((item) => <article className="cc-tile" key={item.title}><span className="cc-icon">{item.icon}</span><h3>{item.title}</h3><p>{item.copy}</p><small>{item.time} · Guided Build</small><a className="primary" href={item.href}>START</a></article>)}
        </div>
      </section>

      <section className="cc-journey">
        <div>🧭<b>DISCOVER</b><small>Choose the opportunity</small></div><i>→</i>
        <div>🧪<b>CREATE</b><small>Build the work</small></div><i>→</i>
        <div>✓<b>FINISH</b><small>Complete it</small></div><i>→</i>
        <div>🗄️<b>ORGANIZE</b><small>Keep it connected</small></div><i>→</i>
        <div>↗<b>GROW</b><small>Build what comes next</small></div>
      </section>

      <section className="cc-section">
        <div className="cc-section-head"><div><span className="cc-eyebrow">YOUR WORKING HOME</span><h2>DON’T LOSE WHAT YOU CREATE.</h2></div><p>Creator Desk and Locker keep your work, progress and next move together.</p></div>
        <div className="cc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
          <article className="cc-tile"><span className="cc-icon">✦</span><h3>MY CREATOR DESK</h3><p>See the next best action, recent work and quick creation paths.</p><a className="primary" href="/creator-college/desk">OPEN MY DESK</a></article>
          <article className="cc-tile"><span className="cc-icon">🗄️</span><h3>MY CREATOR LOCKER</h3><p>Open finished work, continue drafts and see creation families.</p><a className="primary" href="/creator-college/locker">OPEN MY LOCKER</a></article>
          <article className="cc-tile"><span className="cc-icon">◇</span><h3>BRAND HALL</h3><p>When multiple creations belong together, organize them into a brand.</p><a className="primary" href="/creator-college/brand-hall">OPEN BRAND HALL</a></article>
        </div>
      </section>

      <section className="cc-section">
        <div style={{ borderRadius: 30, background: "#11162b", color: "white", padding: "clamp(30px,5vw,58px)", display: "grid", gap: 20 }}>
          <span className="cc-eyebrow" style={{ color: "#ffb526" }}>CREATOR COLLEGE FOR ORGANIZATIONS</span>
          <h2 style={{ fontSize: "clamp(2rem,4vw,3.6rem)", margin: 0 }}>YOUR PEOPLE ALREADY HAVE SOMETHING TO CREATE.</h2>
          <p style={{ color: "#c8cee3", maxWidth: 780, lineHeight: 1.65 }}>Schools, churches, businesses and communities can use Creator College to help people turn knowledge, creativity and experience into meaningful projects.</p>
          <div className="cc-actions" style={{ justifyContent: "flex-start" }}><a className="primary" href="/creator-college/institutions">EXPLORE ORGANIZATIONAL CREATOR COLLEGE</a></div>
        </div>
      </section>

      <section className="cc-section">
        <div style={{ textAlign: "center", padding: "48px 24px" }}><span className="cc-eyebrow">EVERYONE HAS SOMETHING TO CREATE.</span><h2 style={{ fontSize: "clamp(2rem,4vw,3.6rem)", margin: "12px 0" }}>BRING AN IDEA. LEAVE WITH SOMETHING MADE.</h2><div className="cc-actions"><a className="primary" href="/creator-college/start">START NOW</a><a className="secondary" href="/hub">RETURN TO THE HUB</a></div></div>
      </section>
    </main>
  );
}
