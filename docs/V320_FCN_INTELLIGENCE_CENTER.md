# v3.20 FCN Intelligence Center

## Problem Statement

Before v3.20, `/my-ixai/fcn` had two useful but incomplete layers:

- v3.09 made FCN positions readable from the active `/api/fcn` → Supabase persistence path.
- v3.10 added first-pass KI-distance risk readback using stored current price.

The workspace still lacked the day-to-day management surfaces users need for FCN monitoring: lifecycle status, manual price updates before live market data exists, timeline / event review, richer risk scoring, and concentration visibility.

## Previous Foundation

- v3.08a: local FCN Draft Store bridge from FCN Wizard to FCN Center.
- v3.09: persisted FCN Position Foundation using `/my-ixai/input/fcn` → `POST /api/fcn` → Supabase `fcn_positions` / `fcn_underlyings` → `/my-ixai/fcn`.
- v3.10: FCN Risk Foundation using stored `currentPrice` and `kiPrice` for KI distance and RED / YELLOW / GREEN / UNKNOWN risk status.

v3.20 keeps those versions as historical foundations and upgrades the active FCN Center rather than replacing the data path.

## What v3.20 Adds

- FCN Lifecycle readback and filtering.
- Manual current-price overlay stored in browser localStorage.
- FCN Timeline / Event Center.
- FCN Risk Engine v2 helper logic.
- Risk score readback.
- Underlying concentration with count, notional, risk status, and missing-price flag.
- Future Global Risk Center foundation by making FCN Center outputs more structured and reusable.

## Data Assumptions

- FCN positions continue to come from `GET /api/fcn`.
- Underlyings continue to come from Supabase `fcn_underlyings`.
- Manual prices are local overlays only, stored under `ixai.fcn.manual-prices.v320`.
- Manual prices are not persisted to Supabase in v3.20.
- No live market data provider is connected.
- Lifecycle status uses the existing `status` field and safe client-side derivation for past maturity dates.

## Risk Rules

KI distance formula:

```text
distance_to_ki_pct = (current_price - ki_price) / ki_price * 100
```

Risk status:

- `RED`: any valid underlying is at or below KI, or `distance_to_ki_pct <= 0`.
- `YELLOW`: worst valid KI distance is `<= 10%`.
- `GREEN`: worst valid KI distance is `> 10%`.
- `UNKNOWN`: missing current price, invalid KI, invalid initial price, or no valid underlying data.

Known RED risk overrides missing data so a known KI breach is not hidden.

Risk score:

- `RED`: 80-100.
- `YELLOW`: 50-79.
- `GREEN`: 0-49.
- `UNKNOWN`: no numeric score.

The score is deterministic and explainable. It uses worst KI distance, missing price count, lifecycle status, and next-event proximity. It is not an AI score.

## UI Sections

`/my-ixai/fcn` now contains:

1. Overview.
2. Risk Summary.
3. Positions.
4. Lifecycle.
5. Price Update.
6. Timeline / Event Center.
7. Underlying Concentration.

## Known Limitations

- Archive / restore actions are displayed as disabled until lifecycle persistence receives dedicated API QA.
- Manual price updates are local browser overlays and do not update Supabase.
- No external market data is connected.
- No price freshness / stale-price semantics exist yet.
- Timeline depends on stored observation, coupon, and maturity dates; missing dates produce graceful empty states.
- KO distance and full payoff monitoring are still future work.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- Local route smoke: `GET /my-ixai/fcn` should return 200.

## Remaining Gaps

- Persisted underlying current-price update workflow.
- FCN edit / archive / restore lifecycle actions.
- KO distance.
- Observation calendar detail view.
- Coupon calendar detail view.
- Price freshness and market data provider health.
- Notification / alert delivery.

## Future v3.30 Global Risk Center Direction

v3.20 structures FCN outputs so a future Global Risk Center can consume:

- FCN risk status.
- FCN risk score.
- Underlying concentration.
- Timeline events.
- Lifecycle status.
- Missing-price / stale-data flags.

v3.30 should connect FCN Center, Portfolio Center, and Risk Center through shared risk contracts while preserving the boundary that IXAI provides monitoring and risk awareness, not trading instructions or personalized investment recommendations.
