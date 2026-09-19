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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const memberKey = searchParams.get("memberKey") || "alpha-tanya";

  const opportunities = await prisma.pgpOpportunity.findMany({
    where: { memberKey },
    include: { events: { orderBy: { createdAt: "asc" } } },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ opportunities }, { headers: cors });
}

export async function POST(request: Request) {
  const body = await request.json();
  const memberKey = String(body.memberKey || "alpha-tanya");
  const environment = String(body.environment || "Unknown");
  const observation = String(body.observation || "");
  const productName = body.productName ? String(body.productName) : null;
  const fitState = body.fitState ? String(body.fitState) : null;

  const created = await prisma.pgpOpportunity.create({
    data: {
      memberKey,
      environment,
      observation,
      structuredProblem: body.structuredProblem ? String(body.structuredProblem) : null,
      productName,
      fitState,
      status: String(body.status || "SPOTTED"),
      attentionState: String(body.attentionState || "NOTHING_TO_DO"),
      palaceKeyCode: body.palaceKeyCode ? String(body.palaceKeyCode) : null,
      events: {
        create: {
          type: "created",
          payload: {
            source: "pretty-girl-vision-alpha",
            fitState,
            productName,
          },
        },
      },
    },
    include: { events: true },
  });

  return NextResponse.json({ opportunity: created }, { status: 201, headers: cors });
}


export async function PATCH(request: Request) {
  const body = await request.json();
  const id = body.id ? String(body.id) : null;

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400, headers: cors });
  }

  const status = body.status ? String(body.status) : undefined;
  const attentionState = body.attentionState ? String(body.attentionState) : undefined;
  const palaceKeyCode = body.palaceKeyCode ? String(body.palaceKeyCode) : undefined;
  const eventType = body.eventType ? String(body.eventType) : "updated";

  const opportunity = await prisma.pgpOpportunity.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(attentionState ? { attentionState } : {}),
      ...(palaceKeyCode ? { palaceKeyCode } : {}),
      events: {
        create: {
          type: eventType,
          payload: body.payload || {},
        },
      },
    },
    include: { events: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json({ opportunity }, { headers: cors });
}
