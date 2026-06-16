# v4.08 Market Service Layer

## Why v4.08 Exists

v4.05 created market provider contracts, v4.06 exposed registry readiness, and v4.07 added provider-health and fallback policy metadata.

v4.08 adds the first unified Market Service Layer so future Workspace surfaces can call one stable boundary instead of reaching directly into provider registry and health helpers.

## Objective

Create `src/lib/market/market-service.ts` with unified service entrypoints:

- `getQuote()`
- `getQuotes()`
- `getMarketSnapshot()`
- `getMarketNews()`
- `getProviderHealth()`
- `getMarketReadiness()`

## Architecture Summary

The v4.08 service layer reuses:

- Market Abstraction Layer
- provider registry
- market center helpers
- Provider Health Framework
- deterministic `MockProvider`

The service layer does not introduce any external market provider, API route, database change, schema change, migration, or API key.

## Service Contract

The service exposes read methods for quote, snapshot, news, provider health, and readiness metadata.

Symbols are normalized to uppercase before quote and news requests.

`getMarketReadiness()` returns:

- provider registry readiness
- provider health summary
- service entrypoint metadata
- generated time
- service summary

## Intelligence Center Integration

`/my-ixai/intelligence` now includes a Market Service Status section.

The section displays:

- service entrypoints
- provider health items
- mock provider count
- primary provider id
- fallback policy

The UI is metadata-only. It does not fetch live market data.

## Data Boundary

Real data:

- provider registry metadata
- provider health metadata
- deterministic mock provider contract support

Readiness only:

- service entrypoint availability
- fallback policy semantics
- future provider routing surface

Not enabled:

- live market data
- external market news
- broker data
- API-backed market service

## Out Of Scope

v4.08 does not add:

- Yahoo API
- Binance API
- CoinGecko API
- Polygon API
- Finnhub API
- broker integrations
- external services
- API routes
- database changes
- schema changes
- migrations
- trading logic
- recommendation logic

## Future Direction

v4.08 prepares:

- Workspace Market Service integration
- FCN current-price source semantics
- stale-data warnings
- provider fallback routing
- future real market provider adapters after explicit approval

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `/my-ixai/intelligence` renders Market Service Status.
- No external provider connection.
- No API route.
- No schema or migration change.
