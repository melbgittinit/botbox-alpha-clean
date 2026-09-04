import { notFound } from "next/navigation";
import prisma from "../../../../lib/prisma";
import HubNav from "../../../../components/HubNav";

export const dynamic = "force-dynamic";

const LABELS: Record<string, string> = {
  people: "People",
  schedule: "Schedule",
  play: "Play",
  results: "Results",
  more: "More",
};

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
    select: { id: true, name: true, mode: true },
  });

  if (!workspace) notFound();

  return (
    <main className="hub-shell hub-with-nav">
      <header className="hub-identity">
        <div>
          <div className="hub-eyebrow">{workspace.mode} HUB</div>
          <h1>{workspace.name}</h1>
        </div>
        <a className="hub-back-link" href={`/hub/${workspace.id}`}>Home</a>
      </header>

      <section className="hub-coming-card">
        <div className="hub-eyebrow">COMING NEXT</div>
        <h2>{label}</h2>
        <p>This part of your HUB is reserved and ready for the next build phase.</p>
        <a className="hub-button hub-button-secondary" href={`/hub/${workspace.id}`}>BACK HOME</a>
      </section>

      <HubNav workspaceId={workspace.id} active={section} />
    </main>
  );
}
