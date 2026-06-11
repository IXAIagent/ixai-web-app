# v1.97 — Portfolio News Intelligence Foundation

## Summary

v1.97 creates the Portfolio Intelligence Universe layer.

This release maps repository-backed portfolio assets into a deduplicated, alphabetically sorted list of tracked symbols. It prepares IXAI for future holding-aware news and AI commentary, but it does not connect any external provider.

## Goal

Build:

```text
Portfolio
↓
Intelligence Universe
```

on top of:

- Portfolio Accounts.
- Portfolio Assets.
- Portfolio Positions.
- Portfolio Persistence Provider.
- Portfolio Repository Layer.

## Data Source

The universe is repository-driven only:

```text
/my-ixai/portfolio
↓
PortfolioPersistenceProvider
↓
Repository Layer
↓
Portfolio Assets
↓
Intelligence Universe
```

No duplicate data source is introduced.

## Supported Asset Mapping

### STOCK

Uses asset symbol directly.

Example:

```text
AAPL → AAPL
TSLA → TSLA
MSFT → MSFT
```

### CRYPTO

Uses asset symbol directly.

Example:

```text
BTC → BTC
ETH → ETH
BNB → BNB
```

### FCN

Uses `metadata.underlyings` when available.

Example:

```text
FCN717N
underlyings: MSFT, ORCL, MDB
↓
MSFT, ORCL, MDB
```

### GRID / DUAL

Normalizes common pair symbols by removing stablecoin suffixes.

Example:

```text
BTCUSDT → BTC
ETHUSDT → ETH
```

### CASH

Cash assets are intentionally ignored.

## Output Contract

The generated universe contains:

- `totalTrackedSymbols`
- `symbols`
- `trackedSymbols`
- `sourceCount`
- `ignoredCashCount`

Symbols are:

- deduplicated
- normalized to uppercase
- alphabetically sorted

## Dashboard Changes

`/my-ixai/portfolio` now includes:

- Portfolio Intelligence Universe.
- Total Tracked Symbols.
- Source Mentions.
- Ignored Cash Assets.
- Responsive symbol badges.

## Architecture Update

The Architecture Map now records:

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
Portfolio News Intelligence Foundation
↓
News Provider Layer (Coming Soon)
↓
AI Commentary Layer (Coming Soon)
```

## Out of Scope

This release does not include:

- News API.
- OpenAI.
- Claude.
- Gemini.
- Market data provider.
- Broker sync.
- Supabase migration.
- Schema changes.
- API routes.
- Auth changes.
- Membership changes.
- Entitlement changes.

## Validation Checklist

- `git diff --check`.
- `npm run lint`.
- `npm run build`.
- `/my-ixai/portfolio` mobile QA at 375 / 768 / 1280.

## Next

Next work can proceed toward:

- News Provider Layer planning.
- Holding-aware news ingestion.
- AI Commentary Layer only after provider and compliance boundaries are approved.

