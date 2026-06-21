# v4.20 Market Data Foundation

## Goal

Introduce the first small, reviewable market data foundation for IXAI Workspace.

v4.20 creates unified equity and crypto quote types, public provider adapters, and a Market Service facade that can return stable quote results for supported symbols. Workspace Market Status now consumes the facade so Portfolio, Risk, and Intelligence surfaces can display quote source status without changing existing API contracts.

## Scope

v4.20 includes:

- Unified quote types under `src/lib/market/types.ts`.
- Yahoo Finance equity provider foundation under `src/lib/market/providers/yahoo-finance.ts`.
- Binance crypto provider foundation under `src/lib/market/providers/binance.ts`.
- Market Service facade methods:
  - `getMarketQuote(symbol)`.
  - `getMarketQuotes(symbols)`.
  - `getDefaultWorkspaceMarketQuotes()`.
- Workspace Market Status quote readback for default Workspace symbols.

## Files Changed

- `src/lib/market/types.ts`
- `src/lib/market/providers/yahoo-finance.ts`
- `src/lib/market/providers/binance.ts`
- `src/lib/market/market-service.ts`
- `components/market/workspace-market-status.tsx`
- `docs/ROADMAP.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/PROJECT_MAP.md`
- `docs/VERSION_HISTORY.md`

## Provider Architecture

```text
Workspace Market Status
↓
Market Service
↓
Provider Router
├─ Yahoo Finance Provider (equity)
└─ Binance Provider (crypto)
↓
Unified MarketQuoteResult
```

The service normalizes and deduplicates symbols. One failed provider result returns an `unavailable` result instead of crashing the Workspace surface.

## Supported Symbols

Yahoo Finance equity provider:

- `AAPL`
- `TSLA`
- `NVDA`
- `MSFT`
- `GOOGL`
- `PLTR`
- `AVGO`
- `MDB`
- `AFRM`
- `MRVL`

Binance crypto provider:

- `BTCUSDT`
- `ETHUSDT`
- `BNBUSDT`

Default Workspace quote set:

- `AAPL`
- `TSLA`
- `NVDA`
- `MSFT`
- `GOOGL`
- `BTCUSDT`
- `ETHUSDT`
- `BNBUSDT`

## Source Status

Quote results use:

- `live`
- `delayed`
- `fallback`
- `unavailable`

Yahoo Finance equity results are labeled `delayed` because they are public informational quotes. Binance crypto results are labeled `live` when the public ticker endpoint returns successfully. Failed or unsupported requests are labeled `unavailable`.

## What v4.20 Does Not Do

v4.20 does not add:

- Auth changes.
- Supabase schema changes.
- Migrations.
- API contract changes.
- Broker integrations.
- Trading logic.
- Investment recommendation logic.
- FCN pricing engine.
- Portfolio valuation engine changes.
- Large UI redesign.
- Secret keys or environment variables.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- Optional: `QA_PORT=3001 npm run qa:mobile`
- Workspace Market Status renders even when a provider is unavailable.
- No schema, migration, auth, broker, recommendation, or trading changes.

## Next Step After v4.20

Recommended next step:

- `v4.21 FCN Market Price Readiness`: define how FCN underlyings choose between manual price overlays, delayed market quotes, missing prices, and future persisted price snapshots.

Future dependencies:

- Portfolio valuation readback.
- FCN KI / KO distance semantics with explicit price source priority.
- Provider freshness and stale-data warnings.
