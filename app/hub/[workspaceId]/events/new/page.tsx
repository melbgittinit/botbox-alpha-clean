import { notFound } from "next/navigation";
import prisma from "../../../../../lib/prisma";
import HubContextVisual from "../../../../../components/HubContextVisual";
import { createEvent } from "../../../actions";

export const dynamic = "force-dynamic";

const EVENT_TYPES = ["CUSTOM", "MEETING", "SERVICE", "CLASS", "SESSION", "LAUNCH", "GATHERING"];

function formatDate(value: Date | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

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
      events: {
        orderBy: [{ startsAt: "asc" }, { createdAt: "asc" }],
        select: { title: true, startsAt: true },
      },
    },
  });

  if (!workspace) notFound();

  const now = new Date();
  const currentEvent =
    workspace.events.find((event) => event.startsAt && event.startsAt >= now) ??
    workspace.events.find((event) => event.startsAt) ??
    workspace.events[0] ??
    null;

  return (
    <main className="hub-shell">
      <HubContextVisual
        mode={workspace.mode}
        workspaceName={workspace.name}
        eventTitle={currentEvent?.title}
        eventMeta={currentEvent ? formatDate(currentEvent.startsAt) : null}
        compact
      />

      <section className="hub-page-head hub-page-head-tight">
        <div className="hub-eyebrow">BUILD THE RUN-OF-SHOW</div>
        <h1>What’s happening?</h1>
        <p className="hub-copy">
          Add the event once. HUB will turn it into a clear Before / During / After operating sequence.
        </p>
      </section>

      <section className="hub-onboarding-card">
        <form action={createEvent} className="hub-form">
          <input type="hidden" name="workspaceId" value={workspace.id} />

          <div className="hub-field">
            <label htmlFor="event-title">Event title</label>
            <input
              id="event-title"
              name="title"
              required
              autoComplete="off"
              placeholder="Sunday service, client session, launch day…"
            />
          </div>

          <div className="hub-field">
            <label htmlFor="event-type">Event type</label>
            <select id="event-type" name="type" defaultValue="CUSTOM">
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="hub-field">
            <label htmlFor="event-start">Date / time</label>
            <input id="event-start" name="startsAt" type="datetime-local" required />
          </div>

          <div className="hub-field">
            <label htmlFor="event-description">Optional description</label>
            <textarea
              id="event-description"
              name="description"
              rows={4}
              placeholder="Anything HUB should know about what this event is for?"
            />
          </div>

          <div className="hub-runofshow-note">
            <span>BEFORE</span>
            <span>DURING</span>
            <span>AFTER</span>
            <strong>HUB builds the starter run-of-show automatically.</strong>
          </div>

          <button className="hub-button hub-button-primary hub-button-full" type="submit">
            BUILD MY EVENT
          </button>
        </form>
      </section>

      <a
        className="hub-button hub-button-secondary"
        href={`/hub/${workspace.id}`}
        style={{ marginTop: 16 }}
      >
        Back to {workspace.name}
      </a>
    </main>
  );
}
