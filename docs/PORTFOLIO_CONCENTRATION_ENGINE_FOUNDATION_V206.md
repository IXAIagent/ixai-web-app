# v2.06 — Portfolio Concentration Engine Foundation

## Objective

Create the Portfolio Concentration Engine Foundation.

The target flow is:

```text
Portfolio Assets
↓
Valuation
↓
Exposure Engine
↓
Concentration Engine
↓
Concentration Dashboard
```

This version is foundation-only. It uses the existing `PortfolioExposureReport` and deterministic mock logic. It does not add schema, API routes, auth changes, membership changes, broker sync, external market data, AI, recommendation logic changes, or trading logic.

## Scope

- Add Portfolio Concentration types.
- Add Portfolio Concentration Engine contract.
- Add deterministic mock concentration engine.
- Add `buildPortfolioConcentration()`.
- Add Portfolio Concentration Engine readback to `/my-ixai/portfolio`.
- Update the Portfolio Architecture Map.

## Concentration Types

`PortfolioConcentrationLevel` supports:

- `LOW`
- `MEDIUM`
- `HIGH`
- `CRITICAL`

`PortfolioConcentrationItem` contains:

- key
- label
- category
- market value
- percentage
- level

`PortfolioConcentrationReport` contains:

- overall concentration
- concentration score
- top symbol
- top FCN underlying
- top asset type
- top provider
- top region
- alerts
- summary
- generated time

## Engine Contract

`PortfolioConcentrationEngine` exposes:

```ts
generateConcentration(input): Promise<PortfolioConcentrationReport>
```

The input is the existing `PortfolioExposureReport`.

## Mock Concentration Logic

The mock engine is deterministic.

Rules:

- Top Symbol Concentration comes from `symbolExposure`.
- Top FCN Underlying Concentration comes from `symbolExposure` entries with `fcn_underlying` category.
- Top Asset Type Concentration comes from `assetTypeExposure`.
- Top Provider Concentration comes from `providerExposure`.
- Top Region Concentration comes from `regionExposure`.
- Levels are assigned by percentage:
  - `LOW`: below 20%.
  - `MEDIUM`: 20% to below 35%.
  - `HIGH`: 35% to below 50%.
  - `CRITICAL`: 50% and above.
- Concentration score is the largest top concentration percentage, capped at 100.
- Alerts are generated only for `HIGH` or `CRITICAL` concentration items.

The engine does not use randomness and does not call external APIs.

## Dashboard Integration

`/my-ixai/portfolio` now displays:

- Overall Concentration
- Concentration Score
- Top Symbol
- Top FCN Underlying
- Top Asset Type
- Top Provider
- Top Region
- Alerts
- Summary
- Generated Time

The UI uses responsive cards and compact lists. It does not use table-only layouts.

## Architecture Update

The Portfolio Center architecture now includes:

```text
Portfolio Exposure Engine Foundation
↓
Portfolio Concentration Engine Foundation
↓
Portfolio Correlation Engine
(Coming Soon)
```

## Compliance Boundary

Portfolio Concentration Engine Foundation is monitoring and risk-awareness only.

It must not output:

- buy / sell instructions
- increase / reduce position instructions
- target prices
- expected returns
- guaranteed returns
- automated trading language

## Out of Scope

- No migration.
- No schema change.
- No API route.
- No auth change.
- No membership change.
- No entitlement change.
- No broker sync.
- No external market data.
- No Yahoo Finance, Binance API, CoinGecko, Finnhub, Polygon, OpenAI, Claude, Gemini, or Broker API.
- No recommendation logic change.
- No trading logic.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`
- Browser QA for `/portfolio` and `/my-ixai/portfolio` at 375, 768, and 1280 px.

## Next

The next planned foundation stage is Portfolio Correlation Engine Foundation. It should remain deterministic and provider-free until concentration output is validated.
