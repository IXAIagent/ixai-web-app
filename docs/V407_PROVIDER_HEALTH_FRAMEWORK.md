# v4.07 Provider Health Framework

## Why v4.07 Exists

v4.05 created the Market Abstraction Layer, and v4.06 made registry readiness visible in Intelligence Center. Before any real market provider is connected, IXAI needs a provider-health contract so future market services can reason about status, freshness, priority, and fallback behavior.

v4.07 adds that framework with deterministic mock health data only.

## Objective

Extend `src/lib/market/` with:

- `ProviderStatus`
- `DataFreshness`
- `ProviderPriority`
- `ProviderHealthSummary`
- fallback policy support
- deterministic mock provider health data

## Files Added

- `src/lib/market/provider-health.ts`

## Files Updated

- `src/lib/market/market-center.ts`

## Provider Health Contract

The framework defines provider-level health items with:

- provider id
- label
- status
- data freshness
- priority
- quote/news support
- fallback policy
- last checked time
- summary

## Fallback Policy

v4.07 introduces deterministic fallback policy semantics:

- real providers can later fall back to `mock`
- current `mock` provider has no fallback
- Workspace surfaces should treat this as metadata only until real provider connectivity is approved

## Deterministic Mock Health

The current health summary reports:

- provider count
- mock provider count
- healthy provider count
- unavailable provider count
- primary provider id
- fallback policy

This does not call quote, news, broker, or external market services.

## Boundaries

v4.07 does not add:

- Yahoo API
- Binance API
- CoinGecko API
- broker integrations
- external services
- API routes
- database changes
- schema changes
- migrations

## Future Direction

The Provider Health Framework prepares:

- Workspace Market Service
- provider freshness display
- stale-data warnings
- source priority
- FCN current-price source semantics
- future real provider routing after explicit approval

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- No external provider connection.
- No API route.
- No schema or migration change.
