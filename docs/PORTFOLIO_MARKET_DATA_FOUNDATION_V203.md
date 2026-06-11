# v2.03 — Portfolio Market Data Foundation

## Objective

Build the first Portfolio Market Data Foundation:

```text
Portfolio Asset
↓
Intelligence Universe
↓
Market Data Provider
↓
Market Snapshot
↓
Portfolio Dashboard
```

This version is foundation-only. It uses deterministic mock market snapshots and does not connect real market data providers.

## Scope

- Add Portfolio Market Snapshot types.
- Add Market Data Provider contract.
- Add deterministic mock market data provider.
- Add `buildPortfolioMarketSnapshots()` using the existing Intelligence Universe.
- Add Portfolio Market Data readback inside `/my-ixai/portfolio`.
- Update Portfolio Architecture Map and project docs.

## Market Data Types

`PortfolioMarketSnapshot` includes:

- `symbol`
- `assetType`
- `price`
- `dailyChangePercent`
- `currency`
- `marketStatus`
- `updatedAt`

`PortfolioMarketDataFeed` includes:

- `totalSymbols`
- `trackedSymbols`
- `snapshots`
- `snapshotCount`
- `providerSource`
- `updatedAt`

## Provider Contract

`PortfolioMarketDataProvider` exposes:

```ts
getSnapshots(symbols: string[]): Promise<PortfolioMarketSnapshot[]>
```

## Mock Coverage

The deterministic mock provider supports:

- `BTC`
- `ETH`
- `AAPL`
- `TSLA`
- `NVDA`
- `MSFT`
- `MDB`
- `ORCL`
- `AVGO`
- `PLTR`
- `GOOGL`

The provider uses fixed prices and fixed daily change values. It does not use randomness or external calls.

## Builder Flow

`buildPortfolioMarketSnapshots()` reuses the existing Portfolio News Intelligence Foundation:

```text
Portfolio Assets
↓
buildPortfolioNewsIntelligenceFoundation()
↓
tracked symbols
↓
PortfolioMarketDataProvider
↓
PortfolioMarketDataFeed
```

This avoids creating a duplicate symbol extraction layer.

## Dashboard Integration

`/my-ixai/portfolio` now shows:

- Market Data Status.
- Provider Source.
- Tracked Symbols.
- Snapshot Count.
- Updated Time.
- Market Snapshot Cards.

Each snapshot card shows:

- Symbol.
- Price.
- Daily Change.
- Currency.
- Market Status.

## Architecture Update

The Portfolio Center architecture sequence now includes:

```text
Portfolio News Provider Foundation
↓
Portfolio AI Commentary Foundation
↓
Portfolio Intelligence Engine Foundation
↓
Portfolio Risk Engine Foundation
↓
Portfolio Recommendation Engine Foundation
↓
Portfolio Market Data Foundation
↓
Real Market Data Provider (Coming Soon)
```

## Compliance Boundary

Portfolio Market Data Foundation is mock-only and is used to validate data flow and dashboard UI. It is not real-time market data, investment advice, trading instruction, price prediction, or performance promise.

## Out of Scope

- No API route.
- No Supabase table.
- No migration.
- No schema change.
- No broker integration.
- No Yahoo Finance.
- No Binance API.
- No CoinGecko.
- No Finnhub.
- No Polygon.
- No OpenAI.
- No Claude.
- No Gemini.
- No recommendation logic.
- No trading logic.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`
- Playwright smoke for `/portfolio` and `/my-ixai/portfolio` at 375px, 768px, and 1280px.

