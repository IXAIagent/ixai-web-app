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
