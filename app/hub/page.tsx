import prisma from "../../lib/prisma";

export const dynamic = "force-dynamic";

const MODE_GROUPS = [
  ["Family", "family", "⌂", "Home, care, schedules and family life."],
  ["Creator / Business", "creator", "✦", "Launches, clients, projects and audience."],
  ["Church / Event", "gathering", "◇", "Services, programs, gatherings and coordination."],
  ["Coach / Teacher", "teaching", "◎", "Sessions, learners, groups and progress."],
] as const;

export default async function HubPage() {
  const workspaces = await prisma.workspace.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="hub-shell">
      <section className="hub-front-stage">
        <div className="hub-front-copy-block">
          <div className="hub-eyebrow">YOUR OPERATING HOME</div>
          <h1 className="hub-front-title">THE HUB</h1>
          <div className="hub-front-tagline">Run what matters.</div>
          <p className="hub-front-copy">
            HUB helps organize people, schedules, events, media and next actions in one clear operating home.
          </p>
        </div>

        <div className="hub-front-graphic" aria-hidden="true">
          <div className="hub-front-orbit hub-front-orbit-one" />
          <div className="hub-front-orbit hub-front-orbit-two" />
          <div className="hub-front-beam hub-front-beam-one" />
          <div className="hub-front-beam hub-front-beam-two" />
          <div className="hub-front-core">
            <span>HUB</span>
            <small>OPERATING HOME</small>
          </div>
        </div>
      </section>

      <section
        aria-label="Creator College"
        style={{
          margin: "26px 0",
          padding: "34px",
          borderRadius: "26px",
          border: "1px solid rgba(216,177,90,.32)",
          background: "linear-gradient(135deg, rgba(216,177,90,.12), rgba(77,163,255,.08), rgba(255,255,255,.03))",
          boxShadow: "0 22px 70px rgba(0,0,0,.28)",
          display: "grid",
          gap: "22px",
          gridTemplateColumns: "minmax(0,1.25fr) minmax(260px,.75fr)",
          alignItems: "center",
        }}
      >
        <div>
          <div className="hub-eyebrow">FEATURED HUB DESTINATION</div>
          <h2 style={{ margin: "8px 0 10px", fontSize: "clamp(30px,4vw,52px)" }}>Creator College</h2>
          <p className="hub-copy" style={{ maxWidth: "760px", fontSize: "18px" }}>
            Turn your ideas, skills, knowledge and experiences into something real — guides, videos, events, services, brands and businesses.
          </p>
          <p style={{ margin: "14px 0 0", opacity: .72, fontSize: "13px", letterSpacing: ".04em" }}>
            AI Assisted — Powered by The HUB
          </p>
        </div>
        <div style={{ display: "grid", gap: "12px" }}>
          <a className="hub-button hub-button-primary" href="/creator-college">
            ENTER CREATOR COLLEGE
          </a>
          <a className="hub-button hub-button-secondary" href="/creator-college/desk">
            OPEN MY CREATOR DESK
          </a>
          <a className="hub-inline-link" href="/creator-college/institutions">
            CREATOR COLLEGE FOR ORGANIZATIONS →
          </a>
          <small style={{ opacity: .7, lineHeight: 1.45 }}>
            Start small. Finish something. Then grow what you made.
          </small>
        </div>
      </section>

      <section className="hub-mode-doors" aria-label="Primary HUB operating modes">
        {MODE_GROUPS.map(([title, kind, icon, copy]) => (
          <div className={`hub-mode-door hub-mode-door-${kind}`} key={title}>
            <div className="hub-mode-door-visual" aria-hidden="true">
              <span>{icon}</span>
            </div>
            <div>
              <strong>{title}</strong>
              <small>{copy}</small>
            </div>
          </div>
        ))}
      </section>

      {workspaces.length === 0 ? (
        <section className="hub-empty-state">
          <div className="hub-eyebrow">START HERE</div>
          <h2>Your HUB starts with what you run.</h2>
          <p className="hub-copy">
            Set up one operating space and HUB will give you a clear home for the people, events and next actions inside it.
          </p>
          <a className="hub-button hub-button-primary" href="/hub/new">
            SET UP MY HUB
          </a>
        </section>
      ) : (
        <section className="hub-workspaces-section">
          <div className="hub-section-title-row">
            <div>
              <div className="hub-eyebrow">YOUR HUBS</div>
              <h2>Open an operating home.</h2>
            </div>
            <a className="hub-inline-link" href="/hub/new">+ Create another</a>
          </div>

          <div className="hub-workspace-grid">
            {workspaces.map((workspace) => (
              <a
                className={`hub-workspace-card hub-workspace-${workspace.mode.toLowerCase()}`}
                key={workspace.id}
                href={`/hub/${workspace.id}`}
              >
                <div className="hub-workspace-glow" aria-hidden="true" />
                <div className="hub-workspace-mode hub-eyebrow">{workspace.mode}</div>
                <h2>{workspace.name}</h2>
                <p>{workspace.tagline || "Open this HUB and see what needs attention next."}</p>
                <span className="hub-workspace-open">OPEN HUB →</span>
              </a>
            ))}
          </div>

          <a className="hub-button hub-button-secondary" href="/hub/new">
            + CREATE ANOTHER HUB
          </a>
        </section>
      )}
    </main>
  );
}
