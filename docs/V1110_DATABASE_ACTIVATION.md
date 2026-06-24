# V11.10 Database Activation Foundation

## Goal

V11.10 begins real database activation by preparing reviewed migration files, database readiness diagnostics, readback validation, and write activation readiness while preserving Truth Layer and local fallback behavior.

## Scope

V11.10 covers:

- reviewed SQL migration draft
- local/dev seed notes
- expected table readiness
- table / column readiness diagnostics where feasible
- index / RLS readiness labels where client-safe checks cannot verify directly
- database readback validation for Portfolio, FCN, Watchlist, Alert History, and Workspace Membership
- write activation readiness for Portfolio, FCN, Watchlist, and Alert History
- compact Workspace diagnostics

## Migration Files

Added:

- `supabase/migrations/013_v11_database_activation_foundation.sql`
- `supabase/seed_v11_database_activation_demo.sql`

These files are prepared but not remotely executed. They must be reviewed, staged, backed up, and validated before any production migration.

## Tables

V11.10 prepares or validates:

- `workspaces`
- `workspace_members`
- `portfolios`
- `portfolio_positions`
- `stock_positions`
- `crypto_positions`
- `fcn_positions`
- `fcn_underlyings`
- `fcn_coupon_schedules`
- `watchlists`
- `watchlist_items`
- `alert_history`
- `workspace_audit_logs`

Existing production tables are extended only through additive draft migration statements. Existing local fallback and Truth Layer behavior remain intact.

## Readback Validation

The V11 activation service returns structured validation:

- module
- canRead
- rowCount
- source
- fallbackUsed
- blockingReason
- checkedAt

Modules:

- Portfolio
- FCN
- Watchlist
- Alert History
- Workspace Membership

## Write Activation Readiness

V11.10 does not fully activate writes. It only reports:

- canWrite
- guarded
- missingRequirements
- fallbackAvailable
- recommendedNextStep

V11.20 should be Controlled Write Activation after staging validation.

## Boundaries

V11.10 does not:

- execute remote Supabase migrations
- remove local fallback
- remove Truth Layer
- force database-only behavior
- change auth redirects
- change onboarding
- connect Binance
- connect Yahoo Finance
- add broker sync
- add trading logic
- add AI recommendations

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

## Next Phase

V11.20 Controlled Write Activation adds explicit write guards and readiness metadata. Writes remain disabled by default unless global and module-level guards are explicitly enabled, and diagnostics must not execute writes during render.

V11.30 Remote Migration Readiness adds a dry-run migration review helper and manual operator checklist. Remote migration execution remains manual and outside the app.
