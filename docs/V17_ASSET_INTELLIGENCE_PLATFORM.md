# V17.1 Asset Intelligence Platform

Review date: 2026-07-06

## Purpose

V17.1 starts the V17 major version by creating the shared Workspace Asset Intelligence Layer.

This is not a UI sprint, not a monitoring engine, and not a notification system. It establishes the common Intelligence Object that every future asset workflow can use before V17 adds monitoring, alerts, or user-facing automation.

## Product Position

V17 moves from public AI Financial Media into Workspace asset understanding.

The product question for this layer is:

```text
What does IXAI know about this asset, and is that knowledge ready for future monitoring?
```

This layer supports V16B's later AI Investment Monitoring direction but does not implement monitoring yet.

## Implemented Files

New library:

- `src/lib/intelligence/assets/asset-types.ts`
- `src/lib/intelligence/assets/asset-intelligence.ts`
- `src/lib/intelligence/assets/asset-graph.ts`
- `src/lib/intelligence/assets/asset-service.ts`
- `src/lib/intelligence/assets/asset-health.ts`
- `src/lib/intelligence/assets/asset-readiness.ts`
- `src/lib/intelligence/assets/asset-summary.ts`
- `src/lib/intelligence/assets/asset-diagnostics.ts`
- `src/lib/intelligence/assets/index.ts`

## Supported Assets

The shared Asset Intelligence Object supports:

- Stock
- ETF
- Crypto
- FCN
- Watchlist
- Cash placeholder
- Future Asset placeholder

Cash and Future Asset are intentionally placeholders so future asset classes can join the same contract without schema work.

## Asset Intelligence Object

Each `AssetIntelligence` includes:

- `id`
- `assetType`
- `symbol`
- `displayName`
- `market`
- `currency`
- `status`
- price state
- news state
- event state
- risk state
- monitoring state
- health
- coverage
- quality
- related assets
- related FCN
- related watchlist
- last updated
- readiness
- themes

The object is product-neutral and can be used by Portfolio, FCN, Watchlist, and future monitoring surfaces.

## Asset Graph

`buildAssetGraph()` creates asset relationships:

- same symbol
- same sector / market
- same theme
- same FCN
- same watchlist
- same portfolio

The graph does not call AI, does not fetch data, and does not infer trading recommendations.

## Asset Summary

`buildAssetSummary()` produces:

- portfolio asset summary
- market summary
- risk summary
- coverage summary
- quality summary

These summaries are foundation metrics for later Workspace monitoring work.

## Asset Diagnostics

`buildAssetDiagnostics()` reports:

- asset count
- healthy assets
- warning assets
- offline assets
- missing price
- missing news
- missing coverage

This is the operational visibility layer for future V17 work.

## Asset Readiness

`buildAssetReadiness()` maps diagnostics into:

- green
- yellow
- red

It also returns:

- blocking issues
- warning issues
- next action

Readiness is intentionally conservative. It is not a signal, rating, or recommendation.

## Asset Health

`buildAssetHealth()` maps price, news, event, coverage, and quality states into:

- healthy
- degraded
- offline
- unknown

Health explains data coverage quality only. It does not describe investment attractiveness.

## Service Layer

The service layer exports:

- `getAssetIntelligence()`
- `getAssetSummary()`
- `getAssetDiagnostics()`
- `getAssetGraph()`
- `getAssetReadiness()`
- `getAssetIntelligenceService()`

All services are pure functions over supplied data. They do not fetch, mutate, subscribe, schedule, call AI, or write to storage.

## Existing Model Integration

The first integration is contract-level and uses existing model types:

- Portfolio: `PositionValuation`
- FCN: `FCNPosition`
- Watchlist: `WorkspaceWatchlistItemReadback`

No database schema, API contract, route, or UI was changed.

## V16 Reuse

V17.1 reuses V16 concepts instead of creating a parallel system:

- Editorial theme identifiers from V16 Editorial Intelligence.
- Provider coverage areas from V16 Provider Layer.
- Provider quality concepts from V16 Provider Layer.
- Failure degradation principle from V16 Architecture.

Asset Intelligence is the Workspace-side object layer that can later connect to V16-style source coverage, quality, and relevance.

## Out of Scope

V17.1 explicitly does not add:

- Monitoring Engine
- Telegram
- LINE
- Push notification
- Notification delivery
- AI call
- Scheduler
- Trading
- Recommendation
- Billing
- Workspace Copilot behavior
- Timeline behavior
- Morning Brief behavior
- API route
- DB schema
- migration

## Validation

Required validation:

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

## Next Recommended Step

V17.2 should connect this object layer to read-only Workspace diagnostics or preview surfaces only after the V17.1 contracts are stable.

V17 monitoring should remain a later phase and should not begin until the Asset Intelligence Object has been reviewed.
