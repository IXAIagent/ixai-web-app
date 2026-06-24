# V9.70 Migration + Health Check Foundation

## Goal

Provide migration and table health diagnostics without executing migrations.

## Files

- `src/lib/persistence/migrations/migration-types.ts`
- `src/lib/persistence/migrations/migration-health-service.ts`
- `src/lib/persistence/migrations/index.ts`

## Behavior

- Checks expected table readiness through existing activation adapters.
- Reports available tables, missing tables, source status, and draft-only RLS status.
- Does not execute SQL migrations beyond safe readiness reads.
- Keeps runtime optional and fallback-safe.

## Boundary

No automatic migration execution, no schema mutation, no destructive database action, and no runtime dependency on new tables.
