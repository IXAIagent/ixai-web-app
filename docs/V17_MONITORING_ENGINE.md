# V17.2 Monitoring Engine

Review date: 2026-07-06

## Purpose

V17.2 establishes the shared Monitoring Engine foundation for future Workspace, Notification, and Today Focus workflows.

This release is not UI, not notification delivery, not Copilot, not trading, and not investment advice. It adds deterministic monitoring contracts and pure service helpers only.

## Implemented Files

New library:

- `src/lib/intelligence/monitoring/monitoring-types.ts`
- `src/lib/intelligence/monitoring/monitoring-rule-engine.ts`
- `src/lib/intelligence/monitoring/monitoring-event-engine.ts`
- `src/lib/intelligence/monitoring/monitoring-priority.ts`
- `src/lib/intelligence/monitoring/monitoring-timeline.ts`
- `src/lib/intelligence/monitoring/today-focus-engine.ts`
- `src/lib/intelligence/monitoring/monitoring-diagnostics.ts`
- `src/lib/intelligence/monitoring/monitoring-service.ts`
- `src/lib/intelligence/monitoring/index.ts`

## Reused Foundations

V17.2 reuses:

- V17.1 Asset Intelligence objects.
- V16 Editorial Intelligence theme identifiers.
- V16 Provider Coverage concepts.
- V16 Provider Quality concepts.
- V16 failure degradation principle.

It does not create a second provider, theme, quality, or coverage framework.

## Monitoring Event Contract

Each `MonitoringEvent` includes:

- `id`
- `assetId`
- `assetType`
- `eventType`
- `title`
- `summary`
- `whyItMatters`
- `severity`
- `priorityScore`
- `confidence`
- `source`
- `relatedAssetIds`
- `relatedFcnIds`
- `relatedThemes`
- `generatedAt`
- `expiresAt`
- `actionLabel`

Action labels are monitoring-oriented only. They do not include buy, sell, hold, target price, rebalance, or recommendation language.

## Supported Event Types

The foundation supports:

- `price-move`
- `news-relevance`
- `earnings`
- `macro-event`
- `fcn-ki-risk`
- `fcn-observation`
- `fcn-coupon`
- `crypto-volatility`
- `watchlist-move`
- `portfolio-risk`
- `data-quality`
- `provider-fallback`

Some event types are reserved in the contract for future rules. V17.2 only adds deterministic foundation rules where existing source data exists.

## Rule Engine

The deterministic rule engine currently generates monitoring events for:

- unhealthy assets
- missing price
- missing news coverage
- low coverage
- FCN risk state
- crypto volatility placeholder
- stale data
- high relevance news placeholder
- degraded provider fallback

The rule engine does not call AI and does not fetch new data.

## Priority Engine

Priority score uses:

- severity
- confidence
- asset health
- coverage quality
- provider quality
- event freshness
- FCN relevance
- portfolio relevance placeholder

The score is for ordering monitoring attention only. It is not an investment recommendation or rating.

## Today Focus

`buildTodayFocus()` returns at most three focus items.

Each focus includes:

- title
- summary
- why it matters
- affected assets
- event ids
- confidence
- next monitor action

Today Focus intentionally uses monitoring language and avoids investment-advice language.

## Timeline

`buildMonitoringTimeline()` groups events into:

- today
- next 7 days
- later
- expired

This is a future surface foundation only; no Timeline UI or route behavior changed.

## Diagnostics

`buildMonitoringDiagnostics()` reports:

- event count
- critical count
- warning count
- info count
- asset coverage
- provider fallback count
- stale data count
- generated at
- readiness green / yellow / red
- blocking issues
- warning issues

## Service Layer

The service layer exports:

- `getMonitoringEvents()`
- `getTodayFocus()`
- `getMonitoringTimeline()`
- `getMonitoringDiagnostics()`
- `getMonitoringService()`

All service helpers are pure and deterministic over supplied asset/provider inputs.

## Integration Status

V17.2 is library-only.

It is not connected to:

- Workspace UI
- Notification delivery
- Telegram / LINE / Email / Push
- Scheduler
- Copilot
- Timeline UI
- Morning Brief
- API routes
- Database writes

Future V17 sprints may expose read-only previews after this contract is reviewed.

## Out of Scope

V17.2 explicitly does not add:

- Telegram / LINE / Email / Push sending
- Scheduler
- AI call
- DB schema / migration
- trading
- buy / sell / hold
- target price
- recommendation
- billing
- Workspace Copilot
- major UI redesign

## Validation

Required validation:

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

## Next Recommended Step

V17.3 should add a read-only Monitoring Diagnostics preview only after V17.2 contracts are reviewed. Notification delivery should remain separate and must use the V16 Notification Channel Router architecture.
