import { notFound } from "next/navigation";
import prisma from "../../../../lib/prisma";
import HubNav from "../../../../components/HubNav";
import HubContextVisual from "../../../../components/HubContextVisual";

export const dynamic = "force-dynamic";

const LABELS: Record<string, string> = {
  people: "People",
  schedule: "Schedule",
  play: "Play",
  results: "Results",
  more: "More",
};

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

export default async function HubSectionPage({
  params,
}: {
  params: Promise<{ workspaceId: string; section: string }>;
}) {
  const { workspaceId, section } = await params;
  const label = LABELS[section];

  if (!label) notFound();

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
    <main className="hub-shell hub-with-nav">
      <HubContextVisual
        mode={workspace.mode}
        workspaceName={workspace.name}
        eventTitle={currentEvent?.title}
        eventMeta={currentEvent ? formatDate(currentEvent.startsAt) : null}
        compact
      />

      <section className="hub-coming-card hub-coming-card-compact">
        <div className="hub-eyebrow">COMING NEXT</div>
        <h2>{label}</h2>
        <p>This area is reserved for the next operating build and is intentionally compact for now.</p>
        <a className="hub-inline-link" href={`/hub/${workspace.id}`}>← Back home</a>
      </section>

      <HubNav workspaceId={workspace.id} active={section} />
    </main>
  );
}
