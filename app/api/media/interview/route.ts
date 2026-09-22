import { NextResponse } from "next/server";
import { authorizedAnswer, truthFacts } from "../../../press/media";
import { makeId, mediaState, recordInteraction } from "../../../press/store";

export async function POST(req: Request){
 const body=await req.json();
 const question=String(body.question||"");
 const topic=String(body.topic||"The Bot Stores");
 const seconds=Number(body.target_length||30);
 const receiptId=makeId("BTS-MEDIA");
 const blocked=/(revenue|profit|investor|valuation|lawsuit|private customer|unannounced partnership|acquisition)/i.test(question);

 if(blocked) {
   recordInteraction("INTERVIEW", topic, "HUMAN RESPONSE REQUIRED");
   return NextResponse.json({
     authorization_status:"HUMAN RESPONSE REQUIRED",
     response:"I do not have authorization to speak to that topic. I can provide approved public information or route the question for a human response.",
     truth_fact_ids:[],
     receipt_id:receiptId,
     escalation_required:true
   });
 }

 const response=authorizedAnswer(question,topic,seconds);
 const factIds=truthFacts.map(f=>f.id);
 const receipt={
   id:receiptId,
   topic,
   duration:seconds,
   transcript:response,
   truthFactIds:factIds,
   websiteMentions:(response.match(/TheBotStores\.com/g)||[]).length,
   usage:"EDITORIAL" as const,
   allowedEdits:"TRIM ONLY" as const,
   commercialUse:false as const,
   voiceCloning:false as const,
   syntheticEdit:false as const,
   createdAt:new Date().toISOString()
 };
 mediaState.receipts.push(receipt);
 if(mediaState.receipts.length>500) mediaState.receipts.splice(0,mediaState.receipts.length-500);
 recordInteraction("INTERVIEW", topic, `${seconds}s authorized response`);

 return NextResponse.json({
   authorization_status:"AUTHORIZED MEDIA RESPONSE",
   response,
   truth_fact_ids:factIds,
   website_mentions:receipt.websiteMentions,
   receipt_id:receiptId,
   verify_url:`/press/verify/${receiptId}`,
   escalation_required:false
 });
}