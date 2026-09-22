import { NextResponse } from "next/server";
import { stories } from "../../../../press/media";
import { makeId, mediaState } from "../../../../press/store";

export async function POST(req:Request){
 const key=process.env.MEDIA_ADMIN_KEY;
 if(!key) return NextResponse.json({error:"MEDIA_ADMIN_KEY is not configured; coverage writes are disabled."},{status:503});
 if(req.headers.get("x-media-admin-key")!==key) return NextResponse.json({error:"Unauthorized"},{status:401});

 const body=await req.json();
 const storyId=String(body.story_id||"");
 const outlet=String(body.outlet||"").trim();
 const url=String(body.url||"").trim();
 const title=String(body.title||"").trim();
 const publishedAt=String(body.published_at||"").trim();
 const source=body.source==="COVERAGE_BOT"?"COVERAGE_BOT":"HUMAN";

 if(!stories.some(s=>s.id===storyId)) return NextResponse.json({error:"Unknown Ding/story."},{status:400});
 if(!outlet||!url||!/^https?:\/\//i.test(url)||!publishedAt) return NextResponse.json({error:"story_id, outlet, valid URL and published_at are required."},{status:400});
 const duplicate=mediaState.coverage.find(c=>c.storyId===storyId&&c.url===url);
 if(duplicate) return NextResponse.json({coverage:duplicate,deduplicated:true});

 const coverage={
   id:makeId("COV"),
   storyId,
   outlet,
   title:title||undefined,
   url,
   publishedAt,
   verifiedAt:new Date().toISOString(),
   verification:"VERIFIED" as const,
   source
 };
 mediaState.coverage.push(coverage);
 return NextResponse.json({coverage,deduplicated:false});
}
