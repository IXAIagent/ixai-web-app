# Live Product Program 1 — Yahoo Quote + Live Valuation + Live Morning Brief Preview

## Goal

Live Product Program 1 moves IXAI from readiness-only live data foundations into the first read-only live quote workflow:

- Yahoo Quote Provider v1.
- Live Quote Cache v1.
- Portfolio live valuation preview.
- FCN live underlying status preview.
- V15 Risk Engine live quote snapshot adapter.
- Morning Brief live valuation / risk preview.

## Scope

This program adds a server-side Yahoo quote provider and a read-only API route:

- `GET /api/market/yahoo-quotes?symbols=AAPL,MSFT,NVDA`

Workspace UI surfaces consume that route through client-side preview components. The provider keeps an in-memory 60-second cache and returns stale cached quotes when refresh fails.

## Files Changed

- `src/lib/market-data/yahoo/*`
- `app/api/market/yahoo-quotes/route.ts`
- `src/lib/valuation/*live*`
- `src/lib/risk/legacy-risk-engine/live-risk-adapter.ts`
- `src/lib/morning-brief/*`
- `components/market/live-market-data-status.tsx`
- `components/portfolio/live-portfolio-valuation-card.tsx`
- `components/fcn/live-fcn-underlying-status-card.tsx`
- `components/risk/live-risk-adapter-card.tsx`
- `components/morning-brief/live-morning-brief-preview.tsx`
- Workspace Home, Portfolio, FCN, and Risk pages / workspaces.

## Provider Architecture

Yahoo fetches are server-side only:

```text
Yahoo Finance chart endpoint
  -> server-side Yahoo quote provider
  -> in-memory quote cache
  -> /api/market/yahoo-quotes
  -> Workspace live preview components
```

The route validates symbols, caps requests at 30 symbols, and returns stable JSON. Failed Yahoo fetches do not crash the workspace.

## Live Quote Cache

- Cache TTL: 60 seconds.
- Fresh cache hit returns cached quote.
- Stale cache attempts refresh.
- Refresh failure returns stale quote when available.
- Missing quote returns unavailable status.
- No database, Redis, Supabase, or browser persistence is added.

## Portfolio Valuation Preview

Portfolio live valuation uses:

- Portfolio Truth stock positions.
- Portfolio Truth crypto positions.
- Yahoo quotes where available.
- Stored/manual current price fallback where available.

It calculates estimated current value, cost basis, unrealized P/L, and P/L percentage. Missing quotes remain visible as missing data.

## FCN Live Underlying Status

FCN live status uses:

- Existing FCN readback and underlyings.
- Yahoo quotes where available.
- Stored/current FCN underlying price fallback where available.

It calculates worst-of performance and KI / KO / strike distances when the required inputs exist. It is not a full FCN pricing engine.

## Risk And Morning Brief

The Risk live adapter reuses V15 Legacy Risk Engine output and overlays Yahoo quote freshness metadata. It does not create a second risk engine.

Morning Brief live preview adds optional live preview metadata for portfolio value, risk level, FCN worst-of, missing quotes, stale quotes, and Yahoo source timing. News remains placeholder-only.

## Compliance Boundary

Live Product Program 1 is read-only and informational only.

It does not add:

- DB writes or Supabase mutations.
- SQL, migrations, schema, RLS, auth, or membership changes.
- Broker API, Binance trading, order execution, or portfolio actions.
- Buy / sell / rebalance instructions.
- OpenAI, LLM calls, or AI recommendations.
- Telegram, scheduler, notification sender, Stripe, or billing.

## Limitations

- Yahoo availability may vary by symbol and network condition.
- Crypto symbols may be unavailable unless Yahoo recognizes the submitted symbol.
- FCN valuation remains underlying-status monitoring only, not pricing.
- In-memory cache is process-local and resets on server restart.
- No server-side quote history is stored.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

## Next Step

Recommended next step: Live Product Program 2 should harden provider selection, symbol mapping, stale data UX, and optional server-side quote history without enabling trading, broker sync, or recommendations.
