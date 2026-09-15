import { STORAGE_BY_KIND, type CreationKind } from "./creatorCollegeStore";

type CreatorPayload = Record<string, unknown>;

export type PersistedCreatorDraft<T extends CreatorPayload = CreatorPayload> = {
  id: string;
  kind: CreationKind;
  status: "BUILDING" | "COMPLETE";
  title: string;
  progress: number;
  updatedAt: string;
  revision?: number;
  raw: T;
};

export type SaveResult<T extends CreatorPayload = CreatorPayload> = {
  record: PersistedCreatorDraft<T>;
  source: "local" | "server";
};

export interface CreatorPersistenceAdapter {
  mode: "local" | "server";
  list(kind: CreationKind): Promise<PersistedCreatorDraft[]>;
  get<T extends CreatorPayload = CreatorPayload>(kind: CreationKind, id: string): Promise<PersistedCreatorDraft<T> | null>;
  save<T extends CreatorPayload = CreatorPayload>(record: PersistedCreatorDraft<T>): Promise<SaveResult<T>>;
  setActive(kind: CreationKind, id: string | null): Promise<void>;
  getActive(kind: CreationKind): Promise<string | null>;
}

function readArray(key: string) {
  if (typeof window === "undefined") return [] as CreatorPayload[];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as CreatorPayload[];
  } catch {
    return [] as CreatorPayload[];
  }
}

function titleFor(kind: CreationKind, raw: CreatorPayload) {
  if (kind === "service_offer") return String(raw.offer || raw.skill || "Simple Service Offer");
  if (kind === "brand") return String(raw.name || "Starter Brand");
  if (kind === "business") return String(raw.name || "Business Starter System");
  return String(raw.title || "Untitled Creation");
}

function normalize(kind: CreationKind, raw: CreatorPayload): PersistedCreatorDraft {
  return {
    id: String(raw.id),
    kind,
    status: raw.status === "COMPLETE" ? "COMPLETE" : "BUILDING",
    title: titleFor(kind, raw),
    progress: Number(raw.progress || 0),
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : new Date(0).toISOString(),
    revision: typeof raw.revision === "number" ? raw.revision : undefined,
    raw,
  };
}

export class LocalCreatorPersistence implements CreatorPersistenceAdapter {
  mode = "local" as const;

  async list(kind: CreationKind) {
    return readArray(STORAGE_BY_KIND[kind].key)
      .map((raw) => normalize(kind, raw))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async get<T extends CreatorPayload = CreatorPayload>(kind: CreationKind, id: string) {
    const found = readArray(STORAGE_BY_KIND[kind].key).find((item) => item.id === id);
    return found ? (normalize(kind, found) as PersistedCreatorDraft<T>) : null;
  }

  async save<T extends CreatorPayload = CreatorPayload>(record: PersistedCreatorDraft<T>): Promise<SaveResult<T>> {
    if (typeof window === "undefined") return { record, source: "local" };

    const config = STORAGE_BY_KIND[record.kind];
    const existing = readArray(config.key);
    const raw = {
      ...record.raw,
      id: record.id,
      status: record.status,
      progress: record.progress,
      updatedAt: record.updatedAt,
    } as T;
    const next = [raw, ...existing.filter((item) => item.id !== record.id)];
    localStorage.setItem(config.key, JSON.stringify(next));
    return { record: { ...record, raw }, source: "local" };
  }

  async setActive(kind: CreationKind, id: string | null) {
    if (typeof window === "undefined") return;
    const key = STORAGE_BY_KIND[kind].activeKey;
    if (id) localStorage.setItem(key, id);
    else localStorage.removeItem(key);
  }

  async getActive(kind: CreationKind) {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_BY_KIND[kind].activeKey);
  }
}

export const localCreatorPersistence = new LocalCreatorPersistence();

export function getCreatorPersistence(): CreatorPersistenceAdapter {
  // Server persistence remains intentionally disabled until an authenticated
  // identity resolver is present. Builders can adopt this interface now and
  // later switch adapters without changing their core workflow state.
  return localCreatorPersistence;
}
