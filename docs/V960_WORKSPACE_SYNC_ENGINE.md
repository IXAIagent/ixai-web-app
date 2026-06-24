# V9.60 Workspace Sync Engine

## Goal

Create a non-destructive sync planning layer between database readback and existing local/fallback workspace state.

## Files

- `src/lib/persistence/sync/workspace-sync-plan-types.ts`
- `src/lib/persistence/sync/workspace-sync-engine.ts`

## Behavior

- Generates local-only, database-only, matched, and conflict-candidate buckets.
- Emits informational recommended actions only.
- Never writes, reconciles, overwrites, or deletes records automatically.
- Exposes sync plan status for Settings diagnostics.

## Boundary

No destructive reconciliation, background sync, automatic overwrite, trading logic, or recommendations.
