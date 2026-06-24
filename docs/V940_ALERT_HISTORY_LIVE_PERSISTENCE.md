# V9.40 Alert History Live Persistence

## Goal

Add guarded live alert history readback without enabling delivery, background jobs, or automatic alert writes.

## Files

- `src/lib/alerts/persistence/alert-live-service.ts`
- Existing alert database adapters and exports.

## Behavior

- Reads `alert_events` when available.
- Provides deterministic dedupe keys for future safe writes.
- Does not auto-insert generated alerts during render.
- Keeps deterministic Alert Engine output active when database history is unavailable.

## Boundary

No email, Telegram, LINE, push delivery, background job, trading, recommendation, schema change, or migration execution.
