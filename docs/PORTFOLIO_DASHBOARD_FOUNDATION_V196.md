# v1.96 — Portfolio Dashboard Foundation

## Summary

v1.96 creates the first repository-driven Portfolio Dashboard Foundation inside `/my-ixai/portfolio`.

This release visualizes the Portfolio Repository / Persistence / Ownership layers that were established in v1.90 through v1.95. It does not add a new engine, API route, migration, market data feed, broker sync, news integration, or AI commentary.

## Goal

Build the first real Portfolio Dashboard layer on top of:

- v1.90 Input Foundation.
- v1.91 CRUD Foundation.
- v1.92 Data Model Foundation.
- v1.93 Repository Foundation.
- v1.94 Persistence Foundation.
- v1.95 Ownership Validation.

## Data Source

The dashboard uses the existing Portfolio Persistence Provider and Repository Layer:

```text
/my-ixai/portfolio
↓
PortfolioPersistenceProvider
↓
Supabase Portfolio Repository
↓
portfolio_accounts / portfolio_assets / portfolio_positions
```

No duplicate mock source is introduced for the new dashboard modules.

## Dashboard Modules

### Portfolio Summary Card

Displays repository-sourced totals:

- Total Accounts.
- Total Assets.
- Total Positions.

### Asset Category Allocation

Calculates counts and percentages for:

- FCN.
- STOCK.
- CRYPTO.
- GRID.
- DUAL.
- CASH.

### Provider Allocation

Displays account counts by provider:

- MANUAL.
- BINANCE.
- BYBIT.
- OKX.
- CTBC.
- FUBON.
- YUANTA.
- IBKR.
- FIRSTRRADE.
- CSV.

### Region Allocation

Displays repository-sourced region distribution across accounts and assets:

- TW.
- HK.
- CN.
- JP.
- KR.
- US.
- EU.
- GLOBAL.

### Dashboard Status

Displays:

- Portfolio Dashboard Foundation: Enabled.
- Repository Source.
- Ownership Validation: Enabled.
- Persistence Layer: Enabled.

## Architecture Update

The Portfolio Architecture Map now records:

```text
Portfolio Foundation
↓
Portfolio Input Foundation
↓
Portfolio CRUD Foundation
↓
Portfolio Data Model Foundation
↓
Portfolio Repository Foundation
↓
Portfolio Persistence Foundation
↓
Portfolio Ownership Validation
↓
Portfolio Dashboard Foundation
↓
Portfolio Intelligence (Coming Soon)
```

## Mobile Requirements

The dashboard uses stacked cards and responsive grids:

- 375px mobile: single-column cards.
- 768px tablet: two-column sections where appropriate.
- 1280px desktop: wider grid layout.
- No table-only layout.
- No fixed-width dashboard cards.
- No horizontal overflow.

## Out of Scope

v1.96 does not implement:

- News API.
- AI commentary.
- Broker sync.
- CSV import processing.
- Market data integration.
- FCN intelligence engine changes.
- Membership changes.
- Entitlement changes.
- New migrations.
- New Supabase schema.
- New API routes.

## Validation Checklist

- `git diff --check`.
- `npm run lint`.
- `npm run build`.
- Mobile QA for `/my-ixai/portfolio` at 375 / 768 / 1280.

## Next

Next work can move toward one of:

- v1.97 Portfolio Dashboard authenticated QA and polish.
- v1.98 CSV Import MVP.
- v1.99 Holding-aware news preparation.

