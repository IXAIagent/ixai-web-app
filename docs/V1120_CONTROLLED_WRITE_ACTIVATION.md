# V11.20 Controlled Write Activation

## Goal

Prepare database writes for Portfolio, FCN, Watchlist, and Alert History without enabling them by default.

## Guard Rules

Controlled writes require all of the following:

- Global database write guard enabled.
- Module-level guard enabled.
- Database readiness passes.
- Ownership/access check passes.
- Workspace/user context exists.
- Payload validation passes.

If any check fails, the database write is skipped and fallback remains active.

## Result Shape

Each controlled write evaluation reports:

- `success`
- `module`
- `operation`
- `target`
- `databaseAttempted`
- `fallbackUsed`
- `guardEnabled`
- `blockingReason`
- `errorMessage`
- `operationId`
- `writtenAt`

## Module Behavior

- Portfolio: database write readiness is guarded; Portfolio Truth and local recent input fallback remain active.
- FCN: database write readiness is guarded; `/api/fcn`, FCN Draft Store, and `ixai.fcn.drafts.v308` compatibility remain active.
- Watchlist: database write readiness is guarded; local/fallback watchlist remains active.
- Alert History: database write readiness is guarded; deterministic alert dedupe fallback remains active.

## UI / Diagnostics

V11.20 metadata appears in Workspace diagnostics, Settings database diagnostics, Database Activation Status, Platform Cutover Status, Workspace Graph metadata, and Integration Audit lineage.

## Limitations

- No product write path is cut over yet.
- No database write is executed by diagnostics.
- No destructive delete is enabled.
- No automatic reconciliation write is enabled.
- Feature guards remain disabled by default.
