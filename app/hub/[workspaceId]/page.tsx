import { notFound } from "next/navigation";
import prisma from "../../../lib/prisma";
import { getDoThisNext } from "../../../lib/do-this-next";
import HubNav from "../../../components/HubNav";
import { markEventStepDone } from "../actions";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null) {
  if (!value) return "Unscheduled";

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
        people: { orderBy: [{ firstName: "asc" }, { lastName: "asc" }] },
        groups: {
          orderBy: { name: "asc" },
          include: { _count: { select: { members: true } } },
        },
        events: { orderBy: [{ startsAt: "asc" }, { createdAt: "asc" }] },
      },
    }),
    getDoThisNext(workspaceId),
  ]);

  if (!workspace) notFound();

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const todayEvents = workspace.events.filter(
    (event) => event.startsAt && event.startsAt >= startOfToday && event.startsAt < startOfTomorrow,
  );
  const upcomingEvents = workspace.events.filter(
    (event) => event.startsAt && event.startsAt >= startOfTomorrow,
  );

  return (
    <main className="hub-shell hub-with-nav">
      <header className="hub-identity">
        <div>
          <div className="hub-eyebrow">{workspace.mode} HUB</div>
          <h1>{workspace.name}</h1>
          {workspace.tagline ? <p>{workspace.tagline}</p> : null}
        </div>
        <a className="hub-back-link" href="/hub">All HUBs</a>
      </header>

      <section className="hub-next-card">
        <div className="hub-eyebrow">DO THIS NEXT</div>
        {nextStep ? (
          <>
            <h2>{nextStep.title}</h2>
            <div className="hub-next-meta">
              {nextStep.event.title} · {nextStep.phase} · {nextStep.status}
            </div>
            <form action={markEventStepDone}>
              <input type="hidden" name="workspaceId" value={workspace.id} />
              <input type="hidden" name="stepId" value={nextStep.id} />
              <button className="hub-button hub-button-primary" type="submit">MARK DONE</button>
            </form>
          </>
        ) : (
          <>
            <h2>Create your first event</h2>
            <p>Tell HUB what’s coming up and I’ll help you run it.</p>
            <a className="hub-button hub-button-primary" href={`/hub/${workspace.id}/events/new`}>
              CREATE EVENT
            </a>
          </>
        )}
      </section>

      <section className="hub-panel" style={{ marginBottom: 16 }}>
        <div className="hub-eyebrow">TODAY</div>
        <h2>{todayEvents.length ? `${todayEvents.length} thing${todayEvents.length === 1 ? "" : "s"} on deck` : "Your day is clear"}</h2>
        {todayEvents.length === 0 ? (
          <p>Nothing scheduled today. HUB will surface today’s events here as they are added.</p>
        ) : (
          todayEvents.map((event) => (
            <div className="hub-list-row" key={event.id}>
              <strong>{event.title}</strong>
              <span>{formatDate(event.startsAt)} · {event.type}</span>
            </div>
          ))
        )}
      </section>

      <section className="hub-panel" style={{ marginBottom: 16 }}>
        <div className="hub-eyebrow">QUICK ACTIONS</div>
        <div className="hub-quick-actions" style={{ marginTop: 14 }}>
          <a className="hub-quick-action" href={`/hub/${workspace.id}/events/new`}>
            <span>＋</span><strong>Create event</strong>
          </a>
          <a className="hub-quick-action" href={`/hub/${workspace.id}/people`}>
            <span>◎</span><strong>People</strong>
          </a>
          <a className="hub-quick-action" href={`/hub/${workspace.id}/schedule`}>
            <span>◷</span><strong>Schedule</strong>
          </a>
        </div>
      </section>

      <div className="hub-section-grid">
        <section className="hub-panel">
          <div className="hub-eyebrow">COMING UP</div>
          <h2>{upcomingEvents.length ? "Next on the calendar" : "Nothing queued yet"}</h2>
          {upcomingEvents.length === 0 ? (
            <p>Future events will appear here so you can see what’s approaching.</p>
          ) : (
            upcomingEvents.slice(0, 4).map((event) => (
              <div className="hub-list-row" key={event.id}>
                <strong>{event.title}</strong>
                <span>{formatDate(event.startsAt)} · {event.type}</span>
              </div>
            ))
          )}
        </section>

        <section className="hub-panel">
          <div className="hub-eyebrow">PEOPLE / GROUPS</div>
          <h2>{workspace.people.length} people · {workspace.groups.length} groups</h2>
          {workspace.groups.length ? (
            workspace.groups.slice(0, 4).map((group) => (
              <div className="hub-list-row" key={group.id}>
                <strong>{group.name}</strong>
                <span>{group._count.members} members</span>
              </div>
            ))
          ) : (
            <p>Your people and groups snapshot will grow here as you add them.</p>
          )}
        </section>

        <section className="hub-panel">
          <div className="hub-eyebrow">RESULTS</div>
          <h2>See what got done.</h2>
          <p>Results will summarize completed activity and useful outcomes in a later phase.</p>
          <a className="hub-back-link" href={`/hub/${workspace.id}/results`}>Preview Results →</a>
        </section>

        <section className="hub-elevate-card">
          <div className="hub-eyebrow">ELEVATE BOT</div>
          <h2>A helpful suggestion will appear here.</h2>
          <p>Reserved for future guidance. No AI logic has been added in this phase.</p>
        </section>
      </div>

      <HubNav workspaceId={workspace.id} active="home" />
    </main>
  );
}
