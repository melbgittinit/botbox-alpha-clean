# WMR Persistence Recovery Review — 2026-10-12

Status: REVIEW ONLY. Do not deploy, repoint DATABASE_URL, create schemas, upgrade databases, or incur cost without explicit authorization.

## Current facts

- HUB Core service branch: `hub-core-alpha`.
- Review branch: `wmr-build-db-decouple-review-2026-10-12`.
- Review branch adds:
  - `build:render = npm run prisma:generate && npm run build`
  - `db:sync = prisma db push`
- WMR routes are unchanged:
  - `app/api/wmr/state/route.ts`
  - `app/api/wmr/entitlements/route.ts`
  - `app/api/wmr/events/route.ts`
- WMR Prisma models remain present:
  - `WmrProfile`
  - `WmrEvent`
- Render currently runs an external build command that performs `prisma db push` before application compilation.
- The dedicated database `hub-core-alpha-staging-db` expired 2026-10-04T21:27:22Z and is suspended.
- Render documentation states an expired Free Postgres database is inaccessible unless upgraded to a paid plan and is deleted after a 14-day grace period if not upgraded.
- Estimated end of grace period: 2026-10-18T21:27:22Z (about 5:27 PM EDT).
- The workspace already has another active Free Postgres database, `opportunity-camera-alpha-db`, so a second active free database is not available under Render's one-free-database-per-workspace limit.
- Existing paid database `botbox-db` is available on plan `basic_256mb`.
- Read-only check of `botbox-db` on 2026-10-12:
  - user tables in `public`: 0
  - other connections: 0 at check time
  - database size: ~7.7 MB

## Recovery options

### Option A — Upgrade the expired WMR database
Pros:
- Preserves the existing database and connection identity.
- Least migration complexity if existing data must be preserved.

Cons:
- Incurs a recurring database charge.
- Requires explicit authorization.
- Time-sensitive because the free database is inside Render's deletion grace period.

Decision status: NOT AUTHORIZED.

### Option B — Reuse the already-paid `botbox-db` with an isolated PostgreSQL schema
Concept:
- Use a dedicated schema such as `hub_core_wmr`.
- Prisma supports selecting a PostgreSQL schema via the connection URL `?schema=hub_core_wmr`.
- Keep WMR/HUB tables isolated from `public` and future unrelated tables.
- Run schema synchronization as a separate controlled operation, not as part of every app build.
- Repoint HUB Core only after schema creation/sync and a rollback plan are ready.

Pros:
- No new database instance charge.
- Current read-only inspection shows no user tables and no other connections at check time.
- Schema isolation reduces naming/collision risk.

Risks / required validation:
- Confirm `botbox-db` is not reserved for another production workload.
- Confirm credentials/permissions allow creating and using an isolated schema.
- Current Prisma schema contains the broader HUB/Core data model, so a full `db push` into the isolated schema would create more than only WMR tables.
- Repointing `DATABASE_URL` is a live infrastructure change and requires explicit authorization.
- Must test authentication, entitlement, WMR state GET/PUT, and rollback.

Decision status: PROMISING REVIEW OPTION; NOT AUTHORIZED.

### Option C — Create a new Free Render Postgres
Currently blocked because another Free Postgres (`opportunity-camera-alpha-db`) is active in the workspace and Render permits one active Free Postgres per workspace.

Do not delete, repurpose, or suspend the Opportunity Camera database to free the slot without explicit authorization.

Decision status: BLOCKED / NOT AUTHORIZED.

## Build correction

Current Render build coupling should be replaced, when authorized, with:

```
npm install && npm run build:render
```

Where:

```
build:render = npm run prisma:generate && npm run build
db:sync      = prisma db push
```

This makes ordinary application compilation database-independent while keeping schema synchronization explicit.

This does not restore runtime persistence by itself.

## Proposed controlled sequence after authorization

1. Choose Option A or B.
2. Confirm database endpoint and isolation.
3. Run `npm run db:sync` as a separate controlled step against the chosen database/schema.
4. Verify `WmrProfile` and `WmrEvent` exist.
5. Update HUB Core `DATABASE_URL` only if required and authorized.
6. Apply the database-independent build command.
7. Deploy HUB Core.
8. Verify service health.
9. Perform controlled customer authentication.
10. Verify `/api/wmr/entitlements` returns `forReal=true` and `persistentPlan=true`.
11. PUT a small WMR state payload.
12. GET it back and confirm persistence after refresh/restart.
13. Only after persistence passes, correct Shopify FOR REAL access routing and digital shipping settings.
14. Complete end-to-end purchase → access → sign-in → save → reload QA before outbound release.

## Rollback principle

Do not remove the existing suspended database or alter another application's datastore as part of initial recovery. Keep every infrastructure change reversible until WMR persistence has passed end-to-end QA.
