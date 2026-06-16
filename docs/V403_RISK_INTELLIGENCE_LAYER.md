# v4.03 Risk Intelligence Layer

## Why v4.03 Exists

v4.01 created the shared Portfolio Truth Layer, and v4.02 made that readback visible in Portfolio Center. Risk Center still needed a bridge from shared holdings truth into risk-specific intelligence.

v4.03 adds that bridge without adding market data, broker sync, AI commentary, recommendation logic, or trading functionality.

## Problem Statement

Before v4.03, `/my-ixai/risk` could show FCN risk and multi-asset readiness, but it did not yet translate shared Portfolio Truth Layer data into risk-oriented summaries.

The missing layer was:

```text
Portfolio Truth Layer
↓
Risk Intelligence Readback
↓
Global Risk Center
```

## What v4.03 Adds

- Extends Portfolio Truth Layer with deterministic risk readback.
- Adds concentration risk summary from top symbol occurrence.
- Adds top exposure aggregation from FCN underlyings, Stock symbols, and Crypto symbols.
- Adds FCN worst-of summary by reusing v3.20 FCN Intelligence Center risk helper output.
- Adds data quality risk summary from source status and missing-data warnings.
- Adds a Risk Intelligence Layer section to `/my-ixai/risk`.

## Portfolio Truth Layer Extension

The Truth Layer now exposes:

- `concentrationRisk`
- `dataQualityRisk`

These are derived from existing readback only:

- `/api/fcn`
- `/api/stocks`
- `/api/crypto`
- `/api/portfolio/dashboard`

No new API route, schema, migration, or external provider is added.

## Risk Intelligence Components

### Concentration Risk

Uses known symbol occurrence across:

- FCN underlyings
- Stock positions
- Crypto positions

The output includes:

- risk level
- score
- top exposure
- repeated symbol count
- top exposure share
- summary

### Top Exposure Aggregation

Shows top available symbols by occurrence count. This is not market value, portfolio weight, or recommendation priority.

### FCN Worst-of Risk Summary

Reuses v3.20 FCN Intelligence Center helper output. It does not duplicate FCN risk logic.

The output includes:

- high-risk count
- watch count
- unknown-risk count
- worst underlying
- worst KI distance
- missing price count

### Data Quality Risk

Uses source status and missing-data warnings from the Portfolio Truth Layer.

The output includes:

- warning count
- partial source count
- unavailable source count
- deterministic score
- level
- summary

## UI Integration

`/my-ixai/risk` now includes a `Risk Intelligence Layer` section with:

- Concentration Risk
- Top Exposure Aggregation
- FCN Worst-of Risk Summary
- Data Quality Risk

The existing v3.30 Foundation Score remains FCN-led and deterministic.

## Data Boundaries

Real readback:

- FCN positions and underlyings where available from existing API/Supabase path.
- Stock and Crypto counts/symbols where existing readback is available.
- Manual FCN price overlay through existing v3.20 browser-local helper.

Readiness / missing:

- No live market value when prices are missing.
- No external market data.
- No external AI commentary.
- No broker sync.
- No trading or recommendation layer.

## Compliance Boundary

v4.03 remains monitoring, risk-awareness, and data-organization only.

It does not provide:

- investment recommendation
- trading instruction
- order execution
- auto trading
- target price
- return promise

## Future Dependencies

v4.03 prepares the Risk Center for:

- Workspace Market Service integration.
- Better FCN real-risk semantics when approved market data exists.
- Intelligence Center V2 risk highlight consumption.
- Future multi-asset risk engines for Stock, Crypto, Grid, and Dual.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `/my-ixai/risk` renders Risk Intelligence Layer cards.
- No migration or schema change.
- No new external provider.
- No auth or membership change.
