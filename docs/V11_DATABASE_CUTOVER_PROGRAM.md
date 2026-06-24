# V11 Database Cutover Program

## Goal

V11 moves IXAI from database activation diagnostics toward controlled database cutover while preserving every existing fallback path.

This program includes:

- V11.20 Controlled Write Activation
- V11.30 Remote Migration Readiness
- V11.40 Production-Safe Manual Migration Split
- V11.51 Index Compatibility Fix

## Scope

V11 adds guard-first database write readiness and a manual migration review workflow. It does not execute remote migrations, force database-only behavior, or remove the Truth Layer / local fallback.

## Architecture

```text
Workspace Input
↓
Database write guard
↓
Database readiness / ownership / payload checks
↓
Database write only when explicitly enabled
↓
Fallback remains active when blocked
```

Migration readiness remains manual:

```text
Local migration draft
↓
Dry-run review helper
↓
Manual operator checklist
↓
Staging migration review
↓
Readback validation
↓
Guarded write validation
```

## Files Added

- `src/lib/workspace/database-cutover/database-cutover-types.ts`
- `src/lib/workspace/database-cutover/controlled-write-guard.ts`
- `src/lib/workspace/database-cutover/controlled-write-service.ts`
- `src/lib/workspace/database-cutover/migration-readiness-service.ts`
- `src/lib/workspace/database-cutover/database-cutover-service.ts`
- `src/lib/workspace/database-cutover/index.ts`
- `scripts/v11-migration-readiness.mjs`
- `docs/V1120_CONTROLLED_WRITE_ACTIVATION.md`
- `docs/V1130_REMOTE_MIGRATION_READINESS.md`
- `supabase/manual/v11/01_create_new_workspace_tables.sql`
- `supabase/manual/v11/02_add_nullable_workspace_columns.sql`
- `supabase/manual/v11/03_create_indexes_concurrently.sql`
- `supabase/manual/v11/03b_create_indexes_sql_editor_compatible.sql`
- `supabase/manual/v11/04_enable_rls_and_policies.sql`
- `supabase/manual/v11/05_post_migration_validation.sql`
- `supabase/manual/v11/06_index_validation.sql`
- `supabase/manual/v11/README.md`

## Boundaries

- No remote Supabase migration was executed.
- No `supabase db push` is run by the app.
- No production database alteration is automated.
- Writes are disabled by default.
- Diagnostics do not write during render.
- Truth Layer, localStorage, draft stores, and deterministic fallbacks remain active.
- No Binance, Yahoo Finance, broker, trading, or AI recommendation work is included.

## Validation

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

## Next Step

After V11.40, the next phase should be staging-only manual migration execution, post-migration validation, and then controlled write trials with explicit feature guard enablement.

## V11.40 Manual Split

V11.40 converts the monolithic V11.10 migration draft into a manual production runbook:

1. Create only missing/new Workspace tables.
2. Add nullable Workspace linkage columns to existing Portfolio / FCN / Stock / Crypto tables.
3. Create production indexes concurrently outside a transaction.
4. Enable RLS and policies only for new V11 tables.
5. Run read-only post-migration validation queries.

No SQL is executed by this program. The manual split is an operator artifact only.

## V11.51 Index Compatibility Fix

During manual Supabase execution, Phase 03 failed in Supabase SQL Editor because `CREATE INDEX CONCURRENTLY` cannot run inside a transaction block. This was expected for SQL Editor execution and did not damage data.

Confirmed production state after V11.50:

- Phase 01 create workspace tables: succeeded.
- Phase 02 add nullable workspace columns: succeeded.
- Phase 04 enable RLS and policies: succeeded.
- Phase 05 validation: succeeded.
- New V11 workspace tables exist and currently contain 0 rows.

V11.51 adds:

- `03b_create_indexes_sql_editor_compatible.sql` using `CREATE INDEX IF NOT EXISTS` without `CONCURRENTLY`.
- `06_index_validation.sql` for read-only index verification.

For production/high-traffic tables, concurrent index creation remains preferred via `03_create_indexes_concurrently.sql` and a non-transaction runner. For the current IXAI state, the new Workspace tables are empty and existing tables are small/low-traffic enough for manual SQL Editor execution, but operators should still run during a quiet window.
