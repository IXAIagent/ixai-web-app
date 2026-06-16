# v4.02 Portfolio Intelligence UI

## Why v4.02 Exists

v4.01 created the shared Portfolio Truth Layer. v4.02 turns that readback into visible Portfolio Intelligence inside `/my-ixai/portfolio`.

This is a UI / visualization release. It does not add AI, market data, broker sync, trading logic, schema changes, migrations, or new API routes.

## What Was Built

v4.02 adds Portfolio Intelligence panels using only existing Portfolio Truth Layer data:

- Portfolio Holdings Summary.
- Portfolio Allocation Card.
- Top Exposure Summary.
- Portfolio Data Health.
- Missing Data Warning.

## Data Sources Used

Only existing sources are used:

- `/api/fcn`
- `/api/stocks`
- `/api/crypto`
- `/api/portfolio/dashboard`
- `src/lib/portfolio/truth/*`

The UI consumes the normalized v4.01 readback and does not call any external provider.

## Portfolio Allocation

Allocation is counts-based in v4.02.

Displayed categories:

- Stocks
- FCN
- Crypto

Each category shows:

- Position count.
- Percentage of total holdings.
- Allocation summary.

When valuation data is incomplete, IXAI does not infer market value. v4.02 uses counts only and labels this clearly.

## Portfolio Holdings Summary

The holdings summary shows:

- Total holdings.
- FCN count.
- Stock count.
- Crypto count.

All values come from the Portfolio Truth Layer.

## Top Exposure Summary

Top exposure is based on symbol occurrence counts only.

Aggregated sources:

- FCN underlyings.
- Stock position symbols.
- Crypto position symbols.

The UI displays the top 5 symbols by occurrence count. It does not calculate exposure value, synthetic score, or recommendation priority.

## Portfolio Data Health

The data health panel maps source status into user-readable states:

- `Ready`
- `Missing`
- `Error`

Sources shown:

- FCN Source.
- Stock Source.
- Crypto Source.
- Portfolio Source.

## Missing Data Warning

Warnings are produced from the existing Portfolio Truth Layer and displayed when data is absent or incomplete, including:

- No FCN records.
- No Stock records.
- No Crypto records.
- Missing source response.
- Missing notional / quantity / price data.

No fake warnings are created.

## Architecture Impact

v4.02 does not create a new product center. It strengthens Portfolio Center by making the shared v4.01 readback visible.

```text
Portfolio Truth Layer
        ↓
Portfolio Intelligence UI
        ↓
/my-ixai/portfolio
```

Risk Center and Intelligence Center continue to consume Portfolio Truth status without changes to their product responsibility.

## Future v4.03 Dependencies

v4.03 should introduce the Workspace Market Service or equivalent shared market-readiness layer.

Future work should add:

- Quote source status.
- Timestamp / freshness semantics.
- Fallback labels.
- Provider health.
- No live-market claims unless an approved provider is connected.

## Compliance Boundary

v4.02 is data organization and portfolio visibility only.

It does not provide:

- Investment recommendations.
- Buy / sell instructions.
- Target prices.
- Return promises.
- Position sizing.
- Order execution.
- Auto trading.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- Route smoke:
  - `/my-ixai/portfolio`
  - `/my-ixai/risk`
  - `/my-ixai/intelligence`
  - `/my-ixai/fcn`
  - `/my-ixai/input`
