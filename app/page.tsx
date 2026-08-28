import Header from "../components/Header";

export default function Home() {
  return (
    <main className="shell">
      <Header />

      <section className="hero botbox-home-hero">
        <div className="kicker">
          My Family’s Heritage & History Home
        </div>

        <h1>
          Your family has a story.
          <br />
          Put it here.
        </h1>

        <p className="hero-copy">
          Photos. People. Documents. Stories. Voices. Memories.
          <br />
          Drop in what your family has and BOTBOX helps you preserve it,
          connect it, complete it, and pass it down.
        </p>

        <div className="hero-promise">
          <span>PRESERVE IT.</span>
          <span>CONNECT IT.</span>
          <span>COMPLETE IT.</span>
          <span>PASS IT DOWN.</span>
        </div>
      </section>

      <section className="botbox-entry-card">
        <div className="botbox-lock">♥</div>

        <div className="kicker">
          Powered by Love
        </div>

        <h2>
          Got family stuff?
          <br />
          Start putting it here.
        </h2>

        <p className="small">
          You do not have to organize everything first.
          Start with one person, one photograph, one document,
          one memory — or something you cannot identify yet.
        </p>

        <a
          className="primary botbox-big-button"
          href="/create-family"
        >
          START MY FAMILY BOTBOX
        </a>

        <a
          className="secondary"
          href="/family/banks-family"
        >
          EXPLORE THE FAMILY DEMO
        </a>
      </section>

      <section className="botbox-drop-zone">
        <div className="kicker">
          The Big Drop
        </div>

        <h2>
          What does your family have?
        </h2>

        <p className="small">
          Eventually, you will be able to drop almost anything into BOTBOX
          and let it help figure out where it belongs.
        </p>

        <div className="botbox-drop-grid">
          <a href="/family/banks-family/add" className="botbox-drop-card">
            <div className="botbox-drop-icon">📷</div>
            <strong>PHOTO</strong>
            <span>Old pictures, albums and unidentified faces</span>
          </a>

          <a href="/family/banks-family/add" className="botbox-drop-card">
            <div className="botbox-drop-icon">📄</div>
            <strong>DOCUMENT</strong>
            <span>Records, letters, programs and clippings</span>
          </a>

          <a href="/family/banks-family/add" className="botbox-drop-card">
            <div className="botbox-drop-icon">🎙️</div>
            <strong>VOICE MEMORY</strong>
            <span>Tell the story instead of typing it</span>
          </a>

          <a href="/family/banks-family/add" className="botbox-drop-card">
            <div className="botbox-drop-icon">👤</div>
            <strong>PERSON</strong>
            <span>Add somebody your family should remember</span>
          </a>

          <a href="/family/banks-family/add" className="botbox-drop-card">
            <div className="botbox-drop-icon">🎞️</div>
            <strong>VIDEO</strong>
            <span>Family moments, interviews and celebrations</span>
          </a>

          <a href="/family/banks-family/add" className="botbox-drop-card botbox-mystery-card">
            <div className="botbox-drop-icon">?</div>
            <strong>I DON’T KNOW</strong>
            <span>That is okay. BOTBOX can help investigate it.</span>
          </a>
        </div>
      </section>

      <section className="botbox-intelligence">
        <div>
          <div className="kicker">
            More Than Storage
          </div>

          <h2>
            Your family archive should get smarter as it grows.
          </h2>

          <p className="small">
            BOTBOX is being designed to connect people, places, dates,
            photographs, memories and records — while keeping uncertain
            information separate until your family confirms it.
          </p>
        </div>

        <div className="botbox-question-card">
          <div className="botbox-question">
            “What do we know about Grandma Lillian?”
          </div>

          <div className="botbox-answer">
            <strong>BOTBOX</strong>

            <p>
              We currently connect Lillian to Montgomery, Memphis and
              Chicago through family memories, photographs and documents.
            </p>

            <span>
              Still unresolved: the exact year she moved to Memphis.
            </span>
          </div>

          <a
            href="/family/banks-family/ask"
            className="secondary"
          >
            ASK BOTBOX
          </a>
        </div>
      </section>

      <section className="botbox-family-links">
        <div className="kicker">
          One Family Home
        </div>

        <h2>
          History is only part of the story.
        </h2>

        <div className="botbox-link-grid">
          <a href="/family/banks-family/people" className="botbox-link-card">
            <span>👨🏾‍👩🏾‍👧🏾‍👦🏾</span>
            <strong>PEOPLE</strong>
            <small>Life Cards, relationships and family connections</small>
          </a>

          <a href="/family/banks-family/inbox" className="botbox-link-card">
            <span>📥</span>
            <strong>FAMILY INBOX</strong>
            <small>Questions your relatives can help answer</small>
          </a>

          <a href="/family/banks-family" className="botbox-link-card">
            <span>🏠</span>
            <strong>FAMILY HOME</strong>
            <small>See what your family is building together</small>
          </a>
        </div>
      </section>

      <section className="botbox-final-home">
        <div className="botbox-lock botbox-lock-large">♥</div>

        <div className="kicker">
          BOTBOX Family Edition
        </div>

        <h2>
          Start with what your family already has.
        </h2>

        <p>
          The goal is simple: another generation should not have
          to start over.
        </p>

        <a
          className="primary botbox-big-button"
          href="/create-family"
        >
          BUILD MY FAMILY BOTBOX
        </a>
      </section>
    </main>
  );
}
