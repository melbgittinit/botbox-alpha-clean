import {
  EventStepPhase,
  EventStepStatus,
} from "@prisma/client";
import prisma from "./prisma";

const STATUS_PRIORITY: Record<EventStepStatus, number> = {
  ACTIVE: 0,
  READY: 1,
  PENDING: 2,
  DONE: 99,
  SKIPPED: 99,
};

const PHASE_PRIORITY: Record<EventStepPhase, number> = {
  BEFORE: 0,
  DURING: 1,
  AFTER: 2,
};

function timestamp(value: Date | null | undefined) {
  return value ? value.getTime() : Number.POSITIVE_INFINITY;
}

export async function getDoThisNext(workspaceId: string) {
  const steps = await prisma.eventStep.findMany({
    where: {
      status: {
        notIn: [EventStepStatus.DONE, EventStepStatus.SKIPPED],
      },
      event: {
        is: {
          workspaceId,
        },
      },
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          startsAt: true,
          type: true,
        },
      },
    },
  });

  steps.sort((a, b) => {
    const byStatus =
      STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];

    if (byStatus !== 0) {
      return byStatus;
    }

    const byScheduled =
      timestamp(a.scheduledAt) - timestamp(b.scheduledAt);

    if (byScheduled !== 0) {
      return byScheduled;
    }

    const byEventStart =
      timestamp(a.event.startsAt) - timestamp(b.event.startsAt);

    if (byEventStart !== 0) {
      return byEventStart;
    }

    const byPhase =
      PHASE_PRIORITY[a.phase] - PHASE_PRIORITY[b.phase];

    if (byPhase !== 0) {
      return byPhase;
    }

    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }

    const byCreatedAt = a.createdAt.getTime() - b.createdAt.getTime();

    if (byCreatedAt !== 0) {
      return byCreatedAt;
    }

    return a.id.localeCompare(b.id);
  });

  return steps[0] ?? null;
}
