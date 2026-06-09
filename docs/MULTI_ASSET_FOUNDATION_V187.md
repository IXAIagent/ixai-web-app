# v1.87 — Multi-Asset Portfolio Foundation

## Goal

Upgrade IXAI from an FCN-centric Portfolio readback into a Multi-Asset Portfolio architecture.

v1.87 introduces a normalized asset-category abstraction layer that allows the existing Portfolio Dashboard to describe stored assets across:

- FCN
- STOCK
- CRYPTO
- GRID
- DUAL
- CASH

This version does not add new input forms, migrations, external market data, broker integration, AI API integration, auth changes, membership changes, or entitlement changes.

## Why

v1.80-v1.86 established:

- Portfolio persistence.
- FCN persistence.
- Stock / Crypto storage foundations.
- FCN Worst-of readback.
- FCN Risk Engine.
- FCN Intelligence Layer.
- Portfolio Intelligence Dashboard.
- Membership / Entitlement foundation.

The next product layer needs a normalized portfolio vocabulary before IXAI expands into stock, ETF, crypto, grid, dual, and cash monitoring. Without this layer, the dashboard remains FCN-centric and future risk aggregation becomes harder to reason about.

## Architecture

```text
Portfolio
├─ FCN
├─ Stocks
├─ Crypto
├─ Grid
├─ Dual
└─ Cash
```

v1.87 adds `src/lib/portfolio/assets.ts` as the asset abstraction layer.

The abstraction exposes:

- `AssetCategory`
- `PortfolioAssetSummary`
- `buildPortfolioAssetSummary()`

## Dashboard Fields

The dashboard summary is extended additively with:

- `assetAllocationSummary`
- `assetCategoryCounts`
- `portfolioAssetCategories`

Example category counts:

```json
{
  "FCN": 5,
  "STOCK": 0,
  "CRYPTO": 0,
  "GRID": 0,
  "DUAL": 0,
  "CASH": 0
}
```

## Data Rules

v1.87 uses only stored App data:

- FCN count and notional from stored FCN positions.
- Stock count and approximate stored value from stored stock positions.
- Crypto count and approximate stored value from stored crypto positions.
- Grid / Dual counts from existing crypto `positionType` / `strategyType`.
- Cash is a reserved category and remains zero until a future cash data model is approved.

Grid and Dual are represented as crypto strategy subcategories in v1.87. They are counted separately for monitoring visibility, but their value is not double-counted outside the Crypto total.

## UI

`components/portfolio/portfolio-readback-summary.tsx` now includes a `Multi-Asset Portfolio Foundation` section.

It displays:

- Asset Categories.
- Asset Counts.
- Allocation Summary.

The UI remains readback-only. No asset input forms are added.

## Compliance Boundary

The multi-asset dashboard remains a monitoring and risk-awareness surface only.

It must not provide:

- Buy / sell recommendations.
- Target prices.
- Expected returns.
- Automated trading.
- Broker execution.
- Personalized investment advice.

## Out of Scope

- No migration.
- No Supabase schema change.
- No auth change.
- No membership or entitlement change.
- No market data API.
- No broker integration.
- No trading execution.
- No Stock / Crypto / Cash input UI.
- No AI API integration.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`

## Next

Roadmap dependency:

```text
v1.87 Multi-Asset Foundation
↓
v1.88 Stock Portfolio Foundation
↓
v1.89 Crypto/Grid Foundation
↓
v1.90 Unified Risk Engine
↓
v2.0 SaaS Beta
```
