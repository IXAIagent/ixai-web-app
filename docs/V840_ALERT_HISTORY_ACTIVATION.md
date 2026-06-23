# V8.40 Alert History Activation

## Goal

Prepare database activation for alert history.

## Behavior

The activation adapter checks `alert_events`. Deterministic Alert Engine output remains the active fallback.

## Boundary

No notification delivery, no background jobs, no write UI changes, and no migration application.
