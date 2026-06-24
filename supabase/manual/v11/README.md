# V11.40 Manual Migration Split

This folder contains production-safe manual SQL files split from `supabase/migrations/013_v11_database_activation_foundation.sql`.

No remote migration has been executed by this task.

## Required Run Order

1. `01_create_new_workspace_tables.sql`
2. `02_add_nullable_workspace_columns.sql`
3. Index creation, choose one:
   - Preferred CLI / non-transaction runner: `03_create_indexes_concurrently.sql`
   - Supabase SQL Editor compatible: `03b_create_indexes_sql_editor_compatible.sql`
4. `04_enable_rls_and_policies.sql`
5. `05_post_migration_validation.sql`
6. Optional index-only validation: `06_index_validation.sql`

## Operator Rules

- Backup the target Supabase database before running anything.
- Run all phases in staging first.
- Do not run all files blindly.
- Review every `ON DELETE CASCADE` relationship before production.
- Keep V11 write guards disabled until validation passes.
- Do not run `supabase db push` as part of this runbook.
- Do not execute these files from automated deployment.
- `03_create_indexes_concurrently.sql` must not run inside a transaction.
- Supabase SQL Editor wraps execution in a transaction, so use `03b_create_indexes_sql_editor_compatible.sql` there.
- `03b_create_indexes_sql_editor_compatible.sql` does not use `CONCURRENTLY` and can briefly lock tables; use a quiet window.
- Rollback strategy is manual and must be reviewed before production execution.

## Phase Notes

### Phase 01

Creates only new/missing Workspace tables:

- `workspaces`
- `workspace_members`
- `fcn_coupon_schedules`
- `watchlists`
- `watchlist_items`
- `alert_history`
- `workspace_audit_logs`

It does not alter existing production tables.

### Phase 02

Adds nullable Workspace linkage columns to existing tables:

- `portfolios`
- `portfolio_positions`
- `stock_positions`
- `crypto_positions`
- `fcn_positions`
- `fcn_underlyings`

`portfolio_positions.source_status` and `portfolio_positions.metadata` are nullable in this split to reduce lock/rewrite risk. Defaults and `NOT NULL` enforcement require a later reviewed backfill.

### Phase 03

Creates indexes with `CREATE INDEX CONCURRENTLY IF NOT EXISTS`.

This file must not run inside `BEGIN` / `COMMIT`, and it may fail in SQL runners that wrap files in a transaction.

### Phase 03b

Creates the same indexes with `CREATE INDEX IF NOT EXISTS` for Supabase SQL Editor compatibility.

Use this only when the SQL Editor transaction wrapper prevents concurrent index creation. For production/high-traffic tables, `03_create_indexes_concurrently.sql` remains preferred through a non-transaction runner. In the current IXAI state, the new Workspace tables are empty and existing Workspace persistence usage is still low traffic, but operators should still run 03b during a quiet window.

### Phase 04

Enables RLS and creates conservative policies for new V11 tables only. It does not modify existing policies on Portfolio, Stock, Crypto, or FCN tables.

### Phase 05

Contains read-only validation queries for table existence, added columns, indexes, RLS, policies, foreign keys, row counts, and basic select smoke checks.

### Phase 06

Contains read-only index-specific validation. Expected result: `missing_index_count = 0`.

## Out of Scope

- Binance integration.
- Yahoo Finance integration.
- Broker sync.
- AI recommendations.
- Trading logic.
- Remote migration automation.
- Production seed auto-run.
