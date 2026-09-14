BEGIN;
CREATE SCHEMA IF NOT EXISTS woc_garden;
CREATE TABLE IF NOT EXISTS woc_garden.members (
 id uuid PRIMARY KEY, email text UNIQUE NOT NULL, first_name text NOT NULL,
 mobile text NOT NULL DEFAULT '', zip_code text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS woc_garden.access_requests (
 id uuid PRIMARY KEY, token_hash text UNIQUE NOT NULL, email text NOT NULL,
 first_name text NOT NULL, mobile text NOT NULL DEFAULT '', zip_code text NOT NULL,
 plan jsonb NOT NULL, expires_at timestamptz NOT NULL,
 delivery_accepted boolean NOT NULL DEFAULT false, consumed_at timestamptz,
 permission_version text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS woc_garden.parties (
 id uuid PRIMARY KEY, host_id uuid NOT NULL REFERENCES woc_garden.members(id),
 plan jsonb NOT NULL, version integer NOT NULL DEFAULT 1,
 status text NOT NULL DEFAULT 'saved' CHECK(status IN ('saved','cancelled','gathered')),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS parties_host_idx ON woc_garden.parties(host_id);
ALTER TABLE woc_garden.access_requests ADD COLUMN IF NOT EXISTS existing_party_id uuid REFERENCES woc_garden.parties(id) ON DELETE CASCADE;
CREATE TABLE IF NOT EXISTS woc_garden.sessions (
 token_hash text PRIMARY KEY, member_id uuid NOT NULL REFERENCES woc_garden.members(id),
 party_id uuid NOT NULL REFERENCES woc_garden.parties(id) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS woc_garden.permissions (
 id uuid PRIMARY KEY, member_id uuid NOT NULL REFERENCES woc_garden.members(id),
 party_id uuid REFERENCES woc_garden.parties(id) ON DELETE SET NULL,
 purpose text NOT NULL CHECK(purpose='passwordless_host_access'),
 wording_version text NOT NULL, source text NOT NULL, recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS woc_garden.rate_limits (
 key_hash text NOT NULL, bucket bigint NOT NULL, hits integer NOT NULL,
 PRIMARY KEY(key_hash,bucket)
);
COMMIT;
