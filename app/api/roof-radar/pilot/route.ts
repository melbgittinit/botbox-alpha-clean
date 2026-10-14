import { NextResponse } from "next/server";

function text(v: FormDataEntryValue | null){ return typeof v === "string" ? v.trim() : ""; }

export async function POST(req: Request){
  const form = await req.formData();
  if(text(form.get("website"))) {
    return NextResponse.redirect(new URL("/bots/roof-weather-radar-door-knocker?submitted=1", req.url), 303);
  }

  const company=text(form.get("company"));
  const contact=text(form.get("contact"));
  const email=text(form.get("email"));
  const phone=text(form.get("phone"));
  const territory=text(form.get("territory"));
  const reps=text(form.get("reps"));
  const crm=text(form.get("crm"));
  const outreach=text(form.get("outreach"));
  const weather=text(form.get("weather"));
  const notes=text(form.get("notes"));

  if(!company || !contact || !email || !email.includes("@") || !territory){
    return NextResponse.redirect(new URL("/bots/roof-weather-radar-door-knocker?error=required", req.url), 303);
  }

  const apiKey=process.env.RESEND_API_KEY;
  if(!apiKey){
    return NextResponse.redirect(new URL("/bots/roof-weather-radar-door-knocker?error=delivery", req.url), 303);
  }

  const subject=`Roof Weather Radar Pilot Request — ${company}`;
  const body = [
    "NEW ROOF WEATHER RADAR DOOR KNOCKER PILOT REQUEST",
    "",
    `Company: ${company}`,
    `Contact: ${contact}`,
    `Email: ${email}`,
    `Phone: ${phone || "Not provided"}`,
    `Service territory / ZIPs: ${territory}`,
    `Sales reps: ${reps || "Not provided"}`,
    `CRM: ${crm || "Not provided"}`,
    `Preferred outreach channels: ${outreach || "Not provided"}`,
    `Current weather/storm intelligence: ${weather || "Not provided"}`,
    `Notes: ${notes || "None"}`,
    "",
    "Source: Roof Weather Radar Door Knocker product page",
    `Submitted: ${new Date().toISOString()}`
  ].join("\n");

  const r=await fetch("https://api.resend.com/emails",{
    method:"POST",
    headers:{
      "Authorization":`Bearer ${apiKey}`,
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      from:"Roof Radar Pilot <pilot@resetmehub.com>",
      to:["hello@urbanspirit.biz"],
      reply_to:email,
      subject,
      text:body,
      tags:[
        {name:"product",value:"roof-weather-radar"},
        {name:"type",value:"pilot-request"}
      ]
    })
  });

  if(!r.ok){
    console.error("roof-radar-pilot-email-failed",r.status,await r.text());
    return NextResponse.redirect(new URL("/bots/roof-weather-radar-door-knocker?error=delivery", req.url), 303);
  }

  console.info("roof-radar-pilot-submitted",{company,territory,reps,crm});
  return NextResponse.redirect(new URL("/bots/roof-weather-radar-door-knocker?submitted=1", req.url), 303);
}
