# V16 Data Architecture

This document defines the external data architecture gate before V16A AI Financial Media and V16B AI Investment Monitoring implementation.

## 1. Provider Independence Principle

Any external service must pass through an IXAI abstraction layer.

No V16 feature should bind directly to one provider for:

- News source.
- Market price source.
- Event source.
- Earnings calendar.
- Crypto data.
- Notification channel.
- AI provider.

## 2. Failure Degradation Principle

Provider failure must degrade intelligence, not crash the product.

中文：

```text
外部來源失敗，只能讓內容降級，不能讓產品停擺。
```

Examples:

- News source failure -> cached / limited brief.
- Price source failure -> data temporarily unavailable.
- Event source failure -> hide unavailable event details and keep existing monitoring.
- Earnings calendar failure -> show limited event coverage.
- Crypto source failure -> show limited crypto monitoring.
- AI provider failure -> rule-based limited summary.

## 3. Data Source Categories

V16 data architecture should support:

- News / RSS / editorial sources.
- Market price providers.
- Exchange announcements.
- Company filings.
- Earnings calendars.
- Macro calendars.
- Crypto market data.
- Crypto news.
- On-chain or exchange signals.
- FCN event data.
- User Portfolio / FCN / watchlist context.

## 4. Integration Audit

Before V16 implementation, audit:

- Yahoo Finance.
- Binance.
- Supabase.
- Vercel Cron.
- News / RSS / market sources.
- Google News.
- Bloomberg.
- Reuters.
- 富途.
- 鉅亨網.
- 商業週刊.
- Exchange announcements.
- Company filings.
- Crypto sources.

For each integration, confirm:

- Existing UI.
- Existing API.
- Existing webhook.
- Existing environment variables.
- Production usability.
- Placeholder-only status.

## 5. Normalization Requirement

Provider output must normalize into IXAI-owned concepts:

- Asset.
- Event.
- News.
- Price.
- Relevance.
- Impact.
- Source.
- Freshness.
- Confidence.
- Failure state.

Downstream engines must consume normalized IXAI data, not provider-specific response shapes.

## 6. Product Degradation Rules

If a source fails:

- Daily / Weekly should produce cached or limited brief.
- Workspace Today Focus should show limited monitoring status.
- AI Monitoring Feed should skip unavailable source details.
- Notifications should not send low-confidence alerts.
- Public routes should not crash.
- Workspace routes should not hang or block mount.

## 7. Out of Scope

This document does not authorize:

- New provider implementation.
- New DB schema.
- New migrations.
- Trading.
- Recommendation logic.
- Billing.
- AI provider calls before architecture approval.
