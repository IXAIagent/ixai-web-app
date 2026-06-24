# V11.40 Manual Migration Split

This folder contains production-safe manual SQL files split from `supabase/migrations/013_v11_database_activation_foundation.sql`.

No remote migration has been executed by this task.

## Required Run Order

1. `01_create_new_workspace_tables.sql`
2. `02_add_nullable_workspace_columns.sql`
3. `03_create_indexes_concurrently.sql`
4. `04_enable_rls_and_policies.sql`
5. `05_post_migration_validation.sql`

## Operator Rules

- Backup the target Supabase database before running anything.
- Run all phases in staging first.
- Do not run all files blindly.
- Review every `ON DELETE CASCADE` relationship before production.
- Keep V11 write guards disabled until validation passes.
- Do not run `supabase db push` as part of this runbook.
- Do not execute these files from automated deployment.
- `03_create_indexes_concurrently.sql` must not run inside a transaction.
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

### Phase 04

Enables RLS and creates conservative policies for new V11 tables only. It does not modify existing policies on Portfolio, Stock, Crypto, or FCN tables.

### Phase 05

Contains read-only validation queries for table existence, added columns, indexes, RLS, policies, foreign keys, row counts, and basic select smoke checks.

## Out of Scope

- Binance integration.
- Yahoo Finance integration.
- Broker sync.
- AI recommendations.
- Trading logic.
- Remote migration automation.
- Production seed auto-run.
