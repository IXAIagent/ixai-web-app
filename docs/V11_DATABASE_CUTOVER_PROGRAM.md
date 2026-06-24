# V11 Database Cutover Program

## Goal

V11 moves IXAI from database activation diagnostics toward controlled database cutover while preserving every existing fallback path.

This program includes:

- V11.20 Controlled Write Activation
- V11.30 Remote Migration Readiness

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

After V11.20/V11.30, the next phase should be staging-only controlled write trials after manual migration review and explicit feature guard enablement.
