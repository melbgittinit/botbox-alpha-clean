# Creator College Persistence Architecture

Status: DESIGN ONLY — no Prisma migration applied.
Branch: `hub-core-alpha`

## Goal

Replace browser-only Creator College storage with durable server persistence without locking each builder into a giant rigid schema.

The persisted system must support:

- Digital Product
- Video Series
- Church / Group Event Kit
- Simple Service Offer
- Starter Brand
- Business Starter System
- future builders without a new table for every builder
- exact resume
- autosave
- creation families / parent-child derivatives
- receipts
- Explode This provenance
- templates
- Creator Profile defaults
- Brand Kits
- ownership through the existing `User` / `Workspace` model

## Design Principles

1. **One durable Creation spine.** Every builder shares identity, owner, status, progress, route type, family relationships, timestamps, and payload version.
2. **Builder payloads stay flexible.** Builder-specific fields live in versioned `Json` rather than dozens of nullable columns.
3. **Relationships are normalized.** Parent-child lineage, brand connections, template source, and workspace ownership should be queryable without parsing JSON.
4. **Receipts are reproducible.** A receipt can be rendered from the saved creation plus completion metadata; it does not need a separate duplicated document unless a future immutable compliance snapshot is required.
5. **Autosave must be conflict-aware.** Add an integer revision so stale browser tabs cannot silently overwrite newer work.
6. **No migration until API shape is approved.** This document is the contract proposal only.

## Proposed Prisma Additions

```prisma
enum CreatorCreationKind {
  DIGITAL_PRODUCT
  VIDEO_SERIES
  EVENT_KIT
  SERVICE_OFFER
  BRAND
  BUSINESS
}

enum CreatorCreationStatus {
  DRAFT
  BUILDING
  COMPLETE
  ARCHIVED
}

model CreatorProfile {
  id                String   @id @default(cuid())
  userId            String
  workspaceId       String?
  defaultAudience   String?
  defaultVoice      String?
  defaultLook       String?
  goals             Json?
  creationTypes     Json?
  preferences       Json?
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace         Workspace? @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  brandKits         CreatorBrandKit[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([userId, workspaceId])
  @@index([workspaceId])
}

model CreatorBrandKit {
  id          String   @id @default(cuid())
  profileId   String
  name        String
  type        String?
  audience    String?
  voice       String?
  look        String?
  colors      Json?
  assets      Json?
  avoid       Json?
  footer      String?
  notes       String?
  profile     CreatorProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([profileId])
}

model CreatorCreation {
  id             String                @id @default(cuid())
  userId         String
  workspaceId    String?
  kind           CreatorCreationKind
  status         CreatorCreationStatus @default(BUILDING)
  title          String
  format         String?
  style          String?
  currentStep    String?
  progress       Int                   @default(0)
  schemaVersion  Int                   @default(1)
  revision       Int                   @default(1)
  payload        Json
  parentId       String?
  familyId       String?
  sourceId       String?
  brandKitId     String?
  completedAt    DateTime?
  archivedAt     DateTime?
  user           User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace      Workspace?             @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  parent         CreatorCreation?       @relation("CreatorParent", fields: [parentId], references: [id], onDelete: SetNull)
  children       CreatorCreation[]      @relation("CreatorParent")
  family         CreatorFamily?         @relation(fields: [familyId], references: [id], onDelete: SetNull)
  source         CreatorCreation?       @relation("CreatorSource", fields: [sourceId], references: [id], onDelete: SetNull)
  derivatives    CreatorCreation[]      @relation("CreatorSource")
  brandKit       CreatorBrandKit?       @relation(fields: [brandKitId], references: [id], onDelete: SetNull)
  linksFrom      CreatorCreationLink[]  @relation("LinkFrom")
  linksTo        CreatorCreationLink[]  @relation("LinkTo")
  templates      CreatorTemplate[]
  createdAt      DateTime               @default(now())
  updatedAt      DateTime               @updatedAt

  @@index([userId, status, updatedAt])
  @@index([workspaceId, status, updatedAt])
  @@index([kind, status])
  @@index([familyId])
  @@index([parentId])
  @@index([sourceId])
}

model CreatorFamily {
  id          String            @id @default(cuid())
  userId      String
  workspaceId String?
  title       String
  rootId      String?
  user        User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace   Workspace?         @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  creations   CreatorCreation[]
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  @@index([userId])
  @@index([workspaceId])
}

model CreatorCreationLink {
  id         String          @id @default(cuid())
  fromId     String
  toId       String
  relation   String
  sortOrder  Int             @default(0)
  from       CreatorCreation @relation("LinkFrom", fields: [fromId], references: [id], onDelete: Cascade)
  to         CreatorCreation @relation("LinkTo", fields: [toId], references: [id], onDelete: Cascade)
  createdAt  DateTime        @default(now())

  @@unique([fromId, toId, relation])
  @@index([toId])
}

model CreatorTemplate {
  id            String               @id @default(cuid())
  userId        String
  workspaceId   String?
  sourceId      String?
  kind          CreatorCreationKind
  title         String
  format        String?
  style         String?
  schemaVersion Int                  @default(1)
  seed          Json
  user          User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace     Workspace?            @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  source        CreatorCreation?      @relation(fields: [sourceId], references: [id], onDelete: SetNull)
  createdAt     DateTime              @default(now())
  updatedAt     DateTime              @updatedAt

  @@index([userId, kind])
  @@index([workspaceId, kind])
}
```

## Why `payload Json`

Today the builders have substantially different shapes:

- Digital Product: outline + sections + use mode
- Video Series: episodes + hooks + scripts + visual plan + posting rhythm
- Event Kit: timeline + promotion + materials + follow-up
- Service Offer: skill + problem + customer + delivery + price position + sales assets
- Brand: position + promise + voice + identity + connected creations
- Business: customer + offer + delivery + sales + operations + growth

Trying to flatten all of that into one SQL table would create a large nullable schema and make every new builder a migration event. A stable normalized spine plus versioned JSON payload gives us both queryability and flexibility.

## Link Semantics

`CreatorCreationLink.relation` should initially support string values such as:

- `BRAND_CONTAINS`
- `BUSINESS_USES`
- `BUNDLE_CONTAINS`
- `CAMPAIGN_USES`
- `CLIENT_DELIVERABLE`

We can promote these to an enum later when the relationship vocabulary stabilizes.

## Family vs Link

These are intentionally different:

- **Family** = derivative lineage around a source creation. Example: guide → video series → workbook.
- **Link** = semantic organization. Example: a brand contains a service offer and an event kit.

A creation can belong to one derivative family while being linked to multiple higher-order structures.

## Exact Resume Contract

Client asks for one creation by ID. Server returns:

```ts
{
  id,
  kind,
  status,
  title,
  format,
  style,
  currentStep,
  progress,
  schemaVersion,
  revision,
  payload,
  familyId,
  parentId,
  sourceId,
  brandKitId,
  updatedAt
}
```

The router chooses the builder from `kind`; the builder restores `currentStep` and `payload`.

## Autosave Contract

Recommended endpoint behavior:

```text
PATCH /api/creator-college/creations/:id
If-Match-Revision: <revision>
```

Payload includes only changed durable state.

Server updates only when stored revision matches supplied revision, then increments revision. A conflict returns `409` with the latest revision and updated timestamp.

This prevents two tabs from silently overwriting each other.

## Local-to-Server Migration

First authenticated launch after persistence is enabled:

1. Read current browser-local Creator College records.
2. If the server account has no matching imported record, offer/import them once.
3. Write server records with a `legacyLocalId` inside migration metadata or an import map.
4. Confirm successful server save before marking local data migrated.
5. Keep a short read fallback during transition; do not immediately delete local data.

Do not perform automatic destructive deletion of browser-local work.

## API Surface — V1

- `GET /api/creator-college/creations`
- `POST /api/creator-college/creations`
- `GET /api/creator-college/creations/:id`
- `PATCH /api/creator-college/creations/:id`
- `POST /api/creator-college/creations/:id/complete`
- `POST /api/creator-college/creations/:id/duplicate`
- `POST /api/creator-college/creations/:id/derive`
- `GET /api/creator-college/templates`
- `POST /api/creator-college/templates`
- `POST /api/creator-college/templates/:id/use`
- `GET/PATCH /api/creator-college/profile`
- `GET/POST/PATCH /api/creator-college/brand-kits`

## Authorization Rule

Every read/write must resolve through the authenticated `User` and, when present, validate that the user has membership in the requested `Workspace`.

No endpoint should trust a client-supplied `userId` as authorization.

## Migration Sequence

1. Approve this data contract.
2. Add Prisma models on `hub-core-alpha` only.
3. Run `prisma format` + `prisma validate` + CI build.
4. Generate migration SQL for review **without applying it to production**.
5. Review indexes, cascades, and existing-table relation changes.
6. Add server repository/service layer.
7. Add read APIs.
8. Add create/autosave APIs with revision checks.
9. Switch one builder (Digital Product) behind a persistence adapter.
10. Validate browser-local → server migration.
11. Roll remaining builders onto the adapter.
12. Only then consider production migration/deployment.

## Explicit Non-Goals For First Persistence Release

- no public creator marketplace
- no social feed
- no collaborative live editing
- no billing/subscription model tied to creations
- no accounting ledger
- no arbitrary file-cloud replacement
- no automatic deletion of local drafts

## Decision Gate

The recommended next technical step is **schema-on-branch + Prisma validation only**. Do not run or apply a production database migration until the generated SQL and relation/cascade behavior have been reviewed.
