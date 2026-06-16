# v4.01 Portfolio Truth Layer

## Why v4.01 Exists

v4.00 identified a core product gap: Portfolio Center, Risk Center, and Intelligence Center could each read FCN / Stock / Crypto data separately, but there was no shared normalized readback. This could make Portfolio Center show zero assets while FCN, Stock, or Crypto records already existed elsewhere.

v4.01 establishes the first Workspace Portfolio Truth Layer so the three centers can read the same holdings summary and source status.

## Problem Statement

Before v4.01:

```text
Portfolio Center
Risk Center
Intelligence Center
```

could each depend on separate API reads, placeholder counts, or readiness logic.

After v4.01:

```text
/api/fcn
/api/stocks
/api/crypto
/api/portfolio/dashboard
        ↓
Portfolio Truth Layer
        ↓
Portfolio Center
Risk Center
Intelligence Center
```

The product now has one shared read model for current holdings, known notional, source status, missing data warnings, and available symbols.

## Source Systems Reused

v4.01 reuses existing active-app sources only:

- `/api/fcn`
- `/api/stocks`
- `/api/crypto`
- `/api/portfolio/dashboard`
- Existing FCN / Stock / Crypto position types
- Existing authenticated Supabase client headers

No API route, schema, migration, broker integration, market data provider, external news provider, or AI provider was added.

## Normalized Portfolio Truth Layer Contract

The new readback includes:

- `totalAssets`
- `totalFcnPositions`
- `totalStockPositions`
- `totalCryptoPositions`
- `totalGridPositions`
- `totalDualPositions`
- `fcnNotional`
- `stockNotionalKnown`
- `cryptoNotionalKnown`
- `totalKnownNotional`
- `underlyingSymbols`
- `stockSymbols`
- `cryptoSymbols`
- `topAvailableSymbols`
- `dataSourceStatuses`
- `missingDataWarnings`
- `lastRefreshedAt`
- `readinessLevel`

If price, quantity, or notional fields are missing, IXAI does not invent market value. It reports known notional only and records a missing-data warning.

## Portfolio Center Consumption

`/my-ixai/portfolio` now uses the Portfolio Truth Layer for its overview readback:

- Total assets
- FCN count
- Stock count
- Crypto count
- Grid / Dual count from Crypto records
- Known notional
- Source status
- Missing data notes

This fixes the core issue where Portfolio Center could remain visually disconnected from records created in FCN / Stock / Crypto flows.

## Risk Center Consumption

`/my-ixai/risk` now reads Portfolio Truth first, then passes the same positions into the existing v3.30 Global Risk Center builder. The v3.30 Foundation Score and FCN helper reuse remain unchanged.

Risk Center now shows:

- Portfolio Truth source status
- Total holdings
- FCN count
- Stock count
- Crypto count
- Existing multi-asset readiness cards

## Intelligence Center Consumption

`/my-ixai/intelligence` now reads Portfolio Truth first and uses it to label portfolio-aware readiness. Intelligence Center now shows:

- Portfolio Truth readiness
- Holdings count
- FCN / Stock / Crypto counts
- Top available symbols
- Missing data warnings

No AI commentary, external news feed, market provider, or invented insight was added.

## What Is Real Data

Real readback:

- Persisted FCN positions from `/api/fcn`.
- Persisted Stock positions from `/api/stocks` when available.
- Persisted Crypto positions from `/api/crypto` when available.
- Existing Portfolio Dashboard summary from `/api/portfolio/dashboard`.

## What Remains Readiness / Placeholder

Still readiness-only:

- Real market value when current price is missing.
- Stock / Crypto risk engines.
- Portfolio-aware news.
- External news provider.
- External AI commentary.
- Broker sync.
- Live market data.

## No Schema / Migration Boundary

v4.01 adds no schema change, no migration, no new table, and no new persistence model. It is a readback normalization layer only.

## Compliance Boundary

v4.01 remains data organization, monitoring, and intelligence workflow infrastructure only.

It does not provide:

- Investment recommendations.
- Buy / sell instructions.
- Position sizing.
- Target prices.
- Return promises.
- Order execution.
- Auto trading.

## Future v4.02 / v4.03 Dependencies

v4.02 should add a Workspace Market Service that wraps existing public market / quote providers with source, timestamp, stale, fallback, and provider-status semantics.

v4.03 should then connect FCN current-price semantics to the Workspace Market Service while preserving manual price overrides and clear freshness labels.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- Route smoke:
  - `/my-ixai/portfolio`
  - `/my-ixai/risk`
  - `/my-ixai/intelligence`
  - `/my-ixai/fcn`
  - `/my-ixai/input`
