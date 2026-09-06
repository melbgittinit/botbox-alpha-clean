import type { CreatorCreationKind, CreatorCreationStatus } from "@prisma/client";
import prisma from "../prisma";

export type CreatorActor = {
  userId: string;
  workspaceId: string | null;
};

export type CreatorCreationFilters = {
  kind?: CreatorCreationKind;
  status?: CreatorCreationStatus;
  limit?: number;
};

export class CreatorAccessError extends Error {
  constructor(message = "Creator College access denied") {
    super(message);
    this.name = "CreatorAccessError";
  }
}

async function assertWorkspaceMembership(actor: CreatorActor) {
  if (!actor.workspaceId) return;

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: actor.workspaceId,
        userId: actor.userId,
      },
    },
    select: { id: true, role: true },
  });

  if (!membership) throw new CreatorAccessError();
}

function ownedScope(actor: CreatorActor) {
  return {
    userId: actor.userId,
    workspaceId: actor.workspaceId,
  } as const;
}

export async function listCreatorCreations(
  actor: CreatorActor,
  filters: CreatorCreationFilters = {},
) {
  await assertWorkspaceMembership(actor);

  return prisma.creatorCreation.findMany({
    where: {
      ...ownedScope(actor),
      ...(filters.kind ? { kind: filters.kind } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: Math.min(Math.max(filters.limit ?? 50, 1), 100),
    select: {
      id: true,
      kind: true,
      status: true,
      title: true,
      format: true,
      style: true,
      currentStep: true,
      progress: true,
      schemaVersion: true,
      revision: true,
      parentId: true,
      familyId: true,
      sourceId: true,
      brandKitId: true,
      completedAt: true,
      archivedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getCreatorCreation(
  actor: CreatorActor,
  creationId: string,
) {
  await assertWorkspaceMembership(actor);

  return prisma.creatorCreation.findFirst({
    where: {
      id: creationId,
      ...ownedScope(actor),
    },
    include: {
      family: {
        select: { id: true, title: true, rootId: true },
      },
      parent: {
        select: { id: true, title: true, kind: true },
      },
      source: {
        select: { id: true, title: true, kind: true },
      },
      children: {
        select: { id: true, title: true, kind: true, status: true },
        orderBy: { updatedAt: "desc" },
      },
      derivatives: {
        select: { id: true, title: true, kind: true, status: true },
        orderBy: { updatedAt: "desc" },
      },
      linksFrom: {
        select: {
          relation: true,
          sortOrder: true,
          to: { select: { id: true, title: true, kind: true, status: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
      brandKit: {
        select: {
          id: true,
          name: true,
          type: true,
          audience: true,
          voice: true,
          look: true,
        },
      },
    },
  });
}

export async function listCreatorFamilies(actor: CreatorActor) {
  await assertWorkspaceMembership(actor);

  return prisma.creatorFamily.findMany({
    where: ownedScope(actor),
    orderBy: { updatedAt: "desc" },
    include: {
      root: {
        select: { id: true, title: true, kind: true, status: true },
      },
      creations: {
        select: {
          id: true,
          title: true,
          kind: true,
          status: true,
          progress: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });
}

export async function listCreatorTemplates(actor: CreatorActor) {
  await assertWorkspaceMembership(actor);

  return prisma.creatorTemplate.findMany({
    where: ownedScope(actor),
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      sourceId: true,
      kind: true,
      title: true,
      format: true,
      style: true,
      schemaVersion: true,
      seed: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getCreatorProfile(actor: CreatorActor) {
  await assertWorkspaceMembership(actor);

  return prisma.creatorProfile.findFirst({
    where: ownedScope(actor),
    include: {
      brandKits: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });
}

export async function listCreatorBrandKits(actor: CreatorActor) {
  const profile = await getCreatorProfile(actor);
  return profile?.brandKits ?? [];
}
