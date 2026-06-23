# V7.50 Watchlist Persistence Foundation

## Goal

Extend V6 watchlist persistence readiness with a typed repository abstraction.

## Behavior

Persistent repository returns safe unavailable readback until future `watchlists` and `watchlist_items` tables are explicitly migrated. Existing local/fallback Watchlist remains preserved.

## Boundary

No write UI change, no migration, no broker sync, no trading, and no recommendations.
