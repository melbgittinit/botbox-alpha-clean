import { notFound } from "next/navigation";
import prisma from "../../../../../lib/prisma";
import { createEvent } from "../../../actions";

export const dynamic = "force-dynamic";

const fieldStyle = {
  width: "100%",
  marginTop: 8,
  padding: "15px 16px",
  borderRadius: 14,
  border: "1px solid var(--line)",
  background: "rgba(255,255,255,0.04)",
  color: "var(--text)",
};

export default async function NewEventPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      id: true,
      name: true,
      mode: true,
    },
  });

  if (!workspace) {
    notFound();
  }

  return (
    <main className="shell">
      <section className="hero">
        <div className="kicker">HUB / {workspace.mode}</div>
        <h1>New event</h1>
        <p>{workspace.name}</p>
      </section>

      <form action={createEvent} className="card">
        <input type="hidden" name="workspaceId" value={workspace.id} />

        <label>
          <div className="kicker">Title</div>
          <input
            name="title"
            required
            autoComplete="off"
            style={fieldStyle}
            placeholder="Event title"
          />
        </label>

        <label style={{ display: "block", marginTop: 20 }}>
          <div className="kicker">Description — optional</div>
          <textarea
            name="description"
            rows={4}
            style={fieldStyle}
            placeholder="What is this event for?"
          />
        </label>

        <label style={{ display: "block", marginTop: 20 }}>
          <div className="kicker">Type</div>
          <input
            name="type"
            defaultValue="CUSTOM"
            autoComplete="off"
            style={fieldStyle}
          />
        </label>

        <label style={{ display: "block", marginTop: 20 }}>
          <div className="kicker">Start date / time</div>
          <input name="startsAt" type="datetime-local" required style={fieldStyle} />
        </label>

        <button className="primary" type="submit" style={{ marginTop: 24 }}>
          CREATE EVENT + RUN OF SHOW
        </button>
      </form>

      <a className="secondary" href={`/hub/${workspace.id}`}>
        Back to workspace
      </a>
    </main>
  );
}
