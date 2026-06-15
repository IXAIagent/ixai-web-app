# v3.09 — FCN Position Foundation / FCN Center Data Wiring

Date: 2026-06-15

## Goal

Close the active-app FCN loop:

```text
/my-ixai/input/fcn
→ POST /api/fcn
→ Supabase fcn_positions / fcn_underlyings
→ /my-ixai/fcn readback
```

This version follows the recommendation in `docs/V309_APP_CURRENT_STATE_AUDIT.md`: use the real active-app FCN persistence path instead of adding a separate local draft store.

## Actual Data Path

The active FCN creation path is:

1. `app/my-ixai/input/fcn/page.tsx`
2. `components/fcn/fcn-wizard.tsx`
3. `POST /api/fcn`
4. `src/lib/fcn/server.ts`
5. Supabase REST writes:
   - `fcn_positions`
   - `fcn_underlyings`
6. `GET /api/fcn`
7. `components/fcn/fcn-center-workspace.tsx`
8. `app/my-ixai/fcn/page.tsx`

No new table, migration, schema change, auth change, broker integration, market data provider, AI provider, or trading logic was added.

## What Changed

`/my-ixai/fcn` is no longer a route placeholder. It now renders an FCN Center readback surface backed by the existing authenticated `/api/fcn` endpoint.

The new FCN Center displays:

- FCN count.
- Total notional grouped by currency.
- Upcoming coupon count from stored schedule data.
- Unique underlying count.
- FCN position cards.
- FCN name.
- Currency.
- Notional.
- Issuer.
- Strike.
- KI.
- KO.
- Coupon.
- Observation count / frequency label from stored schedule count.
- Underlying list.
- Created date.
- Underlying exposure counts.
- Observation / coupon schedule readback.
- Empty state when the authenticated user has no FCNs.
- Sign-in required state when no Supabase session exists.

## What FCN Center Reads

FCN Center reads the existing API response shape from `/api/fcn`:

- `FCNPosition.id`
- `FCNPosition.name`
- `FCNPosition.issuer`
- `FCNPosition.currency`
- `FCNPosition.notionalAmount`
- `FCNPosition.couponRatePct`
- `FCNPosition.strikePct`
- `FCNPosition.kiPct`
- `FCNPosition.koPct`
- `FCNPosition.status`
- `FCNPosition.createdAt`
- `FCNPosition.observationSchedule`
- `FCNPosition.underlyings`
- `FCNPosition.worstOfSummary.status`

Underlying readback includes:

- `symbol`
- `name`
- `market`
- `initialPrice`
- `currentPrice`
- `kiPrice`
- `koPrice`

Observation / coupon readback includes:

- `periodLabel`
- `observationStart`
- `observationEnd`
- `couponPaymentDate`
- `status`

## Boundary

This version intentionally does not add:

- Supabase migration.
- Schema change.
- Local draft store.
- Market data.
- Broker sync.
- AI provider.
- Risk engine expansion.
- Trading logic.
- Recommendation logic.
- Daily / Weekly / Social Pack changes.
- Public `/fcn` changes.
- Legacy frontend or FastAPI backend migration.

## Remaining Gaps

- FCN edit UI is not yet exposed in FCN Center.
- FCN delete/archive UI is not yet exposed in FCN Center.
- Observation frequency is inferred from stored schedule count; there is no dedicated frequency field in the active schema.
- Worst-of status is visible, but this version does not add KI distance, KO distance, or real market data.
- FCN Center does not yet show a dedicated detail drawer or full lifecycle workflow.
- Stock and Crypto input pages remain placeholders.
- Risk Center and Intelligence Center remain placeholders.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`

Manual QA target:

1. Login.
2. Go to `/my-ixai/input/fcn`.
3. Create an FCN.
4. Confirm `POST /api/fcn` succeeds.
5. Go to `/my-ixai/fcn`.
6. Confirm the FCN appears.
7. Reload `/my-ixai/fcn`.
8. Confirm the FCN still appears.
9. Confirm the empty state works for an authenticated account with no FCN records.
