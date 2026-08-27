import Header from "../../../../components/Header";
import BottomNav from "../../../../components/BottomNav";
import { questions, timeline } from "../../../../lib/sample-data";

export default async function InboxPage({
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
          Family Inbox
        </div>

        <h1>
          Our family can help.
        </h1>
      </section>

      {questions.map((question, index) => (
        <div className="card" key={question}>
          <div className="kicker">
            Question {index + 1}
          </div>

          <h3>{question}</h3>

          <div className="grid">
            <button className="secondary">
              I KNOW
            </button>

            <button className="secondary">
              NOT SURE
            </button>
          </div>
        </div>
      ))}

      <div className="card">
        <div className="kicker">
          Simple Timeline
        </div>

        <div
          className="timeline"
          style={{ marginTop: 16 }}
        >
          {timeline.map(([year, label]) => (
            <div
              className="timeline-row"
              key={year + label}
            >
              <strong>{year}</strong>

              <div className="small">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav familyId={familyId} />
    </main>
  );
}
