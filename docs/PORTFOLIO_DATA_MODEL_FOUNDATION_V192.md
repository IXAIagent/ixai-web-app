# v1.92 — Portfolio Data Model Foundation

## Summary

v1.92 upgrades the v1.91 mock Portfolio CRUD layer into the first formal Portfolio Data Model foundation.

It establishes the long-term shape:

```text
Portfolio Account
↓
Portfolio Asset
↓
Portfolio Position
```

This version adds TypeScript model files, mock repositories, and an additive Supabase migration foundation. It does not connect the UI to Supabase and does not implement real broker sync, CSV import, market data, news, AI, or trading.

## Goal

Prepare IXAI for future multi-asset input and import workflows covering:

- FCN.
- Stock.
- Crypto.
- Grid.
- Dual.
- Cash.

Future providers / sources:

- Manual.
- CSV.
- CTBC.
- Fubon.
- Yuanta.
- IBKR.
- Firstrade.
- Binance.
- Bybit.
- OKX.

## New TypeScript Model

New folder:

- `src/lib/portfolio/data-model/`

Files:

- `portfolio-account-types.ts`
- `portfolio-asset-types.ts`
- `portfolio-position-types.ts`
- `portfolio-data-model.ts`

### Portfolio Account

Fields:

- `id`
- `userId`
- `name`
- `provider`
- `region`
- `accountType`
- `currency`
- `isActive`
- `createdAt`
- `updatedAt`

Providers:

- `MANUAL`
- `CSV`
- `CTBC`
- `FUBON`
- `YUANTA`
- `IBKR`
- `FIRSTRRADE`
- `BINANCE`
- `BYBIT`
- `OKX`

### Portfolio Asset

Fields:

- `id`
- `accountId`
- `symbol`
- `name`
- `category`
- `region`
- `currency`
- `metadata`
- `createdAt`
- `updatedAt`

Categories:

- `FCN`
- `STOCK`
- `CRYPTO`
- `GRID`
- `DUAL`
- `CASH`

### Portfolio Position

Fields:

- `id`
- `assetId`
- `quantity`
- `costBasis`
- `marketValue`
- `unrealizedPnl`
- `unrealizedPnlPct`
- `createdAt`
- `updatedAt`

`marketValue` remains nullable because v1.92 does not connect market data.

## Mock Repository

New folder:

- `src/lib/portfolio/data-model/mock/`

Files:

- `mock-accounts.ts`
- `mock-assets.ts`
- `mock-positions.ts`

Mock data includes:

- `FCN717N`
- `FCN715N`
- `BTC Grid`
- `ETH Grid`
- `USDT Cash`

The v1.91 CRUD mock now derives from this data model mock repository so sample data has one source.

## Supabase Foundation

Migration:

- `supabase/migrations/012_portfolio_data_model_foundation.sql`

Tables:

- `portfolio_accounts`
- `portfolio_assets`
- `portfolio_positions`

This migration is additive only. It does not modify existing `portfolios`, `fcn_positions`, `fcn_underlyings`, `stock_positions`, or `crypto_positions`.

## RLS / Ownership

The migration enables RLS on all three new tables.

Ownership rules:

- Accounts are scoped by `user_id = auth.uid()`.
- Assets include `user_id` and must belong to an account owned by the same user.
- Positions include `user_id` and must belong to an asset owned by the same user.

This preserves the owner-only boundary for future CRUD implementation.

## Portfolio Center

`/my-ixai/portfolio` now includes a `Data Model Status` section showing:

- Accounts.
- Assets.
- Positions.

The source is the mock repository only.

## Architecture Map

The Portfolio Architecture Map now includes:

```text
Portfolio Foundation
↓
Portfolio Input Foundation
↓
Portfolio CRUD Foundation
↓
Portfolio Data Model Foundation
↓
Portfolio Dashboard
```

## Out of Scope

- No Broker API.
- No Binance API.
- No securities API.
- No News API.
- No AI API.
- No Market Data API.
- No real CSV import.
- No real sync.
- No auth change.
- No membership change.
- No entitlement change.
- No trading function.
- No UI persistence to Supabase.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- Mobile QA at 375px.
- Tablet QA at 768px.
- Desktop QA at 1280px.

## Next

v1.93 can begin CSV Import MVP by mapping uploaded / pasted rows into this Account → Asset → Position model.

v1.94 can plan Holding-Aware News Engine using user holdings, asset categories, and FCN underlyings.
