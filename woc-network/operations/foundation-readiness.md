# WOC Network — Foundation readiness and operating ledger
Updated: 2026-09-15. Scope excludes ALL The Tree work.
Owner: Mel Banks II. Store: womenofcolorstudybibles.com.
Repository: melbgittinit/botbox-alpha-clean; branch woc-garden-party-alpha.
Working theme: 190252056874, WOC FINAL — WORKING COPY.
Latest verified theme role: UNPUBLISHED (2026-09-15).
Image implementation commit: ae02dc907b75f34868176d5a63be2abce27cf9f5.
Preview: https://womenofcolorstudybibles.com/?preview_theme_id=190252056874

## Definition of done
Built means saved implementation exists. Tested means the intended path was exercised with evidence. Live means publication/deployment verified. Operational means the full customer journey, delivery, failure handling, and measurement work. Do not equate a homepage card with a complete product. No aggregate percentage until a weighted acceptance checklist is agreed; no invented revenue or zero metrics where data is missing.

## Verified baseline
Shopify connection verified for Women of Color Study Bibles and More. Draft theme read back after eight image uploads; teacher and EVE images and English Baby Bible cover visually checked in browser. Three changed files passed Shopify theme validation using existing locale data. GitHub branch confirmed accessible. Render list_services in confirmed workspace tea-d9tvrijncjis73a6k5pg shows no woc-garden-party service. Backend code exists in repo but deployment, migrations, email and RSVP are not verified operational.
This is a current configuration check plus earlier checks in this same conversation. Product-page findings below are earlier session audit findings and require rechecking before mutations. No test purchase, actual contact-form submission, or real invitations were sent. Mobile end-to-end signoff not completed.

## Lane completion matrix
| Lane | Built / verified | Remaining acceptance |
|---|---|---|
| Masthead / navigation | Small logo, glass treatment, date/time, LIVE beacon CSS present | Mobile and reduced-motion checks; meaningful live/current semantics; navigation link audit |
| Network Today | Modular news cards, lead story and outbound source links | Daily source verification, dates/expiry, archive and failed-source fallback. September 14 Emmy card is past-dated as of audit; do not assert future event. No automatic news pipeline established |
| More Women of the Bible | Homepage presentation and Amazon B0FHTL9V77 link | Dedicated experience/landing page, completed approved digital content, sample, access and purchase delivery, progress/return path. Coordinate separately built teacher experience; do not substitute main Women of Bible book for More Women |
| Teaching Room | Dr. T.T. Cole and Ms. Jordan portraits, room scene, inline introduction/reflection flow | Dedicated lessons/teacher-training destinations and approved content, downloads, next lesson, saved progress. cole_link/jordan_link not set |
| MY MTC | Bot imagery and black background | start_url and gift_url blank. Need dedicated landing page, working bot session, return/access, support and supported gifting fulfillment |
| Reset and From Our World | Artwork and cross-site cards; Reset art corrected | Elevate and Reset links route too broadly. Resolve exact landing/product/experience targets. Test music play, purchase, download/access, return to Network |
| Jesus and Jazz | Artwork and /pages/jesus-and-jazz destination | Individual album/character continuation and playable licensed/owned audio, product delivery, clear return links; audit exact current destinations |
| Publishing books / Jesus book | Book shelf/product routes; prior audit Jesus book regular $22.99 | Recheck inventory/variants, approved pricing, shipping, order routing and images. Jesus book remains full price. Purple non-indexed inventory restriction must be reconciled before sales; never change inventory based solely on old notes |
| More Promises | Section entry exists but disabled | Determine approved completed source and reconnect intended live section/destination; don't call it operational |
| EVE Report / EVE Five | Hero and five approved category images; story-field schema; share/gather controls | Actual headlines, summaries, sources and story destinations are unfilled. Need issue record, expiration, story pages, working save identity and EVE opt-in delivery. Images alone are not issue content |
| Garden Party | Five-step client builder, controlled editable plan, copy invitation and plan download tested; backend source in GitHub | Deploy app, PostgreSQL migration, passwordless host access, saved plans/dashboard, private invitation/RSVP endpoints, separate EVE consent, email sender verification, queue/reminders, cancellation, moderation, metrics. Save currently means download, not cloud persistence |
| Wonderful Baby Bible | English cover visually verified, lower homepage layout, Amazon B0FPFQ5FQF link | Check correct live Amazon edition before sustained promotion; retain cover-to-edition consistency. Click tracking possible; KDP order attribution is separate. Spanish listing unverified; no Spanish purchase claim |
| Future Wonderful care | Clearly marked in development | Approved product scope/assets, dedicated landing/waitlist if wanted, real service/product and fulfillment. Do not create a purchase button yet |
| FIND HER | GA/IL/Northern IN selection; Choice display locator; found/not-found form UI | Actual submission receipt, durable structured reporting, deduplication, follow-up and admin view. ZIP/store/region/title/found/purchased data must be verified through receipt. Locator never proves title stock |
| Fall #2 | Physical book focus and product route; bonuses_ready false | Product description/gallery, shipping/stock; MP3, MP4, artwork delivery attached to eligible purchase; test entitlement and resend. No bonus delivery claim yet |
| FIND HER bundles / merch | Four Shopify products, homepage routes and Add to Cart observed earlier | Four product pages lacked full galleries and had placeholder copy. Confirm exact books/tote/bottle quantities, materials/size, packing, shipping weight, inventory, group price economics, and fulfillment responsibility. Use approved real product assets or clearly illustrative mockups, never false proof |
| FOUND HER @ FOTOS | Submission direction via email | Real photo upload workflow if desired, permission record, moderation, published approved gallery and store/title context. No generated customer evidence |
| FIND HER NEXT | Expansion concept preserved | Capture regional demand and define pilot evidence gate; no implied nationwide title availability |
| Join / EVE signup | Visible contact/consent UI; unchecked required permission | End-to-end submission, customer matching/consent record, welcome delivery, preference center, unsubscribe and suppression handling, deduplicated segmented sending |
| Marketing / return visits | Share/gather entry points and homepage offers | Dedicated landing routes, approved opt-in audiences, welcome/return sequences, campaign attribution, suppression, reliable analytics. Coordinate separate EVE Five outbound chat to avoid duplicate contact/campaigns |

## Priority sequence and acceptance gates
P0: Before promoting as fully operational
1. Refresh/remove expired date-specific news after source verification.
2. Ensure visible CTAs promise only what works: MTC access/gift, Garden save, EVE delivery and digital purchase must not imply unavailable service.
3. Recheck four bundle pages, inventory restrictions, Jesus full-price settings, shipping and actual fulfillment.
4. Verify each capture form reaches a controlled recipient/record and promises no undelivered content.
5. Desktop/mobile purchase and customer-support paths, navigation, accessibility, overflow and broken link check.
P1: Complete hosted operations
6. Garden Party app, database and verified transactional sender; controlled test host/save/invite/RSVP sequence.
7. Order-triggered digital delivery with entitlement checks and retries.
8. Durable FIND HER reports and permission-based photo moderation.
P2: Sustain editorial and sales
9. EVE issue/story production with sources, expiry, archive and working landing pages.
10. MY MTC and Teaching Room real destinations; coordinate approved separate source work.
11. Welcome/return campaigns with explicit consent, deduplication and delivery health.
12. Unified measurement and owner exception/reporting view.

## Continuous runtime design — TO BUILD, not active merely because scheduled chat exists
- Order paid -> check relevant product and fulfillment -> deliver eligible bonuses -> log outcome -> retry failures without duplicate messages; manual physical packing remains a business operation.
- Party saved -> passwordless host delivery -> host shares/sends invitation -> guest RSVP -> host notification -> optional guest EVE signup AFTER recorded RSVP.
- Scheduled due-date worker -> reminders, changes/cancellations and post-party follow-up, honoring transactional vs marketing permissions.
- EVE issue prepared -> validate source/date/link/asset rights -> publish through permitted content system -> send to eligible opted-in segments -> archive/expire prior issue.
- FIND HER report -> persist title/store/ZIP/outcome -> acknowledge if appropriate -> aggregate region demand; photos go to moderation until permission approved.
- Signup -> consent record -> promised welcome -> preferences -> relevant return invitations -> stop immediately on unsubscribe.
- Health worker -> inspect links, stale content, failed jobs, fulfillment failures and delivery status -> retry bounded transient failures -> send owner exception when human decision needed.
Use durable queues, idempotency, bounded retries, backups and failure visibility. Do not run customer-facing automation through four-hour chat reports.

## Automatic follow-through enabled
Task: WOC Foundation Follow-through, every four hours, America/New_York.
Task creation confirmed enabled 2026-09-15. No completed execution yet at baseline.
Task reads this ledger and current connected Shopify/GitHub/Render evidence; attempts next unblocked authorized implementation; tests and records work; reports in originating chat.
It does not enable production backend services, email sending or unrestricted MAIN theme updates. Publishing is performed by Mel in Shopify. After publication, tooling can prepare draft changes but cannot bypass MAIN restrictions.
Report delivery: this chat. Direct owner email delivery not configured by this task.
Report fields: changes since previous run, built/tested/live/operational status, verified traffic/orders/fulfilled orders/opt-ins/RSVPs/found signals where measured; UNKNOWN otherwise; blockers and next concrete action.
No need for next/continue to initiate each scheduled run. Genuine auth, missing assets, paid infrastructure or constrained publishing may still require a specific owner action.

## Next run handoff
Start with P0 destination/commerce audit using current source. Retrieve current product records and referenced sections; enumerate missing galleries/copy and direct routes. Prepare unblocked draft corrections using approved assets and exact verified product contents. Do not invent missing bundle contents or sell restricted inventory. Refresh date-specific card with verified source or prepare accurate archival framing. Preserve all other work and excluded sections. Update this ledger with evidence and exact commits/theme status.
