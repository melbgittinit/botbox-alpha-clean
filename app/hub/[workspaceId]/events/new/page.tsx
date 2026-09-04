import { notFound } from "next/navigation";
import prisma from "../../../../../lib/prisma";
import { createEvent } from "../../../actions";

export const dynamic = "force-dynamic";

const EVENT_TYPES = ["CUSTOM", "MEETING", "SERVICE", "CLASS", "SESSION", "LAUNCH", "GATHERING"];

export default async function NewEventPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, name: true, mode: true },
  });

  if (!workspace) notFound();

  return (
    <main className="hub-shell">
      <section className="hub-page-head">
        <div className="hub-eyebrow">{workspace.mode} HUB · {workspace.name}</div>
        <h1>What’s happening?</h1>
        <p className="hub-copy">
          Add the event once. HUB will turn it into a simple operating sequence you can work through.
        </p>
      </section>

      <section className="hub-onboarding-card">
        <form action={createEvent} className="hub-form">
          <input type="hidden" name="workspaceId" value={workspace.id} />

          <div className="hub-field">
            <label htmlFor="event-title">Event title</label>
            <input id="event-title" name="title" required autoComplete="off" placeholder="Sunday service, client session, launch day…" />
          </div>

          <div className="hub-field">
            <label htmlFor="event-type">Event type</label>
            <select id="event-type" name="type" defaultValue="CUSTOM">
              {EVENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          <div className="hub-field">
            <label htmlFor="event-start">Date / time</label>
            <input id="event-start" name="startsAt" type="datetime-local" required />
          </div>

          <div className="hub-field">
            <label htmlFor="event-description">Optional description</label>
            <textarea id="event-description" name="description" rows={4} placeholder="Anything HUB should know about what this event is for?" />
          </div>

          <div className="hub-runofshow-note">
            HUB will automatically build your Before / During / After run-of-show.
          </div>

          <button className="hub-button hub-button-primary hub-button-full" type="submit">
            BUILD MY EVENT
          </button>
        </form>
      </section>

      <a className="hub-button hub-button-secondary" href={`/hub/${workspace.id}`} style={{ marginTop: 16 }}>
        Back to {workspace.name}
      </a>
    </main>
  );
}
