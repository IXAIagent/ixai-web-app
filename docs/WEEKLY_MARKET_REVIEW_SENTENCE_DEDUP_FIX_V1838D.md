# v1.83.8d — Weekly Market Review Sentence-Level Dedup Fix

## Root Cause

Weekly Social Pack `market_review` could still fail quality checks because two different buckets could share one source sentence inside their body text.

Confirmed blocker:

- issue type: `duplicate_sentence`
- slide id: `market_review`
- slide title: `What Changed This Week`
- similarity: `1.00`

This was not a renderer, quality guard, export source, diagnostics UI, or deployment problem. The issue was inside `generateWeeklySocialPack()` source allocation.

## Fix

`allocateMarketReviewBodies()` now performs sentence-level allocation:

1. Split each market review body into sentences.
2. Maintain `usedSentenceKeys`.
3. Remove sentences already used by earlier buckets.
4. If the remaining body is too short or empty, use the bucket-specific fallback.
5. Mark fallback sentences as used too.

Bucket fallbacks:

- Fed / Rates → USD: `FOMC / Powell 與美元變化會影響科技股折現率。`
- AI Beta → Taiwan Semis: `觀察 AI guidance / capex 是否支撐台股半導體估值。`
- Crypto → FCN Volatility: `BTC / ETH 與 worst-of 籃子波動是 FCN 風險溫度計。`

## QA Fixture

`scripts/qa-weekly-export-fixture.mjs` now checks that the rendered `What Changed This Week` section has no repeated sentence keys across the Fed, AI, and Crypto buckets.

Expected fixture result:

- `duplicateSentenceIssues: 0`
- `marketReviewInternalDuplicates: []`
- `marketReviewSharedSentenceKeys: []`
- `Content quality: passed`
- `Quality issues: 0`
- `Export eligible: true`

## Scope

No changes were made to:

- Social Pack Studio
- quality guard rules
- renderer fallback
- export logic
- Daily generator
- Portfolio / FCN / Pro / v1.80 / v1.81 files
