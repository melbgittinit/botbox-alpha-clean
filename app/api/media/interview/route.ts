import { NextResponse } from "next/server";
import { authorizedAnswer, truthFacts } from "../../../press/media";
function receipt(){return "BTS-MEDIA-"+Date.now().toString(36).toUpperCase();}
export async function POST(req: Request){
 const body=await req.json();
 const question=String(body.question||"");
 const topic=String(body.topic||"The Bot Stores");
 const seconds=Number(body.target_length||30);
 const blocked=/(revenue|profit|investor|valuation|lawsuit|private customer|unannounced partnership|acquisition)/i.test(question);
 if(blocked) return NextResponse.json({authorization_status:"HUMAN RESPONSE REQUIRED",response:"I do not have authorization to speak to that topic. I can provide approved public information or route the question for a human response.",truth_fact_ids:[],receipt_id:receipt(),escalation_required:true});
 const response=authorizedAnswer(question,topic,seconds);
 return NextResponse.json({authorization_status:"AUTHORIZED MEDIA RESPONSE",response,truth_fact_ids:truthFacts.map(f=>f.id),website_mentions:(response.match(/TheBotStores\.com/g)||[]).length,receipt_id:receipt(),escalation_required:false});
}