const SNAPSHOT_TABLE_SQL = `
create table if not exists bridge_session_snapshots (
  id uuid primary key,
  status text not null,
  stage text not null,
  snapshot jsonb not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  expires_at timestamptz not null
);
create index if not exists bridge_session_snapshots_review_idx
  on bridge_session_snapshots (status, updated_at desc);
create index if not exists bridge_session_snapshots_expiry_idx
  on bridge_session_snapshots (expires_at);
`;

export async function createPostgresStore(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) return null;
  const { Pool } = await import("pg");
  const pool = new Pool({
    connectionString,
    max: Number(process.env.DATABASE_POOL_MAX || 5),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: process.env.DATABASE_SSL === "require" ? { rejectUnauthorized:true } : undefined
  });
  await pool.query(SNAPSHOT_TABLE_SQL);

  return {
    mode: "postgres",
    async save(session) {
      const expiresAt = new Date(session.updated_at + 24 * 60 * 60 * 1000);
      await pool.query(
        `insert into bridge_session_snapshots (id,status,stage,snapshot,created_at,updated_at,expires_at)
         values ($1,$2,$3,$4,$5,$6,$7)
         on conflict (id) do update set status=excluded.status,stage=excluded.stage,snapshot=excluded.snapshot,updated_at=excluded.updated_at,expires_at=excluded.expires_at`,
        [session.id, session.status, session.stage, session, new Date(session.created_at), new Date(session.updated_at), expiresAt]
      );
    },
    async loadActive() {
      const result = await pool.query(`select snapshot from bridge_session_snapshots where expires_at > now() order by updated_at asc limit 500`);
      return result.rows.map(row => row.snapshot);
    },
    async deleteExpired() {
      const result = await pool.query(`delete from bridge_session_snapshots where expires_at <= now()`);
      return result.rowCount;
    },
    async health() {
      await pool.query("select 1");
      return { status:"ok", mode:"postgres" };
    },
    async close() { await pool.end(); }
  };
}
