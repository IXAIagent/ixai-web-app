# FCN Risk Engine v1.83

Date: 2026-06-09

## Goal

v1.83 builds the first FCN Risk Engine layer on top of v1.82.1 Worst-of MVP.

The goal is to turn stored FCN underlyings into portfolio-level risk awareness:

- KI distance.
- Risk level.
- Portfolio risk score.
- Concentration exposure.
- Worst-of ranking.

This remains a monitoring and workflow feature, not investment advice.

## Scope

In scope:

- `calculateKiDistance()`
- `calculateRiskLevel()`
- `calculatePortfolioRiskScore()`
- `fcnExposureSummary[]`
- `fcnWorstOfRanking[]`
- Additive dashboard fields:
  - `portfolioRiskScore`
  - `nearKiCount`
  - `fcnExposureSummary`
  - `fcnWorstOfRanking`
- Risk / Pro readback UI:
  - Portfolio Risk Score.
  - Worst-of Ranking Top 5.
  - Concentration Exposure Top 5.
  - Near KI Count.

Out of scope:

- No migration.
- No live market data.
- No Supabase schema change.
- No auth change.
- No entitlement / membership change.
- No AI summary.
- No coupon or observation calendar.

## Data Contract

v1.83 uses existing production fields only:

- `fcn_underlyings.current_price`
- `fcn_underlyings.initial_price`
- `fcn_underlyings.ki_price`
- `fcn_underlyings.symbol`
- `fcn_positions.name`

If a field is missing, the related metric becomes unavailable or lower-confidence. The engine does not infer prices.

## Risk Score

The portfolio risk score is a 0-100 monitoring score derived from:

- underlyings at or near KI.
- worst-of drawdowns.
- repeated underlyings across FCNs.

It is intentionally simple and additive. It should evolve only after staging validation and product review.

## Compliance Boundary

The FCN Risk Engine must not output:

- personalized investment advice.
- product recommendations.
- buy / sell instructions.
- target prices.
- guaranteed coupons or returns.
- automated trading language.

The UI must continue to frame the output as risk awareness and monitoring.

## API / UI Changes

API changes are additive through `GET /api/portfolio/dashboard`.

No existing fields are removed or renamed.

The UI changes are limited to `PortfolioReadbackSummary` and render only on:

- `/risk`
- `/pro`

The `/fcn` page keeps the v1.82.1 Worst-of MVP readback but does not show the full Risk Dashboard MVP.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- Confirm no migration was added.
- Confirm no auth / entitlement / Supabase schema changes.
- Confirm dashboard response remains additive.

## Next

Recommended next versions:

- v1.83.1 staging API validation for FCN Risk Engine fields.
- v1.84 Portfolio Intelligence Dashboard.
- v1.85 Stock / Crypto position expansion.
