# MB — Merch Bot™ Security & Incident Response

## Scope
This document describes the current MB free-preview security boundary. Paid commerce, final AI rendering, POD and physical fulfillment remain gated until their separate verification requirements pass.

## Current architecture
- Public storefront/media: Shopify / The Bot Stores
- MB web application: Render
- Saved preview jobs and trust data: Supabase
- Browser-local state: localStorage for non-secret MB identifiers and local job cache
- Payment card collection: not performed by MB
- Privileged commerce credentials: server-side only; never embedded in browser code

## Runtime controls
- CSP restricts scripts to self, images to self/data/Shopify CDN, and network connections to approved MB services.
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- HSTS enabled
- Permissions-Policy denies camera/geolocation and limits microphone to the MB origin
- API responses use Cache-Control: no-store
- Job-create, checkout, verification and entitlement endpoints are rate limited
- Paid checkout fails closed while verification is incomplete

## Data handling
- Free-preview intake is limited to merch-planning fields.
- Saved preview jobs use a hashed browser token as the vault key.
- Raw payment-card data is not collected by MB.
- Saved preview jobs remain until deleted by the user or removed administratively.
- A user-facing delete control clears the local copy and requests deletion from the MB job vault.

## Incident response
### Severity
- SEV-1: confirmed exposure of privileged credentials, payment integrity failure, cross-customer job exposure, or unauthorized publishing/printing/order action.
- SEV-2: material loss/corruption of saved jobs, repeated entitlement errors, security-control failure without confirmed exposure.
- SEV-3: isolated functional/security defect with no sensitive-data or commerce impact.

### Immediate actions
1. Fail closed: disable affected paid/runtime flags or public actions.
2. Preserve logs and relevant identifiers without copying secrets into tickets/chat.
3. Identify affected service boundary: Shopify, Render, Supabase, AI provider, POD provider, or browser-only.
4. Contain the issue before restoring functionality.
5. Verify recovery with a controlled test.
6. Update BOTS BUILT BETTER™ gate status if evidence no longer supports PASS.

### Customer communication
- Do not claim an incident is resolved before recovery is verified.
- If customer data or paid fulfillment is affected, provide clear scope, current status, and required customer action.
- Never expose internal credentials, security tokens or other customers' data in support responses.

## Release rule
A lower BOTS BUILT BETTER™ release certification never implies a higher one. Preview, Commerce, Production and Fulfillment must pass their own required gates.
