# V14.00 FCN Database Activation

## Goal

V14.00 starts guarded FCN database write activation without removing any existing fallback path.

The intended flow is:

FCN Wizard submit -> FCN Draft Store / Input Truth Bridge / recent input fallback -> guarded V14 database write attempt -> `/api/fcn` readback -> FCN Center.

## Scope

- Added `src/lib/workspace/fcn-database-activation/` for FCN write guards, readiness, write services, and diagnostics.
- Updated FCN Wizard to keep local fallback first, then attempt guarded database write only after explicit submit.
- Updated FCN Center copy and refresh behavior so successful guarded writes can refresh `/api/fcn` readback.
- Added V14 diagnostics to Workspace Home, Settings, Database Activation Status, Platform Cutover Status, Workspace Graph, and Integration Audit.

## Guard Model

V14 requires both:

- V12 global write guard.
- V14 FCN module guard.

Guards include:

- `fcnDatabaseWriteEnabled`
- `fcnPositionDatabaseWriteEnabled`
- `fcnUnderlyingDatabaseWriteEnabled`
- `fcnScheduleDatabaseWriteEnabled`
- `fcnFallbackEnabled`
- `diagnosticsReadOnly`

Default state:

- FCN database writes disabled.
- Diagnostics read-only.
- FCN fallback active.

## Readback Priority

FCN readback priority is:

1. Database / `/api/fcn`
2. Input Truth Bridge
3. FCN Draft Store
4. Legacy recent input fallback
5. Empty state

Supabase empty readback must not erase local pending FCN inputs.

## Write Behavior

FCN Wizard submit writes local fallback first. The guarded database attempt happens afterward and must not break the submit flow if skipped or failed.

Position and underlying writes use the existing `/api/fcn` path when all required guards are enabled. Schedule data can be included in the existing FCN position observation schedule payload when its guard is enabled. If a local draft contains schedule rows and the schedule guard is disabled, the database write is skipped to avoid partial FCN persistence. Independent `fcn_coupon_schedules` table writes remain readiness-only until staging confirms a safe route.

## Boundaries

V14.00 does not:

- Execute migrations.
- Change Supabase schema or RLS.
- Change auth, onboarding, or membership behavior.
- Connect Binance or Yahoo Finance.
- Add broker sync.
- Add trading, order execution, or investment recommendation logic.
- Add AI recommendation logic.
- Remove FCN Draft Store, Truth Layer, `/api/fcn`, or local fallback behavior.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

## Remaining Gaps

- FCN writes are disabled by default and require explicit staging guard activation.
- Independent coupon schedule table write path is not fully activated.
- FCN edit/delete remains out of scope.
- FCN pricing engine remains out of scope.
- Cross-device persistence depends on guarded database write activation and production validation.

## Next Step

V15 should focus on Legacy Risk Engine Migration after FCN write safety has been reviewed.
