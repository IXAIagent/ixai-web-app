# V8.30 Watchlist Persistence Activation

## Goal

Prepare database activation for Watchlist.

## Behavior

The activation adapter checks `watchlists` and `watchlist_items`. If unavailable, existing local/fallback watchlist behavior continues.

## Boundary

Write draft methods are disabled by default. No runtime table dependency.
