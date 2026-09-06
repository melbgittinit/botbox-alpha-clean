# Creator College Migration SQL Review

Status: REVIEWED, NOT APPLIED
Branch: `hub-core-alpha`

## Review result

The generated Prisma migration diff is additive-only.

It creates:

- enum `CreatorCreationKind`
- enum `CreatorCreationStatus`
- table `CreatorProfile`
- table `CreatorBrandKit`
- table `CreatorCreation`
- table `CreatorFamily`
- table `CreatorCreationLink`
- table `CreatorTemplate`
- indexes for ownership, workspace scope, status, kind, family/parent/source lineage, template lookup, and link lookup
- foreign keys from the new Creator College tables to existing `User` and `Workspace` records

It does **not** contain:

- `DROP TABLE`
- `DROP COLUMN`
- destructive rewrites of existing HUB columns
- data backfills into existing HUB tables
- renames of existing HUB models
- a command that applies the migration to any database

## Delete behavior reviewed

### User ownership
Creator College rows use `ON DELETE CASCADE` when their owning `User` is deleted. This is intentional because those records are user-owned.

### Workspace scope
Optional `workspaceId` references use `ON DELETE SET NULL`. This prevents workspace deletion from automatically deleting a creator's work.

### Creation lineage
`parentId`, `sourceId`, and `familyId` use `SET NULL` so deletion of a source/parent/family does not delete derivative content.

### Brand Kits
Deleting a Brand Kit sets `CreatorCreation.brandKitId` to null rather than deleting creations. Deleting the Creator Profile cascades its Brand Kits.

### Semantic links
Rows in `CreatorCreationLink` cascade when either endpoint creation is deleted. The linked creations themselves are not cascade-deleted by removing the link.

### Templates
Deleting a template source sets `CreatorTemplate.sourceId` to null; the reusable template remains.

## Integrity tightening after first SQL review

Two improvements were made before any migration was created or applied:

1. `CreatorFamily.rootId` is now a real FK to `CreatorCreation` through the named `CreatorFamilyRoot` relation and uses `SET NULL` on delete.
2. `CreatorProfile` now has `@@unique([userId, workspaceId])` to prevent duplicate profiles for the same user/workspace scope. Note that PostgreSQL still permits multiple rows where nullable `workspaceId` is null, so the server service must continue to enforce one personal profile per user.

## Security / authorization requirement

The schema itself does not authorize requests. Every server read/write must receive an authenticated user identity from a trusted resolver. Workspace-scoped access must additionally verify `WorkspaceMember` membership. No public API should accept a client-provided `userId` as proof of identity.

## Current server-layer decision

A read-only internal repository may be added before authentication wiring is complete, provided that:

- it requires an already-resolved `userId`
- it checks workspace membership when `workspaceId` is present
- it scopes Creator records to that owner/scope
- it is not exposed through an unauthenticated public route

## Migration gate

Do not apply a database migration until:

1. Prisma generation passes with the final schema.
2. Production Next.js build passes.
3. The regenerated SQL after the integrity tightening has been reviewed.
4. An authenticated server identity resolver is selected/wired.
5. Read-only repository behavior is validated.
6. The Digital Product builder persistence pilot is ready behind an adapter/fallback.
