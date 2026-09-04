import prisma from "../../lib/prisma";

export const dynamic = "force-dynamic";

const MODE_GROUPS = [
  ["Family", "People, schedules, events and what matters at home.", "⌂"],
  ["Creator / Business", "Run launches, clients, projects and next actions.", "✦"],
  ["Church / Event", "Coordinate people, programs, services and gatherings.", "◇"],
  ["Coach / Teacher", "Organize learners, groups, sessions and follow-through.", "◎"],
] as const;

export default async function HubPage() {
  const workspaces = await prisma.workspace.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="hub-shell">
      <section className="hub-front-hero">
        <div className="hub-eyebrow">YOUR OPERATING HOME</div>
        <h1 className="hub-front-title">THE HUB</h1>
        <div className="hub-front-tagline">Run what matters.</div>
        <p className="hub-front-copy">
          HUB helps organize people, schedules, events, media and next actions in one calm operating home.
        </p>
      </section>

      <section className="hub-mode-strip" aria-label="Primary HUB operating modes">
        {MODE_GROUPS.map(([title, copy, icon]) => (
          <div className="hub-mode-pillar" key={title}>
            <span aria-hidden="true">{icon}</span>
            <strong>{title}</strong>
            <small style={{ color: "var(--hub-muted)", marginTop: 7, lineHeight: 1.45 }}>{copy}</small>
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
          <a className="hub-button hub-button-primary" href="/hub/new" style={{ marginTop: 16 }}>
            SET UP MY HUB
          </a>
        </section>
      ) : (
        <section>
          <div className="hub-eyebrow">YOUR HUBS</div>
          <div className="hub-workspace-grid">
            {workspaces.map((workspace) => (
              <a className="hub-workspace-card" key={workspace.id} href={`/hub/${workspace.id}`}>
                <div className="hub-workspace-mode hub-eyebrow">{workspace.mode}</div>
                <h2>{workspace.name}</h2>
                <p>{workspace.tagline || "Open this HUB and see what needs attention next."}</p>
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
