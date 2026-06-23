# V6.30 Persistent Alerts Foundation

## Goal

Create an alert history abstraction while preserving deterministic UI-only alert generation.

## Runtime Behavior

- Alert Engine remains deterministic.
- Alert persistence service reports local/foundation status.
- Notification Center can continue converting alerts into local notifications.
- No backend write or delivery is implemented.

## Boundary

No schema dependency, migration, delivery, broker integration, trading, recommendations, or AI model calls.
