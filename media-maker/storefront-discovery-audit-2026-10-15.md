# Storefront audit — October 15, 2026

Public checks, no authenticated storefront assumption:
- /pages/media-maker and /pages/media-maker-studio return 200; both include hero-loop.mp4 and working studio links.
- Homepage and /collections/all returned no media-maker hyperlinks in inspected HTML. This is not proof that every catalogue page was checked.
- /products/media-maker-editorial-pilot returns 404. Paid pilot was deliberately left DRAFT; no claim of purchasability is valid.
- Render /api/writing-status returns enabled:false. Actual writing generation is not operational. Other local draft templates remain separate.
- Shopify connector currently resolves to Women of Color Study Bibles and More (352883.myshopify.com), not The Bot Stores. Its empty Media Maker results must not be interpreted as deletion from Bot Stores. No writes made to WOC.

Correction: page URLs being public did not establish discoverability, a catalogue listing, functioning generation or payment. Earlier up-and-running wording overstated readiness.

Required corrections: restore Bot Stores admin connection; inspect actual Explore All Bots route; add Media Maker entry to correct catalogue and navigation/homepage in latest review theme as appropriate; distinguish enquiry/planning pilot from automated production; connect and test writer; test paid checkout only after cost and fulfilment readiness. No unsolicited checkout activation.
