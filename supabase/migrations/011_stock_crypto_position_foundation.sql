-- v1.80.4 — Stock / Crypto Input MVP
-- Position storage only. No live pricing, AI monitoring, broker, or trading logic.

create extension if not exists pgcrypto;

create table if not exists public.stock_positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  symbol text not null,
  name text,
  market text not null default 'US',
  currency text not null default 'USD',
  quantity numeric not null default 0,
  average_cost numeric,
  current_price numeric,
  position_type text not null default 'equity',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stock_positions_symbol_not_blank_check check (length(btrim(symbol)) > 0),
  constraint stock_positions_market_check check (market in ('US', 'TW', 'HK', 'JP', 'OTHER')),
  constraint stock_positions_currency_check check (currency in ('USD', 'TWD', 'USDT', 'HKD', 'JPY')),
  constraint stock_positions_type_check check (position_type in ('equity', 'etf', 'other')),
  constraint stock_positions_status_check check (status in ('active', 'closed', 'archived')),
  constraint stock_positions_metadata_object_check check (jsonb_typeof(metadata) = 'object'),
  constraint stock_positions_quantity_non_negative_check check (quantity >= 0),
  constraint stock_positions_average_cost_non_negative_check check (average_cost is null or average_cost >= 0),
  constraint stock_positions_current_price_non_negative_check check (current_price is null or current_price >= 0)
);

create table if not exists public.crypto_positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  symbol text not null,
  name text,
  exchange text,
  currency text not null default 'USDT',
  quantity numeric not null default 0,
  average_cost numeric,
  current_price numeric,
  position_type text not null default 'spot',
  strategy_type text not null default 'holding',
  leverage numeric,
  grid_lower_price numeric,
  grid_upper_price numeric,
  grid_count integer,
  dual_target_price numeric,
  dual_settlement_date date,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crypto_positions_symbol_not_blank_check check (length(btrim(symbol)) > 0),
  constraint crypto_positions_currency_check check (currency in ('USD', 'TWD', 'USDT', 'HKD', 'JPY')),
  constraint crypto_positions_type_check check (position_type in ('spot', 'futures', 'grid', 'dual', 'other')),
  constraint crypto_positions_strategy_check check (strategy_type in ('holding', 'grid', 'dual', 'futures_grid', 'other')),
  constraint crypto_positions_status_check check (status in ('active', 'closed', 'archived')),
  constraint crypto_positions_metadata_object_check check (jsonb_typeof(metadata) = 'object'),
  constraint crypto_positions_quantity_non_negative_check check (quantity >= 0),
  constraint crypto_positions_average_cost_non_negative_check check (average_cost is null or average_cost >= 0),
  constraint crypto_positions_current_price_non_negative_check check (current_price is null or current_price >= 0),
  constraint crypto_positions_leverage_non_negative_check check (leverage is null or leverage >= 0),
  constraint crypto_positions_grid_lower_non_negative_check check (grid_lower_price is null or grid_lower_price >= 0),
  constraint crypto_positions_grid_upper_non_negative_check check (grid_upper_price is null or grid_upper_price >= 0),
  constraint crypto_positions_grid_count_non_negative_check check (grid_count is null or grid_count >= 0),
  constraint crypto_positions_dual_target_non_negative_check check (dual_target_price is null or dual_target_price >= 0)
);

create index if not exists stock_positions_user_id_idx
  on public.stock_positions (user_id);

create index if not exists stock_positions_portfolio_id_idx
  on public.stock_positions (portfolio_id);

create index if not exists stock_positions_symbol_idx
  on public.stock_positions (symbol);

create index if not exists stock_positions_status_idx
  on public.stock_positions (status);

create index if not exists stock_positions_market_idx
  on public.stock_positions (market);

create index if not exists stock_positions_created_at_idx
  on public.stock_positions (created_at desc);

create index if not exists crypto_positions_user_id_idx
  on public.crypto_positions (user_id);

create index if not exists crypto_positions_portfolio_id_idx
  on public.crypto_positions (portfolio_id);

create index if not exists crypto_positions_symbol_idx
  on public.crypto_positions (symbol);

create index if not exists crypto_positions_status_idx
  on public.crypto_positions (status);

create index if not exists crypto_positions_exchange_idx
  on public.crypto_positions (exchange);

create index if not exists crypto_positions_created_at_idx
  on public.crypto_positions (created_at desc);

create or replace function public.set_position_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_stock_positions_updated_at on public.stock_positions;
create trigger set_stock_positions_updated_at
before update on public.stock_positions
for each row
execute function public.set_position_updated_at();

drop trigger if exists set_crypto_positions_updated_at on public.crypto_positions;
create trigger set_crypto_positions_updated_at
before update on public.crypto_positions
for each row
execute function public.set_position_updated_at();

alter table public.stock_positions enable row level security;
alter table public.crypto_positions enable row level security;

drop policy if exists "IXAI stock positions are readable by owner" on public.stock_positions;
create policy "IXAI stock positions are readable by owner"
on public.stock_positions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "IXAI stock positions are insertable by owner portfolio" on public.stock_positions;
create policy "IXAI stock positions are insertable by owner portfolio"
on public.stock_positions
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.portfolios
    where portfolios.id = stock_positions.portfolio_id
      and portfolios.user_id = auth.uid()
  )
);

drop policy if exists "IXAI stock positions are updatable by owner portfolio" on public.stock_positions;
create policy "IXAI stock positions are updatable by owner portfolio"
on public.stock_positions
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.portfolios
    where portfolios.id = stock_positions.portfolio_id
      and portfolios.user_id = auth.uid()
  )
);

drop policy if exists "IXAI stock positions are deletable by owner" on public.stock_positions;
create policy "IXAI stock positions are deletable by owner"
on public.stock_positions
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "IXAI crypto positions are readable by owner" on public.crypto_positions;
create policy "IXAI crypto positions are readable by owner"
on public.crypto_positions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "IXAI crypto positions are insertable by owner portfolio" on public.crypto_positions;
create policy "IXAI crypto positions are insertable by owner portfolio"
on public.crypto_positions
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.portfolios
    where portfolios.id = crypto_positions.portfolio_id
      and portfolios.user_id = auth.uid()
  )
);

drop policy if exists "IXAI crypto positions are updatable by owner portfolio" on public.crypto_positions;
create policy "IXAI crypto positions are updatable by owner portfolio"
on public.crypto_positions
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.portfolios
    where portfolios.id = crypto_positions.portfolio_id
      and portfolios.user_id = auth.uid()
  )
);

drop policy if exists "IXAI crypto positions are deletable by owner" on public.crypto_positions;
create policy "IXAI crypto positions are deletable by owner"
on public.crypto_positions
for delete
to authenticated
using (auth.uid() = user_id);

revoke all on public.stock_positions from anon;
revoke all on public.crypto_positions from anon;
grant select, insert, update, delete on public.stock_positions to authenticated;
grant select, insert, update, delete on public.crypto_positions to authenticated;

comment on table public.stock_positions is
  'IXAI v1.80.4 stock / ETF position storage for monitoring only. No recommendation or trading behavior.';

comment on table public.crypto_positions is
  'IXAI v1.80.4 crypto position storage, including grid / dual monitoring fields. No automated trading behavior.';
