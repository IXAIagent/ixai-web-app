# v4.60 FCN Coupon & Schedule Engine

## Goal

v4.60 adds the first FCN Coupon & Schedule Engine for the active IXAI Web App.

The goal is to turn existing FCN schedule data into monitoring readback:

- Upcoming coupon dates.
- Observation dates.
- KO observation dates.
- Maturity awareness.
- Next 30 day event list.
- Monthly expected coupon cashflow when explicit coupon amount data exists.
- Per-position schedule warnings.

This release is monitoring and workflow organization only.

## Scope

v4.60 reuses:

- Existing `/api/fcn` / Supabase FCN position readback.
- Existing local FCN draft fallback.
- Existing FCN Center workspace.
- Existing observation schedule fields.
- Common metadata schedule shapes when available.

v4.60 does not add a new API route, database table, schema change, migration, broker integration, tax reporting, pricing engine, or trading workflow.

## Files Changed

- `src/lib/fcn/schedule/fcn-schedule-types.ts`
- `src/lib/fcn/schedule/fcn-schedule-engine.ts`
- `src/lib/fcn/schedule/fcn-schedule-service.ts`
- `src/lib/fcn/schedule/index.ts`
- `components/fcn/fcn-schedule-summary.tsx`
- `components/fcn/fcn-center-workspace.tsx`
- `docs/V460_FCN_COUPON_SCHEDULE_ENGINE.md`
- `docs/ROADMAP.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/PROJECT_MAP.md`
- `docs/VERSION_HISTORY.md`

## Schedule Normalization Logic

The engine reads existing FCN position fields where possible.

It supports these shapes:

- `observationSchedule`
- `couponSchedules`
- `coupon_schedule`
- `observationSchedules`
- `observation_schedule`
- `schedule`
- `observations`
- `couponDates`
- `coupon_dates`

Missing or malformed schedule records do not block rendering.

The FCN stays visible and receives partial / unavailable source status plus warnings.

## Urgency Rules

Urgency is calculated with local date logic:

- `overdue`: event date < today.
- `due_soon`: event date between today and today + 7 days.
- `upcoming`: event date between today + 8 and today + 30 days.
- `future`: event date > today + 30 days.
- `unavailable`: no usable event date.

## Monthly Cashflow Logic

Monthly cashflows group coupon events by `YYYY-MM` and currency.

Expected coupon amount is included only when explicit amount data exists in the source schedule.

If coupon amount is missing, the event remains visible but no amount is invented.

## Compliance Boundary

FCN Coupon & Schedule Engine is informational and monitoring-only.

It does not provide:

- Tax reporting.
- Investment recommendations.
- Buy / sell instructions.
- Product recommendations.
- Order execution.
- Auto trading.
- Target prices.
- Return promises.

## Limitations

- No full FCN pricing engine.
- No tax reporting.
- No coupon accrual accounting.
- No broker confirmation.
- No payment settlement reconciliation.
- No schema or API contract changes.
- Coupon amounts are expected / estimated only when explicit source amount data exists.
- If existing FCN records contain dates but no coupon amount, the UI shows events without expected amount.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- Optional: `QA_PORT=3001 npm run qa:mobile`

## Next Step

Recommended next version:

- `v4.70 Server-side Market Cache or FCN Scenario Monitoring`

v4.70 should focus on provider freshness, server-side market caching, or deterministic FCN scenario monitoring without adding trading or recommendation logic.
