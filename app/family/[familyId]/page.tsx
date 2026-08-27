import Header from "../../../components/Header";
import BottomNav from "../../../components/BottomNav";
import { family } from "../../../lib/sample-data";

export default async function FamilyPage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const { familyId } = await params;

  return (
    <main className="shell">
      <Header />

      <section className="hero">
        <div className="kicker">{family.tagline}</div>
        <h1>{family.name}</h1>
      </section>

      <div className="card">
        <div className="kicker">Today in our family</div>

        <div
          className="grid"
          style={{ marginTop: 12 }}
        >
          <div className="stat">
            <strong>3</strong>
            <span>memories added</span>
          </div>

          <div className="stat">
            <strong>2</strong>
            <span>people need identifying</span>
          </div>

          <div className="stat">
            <strong>1</strong>
            <span>research lead found</span>
          </div>

          <div className="stat">
            <strong>Fri</strong>
            <span>Aunt Dorothy’s birthday</span>
          </div>
        </div>
      </div>

      <a
        className="primary"
        href={`/family/${familyId}/add`}
      >
        + ADD TO OUR FAMILY
      </a>

      <div className="card">
        <div className="kicker">Ask BOTBOX</div>

        <h2>Ask anything about our family.</h2>

        <a href={`/family/${familyId}/ask`}>
          <div className="ask">
            Who was Grandma Lillian?
          </div>
        </a>

        <div
          className="chips"
          style={{ marginTop: 12 }}
        >
          <span className="chip">
            Show our Memphis history
          </span>

          <span className="chip">
            Who served in the military?
          </span>

          <span className="chip">
            What don’t we know?
          </span>
        </div>
      </div>

      <div className="card">
        <div className="kicker">BOTBOX suggests</div>

        <h3>Capture Aunt Dorothy’s story.</h3>

        <p className="small">
          She may be the best source for Lillian’s move
          from Montgomery to Memphis.
        </p>

        <button className="secondary">
          ASK AUNT DOROTHY
        </button>
      </div>

      <BottomNav familyId={familyId} />
    </main>
  );
}
