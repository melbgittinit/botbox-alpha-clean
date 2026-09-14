# EVE + Garden Party — Build 1

Store: Women of Color Study Bibles and More / womenofcolorstudybibles.com.
Working theme: WOC FINAL — WORKING COPY, ID 190252056874, unpublished.
The live theme was not changed or published in this pass.

## Delivered

- Five-step Garden Party planner inside the existing Shopify homepage. Native dialog, keyboard focus return, large labeled controls, responsive layouts, cream/forest-green/plum/gold styling.
- All group, gathering, mood, reason and practical-detail choices from the handoff. Date and time may remain undecided. Counts include the host, explicitly labeled.
- Controlled, deterministic plans: six foundational directions, six conversation packs, five menu tiers, five budget bands, four optional Scripture categories, checklist growth with group size, three invitation voices. The Fabulous After Fifty direction uses a neutral public title because the builder does not ask anyone's age; a host may edit the title.
- Editable title, description, budget, menu, shopping list, contribution suggestions, checklist, conversation cards and Scripture. Full plan shown without registration.
- Actual text-file download, editable invitation text, copy and native sharing. Guests are directed to reply to the host personally at this stage.
- Garden Party image cards preselect the correct group. The Sorority Sisters entry uses neutral existing imagery without organization marks.
- EVE hero now uses a clean editorial adaptation of the approved reference. The EVE Five has configurable headlines, summaries, image pickers, links, gathering questions and Scripture references.
- Configured story cards expose Read It, Send to a Sister, Save and Gather Around This. Story ID, headline, image, category, question and Scripture are passed into the planner. Story saves are explicitly browser-local, not server accounts.
- Existing approved section order retained. The Tree, Teaching Room, MTC, publishing products and lower homepage were not edited in this pass.

## Honest limits and launch gates

This is Build 1, not the complete multi-user MVP. There is no fabricated RSVP or simulated email success.

- Render workspace selection is required by the connected Render tool before inspecting existing services. Available workspace: My Workspace (tea-d9tvrijncjis73a6k5pg). The user must select it; do not assume selection.
- No database, server save, magic-link host account, email delivery, private invitation token, QR RSVP destination, reminders, dashboard or Shopify customer sync has been connected.
- No guest email or marketing permission is collected by the new planner. The existing EVE signup section is separate and unchanged.
- The EVE Five still requires approved editorial content and destination links in Shopify. Empty cards retain editorial categories, not invented news. “EVE Is Going” requires actual event selections before implementation.
- Budget values are planning targets for the whole group, not verified prices; menu portions and local costs require host review. For outings, tickets/transport require separate checking.
- Native sharing was not sent to recipients in testing. The copy action and download action were exercised. Mobile CSS is implemented, but a real-device mobile pass remains before publishing.
- Do not count this local planner or a copied invitation as a persisted “Garden Party Started.” Future started counts require a selected date, a created invitation and a sent/shared event. Completed parties require a host action.

## Next integration sequence

1. After workspace selection, inspect the existing Render application, repository, PostgreSQL service and email configuration before choosing or creating infrastructure. Keep Garden Party within the master Network experience.
2. Map Shopify routes to an authenticated app proxy or the existing integrated application. Theme files do not create `/garden-party/*` server routes by themselves.
3. Persist drafts and versioned `planJson`. Gate server save, Invite My Sisters and Send This to Me with first name, email, optional mobile, ZIP and passwordless access permission only after the full plan is shown.
4. Use short-lived one-time passwordless access links, store token hashes, authorize each host action, and separate host credentials from invitation tokens. Store the party timezone separately from local date/time.
5. Add invitations with unguessable private tokens, expiry after the event plus grace period, per-host creation limits, per-IP RSVP limits and idempotent submissions. Do not expose guest lists or addresses in public URLs or analytics.
6. Persist RSVP first. Name and response are required; email is required only for requested confirmation/reminders. Then show the separate Join EVE / Not Right Now choice, never preselected. Changing or declining marketing must not affect the RSVP.
7. Append durable consent records with channel, purpose, exact consent wording/version, timestamp and source. Match Shopify customers and apply `eve-list` only after the corresponding explicit opt-in; tags must not substitute for Shopify marketing-consent fields. Never expose marketing permissions in host views or exports.
8. Add Resend invitations, requested confirmations/reminders and host notifications with retry-safe delivery records. Marketing follow-up only for opted-in guests. Cancel scheduled delivery for cancelled/deleted events.
9. Add host dashboard, We Gathered, founding-host feedback, separate photo publication permission and aggregate funnel reporting. Avoid claiming invitation opens as certain human engagement because email privacy proxies can affect this measurement.

## Data mapping

- Member: identity/contact, location, Shopify customer ID; purpose-specific permission remains in Consent records.
- Story: source, editorial title/summary/image/category, publication/expiry, question, optional Scripture, eligibility.
- Party: host, input choices, versioned plan, local date/time/timezone, private venue details, status, timestamps.
- Invitation: party, hashed private token, expiry, recipient, delivery method, delivery status/timestamps.
- RSVP: invitation, name, coming/maybe/declined, additional count, optional food/contribution/transport notes, requested reminders, responded timestamp; one current response per invitation with update history as needed.
- Consent: member/contact, channel/purpose, value, wording/version, source/party, timestamp; append events, including withdrawal.
- Delivery/outbox and audit records: idempotency, retry status, consent eligibility at send time; no raw host/invitation tokens in logs.

## Source and verification

The authoritative uploaded files are under `theme/sections/` in this package. Only three sections were changed.
`garden-before.json` contains the pre-change server response for those sections and the homepage template.
`garden-build/plan-generator.cjs` is the tested generator. `builder.html`, `builder.css` and `builder-ui.js` are assembled with `python3 garden-build/assemble.py` into the Shopify section; do not edit the assembled generator independently.
`integrate.py` and `eve-cards.py` record one-time transformations of the saved EVE/Garden sections. Do not rerun them on already transformed files: their schema additions are not idempotent. Future edits should target the authoritative section source directly.

Checks completed:
- Shopify Liquid/schema validation of changed sections.
- Generator tests across every allowed choice plus budgets, counts, food arrangements, source-story data, dates, deterministic outputs and personalized invitations.
- Storefront flow: one-girlfriend entry preselected two women; changed to eight women, brunch, joyful, potluck, $25–50 and encouragement; verified the generated plan and contribution list.
- Edited title carried into invitation; name personalized invitation; copy succeeded; download requested; close restored page focus and scrolling; EVE Gather opened the planner; desktop dialog had no horizontal overflow.

Preview: https://womenofcolorstudybibles.com/?preview_theme_id=190252056874
