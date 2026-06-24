# V10 Platform Cutover Program

## Goal

V10 moves IXAI from database-first read priority into database-backed platform readiness while preserving all existing local, draft, Truth Layer, and deterministic fallback behavior.

This program covers:

- V10.20 Ownership Enforcement
- V10.30 Database Write Cutover
- V10.40 Workspace Membership
- V10.50 Sync Reconciliation
- V10.60 Migration Execution Preparation
- V10.70 Production Readiness

## What Changed

- Added a conservative ownership access evaluator with `canRead`, `canWrite`, `canManage`, role, source, fallback, reason, and checked timestamp metadata.
- Added workspace membership readiness without requiring membership tables at runtime.
- Added guarded database write cutover preview metadata. Writes remain feature-guarded and disabled by default.
- Added deterministic sync reconciliation dry-run planning with blocked/conflict/action metadata.
- Added migration execution preparation checklists, expected table order, rollback notes, and post-migration validation steps.
- Added production readiness diagnostics for data integrity, duplicate/orphan readiness, ownership coverage, backups, restore, audit logs, migration health, and fallback status.
- Surfaced V10 platform cutover diagnostics in Workspace Home, Settings, Database Activation Status, Workspace Graph, and Integration Audit.

## Safety Boundary

V10 platform cutover does not:

- execute remote migrations
- change auth behavior
- change RLS behavior
- change Supabase schema
- remove fallbacks
- force database-only writes
- run destructive sync
- add broker integration
- add trading logic
- add AI recommendation logic

## Data Flow

```text
Database-first read priority
↓
Truth Layer fallback
↓
Local / draft fallback
↓
Ownership + membership diagnostics
↓
Guarded write preview
↓
Dry-run reconciliation
↓
Migration execution prep
↓
Production readiness diagnostics
```

## Limitations

- Database writes are scaffolded as guarded previews only.
- Sync reconciliation is dry-run only and `safeToApply` remains false.
- Membership management UI is not implemented.
- Migration execution is documented and checked, but not run.
- Backup, restore, audit log, orphan cleanup, and duplicate cleanup remain diagnostics.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

## Next Step

Future work can split this program into explicitly approved production cutover tasks:

- reviewed migration execution in staging
- write-path opt-in behind feature flags
- membership table activation
- non-destructive sync apply workflow
- backup/restore operational runbook
