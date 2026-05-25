-- IXAI v1.37.1 Membership Foundation
-- Service-role only membership/entitlement foundation. No public anon access.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'ixai_membership_plan') then
    create type public.ixai_membership_plan as enum ('free', 'pro', 'enterprise');
  end if;

  if not exists (select 1 from pg_type where typname = 'ixai_membership_status') then
    create type public.ixai_membership_status as enum ('active', 'expired', 'cancelled', 'trial');
  end if;
end $$;

create table if not exists public.ixai_memberships (
  id uuid primary key default gen_random_uuid(),
  normalized_email text not null unique,
  plan public.ixai_membership_plan not null default 'free',
  status public.ixai_membership_status not null default 'active',
  started_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists ixai_memberships_status_idx
  on public.ixai_memberships (status);

create index if not exists ixai_memberships_expires_at_idx
  on public.ixai_memberships (expires_at);

create or replace function public.set_ixai_memberships_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_ixai_memberships_updated_at on public.ixai_memberships;
create trigger set_ixai_memberships_updated_at
before update on public.ixai_memberships
for each row
execute function public.set_ixai_memberships_updated_at();

alter table public.ixai_memberships enable row level security;

revoke all on public.ixai_memberships from anon;
revoke all on public.ixai_memberships from authenticated;
grant all on public.ixai_memberships to service_role;

comment on table public.ixai_memberships is
  'IXAI membership entitlement foundation. Server-side service-role writes only; no public anon access.';
