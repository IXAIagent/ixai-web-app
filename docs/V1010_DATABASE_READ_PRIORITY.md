# V10.10 Database Read Priority

## Goal

Start the V10 Database Cutover Program by moving Workspace read operations toward database-first behavior while preserving every existing fallback.

## Read Priority

```text
1. Supabase / Database live readback
2. Truth Layer / existing API readback
3. Local Storage / Draft fallback
```

## Scope

V10.10 applies database-first read priority to:

- Portfolio
- FCN
- Watchlist
- Alert History

## Implementation

- Added `src/lib/workspace/database-read-priority.ts` as the canonical resolver.
- Added `src/lib/workspace/database-read-priority-status.ts` for Workspace source metadata.
- Added `components/workspace/workspace-database-read-priority-status.tsx`.
- Updated Portfolio Persistence, FCN Persistence, Watchlist, and Alert History services to attempt database readback first.
- Surfaced source metadata in Workspace Home, Settings, Database Activation Status, Workspace Graph, and Integration Audit.

## Boundaries

- No migration execution.
- No auth behavior changes.
- No RLS changes.
- No schema changes.
- No write-path cutover.
- No destructive fallback removal.
- No automatic reconciliation writes.
- No broker integration.
- No trading logic.
- No AI recommendation logic.

## Known Limitations

- Database tables remain optional at runtime.
- Database-ready status currently reflects readable rows, not migration enforcement.
- Write paths remain V9 guarded scaffolds.
- Sync remains plan-only and non-destructive.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`
