-- V11.40 manual split — Phase 03
-- Create production-safe indexes.
--
-- IMPORTANT:
-- This file uses CREATE INDEX CONCURRENTLY and must NOT be run inside a transaction.
-- Do not wrap this file in BEGIN/COMMIT.
-- Some SQL runners wrap statements automatically; use a runner that supports
-- non-transactional concurrent index creation.

create index concurrently if not exists workspaces_owner_id_idx on public.workspaces(owner_id);
create index concurrently if not exists workspaces_created_at_idx on public.workspaces(created_at desc);

create index concurrently if not exists workspace_members_workspace_id_idx on public.workspace_members(workspace_id);
create index concurrently if not exists workspace_members_user_id_idx on public.workspace_members(user_id);
create index concurrently if not exists workspace_members_role_idx on public.workspace_members(role);

create index concurrently if not exists portfolios_workspace_id_idx on public.portfolios(workspace_id);
create index concurrently if not exists portfolios_owner_id_idx on public.portfolios(owner_id);

create index concurrently if not exists portfolio_positions_workspace_id_idx on public.portfolio_positions(workspace_id);
create index concurrently if not exists portfolio_positions_owner_id_idx on public.portfolio_positions(owner_id);
create index concurrently if not exists portfolio_positions_symbol_idx on public.portfolio_positions(symbol);
create index concurrently if not exists portfolio_positions_created_at_idx on public.portfolio_positions(created_at desc);

create index concurrently if not exists stock_positions_workspace_id_idx on public.stock_positions(workspace_id);
create index concurrently if not exists stock_positions_owner_id_idx on public.stock_positions(owner_id);

create index concurrently if not exists crypto_positions_workspace_id_idx on public.crypto_positions(workspace_id);
create index concurrently if not exists crypto_positions_owner_id_idx on public.crypto_positions(owner_id);

create index concurrently if not exists fcn_positions_workspace_id_idx on public.fcn_positions(workspace_id);
create index concurrently if not exists fcn_positions_owner_id_idx on public.fcn_positions(owner_id);

create index concurrently if not exists fcn_underlyings_workspace_id_idx on public.fcn_underlyings(workspace_id);
create index concurrently if not exists fcn_underlyings_owner_id_idx on public.fcn_underlyings(owner_id);

create index concurrently if not exists fcn_coupon_schedules_workspace_id_idx on public.fcn_coupon_schedules(workspace_id);
create index concurrently if not exists fcn_coupon_schedules_owner_id_idx on public.fcn_coupon_schedules(owner_id);
create index concurrently if not exists fcn_coupon_schedules_fcn_position_id_idx on public.fcn_coupon_schedules(fcn_position_id);
create index concurrently if not exists fcn_coupon_schedules_coupon_date_idx on public.fcn_coupon_schedules(coupon_date);
create index concurrently if not exists fcn_coupon_schedules_created_at_idx on public.fcn_coupon_schedules(created_at desc);

create index concurrently if not exists watchlists_workspace_id_idx on public.watchlists(workspace_id);
create index concurrently if not exists watchlists_owner_id_idx on public.watchlists(owner_id);
create index concurrently if not exists watchlists_created_at_idx on public.watchlists(created_at desc);

create index concurrently if not exists watchlist_items_workspace_id_idx on public.watchlist_items(workspace_id);
create index concurrently if not exists watchlist_items_owner_id_idx on public.watchlist_items(owner_id);
create index concurrently if not exists watchlist_items_symbol_idx on public.watchlist_items(symbol);
create index concurrently if not exists watchlist_items_created_at_idx on public.watchlist_items(created_at desc);

create index concurrently if not exists alert_history_workspace_id_idx on public.alert_history(workspace_id);
create index concurrently if not exists alert_history_owner_id_idx on public.alert_history(owner_id);
create index concurrently if not exists alert_history_dedupe_key_idx on public.alert_history(dedupe_key);
create index concurrently if not exists alert_history_created_at_idx on public.alert_history(created_at desc);

create index concurrently if not exists workspace_audit_logs_workspace_id_idx on public.workspace_audit_logs(workspace_id);
create index concurrently if not exists workspace_audit_logs_owner_id_idx on public.workspace_audit_logs(owner_id);
create index concurrently if not exists workspace_audit_logs_created_at_idx on public.workspace_audit_logs(created_at desc);
