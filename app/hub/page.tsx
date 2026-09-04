import prisma from "../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function HubPage() {
  const workspaces = await prisma.workspace.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <main className="shell">
      <section className="hero">
        <div className="kicker">HUB</div>
        <h1>Your workspaces</h1>
        <p>
          One place to run the work, people, events, and next actions that
          matter.
        </p>
      </section>

      <a className="primary" href="/hub/new">
        + CREATE WORKSPACE
      </a>

      {workspaces.length === 0 ? (
        <div className="card">
          <div className="kicker">Start here</div>
          <h2>No workspaces yet.</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
            Create the first HUB workspace to begin the operating path.
          </p>
        </div>
      ) : (
        <section style={{ marginTop: 22 }}>
          <div className="kicker">Your HUB</div>

          {workspaces.map((workspace) => (
            <a key={workspace.id} href={`/hub/${workspace.id}`}>
              <div className="card">
                <div className="kicker">{workspace.mode}</div>
                <h2 style={{ marginBottom: 8 }}>{workspace.name}</h2>
                {workspace.tagline ? (
                  <p
                    style={{
                      margin: 0,
                      color: "var(--muted)",
                      lineHeight: 1.5,
                    }}
                  >
                    {workspace.tagline}
                  </p>
                ) : null}
              </div>
            </a>
          ))}
        </section>
      )}
    </main>
  );
}
