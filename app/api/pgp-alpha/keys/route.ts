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
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "code required" }, { status: 400, headers: cors });
  }

  const key = await prisma.pgpPalaceKey.findUnique({ where: { code } });
  if (!key || !key.active) {
    return NextResponse.json({ error: "key not found" }, { status: 404, headers: cors });
  }

  await prisma.pgpKeyEvent.create({
    data: {
      keyCode: code,
      eventType: "opened",
      sessionId: crypto.randomUUID(),
    },
  });

  return NextResponse.json({ key }, { headers: cors });
}

export async function POST(request: Request) {
  const body = await request.json();
  const memberKey = String(body.memberKey || "alpha-tanya");
  const productName = body.productName ? String(body.productName) : null;
  const destination = String(body.destination || "/pgp");
  const keyType = String(body.keyType || "QUICK");
  const contextType = body.contextType ? String(body.contextType) : null;
  const code = body.code ? String(body.code) : "pgp-" + crypto.randomUUID().slice(0, 8);
  const attributionKey = body.attributionKey
    ? String(body.attributionKey)
    : memberKey + "-" + crypto.randomUUID().slice(0, 10);

  const key = await prisma.pgpPalaceKey.create({
    data: {
      code,
      memberKey,
      productName,
      destination,
      keyType,
      contextType,
      attributionKey,
    },
  });

  await prisma.pgpKeyEvent.create({
    data: {
      keyCode: code,
      eventType: "created",
      payload: { memberKey, productName, contextType, destination },
    },
  });

  return NextResponse.json({ key }, { status: 201, headers: cors });
}
