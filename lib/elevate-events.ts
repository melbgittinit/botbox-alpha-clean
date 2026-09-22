import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type ElevateEventInput = {
  userId?: string | null;
  sessionId?: string | null;
  cycleKey?: string | null;
  eventType: string;
  surface?: string | null;
  offer?: string | null;
  amountCents?: number | null;
  success?: boolean | null;
  channel?: string | null;
  source?: string | null;
  payload?: Record<string, unknown> | null;
};

function clean(value: unknown, max = 120) {
  const text = String(value || "").trim();
  return text ? text.slice(0, max) : null;
}

export async function recordElevateEvent(input: ElevateEventInput) {
  try {
    const event = await prisma.elevateEvent.create({
      data: {
        userId: clean(input.userId, 160),
        sessionId: clean(input.sessionId, 160),
        cycleKey: clean(input.cycleKey, 80),
        eventType: clean(input.eventType, 80) || "unknown",
        surface: clean(input.surface, 40),
        offer: clean(input.offer, 40),
        amountCents: Number.isFinite(input.amountCents) ? Number(input.amountCents) : null,
        success: typeof input.success === "boolean" ? input.success : null,
        channel: clean(input.channel, 80),
        source: clean(input.source, 160),
        payload: input.payload ? (input.payload as Prisma.InputJsonValue) : undefined,
      },
    });

    console.log("ELEVATE_EVENT " + JSON.stringify({
      id: event.id,
      eventType: event.eventType,
      userId: event.userId,
      sessionId: event.sessionId,
      cycleKey: event.cycleKey,
      surface: event.surface,
      offer: event.offer,
      amountCents: event.amountCents,
      success: event.success,
      channel: event.channel,
      source: event.source,
      createdAt: event.createdAt.toISOString(),
    }));

    return event;
  } catch (error) {
    console.warn("ELEVATE_EVENT_WRITE_FAILED", {
      eventType: input.eventType,
      offer: input.offer || null,
      error: error instanceof Error ? error.message : "unknown",
    });
    return null;
  }
}
