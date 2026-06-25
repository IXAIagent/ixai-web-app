# V15.00 Legacy Risk Engine Migration

## Goal

V15.00 migrates the reusable risk concepts identified in the legacy backend audits into the active IXAI Workspace as a read-only calculation layer.

The scope is deliberately narrow:

- Portfolio risk summary.
- FCN worst-of, KI distance, strike distance, and KO status readback.
- Concentration and repeated underlying analysis.
- Asset-class, currency, and symbol exposure readback.
- Diagnostics in Risk Center, Workspace Home, Settings, Workspace Graph, and Integration Audit.

## Architecture

V15 reads existing Workspace data only:

```text
Portfolio Truth Layer
FCN readback / Draft Store / local fallback
        ↓
Legacy Risk Engine Migration
        ↓
Risk Center / Home / Settings / Workspace Graph / Integration Audit
```

The new engine is implemented under:

- `src/lib/risk/legacy-risk-engine/risk-engine-types.ts`
- `src/lib/risk/legacy-risk-engine/risk-engine-utils.ts`
- `src/lib/risk/legacy-risk-engine/portfolio-risk-engine.ts`
- `src/lib/risk/legacy-risk-engine/fcn-risk-engine.ts`
- `src/lib/risk/legacy-risk-engine/concentration-risk-engine.ts`
- `src/lib/risk/legacy-risk-engine/exposure-risk-engine.ts`
- `src/lib/risk/legacy-risk-engine/risk-engine-service.ts`
- `src/lib/risk/legacy-risk-engine/risk-engine-diagnostics.ts`

## Risk Rules

Portfolio risk is deterministic and explainable:

- Single-symbol concentration increases risk.
- Asset-class concentration increases risk.
- Partial or unavailable data increases data-quality risk.
- Pending/local inputs are preserved and labeled as fallback data.

FCN risk is also deterministic:

- `performancePercent = (currentPrice - initialPrice) / initialPrice * 100`
- `distanceToKiPercent = (currentPrice - kiPrice) / kiPrice * 100`
- `distanceToStrikePercent = (currentPrice - strikePrice) / strikePrice * 100`
- `distanceToKoPercent = (currentPrice - koPrice) / koPrice * 100`

Risk levels:

- `critical`: KI breached or nearest KI distance is at or below 0%.
- `high`: nearest KI distance is at or below 10%, or worst-of performance is at or below -30%.
- `elevated`: nearest KI distance is at or below 20%, or worst-of performance is at or below -15%.
- `low`: usable data exists and no elevated/high/critical condition applies.
- `insufficient_data`: required FCN underlying data is missing.

## UI Sections

V15 adds compact read-only diagnostics to:

- `/my-ixai/risk`
- `/my-ixai/home`
- `/my-ixai/settings`

Risk Center now shows:

- Portfolio Risk.
- FCN Worst-of Risk.
- Concentration / Exposure.
- V15 diagnostics and limitations.

## Boundaries

V15 does not add:

- Database writes.
- Migration execution.
- Schema, RLS, auth, membership, or onboarding changes.
- Broker integration.
- Yahoo Finance or Binance integration.
- Trading, order execution, or buy/sell recommendations.
- AI model calls or AI investment recommendations.
- Morning Brief migration.
- FCN pricing engine, Greeks, Monte Carlo, or scenario simulation.

## V15.01 Safety Review Note

V15.01 reviewed the migration for safety and confirmed:

- Risk Center, Home, Settings, Workspace Graph, and Integration Audit render paths are read-only.
- The V15 engine does not call database write services, Supabase mutations, migrations, or SQL execution paths.
- Outputs are limited to risk alerts, risk explanations, exposure analysis, data-quality notes, and monitoring insight.
- The UI and diagnostics explicitly mark trading instructions as `none` and recommendation logic as disabled.
- Missing FCN underlying, price, KI, strike, KO, portfolio value, currency, or source data returns warning / partial / insufficient-data states instead of crashing.

## Fallback Preservation

V15 preserves:

- Portfolio Truth Layer fallback.
- Local pending input fallback.
- FCN Draft Store fallback.
- `/api/fcn` and existing Supabase readback.
- Legacy recent input fallback.

If source data is missing, the engine returns partial or insufficient-data states instead of throwing.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

## Next Step

V16 should migrate Morning Brief concepts only after the read-only risk migration has been validated. V16 should remain deterministic and non-advisory unless a separate AI/provider scope is explicitly approved.
