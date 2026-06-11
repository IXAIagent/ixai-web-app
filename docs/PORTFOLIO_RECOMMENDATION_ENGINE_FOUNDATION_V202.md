# v2.02 — Portfolio Recommendation Engine Foundation

## Objective

Build the first Portfolio Recommendation Engine Foundation on top of the existing portfolio chain:

```text
Portfolio Assets
↓
News
↓
Commentary
↓
Intelligence
↓
Risk
↓
Recommendation
```

This version is foundation-only. It introduces deterministic monitoring prompts generated from the existing mock Portfolio Risk Report. It does not connect external AI, market data, broker sync, News API, or trading systems.

## Scope

- Add Portfolio Recommendation types.
- Add Portfolio Recommendation Engine contract.
- Add deterministic mock recommendation engine.
- Add recommendation builder from Portfolio Risk Report.
- Add Portfolio Recommendation Engine readback inside `/my-ixai/portfolio`.
- Update Portfolio Architecture Map.

## Recommendation Types

`PortfolioRecommendation` includes:

- `id`
- `title`
- `description`
- `category`
- `priority`
- `severity`
- `generatedAt`

Supported categories:

- `CONCENTRATION`
- `FCN`
- `CRYPTO`
- `CASH`
- `DIVERSIFICATION`
- `RISK`
- `GENERAL`

Supported severity:

- `INFO`
- `LOW`
- `MODERATE`
- `HIGH`

## Engine Contract

`PortfolioRecommendationEngine` exposes:

```ts
generateRecommendations(input)
```

The active v2.02 implementation is mock-only and deterministic.

## Deterministic Logic

Rules:

- High concentration risk produces `Reduce concentration risk`.
- High FCN risk produces `Monitor FCN exposure`.
- High crypto risk produces `Monitor crypto volatility`.
- High cash buffer risk produces `Review liquidity reserve`.
- High diversification risk produces `Consider broader diversification`.
- Critical overall risk produces `Portfolio risk elevated`.
- If no rule is triggered, a low-priority general monitoring prompt is returned.

All output is workflow and monitoring language only. It must not produce ticker-specific trading instructions, price targets, order instructions, stop prices, profit-taking prices, or automated execution language.

## Dashboard Integration

`/my-ixai/portfolio` now includes:

- Recommendation Count.
- High Priority Count.
- Generated Time.
- Recommendation Cards.
- Recommendation summary.

The dashboard reuses the existing Repository → News → Commentary → Intelligence → Risk chain and does not introduce a duplicate data source.

## Architecture Update

The Portfolio Center architecture sequence is now:

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
Portfolio News Provider Foundation
↓
Portfolio AI Commentary Foundation
↓
Portfolio Intelligence Engine Foundation
↓
Portfolio Risk Engine Foundation
↓
Portfolio Recommendation Engine Foundation
↓
Broker Sync Foundation (Coming Soon)
```

## Compliance Boundary

Portfolio Recommendation Engine Foundation is monitoring and risk-awareness only.

It must not generate:

- Ticker-specific buy or sell instructions.
- Order instructions.
- Position sizing instructions.
- Price targets.
- Stop-loss or take-profit levels.
- Guaranteed performance language.
- Automated trading language.

## Out of Scope

- No migration.
- No schema change.
- No API route.
- No auth change.
- No membership change.
- No entitlement change.
- No market data.
- No broker sync.
- No News API.
- No external AI.
- No trading function.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- Mobile QA for `/portfolio` and `/my-ixai/portfolio` at 375px, 768px, and 1280px.

