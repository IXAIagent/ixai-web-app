# V11.30 Remote Migration Readiness

## Goal

Prepare manual migration execution readiness without running remote migrations automatically.

## Review Coverage

The V11.30 readiness layer checks or documents:

- Migration file presence.
- Expected table coverage.
- Expected index coverage.
- Workspace ownership linkage.
- Audit table presence.
- Local/dev seed file presence.
- Rollback notes.
- Production warnings.

## Dry-Run Helper

`scripts/v11-migration-readiness.mjs` inspects the local V11.10 migration and seed files. It is dry-run only and prints JSON readiness metadata.

It does not execute:

- `supabase db push`
- `supabase migration up`
- Remote SQL
- Production migration commands

## Manual Operator Checklist

1. Backup the target Supabase database.
2. Verify environment and project target.
3. Confirm branch and PR are reviewed and merged.
4. Review SQL line by line.
5. Run migration manually in staging.
6. Run readback validation.
7. Run guarded write readiness validation.
8. Confirm fallback behavior still works.
9. Prepare rollback plan before production execution.

## Post-Migration Validation

Validate table existence, basic select readback, RLS policy presence when applicable, optional local-only seed insert, V11.10 readback validation, V11.20 guarded write readiness, and Truth Layer / local fallback behavior.

## Limitations

- Migration execution remains manual.
- Runtime still works when tables are absent.
- Write activation remains guarded and disabled by default.

## V11.40 Manual Migration Split

V11.40 adds a production-safe manual SQL split under `supabase/manual/v11/`:

- `01_create_new_workspace_tables.sql`
- `02_add_nullable_workspace_columns.sql`
- `03_create_indexes_concurrently.sql`
- `04_enable_rls_and_policies.sql`
- `05_post_migration_validation.sql`
- `README.md`

Safety adjustments:

- New/missing tables are separated from existing table alterations.
- Existing production tables receive nullable/additive columns only.
- `portfolio_positions.source_status` and `portfolio_positions.metadata` are added nullable first to reduce lock/rewrite risk.
- Production indexes use `CREATE INDEX CONCURRENTLY IF NOT EXISTS`.
- RLS/policies are applied only to new V11 tables.
- The manual runbook requires staging first, backup first, and keeping write guards disabled until validation passes.

## V11.51 Index Compatibility Fix

V11.50 manual Supabase execution partially completed:

- Phase 01 create workspace tables: succeeded.
- Phase 02 add nullable workspace columns: succeeded.
- Phase 04 enable RLS and policies: succeeded.
- Phase 05 validation: succeeded.

Phase 03 failed in Supabase SQL Editor with:

```text
ERROR: 25001: CREATE INDEX CONCURRENTLY cannot run inside a transaction block
```

This is expected because Supabase SQL Editor wraps execution in a transaction. No data was damaged.

V11.51 adds:

- `supabase/manual/v11/03b_create_indexes_sql_editor_compatible.sql`
- `supabase/manual/v11/06_index_validation.sql`

`03b` uses `CREATE INDEX IF NOT EXISTS` without `CONCURRENTLY` and is compatible with Supabase SQL Editor. It can briefly lock tables, so it should be run during a quiet window. `03_create_indexes_concurrently.sql` remains preferred for CLI / non-transaction execution and for high-traffic production tables.
