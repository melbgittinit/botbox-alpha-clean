import { NextResponse } from "next/server";
import { stories } from "../../../press/media";
import { recordInteraction } from "../../../press/store";

function score(text: string, story: (typeof stories)[number]) {
  const hay = (story.title + " " + story.summary + " " + story.why + " " + story.bot + " " + story.beat.join(" ")).toLowerCase();
  const terms = text.toLowerCase().split(/[^a-z0-9]+/).filter(x => x.length > 2);
  return terms.reduce((n, t) => n + (hay.includes(t) ? 2 : 0), 0);
}

export async function POST(req: Request) {
  const body = await req.json();
  const coverage = String(body.coverage || "").trim();
  if (!coverage) return NextResponse.json({ error: "Tell us what you are covering." }, { status: 400 });

  const matches = stories
    .map(story => ({ story, score: score(coverage, story) }))
    .sort((a,b) => b.score - a.score)
    .slice(0,3)
    .map(({story, score}) => ({
      id: story.id,
      title: story.title,
      bot: story.bot,
      why: story.why,
      suggested_headline: story.feature,
      fit_score: score
    }));

  recordInteraction("PITCH", coverage.slice(0,80), matches.map(x=>x.bot).join(", "));
  return NextResponse.json({ coverage, matches });
}
