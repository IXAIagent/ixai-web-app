# v4.05 Market Abstraction Layer

## Why v4.05 Exists

IXAI now has Portfolio Truth, Risk Intelligence, and Intelligence Readback layers. The next integration dependency is a shared market abstraction that future Workspace features can consume without coupling directly to Yahoo, Binance, CoinGecko, broker feeds, or any single provider.

v4.05 creates the provider contracts only.

## Objective

Create a foundation under `src/lib/market/` for:

- `MarketQuote`
- `MarketSnapshot`
- `MarketNews`
- `MarketProvider`
- provider registry
- deterministic mock provider
- market center builder helpers

## Files Added

- `src/lib/market/market-types.ts`
- `src/lib/market/market-provider.ts`
- `src/lib/market/provider-registry.ts`
- `src/lib/market/market-center.ts`

## Provider Contract

`MarketProvider` defines:

- provider identity
- provider status
- quote support
- news support
- symbol support
- quote snapshot method
- news snapshot method

The contract is intentionally provider-agnostic.

## MockProvider

v4.05 adds a deterministic `MockProvider` / `mockMarketProvider`.

It supports a small fixed symbol set for contract validation, including:

- BTC
- ETH
- AAPL
- TSLA
- NVDA
- MSFT
- MDB
- ORCL
- AVGO
- PLTR
- GOOGL

The mock provider does not call external APIs. It exists only to validate shape, registry behavior, and future Workspace integration points.

## Market Center

`market-center.ts` provides:

- `buildMarketSnapshot()`
- `buildMarketNewsSnapshot()`
- `getMarketProviderStatus()`

These helpers route through the registry and default to the mock provider.

## Boundaries

v4.05 does not add:

- Yahoo API
- Binance API
- CoinGecko API
- broker integrations
- API keys
- news providers
- external services
- API routes
- database changes
- schema changes
- migrations

## Relationship To Existing Market Code

The App already has existing market-data utilities and public market routes. v4.05 does not remove, rewrite, or replace them.

The new `src/lib/market/` abstraction is a Workspace-facing contract foundation for future v4.x integration work.

## Future Direction

Future sprints can use this contract to add:

- Workspace Market Service
- provider source status
- timestamp and stale-data semantics
- FCN current price source semantics
- market-aware Intelligence Center summaries

Any real provider connection must be explicitly approved in a later sprint.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- No external provider connection.
- No API route.
- No schema or migration change.
