import { NextResponse } from "next/server";
import { headlineFor, stories, truthFacts } from "../../../press/media";
import { recordInteraction } from "../../../press/store";

export async function POST(req: Request){
 const body=await req.json();
 const story=stories.find(s=>s.id===body.story_id) || stories[0];
 const headline=headlineFor(story, body.format || "Straight News", body.beat || "General");
 recordInteraction("HEADLINE", story.bot, body.beat || "General", story.id);
 return NextResponse.json({
   headline,
   subhead:story.summary,
   angle:`This angle is grounded in the approved ${story.bot} media story and tailored to ${body.beat||"general"} coverage.`,
   supporting_fact_ids:truthFacts.slice(0,2).map(f=>f.id)
 });
}