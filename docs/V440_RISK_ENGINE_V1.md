# v4.40 Risk Engine v1

## Goal

v4.40 adds the first Portfolio Risk Engine v1 for the active IXAI Web App.

The goal is to convert existing Portfolio Valuation output into deterministic risk readback:

- Risk score.
- Risk level.
- Concentration warnings.
- Asset allocation warnings.
- Crypto exposure warnings.
- Market data quality warnings.
- FCN placeholder valuation awareness.

This release is a monitoring and risk-awareness foundation only.

## Scope

v4.40 reuses:

- Portfolio Truth Layer.
- v4.20 Market Data Foundation.
- v4.30 Portfolio Valuation Engine.

It does not introduce new persisted data, new routes, new providers, or new trading behavior.

## Files Changed

- `src/lib/risk/risk-engine-types.ts`
- `src/lib/risk/risk-engine.ts`
- `src/lib/risk/risk-service.ts`
- `components/risk/risk-engine-summary.tsx`
- `components/risk/global-risk-center-workspace.tsx`
- `docs/V440_RISK_ENGINE_V1.md`
- `docs/ROADMAP.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/PROJECT_MAP.md`
- `docs/VERSION_HISTORY.md`

## Risk Score Logic

Risk Engine v1 starts from zero and adds deterministic `scoreImpact` from detected signals.

The final score is capped at 100.

Signal sources:

- Single-position concentration.
- Asset-class concentration.
- Crypto exposure.
- Missing or unavailable market data.
- FCN notional placeholder valuation.

## Risk Level Logic

Risk levels:

- `low`: 0-24.
- `medium`: 25-49.
- `high`: 50-74.
- `critical`: 75-100.
- `unavailable`: no useful valuation data.

## Signal Categories

Supported categories:

- `concentration`
- `asset_allocation`
- `market_data`
- `fcn_placeholder`
- `crypto_exposure`
- `data_quality`
- `unknown`

Severity levels:

- `info`
- `warning`
- `high`
- `critical`

## Detection Rules

Concentration:

- Single position allocation >= 40% creates a high signal.
- Single position allocation >= 60% creates a critical signal.
- Single asset class allocation >= 50% creates a warning signal.
- Single asset class allocation >= 70% creates a high signal.

Crypto exposure:

- Crypto allocation >= 25% creates a warning signal.
- Crypto allocation >= 40% creates a high signal.
- Crypto allocation >= 60% creates a critical signal.

Market data:

- Any unpriced positions create a warning signal.
- Unpriced positions >= priced positions creates a high signal.
- Unavailable valuation source creates a critical data quality signal.

FCN placeholder:

- FCN notional valuation creates an informational or warning signal.
- The UI states that FCN pricing engine is not implemented yet.
- FCN notional valuation is not presented as precise market value.

## Compliance Boundary

Risk Engine v1 is informational and monitoring-only.

It does not provide:

- Investment recommendations.
- Buy / sell instructions.
- Order execution.
- Auto trading.
- Target prices.
- Return promises.

## Limitations

- FCN risk is placeholder / notional-awareness only.
- No live FCN underlying KI / KO distance monitoring is added in v4.40.
- No server-side market cache is added.
- Quote availability depends on the existing v4.20 market-service behavior.
- Missing prices remain visible as source-status and warning signals.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- Optional: `QA_PORT=3001 npm run qa:mobile`

## Next Step

Recommended next version:

- `v4.50 FCN Risk Engine v1`

v4.50 should focus on live-underlying readiness, KI / KO distance monitoring semantics, FCN pricing boundaries, and provider freshness rules without adding trading or recommendation logic.
