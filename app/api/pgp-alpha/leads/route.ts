import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const displayName = body.displayName ? String(body.displayName).trim() : null;
  const source = String(body.source || "pgp");

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "valid email required" }, { status: 400, headers: cors });
  }

  const lead = await prisma.pgpLead.upsert({
    where: { email_source: { email, source } },
    create: {
      email,
      displayName,
      source,
      status: "EARLY_ACCESS",
      guideId: body.guideId ? String(body.guideId) : null,
      naturalPower: body.naturalPower ? String(body.naturalPower) : null,
      supportingPower: body.supportingPower ? String(body.supportingPower) : null,
      expansionPower: body.expansionPower ? String(body.expansionPower) : null,
      payload: body.payload || {},
    },
    update: {
      ...(displayName ? { displayName } : {}),
      ...(body.guideId ? { guideId: String(body.guideId) } : {}),
      ...(body.naturalPower ? { naturalPower: String(body.naturalPower) } : {}),
      ...(body.supportingPower ? { supportingPower: String(body.supportingPower) } : {}),
      ...(body.expansionPower ? { expansionPower: String(body.expansionPower) } : {}),
      payload: body.payload || {},
    },
  });

  return NextResponse.json({ lead: { id: lead.id, status: lead.status } }, { status: 201, headers: cors });
}
