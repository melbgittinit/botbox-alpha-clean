# BRIDGE-1 Executive Voice Room

Browser-first voice agent for the BrandBridge Executive Demonstration Suite at The Bot Stores.

## Included

- Full-screen executive voice room with microphone, mute and end controls
- OpenAI Realtime WebRTC connection using a short-lived server-issued credential
- Server-side BRIDGE-1 commercial and truth guardrails
- Concept-only boundaries for the Amazon, Target, McDonald's and Delta samplers
- Shopify theme section that embeds the secure voice room without exposing the API key
- Render deployment blueprint
- Automated prompt-contract tests
- Locked Executive Intelligence Architecture distinguishing BOT CORE, Agent X, BrandBridge and BRIDGE-1
- Working private-beta Executive Intelligence Core with session state, qualification, consent, brief generation and protected review queue
- Realtime function tools that allow the live voice agent to update opportunity state and request controlled human review
- PostgreSQL production schema for durable deployment
- Protected visual human-review dashboard at `/review.html`
- Accept, defer and close review actions with audit history
- Minimal-data qualified-opportunity email alerts
- Emergency voice-session shutoff through `BRIDGE1_ACTIVE=false`
- Hashed invitation-code verification with short-lived signed HttpOnly access cookies
- Rate limits for invitation attempts and voice-session creation
- End-to-end acceptance simulator and deployment environment audit
- Durable session-completion outcomes and a protected aggregate executive funnel integrated into the human-review dashboard

See `docs/EXECUTIVE_ARCHITECTURE.md` for the governing architecture and minimum private-beta gate.
See `docs/PRIVATE_ACTIVATION_RUNBOOK.md` and `docs/SUPERVISED_VOICE_ACCEPTANCE.md` before any hosted activation.

## Local verification

```bash
cp .env.example .env
npm test
npm start
```

Open `http://localhost:3000`. Live speech requires a valid `OPENAI_API_KEY` in `.env`.

## Activation order

1. Push this directory to a private Git repository.
2. Deploy the `render.yaml` Blueprint.
3. Set `OPENAI_API_KEY` in the host's secret environment settings.
4. Verify `/health` and complete a supervised voice conversation.
5. Add `shopify/sections/bridge1-voice-room.liquid` to the unpublished BOT FACTORY theme.
6. Upload `public/bridge1-possibility-to-approval.png` and `public/bridge1-voice-to-human-review.png` to Shopify Files.
7. Add the section to the existing BrandBridge Executive Suite template and select both images in its settings.
8. Enter the deployed HTTPS voice-room URL in the section setting.
9. Test iPhone Safari, desktop Safari and Chrome before publishing the page.

When `DATABASE_URL` is present, the service uses a bounded PostgreSQL connection pool, restores active sessions after restart and deletes expired snapshots. Without it, the service deliberately falls back to in-memory mode for local tests only. `/health` reports the active persistence mode.

Generate invitation hashes with `npm run hash-invite -- <private-code>`, place the resulting hash in `INVITE_CODES_SHA256`, run `npm run simulate`, and require `npm run audit` to pass before private activation.

With the final production environment loaded, `npm run preflight` runs the full test, executive acceptance and deployment-secret gate. Executive metrics require the same bearer token as the human-review dashboard and return aggregate counts only.

## Authority boundary

BRIDGE-1 can diagnose, demonstrate, qualify and prepare a human handoff. It cannot issue or accept binding pricing, contracts, discounts, guarantees or deployment commitments.
