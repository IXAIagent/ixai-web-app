-- v1.80.3 — FCN Input MVP
-- FCN position storage only. No pricing, AI monitoring, or recommendation logic.

create extension if not exists pgcrypto;

create table if not exists public.fcn_positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  name text not null,
  issuer text,
  currency text not null default 'USD',
  notional_amount numeric,
  coupon_rate_pct numeric,
  ko_pct numeric,
  ki_pct numeric,
  strike_pct numeric,
  start_date date,
  maturity_date date,
  status text not null default 'active',
  observation_schedule jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fcn_positions_name_not_blank_check check (length(btrim(name)) > 0),
  constraint fcn_positions_currency_check check (currency in ('USD', 'TWD', 'USDT')),
  constraint fcn_positions_status_check check (status in ('active', 'matured', 'called', 'archived')),
  constraint fcn_positions_observation_schedule_array_check check (jsonb_typeof(observation_schedule) = 'array'),
  constraint fcn_positions_metadata_object_check check (jsonb_typeof(metadata) = 'object'),
  constraint fcn_positions_notional_non_negative_check check (notional_amount is null or notional_amount >= 0),
  constraint fcn_positions_coupon_non_negative_check check (coupon_rate_pct is null or coupon_rate_pct >= 0),
  constraint fcn_positions_ko_non_negative_check check (ko_pct is null or ko_pct >= 0),
  constraint fcn_positions_ki_non_negative_check check (ki_pct is null or ki_pct >= 0),
  constraint fcn_positions_strike_non_negative_check check (strike_pct is null or strike_pct >= 0)
);

create table if not exists public.fcn_underlyings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  fcn_position_id uuid not null references public.fcn_positions(id) on delete cascade,
  symbol text not null,
  name text,
  market text,
  initial_price numeric,
  current_price numeric,
  ki_price numeric,
  ko_price numeric,
  strike_price numeric,
  weight_pct numeric,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fcn_underlyings_symbol_not_blank_check check (length(btrim(symbol)) > 0),
  constraint fcn_underlyings_metadata_object_check check (jsonb_typeof(metadata) = 'object'),
  constraint fcn_underlyings_initial_price_non_negative_check check (initial_price is null or initial_price >= 0),
  constraint fcn_underlyings_current_price_non_negative_check check (current_price is null or current_price >= 0),
  constraint fcn_underlyings_ki_price_non_negative_check check (ki_price is null or ki_price >= 0),
  constraint fcn_underlyings_ko_price_non_negative_check check (ko_price is null or ko_price >= 0),
  constraint fcn_underlyings_strike_price_non_negative_check check (strike_price is null or strike_price >= 0),
  constraint fcn_underlyings_weight_non_negative_check check (weight_pct is null or weight_pct >= 0)
);

create index if not exists fcn_positions_user_id_idx
  on public.fcn_positions (user_id);

create index if not exists fcn_positions_portfolio_id_idx
  on public.fcn_positions (portfolio_id);

create index if not exists fcn_positions_status_idx
  on public.fcn_positions (status);

create index if not exists fcn_positions_maturity_date_idx
  on public.fcn_positions (maturity_date);

create index if not exists fcn_underlyings_user_id_idx
  on public.fcn_underlyings (user_id);

create index if not exists fcn_underlyings_fcn_position_id_idx
  on public.fcn_underlyings (fcn_position_id);

create index if not exists fcn_underlyings_symbol_idx
  on public.fcn_underlyings (symbol);

create or replace function public.set_fcn_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_fcn_positions_updated_at on public.fcn_positions;
create trigger set_fcn_positions_updated_at
before update on public.fcn_positions
for each row
execute function public.set_fcn_updated_at();

drop trigger if exists set_fcn_underlyings_updated_at on public.fcn_underlyings;
create trigger set_fcn_underlyings_updated_at
before update on public.fcn_underlyings
for each row
execute function public.set_fcn_updated_at();

alter table public.fcn_positions enable row level security;
alter table public.fcn_underlyings enable row level security;

drop policy if exists "IXAI FCN positions are readable by owner" on public.fcn_positions;
create policy "IXAI FCN positions are readable by owner"
on public.fcn_positions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "IXAI FCN positions are insertable by owner portfolio" on public.fcn_positions;
create policy "IXAI FCN positions are insertable by owner portfolio"
on public.fcn_positions
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.portfolios
    where portfolios.id = fcn_positions.portfolio_id
      and portfolios.user_id = auth.uid()
  )
);

drop policy if exists "IXAI FCN positions are updatable by owner portfolio" on public.fcn_positions;
create policy "IXAI FCN positions are updatable by owner portfolio"
on public.fcn_positions
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.portfolios
    where portfolios.id = fcn_positions.portfolio_id
      and portfolios.user_id = auth.uid()
  )
);

drop policy if exists "IXAI FCN positions are deletable by owner" on public.fcn_positions;
create policy "IXAI FCN positions are deletable by owner"
on public.fcn_positions
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "IXAI FCN underlyings are readable by owner" on public.fcn_underlyings;
create policy "IXAI FCN underlyings are readable by owner"
on public.fcn_underlyings
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "IXAI FCN underlyings are insertable by owner position" on public.fcn_underlyings;
create policy "IXAI FCN underlyings are insertable by owner position"
on public.fcn_underlyings
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.fcn_positions
    where fcn_positions.id = fcn_underlyings.fcn_position_id
      and fcn_positions.user_id = auth.uid()
  )
);

drop policy if exists "IXAI FCN underlyings are updatable by owner position" on public.fcn_underlyings;
create policy "IXAI FCN underlyings are updatable by owner position"
on public.fcn_underlyings
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.fcn_positions
    where fcn_positions.id = fcn_underlyings.fcn_position_id
      and fcn_positions.user_id = auth.uid()
  )
);

drop policy if exists "IXAI FCN underlyings are deletable by owner" on public.fcn_underlyings;
create policy "IXAI FCN underlyings are deletable by owner"
on public.fcn_underlyings
for delete
to authenticated
using (auth.uid() = user_id);

revoke all on public.fcn_positions from anon;
revoke all on public.fcn_underlyings from anon;
grant select, insert, update, delete on public.fcn_positions to authenticated;
grant select, insert, update, delete on public.fcn_underlyings to authenticated;

comment on table public.fcn_positions is
  'IXAI v1.80.3 FCN monitoring position storage. This is not a recommendation or trading table.';

comment on table public.fcn_underlyings is
  'IXAI v1.80.3 FCN underlying storage scoped to user-owned FCN positions.';
