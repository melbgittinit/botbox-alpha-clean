export type MediaStory = {
  id: string;
  ding: string;
  title: string;
  summary: string;
  why: string;
  zone: "STORE" | "FACTORY" | "EXECUTIVE";
  bot: string;
  state: "JUST DINGED" | "FRESH" | "DEVELOPING";
  beat: string[];
  straight: string;
  feature: string;
  fun: string;
};

export const stories: MediaStory[] = [
  {
    id: "golden-goose",
    ding: "0047",
    title: "Golden Goose Bot enters the showroom",
    summary: "A purpose-built concept bot organizes, pressures-tests and develops business ideas instead of acting as a general assistant.",
    why: "It gives reporters a simple way to examine the larger Bot Stores thesis: people may prefer different AI workers for different jobs.",
    zone: "STORE",
    bot: "Golden Goose Bot",
    state: "JUST DINGED",
    beat: ["AI", "Business", "Entrepreneurship", "Culture"],
    straight: "The Bot Stores Adds a Purpose-Built AI Agent for Business-Idea Development",
    feature: "Will People Shop for Specialized AI Workers Instead of One General Assistant?",
    fun: "This Golden Goose Does Not Lay Eggs. It Lays Business Ideas."
  },
  {
    id: "contract-radar",
    ding: "0046",
    title: "Government Contract Radar moves into prepared-product status",
    summary: "The Bot Stores is developing a specialized discovery and preparation experience around public contracting opportunities.",
    why: "It illustrates a job-specific bot aimed at reducing search and preparation friction while avoiding guarantees of awards or eligibility.",
    zone: "STORE",
    bot: "Government Contract Radar",
    state: "FRESH",
    beat: ["Business", "Government", "Small Business", "AI"],
    straight: "The Bot Stores Develops Specialized AI Radar for Government Opportunity Discovery",
    feature: "Can a Purpose-Built AI Bot Make Public Contract Discovery Easier for Small Businesses?",
    fun: "A Bot Built to Hunt Public Contract Opportunities"
  },
  {
    id: "brandbridge",
    ding: "0045",
    title: "BrandBridge opens on The Executive Floor",
    summary: "BrandBridge is the Bot Stores concept layer for brand-specific and enterprise-scale bot systems.",
    why: "It separates the consumer showroom from larger organizational applications and concept demonstrations.",
    zone: "EXECUTIVE",
    bot: "BrandBridge",
    state: "DEVELOPING",
    beat: ["Enterprise", "Brands", "AI", "Technology"],
    straight: "The Bot Stores Adds an Executive Layer for Brand-Specific AI Systems",
    feature: "What Happens When a Bot Store Moves Upstairs to Enterprise?",
    fun: "There Is an Executive Floor Inside The Bot Stores"
  }
];

export const truthFacts = [
  {
    id: "BTS-FACT-001",
    subject: "The Bot Stores",
    public: "The Bot Stores is being developed as a store, showroom and factory for purpose-built bots focused on different jobs, audiences and situations.",
    prohibited: ["largest AI marketplace", "better than Meta", "Meta killer", "guaranteed results"]
  },
  {
    id: "BTS-FACT-002",
    subject: "The Bot Factory",
    public: "The Bot Factory is the creation layer where a need can be translated into a bot concept, capabilities, boundaries, testing and a potential showroom product.",
    prohibited: ["fully autonomous factory", "creates every bot instantly"]
  },
  {
    id: "BTS-FACT-003",
    subject: "Executive Floor",
    public: "The Executive Floor is the Bot Stores area for BrandBridge, Agent X and custom organizational concepts. Concept demonstrations are not customer partnerships unless explicitly identified as authorized cases.",
    prohibited: ["client of", "partnered with", "deployed for"]
  },
  {
    id: "BTS-FACT-004",
    subject: "Information Director",
    public: "The Official Information Director is an AI media representative intended to provide short authorized answers from approved Bot Stores information. It is not Mel Banks II and must not be attributed to him.",
    prohibited: ["Mel Banks II said", "human spokesperson"]
  }
];

export const headlineFor = (story: MediaStory, style: string, beat: string) => {
  const b = beat && beat !== "General" ? ` for ${beat} audiences` : "";
  if (style === "Feature") return story.feature;
  if (style === "Fun / Cultural") return story.fun;
  if (style === "Broadcast") return story.fun.replace(/\.$/, "");
  if (style === "Newsletter") return `Today's Bot Stores story${b}: ${story.bot}`;
  if (style === "Question") return story.feature.endsWith("?") ? story.feature : `${story.feature}?`;
  return story.straight;
};

export function authorizedAnswer(question: string, topic: string, seconds: number) {
  const q = `${topic} ${question}`.toLowerCase();
  const site = "TheBotStores.com";
  let core =
    "The Bot Stores is being developed as a store, showroom and factory for purpose-built bots, with different bots focused on different jobs rather than asking one assistant to be everything.";

  if (q.includes("factory")) {
    core = "The Bot Factory is the creation layer inside The Bot Stores. It starts with a real need, defines the bot's job and boundaries, tests the concept, and then determines whether it belongs in the showroom.";
  } else if (q.includes("brandbridge") || q.includes("executive") || q.includes("agent x")) {
    core = "The Executive Floor is the organizational side of The Bot Stores, including BrandBridge, Agent X and custom-system concepts. Demonstrations are labeled as concepts unless an actual customer relationship has been authorized for public disclosure.";
  } else if (q.includes("meta") || q.includes("muse") || q.includes("better") || q.includes("beat")) {
    core = "They are different approaches. General-purpose agents aim to handle many needs through one assistant. The Bot Stores is being developed around discovering purpose-built bots for specific jobs and situations.";
  } else if (q.includes("information director") || q.includes("who are you")) {
    core = "I am the Bot Stores Official Information Director, an AI media representative. I provide short authorized responses from approved Bot Stores information and I should not be quoted as Mel Banks II.";
  }

  if (seconds <= 15) return `${core} Explore the concept at ${site}.`;
  if (seconds <= 30) return `${core} The goal is to make the job and the bot easier to understand before asking a user to learn the underlying technology. Reporters can explore the current concept at ${site}.`;
  if (seconds <= 60) return `${core} The system separates the public showroom, the Bot Factory creation layer and an Executive Floor for larger organizational concepts. Each public media statement is intended to come from approved information rather than improvised claims. You can see the current experience at ${site}.`;
  return `${core} The broader idea is that a person or organization may not want one AI assistant to do every job. The Bot Stores organizes specialized bots around recognizable needs, while the Bot Factory handles creation and the Executive Floor handles larger organizational concepts. Public demonstrations, product status and authorized media statements are kept distinct so concept demos are not mistaken for customer relationships or completed capabilities. The current experience can be explored at ${site}.`;
}
