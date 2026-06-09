# Portfolio Intelligence Dashboard v1.85

Date: 2026-06-09

## Objective

v1.85 integrates:

```text
Portfolio Foundation
→ FCN Foundation
→ Worst-of Engine
→ Risk Engine
→ Intelligence Layer
```

into the first readable Portfolio Intelligence Dashboard MVP.

The dashboard begins to give `/risk` and `/pro` a SaaS-style monitoring surface while staying within the current data contracts.

## Scope

In scope:

- Portfolio health score.
- Portfolio status.
- Risk distribution.
- Monitoring highlights.
- Additive dashboard response fields.
- Minimal UI on `/risk` and `/pro`.

Out of scope:

- No migration.
- No Supabase schema change.
- No auth change.
- No membership or entitlement change.
- No OpenAI API.
- No market data API.
- No cron change.

## New Module

New file:

- `src/lib/portfolio/intelligence.ts`

Functions:

- `calculatePortfolioHealthScore()`
- `calculateRiskDistribution()`
- `buildPortfolioStatus()`
- `buildMonitoringHighlights()`

## Dashboard Fields

Additive fields:

- `portfolioHealthScore`
- `portfolioStatus`
- `riskDistribution`
- `monitoringHighlights`

Existing dashboard fields are not removed or renamed.

## Portfolio Health Score

The health score is 0-100.

Rules:

- Higher FCN risk score lowers health score.
- More near-KI underlyings lower health score.
- Higher concentration exposure lowers health score.

This is a monitoring score only.

## Risk Distribution

Output shape:

```ts
{
  low: number;
  moderate: number;
  high: number;
}
```

The distribution is derived from FCN risk levels in the existing Worst-of / Risk Engine output.

## Monitoring Highlights

Examples:

- `MDB remains weakest underlying in stored FCN data.`
- `2 FCN underlyings remain near KI thresholds.`
- `TSLA exposure remains concentrated across FCNs.`

Highlights are deterministic and use stored dashboard fields only.

## UI

The `Portfolio Intelligence Dashboard MVP` block renders only on:

- `/risk`
- `/pro`

It displays:

- Portfolio Health.
- Health Score.
- Portfolio Status.
- Risk Distribution.
- Monitoring Highlights.

Existing sections remain:

- FCN Worst-of MVP.
- Risk Dashboard MVP.
- FCN Intelligence MVP.

## Compliance

Dashboard copy must remain:

```text
Monitoring and risk-awareness only. Not investment advice.
```

The dashboard must not produce trading instructions, target price language, return promises, or personalized portfolio actions.

## Validation

Required:

- `git diff --check`
- `npm run lint`
- `npm run build`

## Next

v1.86 should plan SaaS Membership / Entitlement and Legacy Pro convergence so FCN Risk / Intelligence workflows can become gated product capabilities.
