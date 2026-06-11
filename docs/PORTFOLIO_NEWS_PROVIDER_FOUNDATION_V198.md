# v1.98 — Portfolio News Provider Foundation

## Goal

v1.98建立 Portfolio -> Intelligence Universe -> News Provider -> Portfolio News Feed 的第一版資料流。這版只做 provider architecture 與 mock news feed，不連接外部新聞、AI、行情、券商或交易功能。

## Scope

- 新增 Portfolio News Provider contract。
- 新增 mock news provider。
- 新增 Portfolio News Service。
- 在 `/my-ixai/portfolio` 顯示 Portfolio News Feed foundation。
- 更新 Architecture Map，將 Portfolio News Provider Foundation 放在 Portfolio News Intelligence Foundation 之後。

## Data Flow

```text
Portfolio Repository
↓
Portfolio Assets
↓
Intelligence Universe
↓
PortfolioNewsProvider
↓
Portfolio News Feed
```

The active provider is mock-only. It uses existing repository-driven assets and v1.97 Intelligence Universe output.

## News Provider Contract

`PortfolioNewsProvider` exposes:

```ts
getNewsForSymbols(symbols: string[]): Promise<PortfolioNewsItem[]>
```

`PortfolioNewsItem` includes:

- `id`
- `symbol`
- `title`
- `summary`
- `source`
- `publishedAt`
- `url`
- `category`

## Mock News Coverage

The mock provider currently supports:

- `BTC`
- `ETH`
- `AAPL`
- `TSLA`
- `MSFT`
- `ORCL`
- `MDB`
- `NVDA`
- `AVGO`
- `PLTR`
- `GOOGL`

Unsupported symbols safely return no item. The provider does not fetch external data.

## Dashboard Changes

`/my-ixai/portfolio` now includes a Portfolio News Feed section showing:

- News Provider Status
- Tracked Symbols
- News Count
- Latest Headlines

This section is a foundation readback only. It does not imply real-time news, AI commentary, or investment recommendations.

## Architecture Update

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
AI Commentary Layer (Coming Soon)
```

External News API remains Coming Soon.

## Out of Scope

- No migration.
- No Supabase schema change.
- No API route.
- No auth change.
- No membership or entitlement change.
- No FCN engine change.
- No Daily / Weekly / Social Pack change.
- No OpenAI, Claude, Gemini, NewsAPI, Yahoo API, market data API, broker sync, or trading integration.

## Mobile QA Checklist

- `/my-ixai/portfolio` at 375px.
- `/my-ixai/portfolio` at 768px.
- `/my-ixai/portfolio` at desktop width.
- No horizontal overflow.
- Responsive symbol badges and news headline cards wrap correctly.
- Console errors should be 0 when authenticated session and environment are valid.

## Next

Future work may introduce a real News Provider Layer after provider selection, compliance rules, attribution rules, rate limits, and user-facing source governance are approved.
