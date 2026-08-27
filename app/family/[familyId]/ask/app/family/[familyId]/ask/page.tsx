import Header from "../../../../components/Header";
import BottomNav from "../../../../components/BottomNav";

export default async function AskPage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const { familyId } = await params;

  return (
    <main className="shell">
      <Header />

      <section className="hero">
        <div className="kicker">
          Ask Our Family
        </div>

        <h1>
          What do you want to know?
        </h1>
      </section>

      <textarea
        rows={4}
        defaultValue="What do we know about Grandma Lillian?"
      />

      <button className="primary">
        ASK BOTBOX
      </button>

      <div className="card">
        <div className="kicker">
          Demo answer
        </div>

        <p>
          <strong>Lillian Mae Banks</strong> was born in
          Montgomery around 1924. The current family archive
          connects her to Montgomery, Memphis, and Chicago
          through family memories, photos, and documents.
        </p>

        <h3>
          What we still don’t know
        </h3>

        <p className="small">
          The exact year she moved to Memphis and the school
          where she taught remain unresolved.
        </p>

        <div className="grid">
          <button className="secondary">
            START RESEARCH
          </button>

          <button className="secondary">
            ASK FAMILY
          </button>
        </div>
      </div>

      <BottomNav familyId={familyId} />
    </main>
  );
}
