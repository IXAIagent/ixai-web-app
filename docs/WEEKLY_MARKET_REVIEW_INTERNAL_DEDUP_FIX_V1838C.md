# v1.83.8c — Weekly Market Review Internal Dedup Fix

## Problem

Production diagnostics identified one remaining quality blocker:

- Issue type: `duplicate_sentence`
- Slide id: `market_review`
- Slide title: `What Changed This Week`
- Matched rule: exact sentence repetition in slide body/subtitle
- Similarity: `1.00`

The root cause was internal duplication inside Card 2. Two Market Review bullets could receive the same source body, usually bullet 1 and bullet 3.

## Scope

This patch only touches Weekly Social Pack sentence allocation. It does not modify:

- source guard
- canonical guard
- metadata
- renderer fallback
- quality guard rules
- Daily generator
- Portfolio / FCN / Pro / v1.80 / v1.81 files

## Fix

`generateWeeklySocialPack()` now applies a final `ensureDistinctMarketReviewBodies()` pass before building the three Card 2 bullets:

- Fed / Rates → USD
- AI Beta → Taiwan Semis
- Crypto → FCN Volatility

If any of the three bodies are identical or near-duplicate, the duplicate body is replaced with a label-specific concrete fallback:

- Fed / Rates → USD: `FOMC / Powell 與美元變化會影響科技股折現率。`
- AI Beta → Taiwan Semis: `觀察 AI guidance / capex 是否支撐台股半導體估值。`
- Crypto → FCN Volatility: `BTC / ETH 與 worst-of 籃子波動是 FCN 風險溫度計。`

## Fixture Update

`scripts/qa-weekly-export-fixture.mjs` now checks:

- no `duplicate_sentence` diagnostics
- `Content quality: passed`
- `Quality issues: 0`
- `Export eligible: true`
- Download PNG enabled
- Copy Caption enabled
- no internal duplicate lines inside the `What Changed This Week` section

## Expected Result

Weekly Social Pack should no longer be blocked by internal Card 2 duplicate body text. The quality guard remains strict and will still block true duplicates, placeholders, editor-pending text, empty cards, and Market Pulse duplication.
