import { NextResponse } from "next/server";
import { mediaState } from "../../../press/store";
import { stories } from "../../../press/media";

function pct(n:number,d:number){ return d ? Math.round((n/d)*1000)/10 : 0; }

export async function GET() {
  const counts = mediaState.interactions.reduce<Record<string, number>>((acc, x) => {
    acc[x.type] = (acc[x.type] || 0) + 1;
    return acc;
  }, {});

  const topics = mediaState.interactions.reduce<Record<string, number>>((acc, x) => {
    acc[x.topic] = (acc[x.topic] || 0) + 1;
    return acc;
  }, {});

  const hotTopics = Object.entries(topics)
    .sort((a,b) => b[1] - a[1])
    .slice(0,8)
    .map(([topic,count]) => ({ topic, count }));

  const verifiedCoverage=mediaState.coverage.filter(c=>c.verification==="VERIFIED");
  const coveredStoryIds=new Set(verifiedCoverage.map(c=>c.storyId));
  const publishedDings=stories.length;
  const coveredDings=stories.filter(s=>coveredStoryIds.has(s.id)).length;
  const dingToCoverageRate=pct(coveredDings,publishedDings);
  const coveragePerDing=publishedDings ? Math.round((verifiedCoverage.length/publishedDings)*100)/100 : 0;

  const dingPerformance=stories.map(story=>{
    const interactions=mediaState.interactions.filter(x=>x.storyId===story.id);
    const coverage=verifiedCoverage.filter(x=>x.storyId===story.id);
    const uniqueOutlets=new Set(coverage.map(x=>x.outlet.toLowerCase())).size;
    return {
      story_id:story.id,
      ding:story.ding,
      bot:story.bot,
      title:story.title,
      state:story.state,
      matched:interactions.filter(x=>x.type==="MATCH").length,
      outreach:interactions.filter(x=>x.type==="OUTREACH").length,
      headline_bells:interactions.filter(x=>x.type==="HEADLINE").length,
      interviews:interactions.filter(x=>x.type==="INTERVIEW").length,
      press_visits:interactions.filter(x=>x.type==="PRESS_VISIT").length,
      founder_requests:interactions.filter(x=>x.type==="FOUNDER_REQUEST").length,
      verified_coverage:coverage.length,
      unique_outlets:uniqueOutlets,
      converted_to_coverage:coverage.length>0
    };
  });

  return NextResponse.json({
    alpha_storage: "process-memory",
    swarm_performance: {
      metric: "DING-TO-COVERAGE RATE™",
      formula: "distinct Fresh Dings with at least one verified media placement ÷ total published Fresh Dings",
      published_dings: publishedDings,
      covered_dings: coveredDings,
      verified_coverage_pieces: verifiedCoverage.length,
      ding_to_coverage_rate_pct: dingToCoverageRate,
      coverage_pieces_per_ding: coveragePerDing
    },
    totals: {
      pass_requests: mediaState.passes.length,
      receipts: mediaState.receipts.length,
      interactions: mediaState.interactions.length,
      headlines: counts.HEADLINE || 0,
      interviews: counts.INTERVIEW || 0,
      reverse_pitches: counts.PITCH || 0,
      story_matches: counts.MATCH || 0,
      outreach: counts.OUTREACH || 0,
      verified_coverage: verifiedCoverage.length
    },
    ding_performance: dingPerformance,
    hot_topics: hotTopics
  });
}
