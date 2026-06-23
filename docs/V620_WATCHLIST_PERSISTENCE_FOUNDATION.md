# V6.20 Persistent Watchlist Foundation

## Goal

Create a persistence abstraction for Watchlist without requiring a runtime database schema.

## Runtime Behavior

- Existing local/fallback watchlist readback remains intact.
- Watchlist Summary shows persistence readiness.
- No Supabase table is required at runtime.

## Source Status

- `persisted`
- `local`
- `fallback`
- `unavailable`

## Boundary

This is a foundation only. It does not add migrations, broker sync, trading logic, recommendations, or order routing.
