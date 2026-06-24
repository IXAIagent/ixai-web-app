# V9.10 Portfolio Live Persistence

## Goal

Add guarded live database readback for portfolio, stock, and crypto records without making database tables required at runtime.

## Files

- `src/lib/persistence/portfolio/portfolio-live-service.ts`
- Existing portfolio database adapters and exports.

## Behavior

- Reads `portfolio_positions`, `stock_positions`, and `crypto_positions` when available.
- Returns persisted, partial, or unavailable source status.
- Keeps local and fallback Portfolio Persistence readback active.
- Exposes guarded stock and crypto write scaffolds, but underlying write adapters remain disabled by default.

## Boundary

No destructive deletes, schema changes, migration execution, broker integration, trading, recommendations, or API contract changes.
