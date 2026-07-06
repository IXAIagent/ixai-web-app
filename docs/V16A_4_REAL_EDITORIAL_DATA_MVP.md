# V16A-4 Real Editorial Data MVP

Review date: 2026-07-06

## Executive Summary

V16A-4 starts the first real editorial data MVP for IXAI AI Financial Media.

The implementation uses the V16A-3 Provider Framework. Real provider output is never passed directly to Daily Brief or Weekly Brief. Every provider must output `EditorialRawStory`, then the pipeline normalizes it into IXAI-owned editorial stories before ranking and intelligence processing.

Pipeline:

```text
Provider
↓
EditorialRawStory
↓
Normalize
↓
Editorial Story
↓
Editorial Intelligence Engine
↓
Daily / Weekly
```

## Implemented Providers

### Google News RSS Provider

File:

- `src/lib/editorial/providers/google-news-rss-provider.ts`

Capabilities:

- Basic RSS fetch.
- Topic queries for macro, AI, semiconductor, crypto, Taiwan market, and market risk.
- RSS item parsing into `EditorialRawStory`.
- Title, URL, published timestamp, source attribution, categories, markets, and summary placeholder.
- Timeout and failure containment.

### Yahoo Finance News Provider

File:

- `src/lib/editorial/providers/yahoo-finance-news-provider.ts`

Capabilities:

- Fetch wrapper for Yahoo Finance news / trending-style content.
- Converts Yahoo-specific response shape into `EditorialRawStory`.
- Uses fallback behavior on failure.
- Does not expose Yahoo response shapes downstream.

### Yahoo Finance Market Snapshot Provider

File:

- `src/lib/editorial/providers/yahoo-finance-market-provider.ts`

Capabilities:

- Fetch wrapper for Yahoo Finance quote snapshot data.
- Converts market / index / crypto symbols into market-context `EditorialRawStory` entries.
- Supports Daily Brief market pulse context.
- Falls back to cached / limited / deterministic foundation data on failure.

## Provider Framework Usage

All MVP providers:

- register through provider registry
- use provider health diagnostics
- use memory cache
- use fallback behavior
- output `EditorialRawStory`
- preserve source attribution
- avoid provider-specific downstream contracts

## Fallback Behavior

Fallback order:

```text
real provider
↓
memory cache
↓
deterministic foundation provider
↓
limited brief
↓
empty state
```

Provider failures do not crash the product. They degrade the brief into cached, limited, or deterministic fallback output.

## Diagnostics

Added diagnostics for:

- provider fetch result
- cache hit / miss
- provider latency
- provider error reason
- fallback level
- real-vs-mock source status
- coverage by theme
- quality score

## Daily / Weekly Integration

### Daily Brief

Public `/daily-brief` now uses the async real editorial provider pipeline first.

If Google / Yahoo providers fail, Daily Brief falls back to cache or deterministic foundation source.

### Weekly Brief

Public `/weekly-brief` now uses the same async provider source path.

Weekly Brief may render a limited preview if provider coverage is incomplete.

### Admin Daily Briefs

Admin `/admin/daily-briefs` remains read-only for provider diagnostics.

The client-side admin preview does not directly fetch Google or Yahoo. It displays provider registry, fallback, cache, coverage, and quality diagnostics safely.

## Out of Scope

V16A-4 does not add:

- OpenAI
- Claude
- Gemini
- scheduler auto-publish
- Telegram
- LINE
- Email
- Push
- database schema
- migration
- trading
- buy / sell / hold
- target price
- recommendation
- billing
- V16B Workspace monitoring
- direct provider response consumption by Daily / Weekly

## Validation Checklist

- `git status -sb`
- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`
- `git diff --cached --check`
