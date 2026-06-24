# V9.30 Watchlist Live Persistence

## Goal

Add guarded live Watchlist database readback while preserving local/fallback watchlist behavior.

## Files

- `src/lib/watchlist/persistence/watchlist-live-service.ts`
- Existing watchlist database adapters and exports.

## Behavior

- Reads `watchlists` and `watchlist_items` when available.
- Reports persisted, partial, or unavailable status.
- Keeps local/fallback watchlist UI active when tables are missing or empty.
- Write scaffolds remain guarded and disabled by default.

## Boundary

No recommendation logic, broker integration, trading, schema changes, migration execution, or local fallback removal.
