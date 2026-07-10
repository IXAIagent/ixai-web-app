# V20A Intelligence Platform

Review date: 2026-07-10

## Executive Summary

V20A establishes the shared IXAI Intelligence Platform data layer.

This is not a new Portfolio engine, Risk engine, FCN engine, Monitoring engine, Editorial engine, Provider, Scheduler, AI model call, notification delivery system, or trading / recommendation surface.

The goal is to normalize the existing V16 / V17 / V18 read models into one request-scoped intelligence snapshot that future Workspace UI can consume safely.

## Product Boundary

V20A answers:

```text
What does IXAI already know across Portfolio, Market, Risk, FCN, Monitoring, and data quality?
```

It does not answer:

```text
What should the user buy, sell, hold, trade, or rebalance?
```

Every output is monitoring-only, explain-only, and compliance-safe.

## Architecture Reused

V20A reuses:

- V16 Editorial Provider diagnostics and source status.
- V17.1 Asset Intelligence.
- V17.2 Monitoring Events and Today Focus.
- V17.3 Notification Preview.
- V17.4 Workspace Intelligence concepts.
- Existing Portfolio valuation read model.
- Existing Portfolio risk summary.
- Existing FCN risk summary.
- Existing FCN schedule summary.
- Existing Watchlist summary.

## New Library

New path:

```text
src/lib/intelligence/platform/
```

Exports:

- `getIntelligencePlatformSnapshot()`
- `getPortfolioIntelligenceSnapshot()`
- `getMarketIntelligenceSnapshot()`
- `getRiskIntelligenceSnapshot()`
- `getFcnIntelligenceSnapshot()`
- `getTodayFocusV2()`
- `getIntelligencePlatformDiagnostics()`

## Shared Contracts

The platform owns normalized contracts for:

- `IntelligenceDomain`
- `IntelligenceSourceState`
- `IntelligenceHealth`
- `IntelligencePriority`
- `IntelligenceConfidence`
- `IntelligenceItem`

Every `IntelligenceItem` includes:

- domain
- title
- summary
- why it matters
- what to inspect
- priority
- health
- confidence
- related assets
- related symbols
- related FCNs
- source state
- generated time
- freshness
- limitations

## Request-Scoped Context

V20A uses one request-scoped context builder:

```text
Existing read models
↓
Guarded source reads
↓
IntelligencePlatformContext
↓
Pure domain snapshot builders
↓
Platform snapshot
```

The platform avoids repeated per-section fan-out by collecting source data once, then passing the same context into Portfolio, Market, Risk, FCN, Today Focus, and Diagnostics builders.

## Degradation Policy

Failure policy:

```text
Single module failure -> source error -> limited snapshot -> no throw
```

Examples:

- Portfolio unavailable -> Portfolio snapshot becomes limited.
- Market provider unavailable -> Market snapshot uses watchlist / monitoring / fallback diagnostics.
- Risk unavailable -> Risk snapshot reports limited coverage.
- FCN empty -> FCN snapshot reports limited FCN coverage.
- Provider degraded -> confidence falls and diagnostics show warnings.

Provider failure must degrade intelligence, not crash the product.

## Today Focus v2

Today Focus v2 merges:

- Monitoring Today Focus
- Risk items
- FCN items
- Portfolio items
- Market items

It then:

- deduplicates related events
- sorts urgent / high before normal / low
- limits output to three focus items
- keeps data-quality issues separate unless urgent
- avoids investment advice language

## Diagnostics

Diagnostics report:

- readiness: green / yellow / red
- degraded domains
- source errors
- warning issues
- blocking issues
- item count
- confidence coverage
- request-scoped context flag
- single-module-failure safe flag
- raw-provider-payload exposure flag

## UI Integration Decision

V20A does not add new first-screen UI.

Reason:

- The current Intelligence page already has historical client-side async loaders.
- V20A is a shared platform layer and should not add new client mount fan-out.
- A server-safe service plus QA validation fixture is lower risk for this foundation phase.

Future V20B / V20C can productize this snapshot into UI once page-level performance and route ownership are defined.

## Validation Coverage

The V20A validation script checks:

- platform contracts
- exported service API
- V16 / V17 / V18 service reuse
- request-scoped fan-out pattern
- guarded source reads
- Today Focus v2 dedupe
- diagnostics safety flags
- no AI provider calls
- no direct Supabase table query
- no timers
- no browser storage dependency
- no recommendation wording

Command:

```bash
npm run qa:v20a-intelligence
```

## Out of Scope

V20A does not add:

- product UI redesign
- new API routes
- database schema
- migrations
- Supabase auth / RLS changes
- market providers
- schedulers
- AI provider calls
- Telegram / LINE / Email / Push sending
- Copilot behavior
- trading
- recommendation
- target price
- buy / sell / hold language
- billing

## Next Steps

Recommended next tracks:

1. V20B — Intelligence Alert Foundation.
2. V20C — Productized Intelligence UI integration.
3. V20D — Authenticated Workspace beta validation.
