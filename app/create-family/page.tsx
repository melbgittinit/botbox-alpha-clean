import Header from "../../components/Header";

export default function CreateFamilyPage() {
  return (
    <main className="shell">
      <Header />

      <section className="hero">
        <div className="kicker">
          Create Family
        </div>

        <h1>
          Let’s start with what you know.
        </h1>

        <p>
          Don’t know everything? Good.
          Finding out is part of BOTBOX.
        </p>
      </section>

      <div className="card">
        <label>
          What does your family call itself?
        </label>

        <input defaultValue="The Banks Family" />

        <label>
          Your name
        </label>

        <input placeholder="Your name" />

        <label>
          Main family place
        </label>

        <input placeholder="Memphis, Tennessee" />

        <a
          href="/family/banks-family"
          className="primary"
        >
          BUILD MY FAMILY HOME
        </a>
      </div>
    </main>
  );
}
