create table if not exists bridge_sessions (
  id uuid primary key,
  status text not null default 'active',
  stage text not null default 'welcome',
  sampler text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists bridge_opportunities (
  session_id uuid primary key references bridge_sessions(id) on delete cascade,
  organization text,
  executive_role text,
  business_gap text,
  recommended_agent text,
  primary_users jsonb not null default '[]',
  commercial_value jsonb not null default '[]',
  pilot_scope text,
  success_measures jsonb not null default '[]',
  timeline text,
  decision_authority text not null default 'unknown',
  investment_class text
);

create table if not exists bridge_consent (
  session_id uuid primary key references bridge_sessions(id) on delete cascade,
  save_brief boolean not null default false,
  share_summary boolean not null default false,
  contact_permission boolean not null default false,
  granted_at timestamptz
);

create table if not exists bridge_briefs (
  id uuid primary key,
  session_id uuid not null references bridge_sessions(id) on delete cascade,
  body jsonb not null,
  non_binding boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists bridge_handoffs (
  id uuid primary key,
  session_id uuid not null references bridge_sessions(id) on delete cascade,
  status text not null default 'pending-human-review',
  priority text not null default 'normal',
  participant jsonb not null,
  requested_at timestamptz not null default now()
);

create table if not exists bridge_audit (
  id bigserial primary key,
  session_id uuid not null references bridge_sessions(id) on delete cascade,
  event text not null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists bridge_session_snapshots (
  id uuid primary key,
  status text not null,
  stage text not null,
  snapshot jsonb not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  expires_at timestamptz not null
);

create index if not exists bridge_session_snapshots_review_idx on bridge_session_snapshots (status, updated_at desc);
create index if not exists bridge_session_snapshots_expiry_idx on bridge_session_snapshots (expires_at);

create table if not exists bridge_media_requests (
  id uuid primary key,
  status text not null default 'pending-media-review',
  request jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists bridge_media_requests_status_idx on bridge_media_requests (status, created_at desc);
create index if not exists bridge_media_requests_expiry_idx on bridge_media_requests (expires_at);
