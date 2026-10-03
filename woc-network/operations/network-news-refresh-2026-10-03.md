# Network Today — news refresh repair
Reviewed October 3, 2026. Scope: top homepage news and read-only FIND HER connection review. The Tree excluded.

## Current verified evidence
- Shopify connection: Women of Color Study Bibles and More, womenofcolorstudybibles.com.
- Current MAIN theme: 191419154730. Earlier ledger theme roles are stale.
- MAIN templates/index.json checksum: 22f9a04ccb257fd2950716aa37433d4c.
- MAIN sections/network-today.liquid checksum: 163d7be68ab3ad2892ed69f6aca6efbf.
- News is manually configured in four section blocks, edition September 15, 2026.
- Headline, lead image and source credit all use block.settings.link, currently external publishers.
- Blog the-network / 125658923306 exists. Its only article (618796941610, Tyler Perry Is Doing Life His Way — Again) is unpublished.
- Masthead LIVE indicator is CSS animation with date/time display, not editorial-job health.
- Source branch woc-garden-party-alpha still at b3d8d44547442838b4bcf26773e58cfbb9eef4bf before this report.
- No dedicated WOC news publishing task was present in returned task list. Other Render services exist; their presence alone does not establish a WOC publisher.

## Implementation contract — to build, not deployed
1. Preserve the approved news layout. Replace manual news block dependency with a selected Shopify blog feed. Use the-network blog unless fresh inspection finds a newer approved implementation.
2. Render latest five published approved Network articles. Headlines and primary images open the internal article URL. Sources remain separate attributed links in each article.
3. Article package: unique slug; original headline/deck/body; category; event date and source publication dates; verification timestamp; sources; approved image and rights/provenance; editor status; published date; related internal story; return-to-Network link.
4. Original means independently written synthesis and useful context for Black readers, with Black women central. Do not call synthesis original firsthand reporting. Do not lightly paraphrase one publisher or invent interviews.
5. Daily candidate discovery and verification; target one refreshed edition every 24 hours, maximum intended gap 48 hours. Select by relevance and significance, not quota. Mix culture, people, money/opportunity, community/family, faith, sport and health where genuinely newsworthy.
6. Publication sequence: research -> dedupe against existing coverage -> write -> check facts, source dates, rights and links -> stage -> publish eligible articles -> read back public pages -> update successful-edition record. Unverified stories remain drafts. Sensitive/high-stakes disputed claims require review.
7. Theme reads content dynamically, so routine editions do not require theme republishes. Initial theme integration remains an unpublished draft for owner publication.
8. Indicator uses last verified successful edition, not current clock: green/current within 24 hours, dated previous edition from 24–48 hours, neutral/previous edition after 48 hours. Always show last actual update text; no invented timestamp. A pending/error job does not refresh the date. Respect reduced motion and non-color labels.
9. Keep published archive and correction history. Retries must not duplicate stories; use edition ID and source/topic identifiers. A failed new edition must preserve prior articles and show their true age.
10. Store-scoped publishing credentials, a real scheduler, durable job/edition records, bounded retries and owner failure notices must be connected and exercised. A chat progress report is not a publisher.
11. Acceptance: verify first edition internally, homepage and article links on mobile/desktop, archive, stale state and failed-job behavior; then observe a second scheduled edition update without owner typing continue.

## FIND HER — preserve presentation, verify connections
Current homepage section is unchanged. Native Shopify contact form sends campaign FIND HER with title, email, region, store, ZIP, found/not-found, purchase and story fields.
Current enabled tasks:
- Find Her Request Routing: reads Gmail campaign messages containing I Cannot Find Her; dedupes to Airtable appzVYp583qg9oLCB / tblwXG9zLXpI1DDo9, permission-gated forwarding, replies.
- Find Her Email Report: reports to owner from the same Airtable base and Gmail evidence.
Task configuration and last-run timestamps verify scheduling, not actual receipt, sending or results.
Potential integration gap: homepage campaign FIND HER differs from routing search I Cannot Find Her. Do not assume homepage reports are ingested.
Remaining acceptance:
- Controlled homepage and campaign-page submission -> actual recipient receipt -> exactly one queue record, including both found/not-found paths.
- Separate explicit permission before any external forwarding. Homepage generic privacy text is not proof of sharing permission.
- Verify confirmation/acknowledgement and missing-detail handling.
- Photos: publication permission, moderation and approved authentic proof only.
- Attribute campaign visits and purchases with confirmed source records; external retailer/Amazon sales are not automatically measurable.
- Bundle stock linkage, actual packed weights and fulfillment remain verification items from prior ledger, not newly reconfirmed defects.
No FIND HER edits, campaign sends, theme changes or publication performed in this review.

## Next implementation
Build and validate the blog-fed news section and freshness indicator against freshly read current theme. Prepare first verified original edition. Configure the actual publisher only with verified store identity, available credentials and cost authorization if required. Avoid overwriting other chats' newer theme work. Do not restore the old general foundation task as a substitute for newsroom operation.
