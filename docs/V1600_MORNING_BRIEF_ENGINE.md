# V16.00 Morning Brief Engine

## Goal

V16.00 creates the core Morning Brief Engine for IXAI Workspace.

This is not Telegram, Python, scheduler, AI, broker, trading, or external market-provider work. It is the read-only engine that turns existing Workspace readback into a reusable morning snapshot.

## Architecture

```text
Portfolio Truth / V15 Legacy Risk Engine / FCN readback
        ↓
Morning Brief Adapters
        ↓
Morning Brief Engine
        ↓
Morning Snapshot
        ↓
Workspace Home / Future Web / Future Telegram / Future API
```

## Files Added

- `src/lib/morning-brief/brief-types.ts`
- `src/lib/morning-brief/brief-engine.ts`
- `src/lib/morning-brief/brief-risk-adapter.ts`
- `src/lib/morning-brief/brief-fcn-adapter.ts`
- `src/lib/morning-brief/brief-portfolio-adapter.ts`
- `src/lib/morning-brief/brief-news-placeholder.ts`
- `src/lib/morning-brief/brief-snapshot.ts`
- `src/lib/morning-brief/brief-diagnostics.ts`
- `src/lib/morning-brief/index.ts`
- `components/morning-brief/morning-brief-status.tsx`
- `components/morning-brief/morning-brief-summary-card.tsx`
- `components/morning-brief/morning-risk-card.tsx`
- `components/morning-brief/morning-fcn-card.tsx`

## Engine Output

`buildMorningBrief()` returns:

- `date`
- `portfolioSummary`
- `riskSummary`
- `fcnSummary`
- `newsSummary`
- `warnings`
- `dataQuality`
- `limitations`
- `diagnostics`

`buildMorningSnapshot()` returns a reusable `MorningSnapshot` for Workspace Home and future delivery surfaces.

## Adapter Rules

Portfolio adapter:

- Uses V15 portfolio-risk readback.
- Summarizes position count, asset-class exposure, currency exposure, known notional, and data quality.
- Does not produce buy/sell/rebalance/position instructions.

Risk adapter:

- Directly uses V15 Legacy Risk Engine output.
- Does not recalculate a separate risk engine.
- Summarizes risk level, risk score, critical drivers, and warnings.

FCN adapter:

- Uses V15 FCN risk output.
- Summarizes worst-of, KI distance, strike distance, repeated underlyings, high/critical counts, and insufficient-data states.
- Missing data remains warning / partial / insufficient-data.

News placeholder:

- Does not call any API.
- Marks source as placeholder and status as not configured.
- Prepares the surface for future V17 Market Data Provider work.

## Diagnostics

V16 diagnostics explicitly state:

- Read-only: yes.
- DB writes: off.
- External API calls: off.
- Scheduler: off.
- Telegram: off.
- Broker: off.
- AI recommendation: off.
- News source: placeholder only.
- Risk source: V15 Legacy Risk Engine.
- Portfolio source: V15 Portfolio adapter / Portfolio Truth Layer.
- FCN source: V15 FCN adapter / existing FCN readback.

## V16.01 Safety Review Note

V16.01 reviewed the Morning Brief Engine and confirmed:

- `buildMorningBrief()` and `buildMorningSnapshot()` are read-only builders.
- Home, Settings, Workspace Graph, and Integration Audit render paths do not invoke database writes, SQL, migrations, scheduler, Telegram, broker, Yahoo, Binance, OpenAI, or AI recommendation calls.
- News remains placeholder-only and does not call external providers or internal mutation APIs.
- Risk summary directly uses V15 Legacy Risk Engine output rather than recalculating a second risk engine.
- Missing Portfolio, Risk, FCN, or News data returns warning / partial / placeholder / insufficient-data states instead of crashing.
- UI wording remains monitoring and intelligence workflow only, with no buy/sell/rebalance/action instruction.

## Boundaries

V16 does not add:

- DB writes.
- SQL or migrations.
- Scheduler.
- Telegram bot.
- Yahoo Finance.
- Binance.
- OpenAI or other AI provider calls.
- Broker integration.
- Trading, order execution, buy/sell/rebalance instructions, or investment recommendations.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

## Next Step

V17 should focus on Market Data Provider integration for the Morning Brief and Workspace intelligence surfaces, while preserving the same non-advisory and read-only boundaries unless a separate activation scope is approved.
