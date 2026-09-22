import { NextResponse } from "next/server";
import { mediaState } from "../../../press/store";

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

  return NextResponse.json({
    alpha_storage: "process-memory",
    totals: {
      pass_requests: mediaState.passes.length,
      receipts: mediaState.receipts.length,
      interactions: mediaState.interactions.length,
      headlines: counts.HEADLINE || 0,
      interviews: counts.INTERVIEW || 0,
      reverse_pitches: counts.PITCH || 0
    },
    hot_topics: hotTopics
  });
}
