# V16A-3 Live Editorial Platform

Review date: 2026-07-06

## Executive Summary

V16A-3 adds the Live Editorial Platform foundation for IXAI AI Financial Media.

This is not a Yahoo, Reuters, Google News, Bloomberg, RSS, or AI integration. It is the provider framework that future sources must pass through before reaching Daily Brief, Weekly Brief, or the Editorial Intelligence Engine.

The core contract remains:

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

## Provider Framework

Added `src/lib/editorial/providers/` with:

- `provider-types.ts`
- `provider-registry.ts`
- `provider-health.ts`
- `provider-cache.ts`
- `provider-fallback.ts`
- `provider-coverage.ts`
- `provider-quality.ts`
- `provider-source.ts`
- `provider-adapter.ts`
- `index.ts`

## Provider Contract

Providers must output `EditorialRawStory`.

`EditorialRawStory` preserves:

- provider id
- provider name
- provider URL placeholder
- provider timestamp
- normalized timestamp
- source kind
- title
- summary
- markets
- symbols
- categories
- confidence
- importance

Provider-specific response shapes are not downstream contracts.

## Provider Registry

The registry supports:

- `registerProvider()`
- `removeProvider()`
- `listProviders()`
- `listProviderMetadata()`
- provider metadata
- provider priority
- provider status
- provider capabilities

The current registered provider is a foundation placeholder provider backed by existing deterministic editorial source data.

## Provider Health

Health states:

- healthy
- degraded
- offline
- maintenance
- unknown

Health diagnostics include:

- last success
- last failure
- failure reason
- latency
- coverage

## Provider Cache

Added memory-only cache abstraction:

- cache key
- TTL
- cache state
- cache diagnostics

No Redis, database, or external cache was added.

## Provider Fallback

Fallback order:

```text
primary unavailable
↓
secondary
↓
cached
↓
limited brief
↓
empty state
```

The framework follows the V16 principle:

```text
Provider failure must degrade intelligence, not crash the product.
```

## Coverage Score

Provider coverage supports:

- macro
- US
- Taiwan
- China
- Crypto
- Energy
- FCN
- Macro Risk
- AI
- Technology

The platform calculates covered areas, missing areas, and an overall coverage score.

## Quality Score

Provider quality includes:

- freshness
- duplicates
- coverage
- confidence
- latency
- availability

The platform returns an overall quality score.

## Diagnostics

Editorial Provider Diagnostics include:

- registered providers
- healthy providers
- degraded providers
- offline providers
- coverage
- quality
- cache
- fallback readiness
- publication readiness

## Live Preview Integration

Daily Brief Preview now includes:

- provider readiness
- coverage score
- quality score

Weekly Brief Preview now includes:

- provider readiness
- coverage score
- fallback source

Admin Daily Brief preview now includes:

- provider count
- provider readiness
- provider quality
- provider coverage
- fallback source

All integrations are read-only. Generate, review, publish, scheduler, and Social Pack workflows are unchanged.

## Out of Scope

V16A-3 does not add:

- Yahoo
- Google News
- Reuters
- Bloomberg
- RSS
- OpenAI
- Claude
- Gemini
- scheduler auto-publish
- Telegram
- LINE
- Email
- Push
- database
- migration
- trading
- recommendation
- billing
- V16B Workspace monitoring

## Validation Checklist

- `git diff --check`
- `git diff --cached --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`
