-- V11.40 manual split — Phase 02
-- Add nullable Workspace linkage columns to existing production tables.
--
-- REVIEW REQUIRED BEFORE PRODUCTION EXECUTION.
-- Run in staging first.
--
-- Safety notes:
-- - This file avoids NOT NULL DEFAULT columns on existing large tables.
-- - source_status and metadata on portfolio_positions are added nullable first.
-- - Defaults / NOT NULL constraints should be applied only after table-size,
--   lock, and backfill review.
-- - owner_id foreign keys use ON DELETE SET NULL in this production-safe split
--   to avoid deleting existing portfolio/position rows if an auth user is
--   removed later.

alter table if exists public.portfolios
  add column if not exists workspace_id uuid references public.workspaces(id) on delete set null,
  add column if not exists owner_id uuid references auth.users(id) on delete set null;

alter table if exists public.portfolio_positions
  add column if not exists workspace_id uuid references public.workspaces(id) on delete set null,
  add column if not exists owner_id uuid references auth.users(id) on delete set null,
  add column if not exists symbol text,
  add column if not exists asset_class text,
  add column if not exists source_status text,
  add column if not exists metadata jsonb;

alter table if exists public.stock_positions
  add column if not exists workspace_id uuid references public.workspaces(id) on delete set null,
  add column if not exists owner_id uuid references auth.users(id) on delete set null;

alter table if exists public.crypto_positions
  add column if not exists workspace_id uuid references public.workspaces(id) on delete set null,
  add column if not exists owner_id uuid references auth.users(id) on delete set null;

alter table if exists public.fcn_positions
  add column if not exists workspace_id uuid references public.workspaces(id) on delete set null,
  add column if not exists owner_id uuid references auth.users(id) on delete set null;

alter table if exists public.fcn_underlyings
  add column if not exists workspace_id uuid references public.workspaces(id) on delete set null,
  add column if not exists owner_id uuid references auth.users(id) on delete set null;

comment on column public.portfolio_positions.source_status is
  'Nullable V11.40 source status. Backfill/default/NOT NULL require separate production lock review.';
comment on column public.portfolio_positions.metadata is
  'Nullable V11.40 metadata JSON. Backfill/default/NOT NULL require separate production lock review.';
