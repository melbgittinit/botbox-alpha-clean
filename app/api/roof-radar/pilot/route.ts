import { NextResponse } from "next/server";

const SUPABASE_URL="https://lcuvhizjhccvzprpuoij.supabase.co";
const SUPABASE_KEY="sb_publishable_oF6Les3a6qYmgsBtED5UPg_-NCTjck3";

function val(v:FormDataEntryValue|null){ return typeof v==="string" ? v.trim() : ""; }

export async function POST(req:Request){
  const f=await req.formData();
  if(val(f.get("website"))) return NextResponse.redirect(new URL("/bots/roof-weather-radar-door-knocker?submitted=1",req.url),303);

  const payload={
    company:val(f.get("company")),
    contact:val(f.get("contact")),
    email:val(f.get("email")),
    phone:val(f.get("phone"))||null,
    territory:val(f.get("territory")),
    reps:val(f.get("reps"))||null,
    crm:val(f.get("crm"))||null,
    outreach:val(f.get("outreach"))||null,
    weather:val(f.get("weather"))||null,
    notes:val(f.get("notes"))||null,
    source:"roof-weather-radar-door-knocker"
  };

  if(!payload.company || !payload.contact || !payload.email.includes("@") || !payload.territory){
    return NextResponse.redirect(new URL("/bots/roof-weather-radar-door-knocker?error=required",req.url),303);
  }

  const r=await fetch(SUPABASE_URL+"/rest/v1/roof_radar_pilot_requests",{
    method:"POST",
    headers:{
      "apikey":SUPABASE_KEY,
      "Authorization":"Bearer "+SUPABASE_KEY,
      "Content-Type":"application/json",
      "Prefer":"return=minimal"
    },
    body:JSON.stringify(payload)
  });

  if(!r.ok){
    console.error("roof-radar-pilot-failed",r.status,await r.text());
    return NextResponse.redirect(new URL("/bots/roof-weather-radar-door-knocker?error=delivery",req.url),303);
  }

  console.info("roof-radar-pilot-submitted",{company:payload.company,territory:payload.territory,reps:payload.reps,crm:payload.crm});
  return NextResponse.redirect(new URL("/bots/roof-weather-radar-door-knocker?submitted=1",req.url),303);
}
