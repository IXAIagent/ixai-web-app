-- V11.40 manual split — Phase 01
-- Create new Workspace database tables only.
--
-- REVIEW REQUIRED BEFORE PRODUCTION EXECUTION.
-- Run in staging first. Do not run through automated deployment.
-- This file intentionally avoids ALTER statements against existing production tables.
--
-- ON DELETE CASCADE notes:
-- - workspace_members are deleted when their workspace is deleted.
-- - watchlists, watchlist_items, alert_history, and workspace_audit_logs are
--   deleted when their workspace is deleted.
-- - owner/user cascades are intentionally explicit and must be accepted before
--   production execution. If production user deletion should preserve records,
--   change owner/user foreign keys to ON DELETE SET NULL before running.

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

comment on table public.workspaces is
  'IXAI V11.40 workspace ownership foundation. Manual production review required.';
comment on table public.workspace_members is
  'IXAI V11.40 workspace membership foundation. Read-only until controlled write activation.';
comment on table public.fcn_coupon_schedules is
  'IXAI V11.40 FCN schedule persistence foundation. No pricing, tax, recommendation, or trading behavior.';
comment on table public.watchlists is
  'IXAI V11.40 watchlist persistence foundation. Monitoring only.';
comment on table public.watchlist_items is
  'IXAI V11.40 watchlist item persistence foundation. Monitoring only.';
comment on table public.alert_history is
  'IXAI V11.40 alert history foundation. No delivery or trading behavior.';
comment on table public.workspace_audit_logs is
  'IXAI V11.40 workspace audit log readiness foundation. No external delivery.';
