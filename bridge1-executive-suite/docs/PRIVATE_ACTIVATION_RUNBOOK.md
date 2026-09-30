# BRIDGE-1 Private Activation Runbook

## Release rule

BRIDGE-1 remains private until every technical gate and every supervised conversation gate passes. A successful deployment is not permission to publish the Executive Suite page.

## Ownership boundary

- Shopify displays the invitation-only room.
- The secure voice service runs separately and holds all secrets.
- PostgreSQL stores controlled session state and human-review records.
- OpenAI Realtime supplies the voice session through short-lived browser credentials.
- Resend may send minimal-data review alerts.
- A BOT FACTORY human remains the only authority for scope, pricing, proposals, contracts, discounts and final approval.

## Required credentials

| Setting | Owner action | Storage rule |
| --- | --- | --- |
| `OPENAI_API_KEY` | Create or select a production project key with usage controls | Secret host setting only |
| `DATABASE_URL` | Provision through the deployment blueprint | Host-managed secret only |
| `REVIEW_TOKEN` | Generate a unique 32+ character token | Secret host setting; never Shopify |
| `SESSION_SIGNING_SECRET` | Generate a unique 32+ character secret | Secret host setting |
| `INVITE_CODES_SHA256` | Generate one or more invitation hashes | Store hashes only, never plain codes |
| `RESEND_API_KEY` | Add only when review email is ready | Secret host setting |
| `REVIEW_EMAIL` | Designate the monitored human-review inbox | Host setting |
| `ALERT_FROM_EMAIL` | Use a verified sending identity | Host setting |
| `ALLOWED_ORIGINS` | Exact production storefront origins | No wildcard beyond approved hosts |

## Controlled deployment

1. Place the release in a private source repository.
2. Review `render.yaml`; confirm service and database names belong to this project.
3. Create the private service and database from the blueprint.
4. Add secrets in the host dashboard. Do not commit an `.env` file.
5. Keep `BRIDGE1_ACTIVE=false` for the first deployment.
6. Verify `/health` reports healthy PostgreSQL persistence.
7. Run `npm run preflight` in the production environment.
8. Set `BRIDGE1_ACTIVE=true` only for supervised acceptance.
9. Complete every scenario in `SUPERVISED_VOICE_ACCEPTANCE.md`.
10. Add the supplied Shopify section to the unpublished theme and enter the HTTPS room URL.
11. Verify desktop Chrome, desktop Safari and iPhone Safari.
12. Issue a limited invitation code to an internal reviewer.
13. Publish only the hidden/private route after sign-off. Do not add it to public navigation.

## Stop conditions

Pause activation immediately if the agent invents a relationship, mentions the prohibited conference/reference, treats a sampler as affiliated, quotes binding pricing, accepts an agreement, promises a launch date, bypasses consent, exposes a secret, or fails to create a human-review record.

## Rollback

1. Set `BRIDGE1_ACTIVE=false`. This stops new voice credentials without deleting records.
2. Remove or disable the Shopify Executive Suite embed in the unpublished or published theme.
3. Revoke the affected invitation hash and rotate `SESSION_SIGNING_SECRET` if access is in doubt.
4. Rotate `REVIEW_TOKEN` if reviewer access is in doubt.
5. Roll the service back to the previous verified build.
6. Confirm `/health`, database connectivity and review-queue integrity.
7. Record the incident and remediation before reactivation.

## Launch authority

Technical readiness, executive-behavior readiness and owner approval are three separate approvals. All three must be affirmative. No automated system may grant final launch authority.
