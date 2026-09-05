# FAST PAY + ACTION VALUE METER v1

## Purpose

FAST PAY is the shared payment and entitlement kernel for HUB products, bots, downloads, packs, upgrades, and limited premium actions.

ACTION VALUE METER is the shared trust UX that tells a user what an action will consume, what they have now, and what will remain afterward.

The permanent interaction rule is:

**KNOWN COST -> CONSCIOUS ACTION -> VISIBLE REMAINDER -> EASY REPLENISHMENT -> INSTANT CONTINUE**

## User-facing rules

1. Show what the action uses before it happens.
2. Show the current remaining count.
3. Show the remaining count after the proposed action.
4. Do not surprise users with hidden deductions.
5. Use product-native nouns: Product Exports, Song Downloads, Print-Ready Editions, Premium Discoveries, Final Renders, etc. Avoid abstract credits unless the product is genuinely a wallet.
6. If actions do not expire, say so. If they expire, display the real expiration date/time. Never use fake urgency.
7. Low remaining counts may increase clarity, not anxiety. No flashing countdowns, artificial scarcity, or casino-style pressure.
8. When appropriate, replenish with three simple choices: BUY THIS / BUY A PACK / UPGRADE.
9. After payment or action completion, return the user to the exact task they were doing.
10. Failed or canceled actions must release reserved units automatically.

## Payment rails

- Shopify-native commerce: Shopify Payments / Shop Pay.
- App, bot, embedded, and contextual upgrades: Stripe Checkout + Link.
- FAST PAY itself never stores raw card numbers.
- Provider webhooks are authoritative for paid/refunded/disputed state.

## Verified Shopify baseline — Urban Spirit / HUB

Verified against the connected store on 2026-09-05:

- Customer accounts setting: `OPTIONAL`
- Customer account version: `NEW_CUSTOMER_ACCOUNTS`
- Login links visible on storefront and checkout: `true`
- Login required at checkout: `false`
- Customer account root: `https://account.urbanspirit.biz`
- Supported digital wallets reported by Shopify: `SHOPIFY_PAY`, `APPLE_PAY`, `GOOGLE_PAY`

Operating implication: preserve guest checkout for conversion while offering account sign-in for persistent HUB identity, purchases, entitlements, and remaining-action counts. Do not rebuild Shopify checkout merely to reproduce capabilities Shopify already provides.

## Security gates

FAST PAY must not be enabled live until all are true:

- `FAST_PAY_ENABLED=true`
- `STRIPE_SECRET_KEY` configured server-side
- `STRIPE_WEBHOOK_SECRET` configured server-side
- `FAST_PAY_APP_ORIGIN` set to the exact allowed app origin
- `SHOPIFY_STORE_DOMAIN` configured
- `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` configured
- `HUB_AUTH_ORIGIN` configured
- `HUB_SESSION_SECRET` configured server-side with at least 32 characters
- Shopify Customer Account OAuth/PKCE callback registered and tested
- signed HUB session resolves the consumer account; browser-supplied user/email identifiers are never authoritative
- `FAST_PAY_INTERNAL_TOKEN` may be configured for staging/maintenance calls but is not the consumer identity gate
- webhook signature tests pass
- duplicate webhook/idempotency tests pass
- reserve/commit/release and reservation-expiry tests pass
- full-refund and dispute entitlement revocation tests pass
- partial-refund policy is explicitly reviewed before any partial-refund automation is added

The `/api/fast-pay/status` endpoint stays non-ready until the required runtime gates are present.

## Identity architecture

1. Customer signs in through Shopify Customer Accounts.
2. HUB uses OAuth 2.0 Authorization Code + PKCE and verifies OAuth state.
3. HUB retrieves the authenticated Shopify customer identity through the Customer Account API.
4. HUB maps that verified identity to the shared HUB `User` record.
5. HUB issues its own HMAC-signed, `HttpOnly`, `Secure`, `SameSite=Lax` session cookie.
6. FAST PAY resolves the user only from the valid HUB session.
7. The Shopify access token is used server-side for the identity exchange and is not stored in browser-accessible state.

This creates one HUB identity capable of following the customer across eligible lanes while leaving Shopify as the commerce/customer-account authority for the storefront.

## Data model

- `FastPayAccount`: one payment/entitlement account per HUB user.
- `FastPayActionDefinition`: reusable product-native action type and default cost.
- `FastPayOffer`: BUY / PACK / UPGRADE offer configuration.
- `FastPayTransaction`: provider payment state with idempotency keys.
- `FastPayEntitlement`: units or unlimited access granted to an account.
- `FastPayLedgerEntry`: immutable unit movement record.
- `FastPayUsageReservation`: reserve-before-action to prevent double-spending and accidental loss.
- `FastPayProcessedEvent`: provider webhook deduplication/retry state.

## Action lifecycle

1. Quote -> show current and post-action remaining values.
2. Confirm -> user consciously chooses the action.
3. Reserve -> units are atomically reserved with an idempotency key.
4. Perform -> product does the expensive/valuable operation.
5. Commit -> successful operation consumes the reservation permanently.
6. Release -> failed/canceled operation restores the units.
7. Expiry recovery -> abandoned reservations are automatically restored after the reservation window.

## Payment lifecycle

1. User chooses BUY / PACK / UPGRADE.
2. Server creates an idempotent provider checkout session.
3. Provider collects payment and saved-payment details securely.
4. Signed webhook confirms payment.
5. FAST PAY grants entitlement and writes ledger entry.
6. User returns to the product and continues.
7. Full refunds/disputes revoke related active entitlement. Partial refunds require an explicit policy rather than silent proportional guessing.

## Pilot catalog

The seed script creates inactive examples only:

- Creator College Product Export: single + 10-pack
- Music Song Download: 10-pack
- Event Print-Ready Edition: 5-pack

All seeded offers remain `active=false` until pricing and product ownership are explicitly approved.

## Deployment sequence

1. Isolated feature-branch build validation — PASSED on Render with FAST PAY disabled and no live payment credentials.
2. Merge code into HUB Core staging only after reviewing the staging schema push impact.
3. Apply Prisma schema to the staging database.
4. Seed the inactive pilot catalog.
5. Configure Shopify Customer Account public-client ID and exact staging OAuth callback/origin.
6. Generate/configure a strong HUB session secret and test account sign-in/session/logout.
7. Configure Stripe test-mode secret + webhook secret.
8. Keep all pilot offers inactive until product/pricing approval; keep production charging off.
9. Turn FAST PAY on in staging only.
10. Run test-mode flows: quote -> reserve -> action -> commit/release -> checkout -> webhook -> entitlement; duplicate webhook; simultaneous spend; expired reservation; canceled checkout; full refund; dispute.
11. Connect Creator College Product Export as the first controlled pilot after staging passes.
12. Replicate the shared component; do not fork payment logic per product.

## System placement

FACE OFFICIAL -> explains what it is and preserves approved visual identity.

ACTION VALUE METER -> explains what the next action costs and what remains.

FAST PAY -> makes replenishment or upgrading frictionless.

PRODUCT-TO-MARKET MACHINE -> measures which offers/actions are displayed, chosen, repeated, purchased, abandoned, refunded, and upgraded.

FAST PAY is infrastructure. Product teams may customize words, benefits, and approved FACE visuals; they may not bypass the shared security, ledger, entitlement, or trust rules.
