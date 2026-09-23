export type PriorityBot = {
  id:string;
  name:string;
  eyebrow:string;
  promise:string;
  summary:string;
  audience:string[];
  outputs:string[];
  status:string;
  videoMode:"hero-loop"|"explainer"|"archive-teaser"|"ui-demo";
  videoBrief:string;
  access:string;
  autonomy:string;
  approval:string;
  spending:string;
  limitations:string[];
  mediaAngle:string;
};

export const priorityBots:PriorityBot[] = [
  {
    id:"elevate",
    name:"Elevate Bot™",
    eyebrow:"FLAGSHIP BOT",
    promise:"Find the next move that could actually matter.",
    summary:"A growth and opportunity-ranking specialist designed to help a person, creator, business or organization identify practical improvements, rank them by likely impact, and turn the strongest ones into a next move.",
    audience:["Small businesses","Creators","Organizations","People trying to grow or improve something"],
    outputs:["Ranked improvement opportunities","Why each move matters","What to do first","What requires more research","What not to spend time on yet"],
    status:"ALPHA / PRIORITY BUILD",
    videoMode:"explainer",
    videoBrief:"20–30 second premium explainer: problem overload → Elevate Bot scans the situation → three ranked moves appear → one becomes the clear next action. Aspirational, useful, not motivational fluff.",
    access:"Uses information intentionally provided by the user and approved public sources when live research is connected.",
    autonomy:"Can analyze, organize and rank recommendations. It does not publish, message, buy or commit on the user's behalf.",
    approval:"Human approval before every consequential external action.",
    spending:"None.",
    limitations:["Recommendations are not guaranteed outcomes.","Financial, legal and contractual decisions require independent review."],
    mediaAngle:"A specialized AI worker that does not try to run your whole life—it helps you decide what deserves your attention next."
  },
  {
    id:"ufo",
    name:"UFO BOT™",
    eyebrow:"SPECIALTY / EXPERIENCE BOT",
    promise:"Track the unknown without pretending the unknown is proven.",
    summary:"A structured UAP/UFO research and archive experience that separates reported claims, documented evidence, disputed material, unresolved details and verified facts.",
    audience:["Curious consumers","UAP/UFO enthusiasts","Researchers","Story and archive users"],
    outputs:["Structured case files","Reported vs. verified labels","Timeline summaries","Source grouping","Unresolved-question lists"],
    status:"ALPHA / VIDEO-LED EXPERIENCE",
    videoMode:"archive-teaser",
    videoBrief:"Keep the existing strong cinematic UFO video as the lead asset. Add only a short interface reveal at the end so spectacle clearly resolves into a usable archive/research product.",
    access:"Uses material supplied by the user plus approved public/report archives when connected.",
    autonomy:"Can organize claims and evidence status. It does not convert an unverified report into a fact.",
    approval:"Human review before public sharing or publication.",
    spending:"None.",
    limitations:["Reported does not mean verified.","Disputed and unresolved claims remain visibly labeled."],
    mediaAngle:"A deliberately unusual bot that demonstrates how The Bot Stores can merchandise curiosity without abandoning evidence boundaries."
  },
  {
    id:"government-contract-radar",
    name:"Government Contract Radar Bot™",
    eyebrow:"BUSINESS OPPORTUNITY BOT",
    promise:"Find public opportunities worth investigating before the deadline finds you.",
    summary:"A public-opportunity discovery and preparation assistant for local, state and federal contracting. It helps organize fit, deadlines, required materials and practical next steps without guaranteeing eligibility or awards.",
    audience:["Small businesses","Contractors","Specialty vendors","Entrepreneurs exploring public-sector work"],
    outputs:["Opportunity shortlist","Deadline countdown","Fit notes","Required-material checklist","Worth-investigating flags"],
    status:"IN DEVELOPMENT",
    videoMode:"ui-demo",
    videoBrief:"15–25 second UI-led demo: radar scan → opportunities appear → easiest / strongest-fit / investigate tabs → deadline clock → human approval before submission.",
    access:"Uses public government-opportunity sources and user-supplied business criteria when connected.",
    autonomy:"Can discover, compare and prepare. It does not submit binding material automatically.",
    approval:"Required before any submission, representation, certification or external communication.",
    spending:"None.",
    limitations:["No guarantee of eligibility or award.","Public opportunity data and deadlines must be verified at the original source."],
    mediaAngle:"A clear example of a narrow-purpose business agent whose job, data sources and approval boundary are easy to understand."
  },
  {
    id:"golden-goose",
    name:"Golden Goose Bot™",
    eyebrow:"BUSINESS IDEA BOT",
    promise:"Lay better business ideas. Then make them earn the right to live.",
    summary:"A business-idea generator and evaluator that produces ideas, pressure-tests them and helps the owner decide whether to love, start, incubate, make real or pass.",
    audience:["Entrepreneurs","Would-be founders","Side-hustle builders","Creators looking for scalable businesses"],
    outputs:["Business ideas","Why-now rationale","Margin/scalability questions","Risk flags","Owner decision path"],
    status:"CONCEPT / PRE-LAUNCH",
    videoMode:"hero-loop",
    videoBrief:"10–15 second premium loop: a luminous 'business egg' arrives → cracks into a structured opportunity card → Love / Start / Make Real / Incubate / Pass controls appear.",
    access:"Uses the owner's stated goals, resources and approved research inputs when connected.",
    autonomy:"Can ideate and evaluate. It does not form companies, spend money or make commitments.",
    approval:"Required before any real-world launch action.",
    spending:"None.",
    limitations:["A good idea is not a guaranteed business.","Market, legal, financial and operational assumptions must be validated."],
    mediaAngle:"The memorable visual story inside the store: a Golden Goose that lays business ideas, but makes each idea survive a reality check."
  },
  {
    id:"book-bomb",
    name:"Book Bomb Bot™",
    eyebrow:"PUBLISHING / CREATOR BOT",
    promise:"Turn one book into a concentrated launch-and-improvement mission.",
    summary:"A book-focused agent that starts with title/ISBN, evaluates the current package, develops promotional actions and prepares practical publishing/retail improvements around the book.",
    audience:["Authors","Independent publishers","Small presses","Creator businesses"],
    outputs:["Launch actions","Cover/back-cover improvement brief","Retail/Amazon backend checklist","Promotion plan","Dream-scenario launch framing"],
    status:"PRE-LAUNCH",
    videoMode:"ui-demo",
    videoBrief:"20-second explainer: book/ISBN enters → Bomb Size selected → cover/back cover, retail metadata and promotion tracks light up → action pack delivered.",
    access:"Uses book metadata and material intentionally supplied by the user plus approved public retail information when connected.",
    autonomy:"Can analyze and prepare assets/plans. It does not publish changes or spend on ads without approval.",
    approval:"Required before metadata changes, uploads, outreach or paid promotion.",
    spending:"None by default.",
    limitations:["Does not guarantee rankings, sales or reviews.","Retail platform policies and metadata rules still apply."],
    mediaAngle:"A highly legible creator-economy example of why specialized bots can be easier to understand than one general AI assistant."
  }
];

export function getPriorityBot(id:string){ return priorityBots.find(b=>b.id===id); }
