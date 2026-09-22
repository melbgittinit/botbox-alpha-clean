import { NextResponse } from "next/server";
import { makeId, mediaState, recordInteraction } from "../../../press/store";

export async function POST(req: Request) {
  const body = await req.json();
  const name = String(body.name || "").trim();
  const outlet = String(body.outlet || "").trim();
  const role = String(body.role || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const beat = String(body.beat || "General").trim();

  if (!name || !outlet || !role || !email || !email.includes("@")) {
    return NextResponse.json({ error: "Name, outlet, role and a valid work email are required." }, { status: 400 });
  }

  const existing=mediaState.passes.find(p=>p.email===email && p.status==="PENDING REVIEW");
  if(existing){
    return NextResponse.json({
      pass_id:existing.id,
      status:existing.status,
      message:"A Media Pass request for this email is already pending review."
    });
  }

  const pass = {
    id: makeId("BTS-PASS"),
    name,
    outlet,
    role,
    email,
    beat,
    status: "PENDING REVIEW" as const,
    createdAt: new Date().toISOString(),
  };
  mediaState.passes.push(pass);
  recordInteraction("PASS", beat, outlet);

  return NextResponse.json({
    pass_id: pass.id,
    status: pass.status,
    message: "Your Media Pass request is recorded for review. This alpha does not auto-verify press credentials."
  });
}