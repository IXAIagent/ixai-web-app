-- v1.92 — Portfolio Data Model Foundation
-- Creates the future unified Portfolio Account → Asset → Position schema.
-- This migration is additive only and does not modify existing v1.80-v1.81 tables.

create table if not exists public.portfolio_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  provider text not null default 'MANUAL',
  region text not null default 'GLOBAL',
  account_type text not null default 'manual',
  currency text not null default 'USD',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint portfolio_accounts_provider_check check (
    provider in ('MANUAL', 'CSV', 'CTBC', 'FUBON', 'YUANTA', 'IBKR', 'FIRSTRRADE', 'BINANCE', 'BYBIT', 'OKX')
  ),
  constraint portfolio_accounts_region_check check (
    region in ('TW', 'HK', 'CN', 'JP', 'KR', 'US', 'EU', 'GLOBAL')
  ),
  constraint portfolio_accounts_account_type_check check (
    account_type in ('manual', 'bank', 'brokerage', 'crypto_exchange', 'structured_product')
  )
);

create table if not exists public.portfolio_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.portfolio_accounts(id) on delete cascade,
  symbol text not null,
  name text not null,
  category text not null,
  region text not null default 'GLOBAL',
  currency text not null default 'USD',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint portfolio_assets_category_check check (
    category in ('FCN', 'STOCK', 'CRYPTO', 'GRID', 'DUAL', 'CASH')
  ),
  constraint portfolio_assets_region_check check (
    region in ('TW', 'HK', 'CN', 'JP', 'KR', 'US', 'EU', 'GLOBAL')
  )
);

create table if not exists public.portfolio_positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_id uuid not null references public.portfolio_assets(id) on delete cascade,
  quantity numeric not null default 0,
  cost_basis numeric,
  market_value numeric,
  unrealized_pnl numeric,
  unrealized_pnl_pct numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolio_accounts_user_id_idx
  on public.portfolio_accounts(user_id);

create index if not exists portfolio_accounts_provider_idx
  on public.portfolio_accounts(provider);

create index if not exists portfolio_accounts_is_active_idx
  on public.portfolio_accounts(is_active);

create index if not exists portfolio_assets_user_id_idx
  on public.portfolio_assets(user_id);

create index if not exists portfolio_assets_account_id_idx
  on public.portfolio_assets(account_id);

create index if not exists portfolio_assets_category_idx
  on public.portfolio_assets(category);

create index if not exists portfolio_assets_symbol_idx
  on public.portfolio_assets(symbol);

create index if not exists portfolio_positions_user_id_idx
  on public.portfolio_positions(user_id);

create index if not exists portfolio_positions_asset_id_idx
  on public.portfolio_positions(asset_id);

alter table public.portfolio_accounts enable row level security;
alter table public.portfolio_assets enable row level security;
alter table public.portfolio_positions enable row level security;

create policy "portfolio_accounts_select_own"
  on public.portfolio_accounts
  for select
  using (user_id = auth.uid());

create policy "portfolio_accounts_insert_own"
  on public.portfolio_accounts
  for insert
  with check (user_id = auth.uid());

create policy "portfolio_accounts_update_own"
  on public.portfolio_accounts
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "portfolio_accounts_delete_own"
  on public.portfolio_accounts
  for delete
  using (user_id = auth.uid());

create policy "portfolio_assets_select_own"
  on public.portfolio_assets
  for select
  using (user_id = auth.uid());

create policy "portfolio_assets_insert_own"
  on public.portfolio_assets
  for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.portfolio_accounts account
      where account.id = account_id
        and account.user_id = auth.uid()
    )
  );

create policy "portfolio_assets_update_own"
  on public.portfolio_assets
  for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.portfolio_accounts account
      where account.id = account_id
        and account.user_id = auth.uid()
    )
  );

create policy "portfolio_assets_delete_own"
  on public.portfolio_assets
  for delete
  using (user_id = auth.uid());

create policy "portfolio_positions_select_own"
  on public.portfolio_positions
  for select
  using (user_id = auth.uid());

create policy "portfolio_positions_insert_own"
  on public.portfolio_positions
  for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.portfolio_assets asset
      where asset.id = asset_id
        and asset.user_id = auth.uid()
    )
  );

create policy "portfolio_positions_update_own"
  on public.portfolio_positions
  for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.portfolio_assets asset
      where asset.id = asset_id
        and asset.user_id = auth.uid()
    )
  );

create policy "portfolio_positions_delete_own"
  on public.portfolio_positions
  for delete
  using (user_id = auth.uid());
