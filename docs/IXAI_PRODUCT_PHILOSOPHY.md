# IXAI Product Philosophy

This is the permanent product philosophy for IXAI.

Roadmaps can change. Sprint scope can change. This philosophy should remain the product north star.

## Chapter 1 — Why IXAI Exists

The market problem is not that investors have too little information.

The problem is that investors have too much information.

Every day, investors need to watch:

- Prices
- News
- Earnings
- Events
- Markets
- FCNs
- Crypto
- ETFs
- Macro

This creates a daily research burden. Users must collect, organize, compare, and interpret information before they can make their own decisions.

IXAI does not exist to provide more information.

IXAI exists to filter information.

Core philosophy:

```text
IXAI 的 AI 不負責做投資決策，而是負責把原本需要使用者花大量時間蒐集、整理、交叉比對的資訊，自動完成，讓使用者把時間花在真正的判斷與決策。
```

IXAI saves users time by doing the monitoring work around their investments.

## Chapter 2 — Core Product Principle

AI should not provide more information.

AI should provide less, more important, and more relevant information.

Core value:

```text
The value of IXAI is not information.
The value of IXAI is relevance.
```

IXAI should reduce noise, not increase it.

## Chapter 3 — Two Product Strategy

IXAI consists of two complementary products.

### Product A — AI Financial Media

Product A includes:

- Daily Brief
- Weekly Brief

Purpose:

```text
每天吸引使用者回來。
```

Daily Brief and Weekly Brief answer:

```text
今天市場真正重要的是什麼？
```

Product A is not:

- Workspace free tier
- News aggregation
- Investment advice

Product A is:

```text
AI Curated Financial Media
```

Product A KPI:

- Trust
- Habit
- Brand
- Daily usage

Product A may learn from the information organization of high-usage financial media products such as:

- 要聞
- 熱榜
- 自選
- 快訊
- 指數
- 市場概況

But IXAI must not become another news list product.

The purpose of Public Daily / Weekly Brief is not news quantity.

The purpose is:

```text
AI 幫使用者挑出真正重要的市場資訊。
```

Public Brief is a free trust, habit, brand, and daily-usage product.

### Product B — AI Investment Monitoring

Product B includes:

- Workspace

Purpose:

```text
AI 全天候監控使用者投資。
```

Workspace answers:

```text
今天哪些事情影響我的投資？
```

Product B is not:

- News platform
- Dashboard
- Broker
- Chatbot

Product B is:

```text
AI Investment Monitoring System
```

## Chapter 4 — AI Investment Monitoring

Workspace must support:

- Stock (Global)
- ETF
- Crypto
- FCN
- Bond
- Gold
- Commodity
- Fund
- REIT
- FX
- Future asset classes

The Asset Registry must remain global-first.

No future architecture should assume one market, one country, one language, one broker, one provider, or one asset class.

Provider Independence Principle:

```text
No external service may be hard-bound to a single provider.
```

This applies to:

- News source
- Market price source
- Event source
- Earnings calendar
- Crypto data
- Notification channel
- AI provider

All external services must pass through an IXAI provider abstraction or channel router.

Failure Degradation Principle:

```text
Provider failure must degrade intelligence, not crash the product.
外部來源失敗，只能讓內容降級，不能讓產品停擺。
```

Examples:

- News source failure -> cached / limited brief.
- Price source failure -> data temporarily unavailable.
- Telegram failure -> keep in-app alert.
- LINE failure -> fallback to Telegram / Email / In-App.
- AI provider failure -> rule-based limited summary.

## Chapter 5 — FCN Philosophy

FCN is IXAI's greatest differentiation.

Long-term goal:

```text
成為世界上最完整的 FCN AI Monitoring Platform。
```

For every FCN, AI must understand:

- Underlyings
- Observation
- Coupon
- KI
- KO
- Upcoming Events
- Earnings
- News
- Risk

FCN Intelligence is not only a price display.

FCN Intelligence must explain why an FCN needs attention, which underlying drives risk, what event is coming next, and what the user should monitor.

## Chapter 6 — Public vs Workspace

Public answers:

```text
今天市場發生什麼？
```

Workspace answers:

```text
今天哪些事情影響我的投資？
```

These two product contexts must never be mixed.

Public Daily / Weekly should remain generally useful without depending on the user's Portfolio.

Workspace should become more valuable because it depends on the user's assets, Portfolio, FCNs, watchlist, and risk context.

## Chapter 7 — Editorial Philosophy

Daily Brief is not:

```text
每天重新寫一篇文章。
```

Daily Brief is:

```text
每天重新理解：今天市場真正重要的是什麼。
```

Weekly Brief is not:

```text
Daily 七天合集。
```

Weekly Brief is:

```text
AI Weekly Review.
```

Weekly Brief answers:

```text
本週真正重要的是什麼？
下週最值得注意的是什麼？
```

## Chapter 8 — Monitoring Philosophy

Workspace is not only monitoring as a static status page.

IXAI is an always-on AI investment monitoring system.

It works continuously in the background, so users don't have to.

中文核心句：

```text
IXAI 是全天候運作的 AI 投資監控系統。
AI 在背景持續工作，讓使用者不用全天候盯著市場。
```

AI should perform an always-on monitoring workflow:

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

The Workspace-specific monitoring workflow remains:

```text
User Assets
↓
Asset Registry
↓
Price / News / Events / Macro
↓
Normalization
↓
Relevance
↓
Impact
↓
Intelligence
↓
Today Focus
↓
Monitoring Feed
↓
Alerts
↓
Workspace
```

The user should feel that IXAI has already been working before they open the app.

When the user logs in, they should see AI-prepared results, not wait for AI to begin analysis.

## Chapter 9 — Asset Intelligence

Every asset should have intelligence.

An asset is not only a ticker, row, or price.

Asset Intelligence includes:

- Price
- News
- Events
- Earnings
- Macro relevance
- Portfolio relevance
- FCN relevance
- Risk
- AI Summary

Every asset should answer:

```text
為什麼這件事跟我的投資有關？
```

## Chapter 10 — Long-term Goal

IXAI's goal is not:

```text
建立最大的財經資料庫。
```

IXAI's goal is:

```text
建立最懂使用者投資的 AI。
```

Product value:

```text
Save hours every day by letting AI monitor your investments.
```

IXAI should help users spend less time collecting information and more time making their own judgment.

IXAI does not make investment decisions for the user.

IXAI does the monitoring work so the user can decide with better context.

## Chapter 11 — Notification Philosophy

V16 Notification should not rush into full App Push.

Telegram is the first external notification channel because it already matches the monitoring workflow users expect.

Telegram is not a marketing broadcast channel.

Telegram is the first output surface of AI Monitoring.

Telegram must still be routed through a channel abstraction.

V16 notification architecture should be:

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

LINE may have been planned or may leave traces in the product, so it must be audited before V16 notification implementation.

Future notification work must support multi-channel delivery without rewriting monitoring logic.

Examples:

- FCN observation tomorrow.
- FCN KI distance approaching.
- Underlying earnings tonight.
- TSLA large move affects 3 FCNs.
- BTC volatility rising.
- Today Focus Top 3 ready.

Every notification must answer:

```text
Why does this matter to my investments?
這件事為什麼跟我的投資有關？
```

Notifications should be selective, relevant, and tied to the user's assets, FCNs, Portfolio, watchlist, or risk context.

V16 notification must define an AI Monitoring Event Matrix before implementation.

Example event types:

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

## Chapter 12 — SaaS Strategy

IXAI should not rush monetization before product-market signal.

Short-term strategy:

```text
先開放主要功能給使用者試用。
先找到 Wow Moment。
```

Wow Moment:

```text
原來 AI 可以每天幫我省下看盤、看新聞、追 FCN 的時間。
```

Charging should wait until:

- Users are willing to return every day.
- Workspace provides real personalized monitoring value.
- Telegram / AI Monitoring creates retention.
- FCN monitoring feels clearly irreplaceable.

Future SaaS tiers should grow from proven monitoring value, not from premature billing architecture.
