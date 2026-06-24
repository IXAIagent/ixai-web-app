-- V11.40 manual split — Phase 05
-- Post-migration validation queries.
--
-- These queries are read-only. Run after Phases 01-04 in staging first.

-- 1. Verify tables exist.
select table_schema, table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'workspaces',
    'workspace_members',
    'portfolios',
    'portfolio_positions',
    'stock_positions',
    'crypto_positions',
    'fcn_positions',
    'fcn_underlyings',
    'fcn_coupon_schedules',
    'watchlists',
    'watchlist_items',
    'alert_history',
    'workspace_audit_logs'
  )
order by table_name;

-- 2. Verify added columns.
select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'portfolios',
    'portfolio_positions',
    'stock_positions',
    'crypto_positions',
    'fcn_positions',
    'fcn_underlyings'
  )
  and column_name in (
    'workspace_id',
    'owner_id',
    'symbol',
    'asset_class',
    'source_status',
    'metadata'
  )
order by table_name, column_name;

-- 3. Verify indexes exist.
select schemaname, tablename, indexname
from pg_indexes
where schemaname = 'public'
  and indexname in (
    'workspaces_owner_id_idx',
    'workspaces_created_at_idx',
    'workspace_members_workspace_id_idx',
    'workspace_members_user_id_idx',
    'workspace_members_role_idx',
    'portfolios_workspace_id_idx',
    'portfolios_owner_id_idx',
    'portfolio_positions_workspace_id_idx',
    'portfolio_positions_owner_id_idx',
    'portfolio_positions_symbol_idx',
    'portfolio_positions_created_at_idx',
    'stock_positions_workspace_id_idx',
    'stock_positions_owner_id_idx',
    'crypto_positions_workspace_id_idx',
    'crypto_positions_owner_id_idx',
    'fcn_positions_workspace_id_idx',
    'fcn_positions_owner_id_idx',
    'fcn_underlyings_workspace_id_idx',
    'fcn_underlyings_owner_id_idx',
    'fcn_coupon_schedules_workspace_id_idx',
    'fcn_coupon_schedules_owner_id_idx',
    'fcn_coupon_schedules_fcn_position_id_idx',
    'fcn_coupon_schedules_coupon_date_idx',
    'fcn_coupon_schedules_created_at_idx',
    'watchlists_workspace_id_idx',
    'watchlists_owner_id_idx',
    'watchlists_created_at_idx',
    'watchlist_items_workspace_id_idx',
    'watchlist_items_owner_id_idx',
    'watchlist_items_symbol_idx',
    'watchlist_items_created_at_idx',
    'alert_history_workspace_id_idx',
    'alert_history_owner_id_idx',
    'alert_history_dedupe_key_idx',
    'alert_history_created_at_idx',
    'workspace_audit_logs_workspace_id_idx',
    'workspace_audit_logs_owner_id_idx',
    'workspace_audit_logs_created_at_idx'
  )
order by tablename, indexname;

-- 4. Verify RLS enabled on new V11 tables.
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'workspaces',
    'workspace_members',
    'fcn_coupon_schedules',
    'watchlists',
    'watchlist_items',
    'alert_history',
    'workspace_audit_logs'
  )
order by c.relname;

-- 5. Verify policies on new V11 tables.
select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'workspaces',
    'workspace_members',
    'fcn_coupon_schedules',
    'watchlists',
    'watchlist_items',
    'alert_history',
    'workspace_audit_logs'
  )
order by tablename, policyname;

-- 6. Verify foreign keys.
select
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name as foreign_table_name,
  ccu.column_name as foreign_column_name
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
 and tc.table_schema = kcu.table_schema
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
 and ccu.table_schema = tc.table_schema
where tc.constraint_type = 'FOREIGN KEY'
  and tc.table_schema = 'public'
  and tc.table_name in (
    'workspaces',
    'workspace_members',
    'portfolios',
    'portfolio_positions',
    'stock_positions',
    'crypto_positions',
    'fcn_positions',
    'fcn_underlyings',
    'fcn_coupon_schedules',
    'watchlists',
    'watchlist_items',
    'alert_history',
    'workspace_audit_logs'
  )
order by tc.table_name, tc.constraint_name;

-- 7. Verify row counts on new V11 tables.
select 'workspaces' as table_name, count(*) from public.workspaces
union all select 'workspace_members', count(*) from public.workspace_members
union all select 'fcn_coupon_schedules', count(*) from public.fcn_coupon_schedules
union all select 'watchlists', count(*) from public.watchlists
union all select 'watchlist_items', count(*) from public.watchlist_items
union all select 'alert_history', count(*) from public.alert_history
union all select 'workspace_audit_logs', count(*) from public.workspace_audit_logs;

-- 8. Basic select smoke checks.
select id, owner_id, name, status, created_at from public.workspaces limit 5;
select id, workspace_id, user_id, role, status, created_at from public.workspace_members limit 5;
select id, workspace_id, owner_id, name, status, created_at from public.watchlists limit 5;
select id, workspace_id, owner_id, symbol, asset_type, created_at from public.watchlist_items limit 5;
select id, workspace_id, owner_id, dedupe_key, severity, created_at from public.alert_history limit 5;
select id, workspace_id, owner_id, action, module, created_at from public.workspace_audit_logs limit 5;
