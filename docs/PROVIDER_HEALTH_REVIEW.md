# IXAI Provider Health Review

Status: v1.62.0 provider architecture review.

This document clarifies the provider state relevant to Daily Intelligence,
market quotes, Legacy Pro, and backend portfolio intelligence. It prevents
future fixes from confusing disabled Daily news providers with active quote or
backend providers.

## 1. Provider Categories

IXAI currently has multiple provider paths:

| Category | Primary Location | Purpose |
| --- | --- | --- |
| App Daily news intake | `src/lib/news/providers.ts` | Public Daily / Weekly news headlines and source health. |
| App market quotes | `src/lib/market-data/providers.ts` | Watchlist / public quote display. |
| Backend market data | `backend/ixai_agent/app/services/market_data/*` | Portfolio / FCN / risk quote and market data. |
| Backend portfolio news | `backend/ixai_agent/app/services/news/*` | Portfolio-relevant news for legacy Pro / backend intelligence. |
| Legacy Pro UI | `frontend/ixai-website-clean` | Displays backend provider status and data. |

These paths should not be treated as one unified provider pipeline.

## 2. App Daily News Intake

Location:

`/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app/src/lib/news/providers.ts`

Active public Daily providers include:

- CoinDesk
- Federal Reserve
- MarketWatch
- Yahoo 台股
- CNBC
- CNBC Technology
- Seeking Alpha
- Nasdaq
- The Block
- Decrypt

Disabled / recoverable providers include:

- Yahoo Finance
- Bloomberg
- Reuters
- CNYES
- 工商時報
- 經濟日報
- MoneyDJ

## 3. Yahoo Finance Status

### App Daily News Intake

`Yahoo Finance` in `src/lib/news/providers.ts` is disabled:

```text
Disabled after repeated 429/rate-limit responses during intake checks.
```

Meaning:

- This is the Yahoo Finance news RSS provider slot.
- It is not currently a reliable Daily Brief news source.
- It should not be re-enabled without confirming stable access and rate-limit
  behavior.

### App Market Quotes

`Yahoo Finance` in `src/lib/market-data/providers.ts` is a separate quote path.
It uses Yahoo chart API:

```text
https://query1.finance.yahoo.com/v8/finance/chart/{symbol}
```

Meaning:

- This is for delayed market quote display.
- It is not the Daily Brief news RSS provider.
- Keeping this quote path active does not mean Yahoo Finance news intake is
  active.

### Backend / Legacy Pro

The backend has Yahoo / yfinance paths:

- `backend/ixai_agent/app/services/market_data/yahoo_provider.py`
- `backend/ixai_agent/app/services/news/providers/yfinance_provider.py`

Legacy Pro surfaces display yfinance as limited / best-effort provider state.
This is a portfolio/backend path and should not be used as proof that the App
Daily `Yahoo Finance` RSS provider is healthy.

## 4. Bloomberg Status

`Bloomberg` in `src/lib/news/providers.ts` is disabled:

```text
Provider seed retained; not enabled to avoid relying on unverified RSS access.
```

Meaning:

- The provider is a seed slot only.
- IXAI has not verified stable public RSS access and terms.
- It should remain disabled until legal/public access and reliability are
  confirmed.
- IXAI must not scrape full Bloomberg article text.

## 5. Provider Health Rules

Provider Health should report:

- active providers with usable items;
- disabled providers with explicit reasons;
- failed providers with request / parsing reasons;
- empty feeds separately from successful feeds;
- fallback mode when all real intake is unavailable.

Provider Health must not:

- hide disabled providers behind generic success states;
- inflate Coverage Score with providers that returned zero usable items;
- treat quote providers as Daily news sources;
- treat backend portfolio news providers as public Daily news sources;
- enable Reuters / Bloomberg / Yahoo Finance RSS without access review.

## 6. Current Provider Root Cause Risk

Provider health is not the primary root cause of the repeated 2026-06-02 /
2026-06-03 Daily title. The repeated title is caused primarily by deterministic
AI + macro question-driven narrative logic.

Provider health remains a secondary risk:

- If active feeds repeatedly deliver broad AI / macro headlines, fixed
  narrative rules will keep producing similar thesis text.
- If disabled providers reduce coverage diversity, the engine has fewer
  concrete event differences to use.
- If diagnostics are stripped from public/persisted views, editors may not know
  whether a draft came from real intake or fallback.

## 7. v1.62.1 Provider Work

Allowed:

- Improve provider-health diagnostics and tests.
- Ensure disabled reasons remain visible in Admin.
- Ensure App quote provider and Daily news provider are documented separately.
- Ensure no provider is marked successful when it contributes zero usable items.

Not allowed without separate approval:

- Re-enable Yahoo Finance RSS.
- Re-enable Bloomberg.
- Add scraping.
- Scrape full article text.
- Merge App and backend provider pipelines.
- Change backend / legacy Pro provider behavior.

## 8. Regression Checks

v1.62.1 should verify:

- Yahoo Finance RSS remains disabled with the 429/rate-limit reason.
- Bloomberg remains disabled with the unverified RSS/access reason.
- Yahoo 台股 remains active as a separate Taiwan stock RSS source.
- App Yahoo chart quote provider remains separate from Daily news intake.
- Backend yfinance remains separate from App Daily news intake.
- Provider Health exposes disabled, failed, empty, fallback, and success states.
