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

## Security gates

FAST PAY must not be enabled live until all are true:

- `FAST_PAY_ENABLED=true`
- `STRIPE_SECRET_KEY` configured server-side
- `STRIPE_WEBHOOK_SECRET` configured server-side
- `FAST_PAY_INTERNAL_TOKEN` configured server-side for staging/internal calls
- `FAST_PAY_APP_ORIGIN` set to the exact allowed app origin
- real HUB authentication/session layer replaces the temporary internal email bridge for consumer traffic
- webhook signature tests pass
- duplicate webhook/idempotency tests pass
- reserve/commit/release and reservation-expiry tests pass
- full-refund and dispute entitlement revocation tests pass
- partial-refund policy is explicitly reviewed before any partial-refund automation is added

The `/api/fast-pay/status` endpoint stays non-ready until the required runtime gates are present.

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

1. Merge code into HUB Core staging only after build validation.
2. Apply Prisma schema to the staging database.
3. Seed the inactive pilot catalog.
4. Configure Stripe test-mode secret + webhook secret.
5. Keep `FAST_PAY_ENABLED=false` while testing readiness and webhook signatures.
6. Add real HUB authentication/session layer; do not expose the internal token to browsers.
7. Turn FAST PAY on in staging.
8. Run a zero-risk/test-mode pilot through quote -> reserve -> action -> commit/release -> checkout -> webhook -> entitlement.
9. Connect one real product only after staging passes.
10. Replicate the shared component; do not fork payment logic per product.

## System placement

FACE OFFICIAL -> explains what it is and preserves approved visual identity.

ACTION VALUE METER -> explains what the next action costs and what remains.

FAST PAY -> makes replenishment or upgrading frictionless.

PRODUCT-TO-MARKET MACHINE -> measures which offers/actions are displayed, chosen, repeated, purchased, abandoned, refunded, and upgraded.

FAST PAY is infrastructure. Product teams may customize words, benefits, and approved FACE visuals; they may not bypass the shared security, ledger, entitlement, or trust rules.
