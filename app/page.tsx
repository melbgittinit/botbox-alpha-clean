import Header from "../components/Header";

export default function Home() {
  return (
    <main className="shell">
      <Header />

      <section className="hero">
        <div className="kicker">
          My Family’s Heritage & History Home
        </div>

        <h1>
          Your family has a story. Put it here.
        </h1>

        <p>
          Drop in what your family has. BOTBOX helps you preserve it,
          connect it, complete it, and pass it down.
        </p>
      </section>

      <div className="card">
        <h2>
          Start with what you know.
        </h2>

        <p className="small">
          Photos, people, stories, documents, audio, video —
          or something you can’t identify yet.
        </p>

        <a
          className="primary"
          href="/create-family"
        >
          START MY FAMILY BOTBOX
        </a>

        <a
          className="secondary"
          href="/family/banks-family"
        >
          VIEW ALPHA DEMO
        </a>
      </div>
    </main>
  );
}
