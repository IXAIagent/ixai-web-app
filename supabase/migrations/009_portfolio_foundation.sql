-- v1.80.2 — Portfolio CRUD Foundation
-- App-owned portfolio container only. Asset-position tables are intentionally
-- deferred to later v1.80 phases.

create extension if not exists pgcrypto;

create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  base_currency text not null default 'USD',
  description text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint portfolios_name_not_blank_check check (length(btrim(name)) > 0),
  constraint portfolios_base_currency_check check (base_currency in ('USD', 'TWD', 'USDT')),
  constraint portfolios_status_check check (status in ('active', 'archived'))
);

create index if not exists portfolios_user_id_idx
  on public.portfolios (user_id);

create index if not exists portfolios_status_idx
  on public.portfolios (status);

create index if not exists portfolios_created_at_idx
  on public.portfolios (created_at desc);

create index if not exists portfolios_user_status_created_at_idx
  on public.portfolios (user_id, status, created_at desc);

create or replace function public.set_portfolios_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_portfolios_updated_at on public.portfolios;

create trigger set_portfolios_updated_at
before update on public.portfolios
for each row
execute function public.set_portfolios_updated_at();

alter table public.portfolios enable row level security;

drop policy if exists "IXAI portfolios are readable by owner" on public.portfolios;
create policy "IXAI portfolios are readable by owner"
on public.portfolios
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "IXAI portfolios are insertable by owner" on public.portfolios;
create policy "IXAI portfolios are insertable by owner"
on public.portfolios
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "IXAI portfolios are updatable by owner" on public.portfolios;
create policy "IXAI portfolios are updatable by owner"
on public.portfolios
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "IXAI portfolios are deletable by owner" on public.portfolios;
create policy "IXAI portfolios are deletable by owner"
on public.portfolios
for delete
to authenticated
using (auth.uid() = user_id);

revoke all on public.portfolios from anon;
grant select, insert, update, delete on public.portfolios to authenticated;

comment on table public.portfolios is
  'IXAI v1.80.2 App-owned portfolio containers. Positions and monitoring data are added in later phases.';
