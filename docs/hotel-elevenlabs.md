# Hotel ElevenLabs production connection

The Hotel's voice generation uses the user's direct ElevenLabs account. Runway must not be used for voice generation. Rejected Elias/Maya auditions are not approved character voices.

Server-only route: `/api/internal/hotel-audio`. No public Hotel UI links to or calls this route. Approved final MP3s are served as static files/CDN assets.

Secrets and configuration belong in Render, never Git or browser code:

- `ELEVENLABS_API_KEY`: the user-created Urban API key.
- `HOTEL_AUDIO_OPERATOR_TOKEN`: separate random operator bearer credential, at least 32 characters.
- `HOTEL_AUDIO_OPERATOR_EXPIRES_AT`: ISO expiration; expired or absent credentials fail closed.
- `HOTEL_AUDIO_GENERATION_ENABLED`: generation requires exactly `true`; otherwise discovery only.
- `HOTEL_AUDIO_APPROVED_VOICE_IDS`: comma-separated voice IDs approved for character casting; empty blocks speech.

GET actions: `status` (configuration, not an authentication test), `voices` (saved account voices), `library` (shared voices without custom rates). Discovery returns a limited set of voice/casting fields and no key, account identity or private verification data.

POST requires JSON. Speech is limited to 800 characters and approved voices. Sound effects accept only the defined reception-bell, elevator-arrival and mystery-key cues, each 2–3 seconds. Calls go only to fixed ElevenLabs endpoints; no arbitrary URL forwarding, retries or cloning. Keep the provider key's credit limit in place; operator expiry and one in-flight generation per process are additional controls, not a durable spend ledger.

Renew the operator token and expiration for a new production session. Do not attach it to public URLs or downloadable files. A timeout is ambiguous billing-wise; inspect provider history before retrying.

Verify: `node --test scripts/hotel-audio.test.mjs`, TypeScript compilation and live authenticated discovery. A Render deployment alone does not prove ElevenLabs access. Knappy's casting remains unapproved until the user hears a suitable older Black American voice.
