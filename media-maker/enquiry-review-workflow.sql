alter table public.media_maker_enquiries
 add column if not exists stage text not null default 'new' check(stage in ('new','reviewing','qualified','scope_prepared','quote_prepared','awaiting_response','pilot_accepted','on_hold','closed')),
 add column if not exists assigned_to text,
 add column if not exists next_action text,
 add column if not exists follow_up_at timestamptz,
 add column if not exists updated_at timestamptz not null default now(),
 add column if not exists scope jsonb,
 add column if not exists quote jsonb;
create schema if not exists media_maker_private;
revoke all on schema media_maker_private from public,anon,authenticated;
create table if not exists media_maker_private.enquiry_events(
 id bigint generated always as identity primary key,
 request_id uuid not null references public.media_maker_enquiries(request_id),
 actor text not null,
 from_stage text not null,
 to_stage text not null,
 note text not null,
 created_at timestamptz not null default now()
);
alter table media_maker_private.enquiry_events enable row level security;
revoke all on media_maker_private.enquiry_events from public,anon,authenticated,service_role;
create or replace function media_maker_private.review_enquiry(
 p_id uuid,p_stage text,p_actor text,p_note text,p_next_action text,p_follow_up timestamptz default null,p_scope jsonb default null,p_quote jsonb default null
) returns text language plpgsql security invoker set search_path=pg_catalog,public,media_maker_private as $$
declare r public.media_maker_enquiries%rowtype; allowed text[]; q jsonb; sc jsonb;
begin
 if length(trim(coalesce(p_actor,'')))<2 or length(trim(coalesce(p_note,'')))<3 or length(trim(coalesce(p_next_action,'')))<3 then raise exception 'Actor, review note and next action required';end if;
 select * into r from public.media_maker_enquiries where request_id=p_id for update;
 if not found then raise exception 'Request not found';end if;
 allowed:=case r.stage when 'new' then array['reviewing','on_hold','closed'] when 'reviewing' then array['qualified','on_hold','closed'] when 'qualified' then array['scope_prepared','on_hold','closed'] when 'scope_prepared' then array['quote_prepared','on_hold','closed'] when 'quote_prepared' then array['awaiting_response','scope_prepared','on_hold','closed'] when 'awaiting_response' then array['pilot_accepted','scope_prepared','on_hold','closed'] when 'pilot_accepted' then array['on_hold','closed'] when 'on_hold' then array['reviewing','closed'] else array[]::text[] end;
 if not p_stage=any(allowed) then raise exception 'Invalid stage transition';end if;
 sc:=coalesce(p_scope,r.scope);q:=coalesce(p_quote,r.quote);
 if p_stage in ('scope_prepared','quote_prepared','awaiting_response','pilot_accepted') and (sc is null or length(trim(coalesce(sc->>'deliverables','')))<3 or sc->>'production_mode' is distinct from 'planning_pilot') then raise exception 'Planning-pilot deliverables required; production remains on hold';end if;
 if p_stage in ('quote_prepared','awaiting_response','pilot_accepted') then
 if q is null or coalesce(q->>'currency','') !~ '^[A-Z]{3}$' or q->>'amount' is null or q->>'estimated_cost' is null or q->>'reserve' is null or (q->>'amount')::numeric<0 or (q->>'estimated_cost')::numeric<0 or (q->>'reserve')::numeric<0 or length(trim(coalesce(q->>'assumptions','')))<3 then raise exception 'Complete quote costs, currency and assumptions';end if;
 if (q->>'amount')::numeric<(q->>'estimated_cost')::numeric+(q->>'reserve')::numeric then raise exception 'Quote below entered cost and reserve';end if;
 end if;
 if p_stage='awaiting_response' and length(trim(coalesce(q->>'sent_evidence','')))<3 then raise exception 'Actual send evidence required';end if;
 if p_stage='pilot_accepted' and length(trim(coalesce(q->>'acceptance_evidence','')))<3 then raise exception 'Actual customer acceptance evidence required';end if;
 update public.media_maker_enquiries set stage=p_stage,assigned_to=trim(p_actor),next_action=trim(p_next_action),follow_up_at=p_follow_up,scope=sc,quote=q,updated_at=now() where request_id=p_id;
 insert into media_maker_private.enquiry_events(request_id,actor,from_stage,to_stage,note)values(p_id,trim(p_actor),r.stage,p_stage,trim(p_note));
 return r.reference;
end $$;
revoke all on function media_maker_private.review_enquiry(uuid,text,text,text,text,timestamptz,jsonb,jsonb) from public,anon,authenticated,service_role;
