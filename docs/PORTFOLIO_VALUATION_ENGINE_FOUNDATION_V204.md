# v2.04 — Portfolio Valuation Engine Foundation

## Objective

Build the first Portfolio Valuation Engine Foundation.

The target data flow is:

```text
Portfolio Assets
↓
Market Data
↓
Valuation Engine
↓
Portfolio Value
↓
Allocation Metrics
```

This version is foundation-only. It uses repository assets, repository positions, and deterministic mock market data. It does not connect real market data, broker sync, trading, AI, or external APIs.

## Scope

- Add Portfolio Valuation types.
- Add Portfolio Allocation types.
- Add a Portfolio Valuation Engine contract.
- Add a deterministic mock valuation engine.
- Add `buildPortfolioValuation()`.
- Add Portfolio Valuation and Portfolio Allocation readback to `/my-ixai/portfolio`.
- Update the Portfolio Architecture Map.

## Valuation Types

`PortfolioValuation` contains:

- `totalCostBasis`
- `totalMarketValue`
- `unrealizedPnL`
- `unrealizedPnLPercent`
- `assetCount`
- `positionCount`
- `generatedAt`

## Allocation Types

`PortfolioAllocation` contains:

- `byAssetType`
- `byProvider`
- `byRegion`

Each allocation item records:

- key
- label
- market value
- share percent

## Valuation Engine Contract

`PortfolioValuationEngine` exposes:

```ts
generateValuation(input): Promise<PortfolioValuationReport>
```

The input includes:

- accounts
- assets
- positions
- market snapshots

The report includes:

- valuation
- allocation
- provider source

## Mock Valuation Logic

The mock engine is deterministic.

Rules:

- If a position has `quantity` and a matching market snapshot, market value is `quantity * market price`.
- If a stored `marketValue` exists, it can be used as safe fallback.
- If market data is missing, cost basis is used as safe fallback.
- Unrealized P/L is `totalMarketValue - totalCostBasis`.
- Unrealized P/L percent is based on total cost basis.
- Allocation metrics are calculated from the derived market value.

The engine does not use `Math.random()` and does not call external APIs.

## Dashboard Integration

`/my-ixai/portfolio` now displays:

- Total Cost Basis
- Total Market Value
- Unrealized P/L
- Unrealized Return %
- Asset Count
- Position Count
- Generated Time
- Asset Type Allocation
- Provider Allocation
- Region Allocation

## Architecture Update

The Portfolio Center architecture now includes:

```text
Portfolio Market Data Foundation
↓
Portfolio Valuation Engine Foundation
↓
Real-Time Portfolio Engine
(Coming Soon)
```

## Compliance Boundary

Portfolio Valuation Engine Foundation is for monitoring and risk-awareness only.

It is not:

- real-time valuation
- investment advice
- trading instruction
- performance promise
- broker sync
- tax or accounting advice

## Out of Scope

- No migration.
- No schema change.
- No API route.
- No auth change.
- No membership change.
- No entitlement change.
- No broker integration.
- No real market data provider.
- No Yahoo Finance, Binance, CoinGecko, Polygon, or Finnhub.
- No recommendation logic.
- No trading logic.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`
- Browser QA for `/portfolio` and `/my-ixai/portfolio` at 375, 768, and 1280 px.

## Next

Future work may define real-time portfolio valuation governance, market data provider quality checks, broker position sync, and realized / unrealized P/L persistence before any production valuation provider is connected.
