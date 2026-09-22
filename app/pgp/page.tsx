'use client';

import { useEffect, useMemo, useState } from "react";
import styles from "./pgp.module.css";

type Screen =
  | "gateway"
  | "confirmed"
  | "guide"
  | "quiz"
  | "reveal"
  | "save"
  | "home"
  | "spot"
  | "camera"
  | "key"
  | "bag"
  | "guidehub"
  | "hunt"
  | "prepare"
  | "music"
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

const guideVoices: Record<string, {
  welcome: string;
  money: string;
  rest: string;
  strong: string;
  ask: string;
  noFit: string;
}> = {
  honey: {
    welcome: "Girl, look what the Palace has waiting for you today.",
    money: "Let’s see if there’s anything useful worth your time—not just anything to sell.",
    rest: "If you’re tired, I already know where we’re going.",
    strong: "Okayyy, this one actually makes sense.",
    ask: "Wait. One good question first.",
    noFit: "Nope. Leave these people alone and enjoy yourself. 😂",
  },
  bella: {
    welcome: "Your Palace is ready. I’ve pulled forward what deserves your attention.",
    money: "We’ll only surface opportunities that are relevant and presentable.",
    rest: "Rest is part of the standard here.",
    strong: "This is a clean, credible fit.",
    ask: "One clarification will make the recommendation much stronger.",
    noFit: "There is no persuasive reason to introduce anything here.",
  },
  rose: {
    welcome: "Well, look who rode back in. Let’s see what moved while you were gone.",
    money: "We’re looking for the real opening—not chasing folks around town.",
    rest: "If the day has worn you out, kick those boots off.",
    strong: "This dog’ll hunt. Keep it simple.",
    ask: "Hold your horses. Ask one thing first.",
    noFit: "Not this pasture, cowgirl. Keep riding.",
  },
  nova: {
    welcome: "Your Palace updated. Let’s scan what changed and what could be built next.",
    money: "We’re matching live context to the smallest useful solution.",
    rest: "Even the system needs idle time.",
    strong: "Signal is clean. This is worth opening.",
    ask: "Missing one input. Let’s get it before we act.",
    noFit: "No useful signal here. Skip it.",
  },
  asha: {
    welcome: "Welcome back. Your Palace should meet you where you are today.",
    money: "Useful opportunity begins with understanding, not pressure.",
    rest: "You do not have to earn your rest.",
    strong: "This may genuinely help. Offer it with care.",
    ask: "Understand one thing more before you recommend anything.",
    noFit: "Wisdom is also knowing when not to speak.",
  },
};

const dailyPalace: Record<number, {
  label: string;
  forMe: string;
  power: string;
  pocket: string;
  event: string;
}> = {
  0: {
    label: "Crown & Wisdom Sunday",
    forMe: "Start slow in the Velvet Room with Crown & Wisdom.",
    power: "Write down one thing your younger self would be proud of.",
    pocket: "No chasing today. Review what is already moving.",
    event: "Wisdom Circle opens today.",
  },
  1: {
    label: "Crown On Monday",
    forMe: "Reset your room and choose how you want this week to feel.",
    power: "Pick one Pretty Power to deliberately use today.",
    pocket: "Learn one opportunity signal before you leave the Palace.",
    event: "Crown On reset is live.",
  },
  2: {
    label: "Pretty Girl Business Tuesday",
    forMe: "Take five quiet minutes before business mode.",
    power: "Practice one introduction until it sounds like you.",
    pocket: "Teach My Eye has a fresh business scenario.",
    event: "Pretty Girl Business is open.",
  },
  3: {
    label: "Honey Hour Wednesday",
    forMe: "Honey House has the table set.",
    power: "Make one useful introduction with no expectation attached.",
    pocket: "Look for a relationship problem before a product problem.",
    event: "Honey Hour starts today.",
  },
  4: {
    label: "Get That Money Thursday",
    forMe: "Check your energy before you check your Bag.",
    power: "Spot one real problem and ask one better question.",
    pocket: "Review only the opportunities that actually need you.",
    event: "Business Boulevard has Money Moving updates.",
  },
  5: {
    label: "Palace After Dark Friday",
    forMe: "Save something good for yourself tonight.",
    power: "Show up somewhere as your Expansion Power.",
    pocket: "Walk With Me can prep you before tonight’s plans.",
    event: "Palace After Dark opens tonight.",
  },
  6: {
    label: "Outside The Palace Saturday",
    forMe: "Go somewhere that gives you a story to bring back.",
    power: "Use your Expansion Power in the real world.",
    pocket: "Walk With Me is ready before you head out.",
    event: "Golden Ranch and Outside The Palace missions are live.",
  },
};

const musicMoods: Record<string, Array<{title:string; mood:string; status:string}>> = {
  "Palace Classics": [
    { title: "Welcome to My Palace", mood: "Gateway anthem", status: "READY FOR AUDIO" },
    { title: "Crown On My Own Head", mood: "Confidence", status: "PLACEHOLDER" },
    { title: "Pretty Is A Power", mood: "Main theme", status: "PLACEHOLDER" },
    { title: "Golden Door", mood: "Opportunity", status: "PLACEHOLDER" },
  ],
  "Money Energy": [
    { title: "Honey Money", mood: "Earn Mode", status: "PLACEHOLDER" },
    { title: "Golden Door", mood: "Opportunity", status: "PLACEHOLDER" },
    { title: "Boots Made For Business", mood: "West Wing business", status: "PLACEHOLDER" },
  ],
  "West Wing": [
    { title: "Crowns & Cowboy Boots", mood: "Golden Ranch", status: "PLACEHOLDER" },
    { title: "She Rode In Golden", mood: "Western entrance", status: "PLACEHOLDER" },
    { title: "Wildflower Woman", mood: "Community", status: "PLACEHOLDER" },
  ],
  "Palace After Dark": [
    { title: "Palace After Dark", mood: "Friday night", status: "PLACEHOLDER" },
    { title: "She Walks In", mood: "Presence", status: "PLACEHOLDER" },
    { title: "Last Dance At The Palace", mood: "Late-night close", status: "PLACEHOLDER" },
  ],
  "Soft & Golden": [
    { title: "Velvet Room Theme", mood: "Rest", status: "ROOM LOOP PLACEHOLDER" },
    { title: "Queens Build Queens", mood: "Community", status: "PLACEHOLDER" },
    { title: "No Permission Needed", mood: "Quiet confidence", status: "PLACEHOLDER" },
  ],
};


type LaneId =
  | "power"
  | "vision"
  | "camera"
  | "guide"
  | "key"
  | "bag"
  | "walk"
  | "eye"
  | "music"
  | "ranch"
  | "velvet";

const laneIdentities: Record<LaneId, {
  name: string;
  monogram: string;
  tagline: string;
  logoUrl?: string | null;
}> = {
  power: { name: "Pretty Power™", monogram: "PP", tagline: "Discover what you bring.", logoUrl: null },
  vision: { name: "Pretty Girl Vision™", monogram: "PGV", tagline: "Notice. Understand. Match.", logoUrl: null },
  camera: { name: "Opportunity Camera™", monogram: "OC", tagline: "Show PGP what you see.", logoUrl: null },
  guide: { name: "Palace Guide™", monogram: "PG", tagline: "What are we doing, girl?", logoUrl: null },
  key: { name: "Palace Key™", monogram: "PK", tagline: "Open the right door.", logoUrl: null },
  bag: { name: "Opportunity Bag™", monogram: "OB", tagline: "Keep what matters. Leave the rest.", logoUrl: null },
  walk: { name: "Walk With Me™", monogram: "WWM", tagline: "Prepare your eye before you arrive.", logoUrl: null },
  eye: { name: "Teach My Eye™", monogram: "TME", tagline: "Learn the signal before the pitch.", logoUrl: null },
  music: { name: "Music Hall™", monogram: "MH", tagline: "The Palace has a sound.", logoUrl: null },
  ranch: { name: "Golden Ranch™", monogram: "GR", tagline: "Crowns & Cowboy Boots.", logoUrl: null },
  velvet: { name: "Velvet Room™", monogram: "VR", tagline: "Nothing to prove in here.", logoUrl: null },
};

function LaneMark({ lane }: { lane: LaneId }) {
  const identity = laneIdentities[lane];
  return (
    <div className={styles.laneMark} data-lane={lane}>
      {identity.logoUrl ? (
        <img src={identity.logoUrl} alt={identity.name} />
      ) : (
        <span className={styles.laneMonogram}>{identity.monogram}</span>
      )}
      <div>
        <strong>{identity.name}</strong>
        <small>{identity.tagline}</small>
      </div>
    </div>
  );
}

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

const opportunityChoices: Record<string, string[]> = {
  Restaurant: [
    "Long line",
    "Ordering seems slow",
    "People look confused",
    "Needs repeat customers",
    "Signage isn’t doing much",
    "Needs more customers",
  ],
  Salon: [
    "No return / loyalty system",
    "Same booking questions",
    "Customers seem confused",
    "Needs follow-up",
    "Needs more customers",
    "Something else",
  ],
  School: [
    "Students need something creative",
    "Registration / check-in line",
    "Parent communication is scattered",
    "School spirit needs a boost",
    "Event flow is messy",
    "Something else",
  ],
  Church: [
    "Registration / check-in line",
    "Planning VBS",
    "Building Sunday School lessons",
    "People keep asking the same questions",
    "Event information is scattered",
    "Something else",
  ],
  Store: [
    "Customers don’t know what to do next",
    "Needs a better digital follow-up",
    "Signage isn’t doing much",
    "Checkout line",
    "Needs repeat customers",
    "Something else",
  ],
  Event: [
    "Registration is messy",
    "Check-in line",
    "Too many tools / links",
    "Wedding planning is scattered",
    "Attendees keep asking the same questions",
    "Something else",
  ],
  "Bar / Club": [
    "Only using flyers / social",
    "Needs a fan / repeat system",
    "Event promotion feels scattered",
    "VIP flow is messy",
    "Needs more customers",
    "Something else",
  ],
  "Author / Creator": [
    "Published book needs promotion",
    "Book sales are slow",
    "Has an audience but nothing to sell",
    "Needs a product idea",
    "Promotion feels scattered",
    "Something else",
  ],
  Business: [
    "Customers don’t know what to do next",
    "Same questions all day",
    "Needs a digital layer",
    "Needs more customers",
    "Needs repeat customers",
    "Something else",
  ],
  "Rural / Western": [
    "Needs a useful digital layer",
    "Event / fair registration",
    "Signage isn’t doing much",
    "Customer path is unclear",
    "Needs more repeat customers",
    "Something else",
  ],
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
  const [liveKey, setLiveKey] = useState<{ code: string; destination: string } | null>(null);
  const [keyLoading, setKeyLoading] = useState(false);
  const [currentOpportunityId, setCurrentOpportunityId] = useState<string | null>(null);
  const [destinationMode, setDestinationMode] = useState("Sorority Event");
  const [huntProduct, setHuntProduct] = useState("Action Signs");
  const [visitCount, setVisitCount] = useState(1);
  const [isReturning, setIsReturning] = useState(false);
  const [palaceDay, setPalaceDay] = useState(1);
  const [lastVisitLabel, setLastVisitLabel] = useState("");
  const [musicMood, setMusicMood] = useState("Palace Classics");
  const [selectedTrack, setSelectedTrack] = useState("Welcome to My Palace");
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadSaving, setLeadSaving] = useState(false);
  const [leadSaved, setLeadSaved] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [campaignSource, setCampaignSource] = useState<Record<string,string>>({});
  const [cameraAccess, setCameraAccess] = useState<{
    authenticated: boolean;
    cameraActive?: boolean;
    cameraTier?: string | null;
    scansRemaining?: number;
    expiresAt?: string | null;
    error?: string;
  } | null>(null);
  const [cameraAccessLoading, setCameraAccessLoading] = useState(false);
  const [cameraImage, setCameraImage] = useState<string | null>(null);
  const [cameraScanning, setCameraScanning] = useState(false);
  const [cameraResult, setCameraResult] = useState<{
    result?: string;
    headline?: string;
    scene?: { environment?: string; confidence?: number };
    opportunity?: { offer?: string; action?: string };
    message?: string;
    access?: { scansRemaining?: number; cameraTier?: string | null; expiresAt?: string | null };
    error?: string;
  } | null>(null);

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
  const guideVoice = guideVoices[guide] || guideVoices.honey;
  const today = dailyPalace[palaceDay] || dailyPalace[1];

  useEffect(() => {
    const now = new Date();
    setPalaceDay(now.getDay());

    const params = new URLSearchParams(window.location.search);
    const source = {
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_content: params.get("utm_content") || "",
      src: params.get("src") || "",
    };
    setCampaignSource(source);
    window.localStorage.setItem("pgp-alpha-campaign-source", JSON.stringify(source));

    const rawCount = Number(window.localStorage.getItem("pgp-alpha-visit-count") || "0");
    const previousVisit = window.localStorage.getItem("pgp-alpha-last-visit");
    const nextCount = rawCount + 1;

    setVisitCount(nextCount);
    setIsReturning(rawCount > 0);

    if (previousVisit) {
      const previous = new Date(previousVisit);
      if (!Number.isNaN(previous.getTime())) {
        setLastVisitLabel(
          previous.toLocaleDateString(undefined, { month: "short", day: "numeric" })
        );
      }
    }

    window.localStorage.setItem("pgp-alpha-visit-count", String(nextCount));
    window.localStorage.setItem("pgp-alpha-last-visit", now.toISOString());
  }, []);

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

  async function openOpportunityCamera() {
    setScreen("camera");
    setCameraAccessLoading(true);
    setCameraResult(null);
    try {
      const response = await fetch("/api/pgp/entitlements", { cache: "no-store" });
      if (response.status === 401) {
        setCameraAccess({ authenticated: false, error: "SIGN_IN_REQUIRED" });
        return;
      }
      const data = await response.json();
      setCameraAccess({
        authenticated: true,
        cameraActive: Boolean(data?.entitlements?.cameraActive),
        cameraTier: data?.entitlements?.cameraTier || null,
        scansRemaining: Number(data?.entitlements?.cameraScansRemaining || 0),
        expiresAt: data?.entitlements?.cameraExpiresAt || null,
      });
    } catch {
      setCameraAccess({ authenticated: false, error: "ACCESS_CHECK_FAILED" });
    } finally {
      setCameraAccessLoading(false);
    }
  }

  async function scanOpportunityCamera() {
    if (!cameraImage) return;
    setCameraScanning(true);
    setCameraResult(null);
    try {
      const response = await fetch("/api/pgp/camera/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_data_url: cameraImage }),
      });
      const data = await response.json();
      setCameraResult(data);

      if (response.ok && data?.access) {
        setCameraAccess((previous) => ({
          authenticated: true,
          cameraActive: true,
          cameraTier: data.access.cameraTier || previous?.cameraTier || null,
          scansRemaining: Number(data.access.scansRemaining || 0),
          expiresAt: data.access.expiresAt || previous?.expiresAt || null,
        }));
      }
    } catch {
      setCameraResult({
        error: "CAMERA_SCAN_FAILED",
        message: "The scan could not be completed right now.",
      });
    } finally {
      setCameraScanning(false);
    }
  }

  async function makeLiveKey() {
    setKeyLoading(true);
    try {
      const product = matchResult?.productName || "Action Signs";
      const destination =
        product.includes("Creator College")
          ? "/k/pgp-tanya-creator-college"
          : product.includes("Book Bomb")
            ? "/k/pgp-tanya-book-bomb"
            : product.includes("Beauty Bot")
              ? "/k/pgp-tanya-beauty-bot"
              : product.includes("Sunday School") || product.includes("VBS")
                ? "/k/pgp-tanya-vbs"
                : product.includes("Dude Fan")
                  ? "/k/pgp-tanya-dudefan"
                  : product.includes("Wedding") || product.includes("Event System")
                    ? "/k/pgp-tanya-event"
                    : product.includes("Bot Stores")
                      ? "/k/pgp-tanya-bot-stores"
                      : product.includes("Pretty Girl Palace")
                        ? "/k/pgp-tanya-invite"
                        : "/k/pgp-tanya-action-signs";

      const response = await fetch(
        "/api/pgp-alpha/keys",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memberKey: "alpha-tanya",
            keyType: "QUICK",
            contextType: place,
            productName: product,
            opportunityId: currentOpportunityId,
            destination,
          }),
        }
      );
      const data = await response.json();
      if (response.ok && data?.key?.code) {
        setLiveKey({ code: data.key.code, destination: data.key.destination });
      }
    } catch {
      setLiveKey(null);
    } finally {
      setKeyLoading(false);
    }
  }

  async function openBag() {
    setScreen("bag");
    setBagLoading(true);
    try {
      const response = await fetch(
        "/api/pgp-alpha/opportunities?memberKey=alpha-tanya",
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
        try {
          const saved = await fetch(
            "/api/pgp-alpha/opportunities",
            {
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
            }
          );
          const savedData = await saved.json();
          if (saved.ok && savedData?.opportunity?.id) {
            setCurrentOpportunityId(savedData.opportunity.id);
          }
        } catch {
          setCurrentOpportunityId(null);
        }
      } else {
        setCurrentOpportunityId(null);
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
        <span className={styles.alpha}>PUBLIC BETA</span>
      </header>

      <section className={styles.stage}>
        {screen === "gateway" && (
          <div className={styles.gateway}>
            <img
              className={styles.heroVisual}
              src="https://cdn.shopify.com/s/files/1/1982/3607/files/pgp-enter-the-palace.png?v=1789834055"
              alt="Pretty Girl Palace grand entrance"
            />
            <p className={styles.eyebrow}>WELCOME TO</p>
            <h1>Pretty Girl Palace</h1>
            <p className={styles.tagline}>There’s a room for you here.</p>
            <div className={styles.actions}>
              <button
                className={styles.primary}
                onClick={() => setScreen(isReturning ? "home" : "confirmed")}
              >
                {isReturning ? "RETURN TO MY PALACE" : "ENTER THE PALACE"}
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
            <img
              className={styles.revealVisual}
              src="https://cdn.shopify.com/s/files/1/1982/3607/files/pgp-discover-your-power.png?v=1789834458"
              alt="Pretty Girl Palace Pretty Power result"
            />
            <LaneMark lane="power" />
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
            <button className={styles.primary} onClick={() => setScreen("save")}>
              SAVE MY PALACE
            </button>
            <button className={styles.textButton} onClick={() => setScreen("home")}>
              Keep exploring as a guest
            </button>
          </div>
        )}

        {screen === "save" && (
          <div className={styles.saveCard}>
            <button className={styles.back} onClick={() => setScreen("reveal")}>← My Power</button>
            <p className={styles.eyebrow}>KEEP MY PALACE READY</p>
            <h2>Your room should still be here when you come back.</h2>
            <p>
              Save your Palace Combination and early-access place. No subscription required.
            </p>

            <label className={styles.saveLabel}>First name</label>
            <input
              className={styles.saveInput}
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              placeholder="What should the Palace call you?"
            />

            <label className={styles.saveLabel}>Email</label>
            <input
              className={styles.saveInput}
              type="email"
              value={leadEmail}
              onChange={(e) => setLeadEmail(e.target.value)}
              placeholder="you@example.com"
            />

            <button
              className={styles.primary}
              disabled={leadSaving || !leadEmail.includes("@")}
              onClick={async () => {
                setLeadSaving(true);
                try {
                  const response = await fetch(
                    "/api/pgp-alpha/leads",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        email: leadEmail,
                        displayName: leadName || null,
                        source: "pgp-public-beta",
                        guideId: guide,
                        naturalPower: combination[0],
                        supportingPower: combination[1],
                        expansionPower: combination[2],
                        payload: {
                          visitCount,
                          publicBeta: true,
                          campaignSource,
                          landingReferrer: document.referrer || null,
                        },
                      }),
                    }
                  );
                  if (response.ok) {
                    setLeadSaved(true);
                    if (leadName.trim()) {
                      window.localStorage.setItem("pgp-alpha-name", leadName.trim());
                    }
                    window.localStorage.setItem("pgp-alpha-email", leadEmail.trim().toLowerCase());
                    setTimeout(() => setScreen("home"), 500);
                  }
                } finally {
                  setLeadSaving(false);
                }
              }}
            >
              {leadSaving ? "SAVING MY PALACE…" : leadSaved ? "PALACE SAVED 👑" : "SAVE MY PALACE"}
            </button>

            <button className={styles.textButton} onClick={() => setScreen("home")}>
              Not now — keep exploring
            </button>

            <small className={styles.saveFine}>
              We’ll use this to keep your Palace access and beta updates connected to you.
            </small>
          </div>
        )}

        {screen === "home" && (
          <div>
            {isReturning && (
              <div className={styles.returnMoment}>
                <span>👑</span>
                <div>
                  <small>WELCOME BACK · VISIT {visitCount}</small>
                  <strong>Your Palace moved while you were gone.</strong>
                  <p>
                    {lastVisitLabel ? "Last visit: " + lastVisitLabel + ". " : ""}
                    {today.event}
                  </p>
                </div>
              </div>
            )}
            <div className={styles.welcomeLine}>
              <div>
                <p className={styles.eyebrow}>{today.label}</p>
                <h2>{leadName || (typeof window !== "undefined" ? window.localStorage.getItem("pgp-alpha-name") : null) || "Pretty Girl"} 👑</h2>
                <p className={styles.guideWelcome}>{guideVoice.welcome}</p>
              </div>
              <button className={styles.guideChip} onClick={resetSpot}>
                {selectedGuide.icon} {selectedGuide.name}
              </button>
            </div>

            <h3 className={styles.subhead}>Today at your Palace</h3>
            <div className={styles.dailyGrid}>
              <button className={styles.dailyCard} onClick={() => setScreen("velvet")}>
                <span>🍯 FOR ME</span>
                <strong>{today.forMe}</strong>
                <small>{guideVoice.rest} →</small>
              </button>
              <button className={styles.dailyCard} onClick={() => setScreen("guidehub")}>
                <span>✨ FOR MY POWER</span>
                <strong>{today.power}</strong>
                <small>Use my Guide →</small>
              </button>
              <button className={styles.dailyCard} onClick={() => setScreen("guidehub")}>
                <span>💰 FOR MY POCKET</span>
                <strong>{today.pocket}</strong>
                <small>{guideVoice.money} →</small>
              </button>
            </div>

            <h3 className={styles.subhead}>My quick doors</h3>
            <div className={styles.quickGrid}>
              <button onClick={resetSpot}><span>👁️</span><strong>I Spotted Something</strong></button>
              <button onClick={openOpportunityCamera}><span>📷</span><strong>Opportunity Camera</strong></button>
              <button onClick={() => setScreen("key")}><span>🔑</span><strong>My Palace Key</strong></button>
              <button onClick={() => setScreen("music")}><span>🎵</span><strong>Music Hall</strong></button>
              <button onClick={openBag}><span>👜</span><strong>Opportunity Bag</strong></button>
              <button
                onClick={async () => {
                  const shareUrl = "https://urbanspirit.biz/pages/pretty-girl-palace";
                  const shareText = "I found Pretty Girl Palace. There’s a room for you here.";
                  try {
                    if (navigator.share) {
                      await navigator.share({ title: "Pretty Girl Palace", text: shareText, url: shareUrl });
                    } else {
                      await navigator.clipboard.writeText(shareText + " " + shareUrl);
                      setShareCopied(true);
                      setTimeout(() => setShareCopied(false), 1800);
                    }
                  } catch {}
                }}
              >
                <span>👭</span><strong>{shareCopied ? "Invite Copied!" : "Call My Girl"}</strong>
              </button>
            </div>

            <h3 className={styles.subhead}>What’s happening</h3>
            <div className={styles.eventList}>
              <button className={styles.westEvent} onClick={() => setScreen("west")}>
                <span>🤠</span><div><small>WEST WING · NEW</small><strong>Crowns & Cowboy Boots</strong></div><b>›</b>
              </button>
              <button onClick={() => setScreen("velvet")}>
                <span>🛋️</span><div><small>VELVET ROOM · COME REST</small><strong>Girl, come sit down.</strong></div><b>›</b>
              </button>
              <button onClick={() => setScreen("music")}>
                <span>🎤</span><div><small>MUSIC HALL · TONIGHT</small><strong>Palace After Dark</strong></div><b>›</b>
              </button>
              <button onClick={() => setScreen("prepare")}>
                <span>👢</span><div><small>WALK WITH ME · PREP MODE</small><strong>I’m going somewhere.</strong></div><b>›</b>
              </button>
            </div>
          </div>
        )}

        {screen === "camera" && (
          <div>
            <button className={styles.back} onClick={() => setScreen("home")}>← My Palace</button>
            <LaneMark lane="camera" />
            <p className={styles.eyebrow}>PRETTY GIRL VISION™</p>
            <h2 className={styles.sectionTitle}>Show me what you see.</h2>

            <div className={styles.cameraHero}>
              <img
                src="https://cdn.shopify.com/s/files/1/1982/3607/files/pgp-vision-ui.png?v=1789834469"
                alt="Pretty Girl Vision Opportunity Camera"
              />
              <div>
                <span className={styles.fit}>OPPORTUNITY CAMERA</span>
                <h3>Look at the business problem—not the person.</h3>
                <p>
                  Aim toward a storefront, sign, display, booth, menu, event table or other
                  public-facing information. PGP should not infer private or sensitive traits
                  about people in the image.
                </p>
              </div>
            </div>

            {cameraAccessLoading ? (
              <div className={styles.cameraAccessCard}>
                <strong>Checking your Palace access…</strong>
              </div>
            ) : cameraAccess?.authenticated === false ? (
              <div className={styles.cameraAccessCard}>
                <span className={styles.fit}>SIGN IN TO USE YOUR CAMERA</span>
                <h3>Connect this Palace visit to your Shopify account.</h3>
                <p>
                  Your scan allowance and purchases live with your HUB account so they can follow you across devices.
                </p>
                <a className={styles.primary} href="/api/auth/shopify/start?next=/pgp">
                  SIGN IN TO MY PALACE
                </a>
              </div>
            ) : !cameraAccess?.cameraActive ? (
              <div className={styles.cameraAccessCard}>
                <span className={styles.fit}>CAMERA PASS NEEDED</span>
                <h3>Start with 3 free scans.</h3>
                <p>
                  First Look includes 3 scans. Paid passes begin at $1.99 for 30 days / 40 scans.
                  Camera+ includes 150 scans and Opportunity Bag support.
                </p>
                <a
                  className={styles.primary}
                  href="https://urbanspirit.biz/products/pretty-girl-vision-opportunity-camera"
                >
                  GET MY CAMERA PASS
                </a>
                <a
                  className={styles.secondary}
                  href="https://urbanspirit.biz/pages/opportunity-camera"
                >
                  SEE HOW IT WORKS
                </a>
              </div>
            ) : (
              <>
                <div className={styles.cameraAccessBar}>
                  <span>{cameraAccess.cameraTier || "CAMERA"}</span>
                  <strong>{cameraAccess.scansRemaining ?? 0} scans left</strong>
                </div>

                <label className={styles.cameraCapture}>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        setCameraImage(String(reader.result || ""));
                        setCameraResult(null);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <span>📷 OPEN CAMERA / CHOOSE PHOTO</span>
                </label>

                {cameraImage && (
                  <div className={styles.cameraPreviewWrap}>
                    <img className={styles.cameraPreview} src={cameraImage} alt="Opportunity Camera preview" />
                    <button
                      className={styles.primary}
                      disabled={cameraScanning}
                      onClick={scanOpportunityCamera}
                    >
                      {cameraScanning ? "OPPORTUNITY BRAIN IS LOOKING…" : "SEE THE OPPORTUNITY"}
                    </button>
                  </div>
                )}

                {cameraResult && (
                  <div className={styles.cameraResult}>
                    <span className={styles.fit}>
                      {(cameraResult.result || cameraResult.error || "RESULT").replaceAll("_", " ")}
                    </span>
                    <h3>{cameraResult.headline || "Camera result"}</h3>
                    {cameraResult.scene?.environment && (
                      <div>
                        <strong>WHAT I SEE</strong>
                        <p>{cameraResult.scene.environment.replaceAll("_", " ")}</p>
                      </div>
                    )}
                    {cameraResult.opportunity?.offer && (
                      <div>
                        <strong>BEST MATCH</strong>
                        <p>{cameraResult.opportunity.offer}</p>
                      </div>
                    )}
                    <div>
                      <strong>YOUR MOVE</strong>
                      <p>{cameraResult.opportunity?.action || cameraResult.message || "Keep looking."}</p>
                    </div>
                    {cameraResult.error && (
                      <p className={styles.cameraError}>
                        This scan was not charged if the camera worker failed.
                      </p>
                    )}
                    <button
                      className={styles.secondary}
                      onClick={() => {
                        setCameraImage(null);
                        setCameraResult(null);
                      }}
                    >
                      SCAN ANOTHER
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {screen === "spot" && (
          <div>
            <button className={styles.back} onClick={() => setScreen("home")}>← My Palace</button>
            <LaneMark lane="vision" />
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
                  {(opportunityChoices[place] || opportunityChoices.Business).map((x) => (
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
                    <div className={styles.guideMoment}>
                      <span>{selectedGuide.icon}</span>
                      <p>
                        {selectedGuide.name + ": “" +
                          (matchResult.fit === "NOT_THIS_ONE"
                            ? guideVoice.noFit
                            : matchResult.fit === "ASK_FIRST"
                              ? guideVoice.ask
                              : guideVoice.strong) +
                          "”"}
                      </p>
                    </div>
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
            <LaneMark lane="key" />
            <p className={styles.eyebrow}>MY PALACE KEY™</p>
            <h2>{leadName || "My"} {place} Key</h2>
            <p>
              Opening: <strong>{issue}</strong> · Showing: <strong>{matchResult?.productName || "Best-fit HUB solution"}</strong>
            </p>
            <div className={styles.keyGuideNote}>
              <span>{selectedGuide.icon}</span>
              <div>
                <strong>{selectedGuide.name} says:</strong>
                <p>
                  {matchResult?.whatToSay
                    ? "Keep it natural. You already have the words—now just open the right door."
                    : "This Key should only be shared when the fit feels real."}
                </p>
              </div>
            </div>
            <QrMock />
            <div className={styles.keyActions}>
              {!liveKey ? (
                <button className={styles.primary} onClick={makeLiveKey} disabled={keyLoading}>
                  {keyLoading ? "CREATING LIVE KEY…" : "CREATE LIVE PALACE KEY"}
                </button>
              ) : (
                <a className={styles.primary} href={"/k/" + liveKey.code}>
                  OPEN LIVE KEY · {liveKey.code}
                </a>
              )}
              <a className={styles.secondary} href="/k/pgp-tanya-action-signs">OPEN CUSTOMER VIEW</a>
              <button className={styles.secondary}>TEXT IT</button>
              <button className={styles.secondary}>SAVE FOR LATER</button>
            </div>
            <p className={styles.prototypeNote}>
              {liveKey
                ? "Live alpha resolver active. Opening this Key records an open event before routing to the customer destination."
                : "Create the live alpha Key to activate resolver-based routing and attribution events."}
            </p>
          </div>
        )}

        {screen === "bag" && (
          <div>
            <button className={styles.back} onClick={() => setScreen("home")}>← My Palace</button>
            <div className={styles.bagHeader}>
              <div>
                <LaneMark lane="bag" />
            <p className={styles.eyebrow}>OPPORTUNITY BAG™</p>
                <h2 className={styles.sectionTitle}>What’s in my bag?</h2>
              </div>
              <button className={styles.refreshButton} onClick={openBag} disabled={bagLoading}>
                {bagLoading ? "Checking…" : "Refresh"}
              </button>
            </div>
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
                  <span className={styles.looked}>
                    {item.status === "VIEWED"
                      ? "THEY LOOKED"
                      : item.status === "KEY_READY"
                        ? "KEY READY"
                        : item.status === "CONVERSION_PENDING"
                          ? "MONEY MOVING"
                          : item.fitState?.replaceAll("_", " ") || item.status}
                  </span>
                  <p>You noticed: {item.observation}.</p>
                  <p className={styles.guideAdvice}>
                    {item.attentionState === "NEEDS_YOU"
                      ? selectedGuide.icon + " " + selectedGuide.name + ": “We need one more answer before we push this anywhere.”"
                      : item.status === "VIEWED"
                        ? selectedGuide.icon + " " + selectedGuide.name + ": “They looked. Give them some room.”"
                        : item.status === "CONVERSION_PENDING"
                          ? selectedGuide.icon + " " + selectedGuide.name + ": “The handoff is recorded. Let the system do its work.”"
                          : selectedGuide.icon + " " + selectedGuide.name + ": “It’s in the bag. You don’t need to chase it.”"}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {screen === "guidehub" && (
          <div>
            <button className={styles.back} onClick={() => setScreen("home")}>← My Palace</button>
            <LaneMark lane="guide" />
            <p className={styles.eyebrow}>YOUR PALACE GUIDE</p>
            <h2 className={styles.sectionTitle}>What are we doing, girl?</h2>

            <div className={styles.guideHubIntro}>
              <span>{selectedGuide.icon}</span>
              <div>
                <strong>{selectedGuide.name}</strong>
                <p>{selectedGuide.line} Pick the kind of help you need and I’ll take it from there.</p>
              </div>
            </div>

            <div className={styles.guideHubGrid}>
              <button onClick={resetSpot}>
                <span>👁️</span><strong>I SAW SOMETHING</strong><small>Help me figure out whether it is really an opportunity.</small>
              </button>
              <button onClick={openOpportunityCamera}>
                <span>📷</span><strong>SHOW ME WHAT YOU SEE</strong><small>Use Opportunity Camera on a storefront, sign, booth, display or other public-facing scene.</small>
              </button>
              <button onClick={() => setScreen("prepare")}>
                <span>👢</span><strong>I’M GOING SOMEWHERE</strong><small>Prepare my eye before I get there.</small>
              </button>
              <button onClick={() => setScreen("hunt")}>
                <span>💰</span><strong>I’M LOOKING FOR SOMETHING</strong><small>Teach me where a particular HUB opportunity naturally appears.</small>
              </button>
              <button onClick={() => setScreen("velvet")}>
                <span>🛋️</span><strong>GIRL, I’M DONE</strong><small>No work. Take me to the Velvet Room.</small>
              </button>
            </div>

            <p className={styles.guideHubRule}>
              PGP rule: you never have to sell just because you noticed something.
            </p>
          </div>
        )}

        {screen === "hunt" && (
          <div>
            <button className={styles.back} onClick={() => setScreen("guidehub")}>← My Guide</button>
            <LaneMark lane="eye" />
            <p className={styles.eyebrow}>TEACH MY EYE™</p>
            <h2 className={styles.sectionTitle}>What kind of opportunity are you looking for?</h2>

            <div className={styles.huntTabs}>
              {["Action Signs","Book Bomb Bot","Creator College","Beauty Bot","Bot Stores"].map((product) => (
                <button
                  key={product}
                  className={huntProduct === product ? styles.huntActive : styles.huntChoice}
                  onClick={() => setHuntProduct(product)}
                >
                  {product}
                </button>
              ))}
            </div>

            <div className={styles.huntCard}>
              <span className={styles.fit}>LOOK FOR THE REAL SIGNAL</span>
              <h3>{huntProduct}</h3>

              {huntProduct === "Action Signs" ? (
                <>
                  <div><strong>GOOD PLACES TO NOTICE</strong><p>Restaurants, registrations, events, schools, churches, retail counters and anywhere people repeat a simple action.</p></div>
                  <div><strong>LISTEN FOR</strong><p>“Everybody keeps asking…” · “The line gets backed up…” · “People don’t know where to go…”</p></div>
                  <div><strong>DON’T PITCH JUST BECAUSE</strong><p>A business has a line. First find out whether the line is structural, temporary, or already solved.</p></div>
                </>
              ) : huntProduct === "Book Bomb Bot" ? (
                <>
                  <div><strong>GOOD PLACES TO NOTICE</strong><p>Author events, bookstores, church authors, writing groups, conferences and creator gatherings.</p></div>
                  <div><strong>LISTEN FOR</strong><p>“My book isn’t moving.” · “I don’t know how to market it.” · “Amazon isn’t doing much.”</p></div>
                  <div><strong>ASK FIRST</strong><p>Is the book actually published and available for purchase?</p></div>
                </>
              ) : huntProduct === "Creator College" ? (
                <>
                  <div><strong>GOOD PLACES TO NOTICE</strong><p>Schools, parent groups, creator meetups, churches, organizations and people sitting on unfinished ideas.</p></div>
                  <div><strong>LISTEN FOR</strong><p>“I want them creating.” · “I have an idea but don’t know what to build.” · “We need something practical.”</p></div>
                  <div><strong>KEEP IT REAL</strong><p>Creator College is a build pathway—not a promise of income or academic outcomes.</p></div>
                </>
              ) : huntProduct === "Beauty Bot" ? (
                <>
                  <div><strong>GOOD PLACES TO NOTICE</strong><p>Salons, beauty suites, stylists, barbers, beauty educators and busy service businesses.</p></div>
                  <div><strong>LISTEN FOR</strong><p>“Clients keep asking the same thing.” · “I need them to come back.” · “Booking is all over the place.”</p></div>
                  <div><strong>DON’T ASSUME</strong><p>A busy salon does not automatically need a new system. Find the actual friction.</p></div>
                </>
              ) : (
                <>
                  <div><strong>GOOD PLACES TO NOTICE</strong><p>Small businesses with a good product but a confusing digital customer path.</p></div>
                  <div><strong>LISTEN FOR</strong><p>“People don’t know what to click.” · “I answer the same questions all day.” · “I need something simple on the front end.”</p></div>
                  <div><strong>YOUR JOB</strong><p>Identify the customer problem first. Then let PGP match the smallest useful bot or digital layer.</p></div>
                </>
              )}

              <button className={styles.primary} onClick={resetSpot}>I FOUND SOMETHING →</button>
            </div>
          </div>
        )}

        {screen === "prepare" && (
          <div>
            <button className={styles.back} onClick={() => setScreen("home")}>← My Palace</button>
            <LaneMark lane="walk" />
            <p className={styles.eyebrow}>WALK WITH ME™</p>
            <h2 className={styles.sectionTitle}>I’m going somewhere.</h2>
            <p className={styles.prepIntro}>
              Tell PGP where you’re headed and we’ll help you know what to listen for.
              No background location tracking. You choose the context.
            </p>

            <div className={styles.prepGrid}>
              {["Sorority Event","Conference","Wedding","Church","Rodeo","County Fair","School Event","Author Event","Business Mixer","Girls’ Trip"].map((d) => (
                <button
                  key={d}
                  className={destinationMode === d ? styles.prepActive : styles.prepChoice}
                  onClick={() => setDestinationMode(d)}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className={styles.prepBrief}>
              <span className={styles.fit}>YOUR PALACE BRIEF</span>
              <h3>{destinationMode}</h3>

              {destinationMode === "Sorority Event" ? (
                <>
                  <div><strong>LISTEN FOR</strong><p>“Registration is a mess.” · “I wrote a book.” · “We need something creative for our girls.” · “Who did your merch?”</p></div>
                  <div><strong>POSSIBLE FITS</strong><p>Action Signs · Book Bomb Bot · Creator College · PGP Merch · Pretty Girl Palace itself.</p></div>
                  <div><strong>DON’T DO</strong><p>Do not walk around pitching six things to everybody. Enjoy the event and let real conversations create the opening.</p></div>
                </>
              ) : destinationMode === "Rodeo" || destinationMode === "County Fair" ? (
                <>
                  <div><strong>GOLDEN RANCH RADAR</strong><p>Watch for local vendors, Western boutiques, event-flow problems, community groups, creators, church/family programming and tourism opportunities.</p></div>
                  <div><strong>POSSIBLE FITS</strong><p>Golden Ranch Market · Action Signs · Bot Stores · Creator College · County Fair / rural VBS experiences.</p></div>
                  <div><strong>DON’T FORCE</strong><p>Local trust matters. Add a useful digital layer only where it actually solves something.</p></div>
                </>
              ) : (
                <>
                  <div><strong>LISTEN FOR</strong><p>Problems people say out loud: too many steps, no clear next action, poor promotion, slow follow-up, scattered tools, or a good idea with no path.</p></div>
                  <div><strong>YOUR JOB</strong><p>Notice first. Ask one good question. Let Pretty Girl Vision decide whether there is a real HUB fit.</p></div>
                  <div><strong>REMEMBER</strong><p>You are going to the event—not going hunting through people. Opportunity should feel natural.</p></div>
                </>
              )}

              <button className={styles.primary} onClick={resetSpot}>I SEE SOMETHING →</button>
            </div>
          </div>
        )}

        {screen === "music" && (
          <div>
            <button className={styles.back} onClick={() => setScreen("home")}>← My Palace</button>
            <LaneMark lane="music" />
            <p className={styles.eyebrow}>PGP MUSIC HALL</p>
            <h2 className={styles.sectionTitle}>The Palace has a sound.</h2>

            <div className={styles.musicHero}>
              <img
                src="https://cdn.shopify.com/s/files/1/1982/3607/files/pgp-home-ui.png?v=1789834463"
                alt="Pretty Girl Palace Music Hall atmosphere"
              />
              <div>
                <small>MAIN ALBUM</small>
                <h3>Pretty Girl Palace</h3>
                <p>The Crown Inside Me</p>
              </div>
            </div>

            <div className={styles.musicMoodRow}>
              {Object.keys(musicMoods).map((mood) => (
                <button
                  key={mood}
                  className={musicMood === mood ? styles.musicMoodActive : styles.musicMoodChoice}
                  onClick={() => {
                    setMusicMood(mood);
                    setSelectedTrack(musicMoods[mood][0].title);
                  }}
                >
                  {mood}
                </button>
              ))}
            </div>

            <div className={styles.nowPlayingCard}>
              <span>NOW IN YOUR ROOM</span>
              <strong>{selectedTrack}</strong>
              <p>{musicMood} · soundtrack slot ready</p>
            </div>

            <div className={styles.trackList}>
              {musicMoods[musicMood].map((track,i) => (
                <button
                  className={selectedTrack === track.title ? styles.trackActive : styles.track}
                  key={track.title}
                  onClick={() => setSelectedTrack(track.title)}
                >
                  <span>{String(i+1).padStart(2,"0")}</span>
                  <div><strong>{track.title}</strong><small>{track.mood}</small></div>
                  <em>{track.status}</em>
                </button>
              ))}
            </div>

            <div className={styles.musicNote}>
              <strong>SONIC BUILD RULE</strong>
              <p>
                Full songs, room loops and short 6–22 second motifs can all use the same musical DNA.
                We can drop final audio into these slots as it becomes available without changing the experience.
              </p>
            </div>
          </div>
        )}

        {screen === "west" && (
          <div className={styles.westWing}>
            <button className={styles.back} onClick={() => setScreen("home")}>← My Palace</button>
            <LaneMark lane="ranch" />
            <p className={styles.eyebrow}>PRETTY GIRL PALACE · WEST WING</p>
            <div className={styles.westHero}>
              <img
                className={styles.westVisual}
                src="https://cdn.shopify.com/s/files/1/1982/3607/files/pgp-golden-ranch.png?v=1789834060"
                alt="Pretty Girl Palace Golden Ranch West Wing"
              />
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
            <LaneMark lane="velvet" />
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
          <button className={styles.crownNav} onClick={() => setScreen("guidehub")}><span>♛</span>GUIDE</button>
          <button><span>👭</span>GIRLS</button>
          <button onClick={() => setScreen("reveal")}><span>✨</span>ME</button>
        </nav>
      )}
    </main>
  );
}
