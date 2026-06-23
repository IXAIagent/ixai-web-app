# V8.70 Database Activation Diagnostics

## Goal

Expose database activation readiness in Workspace Settings.

## UI

`components/workspace/workspace-database-activation-status.tsx` displays:

- Portfolio database readiness
- FCN database readiness
- Watchlist database readiness
- Alert database readiness
- Ownership database readiness
- Sync activation readiness
- Missing table warnings
- Fallback status
- Migration status

## Boundary

Internal diagnostics only. No migration execution and no investment logic.
