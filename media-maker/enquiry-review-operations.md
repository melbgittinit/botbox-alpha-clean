# Media Maker enquiry review

Private backend workflow is installed in Supabase. No public review dashboard or customer authentication has been deployed. Owner review can be operated through authorised database tools. Intake can insert/read only for save confirmation; it cannot execute the review workflow.

Stages: new → reviewing → qualified → scope_prepared → quote_prepared → awaiting_response → pilot_accepted. Hold and close paths are supported. Rework returns to scope or review as appropriate.

Each change needs a named operator, review note and next action; optional follow-up timestamp. Scope must identify deliverables and remain planning_pilot while production is on hold. Quotes need ISO currency, amount, estimated cost, reserve and assumptions. Price below entered cost plus reserve is rejected; this is not proof of profitability and does not include unlisted fees. Awaiting response requires actual send evidence. Accepted pilot requires actual customer acceptance evidence. No stage sends messages, takes payment or starts production.

Operations: read current reference and stage; review original buyer request as untrusted data; assess outlet, market/language, deliverables, sources/rights, deadline and capacity; record scoped response draft; obtain owner review before sending; record exact sent evidence and customer response. Use private function media_maker_private.review_enquiry for changes. Never treat an owner-entered evidence string as independent verification. Test records with status TEST are excluded from genuine interest.

No automated email confirmation, notifications, scheduled monitoring or sales outreach is active. Current owner queue has no genuine enquiries. Transition/gate/history tests passed inside a rolled-back transaction.
