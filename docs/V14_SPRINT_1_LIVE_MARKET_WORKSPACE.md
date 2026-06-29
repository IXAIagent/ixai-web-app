# V14 Sprint 1 — Live Market Workspace

## Background

V12 Runtime Stabilization has passed production manual verification. V13.0 Internationalization Foundation is complete. V14 is now the active mainline for moving IXAI from a stable Workspace into a daily usable Live Workspace.

V14 Sprint 1 completes the first implementation bundle for:

- V14.1 Live Market Data.
- V14.2 Live Portfolio Valuation.
- V14.3 FCN Live Risk.

This Sprint remains monitoring and risk-awareness only.

## Scope

Included:

- Server-side live quote API for supported Yahoo Finance equity symbols and Binance crypto symbols.
- In-memory quote cache with short TTL and stale fallback.
- Provider health state for Yahoo and Binance refresh success/failure.
- Portfolio valuation readback using live quotes where available.
- FCN live risk readback using live underlying quotes where available.
- Workspace Home, Portfolio, FCN, Risk, and Intelligence surface updates.
- Documentation updates.

Not included:

- Trading.
- Buy / sell / hold recommendations.
- Target prices.
- Automated execution.
- Broker integration.
- AI model calls.
- Auth, RLS, schema, migration, or billing changes.
- Scheduler or notification delivery activation.

## Live Market Data Layer

V14 Sprint 1 introduces the internal live quote route:

```text
/api/market/live-quotes?symbols=AAPL,BTCUSDT
```

Provider layer:

- Yahoo Finance equity quotes for supported US equity / ETF symbols such as `AAPL`, `MSFT`, `NVDA`, and `TSLA`.
- Binance crypto quotes for `BTCUSDT`, `ETHUSDT`, and `BNBUSDT`.
- Client components do not fetch Yahoo Finance or Binance directly.
- Browser-side failures degrade to unavailable quote results.

Runtime safety:

- Provider fetches use timeout guards.
- Quote consumers use the internal API route.
- Provider failures return unavailable/stale/fallback status instead of throwing to React.
- Parallel quote calls use settled/fallback behavior.
- Same-symbol refreshes are coalesced by the market cache layer.

## Cache Strategy

The market cache is memory-only and process-local.

TTL:

- Equity quotes: 60 seconds.
- Crypto quotes: 30 seconds.

Behavior:

- Fresh cache returns immediately.
- Failed provider refresh can return stale cache.
- Missing quote returns unavailable.
- Cache does not write to Supabase.
- Cache does not persist across server process restarts.

## Portfolio Valuation

Portfolio valuation now reads live quote results through the internal live quote API.

Behavior:

- Stock positions use live/delayed Yahoo quotes when available.
- Crypto positions use live Binance quotes when available.
- FCN positions continue to use notional placeholder value.
- Unknown or missing quotes produce unpriced/unavailable items, not route crashes.
- Portfolio summary includes estimated market value, cost basis, unrealized P/L, allocation, priced/unpriced count, source status, and data-quality warnings.

Boundary:

- No rebalancing instruction.
- No buy / sell / hold language.
- No target allocation advice.
- No target price.

## FCN Live Risk

FCN live risk now uses live underlying quotes where supported.

Readback includes:

- Worst-of underlying.
- KI distance.
- KO distance.
- Strike/barrier distance.
- Schedule awareness through the existing FCN schedule layer.
- Source status and warnings for missing quote, missing barrier, missing schedule, stale quote, and fallback price.

Risk status remains monitoring-only and informational. It does not provide product suitability advice, product recommendation, probability promises, or guaranteed coupon language.

## Workspace Integration

Workspace Home:

- Adds compact V14 Sprint 1 live workspace entry points.
- Live Market card is on-demand and does not auto-fetch on mount.
- Home remains runtime-safe and avoids heavy background fan-out.

Portfolio Center:

- Shows live valuation summary.
- Shows quote freshness/source status and data-quality warnings.
- Secondary live valuation preview is on-demand.

FCN Center:

- Shows FCN live risk summary.
- Shows live underlying preview on demand.
- Keeps existing schedule awareness.

Risk Center:

- Continues to show market status and live-risk adapter surfaces.
- Uses valuation and FCN live risk as monitoring context only.

Intelligence Center:

- Continues to show market readiness/status summary.
- Does not add AI model calls.

Copilot:

- No automatic heavy live-market fan-out was added.
- Copilot remains explain-only.

Settings:

- No live-market settings were added in this Sprint.

## Runtime Safety

V14 Sprint 1 preserves V12 runtime safety standards:

- No direct browser provider fetch.
- No infinite retry loop.
- No provider request storm.
- No unhandled provider rejection to React.
- No mount-triggered heavy Workspace fan-out on Home.
- External provider failures degrade to safe statuses.
- Manual/on-demand refresh is used for secondary preview cards.
- Cache and request coalescing reduce duplicate same-symbol provider requests.

## Compliance Boundaries

IXAI remains:

- Not a broker.
- Not a trading bot.
- Not a robo-advisor.
- Not a signal-selling product.

V14 Sprint 1 does not add:

- Buy / sell / hold recommendations.
- Target prices.
- Guaranteed returns.
- Automated execution.
- Broker integration.
- Product suitability advice.

Live data is monitoring and risk-awareness only.

## Validation

Required validation:

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

Manual smoke routes:

- `/my-ixai/home`
- `/my-ixai/portfolio`
- `/my-ixai/fcn`
- `/my-ixai/risk`
- `/my-ixai/intelligence`
- `/my-ixai/copilot`
- `/my-ixai/settings`

Expected:

- No white screen.
- No `RESULT_CODE_HUNG`.
- No repeated 401/404 storm.
- No provider request storm.
- Live/fallback/stale/unavailable statuses are shown clearly.

## Known Limitations

- Supported live quote set is intentionally narrow.
- Yahoo equity coverage is the initial provider layer, not full global coverage.
- Binance crypto coverage is limited to BTC, ETH, and BNB USDT pairs.
- FCN valuation remains notional placeholder; this is not a full FCN pricing engine.
- No broker sync or external account aggregation is enabled.
- Cache is memory-only and may reset across deployments or server process changes.

## Next Sprint

V14 Sprint 2 should cover Workspace Intelligence + Morning Brief:

- Home live dashboard.
- Risk summary.
- Copilot summary.
- Intelligence summary.
- Daily Workspace Brief.
- FCN Brief.
- Watchlist context.
- Share-ready brief.

V14 Sprint 2 must still avoid AI trading signals and automated notification delivery unless separately approved.

## V13 Reminder

After V14 Beta is complete, return to the V13 internationalization track:

- V13.1 Dictionary Migration.
- V13.2 Translation Packs.
- V13.3 Region.
- V13.4 Currency.
- V13.5 Localization.
