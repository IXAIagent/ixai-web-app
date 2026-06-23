# V8.10 Portfolio Persistence Activation

## Goal

Prepare database activation for portfolio, stock, and crypto positions.

## Created

- `src/lib/persistence/portfolio/portfolio-database-types.ts`
- `src/lib/persistence/portfolio/portfolio-database-adapter.ts`
- `src/lib/persistence/portfolio/portfolio-activation-service.ts`

## Behavior

The adapter checks `portfolio_positions`, `stock_positions`, and `crypto_positions` with safe Supabase REST readback. If tables are missing or unreadable, it returns fallback/unavailable status and preserves current Portfolio Persistence behavior.

## Boundary

Write draft methods are disabled by default and not wired to UI writes.
