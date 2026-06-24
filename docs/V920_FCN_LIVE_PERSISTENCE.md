# V9.20 FCN Live Persistence

## Goal

Add guarded live FCN database readback while preserving `/api/fcn`, existing Supabase readback, FCN Draft Store, and local fallback behavior.

## Files

- `src/lib/persistence/fcn/fcn-live-service.ts`
- Existing FCN database adapters and exports.

## Behavior

- Reads `fcn_positions`, `fcn_underlyings`, and `fcn_coupon_schedules` when available.
- Keeps FCNs visible even when live database data is unavailable.
- Write scaffolds are readiness-gated and remain disabled through existing V8 draft adapters.

## Boundary

No FCN pricing engine, trading logic, recommendations, destructive deletes, schema changes, migration execution, or API contract changes.
