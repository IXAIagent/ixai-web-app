# v4.04 Intelligence Readback Layer

## Why v4.04 Exists

v4.01 created the Portfolio Truth Layer. v4.03 added the Risk Intelligence Layer. Intelligence Center needed to consume both shared readbacks so it could summarize what matters without inventing AI commentary, news, market data, recommendations, or trading signals.

v4.04 upgrades `/my-ixai/intelligence` from source-readiness plus FCN highlights into the first Intelligence Readback Layer.

## Objective

Create a shared readback surface for:

- portfolio intelligence summary
- risk snapshot summary
- exposure intelligence summary
- readiness warning summary

## Data Sources Reused

v4.04 only reuses existing App-native sources:

- Portfolio Truth Layer
- Risk Intelligence Layer
- FCN Intelligence Center helper output
- existing FCN / Stock / Crypto / Portfolio Dashboard readback already normalized by the Truth Layer

No new fetch source, API route, provider, schema, migration, or external service is added.

## What Changed

### Portfolio Intelligence Summary

Shows:

- total holdings
- known notional when available
- available symbols

Values come from the Portfolio Truth Layer.

### Risk Snapshot Summary

Shows:

- Foundation Score
- concentration risk
- FCN worst-of risk
- data quality risk

Values come from the Risk Intelligence Layer and v3.20 FCN helper output.

### Exposure Intelligence Summary

Shows occurrence-based top exposures from:

- FCN underlyings
- Stock symbols
- Crypto symbols

This is not market-value exposure, portfolio weight, or recommendation priority.

### Readiness Warning Summary

Shows:

- warning count
- missing-data warnings
- source warning count

Warnings are derived from the shared readback contracts.

## UI Integration

`/my-ixai/intelligence` now includes an `Intelligence Readback Layer` section before the existing v3.40 sections.

The existing sections remain:

- Daily / Weekly / Market entry points
- portfolio-aware readiness
- FCN highlights
- upcoming FCN events
- market source readiness
- news readiness
- commentary readiness
- next action workflow
- source status
- compliance footer

## Compliance Boundary

v4.04 remains:

- monitoring
- intelligence workflow
- risk awareness
- data organization

v4.04 does not provide:

- AI commentary
- LLM integration
- live market data
- broker sync
- news provider
- recommendation logic
- trading logic
- order execution
- return promise

## Known Limitations

- Top exposure remains occurrence-based until valuation and live market data are approved.
- Stock / Crypto intelligence remains readback/readiness-first.
- News and commentary remain readiness surfaces.
- No external AI or external news provider is connected.

## Future Direction

v4.04 prepares:

- Workspace Market Service
- FCN real-risk integration with approved source semantics
- Intelligence Center V2
- future portfolio-aware news relevance
- future commentary readiness after compliance and provider boundaries are approved

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `/my-ixai/intelligence` renders Intelligence Readback Layer.
- No migration or schema change.
- No new API route.
- No AI, market data, broker, news, recommendation, or trading logic.
