# V7.40 FCN Persistence Foundation

## Goal

Prepare FCN persistence without breaking FCN Draft Store, `/api/fcn`, Supabase readback, or FCN Center.

## Behavior

The service reads existing `/api/fcn` when available and preserves local FCN draft fallback. Future `fcn_coupon_schedules` storage is documented as schema draft only.

## Boundary

No UI write change, no migration, no schema runtime dependency, no FCN pricing engine, no trading, and no recommendations.
