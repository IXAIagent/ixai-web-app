# V12 Live Product Upgrade Program

## Goal

V12 upgrades Live Product 1 into a connected read-only live workspace program:

1. Live Product 2: Workspace Live Market Service.
2. Live Product 3: Morning Brief v1 formalization.
3. Dashboard polish.
4. Watchlist / Alert integration.

The program keeps IXAI in monitoring, valuation preview, risk-awareness, and workflow mode. It does not add trading, investment recommendations, broker actions, database writes, schema changes, or notification delivery.

## Phase A — Workspace Live Market Service

V12 adds shared live-market contracts:

- `src/lib/market-data/live-market-types.ts`
- `src/lib/market-data/live-market-snapshot.ts`
- `src/lib/market-data/live-market-service.ts`

The service centralizes:

- Symbol collection from Portfolio Truth and optional extra sources.
- Batch Yahoo quote requests through the existing read-only API route.
- Missing quote, stale quote, cache, provider, market-state, and freshness metadata.
- Unavailable fallback when no quote snapshot can be loaded.

Primary output:

- `WorkspaceLiveMarketSnapshot`

Fields include:

- `requestedSymbols`
- `availableQuotes`
- `missingSymbols`
- `staleSymbols`
- `provider`
- `asOf`
- `cacheStatus`
- `marketState`
- `dataQuality`

## Phase B — Morning Brief v1

V12 formalizes Morning Brief from preview into `Morning Brief v1` while remaining read-only.

New files:

- `src/lib/morning-brief/morning-brief-live-service.ts`
- `src/lib/morning-brief/morning-brief-sections.ts`
- `src/lib/morning-brief/morning-brief-share.ts`
- `components/morning-brief/morning-brief-live-card.tsx`

Morning Brief v1 includes:

- Portfolio summary.
- Live valuation summary.
- FCN worst-of / KI distance summary.
- Risk level summary.
- Missing quote / stale quote diagnostics.
- Alert summary.
- Watchlist summary.
- News placeholder.
- Share-friendly text.

News remains placeholder-only. No external news provider is connected by this release.

## Phase C — Dashboard Polish

Updated Workspace surfaces:

- Home shows Live Market Snapshot and Morning Brief v1.
- Portfolio shows live valuation, P/L, missing quote count, stale quote count, source, and as-of metadata.
- FCN shows live underlying status, worst-of, KI / KO / strike distance, missing quote count, stale quote count, source, and as-of metadata.
- Risk shows V15 risk output with live quote freshness metadata.

The existing IXAI card style is preserved. No design-system rewrite is included.

## Phase D — Watchlist / Alert Integration

Watchlist now consumes the shared Workspace Live Market Service instead of building a separate quote path.

Alert summary remains UI-only and deterministic:

- Open alert count.
- Warning count.
- High count.
- Critical count.
- Missing quote alert preview.
- Stale/fallback quote alert preview.
- Existing FCN risk, FCN schedule, and portfolio risk alert readback.

No notification delivery is added.

## Safety Boundaries

V12 does not add:

- Broker API.
- Order execution.
- Auto trading.
- Buy / sell / rebalance instructions.
- Investment recommendation logic.
- Supabase migration.
- SQL execution.
- RLS changes.
- Auth or membership changes.
- Billing / Stripe.
- Telegram scheduler.
- External news provider.
- AI recommendation or LLM calls.

## Known Limitations

- Yahoo quote coverage may be incomplete for unsupported symbols.
- Crypto symbols may require future symbol mapping before Yahoo can quote them reliably.
- The live quote cache remains in-memory and process-local.
- Morning Brief v1 is generated on demand, not scheduled.
- News remains placeholder-only.
- Watchlist and Alerts remain readback/UI-only; no delivery channel is enabled.
- FCN remains underlying-status monitoring, not a pricing engine.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

Validation result for this implementation:

- `git diff --check`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS
- `QA_PORT=3001 npm run qa:mobile`: PASS

## Next Step

Recommended next step: provider hardening and symbol mapping, especially equity aliases, crypto Yahoo mapping, quote stale-age display, and optional server-safe quote history planning. Any persistence or migration work should be reviewed separately before implementation.
