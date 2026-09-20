# WMR Plan Service

Backend for WRITE MYSELF RICH: FOR REAL.

- Signed Shopify App Proxy identity
- PostgreSQL persistence for Rich Plans
- Purchase-entitlement checks
- Evidence/history and analytics events
- BWF / VIP ME capability gates
- Health endpoint: `/health`

Render build command:
`cd wmr-plan-service && npm install`

Render start command:
`cd wmr-plan-service && npm start`

Store:
`distributorsofurbanspiritbiblesbooks-gifts.myshopify.com`

The service must receive Shopify's app proxy parameters and verify the signature before reading or writing customer-owned data.
