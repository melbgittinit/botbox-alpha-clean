'use client';

import { useMemo, useState } from "react";
import styles from "./pgp.module.css";

type Screen =
  | "gateway"
  | "confirmed"
  | "guide"
  | "quiz"
  | "reveal"
  | "home"
  | "spot"
  | "key"
  | "bag"
  | "west"
  | "velvet";

type PowerId =
  | "connector"
  | "builder"
  | "honey"
  | "creator"
  | "west"
  | "wise"
  | "style"
  | "dreamer"
  | "community"
  | "luxury";

const guides = [
  { id: "honey", icon: "🍯", name: "Honey", line: "Girl, come on.", tone: "Warm + funny" },
  { id: "bella", icon: "👑", name: "Bella", line: "Allow me to show you around.", tone: "Polished + elegant" },
  { id: "rose", icon: "🤠", name: "Rodeo Rose", line: "Grab your boots.", tone: "Country + fearless" },
  { id: "nova", icon: "✨", name: "Nova", line: "Let’s see what you can build.", tone: "Creative + future" },
  { id: "asha", icon: "🌹", name: "Queen Asha", line: "You already have more than you think.", tone: "Wise + grounded" },
];

const powers: Record<PowerId, { name: string; icon: string; word: string }> = {
  connector: { name: "Golden Connector", icon: "✨", word: "Connection" },
  builder: { name: "Queen Builder", icon: "👑", word: "Leadership" },
  honey: { name: "Honey Heart", icon: "🍯", word: "Warmth" },
  creator: { name: "Creative Star", icon: "🎤", word: "Expression" },
  west: { name: "Wild West Belle", icon: "🤠", word: "Courage" },
  wise: { name: "Wise Queen", icon: "🌹", word: "Wisdom" },
  style: { name: "Style Icon", icon: "💎", word: "Taste" },
  dreamer: { name: "Dream Maker", icon: "🌟", word: "Imagination" },
  community: { name: "Community Heart", icon: "❤️", word: "Care" },
  luxury: { name: "Luxury Navigator", icon: "✈️", word: "Discovery" },
};

const questions: Array<{
  prompt: string;
  options: Array<{ label: string; power: PowerId }>;
}> = [
  {
    prompt: "People usually come to me when they need…",
    options: [
      { label: "A connection", power: "connector" },
      { label: "A plan", power: "builder" },
      { label: "Encouragement", power: "honey" },
      { label: "A fresh idea", power: "dreamer" },
    ],
  },
  {
    prompt: "Drop me somewhere new and I’m most likely to…",
    options: [
      { label: "Meet everybody", power: "connector" },
      { label: "Explore what’s around", power: "luxury" },
      { label: "Notice the style", power: "style" },
      { label: "Find the adventure", power: "west" },
    ],
  },
  {
    prompt: "What makes you happiest?",
    options: [
      { label: "Creating something", power: "creator" },
      { label: "Helping somebody", power: "community" },
      { label: "Building something", power: "builder" },
      { label: "Making people feel welcome", power: "honey" },
    ],
  },
  {
    prompt: "If somebody handed you a project budget, what sounds best?",
    options: [
      { label: "Launch a new idea", power: "dreamer" },
      { label: "Host an unforgettable event", power: "connector" },
      { label: "Make it beautiful", power: "style" },
      { label: "Take it somewhere unexpected", power: "west" },
    ],
  },
  {
    prompt: "What do you want more room for?",
    options: [
      { label: "Adventure", power: "west" },
      { label: "Leadership", power: "builder" },
      { label: "Creativity", power: "creator" },
      { label: "Sharing what I know", power: "wise" },
    ],
  },
];

function CrownMark() {
  return <div className={styles.crownMark}>♛</div>;
}

function QrMock() {
  const cells = Array.from({ length: 225 }, (_, i) => {
    const row = Math.floor(i / 15);
    const col = i % 15;
    const finder =
      (row < 5 && col < 5) ||
      (row < 5 && col > 9) ||
      (row > 9 && col < 5);
    const dark = finder || ((row * 7 + col * 11 + row * col) % 5 < 2);
    return <span key={i} className={dark ? styles.qrDark : styles.qrLight} />;
  });
  return <div className={styles.qr}>{cells}</div>;
}

export default function PrettyGirlPalace() {
  const [screen, setScreen] = useState<Screen>("gateway");
  const [guide, setGuide] = useState("honey");
  const [quizIndex, setQuizIndex] = useState(0);
  const [answers, setAnswers] = useState<PowerId[]>([]);
  const [spotStage, setSpotStage] = useState<"place" | "issue" | "match" | "pitch">("place");
  const [place, setPlace] = useState("Restaurant");
  const [issue, setIssue] = useState("Long line");
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<{
    fit: "STRONG_FIT" | "WORTH_SHOWING" | "ASK_FIRST" | "NOT_THIS_ONE";
    productName?: string;
    observed: string;
    reason: string;
    whatToSay?: string;
    dontPromise?: string;
    clarification?: string;
    sanity: "SAY_SOMETHING" | "ASK_FIRST" | "SAVE_FOR_LATER" | "LEAVE_IT";
  } | null>(null);
  const [bagItems, setBagItems] = useState<Array<{
    id: string;
    environment: string;
    observation: string;
    productName?: string | null;
    fitState?: string | null;
    status: string;
    attentionState: string;
    createdAt: string;
  }>>([]);
  const [bagLoading, setBagLoading] = useState(false);

  const combination = useMemo(() => {
    const score = new Map<PowerId, number>();
    answers.forEach((p) => score.set(p, (score.get(p) || 0) + 1));
    const ranked = [...Object.keys(powers) as PowerId[]].sort(
      (a, b) => (score.get(b) || 0) - (score.get(a) || 0)
    );
    const first = ranked[0] || "connector";
    const second = ranked.find((p) => p !== first) || "honey";
    const third =
      answers[4] && answers[4] !== first && answers[4] !== second
        ? answers[4]
        : ranked.find((p) => p !== first && p !== second) || "west";
    return [first, second, third] as PowerId[];
  }, [answers]);

  const selectedGuide = guides.find((g) => g.id === guide) || guides[0];

  function answerQuestion(power: PowerId) {
    const next = [...answers];
    next[quizIndex] = power;
    setAnswers(next);
    if (quizIndex === questions.length - 1) {
      setScreen("reveal");
    } else {
      setQuizIndex(quizIndex + 1);
    }
  }

  function resetSpot() {
    setSpotStage("place");
    setPlace("Restaurant");
    setIssue("Long line");
    setMatchResult(null);
    setScreen("spot");
  }

  async function openBag() {
    setScreen("bag");
    setBagLoading(true);
    try {
      const response = await fetch(
        "https://hub-core-alpha-staging.onrender.com/api/pgp-alpha/opportunities?memberKey=alpha-tanya",
        { cache: "no-store" }
      );
      const data = await response.json();
      setBagItems(Array.isArray(data.opportunities) ? data.opportunities : []);
    } catch {
      setBagItems([]);
    } finally {
      setBagLoading(false);
    }
  }

  async function evaluateSpot(nextIssue: string) {
    setIssue(nextIssue);
    setMatchLoading(true);
    setSpotStage("match");
    try {
      const response = await fetch("/api/pgp/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ environment: place, signal: nextIssue }),
      });
      const data = await response.json();
      setMatchResult(data);

      if (data.fit !== "NOT_THIS_ONE") {
        fetch("https://hub-core-alpha-staging.onrender.com/api/pgp-alpha/opportunities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memberKey: "alpha-tanya",
            environment: place,
            observation: nextIssue,
            structuredProblem: data.reason,
            productName: data.productName || null,
            fitState: data.fit,
            status: data.fit === "ASK_FIRST" ? "NEEDS_CLARIFICATION" : "MATCHED",
            attentionState: data.fit === "ASK_FIRST" ? "NEEDS_YOU" : "NOTHING_TO_DO",
          }),
        }).catch(() => undefined);
      }
    } catch {
      setMatchResult({
        fit: "NOT_THIS_ONE",
        observed: nextIssue,
        reason: "PGP could not check this opportunity right now. Try again in a moment.",
        sanity: "SAVE_FOR_LATER",
      });
    } finally {
      setMatchLoading(false);
    }
  }

  return (
    <main className={styles.app}>
      <div className={styles.ambientOne} />
      <div className={styles.ambientTwo} />

      <header className={styles.topbar}>
        <button className={styles.brandButton} onClick={() => setScreen("home")}>
          <CrownMark />
          <span>
            <strong>PGP</strong>
            <small>Pretty Girl Palace</small>
          </span>
        </button>
        <span className={styles.alpha}>ALPHA</span>
      </header>

      <section className={styles.stage}>
        {screen === "gateway" && (
          <div className={styles.gateway}>
            <div className={styles.palaceSilhouette}>
              <span>♛</span>
              <div />
            </div>
            <p className={styles.eyebrow}>WELCOME TO</p>
            <h1>Pretty Girl Palace</h1>
            <p className={styles.tagline}>There’s a room for you here.</p>
            <div className={styles.actions}>
              <button className={styles.primary} onClick={() => setScreen("confirmed")}>
                ENTER THE PALACE
              </button>
              <button className={styles.secondary} onClick={() => setScreen("confirmed")}>
                I WAS INVITED
              </button>
              <button className={styles.textButton} onClick={() => setScreen("home")}>
                Take a look around
              </button>
            </div>
            <div className={styles.nowPlaying}>♪ Welcome to My Palace · instrumental preview</div>
          </div>
        )}

        {screen === "confirmed" && (
          <div className={styles.centerCard}>
            <CrownMark />
            <p className={styles.eyebrow}>YOUR PALACE STATUS</p>
            <h2>CONFIRMED.</h2>
            <p className={styles.bigCopy}>Yes. You belong here.</p>
            <p>
              Pretty Girl Palace doesn’t rank looks. Around here, “Pretty Girl” is already settled.
              We’re here to discover what kind of power you bring with you.
            </p>
            <button className={styles.primary} onClick={() => setScreen("guide")}>
              FIND MY PRETTY POWER
            </button>
          </div>
        )}

        {screen === "guide" && (
          <div>
            <p className={styles.eyebrow}>CHOOSE YOUR PALACE GUIDE</p>
            <h2 className={styles.sectionTitle}>Who do you want showing you around?</h2>
            <div className={styles.guideGrid}>
              {guides.map((g) => (
                <button
                  key={g.id}
                  className={guide === g.id ? styles.guideActive : styles.guideCard}
                  onClick={() => setGuide(g.id)}
                >
                  <span className={styles.guideIcon}>{g.icon}</span>
                  <strong>{g.name}</strong>
                  <small>{g.tone}</small>
                  <em>“{g.line}”</em>
                </button>
              ))}
            </div>
            <button className={styles.primary} onClick={() => setScreen("quiz")}>
              THAT’S MY GIRL
            </button>
          </div>
        )}

        {screen === "quiz" && (
          <div className={styles.quizCard}>
            <div className={styles.crownProgress}>
              {questions.map((_, i) => <span key={i}>{i <= quizIndex ? "♛" : "○"}</span>)}
            </div>
            <p className={styles.eyebrow}>FIND MY POWER</p>
            <h2>{questions[quizIndex].prompt}</h2>
            <div className={styles.optionList}>
              {questions[quizIndex].options.map((o) => (
                <button key={o.label} onClick={() => answerQuestion(o.power)}>
                  {o.label}<span>›</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {screen === "reveal" && (
          <div className={styles.reveal}>
            <p className={styles.eyebrow}>YOUR PALACE COMBINATION</p>
            <div className={styles.powerHero}>
              <span>{powers[combination[0]].icon}</span>
              <h2>{powers[combination[0]].name}</h2>
              <small>Your natural power</small>
            </div>
            <div className={styles.powerPair}>
              {[combination[1], combination[2]].map((p, index) => (
                <div key={p}>
                  <span>{powers[p].icon}</span>
                  <strong>{powers[p].name}</strong>
                  <small>{index === 0 ? "How you bring it" : "Ready for more room"}</small>
                </div>
              ))}
            </div>
            <div className={styles.formula}>
              {combination.map((p) => powers[p].word).join(" + ")}
            </div>
            <p>
              Your Palace will emphasize experiences, people and opportunities that fit this
              combination. You can discover more powers later.
            </p>
            <button className={styles.primary} onClick={() => setScreen("home")}>
              ENTER MY PALACE
            </button>
          </div>
        )}

        {screen === "home" && (
          <div>
            <div className={styles.welcomeLine}>
              <div>
                <p className={styles.eyebrow}>WELCOME HOME</p>
                <h2>Tanya 👑</h2>
              </div>
              <button className={styles.guideChip} onClick={resetSpot}>
                {selectedGuide.icon} {selectedGuide.name}
              </button>
            </div>

            <h3 className={styles.subhead}>Today at your Palace</h3>
            <div className={styles.dailyGrid}>
              <button className={styles.dailyCard} onClick={() => setScreen("velvet")}>
                <span>🍯 FOR ME</span>
                <strong>Your Velvet Room has something soft playing.</strong>
                <small>Go relax →</small>
              </button>
              <button className={styles.dailyCard}>
                <span>✨ FOR MY POWER</span>
                <strong>Golden Connector mission: introduce two people.</strong>
                <small>I’ll do it →</small>
              </button>
              <button className={styles.dailyCard} onClick={resetSpot}>
                <span>💰 FOR MY POCKET</span>
                <strong>Learn what an Action Signs opportunity looks like.</strong>
                <small>Show me →</small>
              </button>
            </div>

            <h3 className={styles.subhead}>My quick doors</h3>
            <div className={styles.quickGrid}>
              <button onClick={resetSpot}><span>👁️</span><strong>I Spotted Something</strong></button>
              <button onClick={() => setScreen("key")}><span>🔑</span><strong>My Palace Key</strong></button>
              <button><span>🎵</span><strong>Music Hall</strong></button>
              <button onClick={openBag}><span>👜</span><strong>Opportunity Bag</strong></button>
            </div>

            <h3 className={styles.subhead}>What’s happening</h3>
            <div className={styles.eventList}>
              <button className={styles.westEvent} onClick={() => setScreen("west")}>
                <span>🤠</span><div><small>WEST WING · NEW</small><strong>Crowns & Cowboy Boots</strong></div><b>›</b>
              </button>
              <button onClick={() => setScreen("velvet")}>
                <span>🛋️</span><div><small>VELVET ROOM · COME REST</small><strong>Girl, come sit down.</strong></div><b>›</b>
              </button>
              <button>
                <span>🎤</span><div><small>MUSIC HALL · TONIGHT</small><strong>Palace After Dark</strong></div><b>›</b>
              </button>
            </div>
          </div>
        )}

        {screen === "spot" && (
          <div>
            <button className={styles.back} onClick={() => setScreen("home")}>← My Palace</button>
            <p className={styles.eyebrow}>PRETTY GIRL VISION™</p>
            <h2 className={styles.sectionTitle}>I spotted something.</h2>

            {spotStage === "place" && (
              <>
                <p>What are you looking at?</p>
                <div className={styles.tileGrid}>
                  {["Restaurant","Salon","School","Church","Store","Event","Bar / Club","Author / Creator","Business","Rural / Western"].map((p) => (
                    <button key={p} onClick={() => { setPlace(p); setSpotStage("issue"); }}>{p}</button>
                  ))}
                </div>
              </>
            )}

            {spotStage === "issue" && (
              <>
                <div className={styles.contextPill}>{place}</div>
                <h3>What caught your eye?</h3>
                <div className={styles.optionList}>
                  {["Long line","People look confused","Ordering seems slow","Needs more customers","No return / loyalty system","Signage isn’t doing much"].map((x) => (
                    <button key={x} onClick={() => evaluateSpot(x)}>
                      {x}<span>›</span>
                    </button>
                  ))}
                  <button onClick={() => evaluateSpot("I just have a feeling")}>
                    I just have a feeling 👀<span>›</span>
                  </button>
                </div>
              </>
            )}

            {spotStage === "match" && (
              <div className={styles.matchCard}>
                {matchLoading || !matchResult ? (
                  <>
                    <span className={styles.fit}>PGP IS LOOKING…</span>
                    <h2>Girl, give me a second. 👀</h2>
                    <p>Checking what you noticed against Palace-Key-ready HUB solutions.</p>
                  </>
                ) : (
                  <>
                    <span className={styles.fit}>
                      ● {matchResult.fit.replaceAll("_", " ")}
                    </span>
                    <h2>{matchResult.productName || "NOT THIS ONE"}</h2>
                    <dl>
                      <div><dt>WHAT YOU NOTICED</dt><dd>{matchResult.observed} at a {place.toLowerCase()}.</dd></div>
                      <div><dt>WHY</dt><dd>{matchResult.reason}</dd></div>
                      {matchResult.clarification && (
                        <div><dt>ASK FIRST</dt><dd>{matchResult.clarification}</dd></div>
                      )}
                      {matchResult.dontPromise && (
                        <div><dt>DON’T PROMISE</dt><dd>{matchResult.dontPromise}</dd></div>
                      )}
                    </dl>
                    {matchResult.whatToSay && (
                      <button className={styles.primary} onClick={() => setSpotStage("pitch")}>WHAT SHOULD I SAY?</button>
                    )}
                    {(matchResult.fit === "STRONG_FIT" || matchResult.fit === "WORTH_SHOWING") && (
                      <button className={styles.secondary} onClick={() => setScreen("key")}>🔑 MAKE MY KEY</button>
                    )}
                    {(matchResult.fit === "ASK_FIRST" || matchResult.fit === "NOT_THIS_ONE") && (
                      <button className={styles.secondary} onClick={() => setSpotStage("issue")}>
                        ← TELL PGP SOMETHING ELSE
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {spotStage === "pitch" && (
              <div className={styles.pitchCard}>
                <p className={styles.eyebrow}>NATURAL</p>
                <blockquote>
                  “{matchResult?.whatToSay || "I noticed something that may be worth looking at."}”
                </blockquote>
                <div className={styles.toneRow}>
                  <button>Shorter</button><button>Warmer</button><button>Funny</button><button>More businesslike</button>
                </div>
                <div className={styles.sanity}>
                  <span>😬 DON’T EMBARRASS ME</span>
                  <strong>
                    {matchResult?.sanity === "SAY_SOMETHING"
                      ? "YES — SAY SOMETHING."
                      : matchResult?.sanity === "ASK_FIRST"
                        ? "ASK FIRST."
                        : matchResult?.sanity === "SAVE_FOR_LATER"
                          ? "SAVE IT FOR LATER."
                          : "LEAVE THESE PEOPLE ALONE. 😂"}
                  </strong>
                  <p>{matchResult?.reason || "Keep it brief and useful."}</p>
                </div>
                <button className={styles.primary} onClick={() => setScreen("key")}>MAKE MY PALACE KEY</button>
              </div>
            )}
          </div>
        )}

        {screen === "key" && (
          <div className={styles.keyScreen}>
            <button className={styles.back} onClick={() => setScreen("home")}>← My Palace</button>
            <p className={styles.eyebrow}>MY PALACE KEY™</p>
            <h2>Tanya’s Restaurant Key</h2>
            <p>Opening: <strong>Customer Flow</strong> · Showing: <strong>Action Signs</strong></p>
            <QrMock />
            <div className={styles.keyActions}>
              <a className={styles.primary} href="/k/pgp-tanya-action-signs">OPEN CUSTOMER VIEW</a>
              <button className={styles.secondary}>TEXT IT</button>
              <button className={styles.secondary}>SAVE FOR LATER</button>
            </div>
            <p className={styles.prototypeNote}>
              Alpha preview: QR attribution is visually simulated here; live resolver + Earn Mode attribution is the next backend upload.
            </p>
          </div>
        )}

        {screen === "bag" && (
          <div>
            <button className={styles.back} onClick={() => setScreen("home")}>← My Palace</button>
            <p className={styles.eyebrow}>OPPORTUNITY BAG™</p>
            <h2 className={styles.sectionTitle}>What’s in my bag?</h2>
            <div className={styles.bagSummary}>
              <div><strong>{bagItems.filter((x) => x.attentionState === "NEEDS_YOU").length}</strong><span>NEEDS YOU</span></div>
              <div><strong>{bagItems.filter((x) => x.attentionState === "PGP_IS_WATCHING").length}</strong><span>PGP IS WATCHING</span></div>
              <div><strong>{bagItems.filter((x) => x.attentionState === "NOTHING_TO_DO").length}</strong><span>NOTHING TO DO</span></div>
            </div>
            {bagLoading ? (
              <div className={styles.opportunityCard}>
                <p>PGP is checking your bag…</p>
              </div>
            ) : bagItems.length === 0 ? (
              <div className={styles.opportunityCard}>
                <p>Your live alpha bag is empty right now. Spot something and PGP will start filling it.</p>
              </div>
            ) : (
              bagItems.slice(0, 8).map((item) => (
                <div className={styles.opportunityCard} key={item.id}>
                  <div>
                    <span>{item.environment.toLowerCase().includes("restaurant") ? "🍽️" : "✨"}</span>
                    <div>
                      <strong>{item.environment}</strong>
                      <small>{item.productName || "Needs another question"}</small>
                    </div>
                  </div>
                  <span className={styles.looked}>{item.fitState?.replaceAll("_", " ") || item.status}</span>
                  <p>You noticed: {item.observation}.</p>
                  <p className={styles.guideAdvice}>
                    {item.attentionState === "NEEDS_YOU"
                      ? "🍯 Honey: “We need one more answer before we push this anywhere.”"
                      : "🍯 Honey: “It’s in the bag. You don’t need to chase it.”"}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {screen === "west" && (
          <div className={styles.westWing}>
            <button className={styles.back} onClick={() => setScreen("home")}>← My Palace</button>
            <p className={styles.eyebrow}>PRETTY GIRL PALACE · WEST WING</p>
            <div className={styles.westHero}>
              <span>🤠</span>
              <small>THE GOLDEN RANCH</small>
              <h2>Crowns & Cowboy Boots</h2>
              <p>
                Refined country energy, a little persnickety, a lot capable. Rodeo Rose is the
                white Western/rural lead for this wing—polished, funny, ranch-smart and completely at home here.
              </p>
            </div>
            <div className={styles.westButtons}>
              <button><span>🐎</span><strong>GO PLAY</strong><small>Rodeo Grounds</small></button>
              <button><span>🎵</span><strong>HEAR THE WEST</strong><small>Western soundtrack</small></button>
              <button onClick={resetSpot}><span>💰</span><strong>RIDE FOR IT</strong><small>Golden Ranch Radar</small></button>
              <button><span>👢</span><strong>WESTERN CLOSET</strong><small>Wear your room</small></button>
            </div>
            <div className={styles.ranchZones}>
              <span>Ranch House</span><span>Golden Ranch Market</span><span>Back Forty</span><span>Chaos of the Week</span>
            </div>
          </div>
        )}

        {screen === "velvet" && (
          <div className={styles.velvet}>
            <button className={styles.back} onClick={() => setScreen("home")}>← My Palace</button>
            <div className={styles.velvetCurtain}>✦</div>
            <p className={styles.eyebrow}>THE VELVET ROOM™</p>
            <h2>Girl, come sit down.</h2>
            <p>No selling. No missions. No streak. Nothing to prove.</p>
            <div className={styles.velvetOptions}>
              <button>🎵 Play something</button>
              <button>🌙 Quiet me down</button>
              <button>😂 Make me laugh</button>
              <button>📖 Tell me something good</button>
              <button>💭 Let me think</button>
              <button>👭 Find my girls</button>
            </div>
            <small>Don’t show me work stuff right now.</small>
          </div>
        )}
      </section>

      {screen !== "gateway" && screen !== "confirmed" && screen !== "guide" && screen !== "quiz" && screen !== "reveal" && (
        <nav className={styles.bottomNav}>
          <button onClick={() => setScreen("home")}><span>🏰</span>PALACE</button>
          <button onClick={resetSpot}><span>👁️</span>SPOT</button>
          <button className={styles.crownNav} onClick={resetSpot}><span>♛</span>GUIDE</button>
          <button><span>👭</span>GIRLS</button>
          <button onClick={() => setScreen("reveal")}><span>✨</span>ME</button>
        </nav>
      )}
    </main>
  );
}
