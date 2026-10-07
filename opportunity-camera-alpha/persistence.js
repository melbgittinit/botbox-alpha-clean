import pg from 'pg';
const { Pool } = pg;

let pool = null;
let ready = false;

export function persistenceConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export async function initPersistence() {
  if (!persistenceConfigured()) return false;
  if (ready && pool) return true;
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized:false } : undefined,
    max: 4,
    idleTimeoutMillis: 30000
  });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS opportunity_bag_items (
      id BIGSERIAL PRIMARY KEY,
      member_ref TEXT NOT NULL,
      path_key TEXT NOT NULL,
      offer_key TEXT NOT NULL,
      offer_name TEXT NOT NULL,
      environment_key TEXT,
      difficulty TEXT,
      action_text TEXT,
      note_text TEXT,
      status TEXT NOT NULL DEFAULT 'saved',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(member_ref, path_key, offer_key)
    );
    CREATE INDEX IF NOT EXISTS idx_opportunity_bag_member
      ON opportunity_bag_items(member_ref, updated_at DESC);

    CREATE TABLE IF NOT EXISTS opportunity_events (
      id BIGSERIAL PRIMARY KEY,
      member_ref TEXT,
      event_type TEXT NOT NULL,
      path_key TEXT,
      offer_key TEXT,
      environment_key TEXT,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_opportunity_events_member
      ON opportunity_events(member_ref, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_opportunity_events_type
      ON opportunity_events(event_type, created_at DESC);
  `);
  ready = true;
  return true;
}

async function db() {
  if (!persistenceConfigured()) return null;
  if (!ready) await initPersistence();
  return pool;
}

export async function saveBagItem(item) {
  const client = await db(); if (!client) return null;
  const r = await client.query(`
    INSERT INTO opportunity_bag_items
      (member_ref,path_key,offer_key,offer_name,environment_key,difficulty,action_text,note_text,status)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'saved')
    ON CONFLICT(member_ref,path_key,offer_key)
    DO UPDATE SET
      offer_name=EXCLUDED.offer_name,
      environment_key=EXCLUDED.environment_key,
      difficulty=EXCLUDED.difficulty,
      action_text=EXCLUDED.action_text,
      note_text=COALESCE(EXCLUDED.note_text,opportunity_bag_items.note_text),
      status='saved',
      updated_at=NOW()
    RETURNING *`,
    [item.memberRef,item.pathKey,item.offerKey,item.offerName,item.environmentKey||null,
     item.difficulty||null,item.action||null,item.note||null]
  );
  return r.rows[0];
}

export async function listBagItems(memberRef) {
  const client = await db(); if (!client) return null;
  const r = await client.query(
    'SELECT * FROM opportunity_bag_items WHERE member_ref=$1 ORDER BY updated_at DESC LIMIT 100',
    [memberRef]
  );
  return r.rows;
}

export async function removeBagItem(memberRef,id) {
  const client = await db(); if (!client) return null;
  const r = await client.query(
    'DELETE FROM opportunity_bag_items WHERE id=$1 AND member_ref=$2 RETURNING id',
    [id,memberRef]
  );
  return r.rows[0] || null;
}

export async function logOpportunityEvent(event) {
  try {
    const client = await db(); if (!client) return false;
    await client.query(`
      INSERT INTO opportunity_events
        (member_ref,event_type,path_key,offer_key,environment_key,metadata)
      VALUES ($1,$2,$3,$4,$5,$6::jsonb)`,
      [event.memberRef||null,event.eventType,event.pathKey||null,event.offerKey||null,
       event.environmentKey||null,JSON.stringify(event.metadata||{})]
    );
    return true;
  } catch (error) {
    console.error('opportunity_event_persist_failed',error?.message || error);
    return false;
  }
}
