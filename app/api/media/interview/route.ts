import { NextResponse } from "next/server";
import { authorizedAnswer, truthFacts, violatesTruthGuard } from "../../../press/media";
import { makeId, mediaState, recordInteraction } from "../../../press/store";

export async function POST(req: Request){
 const body=await req.json();
 const question=String(body.question||"").trim();
 const topic=String(body.topic||"The Bot Stores").trim();
 const requested=Number(body.target_length||30);
 const seconds=[15,30,60,120].includes(requested)?requested:30;
 const receiptId=makeId("BTS-MEDIA");
 const blocked=/(revenue|profit|investor|valuation|lawsuit|private customer|unannounced partnership|acquisition|security vulnerability|confidential|contract negotiation|founder personal)/i.test(question);

 if(!question) return NextResponse.json({error:"A media question is required."},{status:400});

 if(blocked) {
   recordInteraction("INTERVIEW", topic, "HUMAN RESPONSE REQUIRED", undefined);
   return NextResponse.json({
     authorization_status:"HUMAN RESPONSE REQUIRED",
     response:"I do not have authorization to speak to that topic. I can provide approved public information or route the question for a human response.",
     truth_fact_ids:[],
     receipt_id:receiptId,
     escalation_required:true
   });
 }

 const response=authorizedAnswer(question,topic,seconds);
 const violation=violatesTruthGuard(response);
 if(violation){
   recordInteraction("INTERVIEW", topic, "TRUTH GUARD BLOCK", undefined);
   return NextResponse.json({
     authorization_status:"HUMAN RESPONSE REQUIRED",
     response:"This answer requires human review before media use.",
     truth_fact_ids:[],
     receipt_id:receiptId,
     escalation_required:true
   });
 }

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
 const matchedStory=(await import("../../../press/media")).stories.find(s=>s.bot.toLowerCase()===topic.toLowerCase());
 recordInteraction("INTERVIEW", topic, `${seconds}s authorized response`, matchedStory?.id);

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