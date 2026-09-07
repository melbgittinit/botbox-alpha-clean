import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRx = /^[+()\-\s0-9.]{7,24}$/;

const trim = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

function persistenceAllowed() {
  return Boolean(process.env.DATABASE_URL) && process.env.BOT_FACTORY_DB_IDENTITY === "bot-factory-revenue";
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const email = trim(body.email, 180).toLowerCase();
  const phone = trim(body.phone, 32);
  const sessionId = trim(body.sessionId, 80);
  const visitorId = trim(body.visitorId, 80);
  const purpose = trim(body.purpose, 60) || "SAVE_BUILD";
  const preferredBot = trim(body.preferredBot, 80) || undefined;
  const emailMarketing = body.emailMarketing === true;
  const smsOptIn = body.smsOptIn === true;
  const voiceCallback = body.voiceCallback === true;

  if (!email || !emailRx.test(email)) {
    return NextResponse.json({ ok: false, error: "valid_email_required" }, { status: 400 });
  }
  if (phone && !phoneRx.test(phone)) {
    return NextResponse.json({ ok: false, error: "invalid_phone" }, { status: 400 });
  }
  if ((smsOptIn || voiceCallback) && !phone) {
    return NextResponse.json({ ok: false, error: "phone_required_for_selected_channel" }, { status: 400 });
  }

  if (!persistenceAllowed()) {
    return NextResponse.json(
      {
        ok: true,
        persisted: false,
        mode: "STAGING_IDENTITY_BRIDGE",
        persistenceBlocked: Boolean(process.env.DATABASE_URL),
        message: "Identity/consent contract validated; dedicated Factory CRM persistence is not enabled yet.",
      },
      { status: 202, headers: { "Cache-Control": "no-store" } },
    );
  }

  const existing = await prisma.prospect.findFirst({
    where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] },
  });

  const prospect = existing
    ? await prisma.prospect.update({
        where: { id: existing.id },
        data: {
          email,
          ...(phone ? { phone } : {}),
          ...(preferredBot ? { preferredBot } : {}),
          stage: existing.stage === "NEW" ? "ENGAGED" : existing.stage,
          lastTouchAt: new Date(),
        },
      })
    : await prisma.prospect.create({
        data: {
          email,
          ...(phone ? { phone } : {}),
          ...(preferredBot ? { preferredBot } : {}),
          source: "BOT_FACTORY_IDENTITY_BRIDGE",
          stage: "ENGAGED",
          lastTouchAt: new Date(),
        },
      });

  await prisma.consentRecord.create({
    data: {
      prospectId: prospect.id,
      channel: "EMAIL",
      status: "NOT_REQUIRED",
      scope: `${purpose}_DELIVERY_REQUESTED`,
      source: "BOT_FACTORY_IDENTITY_BRIDGE",
      evidenceRef: sessionId || undefined,
    },
  });

  if (emailMarketing) {
    await prisma.consentRecord.create({
      data: {
        prospectId: prospect.id,
        channel: "EMAIL",
        status: "OPTED_IN",
        scope: "BOT_FACTORY_MARKETING",
        source: "BOT_FACTORY_IDENTITY_BRIDGE",
        evidenceRef: sessionId || undefined,
      },
    });
  }

  if (smsOptIn) {
    await prisma.consentRecord.create({
      data: {
        prospectId: prospect.id,
        channel: "SMS",
        status: "OPTED_IN",
        scope: "BOT_FACTORY_BUILD_AND_RELATED_BOTS",
        source: "BOT_FACTORY_IDENTITY_BRIDGE",
        evidenceRef: sessionId || undefined,
      },
    });
  }

  if (voiceCallback) {
    await prisma.consentRecord.create({
      data: {
        prospectId: prospect.id,
        channel: "VOICE",
        status: "OPTED_IN",
        scope: "REQUESTED_SALES_CALLBACK",
        source: "BOT_FACTORY_IDENTITY_BRIDGE",
        evidenceRef: sessionId || undefined,
      },
    });
  }

  let linkedAnonymousEvents = 0;
  if (sessionId) {
    const linked = await prisma.revenueEvent.updateMany({
      where: { sessionId, prospectId: null },
      data: { prospectId: prospect.id },
    });
    linkedAnonymousEvents = linked.count;
  }

  await prisma.revenueEvent.create({
    data: {
      prospectId: prospect.id,
      sessionId: sessionId || undefined,
      type: "LEAD_CAPTURED",
      botId: preferredBot,
      source: "bot-factory-alpha",
      metadata: {
        visitorId: visitorId || undefined,
        purpose,
        emailMarketing,
        smsOptIn,
        voiceCallback,
        linkedAnonymousEvents,
      },
    },
  });

  return NextResponse.json(
    {
      ok: true,
      persisted: true,
      prospectId: prospect.id,
      linkedAnonymousEvents,
      mode: "CRM_CONNECTED",
    },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
