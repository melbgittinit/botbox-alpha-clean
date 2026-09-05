import { notFound } from "next/navigation";
import prisma from "../../../lib/prisma";
import { getDoThisNext } from "../../../lib/do-this-next";
import HubNav from "../../../components/HubNav";
import HubContextVisual from "../../../components/HubContextVisual";
import { markEventStepDone } from "../actions";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null) {
  if (!value) return "Unscheduled";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
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
    (event) =>
      event.startsAt &&
      event.startsAt >= startOfToday &&
      event.startsAt < startOfTomorrow,
  );

  const upcomingEvents = workspace.events.filter(
    (event) => event.startsAt && event.startsAt >= startOfTomorrow,
  );

  const currentEvent =
    todayEvents[0] ??
    workspace.events.find((event) => event.startsAt && event.startsAt >= now) ??
    workspace.events.find((event) => event.startsAt) ??
    workspace.events[0] ??
    null;

  const hasPeopleOrGroups =
    workspace.people.length > 0 || workspace.groups.length > 0;

  return (
    <main className="hub-shell hub-with-nav">
      <HubContextVisual
        mode={workspace.mode}
        workspaceName={workspace.name}
        eventTitle={currentEvent?.title}
        eventMeta={currentEvent?.startsAt ? formatDate(currentEvent.startsAt) : null}
      />

      <section className="hub-next-card">
        <div className="hub-next-head">
          <div>
            <div className="hub-eyebrow">DO THIS NEXT</div>
            {nextStep ? (
              <div className="hub-step-type">{nextStep.type.replaceAll("_", " ")}</div>
            ) : null}
          </div>
          {nextStep?.scheduledAt ? (
            <time className="hub-next-time">{formatDate(nextStep.scheduledAt)}</time>
          ) : nextStep?.event.startsAt ? (
            <time className="hub-next-time">{formatDate(nextStep.event.startsAt)}</time>
          ) : null}
        </div>

        {nextStep ? (
          <>
            <h2>{nextStep.title}</h2>
            <div className="hub-next-context">
              <strong>{nextStep.event.title}</strong>
              <span>{nextStep.phase} · {nextStep.status}</span>
            </div>

            {nextStep.description ? (
              <p className="hub-next-description">{nextStep.description}</p>
            ) : null}

            <form action={markEventStepDone} className="hub-done-form">
              <input type="hidden" name="workspaceId" value={workspace.id} />
              <input type="hidden" name="stepId" value={nextStep.id} />
              <button className="hub-done-control" type="submit">
                ✓ That’s done
              </button>
            </form>
          </>
        ) : (
          <>
            <h2>Create your first event</h2>
            <p className="hub-next-description">
              Tell HUB what’s coming up and I’ll help you run it.
            </p>
            <a
              className="hub-button hub-button-primary"
              href={`/hub/${workspace.id}/events/new`}
            >
              CREATE EVENT
            </a>
          </>
        )}
      </section>

      <section className="hub-utility-bar" aria-label="Quick actions">
        <a href={`/hub/${workspace.id}/events/new`}>
          <span>＋</span>
          <strong>Create event</strong>
        </a>
        <a href={`/hub/${workspace.id}/schedule`}>
          <span>◷</span>
          <strong>Schedule</strong>
        </a>
        <a href={`/hub/${workspace.id}/people`}>
          <span>◎</span>
          <strong>People</strong>
        </a>
      </section>

      {todayEvents.length > 0 ? (
        <section className="hub-data-panel">
          <div className="hub-panel-heading">
            <div>
              <div className="hub-eyebrow">TODAY</div>
              <h2>On deck today</h2>
            </div>
            <span className="hub-count">{todayEvents.length}</span>
          </div>
          {todayEvents.map((event) => (
            <div className="hub-list-row" key={event.id}>
              <strong>{event.title}</strong>
              <span>{formatDate(event.startsAt)} · {event.type}</span>
            </div>
          ))}
        </section>
      ) : null}

      {upcomingEvents.length > 0 ? (
        <section className="hub-data-panel">
          <div className="hub-panel-heading">
            <div>
              <div className="hub-eyebrow">COMING UP</div>
              <h2>Next on the calendar</h2>
            </div>
          </div>
          {upcomingEvents.slice(0, 4).map((event) => (
            <div className="hub-list-row" key={event.id}>
              <strong>{event.title}</strong>
              <span>{formatDate(event.startsAt)} · {event.type}</span>
            </div>
          ))}
        </section>
      ) : null}

      {hasPeopleOrGroups ? (
        <section className="hub-data-panel">
          <div className="hub-panel-heading">
            <div>
              <div className="hub-eyebrow">PEOPLE / GROUPS</div>
              <h2>{workspace.people.length} people · {workspace.groups.length} groups</h2>
            </div>
            <a className="hub-inline-link" href={`/hub/${workspace.id}/people`}>
              Open →
            </a>
          </div>

          {workspace.groups.slice(0, 3).map((group) => (
            <div className="hub-list-row" key={group.id}>
              <strong>{group.name}</strong>
              <span>{group._count.members} members</span>
            </div>
          ))}
        </section>
      ) : null}

      <section className="hub-coming-row" aria-label="Coming next">
        {!hasPeopleOrGroups ? <span>People / Groups · Coming next</span> : null}
        <span>Results · Coming next</span>
        <span>Elevate Bot · Coming next</span>
      </section>

      <HubNav workspaceId={workspace.id} active="home" />
    </main>
  );
}
