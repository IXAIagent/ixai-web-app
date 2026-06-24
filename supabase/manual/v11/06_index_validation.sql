-- V11.51 manual split — Phase 06
-- Index validation after Phase 03 or Phase 03b.
--
-- Read-only validation. This file does not create, alter, or drop indexes.

with expected_indexes(indexname) as (
  values
    ('workspaces_owner_id_idx'),
    ('workspaces_created_at_idx'),
    ('workspace_members_workspace_id_idx'),
    ('workspace_members_user_id_idx'),
    ('workspace_members_role_idx'),
    ('portfolios_workspace_id_idx'),
    ('portfolios_owner_id_idx'),
    ('portfolio_positions_workspace_id_idx'),
    ('portfolio_positions_owner_id_idx'),
    ('portfolio_positions_symbol_idx'),
    ('portfolio_positions_created_at_idx'),
    ('stock_positions_workspace_id_idx'),
    ('stock_positions_owner_id_idx'),
    ('crypto_positions_workspace_id_idx'),
    ('crypto_positions_owner_id_idx'),
    ('fcn_positions_workspace_id_idx'),
    ('fcn_positions_owner_id_idx'),
    ('fcn_underlyings_workspace_id_idx'),
    ('fcn_underlyings_owner_id_idx'),
    ('fcn_coupon_schedules_workspace_id_idx'),
    ('fcn_coupon_schedules_owner_id_idx'),
    ('fcn_coupon_schedules_fcn_position_id_idx'),
    ('fcn_coupon_schedules_coupon_date_idx'),
    ('fcn_coupon_schedules_created_at_idx'),
    ('watchlists_workspace_id_idx'),
    ('watchlists_owner_id_idx'),
    ('watchlists_created_at_idx'),
    ('watchlist_items_workspace_id_idx'),
    ('watchlist_items_owner_id_idx'),
    ('watchlist_items_symbol_idx'),
    ('watchlist_items_created_at_idx'),
    ('alert_history_workspace_id_idx'),
    ('alert_history_owner_id_idx'),
    ('alert_history_dedupe_key_idx'),
    ('alert_history_created_at_idx'),
    ('workspace_audit_logs_workspace_id_idx'),
    ('workspace_audit_logs_owner_id_idx'),
    ('workspace_audit_logs_created_at_idx')
)
select
  expected_indexes.indexname,
  case when pg_indexes.indexname is null then 'missing' else 'present' end as status,
  pg_indexes.tablename,
  pg_indexes.indexdef
from expected_indexes
left join pg_indexes
  on pg_indexes.schemaname = 'public'
 and pg_indexes.indexname = expected_indexes.indexname
order by expected_indexes.indexname;

-- Summary count. Expected missing_count = 0.
with expected_indexes(indexname) as (
  values
    ('workspaces_owner_id_idx'),
    ('workspaces_created_at_idx'),
    ('workspace_members_workspace_id_idx'),
    ('workspace_members_user_id_idx'),
    ('workspace_members_role_idx'),
    ('portfolios_workspace_id_idx'),
    ('portfolios_owner_id_idx'),
    ('portfolio_positions_workspace_id_idx'),
    ('portfolio_positions_owner_id_idx'),
    ('portfolio_positions_symbol_idx'),
    ('portfolio_positions_created_at_idx'),
    ('stock_positions_workspace_id_idx'),
    ('stock_positions_owner_id_idx'),
    ('crypto_positions_workspace_id_idx'),
    ('crypto_positions_owner_id_idx'),
    ('fcn_positions_workspace_id_idx'),
    ('fcn_positions_owner_id_idx'),
    ('fcn_underlyings_workspace_id_idx'),
    ('fcn_underlyings_owner_id_idx'),
    ('fcn_coupon_schedules_workspace_id_idx'),
    ('fcn_coupon_schedules_owner_id_idx'),
    ('fcn_coupon_schedules_fcn_position_id_idx'),
    ('fcn_coupon_schedules_coupon_date_idx'),
    ('fcn_coupon_schedules_created_at_idx'),
    ('watchlists_workspace_id_idx'),
    ('watchlists_owner_id_idx'),
    ('watchlists_created_at_idx'),
    ('watchlist_items_workspace_id_idx'),
    ('watchlist_items_owner_id_idx'),
    ('watchlist_items_symbol_idx'),
    ('watchlist_items_created_at_idx'),
    ('alert_history_workspace_id_idx'),
    ('alert_history_owner_id_idx'),
    ('alert_history_dedupe_key_idx'),
    ('alert_history_created_at_idx'),
    ('workspace_audit_logs_workspace_id_idx'),
    ('workspace_audit_logs_owner_id_idx'),
    ('workspace_audit_logs_created_at_idx')
)
select
  count(*) as expected_index_count,
  count(pg_indexes.indexname) as present_index_count,
  count(*) - count(pg_indexes.indexname) as missing_index_count
from expected_indexes
left join pg_indexes
  on pg_indexes.schemaname = 'public'
 and pg_indexes.indexname = expected_indexes.indexname;
