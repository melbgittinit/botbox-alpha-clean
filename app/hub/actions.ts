"use server";

import {
  EventStepPhase,
  EventStepStatus,
  EventStepType,
  WorkspaceMode,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "../../lib/prisma";

const WORKSPACE_MODES = new Set<WorkspaceMode>([
  WorkspaceMode.FAMILY,
  WorkspaceMode.CREATOR,
  WorkspaceMode.BUSINESS,
  WorkspaceMode.CHURCH,
  WorkspaceMode.EVENT,
  WorkspaceMode.COACH,
  WorkspaceMode.TEACHER,
  WorkspaceMode.GROUP,
]);

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${key} is required.`);
  }

  return value.trim();
}

function optionalString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function createWorkspace(formData: FormData) {
  const name = requiredString(formData, "name");
  const modeValue = requiredString(formData, "mode") as WorkspaceMode;
  const tagline = optionalString(formData, "tagline");

  if (!WORKSPACE_MODES.has(modeValue)) {
    throw new Error("Invalid workspace mode.");
  }

  const workspace = await prisma.workspace.create({
    data: {
      name,
      mode: modeValue,
      tagline,
    },
  });

  revalidatePath("/hub");
  redirect(`/hub/${workspace.id}`);
}

export async function createEvent(formData: FormData) {
  const workspaceId = requiredString(formData, "workspaceId");
  const title = requiredString(formData, "title");
  const description = optionalString(formData, "description");
  const rawType = optionalString(formData, "type");
  const rawStartsAt = requiredString(formData, "startsAt");

  const startsAt = new Date(rawStartsAt);

  if (Number.isNaN(startsAt.getTime())) {
    throw new Error("Start date/time is invalid.");
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true },
  });

  if (!workspace) {
    throw new Error("Workspace not found.");
  }

  await prisma.event.create({
    data: {
      workspaceId,
      title,
      description,
      type: rawType?.toUpperCase() ?? "CUSTOM",
      startsAt,
      steps: {
        create: [
          {
            phase: EventStepPhase.BEFORE,
            type: EventStepType.TASK,
            status: EventStepStatus.READY,
            title: "Prepare for the event",
            sortOrder: 10,
          },
          {
            phase: EventStepPhase.DURING,
            type: EventStepType.MEETING,
            status: EventStepStatus.PENDING,
            title: "Run the event",
            scheduledAt: startsAt,
            sortOrder: 20,
          },
          {
            phase: EventStepPhase.AFTER,
            type: EventStepType.TASK,
            status: EventStepStatus.PENDING,
            title: "Follow up",
            sortOrder: 30,
          },
        ],
      },
    },
  });

  revalidatePath(`/hub/${workspaceId}`);
  redirect(`/hub/${workspaceId}`);
}

export async function markEventStepDone(formData: FormData) {
  const workspaceId = requiredString(formData, "workspaceId");
  const stepId = requiredString(formData, "stepId");

  const step = await prisma.eventStep.findFirst({
    where: {
      id: stepId,
      event: {
        is: {
          workspaceId,
        },
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!step) {
    throw new Error("Event step not found.");
  }

  if (
    step.status !== EventStepStatus.DONE &&
    step.status !== EventStepStatus.SKIPPED
  ) {
    await prisma.eventStep.update({
      where: { id: step.id },
      data: { status: EventStepStatus.DONE },
    });
  }

  revalidatePath(`/hub/${workspaceId}`);
}
