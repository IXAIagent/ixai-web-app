# V13.7 Real Translation Coverage Report

Generated: 2026-07-01T08:36:10.174Z

Base URL: https://app.ixuan.ai

## V13.7 Goal

Measure authenticated Workspace DOM translation coverage across production routes and locales, then provide page-level evidence for real translation completion. This report does not rely on keyword leftover detection as the pass criterion.

## Root Cause

Previous i18n work connected sidebar and some shared labels, but many main-content dictionary values and deep Workspace components still rendered English in non-English locales.

## Translation Coverage Algorithm

- Reads `document.body.innerText` for each authenticated route and locale.
- Extracts visible English tokens.
- Extracts visible localized CJK/Kana/Hangul segments.
- Excludes numbers, tickers, FCN codes, currency codes, API paths, URLs, file names, enums, technical IDs, provider names, storage/cookie terms, and code-like identifiers.
- Calculates English % as `english tokens / (english tokens + localized visible segments)`.

Coverage standard:

- PASS when visible English UI coverage is `5%` or lower.
- FAIL when visible English UI coverage is above `5%`.

## Auth Status

- Storage state path: `.auth/production-storage-state.json`
- Auth storage created this run: no
- Authenticated route checks: 80/80

## Authenticated Audit Integration

- Uses Playwright Chromium with persisted production storage state.
- Reads production Workspace routes from `https://app.ixuan.ai`.
- Saves route + locale screenshots under `qa-artifacts/production-authenticated-audit/`.
- Writes this markdown evidence file to `docs/V137_REAL_TRANSLATION_COVERAGE.md`.
- This audit script is allowed to scan production but does not modify auth, API, Supabase, or product data.

## Audited Routes

- `/my-ixai/home`
- `/my-ixai/portfolio`
- `/my-ixai/input`
- `/my-ixai/input/stock`
- `/my-ixai/input/crypto`
- `/my-ixai/input/fcn`
- `/my-ixai/watchlist`
- `/my-ixai/notifications`
- `/my-ixai/timeline`
- `/my-ixai/copilot`
- `/my-ixai/health`
- `/my-ixai/beta`
- `/my-ixai/risk`
- `/my-ixai/fcn`
- `/my-ixai/intelligence`
- `/my-ixai/settings`

## Audited Locales

- `zh-TW`
- `zh-CN`
- `en-US`
- `ja-JP`
- `ko-KR`

## Redirected / Blocked Routes

- None

## Route Results

| Locale | Route | HTTP | Workspace auth | Console errors | Page errors | Failed requests | English % | Coverage | Suspected English leftovers |
| --- | --- | ---: | --- | ---: | ---: | ---: | ---: | --- | --- |
| zh-TW | /my-ixai/home | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| zh-TW | /my-ixai/portfolio | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| zh-TW | /my-ixai/input | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| zh-TW | /my-ixai/input/stock | 200 | yes | 0 | 0 | 1 | 0.0% | PASS | - |
| zh-TW | /my-ixai/input/crypto | 200 | yes | 0 | 0 | 1 | 0.0% | PASS | - |
| zh-TW | /my-ixai/input/fcn | 200 | yes | 0 | 0 | 1 | 0.0% | PASS | - |
| zh-TW | /my-ixai/watchlist | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| zh-TW | /my-ixai/notifications | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| zh-TW | /my-ixai/timeline | 200 | yes | 0 | 0 | 1 | 0.0% | PASS | - |
| zh-TW | /my-ixai/copilot | 200 | yes | 0 | 0 | 3 | 0.0% | PASS | - |
| zh-TW | /my-ixai/health | 200 | yes | 0 | 0 | 1 | 0.0% | PASS | - |
| zh-TW | /my-ixai/beta | 200 | yes | 0 | 0 | 2 | 0.0% | PASS | - |
| zh-TW | /my-ixai/risk | 200 | yes | 0 | 0 | 2 | 0.0% | PASS | - |
| zh-TW | /my-ixai/fcn | 200 | yes | 0 | 0 | 3 | 0.0% | PASS | - |
| zh-TW | /my-ixai/intelligence | 200 | yes | 0 | 0 | 2 | 0.0% | PASS | - |
| zh-TW | /my-ixai/settings | 200 | yes | 0 | 0 | 1 | 0.0% | PASS | - |
| zh-CN | /my-ixai/home | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| zh-CN | /my-ixai/portfolio | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| zh-CN | /my-ixai/input | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| zh-CN | /my-ixai/input/stock | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| zh-CN | /my-ixai/input/crypto | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| zh-CN | /my-ixai/input/fcn | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| zh-CN | /my-ixai/watchlist | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| zh-CN | /my-ixai/notifications | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| zh-CN | /my-ixai/timeline | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| zh-CN | /my-ixai/copilot | 200 | yes | 0 | 0 | 1 | 0.0% | PASS | - |
| zh-CN | /my-ixai/health | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| zh-CN | /my-ixai/beta | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| zh-CN | /my-ixai/risk | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| zh-CN | /my-ixai/fcn | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| zh-CN | /my-ixai/intelligence | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| zh-CN | /my-ixai/settings | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| en-US | /my-ixai/home | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| en-US | /my-ixai/portfolio | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| en-US | /my-ixai/input | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| en-US | /my-ixai/input/stock | 200 | yes | 0 | 0 | 2 | 0.0% | PASS | - |
| en-US | /my-ixai/input/crypto | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| en-US | /my-ixai/input/fcn | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| en-US | /my-ixai/watchlist | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| en-US | /my-ixai/notifications | 200 | yes | 0 | 0 | 2 | 0.0% | PASS | - |
| en-US | /my-ixai/timeline | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| en-US | /my-ixai/copilot | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| en-US | /my-ixai/health | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| en-US | /my-ixai/beta | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| en-US | /my-ixai/risk | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| en-US | /my-ixai/fcn | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| en-US | /my-ixai/intelligence | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| en-US | /my-ixai/settings | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ja-JP | /my-ixai/home | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ja-JP | /my-ixai/portfolio | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ja-JP | /my-ixai/input | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ja-JP | /my-ixai/input/stock | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ja-JP | /my-ixai/input/crypto | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ja-JP | /my-ixai/input/fcn | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ja-JP | /my-ixai/watchlist | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ja-JP | /my-ixai/notifications | 200 | yes | 0 | 0 | 2 | 0.0% | PASS | - |
| ja-JP | /my-ixai/timeline | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ja-JP | /my-ixai/copilot | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ja-JP | /my-ixai/health | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ja-JP | /my-ixai/beta | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ja-JP | /my-ixai/risk | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ja-JP | /my-ixai/fcn | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ja-JP | /my-ixai/intelligence | 200 | yes | 0 | 0 | 3 | 0.0% | PASS | - |
| ja-JP | /my-ixai/settings | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ko-KR | /my-ixai/home | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ko-KR | /my-ixai/portfolio | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ko-KR | /my-ixai/input | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ko-KR | /my-ixai/input/stock | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ko-KR | /my-ixai/input/crypto | 200 | yes | 0 | 0 | 1 | 0.0% | PASS | - |
| ko-KR | /my-ixai/input/fcn | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ko-KR | /my-ixai/watchlist | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ko-KR | /my-ixai/notifications | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ko-KR | /my-ixai/timeline | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ko-KR | /my-ixai/copilot | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ko-KR | /my-ixai/health | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ko-KR | /my-ixai/beta | 200 | yes | 0 | 0 | 1 | 0.0% | PASS | - |
| ko-KR | /my-ixai/risk | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ko-KR | /my-ixai/fcn | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ko-KR | /my-ixai/intelligence | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |
| ko-KR | /my-ixai/settings | 200 | yes | 0 | 0 | 0 | 0.0% | PASS | - |

## DOM Coverage

- `/my-ixai/home` `zh-TW`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/portfolio` `zh-TW`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/input` `zh-TW`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/input/stock` `zh-TW`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/input/crypto` `zh-TW`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/input/fcn` `zh-TW`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/watchlist` `zh-TW`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/notifications` `zh-TW`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/timeline` `zh-TW`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/copilot` `zh-TW`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/health` `zh-TW`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/beta` `zh-TW`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/risk` `zh-TW`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/fcn` `zh-TW`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/intelligence` `zh-TW`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/settings` `zh-TW`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/home` `zh-CN`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/portfolio` `zh-CN`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/input` `zh-CN`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/input/stock` `zh-CN`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/input/crypto` `zh-CN`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/input/fcn` `zh-CN`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/watchlist` `zh-CN`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/notifications` `zh-CN`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/timeline` `zh-CN`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/copilot` `zh-CN`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/health` `zh-CN`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/beta` `zh-CN`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/risk` `zh-CN`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/fcn` `zh-CN`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/intelligence` `zh-CN`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/settings` `zh-CN`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/home` `ja-JP`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/portfolio` `ja-JP`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/input` `ja-JP`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/input/stock` `ja-JP`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/input/crypto` `ja-JP`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/input/fcn` `ja-JP`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/watchlist` `ja-JP`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/notifications` `ja-JP`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/timeline` `ja-JP`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/copilot` `ja-JP`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/health` `ja-JP`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/beta` `ja-JP`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/risk` `ja-JP`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/fcn` `ja-JP`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/intelligence` `ja-JP`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/settings` `ja-JP`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/home` `ko-KR`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/portfolio` `ko-KR`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/input` `ko-KR`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/input/stock` `ko-KR`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/input/crypto` `ko-KR`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/input/fcn` `ko-KR`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/watchlist` `ko-KR`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/notifications` `ko-KR`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/timeline` `ko-KR`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/copilot` `ko-KR`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/health` `ko-KR`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/beta` `ko-KR`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/risk` `ko-KR`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/fcn` `ko-KR`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/intelligence` `ko-KR`: English 0.0% / localized 100.0% — PASS
- `/my-ixai/settings` `ko-KR`: English 0.0% / localized 100.0% — PASS

## Coverage By Page

- `/my-ixai/home`: average English 0.0% — PASS
- `/my-ixai/portfolio`: average English 0.0% — PASS
- `/my-ixai/input`: average English 0.0% — PASS
- `/my-ixai/input/stock`: average English 0.0% — PASS
- `/my-ixai/input/crypto`: average English 0.0% — PASS
- `/my-ixai/input/fcn`: average English 0.0% — PASS
- `/my-ixai/watchlist`: average English 0.0% — PASS
- `/my-ixai/notifications`: average English 0.0% — PASS
- `/my-ixai/timeline`: average English 0.0% — PASS
- `/my-ixai/copilot`: average English 0.0% — PASS
- `/my-ixai/health`: average English 0.0% — PASS
- `/my-ixai/beta`: average English 0.0% — PASS
- `/my-ixai/risk`: average English 0.0% — PASS
- `/my-ixai/fcn`: average English 0.0% — PASS
- `/my-ixai/intelligence`: average English 0.0% — PASS
- `/my-ixai/settings`: average English 0.0% — PASS

## Routes Completed

- `/my-ixai/home`: authenticated 5/5, coverage 5/5
- `/my-ixai/portfolio`: authenticated 5/5, coverage 5/5
- `/my-ixai/input`: authenticated 5/5, coverage 5/5
- `/my-ixai/input/stock`: authenticated 5/5, coverage 5/5
- `/my-ixai/input/crypto`: authenticated 5/5, coverage 5/5
- `/my-ixai/input/fcn`: authenticated 5/5, coverage 5/5
- `/my-ixai/watchlist`: authenticated 5/5, coverage 5/5
- `/my-ixai/notifications`: authenticated 5/5, coverage 5/5
- `/my-ixai/timeline`: authenticated 5/5, coverage 5/5
- `/my-ixai/copilot`: authenticated 5/5, coverage 5/5
- `/my-ixai/health`: authenticated 5/5, coverage 5/5
- `/my-ixai/beta`: authenticated 5/5, coverage 5/5
- `/my-ixai/risk`: authenticated 5/5, coverage 5/5
- `/my-ixai/fcn`: authenticated 5/5, coverage 5/5
- `/my-ixai/intelligence`: authenticated 5/5, coverage 5/5
- `/my-ixai/settings`: authenticated 5/5, coverage 5/5

## Coverage Failures

- None

## Console Errors

- None

## Page Errors

- None

## Failed Requests

- `zh-TW` `/my-ixai/input/stock`: GET https://app.ixuan.ai/logo/ixuan-logo.png (net::ERR_ABORTED)
- `zh-TW` `/my-ixai/input/crypto`: GET https://app.ixuan.ai/_next/static/chunks/133_p50j20v39.js (net::ERR_ABORTED)
- `zh-TW` `/my-ixai/input/fcn`: GET https://app.ixuan.ai/_next/static/chunks/0ciuu7_x.95pm.js (net::ERR_ABORTED)
- `zh-TW` `/my-ixai/timeline`: GET https://app.ixuan.ai/_next/static/chunks/0uft7_2~glwaq.js (net::ERR_ABORTED)
- `zh-TW` `/my-ixai/copilot`: GET https://app.ixuan.ai/_next/static/chunks/0uj7g336g1o0s.js (net::ERR_ABORTED)
- `zh-TW` `/my-ixai/copilot`: GET https://app.ixuan.ai/_next/static/chunks/0eg-i5w9.1~7x.js (net::ERR_ABORTED)
- `zh-TW` `/my-ixai/copilot`: GET https://app.ixuan.ai/_next/static/chunks/0poab~w6ited2.js (net::ERR_ABORTED)
- `zh-TW` `/my-ixai/health`: GET https://app.ixuan.ai/_next/static/chunks/0bq.9z9kace4r.js (net::ERR_ABORTED)
- `zh-TW` `/my-ixai/beta`: GET https://app.ixuan.ai/_next/static/chunks/0lvqi7mwb.-ak.js (net::ERR_ABORTED)
- `zh-TW` `/my-ixai/beta`: GET https://app.ixuan.ai/_next/static/chunks/00gs-4okb1cj7.js (net::ERR_ABORTED)
- `zh-TW` `/my-ixai/risk`: GET https://app.ixuan.ai/_next/static/chunks/017hrxjbt~rz9.js (net::ERR_ABORTED)
- `zh-TW` `/my-ixai/risk`: GET https://app.ixuan.ai/_next/static/chunks/0hvlbgojh03-3.js (net::ERR_ABORTED)
- `zh-TW` `/my-ixai/fcn`: GET https://app.ixuan.ai/_next/static/chunks/0c9j0f.ile_yi.js (net::ERR_ABORTED)
- `zh-TW` `/my-ixai/fcn`: GET https://app.ixuan.ai/_next/static/chunks/0cj4x_0dou_6j.js (net::ERR_ABORTED)
- `zh-TW` `/my-ixai/fcn`: GET https://app.ixuan.ai/_next/static/chunks/0h4mq8~4m-dfj.js (net::ERR_ABORTED)
- `zh-TW` `/my-ixai/intelligence`: GET https://app.ixuan.ai/_next/static/chunks/1885zqczc9w6a.js (net::ERR_ABORTED)
- `zh-TW` `/my-ixai/intelligence`: GET https://app.ixuan.ai/_next/static/chunks/14afsfvndz5aw.js (net::ERR_ABORTED)
- `zh-TW` `/my-ixai/settings`: GET https://app.ixuan.ai/_next/static/chunks/0euwxxc4q~kod.js (net::ERR_ABORTED)
- `zh-CN` `/my-ixai/copilot`: GET https://app.ixuan.ai/logo/ixuan-logo.png (net::ERR_ABORTED)
- `en-US` `/my-ixai/input/stock`: GET https://app.ixuan.ai/_next/static/chunks/0-.xezs.n_.7q.js (net::ERR_ABORTED)
- `en-US` `/my-ixai/input/stock`: GET https://app.ixuan.ai/_next/static/chunks/00gs-4okb1cj7.js (net::ERR_ABORTED)
- `en-US` `/my-ixai/notifications`: GET https://app.ixuan.ai/_next/static/chunks/0-.xezs.n_.7q.js (net::ERR_ABORTED)
- `en-US` `/my-ixai/notifications`: GET https://app.ixuan.ai/_next/static/chunks/00gs-4okb1cj7.js (net::ERR_ABORTED)
- `ja-JP` `/my-ixai/notifications`: GET https://app.ixuan.ai/_next/static/chunks/0-.xezs.n_.7q.js (net::ERR_ABORTED)
- `ja-JP` `/my-ixai/notifications`: GET https://app.ixuan.ai/_next/static/chunks/00gs-4okb1cj7.js (net::ERR_ABORTED)
- `ja-JP` `/my-ixai/intelligence`: GET https://app.ixuan.ai/_next/static/chunks/0-.xezs.n_.7q.js (net::ERR_ABORTED)
- `ja-JP` `/my-ixai/intelligence`: GET https://app.ixuan.ai/_next/static/chunks/00gs-4okb1cj7.js (net::ERR_ABORTED)
- `ja-JP` `/my-ixai/intelligence`: GET https://app.ixuan.ai/logo/ixuan-logo.png (net::ERR_ABORTED)
- `ko-KR` `/my-ixai/input/crypto`: GET https://app.ixuan.ai/logo/ixuan-logo.png (net::ERR_ABORTED)
- `ko-KR` `/my-ixai/beta`: GET https://app.ixuan.ai/_next/static/chunks/00gs-4okb1cj7.js (net::ERR_ABORTED)

## Untranslated / Suspected English Leftovers

- None

## Screenshots Path Summary

Root: `qa-artifacts/production-authenticated-audit/`

- `zh-TW` `/my-ixai/home` → `qa-artifacts/production-authenticated-audit/zh-TW/my-ixai-home.png`
- `zh-TW` `/my-ixai/portfolio` → `qa-artifacts/production-authenticated-audit/zh-TW/my-ixai-portfolio.png`
- `zh-TW` `/my-ixai/input` → `qa-artifacts/production-authenticated-audit/zh-TW/my-ixai-input.png`
- `zh-TW` `/my-ixai/input/stock` → `qa-artifacts/production-authenticated-audit/zh-TW/my-ixai-input-stock.png`
- `zh-TW` `/my-ixai/input/crypto` → `qa-artifacts/production-authenticated-audit/zh-TW/my-ixai-input-crypto.png`
- `zh-TW` `/my-ixai/input/fcn` → `qa-artifacts/production-authenticated-audit/zh-TW/my-ixai-input-fcn.png`
- `zh-TW` `/my-ixai/watchlist` → `qa-artifacts/production-authenticated-audit/zh-TW/my-ixai-watchlist.png`
- `zh-TW` `/my-ixai/notifications` → `qa-artifacts/production-authenticated-audit/zh-TW/my-ixai-notifications.png`
- `zh-TW` `/my-ixai/timeline` → `qa-artifacts/production-authenticated-audit/zh-TW/my-ixai-timeline.png`
- `zh-TW` `/my-ixai/copilot` → `qa-artifacts/production-authenticated-audit/zh-TW/my-ixai-copilot.png`
- `zh-TW` `/my-ixai/health` → `qa-artifacts/production-authenticated-audit/zh-TW/my-ixai-health.png`
- `zh-TW` `/my-ixai/beta` → `qa-artifacts/production-authenticated-audit/zh-TW/my-ixai-beta.png`
- `zh-TW` `/my-ixai/risk` → `qa-artifacts/production-authenticated-audit/zh-TW/my-ixai-risk.png`
- `zh-TW` `/my-ixai/fcn` → `qa-artifacts/production-authenticated-audit/zh-TW/my-ixai-fcn.png`
- `zh-TW` `/my-ixai/intelligence` → `qa-artifacts/production-authenticated-audit/zh-TW/my-ixai-intelligence.png`
- `zh-TW` `/my-ixai/settings` → `qa-artifacts/production-authenticated-audit/zh-TW/my-ixai-settings.png`
- `zh-CN` `/my-ixai/home` → `qa-artifacts/production-authenticated-audit/zh-CN/my-ixai-home.png`
- `zh-CN` `/my-ixai/portfolio` → `qa-artifacts/production-authenticated-audit/zh-CN/my-ixai-portfolio.png`
- `zh-CN` `/my-ixai/input` → `qa-artifacts/production-authenticated-audit/zh-CN/my-ixai-input.png`
- `zh-CN` `/my-ixai/input/stock` → `qa-artifacts/production-authenticated-audit/zh-CN/my-ixai-input-stock.png`
- `zh-CN` `/my-ixai/input/crypto` → `qa-artifacts/production-authenticated-audit/zh-CN/my-ixai-input-crypto.png`
- `zh-CN` `/my-ixai/input/fcn` → `qa-artifacts/production-authenticated-audit/zh-CN/my-ixai-input-fcn.png`
- `zh-CN` `/my-ixai/watchlist` → `qa-artifacts/production-authenticated-audit/zh-CN/my-ixai-watchlist.png`
- `zh-CN` `/my-ixai/notifications` → `qa-artifacts/production-authenticated-audit/zh-CN/my-ixai-notifications.png`
- `zh-CN` `/my-ixai/timeline` → `qa-artifacts/production-authenticated-audit/zh-CN/my-ixai-timeline.png`
- `zh-CN` `/my-ixai/copilot` → `qa-artifacts/production-authenticated-audit/zh-CN/my-ixai-copilot.png`
- `zh-CN` `/my-ixai/health` → `qa-artifacts/production-authenticated-audit/zh-CN/my-ixai-health.png`
- `zh-CN` `/my-ixai/beta` → `qa-artifacts/production-authenticated-audit/zh-CN/my-ixai-beta.png`
- `zh-CN` `/my-ixai/risk` → `qa-artifacts/production-authenticated-audit/zh-CN/my-ixai-risk.png`
- `zh-CN` `/my-ixai/fcn` → `qa-artifacts/production-authenticated-audit/zh-CN/my-ixai-fcn.png`
- `zh-CN` `/my-ixai/intelligence` → `qa-artifacts/production-authenticated-audit/zh-CN/my-ixai-intelligence.png`
- `zh-CN` `/my-ixai/settings` → `qa-artifacts/production-authenticated-audit/zh-CN/my-ixai-settings.png`
- `en-US` `/my-ixai/home` → `qa-artifacts/production-authenticated-audit/en-US/my-ixai-home.png`
- `en-US` `/my-ixai/portfolio` → `qa-artifacts/production-authenticated-audit/en-US/my-ixai-portfolio.png`
- `en-US` `/my-ixai/input` → `qa-artifacts/production-authenticated-audit/en-US/my-ixai-input.png`
- `en-US` `/my-ixai/input/stock` → `qa-artifacts/production-authenticated-audit/en-US/my-ixai-input-stock.png`
- `en-US` `/my-ixai/input/crypto` → `qa-artifacts/production-authenticated-audit/en-US/my-ixai-input-crypto.png`
- `en-US` `/my-ixai/input/fcn` → `qa-artifacts/production-authenticated-audit/en-US/my-ixai-input-fcn.png`
- `en-US` `/my-ixai/watchlist` → `qa-artifacts/production-authenticated-audit/en-US/my-ixai-watchlist.png`
- `en-US` `/my-ixai/notifications` → `qa-artifacts/production-authenticated-audit/en-US/my-ixai-notifications.png`
- `en-US` `/my-ixai/timeline` → `qa-artifacts/production-authenticated-audit/en-US/my-ixai-timeline.png`
- `en-US` `/my-ixai/copilot` → `qa-artifacts/production-authenticated-audit/en-US/my-ixai-copilot.png`
- `en-US` `/my-ixai/health` → `qa-artifacts/production-authenticated-audit/en-US/my-ixai-health.png`
- `en-US` `/my-ixai/beta` → `qa-artifacts/production-authenticated-audit/en-US/my-ixai-beta.png`
- `en-US` `/my-ixai/risk` → `qa-artifacts/production-authenticated-audit/en-US/my-ixai-risk.png`
- `en-US` `/my-ixai/fcn` → `qa-artifacts/production-authenticated-audit/en-US/my-ixai-fcn.png`
- `en-US` `/my-ixai/intelligence` → `qa-artifacts/production-authenticated-audit/en-US/my-ixai-intelligence.png`
- `en-US` `/my-ixai/settings` → `qa-artifacts/production-authenticated-audit/en-US/my-ixai-settings.png`
- `ja-JP` `/my-ixai/home` → `qa-artifacts/production-authenticated-audit/ja-JP/my-ixai-home.png`
- `ja-JP` `/my-ixai/portfolio` → `qa-artifacts/production-authenticated-audit/ja-JP/my-ixai-portfolio.png`
- `ja-JP` `/my-ixai/input` → `qa-artifacts/production-authenticated-audit/ja-JP/my-ixai-input.png`
- `ja-JP` `/my-ixai/input/stock` → `qa-artifacts/production-authenticated-audit/ja-JP/my-ixai-input-stock.png`
- `ja-JP` `/my-ixai/input/crypto` → `qa-artifacts/production-authenticated-audit/ja-JP/my-ixai-input-crypto.png`
- `ja-JP` `/my-ixai/input/fcn` → `qa-artifacts/production-authenticated-audit/ja-JP/my-ixai-input-fcn.png`
- `ja-JP` `/my-ixai/watchlist` → `qa-artifacts/production-authenticated-audit/ja-JP/my-ixai-watchlist.png`
- `ja-JP` `/my-ixai/notifications` → `qa-artifacts/production-authenticated-audit/ja-JP/my-ixai-notifications.png`
- `ja-JP` `/my-ixai/timeline` → `qa-artifacts/production-authenticated-audit/ja-JP/my-ixai-timeline.png`
- `ja-JP` `/my-ixai/copilot` → `qa-artifacts/production-authenticated-audit/ja-JP/my-ixai-copilot.png`
- `ja-JP` `/my-ixai/health` → `qa-artifacts/production-authenticated-audit/ja-JP/my-ixai-health.png`
- `ja-JP` `/my-ixai/beta` → `qa-artifacts/production-authenticated-audit/ja-JP/my-ixai-beta.png`
- `ja-JP` `/my-ixai/risk` → `qa-artifacts/production-authenticated-audit/ja-JP/my-ixai-risk.png`
- `ja-JP` `/my-ixai/fcn` → `qa-artifacts/production-authenticated-audit/ja-JP/my-ixai-fcn.png`
- `ja-JP` `/my-ixai/intelligence` → `qa-artifacts/production-authenticated-audit/ja-JP/my-ixai-intelligence.png`
- `ja-JP` `/my-ixai/settings` → `qa-artifacts/production-authenticated-audit/ja-JP/my-ixai-settings.png`
- `ko-KR` `/my-ixai/home` → `qa-artifacts/production-authenticated-audit/ko-KR/my-ixai-home.png`
- `ko-KR` `/my-ixai/portfolio` → `qa-artifacts/production-authenticated-audit/ko-KR/my-ixai-portfolio.png`
- `ko-KR` `/my-ixai/input` → `qa-artifacts/production-authenticated-audit/ko-KR/my-ixai-input.png`
- `ko-KR` `/my-ixai/input/stock` → `qa-artifacts/production-authenticated-audit/ko-KR/my-ixai-input-stock.png`
- `ko-KR` `/my-ixai/input/crypto` → `qa-artifacts/production-authenticated-audit/ko-KR/my-ixai-input-crypto.png`
- `ko-KR` `/my-ixai/input/fcn` → `qa-artifacts/production-authenticated-audit/ko-KR/my-ixai-input-fcn.png`
- `ko-KR` `/my-ixai/watchlist` → `qa-artifacts/production-authenticated-audit/ko-KR/my-ixai-watchlist.png`
- `ko-KR` `/my-ixai/notifications` → `qa-artifacts/production-authenticated-audit/ko-KR/my-ixai-notifications.png`
- `ko-KR` `/my-ixai/timeline` → `qa-artifacts/production-authenticated-audit/ko-KR/my-ixai-timeline.png`
- `ko-KR` `/my-ixai/copilot` → `qa-artifacts/production-authenticated-audit/ko-KR/my-ixai-copilot.png`
- `ko-KR` `/my-ixai/health` → `qa-artifacts/production-authenticated-audit/ko-KR/my-ixai-health.png`
- `ko-KR` `/my-ixai/beta` → `qa-artifacts/production-authenticated-audit/ko-KR/my-ixai-beta.png`
- `ko-KR` `/my-ixai/risk` → `qa-artifacts/production-authenticated-audit/ko-KR/my-ixai-risk.png`
- `ko-KR` `/my-ixai/fcn` → `qa-artifacts/production-authenticated-audit/ko-KR/my-ixai-fcn.png`
- `ko-KR` `/my-ixai/intelligence` → `qa-artifacts/production-authenticated-audit/ko-KR/my-ixai-intelligence.png`
- `ko-KR` `/my-ixai/settings` → `qa-artifacts/production-authenticated-audit/ko-KR/my-ixai-settings.png`

## Remaining Issues

- 18 route/locale checks had failed requests.

## Remaining Technical Debt

- DOM coverage is a practical production signal, not a semantic translation proof.
- Technical finance terms such as FCN, KI, KO, API, tickers, and currency codes are intentionally excluded.
- Engine output should continue to be handled through UI display mapping instead of modifying engine internals.
- Screenshots remain required to distinguish intentional technical English from untranslated UI copy.

## Validation

- `npm run qa:production-authenticated`: PASS; generated this report.
- `git diff --check`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS after clearing a stale `.next` build artifact from a prior Turbopack run.
- `QA_PORT=3001 npm run qa:mobile`: PASS.

## Next Fix Recommendations

- Review suspected English leftovers by screenshot before changing copy; some finance terms may intentionally remain English.
- Prioritize authenticated Workspace blockers before translation fixes if any route redirects out of `/my-ixai/*`.
- Fix repeated console or failed-request patterns before expanding visual QA assertions.
- Keep follow-up fixes limited to UI display mapping unless a product owner approves deeper behavior changes.

## Out Of Scope

- Auth behavior changes.
- Supabase schema, migrations, RLS, or API contract changes.
- Risk scoring, valuation, FCN engine, market provider, broker/trading, billing, scheduler, notification delivery, or AI provider changes.
