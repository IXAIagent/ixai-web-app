# V7.60 Alert Persistence Foundation

## Goal

Extend V6 alert persistence readiness toward typed alert history repository.

## Behavior

Persistent repository returns safe unavailable readback until future `alert_events` table is explicitly migrated. Current deterministic Alert Engine remains the active source.

## Boundary

No notification delivery, no background job, no migration, no trading, no recommendations, and no AI model calls.
