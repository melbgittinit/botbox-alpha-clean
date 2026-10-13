-- Private enquiry storage; requests entered through the authenticated edge handler only.
create table if not exists public.media_maker_enquiries (request_id uuid primary key, reference text unique not null, payload_hash text not null, payload jsonb not null, status text not null default 'New', created_at timestamptz not null default now());
alter table public.media_maker_enquiries enable row level security;
revoke all on public.media_maker_enquiries from anon, authenticated;
grant select, insert on public.media_maker_enquiries to service_role;
