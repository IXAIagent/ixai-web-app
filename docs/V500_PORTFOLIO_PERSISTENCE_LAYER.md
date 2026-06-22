# v5.00 Portfolio Persistence Layer

## Goal

v5.00 establishes a canonical Portfolio Persistence Layer for IXAI Workspace readback. It gives Portfolio Center a single abstraction that can describe persisted API records, browser-local pending inputs, FCN drafts, and legacy fallback recent inputs without redesigning the database.

## Scope

- Create persistence types, readback helpers, summary utilities, service entrypoints, and a Portfolio Persistence Summary UI.
- Preserve existing `/api/fcn`, `/api/stocks`, `/api/crypto`, Portfolio Truth Layer, Input Truth Bridge, FCN Draft Store, and Recent Inputs fallback behavior.
- Add a small Workspace Integration Audit node for Portfolio Persistence.
- Do not change auth, Supabase schema, migrations, API contracts, broker integration, trading logic, investment recommendations, AI model calls, alert delivery, or workspace IA.

## Architecture Before

```text
Portfolio Input
↓
Input Truth Bridge / API readback / local draft fallback
↓
Portfolio Truth Layer
↓
Valuation Engine
↓
Risk Engine
↓
FCN Risk / FCN Schedule
↓
Intelligence Engine
```

## Architecture After

```text
Portfolio Input
↓
Portfolio Persistence Layer
↓
Portfolio Truth Layer
↓
Valuation Engine
↓
Risk Engine
↓
FCN Risk / FCN Schedule
↓
Intelligence Engine
```

The current implementation preserves the existing Truth Layer path and adds the persistence abstraction beside it. Future releases can move the Truth Layer to depend directly on durable persistence once database storage and lifecycle rules are approved.

## Persistence Source Statuses

- `persisted`: data read from existing API-backed records.
- `local`: browser-local pending input or FCN draft data.
- `fallback`: legacy recent input fallback.
- `partial`: mixed or incomplete readback.
- `unavailable`: no usable readback is available.

## Readback Sources

- Persisted Stock positions from existing Stock API readback through Portfolio Truth.
- Persisted Crypto positions from existing Crypto API readback through Portfolio Truth.
- Persisted FCN positions from existing FCN API readback through Portfolio Truth.
- Local pending Stock / Crypto / FCN inputs from the v4.10 Input Truth Bridge.
- Local FCN drafts from the existing FCN Draft Store.
- Legacy local recent inputs as fallback only.

## Fallback Behavior

The persistence service must never throw. Missing API readback, unavailable local storage, incomplete position fields, or empty data return a safe empty or partial summary. Local and fallback data are labeled clearly and are not presented as durable server persistence.

## UI Behavior

Portfolio Center now shows a Portfolio Persistence Summary near the Portfolio Truth and Valuation sections. It displays:

- Total positions.
- Persisted positions.
- Local draft positions.
- Fallback positions.
- Asset-class breakdown.
- Source status.
- Last updated timestamp.
- Warnings and informational-only disclaimer.

## Compliance Boundary

v5.00 is data organization and monitoring infrastructure only. It does not provide investment advice, buy/sell instructions, order execution, broker sync, AI model calls, alert delivery, target prices, position sizing, or return promises.

## Limitations

- This is an abstraction layer, not a schema migration or database redesign.
- Browser-local pending inputs and FCN drafts remain local until a future durable persistence flow is approved.
- Duplicate detection is intentionally conservative and does not rewrite historical fallback records.
- The Portfolio Truth Layer still owns the active normalized readback path in this release.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- Optional: `QA_PORT=3001 npm run qa:mobile`

## Next Step

Future versions should connect the persistence abstraction to durable database storage, define draft-to-position lifecycle rules, and prepare alert delivery only after product and compliance boundaries are approved.
