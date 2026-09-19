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

  const attributions = await prisma.pgpEarnAttribution.findMany({
    where: { memberKey },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ attributions }, { headers: cors });
}

export async function POST(request: Request) {
  const body = await request.json();

  const memberKey = String(body.memberKey || "alpha-tanya");
  const keyCode = String(body.keyCode || "");
  if (!keyCode) {
    return NextResponse.json({ error: "keyCode required" }, { status: 400, headers: cors });
  }

  const key = await prisma.pgpPalaceKey.findUnique({ where: { code: keyCode } });
  if (!key) {
    return NextResponse.json({ error: "Palace Key not found" }, { status: 404, headers: cors });
  }

  const conversionRef = body.conversionRef ? String(body.conversionRef) : null;

  const attribution = await prisma.pgpEarnAttribution.create({
    data: {
      memberKey,
      keyCode,
      opportunityId: key.opportunityId,
      productName: body.productName ? String(body.productName) : key.productName,
      conversionRef,
      provider: "EARN_MODE",
      providerStatus: "PENDING_HANDOFF",
      grossAmountCents: Number.isFinite(body.grossAmountCents) ? Number(body.grossAmountCents) : null,
      eligibleAmountCents: Number.isFinite(body.eligibleAmountCents) ? Number(body.eligibleAmountCents) : null,
      commissionAmountCents: null,
      payload: {
        source: "pgp-alpha",
        attributionKey: key.attributionKey,
        note: "Awaiting final Earn Mode / UpPromote provider mapping.",
      },
    },
  });

  await prisma.pgpKeyEvent.create({
    data: {
      keyCode,
      eventType: "conversion_handoff_created",
      payload: {
        attributionId: attribution.id,
        providerStatus: attribution.providerStatus,
      },
    },
  });

  if (key.opportunityId) {
    await prisma.pgpOpportunity.update({
      where: { id: key.opportunityId },
      data: {
        status: "CONVERSION_PENDING",
        attentionState: "PGP_IS_WATCHING",
        events: {
          create: {
            type: "conversion_handoff_created",
            payload: { attributionId: attribution.id, keyCode },
          },
        },
      },
    });
  }

  return NextResponse.json({ attribution }, { status: 201, headers: cors });
}
