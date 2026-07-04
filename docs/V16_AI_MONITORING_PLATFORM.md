# V16B — AI Monitoring Platform

## 1. Executive Summary

This document is now the V16B roadmap: AI Investment Monitoring.

The full V16 product strategy is split into two complementary product lines:

```text
V16A — AI Financial Media
V16B — AI Investment Monitoring
```

Canonical strategy source:

- `docs/V16_PRODUCT_STRATEGY.md`
- `docs/IXAI_PRODUCT_PHILOSOPHY.md`
- `docs/V16_NOTIFICATION_ARCHITECTURE.md`
- `docs/V16_DATA_ARCHITECTURE.md`
- `docs/V16_EDITORIAL_ARCHITECTURE.md`

V16A owns Daily Brief / Weekly Brief as AI Financial Media.

V16B owns Workspace as AI Investment Monitoring.

V16B moves IXAI from an `AI Wealth Workspace` into an `AI Monitoring Platform`.

Permanent product principle:

```text
The value of IXAI is not information.
The value of IXAI is relevance.
```

V15 completed the product experience foundation: Workspace redesign, information architecture refinement, Morning Brief route separation, product polish, user-facing copy, and diagnostics demotion. V16 starts the next major product line: true AI investment monitoring.

IXAI Workspace is not a brokerage app, not a news reader, not a generic finance dashboard, and not a generic chatbot. IXAI Workspace is an AI Investment Monitoring System.

Core sentence:

```text
讓 AI 全天候監控你的投資，而不是你全天候盯著市場。
AI watches your investments, so you don't have to.
```

Always-on sentence:

```text
IXAI is an always-on AI investment monitoring system.
It works continuously in the background, so users don't have to.
```

中文：

```text
IXAI 是全天候運作的 AI 投資監控系統。
AI 在背景持續工作，讓使用者不用全天候盯著市場。
```

V16B is engine-centric, not page-centric. The product goal is not to add more screens. The product goal is to make every user-held asset, FCN, watchlist item, event, and relevant news item part of an intelligence layer that answers:

```text
這件事為什麼跟我的投資有關？
Why does this matter to my investments?
```

## 2. Core Product Thesis

V16B depends on user Portfolio / asset context.

Daily / Weekly Briefs cannot depend on a user's Portfolio because they are V16A AI Financial Media. Workspace must depend on the user's Portfolio because it is V16B AI Investment Monitoring.

The market already has many:

- Brokerage apps.
- Investment platforms.
- News platforms.
- Finance websites.
- Chart tools.
- Generic AI chat tools.

Most tools do not truly understand what the user holds. They also do not filter the overwhelming amount of market information into the few things that matter to that specific user.

IXAI's value is that AI remembers the user's assets, monitors price, news, events, FCN risk, Portfolio risk, and market context, then proactively surfaces what is important.

Workspace answers:

```text
今天哪些事情影響我的投資？
```

## 2.1 AI Monitoring Workflow

Always-on monitoring flow:

```text
News
↓
Events
↓
Prices
↓
Earnings
↓
Portfolio
↓
FCN
↓
Crypto
↓
Risk
↓
AI Analysis
↓
Today Focus
↓
Telegram / Workspace
```

Workspace implementation flow:

```text
User Assets
↓
Asset Registry
↓
Provider Layer
↓
Normalization
↓
Relevance Engine
↓
Impact Engine
↓
Intelligence Engine
↓
Monitoring Feed
↓
Today Focus
↓
Workspace
```

The user should not need to manually collect, sort, and compare every price, news item, event, and macro signal. IXAI should do the monitoring work and surface the few things that matter.

The user should see prepared intelligence when opening Workspace, not wait for analysis to begin.

## 2.2 Editorial Workflow

Public editorial flow:

```text
Global News
↓
Story Ranking
↓
Narrative
↓
Editorial AI
↓
Daily Brief
↓
Weekly Brief
```

Editorial output belongs to V16A AI Financial Media.

Workspace monitoring output belongs to V16B AI Investment Monitoring.

These workflows should share product intelligence principles, but they must not collapse into the same product surface.

Public Daily / Weekly may organize market information through familiar media modules such as 要聞, 熱榜, 自選, 快訊, 指數, and 市場概況. That is an information architecture reference only. IXAI Public Brief must remain AI Curated Financial Media: fewer, clearer, more important market items selected by AI, not another high-volume news list.

## 3. Non-Negotiable Product Principles

### 3.1 Global First

IXAI must not be built as a Taiwan-only or US-only product.

Stock intelligence must support:

- US equities.
- Taiwan equities.
- Hong Kong equities.
- Japan equities.
- Korea equities.
- Singapore equities.
- China A-shares.
- Europe.
- UK.
- Future markets.

The architecture must not hard-code one market, one exchange, one locale, or one provider. Different markets may require different price providers, news sources, exchange announcements, earnings calendars, filing sources, and corporate event feeds.

### 3.1.1 Provider Independence

No external service may be hard-bound to a single provider.

This applies to:

- News source.
- Market price source.
- Event source.
- Earnings calendar.
- Crypto data.
- Notification channel.
- AI provider.

All external services must pass through IXAI provider abstraction or channel router layers.

### 3.1.2 Failure Degradation

Provider failure must degrade intelligence, not crash the product.

中文：

```text
外部來源失敗，只能讓內容降級，不能讓產品停擺。
```

Fallback examples:

- News source failure -> cached / limited brief.
- Price source failure -> data temporarily unavailable.
- Telegram failure -> keep in-app alert.
- LINE failure -> fallback to Telegram / Email / In-App.
- AI provider failure -> rule-based limited summary.

### 3.2 Asset-Centric Intelligence

IXAI centers the assets the user holds, not the generic market.

What the user holds, AI monitors.

Every news item, event, alert, summary, and Copilot answer must explain:

- Which user asset is affected.
- Whether the Portfolio is affected.
- Whether any FCN is affected.
- Why the user should or should not care.

### 3.3 FCN First Differentiation

FCN is IXAI's strongest differentiated workflow.

Few products monitor FCNs well. IXAI must become an FCN AI monitoring system, not merely a portfolio dashboard that happens to display FCN positions.

FCN Intelligence is not subordinate to Portfolio Intelligence. It is one of IXAI's main monitoring systems.

### 3.4 Crypto-Native Intelligence

Crypto cannot be treated like stock.

Crypto intelligence needs its own monitoring model:

- Real-time price.
- Real-time crypto news.
- On-chain signals.
- Exchange flows.
- Token unlocks.
- ETF decisions.
- Listings and delistings.
- Governance events.
- Whale activity.
- Stablecoin flows.
- Volatility and liquidation signals.

### 3.5 Event Intelligence

AI should monitor the future, not only the present.

Important upcoming events related to user assets must be part of IXAI Intelligence. IXAI should tell the user what upcoming events may affect the Portfolio, FCNs, watchlist, or risk posture.

## 4. V16 Intelligence Engines

### Engine 1: Global Asset Intelligence Engine

Every asset the user inputs should receive an intelligence layer.

Supported asset families:

- Stock.
- ETF.
- Crypto.
- FCN.
- Future asset types.

Each asset intelligence object should include:

- Real-time price.
- Real-time news.
- Upcoming events.
- AI summary.
- Portfolio impact.
- FCN impact.
- Risk status.
- Alert relevance.
- Watchlist relationship.

Stocks are global-first. The asset model must support Hong Kong, Japan, Korea, Singapore, China A-shares, Europe, UK, and future markets.

### Engine 2: News Relevance Engine

IXAI should not show all news.

News flow:

```text
News
→ Asset Matching
→ Portfolio Matching
→ FCN Matching
→ Importance Ranking
→ AI Summary
→ User-facing explanation
→ Notification / Today Focus
```

Every news item must answer:

- Which user asset is this about?
- Does it affect the Portfolio?
- Does it affect any FCN underlying?
- Is it worth alerting?
- Why does this matter to the user?

Global-first news strategy should support:

- Global financial news.
- Local market news.
- Exchange announcements.
- Company filings.
- Crypto-native sources.
- FCN underlying news.

Public Daily / Weekly Brief source strategy:

```text
Source Layer
↓
Normalization
↓
Story Ranking
↓
Topic Ranking
↓
Editorial AI
↓
Daily Brief / Weekly Brief
```

Potential sources:

- Yahoo.
- Google News.
- 富途.
- Bloomberg.
- Reuters.
- 鉅亨網.
- 商業週刊.
- RSS.
- Exchange announcements.
- Company filings.
- Crypto sources.

IXAI's value is curated relevance, not news volume.

### Engine 3: Event Intelligence Engine

IXAI must monitor future events.

Global equity events:

- Earnings.
- Guidance.
- Investor days.
- Product launches.
- Shareholder meetings.
- Dividends.
- Stock splits.
- Exchange announcements.
- Company filings.

Macro events:

- FOMC.
- CPI.
- PPI.
- NFP.
- Central bank decisions.
- Major economic calendar events.

Crypto events:

- Token unlocks.
- ETF decisions.
- Exchange listings and delistings.
- Mainnet launches and hard forks.
- Governance voting.
- On-chain events.
- Whale movement.

FCN events:

- Observation dates.
- Coupon dates.
- Maturity.
- Worst-of changes.
- Underlying earnings.
- Underlying corporate events.

Expected outputs:

- Next 7 days event radar.
- Event relevance score.
- Affected assets.
- Affected FCNs.
- AI explanation.
- Reminder priority.

### Engine 4: FCN Intelligence Engine

FCN is a V16 primary engine.

Every FCN should monitor:

- Worst-of underlying.
- KI distance.
- KO readiness.
- Observation calendar.
- Coupon calendar.
- Maturity.
- Underlying real-time price.
- Underlying real-time news.
- Underlying upcoming earnings.
- Underlying corporate events.
- Volatility.
- AI risk summary.
- Next action awareness.

Every day, FCN Intelligence should answer:

- 今天哪一檔 FCN 最需要注意？
- 為什麼？
- 下一個 observation / coupon / maturity 是什麼？
- 哪個 underlying 造成主要風險？
- 哪些 upcoming events 可能影響這檔 FCN？

### Engine 5: Portfolio Intelligence Engine

Portfolio Intelligence understands the whole portfolio, not only the holdings table.

Every day, it should answer:

- Portfolio 今天如何？
- 哪些資產影響最大？
- 哪些新聞最重要？
- 哪些事件即將影響 Portfolio？
- 哪些風險上升？
- 哪些 FCN 受影響？
- Today Focus Top 3 是什麼？

### Engine 6: AI Monitoring Feed

AI Monitoring Feed is not a Timeline and not a generic notification list.

It is a log of monitoring work that AI has already completed.

Examples:

- TSLA 上漲，FCN659P 風險下降。
- MDB 財報即將公布，影響 FCN219M。
- BTC 波動上升，但 Portfolio impact 低。
- NVDA earnings tomorrow, affects Portfolio and FCN underlyings.

Every feed item must answer:

```text
為什麼這件事跟使用者有關？
```

### Engine 6.1: Telegram Notification Channel

Telegram is the first external notification channel for V16 AI Monitoring.

V16 should not rush App Push before the monitoring value is proven.

Telegram must not be hard-coded into the AI Monitoring Engine.

Notification architecture:

```text
AI Monitoring Engine
↓
Notification Engine
↓
Channel Router
↓
Telegram / LINE / Email / In-App / Browser Push / Mobile Push
```

Telegram is the first usable channel.

LINE may have been planned or may exist as traces in the product, so it must be audited before implementation.

Future channels should be added behind the Channel Router without rewriting monitoring logic.

Telegram examples:

- FCN observation tomorrow.
- FCN KI distance approaching.
- Underlying earnings tonight.
- TSLA large move affects 3 FCNs.
- BTC volatility rising.
- Today Focus Top 3 ready.

Every Telegram notification must answer:

```text
Why does this matter to my investments?
這件事為什麼跟我的投資有關？
```

Telegram notifications are allowed only when they are tied to assets, FCNs, Portfolio impact, watchlist movement, or risk context.

AI Monitoring Event Matrix examples:

- FCN KI distance < 10%.
- FCN observation tomorrow.
- FCN coupon upcoming.
- Underlying earnings tonight.
- Stock single-day move > threshold.
- Crypto volatility spike.
- BTC / ETH major move.
- Macro event: Fed / CPI / war / oil.
- News affects held asset.
- News affects FCN underlying.

### Engine 7: Today Focus Engine

Today Focus is the first priority of the Home page.

It should show only the most important Top 3 items each day.

Example:

1. Tomorrow: NVDA earnings, affects Portfolio + FCN659P.
2. FCN700P observation in 3 days.
3. BTC volatility rising, portfolio impact moderate.

Today Focus is not a news list. It is the daily investment priority list selected by AI.

### Engine 8: Copilot Evolution / AI Analyst

Copilot should evolve from chat into an AI Analyst.

It should support:

- Suggested questions.
- Portfolio explain.
- FCN explain.
- Risk explain.
- News explain.
- Event explain.
- Why this matters to me.

Copilot must be grounded in user-held assets and monitoring context. It must not become a generic finance chatbot.

### Engine 9: Memory Engine

AI must remember:

- User-held assets.
- Watchlist.
- FCN underlyings.
- Risk preferences.
- Notification preferences.
- Frequently viewed assets.
- Already-read events.
- Already-alerted events.

Memory should reduce duplicate reminders and make monitoring more personal without creating trading advice.

## 5. V16 Phase Plan

### Phase A — Monitoring Foundation

P0:

1. News Relevance Engine Foundation.
2. Global Asset Intelligence Foundation.
3. Event Intelligence Foundation.
4. Today Focus Foundation.

Purpose:

Let IXAI begin building price / news / event / relevance / focus monitoring after the user inputs any asset.

### Phase B — FCN Monitoring Advantage

P0:

1. FCN Intelligence Engine v1.
2. Observation Calendar.
3. Coupon Calendar.
4. FCN Underlying News / Event Mapping.
5. FCN Today Watch.

Purpose:

Strengthen IXAI's most differentiated capability: FCN AI monitoring.

### Phase C — Portfolio Monitoring Intelligence

P1:

1. Portfolio Intelligence Engine.
2. AI Monitoring Feed.
3. Portfolio News / Event Impact.
4. Risk Event Correlation.

Purpose:

Move IXAI from asset-level monitoring into portfolio-level monitoring.

### Phase D — AI Analyst & Memory

P1/P2:

1. Copilot AI Analyst.
2. Memory Engine.
3. Telegram-first Smart Alerts.
4. Scenario Explorer.

Purpose:

Make AI able to remember, explain, track, and remind, not only summarize.

## 5.1 SaaS Timing

V16 should not start by building billing-first SaaS tiers.

The first objective is to prove product-market signal:

- Public Daily / Weekly becomes high-quality AI Financial Media.
- Workspace becomes Always-On AI Monitoring.
- Telegram creates retained monitoring behavior.
- FCN monitoring becomes hard to replace.
- Users return because IXAI saves time.

The billing roadmap should wait until the Wow Moment is visible:

```text
原來 AI 可以每天幫我省下看盤、看新聞、追 FCN 的時間。
```

## 6. Data / Provider Strategy

V16 needs a provider strategy, but should not start by binding deeply to a single provider.

V16 needs abstract interfaces for:

- Global market price provider.
- Global news provider.
- Local market news provider.
- Exchange announcement provider.
- Corporate events provider.
- Earnings calendar provider.
- Macro calendar provider.
- Crypto market provider.
- Crypto news provider.
- On-chain / exchange signal provider.
- FCN event provider.

All provider output should normalize into:

- Asset.
- Event.
- News.
- Relevance.
- Impact.
- Source.
- Freshness.
- Confidence.

Provider work must preserve global-first, multi-market, multi-asset assumptions.

Provider work must also preserve failure degradation. A single source failure must not stop Daily Brief, Weekly Brief, Workspace Today Focus, AI Monitoring Feed, or notification delivery.

V16 provider abstraction must cover:

- News / RSS / editorial sources.
- Market price sources.
- Event and earnings sources.
- Crypto data.
- AI provider.
- Notification channels.

## 6.1 V16 Integration Audit Gate

Before V16 notification, data, editorial, or monitoring implementation, audit:

- Telegram.
- LINE.
- Email.
- In-App.
- Browser Push.
- iOS Push.
- Android Push.
- Yahoo Finance.
- Binance.
- Supabase.
- Vercel Cron.
- News / RSS / market sources.

For each integration, confirm:

- Existing UI.
- Existing API.
- Existing webhook.
- Existing environment variables.
- Production usability.
- Placeholder-only status.

The audit result must decide whether the integration is usable, needs recovery, should stay placeholder-only, or should be deferred.

## 7. Compliance Boundary

V16 remains:

- Monitoring.
- Awareness.
- Intelligence.
- Workflow.
- Risk explanation.

V16 is not:

- Broker.
- Trading system.
- Signal seller.
- Robo-advisor.
- Discretionary manager.
- Unlicensed investment advisory service.

Forbidden language:

- Buy.
- Sell.
- Hold.
- Guaranteed return.
- Must rise.
- Must fall.
- Auto-trade.
- Personalized trade instruction.

Allowed language:

- 需要留意.
- 風險上升.
- 受到影響.
- 建議查看.
- 下一個觀察日.
- 目前資料顯示.
- 這不是投資建議.

## 8. Success Metrics

V16 success is not measured by the number of new pages.

V16 succeeds when:

- After a user inputs an asset, IXAI can show relevant price / news / events / risk.
- The user can understand Today Focus Top 3 within 30 seconds.
- Most news the user sees is connected to the user's assets.
- Every alert can answer why it matters to the user.
- FCN users can identify which FCN needs the most attention today.
- The user does not have to watch markets all day because IXAI monitors proactively.

## 9. Out of Scope

V16 does not include:

- Order execution.
- Broker trading.
- Robo-advisor allocation.
- Auto-rebalancing.
- Guaranteed recommendations.
- Discretionary investment advice.
- Full broker sync unless specifically approved.
- Paid subscription / billing unless separately approved.

## 10. First Implementation Recommendation

Recommended first implementation sprint:

```text
V16 Sprint 1 — Asset Intelligence + News/Event Relevance Foundation
```

Scope:

- Define asset intelligence types.
- Define relevance types.
- Define news / event provider contracts.
- Build mock provider first.
- Connect Portfolio / FCN / Watchlist asset universe.
- Generate first Today Focus mock output.
- No external provider dependency yet.
- No AI model call yet unless explicitly approved.

The first sprint should prove the monitoring model before adding production providers, AI model calls, scheduler behavior, notification delivery, trading, billing, or broker integrations.
