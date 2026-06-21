# v4.70 Server-side Market Cache Layer

## Goal

Introduce a memory-only market cache layer between public market providers and downstream IXAI consumers. The goal is reliability and architecture hygiene, not a new investment feature.

## Scope

v4.70 adds:

- Market cache types, store, service, and barrel exports under `src/lib/market/cache/`.
- Cache-first routing for `getMarketQuote()`, `getMarketQuotes()`, and `getDefaultWorkspaceMarketQuotes()`.
- Compact cache diagnostics inside Workspace Market Status.
- Documentation updates for the new market-provider path.

v4.70 preserves:

- Existing Market Service public API names.
- Existing Yahoo Finance and Binance quote adapters.
- Existing Portfolio Valuation, Risk Engine, FCN Risk, and FCN Schedule consumer contracts.

## Architecture Before

```text
Yahoo Finance
Binance
↓
Market Service
↓
Valuation
Risk
FCN Risk
```

## Architecture After

```text
Yahoo Finance
Binance
↓
Market Cache Layer
↓
Market Service
↓
Valuation
Risk
FCN Risk
FCN Schedule
```

## Files Changed

- `src/lib/market/cache/market-cache-types.ts`
- `src/lib/market/cache/market-cache-store.ts`
- `src/lib/market/cache/market-cache-service.ts`
- `src/lib/market/cache/index.ts`
- `src/lib/market/market-service.ts`
- `components/market/market-cache-status.tsx`
- `components/market/workspace-market-status.tsx`

## Cache TTL Rules

- Equities: 15 minutes.
- Crypto: 2 minutes.

The cache is runtime memory only. It does not use Supabase, Redis, file storage, or a database.

## Fallback Rules

- Fresh cache hit: return cached quote.
- Stale cache hit: attempt provider refresh.
- Stale refresh failure: return stale quote with `fallback` source status.
- No cached quote and provider failure: return `unavailable`.
- Unsupported symbol: return `unavailable`.

The cache layer must never crash downstream Workspace readback.

## Diagnostics

Workspace Market Status now shows:

- cache entries
- fresh count
- stale count
- unavailable count
- last refresh timestamp

This diagnostic surface is informational only and does not expose trading or recommendation behavior.

## Limitations

- Memory cache is per runtime instance and may reset on deployment, cold start, or browser/runtime reload.
- No Redis, Supabase, durable cache, or server-side persistence is added.
- No new external provider is added.
- No FCN pricing engine is added.
- No broker integration, trading workflow, recommendation logic, auth change, schema change, migration, or API contract change is added.

## Compliance Boundary

Market data and cache diagnostics are informational only. IXAI does not provide buy/sell instructions, target prices, order execution, automated trading, guaranteed returns, or personalized investment recommendations.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

## Next Step

Recommended next sprint: v4.80 FCN Scenario Monitoring or durable server-side market cache review. Any durable cache should be approved separately because it may require infrastructure, runtime, or API-surface decisions.
