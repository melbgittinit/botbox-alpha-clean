import Header from "../../../../../components/Header";
import BottomNav from "../../../../../components/BottomNav";
import { people } from "../../../../../lib/sample-data";

export default async function PersonPage({
  params,
}: {
  params: Promise<{
    familyId: string;
    personId: string;
  }>;
}) {
  const { familyId, personId } = await params;

  const person =
    people.find((item) => item.id === personId) ??
    people[0];

  return (
    <main className="shell">
      <Header />

      <section className="hero">
        <div className="kicker">
          Life Card
        </div>

        <h1>{person.name}</h1>

        <p>
          {person.years} · {person.role}
        </p>
      </section>

      <div className="card">
        <div
          className="avatar"
          style={{
            width: 100,
            height: 100,
            fontSize: 40,
          }}
        >
          ♥
        </div>

        <p>{person.summary}</p>

        <div className="grid">
          <div className="stat">
            <strong>{person.photos}</strong>
            <span>photos</span>
          </div>

          <div className="stat">
            <strong>{person.memories}</strong>
            <span>memories</span>
          </div>

          <div className="stat">
            <strong>{person.documents}</strong>
            <span>documents</span>
          </div>

          <div className="stat">
            <strong>3</strong>
            <span>places</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="kicker">
          BOTBOX thinks we should ask
        </div>

        <h3>
          When did Lillian move from Montgomery to Memphis?
        </h3>

        <p className="small">
          Aunt Dorothy may know.
        </p>

        <button className="primary">
          ASK AUNT DOROTHY
        </button>
      </div>

      <BottomNav familyId={familyId} />
    </main>
  );
}
