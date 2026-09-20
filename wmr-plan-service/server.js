import crypto from 'node:crypto';
import express from 'express';
import pg from 'pg';

const { Pool } = pg;
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '256kb' }));

const PORT = Number(process.env.PORT || 10000);
const DATABASE_URL = process.env.DATABASE_URL || '';
const SHOPIFY_APP_SECRET = process.env.SHOPIFY_APP_SECRET || '';
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '';
const SHOPIFY_SHOP_DOMAIN = process.env.SHOPIFY_SHOP_DOMAIN || 'distributorsofurbanspiritbiblesbooks-gifts.myshopify.com';
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2026-07';
const APP_PROXY_REQUIRED = String(process.env.APP_PROXY_REQUIRED || 'true').toLowerCase() !== 'false';
const APP_PROXY_MAX_AGE_SECONDS = Number(process.env.APP_PROXY_MAX_AGE_SECONDS || 300);

const productVariants = {
  wmrBase: process.env.WMR_BASE_VARIANT_ID || 'gid://shopify/ProductVariant/52360538423589',
  forReal: process.env.WMR_FOR_REAL_VARIANT_ID || 'gid://shopify/ProductVariant/53873614192933',
  bwfPassport: process.env.BWF_PASSPORT_VARIANT_ID || 'gid://shopify/ProductVariant/53873614520613',
  vipMe: process.env.VIP_ME_VARIANT_ID || 'gid://shopify/ProductVariant/53770826809637'
};

if (!DATABASE_URL) throw new Error('DATABASE_URL is required');
const pool = new Pool({ connectionString: DATABASE_URL, max: 8, idleTimeoutMillis: 30000 });

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS wmr_plans (
      shop_domain TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      plan_state JSONB NOT NULL DEFAULT '{}'::jsonb,
      version INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (shop_domain, customer_id)
    );
    CREATE TABLE IF NOT EXISTS wmr_events (
      id BIGSERIAL PRIMARY KEY,
      shop_domain TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      event_name TEXT NOT NULL,
      event_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_wmr_events_owner_created
      ON wmr_events (shop_domain, customer_id, created_at DESC);
    CREATE TABLE IF NOT EXISTS wmr_entitlement_cache (
      shop_domain TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      entitlements JSONB NOT NULL DEFAULT '{}'::jsonb,
      checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (shop_domain, customer_id)
    );
  `);
}

function safeEqualHex(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}

function verifyAppProxy(originalUrl) {
  if (!SHOPIFY_APP_SECRET) return { ok: false, reason: 'missing_secret' };
  const url = new URL(originalUrl, 'https://wmr.invalid');
  const signature = url.searchParams.get('signature') || '';
  const grouped = new Map();
  for (const [key, value] of url.searchParams.entries()) {
    if (key === 'signature') continue;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(value);
  }
  const message = [...grouped.entries()]
    .map(([key, values]) => `${key}=${values.join(',')}`)
    .sort()
    .join('');
  const expected = crypto.createHmac('sha256', SHOPIFY_APP_SECRET).update(message).digest('hex');
  if (!safeEqualHex(signature, expected)) return { ok: false, reason: 'bad_signature' };

  const timestamp = Number(url.searchParams.get('timestamp') || 0);
  const age = Math.abs(Math.floor(Date.now() / 1000) - timestamp);
  if (!timestamp || age > APP_PROXY_MAX_AGE_SECONDS) return { ok: false, reason: 'stale_request' };

  const shop = url.searchParams.get('shop') || '';
  const customerId = url.searchParams.get('logged_in_customer_id') || '';
  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop)) return { ok: false, reason: 'bad_shop' };
  if (SHOPIFY_SHOP_DOMAIN && shop !== SHOPIFY_SHOP_DOMAIN) return { ok: false, reason: 'wrong_shop' };
  if (!/^\d+$/.test(customerId)) return { ok: false, reason: 'login_required', shop };
  return { ok: true, shop, customerId };
}

function proxyIdentity(req, res, next) {
  if (!APP_PROXY_REQUIRED && req.headers['x-wmr-dev-customer']) {
    req.identity = {
      shop: SHOPIFY_SHOP_DOMAIN || 'dev.myshopify.com',
      customerId: String(req.headers['x-wmr-dev-customer'])
    };
    return next();
  }
  const verified = verifyAppProxy(req.originalUrl);
  if (!verified.ok) {
    const status = verified.reason === 'login_required' ? 401 : 403;
    return res.status(status).json({ ok: false, error: verified.reason });
  }
  req.identity = { shop: verified.shop, customerId: verified.customerId };
  next();
}

function cleanPlan(input) {
  const allowed = [
    'day','listens','richStatement','metricName','current','target','richDate','why','risk',
    'next30','next90','next365','weekly','circle','evidence','history','bwfInsights'
  ];
  const out = {};
  for (const key of allowed) if (Object.prototype.hasOwnProperty.call(input || {}, key)) out[key] = input[key];
  const json = JSON.stringify(out);
  if (json.length > 200000) throw new Error('plan_too_large');
  return out;
}

async function shopifyGraphql(query, variables = {}) {
  if (!SHOPIFY_ADMIN_ACCESS_TOKEN || !SHOPIFY_SHOP_DOMAIN) throw new Error('shopify_admin_not_configured');
  const response = await fetch(`https://${SHOPIFY_SHOP_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN
    },
    body: JSON.stringify({ query, variables })
  });
  const body = await response.json();
  if (!response.ok || body.errors) throw new Error(`shopify_graphql_error:${JSON.stringify(body.errors || body)}`);
  return body.data;
}

async function readEntitlements(customerId) {
  const query = `query WmrOrders($query: String!, $after: String) {
    orders(first: 50, after: $after, query: $query, reverse: true) {
      nodes {
        id
        displayFinancialStatus
        lineItems(first: 100) {
          nodes { variant { id } }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }`;
  const purchased = new Set();
  let after = null;
  let pages = 0;
  do {
    const data = await shopifyGraphql(query, {
      query: `customer_id:${customerId} financial_status:paid`,
      after
    });
    for (const order of data.orders.nodes || []) {
      for (const item of order.lineItems.nodes || []) if (item.variant?.id) purchased.add(item.variant.id);
    }
    after = data.orders.pageInfo?.hasNextPage ? data.orders.pageInfo.endCursor : null;
    pages += 1;
  } while (after && pages < 10);
  return {
    wmrBase: purchased.has(productVariants.wmrBase),
    forReal: purchased.has(productVariants.forReal),
    bwfPassport: purchased.has(productVariants.bwfPassport),
    vipMe: purchased.has(productVariants.vipMe)
  };
}

function capabilities(entitlements = {}) {
  return {
    persistentPlan: Boolean(entitlements.forReal),
    richCircleSync: Boolean(entitlements.forReal),
    evidenceSync: Boolean(entitlements.forReal),
    bwfPassport: Boolean(entitlements.bwfPassport),
    vipMe: Boolean(entitlements.vipMe)
  };
}

async function cachedEntitlements(shop, customerId, force = false) {
  const cached = await pool.query(
    'SELECT entitlements, checked_at FROM wmr_entitlement_cache WHERE shop_domain=$1 AND customer_id=$2',
    [shop, customerId]
  );
  const prior = cached.rows[0]?.entitlements || {};
  if (!force && cached.rows[0]) {
    const ageMs = Date.now() - new Date(cached.rows[0].checked_at).getTime();
    if (ageMs < 5 * 60 * 1000) return prior;
  }
  const fresh = await readEntitlements(customerId);
  const entitlements = {
    wmrBase: Boolean(prior.wmrBase || fresh.wmrBase),
    forReal: Boolean(prior.forReal || fresh.forReal),
    bwfPassport: Boolean(prior.bwfPassport || fresh.bwfPassport),
    vipMe: Boolean(prior.vipMe || fresh.vipMe)
  };
  await pool.query(
    `INSERT INTO wmr_entitlement_cache (shop_domain, customer_id, entitlements, checked_at)
     VALUES ($1,$2,$3::jsonb,now())
     ON CONFLICT (shop_domain, customer_id)
     DO UPDATE SET entitlements=EXCLUDED.entitlements, checked_at=now()`,
    [shop, customerId, JSON.stringify(entitlements)]
  );
  return entitlements;
}

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, service: 'wmr-plan-service' });
  } catch {
    res.status(503).json({ ok: false });
  }
});

const router = express.Router();
router.use(proxyIdentity);

router.get('/state', async (req, res) => {
  const { shop, customerId } = req.identity;
  const entitlements = await cachedEntitlements(shop, customerId);
  if (!entitlements.forReal) return res.status(403).json({ ok: false, error: 'for_real_required', entitlements, capabilities: capabilities(entitlements) });
  const result = await pool.query(
    'SELECT plan_state, version, updated_at FROM wmr_plans WHERE shop_domain=$1 AND customer_id=$2',
    [shop, customerId]
  );
  if (!result.rows[0]) return res.json({ ok: true, exists: false, state: null });
  res.json({ ok: true, exists: true, state: result.rows[0].plan_state, version: result.rows[0].version, updatedAt: result.rows[0].updated_at });
});

router.put('/state', async (req, res) => {
  const { shop, customerId } = req.identity;
  const entitlements = await cachedEntitlements(shop, customerId);
  if (!entitlements.forReal) return res.status(403).json({ ok: false, error: 'for_real_required', entitlements, capabilities: capabilities(entitlements) });
  let state;
  try { state = cleanPlan(req.body?.state); } catch (error) { return res.status(400).json({ ok: false, error: error.message }); }
  const result = await pool.query(
    `INSERT INTO wmr_plans (shop_domain, customer_id, plan_state, version, created_at, updated_at)
     VALUES ($1,$2,$3::jsonb,1,now(),now())
     ON CONFLICT (shop_domain, customer_id)
     DO UPDATE SET plan_state=EXCLUDED.plan_state, version=wmr_plans.version+1, updated_at=now()
     RETURNING version, updated_at`,
    [shop, customerId, JSON.stringify(state)]
  );
  res.json({ ok: true, version: result.rows[0].version, updatedAt: result.rows[0].updated_at });
});

router.post('/events', async (req, res) => {
  const { shop, customerId } = req.identity;
  const eventName = String(req.body?.eventName || '').trim().slice(0, 80);
  if (!/^[a-z0-9_.:-]{2,80}$/i.test(eventName)) return res.status(400).json({ ok: false, error: 'invalid_event_name' });
  const payload = req.body?.payload && typeof req.body.payload === 'object' ? req.body.payload : {};
  await pool.query(
    'INSERT INTO wmr_events (shop_domain, customer_id, event_name, event_payload) VALUES ($1,$2,$3,$4::jsonb)',
    [shop, customerId, eventName, JSON.stringify(payload)]
  );
  res.json({ ok: true });
});

router.get('/entitlements', async (req, res) => {
  const { shop, customerId } = req.identity;
  try {
    const entitlements = await cachedEntitlements(shop, customerId, req.query.refresh === '1');
    res.json({ ok: true, entitlements, capabilities: capabilities(entitlements) });
  } catch (error) {
    res.status(503).json({ ok: false, error: 'entitlement_check_unavailable' });
  }
});

app.use('/api', router);
app.use('/proxy/api', router);
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ ok: false, error: 'server_error' });
});

await initDb();
app.listen(PORT, '0.0.0.0', () => console.log(`WMR plan service listening on ${PORT}`));
