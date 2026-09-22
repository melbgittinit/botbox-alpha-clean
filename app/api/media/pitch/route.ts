import { NextResponse } from "next/server";
import { stories } from "../../../press/media";
import { recordInteraction } from "../../../press/store";

const synonyms: Record<string,string[]> = {
  business:["small business","entrepreneur","entrepreneurship","startup","company","owner","commerce"],
  government:["government","contract","procurement","public sector","sba"],
  enterprise:["enterprise","brand","organization","corporate","company"],
  culture:["culture","weird","fun","viral","consumer"],
  ai:["ai","agent","agents","bot","bots","automation"]
};

function normalizedTerms(text:string){
  const lower=text.toLowerCase();
  const terms=new Set(lower.split(/[^a-z0-9]+/).filter(x=>x.length>2));
  for(const [key,values] of Object.entries(synonyms)){
    if(values.some(v=>lower.includes(v))) terms.add(key);
  }
  return [...terms];
}

function score(text: string, story: (typeof stories)[number]) {
  const hay = (story.title+" "+story.summary+" "+story.why+" "+story.bot+" "+story.beat.join(" ")+" "+story.newsTrigger).toLowerCase();
  const terms=normalizedTerms(text);
  let points=0;
  for(const t of terms){
    if(hay.includes(t)) points += t.length>8 ? 4 : 2;
  }
  if(story.beat.some(b=>text.toLowerCase().includes(b.toLowerCase()))) points+=5;
  return points;
}

export async function POST(req: Request) {
  const body = await req.json();
  const coverage = String(body.coverage || "").trim();
  if (!coverage) return NextResponse.json({ error: "Tell us what you are covering." }, { status: 400 });

  const ranked = stories.map(story=>({story,score:score(coverage,story)})).sort((a,b)=>b.score-a.score);
  const strong = ranked.filter(x=>x.score>=4).slice(0,3);
  const matches = strong.map(({story,score})=>({
    id:story.id,
    title:story.title,
    bot:story.bot,
    why:story.why,
    suggested_headline:story.feature,
    fit_score:score
  }));

  recordInteraction("PITCH", coverage.slice(0,80), matches.length ? matches.map(x=>x.bot).join(", ") : "NO STRONG FIT");
  return NextResponse.json({
    coverage,
    strong_fit: matches.length>0,
    message: matches.length ? "Relevant Bot Stores stories found." : "No strong Bot Stores story is currently approved for that angle. We would rather say that than force a weak pitch.",
    matches
  });
}
