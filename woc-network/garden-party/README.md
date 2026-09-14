# Women of Color — Garden Party persistence backend

Build 2 source, prepared for the approved Render workspace `tea-d9tvrijncjis73a6k5pg`.

## Current status

The Shopify Build 1 planner remains usable in the unpublished working theme. The user approved uploading this backend and the Shopify source to `melbgittinit/botbox-alpha-clean`, branch `woc-garden-party-alpha`. Deployment and live service connections remain pending. No existing HUB/Bot Factory service or database is modified. No real email has been sent. No paid infrastructure has been provisioned.

Implemented: a requested email access link; one-use, 20-minute token stored only as a hash; explicit confirmation before creating the party; seven-day HttpOnly/Secure host session; host ownership checks; editable persisted plans with version conflict detection; deletion and sign-out; renewed access to the latest saved party; PostgreSQL schema and cleanup; database rate limits; service-email permission separate from marketing; fail-closed configuration.

The access token is in the email link fragment, not its query string, so it is not transmitted in the initial page request. The browser clears the fragment and waits for an explicit button press before consuming the token. Resend acceptance means the provider accepted the request, not proof it reached the inbox. Failed sends do not return a success message or leave an active access request.

Not yet connected: a production database URL, verified WOC Resend sender/API key, Shopify save-gate UI, integrated Network routing, guest invitations/RSVP, EVE marketing consent, customer sync and reminders. Do not describe this source as a deployed or launch-ready multi-user MVP.

## Setup

1. In the Render Blueprint creation screen choose `melbgittinit/botbox-alpha-clean`, branch `woc-garden-party-alpha`, root `render.yaml`.
2. Keep `PUBLIC_WRITES_ENABLED=false`. The Blueprint uses a free web service and does **not** create a billable database.
3. Set `DATABASE_URL` to the approved persistent PostgreSQL connection. Use a dedicated database/user or restrict the user to `woc_garden`. Do not use the HUB staging database that expires October 4, 2026 for permanent customer records. No existing database credentials were read or copied.
4. Set `RESEND_API_KEY` through Render's private environment settings, not chat or Git. Set `MAIL_FROM` to the verified WOC sender, such as a verified address on the store's domain. Do not use an unverified Yahoo address as a custom-domain sender. Set `APP_ORIGIN` to the actual HTTPS application origin, with no trailing slash. Render generates the rate-limit secret.
5. Deploy. Start runs the idempotent, WOC-namespaced migration, then the HTTP server. `/healthz` is the process health endpoint; `/readyz` returns 503 until configuration and public-write gating are satisfied.
6. Run a controlled database/email test with an explicitly authorized recipient. Validate one-use links, replay rejection, host ownership, edit conflicts, deletion and expired link recovery against PostgreSQL. The current automated HTTP tests use a test double, not a live database or email provider.
7. Connect the existing Shopify Save/Invite gate to `POST /api/parties/save`, preserving edited plan fields and explicitly asking for the host's local timezone. Use the handoff's first name/email/ZIP, optional mobile and unchecked passwordless-access permission. Keep marketing separate. Only display the check-email message after HTTP 202.
8. Confirm the same-brand route/host experience, real-device mobile accessibility and operational monitoring, then enable public writes. Keep the existing local-download fallback if email saving is unavailable.

The current route implementation is an integrated application candidate, not a Shopify app proxy. Do not claim `/garden-party/*` paths are live on the Shopify domain until routing has actually been configured. `X-Frame-Options: DENY` means this host portal is not intended for a cross-site iframe. Use navigation from the Network and preserve the WOC master brand.

## API

- `POST /api/parties/save`: `{firstName,email,mobile?,zipCode,passwordlessPermission:true,plan}`. Returns 202 only after email provider acceptance. The unverified plan is held for up to 20 minutes; it becomes a saved party when the link is confirmed.
- `POST /api/access/confirm`: `{token}`. Atomically consumes a valid accepted access request, creates/opens the party and sets the host cookie.
- `POST /api/access/request`: `{email,passwordlessPermission:true}`. Sends a fresh link for the latest saved party, when one exists; generic response avoids disclosing registered addresses.
- `GET /api/host`: private current party ID.
- `GET /api/parties/:id`: owner-only plan.
- `PATCH /api/parties/:id`: `{version,plan}`; 409 on stale version.
- `DELETE /api/parties/:id`: owner-only permanent party deletion; sessions and pending recovery links are removed by foreign keys.
- `POST /api/logout`: invalidate current session.

All mutations require an approved Origin and JSON content type. Body size, input lengths, counts, budgets, timezone and date/time are validated. Plan fields are allowlisted; client ownership, role and marketing flags are ignored. The database receives parameterized queries. No addresses, raw tokens, email bodies or credentials are written to application logs.

## Verification

`npm ci` then `npm test`; `npm run migrate` only against the approved database.

Automated tests verify input/consent boundaries, random token format and hashing, cross-origin rejection, unauthorized and cross-host access, one-use token replay rejection, secure cookie flags, saved-plan edit/version conflicts, email failure cleanup, disabled-write gating and party deletion. No tests send mail or alter Render databases.

The Blueprint was reviewed against current Render documentation. Render CLI was not installed in the working environment, so CLI Blueprint validation has not been run. Validate in Render before Apply.

Documentation: [Render Blueprint specification](https://render.com/docs/blueprint-spec), [Resend send-email API](https://resend.com/docs/api-reference/emails/send-email).
