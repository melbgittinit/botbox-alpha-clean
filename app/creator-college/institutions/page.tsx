import "../creator-college.css";

export const metadata = {
  title: "Creator College for Organizations | The HUB",
  description: "Help students, members, teams and communities turn knowledge, creativity and experience into meaningful projects.",
};

const audiences = [
  {
    icon: "🏫",
    title: "SCHOOLS",
    copy: "Move students from only consuming information to creating meaningful projects, portfolios and useful work.",
    outcomes: ["Student projects", "Creator portfolios", "Teacher-guided cohorts"],
  },
  {
    icon: "⛪",
    title: "CHURCHES",
    copy: "Turn the gifts, wisdom, stories and skills inside a congregation into resources that can serve people.",
    outcomes: ["Teaching resources", "Events and outreach", "Legacy and story projects"],
  },
  {
    icon: "🏢",
    title: "BUSINESSES",
    copy: "Give teams a practical creation system for documenting knowledge, improving processes and developing ideas.",
    outcomes: ["Knowledge capture", "Training resources", "Internal innovation"],
  },
  {
    icon: "🌍",
    title: "COMMUNITIES",
    copy: "Help residents turn lived experience, local knowledge and practical skills into projects and opportunity.",
    outcomes: ["Community resources", "Workforce projects", "Local creator showcases"],
  },
] as const;

const pilotPhases = [
  ["01", "DISCOVER", "Identify the people, goals and creation opportunities already inside the organization."],
  ["02", "CREATE", "Participants use Creator Compass and guided builders to start useful, finishable projects."],
  ["03", "COMPLETE", "The program emphasizes finished work, not just lessons or attendance."],
  ["04", "SHOWCASE", "Organizations can review completed creations and participant stories."],
  ["05", "GROW", "Use the strongest signals to decide what to repeat, expand or connect elsewhere in THE HUB."],
] as const;

export default function CreatorCollegeInstitutionsPage() {
  return (
    <main className="cc-shell">
      <header className="cc-topbar">
        <a className="cc-back" href="/creator-college">← CREATOR COLLEGE</a>
        <div className="cc-brandmark"><span>🎓</span><strong>CREATOR</strong> COLLEGE <em>• THE HUB</em></div>
        <a className="cc-back" href="/hub">THE HUB →</a>
      </header>

      <section className="cc-hero" style={{ maxWidth: 1040 }}>
        <div className="cc-cap">✦</div>
        <div className="cc-eyebrow">CREATOR COLLEGE FOR ORGANIZATIONS</div>
        <h1>YOUR PEOPLE ALREADY HAVE<br/><span>SOMETHING TO CREATE.</span></h1>
        <p style={{ maxWidth: 780, margin: "0 auto" }}>
          Creator College helps schools, churches, businesses and communities turn knowledge, creativity and experience into meaningful projects through a guided AI-assisted creation system.
        </p>
        <div className="cc-actions">
          <a className="primary" href="#pilot">EXPLORE A 90-DAY PILOT</a>
          <a className="secondary" href="/creator-college">EXPERIENCE CREATOR COLLEGE</a>
        </div>
        <p style={{ marginTop: 18, fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase" }}>
          AI Assisted — Powered by The HUB
        </p>
      </section>

      <section className="cc-section">
        <div className="cc-section-head">
          <div>
            <span className="cc-eyebrow">WHO IT CAN SERVE</span>
            <h2>ONE CREATION SYSTEM. DIFFERENT COMMUNITIES.</h2>
          </div>
          <p>Start with a real group and a real creation goal.</p>
        </div>
        <div className="cc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))" }}>
          {audiences.map((item) => (
            <article className="cc-tile" key={item.title}>
              <span className="cc-icon">{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
              <div style={{ display: "grid", gap: 7, marginTop: 6 }}>
                {item.outcomes.map((outcome) => <small key={outcome}>✓ {outcome}</small>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cc-section">
        <div style={{ borderRadius: 30, background: "#11162b", color: "white", padding: "clamp(28px,5vw,56px)", boxShadow: "0 22px 70px rgba(17,22,43,.2)" }}>
          <span className="cc-eyebrow" style={{ color: "#ffb526" }}>THE ORGANIZATIONAL PROMISE</span>
          <h2 style={{ fontSize: "clamp(2rem,4vw,3.5rem)", margin: "12px 0", letterSpacing: "-.035em" }}>MOVE PEOPLE FROM POTENTIAL TO PROOF.</h2>
          <p style={{ color: "#c8cee3", maxWidth: 820, lineHeight: 1.7, fontSize: 18 }}>
            Creator College is not designed around passive course completion. Participants discover what they can make, build something useful, finish it, organize the result and identify a sensible next step.
          </p>
          <div className="cc-journey" style={{ margin: "30px 0 0", background: "rgba(255,255,255,.05)", maxWidth: "none" }}>
            <div>🧭<b>DISCOVER</b><small>Find the opportunity</small></div><i>→</i>
            <div>🧪<b>CREATE</b><small>Build the project</small></div><i>→</i>
            <div>✓<b>COMPLETE</b><small>Finish the work</small></div><i>→</i>
            <div>✦<b>SHOWCASE</b><small>See the proof</small></div><i>→</i>
            <div>↗<b>GROW</b><small>Choose what is next</small></div>
          </div>
        </div>
      </section>

      <section className="cc-section" id="pilot">
        <div className="cc-section-head">
          <div>
            <span className="cc-eyebrow">90-DAY CREATOR ACTIVATION PILOT</span>
            <h2>START SMALL ENOUGH TO LEARN. STRONG ENOUGH TO MATTER.</h2>
          </div>
          <p>A pilot is the preferred first institutional step.</p>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {pilotPhases.map(([num, title, copy]) => (
            <article key={title} style={{ display: "grid", gridTemplateColumns: "72px 170px 1fr", gap: 18, alignItems: "center", padding: 20, background: "white", border: "1px solid var(--cc-border)", borderRadius: 20 }}>
              <strong style={{ fontSize: 26, color: "var(--cc-blue)" }}>{num}</strong>
              <b>{title}</b>
              <span style={{ color: "var(--cc-muted)", lineHeight: 1.6 }}>{copy}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="cc-section">
        <div className="cc-compass-card" style={{ margin: 0, maxWidth: "none" }}>
          <div>
            <span>📋</span>
            <strong>WHAT A PILOT SHOULD PROVE</strong>
            <p>Can people understand the system, start something meaningful, finish it and show evidence of growth?</p>
          </div>
          <a className="primary" href="/creator-college">TRY THE CREATOR EXPERIENCE</a>
        </div>
      </section>

      <section className="cc-section">
        <div style={{ textAlign: "center", padding: "48px 24px", border: "1px solid var(--cc-border)", borderRadius: 28, background: "linear-gradient(135deg,#fff,#f4f7ff)" }}>
          <span className="cc-eyebrow">THE NEXT CONVERSATION</span>
          <h2 style={{ fontSize: "clamp(2rem,4vw,3.4rem)", margin: "12px 0" }}>WHAT COULD YOUR PEOPLE CREATE?</h2>
          <p style={{ color: "var(--cc-muted)", maxWidth: 700, margin: "0 auto 24px", lineHeight: 1.65 }}>
            The next institutional step is a short pilot-fit conversation: who the participants are, what they should be able to create, what success would look like and how the finished work will be reviewed.
          </p>
          <div className="cc-actions">
            <a className="primary" href="/creator-college">ENTER CREATOR COLLEGE</a>
            <a className="secondary" href="/hub">RETURN TO THE HUB</a>
          </div>
          <small style={{ display: "block", marginTop: 18, color: "var(--cc-muted)" }}>
            Pilot-request capture will be connected to the HUB contact workflow before public institutional outreach begins.
          </small>
        </div>
      </section>
    </main>
  );
}
