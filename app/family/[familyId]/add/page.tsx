import Header from "../../../../components/Header";
import BottomNav from "../../../../components/BottomNav";

export default async function AddPage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const { familyId } = await params;

  const types = [
    "PHOTO",
    "DOCUMENT",
    "STORY",
    "AUDIO",
    "VIDEO",
    "PERSON",
  ];

  return (
    <main className="shell">
      <Header />

      <section className="hero">
        <div className="kicker">
          The Big Drop
        </div>

        <h1>
          Drop something in.
        </h1>

        <p>
          BOTBOX will help figure out where it belongs.
        </p>
      </section>

      <div className="grid">
        {types.map((type) => (
          <button
            key={type}
            className="card"
            style={{
              color: "inherit",
              textAlign: "left",
            }}
          >
            <strong>{type}</strong>
          </button>
        ))}
      </div>

      <button className="primary">
        I DON’T KNOW WHAT THIS IS
      </button>

      <div className="card">
        <div className="kicker">
          Alpha behavior
        </div>

        <p>
          Real uploads will be stored, analyzed, and converted
          into provisional AI findings before anything becomes
          a confirmed family fact.
        </p>
      </div>

      <BottomNav familyId={familyId} />
    </main>
  );
}
