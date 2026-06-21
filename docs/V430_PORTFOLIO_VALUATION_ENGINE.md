# v4.30 Portfolio Valuation Engine

## Goal

Create the first Portfolio Valuation Engine for IXAI Workspace by combining Portfolio Truth Layer readback with v4.20 Market Data Foundation quotes.

v4.30 turns holdings readback into estimated portfolio value, cost basis, unrealized P/L, and allocation by asset class without changing auth, schema, API contracts, broker integration, trading logic, or recommendation logic.

## Scope

v4.30 adds:

- Portfolio valuation types.
- A valuation engine for Stock, Crypto, FCN, and pending input records.
- A client-side valuation service that reuses Portfolio Truth and Market Service.
- A Portfolio Valuation Summary section inside `/my-ixai/portfolio`.

## Files Changed

- `src/lib/portfolio/valuation/portfolio-valuation-types.ts`
- `src/lib/portfolio/valuation/portfolio-valuation-engine.ts`
- `src/lib/portfolio/valuation/portfolio-valuation-service.ts`
- `components/portfolio/portfolio-valuation-summary.tsx`
- `app/my-ixai/portfolio/page.tsx`
- `docs/ROADMAP.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/PROJECT_MAP.md`
- `docs/VERSION_HISTORY.md`

## Valuation Logic

Stock valuation:

```text
marketValue = quantity × marketPrice
costBasis = quantity × averageCost
unrealizedPnl = marketValue - costBasis
```

Crypto valuation:

```text
marketValue = quantity × marketPrice
costBasis = quantity × averageCost
unrealizedPnl = marketValue - costBasis
```

FCN valuation:

```text
marketValue = notionalAmount
costBasis = notionalAmount
unrealizedPnl = 0
sourceStatus = fallback
```

FCN valuation is not a pricing engine. It is a notional placeholder until an approved FCN pricing model and price-source policy exist.

Pending input valuation:

```text
marketValue = known local pending notional, if available
costBasis = known local pending notional, if available
sourceStatus = partial
```

Pending inputs remain browser-local and are not server-persisted holdings.

## Asset Class Handling

Supported asset classes:

- `stock`
- `crypto`
- `fcn`
- `cash`
- `unknown`

The first v4.30 UI shows allocation by asset class based on estimated market value.

## Source Status Rules

Valuation source status can be:

- `live`
- `delayed`
- `fallback`
- `partial`
- `unavailable`

Stock and Crypto positions depend on v4.20 quote availability. If market quotes are unavailable, positions remain in the valuation output with `unavailable` status instead of crashing the UI.

FCN positions use `fallback` when notional amount is available.

Pending inputs use `partial` when local known notional is available.

## Compliance Boundary

v4.30 is informational and monitoring-only.

It does not add:

- Trading logic.
- Order execution.
- Broker integration.
- Investment recommendation logic.
- Target prices.
- Return promises.
- Auth changes.
- Supabase schema changes.
- Migrations.
- API contract changes.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- Optional: `QA_PORT=3001 npm run qa:mobile`
- `/my-ixai/portfolio` renders Portfolio Truth and Portfolio Valuation.
- Market quote failures show unavailable / partial valuation instead of crashing.
- FCN valuation is clearly labeled as notional placeholder only.

## Next Step After v4.30

Recommended next:

- `v4.40 FCN Risk Engine v1` or server-side market cache foundation.

Important future work:

- Persisted price snapshots.
- Provider freshness policy.
- FCN KI / KO price-source priority.
- Portfolio valuation currency conversion.
- Multi-currency reporting.
