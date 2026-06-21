# v4.50 FCN Risk Engine v1

## Goal

v4.50 adds the first FCN-native Risk Engine v1 for the active IXAI Web App.

The goal is to calculate FCN monitoring metrics from existing FCN input/readback data and v4.20 market-service quotes:

- Worst-of underlying.
- Underlying performance.
- KI distance.
- Strike distance.
- KO readiness.
- FCN risk level.
- Portfolio-level FCN risk counts.

This is a monitoring and risk-awareness release only.

## Scope

v4.50 reuses:

- Existing `/api/fcn` / Supabase FCN position readback.
- Existing local FCN draft fallback.
- Existing manual price overlay.
- v4.20 Market Service quote facade.
- Existing FCN Center workspace.

v4.50 does not add a new API route, database table, schema change, migration, broker integration, or trading workflow.

## Files Changed

- `src/lib/fcn/risk/legacy-risk.ts`
- `src/lib/fcn/risk/index.ts`
- `src/lib/fcn/risk/fcn-risk-types.ts`
- `src/lib/fcn/risk/fcn-risk-engine.ts`
- `src/lib/fcn/risk/fcn-risk-service.ts`
- `components/fcn/fcn-risk-summary.tsx`
- `components/fcn/fcn-center-workspace.tsx`
- `docs/V450_FCN_RISK_ENGINE_V1.md`
- `docs/ROADMAP.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/PROJECT_MAP.md`
- `docs/VERSION_HISTORY.md`

`src/lib/fcn/risk.ts` was preserved by moving its legacy exports into `src/lib/fcn/risk/legacy-risk.ts` and re-exporting through `src/lib/fcn/risk/index.ts`.

## FCN Risk Logic

The engine analyzes each FCN position and each underlying.

For each underlying, it calculates:

- `performancePercent = (currentPrice - initialPrice) / initialPrice * 100`
- `distanceToKiPercent = (currentPrice - kiPrice) / kiPrice * 100`
- `distanceToStrikePercent = (currentPrice - strikePrice) / strikePrice * 100`
- `distanceToKoPercent = (currentPrice - koPrice) / koPrice * 100`

The engine keeps positions visible when data is incomplete.

Missing data produces warnings instead of blocking UI readback.

## Worst-of Calculation

Worst-of is the underlying with the lowest valid `performancePercent`.

If no valid performance can be calculated, the FCN remains visible and is marked `unavailable`.

## KI / Strike / KO Distance Logic

KI distance:

- Uses `currentPrice` and `kiPrice`.
- A distance at or below 0 means KI has been breached.

Strike distance:

- Uses `currentPrice` and `strikePrice`.
- Below 0 means the underlying is below strike.

KO readiness:

- `koReady = true` only when every underlying with KO data has `currentPrice >= koPrice`.
- Missing KO or current price data keeps KO readiness false / unavailable.

## Risk Level Rules

Risk levels:

- `critical`: any underlying has breached KI, or nearest KI distance <= 0.
- `high`: nearest KI distance <= 10, or worst-of performance <= -30%.
- `medium`: nearest KI distance <= 20, or worst-of performance <= -15%.
- `low`: data available and not medium / high / critical.
- `unavailable`: insufficient data to evaluate.

## Source Status Rules

Source status:

- `live`: all analyzed data comes from live market quote results.
- `delayed`: all analyzed data comes from live or delayed quote results.
- `fallback`: data comes from manual price overlay or stored current price.
- `partial`: mixed or incomplete data.
- `unavailable`: no usable data.

## Compliance Boundary

FCN Risk Engine v1 is informational and monitoring-only.

It does not provide:

- Investment recommendations.
- Buy / sell instructions.
- Product recommendations.
- Target prices.
- Return promises.
- Order execution.
- Auto trading.

## Limitations

- No full FCN pricing engine.
- No Greeks.
- No Monte Carlo.
- No option valuation.
- No scenario simulation.
- No broker sync.
- No persisted market cache.
- Quote support is limited to the existing v4.20 market-service routing table.
- Unsupported symbols remain visible but source status may be `unavailable`.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- Optional: `QA_PORT=3001 npm run qa:mobile`

## Next Step

Recommended next version:

- `v4.60 FCN Coupon and Schedule Engine`

v4.60 should focus on coupon observation schedules, coupon payment dates, maturity timelines, overdue event handling, and schedule-readiness warnings without adding trading or recommendation logic.
