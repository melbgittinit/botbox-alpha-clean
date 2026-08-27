import Header from "../../../../components/Header";
import BottomNav from "../../../../components/BottomNav";
import { people } from "../../../../lib/sample-data";

export default async function PeoplePage({
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
          Our People
        </div>

        <h1>
          Family Life Cards
        </h1>
      </section>

      {people.map((person) => (
        <a
          key={person.id}
          href={`/family/${familyId}/people/${person.id}`}
          className="card person"
        >
          <div className="avatar">
            ♥
          </div>

          <div>
            <strong>{person.name}</strong>

            <div className="small">
              {person.years}
            </div>

            <div className="small">
              {person.role}
            </div>
          </div>
        </a>
      ))}

      <BottomNav familyId={familyId} />
    </main>
  );
}
