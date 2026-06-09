# FCN Worst-of Engine v1.82.1

Date: 2026-06-09

## Goal

v1.82.1 adds the first FCN Risk Engine capability on top of the production v1.80 / v1.81 Portfolio + FCN Foundation.

The MVP calculates Worst-of from stored FCN underlyings and exposes the result through FCN API readback and Portfolio dashboard summary surfaces.

## Scope

In scope:

- Pure Worst-of calculation from stored `fcn_underlyings`.
- Each underlying return percentage.
- Worst underlying symbol / name.
- Worst return percentage.
- Worst underlying current price and initial price.
- Additive API fields only.
- Minimal UI readback on FCN / Risk / Pro surfaces.

Out of scope:

- KI distance.
- KO distance.
- Strike distance.
- Coupon calendar.
- Observation calendar.
- FCN risk score.
- Real market price providers.
- AI summary.
- Membership, billing, or entitlement changes.
- Auth, Legacy Pro, LINE, Social Pack, Daily / Weekly intelligence, or production environment changes.

## Data Model

No new migration is required for v1.82.1.

The production `fcn_underlyings` table already includes:

- `initial_price numeric`
- `current_price numeric`

The FCN Wizard already supports manual current price input. v1.82.1 therefore treats `current_price` as a manually stored monitoring field and does not fetch or infer live prices.

## Calculation Formula

For each underlying:

```text
returnPct = (current_price - initial_price) / initial_price * 100
```

The Worst-of underlying is the underlying with the lowest calculated return percentage.

The risk engine response includes:

- `riskEngineVersion: "v1.82.1"`
- `status`
- `underlyings[]`
- `worstUnderlyingSymbol`
- `worstUnderlyingName`
- `worstUnderlyingReturnPct`
- `worstUnderlyingCurrentPrice`
- `worstUnderlyingInitialPrice`

## Missing Price Behavior

The engine returns explicit statuses:

- `ready`: all required prices are present and valid.
- `missing_current_price`: at least one underlying has no current price.
- `missing_underlyings`: the FCN has no underlyings.
- `invalid_initial_price`: at least one underlying has missing, zero, or invalid initial price.

If current price is missing, the UI displays:

```text
尚未有現價或完整標的價格，待補價格後計算 Worst-of。
```

No fake market data is generated.

## API / UI Changes

API changes are additive:

- `GET /api/fcn`
- `GET /api/fcn/[id]`
- `POST /api/fcn`
- `PATCH /api/fcn/[id]`
- `DELETE /api/fcn/[id]`

Each returned FCN position now includes `worstOfSummary`.

Dashboard readback also includes additive fields:

- `fcnWorstOfReadyCount`
- `fcnWorstOfMissingCurrentPriceCount`
- `fcnWorstOfMissingUnderlyingsCount`
- `fcnWorstOfInvalidInitialPriceCount`
- `fcnWorstOfSummaries[]`

Minimal UI readback appears on:

- `/fcn`
- `/risk`
- `/pro`

The UI uses stored manual prices only and includes a compliance note that Worst-of is monitoring / risk-awareness output, not investment advice.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- Confirm no migration was added.
- Confirm `/api/fcn` responses remain backward-compatible and additive.
- Confirm `/api/portfolio/dashboard` returns additive Worst-of summary fields.
- Confirm `/fcn`, `/risk`, and `/pro` can render readback without real price providers.

## Compliance Boundary

FCN Worst-of output is a monitoring and risk-awareness calculation.

It must not provide:

- Personalized product recommendation.
- Buy / sell instruction.
- Target price.
- Coupon promise.
- Guaranteed return language.
- Automated trading instruction.

## Next

v1.82.2 should add KI Distance Engine:

- distance to KI by underlying.
- KI breach awareness.
- missing KI price handling.
- UI readback for KI proximity.
