-- V11.10 — Database Activation Foundation
-- REVIEW REQUIRED BEFORE PRODUCTION APPLICATION.
--
-- This migration is prepared for database activation readiness only. It must
-- be reviewed, staged, backed up, and validated before any remote execution.
-- Do not run against production automatically.
--
-- Scope:
-- - Workspace ownership / membership tables
-- - Additive workspace linkage for existing portfolio / FCN / stock / crypto tables
-- - Future watchlist, alert history, FCN coupon schedule, and audit log tables
-- - Conservative owner-scoped RLS drafts following existing project style

create extension if not exists pgcrypto;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'IXAI Workspace',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspaces_status_check check (status in ('active', 'archived')),
  constraint workspaces_metadata_object_check check (jsonb_typeof(metadata) = 'object')
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner',
  status text not null default 'active',
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspace_members_role_check check (role in ('owner', 'admin', 'editor', 'viewer')),
  constraint workspace_members_status_check check (status in ('active', 'invited', 'disabled', 'archived')),
  constraint workspace_members_unique_user_workspace unique (workspace_id, user_id)
);

-- Existing production tables are extended additively and safely. Columns remain
-- nullable for review/backfill before any future NOT NULL enforcement.
alter table if exists public.portfolios
  add column if not exists workspace_id uuid references public.workspaces(id) on delete set null,
  add column if not exists owner_id uuid references auth.users(id) on delete cascade;

alter table if exists public.portfolio_positions
  add column if not exists workspace_id uuid references public.workspaces(id) on delete set null,
  add column if not exists owner_id uuid references auth.users(id) on delete cascade,
  add column if not exists symbol text,
  add column if not exists asset_class text,
  add column if not exists source_status text not null default 'persisted',
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table if exists public.stock_positions
  add column if not exists workspace_id uuid references public.workspaces(id) on delete set null,
  add column if not exists owner_id uuid references auth.users(id) on delete cascade;

alter table if exists public.crypto_positions
  add column if not exists workspace_id uuid references public.workspaces(id) on delete set null,
  add column if not exists owner_id uuid references auth.users(id) on delete cascade;

alter table if exists public.fcn_positions
  add column if not exists workspace_id uuid references public.workspaces(id) on delete set null,
  add column if not exists owner_id uuid references auth.users(id) on delete cascade;

alter table if exists public.fcn_underlyings
  add column if not exists workspace_id uuid references public.workspaces(id) on delete set null,
  add column if not exists owner_id uuid references auth.users(id) on delete cascade;

create table if not exists public.fcn_coupon_schedules (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete set null,
  owner_id uuid references auth.users(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  fcn_position_id uuid not null references public.fcn_positions(id) on delete cascade,
  observation_date date,
  coupon_date date,
  payment_date date,
  maturity_date date,
  expected_coupon_amount numeric,
  currency text,
  event_type text not null default 'coupon',
  source_status text not null default 'persisted',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fcn_coupon_schedules_event_type_check check (
    event_type in ('coupon', 'observation', 'ko_observation', 'maturity', 'unknown')
  ),
  constraint fcn_coupon_schedules_metadata_object_check check (jsonb_typeof(metadata) = 'object')
);

create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  owner_id uuid references auth.users(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null default 'Default Watchlist',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint watchlists_status_check check (status in ('active', 'archived')),
  constraint watchlists_metadata_object_check check (jsonb_typeof(metadata) = 'object')
);

create table if not exists public.watchlist_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  owner_id uuid references auth.users(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  watchlist_id uuid references public.watchlists(id) on delete cascade,
  symbol text not null,
  name text,
  asset_type text not null default 'unknown',
  target_price numeric,
  alert_above numeric,
  alert_below numeric,
  note text,
  source_status text not null default 'persisted',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint watchlist_items_asset_type_check check (asset_type in ('stock', 'crypto', 'fcn_candidate', 'unknown')),
  constraint watchlist_items_symbol_not_blank_check check (length(btrim(symbol)) > 0),
  constraint watchlist_items_metadata_object_check check (jsonb_typeof(metadata) = 'object')
);

create table if not exists public.alert_history (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  owner_id uuid references auth.users(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  dedupe_key text,
  title text not null,
  message text,
  severity text not null default 'info',
  category text not null default 'unknown',
  source_engine text not null default 'alert_engine',
  source_status text not null default 'persisted',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint alert_history_severity_check check (severity in ('info', 'warning', 'high', 'critical')),
  constraint alert_history_metadata_object_check check (jsonb_typeof(metadata) = 'object')
);

create table if not exists public.workspace_audit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  owner_id uuid references auth.users(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  module text not null default 'workspace',
  target_table text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint workspace_audit_logs_metadata_object_check check (jsonb_typeof(metadata) = 'object')
);

create index if not exists workspaces_owner_id_idx on public.workspaces(owner_id);
create index if not exists workspaces_created_at_idx on public.workspaces(created_at desc);

create index if not exists workspace_members_workspace_id_idx on public.workspace_members(workspace_id);
create index if not exists workspace_members_user_id_idx on public.workspace_members(user_id);
create index if not exists workspace_members_role_idx on public.workspace_members(role);

create index if not exists portfolios_workspace_id_idx on public.portfolios(workspace_id);
create index if not exists portfolios_owner_id_idx on public.portfolios(owner_id);

create index if not exists portfolio_positions_workspace_id_idx on public.portfolio_positions(workspace_id);
create index if not exists portfolio_positions_owner_id_idx on public.portfolio_positions(owner_id);
create index if not exists portfolio_positions_symbol_idx on public.portfolio_positions(symbol);
create index if not exists portfolio_positions_created_at_idx on public.portfolio_positions(created_at desc);

create index if not exists stock_positions_workspace_id_idx on public.stock_positions(workspace_id);
create index if not exists stock_positions_owner_id_idx on public.stock_positions(owner_id);

create index if not exists crypto_positions_workspace_id_idx on public.crypto_positions(workspace_id);
create index if not exists crypto_positions_owner_id_idx on public.crypto_positions(owner_id);

create index if not exists fcn_positions_workspace_id_idx on public.fcn_positions(workspace_id);
create index if not exists fcn_positions_owner_id_idx on public.fcn_positions(owner_id);

create index if not exists fcn_underlyings_workspace_id_idx on public.fcn_underlyings(workspace_id);
create index if not exists fcn_underlyings_owner_id_idx on public.fcn_underlyings(owner_id);

create index if not exists fcn_coupon_schedules_workspace_id_idx on public.fcn_coupon_schedules(workspace_id);
create index if not exists fcn_coupon_schedules_owner_id_idx on public.fcn_coupon_schedules(owner_id);
create index if not exists fcn_coupon_schedules_fcn_position_id_idx on public.fcn_coupon_schedules(fcn_position_id);
create index if not exists fcn_coupon_schedules_coupon_date_idx on public.fcn_coupon_schedules(coupon_date);
create index if not exists fcn_coupon_schedules_created_at_idx on public.fcn_coupon_schedules(created_at desc);

create index if not exists watchlists_workspace_id_idx on public.watchlists(workspace_id);
create index if not exists watchlists_owner_id_idx on public.watchlists(owner_id);
create index if not exists watchlists_created_at_idx on public.watchlists(created_at desc);

create index if not exists watchlist_items_workspace_id_idx on public.watchlist_items(workspace_id);
create index if not exists watchlist_items_owner_id_idx on public.watchlist_items(owner_id);
create index if not exists watchlist_items_symbol_idx on public.watchlist_items(symbol);
create index if not exists watchlist_items_created_at_idx on public.watchlist_items(created_at desc);

create index if not exists alert_history_workspace_id_idx on public.alert_history(workspace_id);
create index if not exists alert_history_owner_id_idx on public.alert_history(owner_id);
create index if not exists alert_history_dedupe_key_idx on public.alert_history(dedupe_key);
create index if not exists alert_history_created_at_idx on public.alert_history(created_at desc);

create index if not exists workspace_audit_logs_workspace_id_idx on public.workspace_audit_logs(workspace_id);
create index if not exists workspace_audit_logs_owner_id_idx on public.workspace_audit_logs(owner_id);
create index if not exists workspace_audit_logs_created_at_idx on public.workspace_audit_logs(created_at desc);

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.fcn_coupon_schedules enable row level security;
alter table public.watchlists enable row level security;
alter table public.watchlist_items enable row level security;
alter table public.alert_history enable row level security;
alter table public.workspace_audit_logs enable row level security;

drop policy if exists "IXAI workspaces readable by owner" on public.workspaces;
create policy "IXAI workspaces readable by owner"
on public.workspaces for select to authenticated
using (auth.uid() = owner_id);

drop policy if exists "IXAI workspaces insertable by owner" on public.workspaces;
create policy "IXAI workspaces insertable by owner"
on public.workspaces for insert to authenticated
with check (auth.uid() = owner_id);

drop policy if exists "IXAI workspace members readable by member" on public.workspace_members;
create policy "IXAI workspace members readable by member"
on public.workspace_members for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "IXAI FCN coupon schedules readable by owner" on public.fcn_coupon_schedules;
create policy "IXAI FCN coupon schedules readable by owner"
on public.fcn_coupon_schedules for select to authenticated
using (auth.uid() = owner_id or auth.uid() = user_id);

drop policy if exists "IXAI watchlists readable by owner" on public.watchlists;
create policy "IXAI watchlists readable by owner"
on public.watchlists for select to authenticated
using (auth.uid() = owner_id or auth.uid() = user_id);

drop policy if exists "IXAI watchlist items readable by owner" on public.watchlist_items;
create policy "IXAI watchlist items readable by owner"
on public.watchlist_items for select to authenticated
using (auth.uid() = owner_id or auth.uid() = user_id);

drop policy if exists "IXAI alert history readable by owner" on public.alert_history;
create policy "IXAI alert history readable by owner"
on public.alert_history for select to authenticated
using (auth.uid() = owner_id or auth.uid() = user_id);

drop policy if exists "IXAI workspace audit logs readable by owner" on public.workspace_audit_logs;
create policy "IXAI workspace audit logs readable by owner"
on public.workspace_audit_logs for select to authenticated
using (auth.uid() = owner_id or auth.uid() = actor_id);

revoke all on public.workspaces from anon;
revoke all on public.workspace_members from anon;
revoke all on public.fcn_coupon_schedules from anon;
revoke all on public.watchlists from anon;
revoke all on public.watchlist_items from anon;
revoke all on public.alert_history from anon;
revoke all on public.workspace_audit_logs from anon;

grant select, insert, update on public.workspaces to authenticated;
grant select on public.workspace_members to authenticated;
grant select on public.fcn_coupon_schedules to authenticated;
grant select on public.watchlists to authenticated;
grant select on public.watchlist_items to authenticated;
grant select on public.alert_history to authenticated;
grant select on public.workspace_audit_logs to authenticated;

comment on table public.workspaces is
  'IXAI V11.10 workspace ownership foundation. Review before production migration.';
comment on table public.workspace_members is
  'IXAI V11.10 workspace membership foundation. Read-only until controlled write activation.';
comment on table public.fcn_coupon_schedules is
  'IXAI V11.10 FCN schedule persistence foundation. No pricing, tax, recommendation, or trading behavior.';
comment on table public.watchlists is
  'IXAI V11.10 watchlist persistence foundation. Monitoring only.';
comment on table public.watchlist_items is
  'IXAI V11.10 watchlist item persistence foundation. Monitoring only.';
comment on table public.alert_history is
  'IXAI V11.10 alert history foundation. No delivery or trading behavior.';
comment on table public.workspace_audit_logs is
  'IXAI V11.10 workspace audit log readiness foundation. No external delivery.';
