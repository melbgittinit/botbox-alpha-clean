import { notFound } from "next/navigation";
import prisma from "../../../lib/prisma";
import { getDoThisNext } from "../../../lib/do-this-next";
import { markEventStepDone } from "../actions";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null) {
  if (!value) {
    return "Unscheduled";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  const [workspace, nextStep] = await Promise.all([
    prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        people: {
          orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
        },
        groups: {
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
        events: {
          orderBy: [{ startsAt: "asc" }, { createdAt: "asc" }],
        },
      },
    }),
    getDoThisNext(workspaceId),
  ]);

  if (!workspace) {
    notFound();
  }

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const todayEvents = workspace.events.filter(
    (event) =>
      event.startsAt &&
      event.startsAt >= startOfToday &&
      event.startsAt < startOfTomorrow,
  );

  const upcomingEvents = workspace.events.filter(
    (event) => event.startsAt && event.startsAt >= startOfTomorrow,
  );

  return (
    <main className="shell">
      <section className="hero">
        <div className="kicker">HUB / {workspace.mode}</div>
        <h1>{workspace.name}</h1>
        {workspace.tagline ? <p>{workspace.tagline}</p> : null}
      </section>

      <section
        className="card"
        style={{
          borderColor: "var(--line-strong)",
          padding: 26,
        }}
      >
        <div className="kicker">DO THIS NEXT</div>

        {nextStep ? (
          <>
            <h2 style={{ margin: "10px 0 8px", fontSize: 30 }}>
              {nextStep.title}
            </h2>
            <p style={{ color: "var(--muted)", marginTop: 0 }}>
              {nextStep.event.title} · {nextStep.phase} · {nextStep.status}
            </p>

            <form action={markEventStepDone}>
              <input type="hidden" name="workspaceId" value={workspace.id} />
              <input type="hidden" name="stepId" value={nextStep.id} />
              <button className="primary" type="submit">
                MARK DONE
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 style={{ margin: "10px 0 8px" }}>Nothing is queued.</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
              Create an event and HUB will generate the first run-of-show.
            </p>
            <a className="primary" href={`/hub/${workspace.id}/events/new`}>
              + CREATE EVENT
            </a>
          </>
        )}
      </section>

      <a className="secondary" href={`/hub/${workspace.id}/events/new`}>
        + NEW EVENT
      </a>

      <section className="card">
        <div className="kicker">Today</div>
        {todayEvents.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>Nothing scheduled today.</p>
        ) : (
          todayEvents.map((event) => (
            <div key={event.id} style={{ marginTop: 14 }}>
              <strong>{event.title}</strong>
              <div style={{ color: "var(--muted)", marginTop: 4 }}>
                {formatDate(event.startsAt)} · {event.type}
              </div>
            </div>
          ))
        )}
      </section>

      <section className="card">
        <div className="kicker">Upcoming</div>
        {upcomingEvents.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No upcoming events yet.</p>
        ) : (
          upcomingEvents.slice(0, 6).map((event) => (
            <div key={event.id} style={{ marginTop: 14 }}>
              <strong>{event.title}</strong>
              <div style={{ color: "var(--muted)", marginTop: 4 }}>
                {formatDate(event.startsAt)} · {event.type}
              </div>
            </div>
          ))
        )}
      </section>

      <section className="card">
        <div className="kicker">People / Groups</div>
        <h2 style={{ margin: "10px 0 8px" }}>
          {workspace.people.length} people · {workspace.groups.length} groups
        </h2>

        {workspace.groups.length > 0 ? (
          <div style={{ marginTop: 12 }}>
            {workspace.groups.slice(0, 5).map((group) => (
              <div key={group.id} style={{ marginTop: 8, color: "var(--muted)" }}>
                {group.name} · {group._count.members} members
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--muted)" }}>
            People and groups will appear here as they are added.
          </p>
        )}
      </section>

      <section className="card">
        <div className="kicker">Results</div>
        <h2 style={{ margin: "10px 0 8px" }}>Results will land here.</h2>
        <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
          This placeholder establishes the operating hierarchy without adding
          reporting or revenue features yet.
        </p>
      </section>

      <a className="secondary" href="/hub">
        All workspaces
      </a>
    </main>
  );
}
