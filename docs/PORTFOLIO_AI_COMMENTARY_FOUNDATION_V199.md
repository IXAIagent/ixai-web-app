# v1.99 — Portfolio AI Commentary Foundation

## Objective

v1.99建立 Portfolio AI Commentary Foundation，將 v1.98 Portfolio News Feed 往下接到 mock commentary layer。

Current flow:

```text
Portfolio Assets
↓
Repository
↓
Intelligence Universe
↓
News Provider
↓
Portfolio News Feed
↓
AI Commentary Layer
```

This release is foundation only. It does not connect OpenAI, Claude, Gemini, Anthropic, LangChain, LlamaIndex, News API, market data, or broker systems.

## Scope

- Add commentary types.
- Add commentary provider contract.
- Add mock commentary provider.
- Add Portfolio Commentary builder.
- Display Portfolio AI Commentary inside `/my-ixai/portfolio`.
- Update Architecture Map with Portfolio AI Commentary Foundation.

## Commentary Types

`PortfolioCommentary` includes:

- `id`
- `symbol`
- `headline`
- `summary`
- `sentiment`
- `confidence`
- `riskLevel`
- `category`
- `generatedAt`

Supported sentiment values:

- `bullish`
- `neutral`
- `bearish`
- `volatile`
- `risk_watch`

Supported risk levels:

- `low`
- `medium`
- `high`

## Commentary Provider Contract

```ts
generateCommentary(
  newsItems: PortfolioNewsItem[]
): Promise<PortfolioCommentary[]>
```

The provider receives already-built Portfolio News Feed items. It must not rebuild the Intelligence Universe or duplicate news provider logic.

## Mock Commentary Provider

The active provider is `mockCommentaryProvider`.

It maps mock news items into deterministic commentary:

- `BTC`: volatile crypto monitoring.
- `ETH`: neutral crypto monitoring.
- `TSLA`: volatile stock exposure.
- `MDB`: high-risk FCN underlying watch.
- `PLTR`: bullish momentum monitoring.
- `NVDA`: bullish AI beta monitoring.
- `ORCL`: neutral infrastructure watch.
- `MSFT`: bullish or stable AI software watch.
- `AAPL`: neutral core stock watch.
- `AVGO`: bullish AI infrastructure watch.

The output is mock logic only.

## Commentary Builder Flow

```text
Portfolio Repository
↓
Portfolio News Service
↓
Portfolio News Feed
↓
Portfolio Commentary Provider
↓
Portfolio Commentary Feed
```

`buildPortfolioCommentary()` uses the v1.98 news feed. It does not call external APIs and does not create another asset or news source.

## Dashboard Integration

`/my-ixai/portfolio` now includes Portfolio AI Commentary:

- Commentary Count
- Bullish Signals
- Neutral Signals
- Bearish Signals
- Volatile / Risk Watch Signals
- Latest Commentary cards

Cards show:

- Symbol
- Headline
- Summary
- Sentiment
- Risk Level
- Confidence

## Architecture Map Update

```text
Portfolio Foundation
↓
Portfolio Input Foundation
↓
Portfolio CRUD Foundation
↓
Portfolio Data Model Foundation
↓
Portfolio Repository Foundation
↓
Portfolio Persistence Foundation
↓
Portfolio Ownership Validation
↓
Portfolio Dashboard Foundation
↓
Portfolio News Intelligence Foundation
↓
Portfolio News Provider Foundation
↓
Portfolio AI Commentary Foundation
↓
Portfolio Intelligence Engine (Coming Soon)
```

## Compliance Boundary

Portfolio AI Commentary Foundation is monitoring and risk-awareness only.

It must not produce:

- Investment advice.
- Trading instructions.
- Position-sizing instructions.
- Target prices.
- Performance promises.
- Automated execution language.

## Out of Scope

- No migration.
- No schema change.
- No API route.
- No auth change.
- No membership or entitlement change.
- No FCN engine change.
- No Daily / Weekly / Social Pack change.
- No OpenAI, Claude, Gemini, Anthropic, LangChain, LlamaIndex, News API, market data API, broker API, service role, or trading feature.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`
- `/portfolio` at 375 / 768 / 1280.
- `/my-ixai/portfolio` at 375 / 768 / 1280.
- No horizontal overflow.
- Console errors = 0.
- Authenticated Portfolio Center visual QA when session is available.

## Next

v2.00 may define Portfolio Intelligence Engine Foundation after provider governance, source attribution, commentary quality rules, and compliance boundaries are approved.
