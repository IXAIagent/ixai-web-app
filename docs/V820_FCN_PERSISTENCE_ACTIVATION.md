# V8.20 FCN Persistence Activation

## Goal

Prepare database activation for FCN positions, underlyings, and coupon schedules.

## Behavior

Database readback is attempted first where safe. Existing `/api/fcn` readback and FCN Draft Store fallback are preserved.

## Boundary

No FCN pricing engine, no migration application, no write UI changes, and no breakage to FCN Risk or Schedule engines.
