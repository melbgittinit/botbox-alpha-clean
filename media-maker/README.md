# Media Maker standalone preview

Start: `node media-maker/server.mjs`. Node 20+; PORT defaults to 10000. No package installation or API secrets required.

GET /studio serves the editable studio. GET /health returns machine-readable capabilities. Current features: local template drafts, 30-second news structures, feature outlines, edit brief JSON, WebVTT caption downloads, claim ledger and editorial review records. Footage preview stays in the browser.

Not implemented: AI conversation, automated research, hosted MP4 rendering, persistent saved projects, public share pages, authenticated users, payments, usage quotas, or voice agents. Do not advertise these as connected.

Render preview: free compute; no automatic deploys. Production requires an approved budget, durable storage, authentication, quotas, monitoring, and end-to-end verification. The Shopify acquisition pages remain a separate theme integration.
