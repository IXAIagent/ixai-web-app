# v2.05 — Portfolio Exposure Engine Foundation

## Objective

Build the Portfolio Exposure Engine Foundation.

The target flow is:

```text
Portfolio Assets
↓
Valuation
↓
Exposure Engine
↓
Exposure Dashboard
```

This version is foundation-only. It uses repository assets, v2.03 mock market data, and v2.04 valuation output. It does not connect real market data, broker sync, external AI, recommendation changes, or trading logic.

## Scope

- Add Portfolio Exposure types.
- Add Portfolio Exposure Engine contract.
- Add deterministic mock exposure engine.
- Add `buildPortfolioExposure()`.
- Add Portfolio Exposure Engine section to `/my-ixai/portfolio`.
- Update the Portfolio Architecture Map.

## Exposure Types

`PortfolioExposureReport` contains:

- `id`
- `totalMarketValue`
- `assetTypeExposure`
- `symbolExposure`
- `regionExposure`
- `providerExposure`
- `topExposures`
- `generatedAt`
- `summary`

`PortfolioExposureItem` contains:

- `key`
- `label`
- `marketValue`
- `percentage`
- `category`

Supported exposure categories:

- `asset_type`
- `symbol`-level output via asset-type, crypto, FCN-underlying, and cash categories
- `region`
- `provider`
- `fcn_underlying`
- `crypto`
- `cash`

## Exposure Engine Contract

`PortfolioExposureEngine` exposes:

```ts
generateExposure(input): Promise<PortfolioExposureReport>
```

The input includes:

- accounts
- assets
- market data feed
- valuation report

## Mock Exposure Logic

The mock engine is deterministic.

Rules:

- Asset Type Exposure groups value by FCN, STOCK, CRYPTO, GRID, DUAL, and CASH.
- Symbol Exposure groups direct stock / crypto symbols.
- FCN Underlying Exposure splits FCN exposure across stored `metadata.underlyings`.
- GRID and DUAL symbols normalize `BTCUSDT` to `BTC`, `ETHUSDT` to `ETH`, and similar stable-coin suffix pairs.
- Region Exposure groups by asset region.
- Provider Exposure groups by account provider.
- Top Exposures returns the top five exposure items by percentage.

The engine does not use randomness and does not call external APIs.

## Builder Flow

`buildPortfolioExposure()` reuses the existing layers:

```text
Repository Assets
↓
Market Data Feed
↓
Valuation Engine
↓
Exposure Engine
↓
Portfolio Exposure Report
```

The builder accepts existing market data and valuation reports when already available, so dashboard code does not need to duplicate those computations.

## Dashboard Integration

`/my-ixai/portfolio` now displays:

- Total Market Value
- Top Exposures
- Asset Type Exposure
- Symbol / Underlying Exposure
- Region Exposure
- Provider Exposure
- Generated Time
- Summary

The UI uses responsive cards and compact lists, not large tables.

## Architecture Update

The Portfolio Center architecture now includes:

```text
Portfolio Market Data Foundation
↓
Portfolio Valuation Engine Foundation
↓
Portfolio Exposure Engine Foundation
↓
Real-Time Portfolio Engine
(Coming Soon)
```

## Compliance Boundary

Portfolio Exposure Engine Foundation is monitoring and risk-awareness only.

It does not provide:

- investment advice
- trading instructions
- position changes
- price targets
- expected return
- guaranteed return
- automated execution

## Out of Scope

- No migration.
- No schema change.
- No API route.
- No auth change.
- No membership change.
- No entitlement change.
- No FCN engine change.
- No Daily / Weekly / Social Pack change.
- No Yahoo Finance, Binance API, CoinGecko, Finnhub, Polygon, OpenAI, Claude, Gemini, or Broker API.
- No recommendation logic changes.
- No trading logic.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`
- Browser QA for `/portfolio` and `/my-ixai/portfolio` at 375, 768, and 1280 px.

## Next

The next planned foundation stage is v2.06 Portfolio Real-Time Engine Foundation, after exposure readback and mobile layout remain stable.
