# v1.83.2 — Intelligence Extraction Release Patch

## Patch summary

v1.83.1 QA confirmed that the v1.83.0 extraction architecture was correct, but found release-blocking narrative edge cases:

- Daily / Weekly bullets could repeat the same source sentence as both `whatHappened` and `whyItMatters`.
- Weekly AI / Tech Watch could be polluted by macro text when macro copy mentioned `AI beta`.
- Weekly Market Review could omit visible `Crypto → FCN Volatility` because only the first three chain items were rendered.
- The quality guard could falsely flag fixed section labels such as `I-Xuan View` / `一玄觀點`.
- CTA URLs were included in narrative quality scans even though they are attribution / destination metadata.

This patch keeps the v1.82.4 quality guard strict while removing false positives and tightening extraction output.

## Files changed

- `src/lib/intelligence/social/brief-intelligence-extractor.ts`
- `src/lib/intelligence/social/social-intelligence-pack.ts`
- `components/admin/social-intelligence-pack-studio.tsx`
- `docs/INTELLIGENCE_EXTRACTION_RELEASE_PATCH_V1832.md`

No auth, SSO, Supabase schema, backend, LINE, LIFF, Stripe, membership, Portfolio, FCN, Stock, or Crypto files were changed.

## Issues fixed

### 1. Extraction sentence dedupe

The extractor now compares source-derived sentences before using them as adjacent strategist fields.

If `whatHappened` and `whyItMatters` are too similar, `whyItMatters` is replaced with an implication / risk / cross-market consequence sentence.

### 2. Weekly AI / Tech source tightening

Weekly event selection now prioritizes event `label + title` before falling back to full event text. This prevents macro events from being selected as AI / Tech merely because their `whyItMatters` mentions `AI beta`.

AI / Tech Watch now more reliably prefers:

- AI earnings
- guidance
- capex
- cloud
- data center
- semiconductor
- NVDA
- TSMC / 台積電 / 2330
- Taiwan AI supply chain

### 3. Visible Weekly chain grouping

Weekly Market Review now renders three visible chain groups:

- `Fed / Rates → USD`
- `AI Beta → Taiwan Semis`
- `Crypto → FCN Volatility`

This makes the FCN translation visible on the card instead of existing only inside the extraction object.

### 4. Quality guard false positive fix

The quality guard now ignores fixed section labels:

- `I-Xuan View`
- `I-Xuan Weekly View`
- `一玄觀點`

Daily repeated-phrase checking now focuses on I-Xuan View body bullets instead of full slide text, so eyebrow/title labels do not trigger false blockers.

### 5. CTA href excluded from narrative scan

`pack.cta.href` is no longer part of narrative quality scanning. URL attribution remains in the rendered pack and caption, but it should not be treated as narrative copy.

## Before / after examples

Before:

```text
AI Beta｜Macro｜FOMC / Powell...
```

After:

```text
AI Beta → Taiwan Semis｜AI｜NVDA guidance / cloud capex / 台積電供應鏈...
```

Before:

```text
What Happened｜Macro... Macro...
```

After:

```text
What Happened｜AI｜NVDA guidance / cloud capex...
Why It Matters｜AI earnings、guidance、capex 與台積電 / 2330 供應鏈會決定 AI beta 能否擴散。
```

Before:

```text
Weekly Market Review:
- Fed / Rates
- USD
- AI Beta
```

After:

```text
Weekly Market Review:
- Fed / Rates → USD
- AI Beta → Taiwan Semis
- Crypto → FCN Volatility
```

## QA checklist

- Daily Social Pack does not show `Watch 1 / Watch 2 / Watch 3`.
- Daily Social Pack does not show `具體事件待 editor 審閱`.
- Daily Social Pack does not show `Market Pulse / Market Pulse`.
- Daily bullets do not repeat the same sentence as both event and implication.
- Weekly AI / Tech Watch uses AI / earnings / guidance / capex / semiconductor sources.
- Weekly Market Review visibly includes `Crypto → FCN Volatility`.
- Quality guard still blocks placeholder / fallback / editor-pending output.
- Quality guard no longer fails only because of fixed `I-Xuan View` labels.
- CTA URLs do not become narrative quality blockers.

## Release recommendation

Recommendation: **Ready to release as the v1.83 Social Pack extraction patch**, after standard validation passes.

Release packaging note:

- Keep this commit separate from the existing v1.80 / v1.81 Portfolio / input UI work.
- Do not include Supabase migrations or Portfolio / FCN / Stock / Crypto files in the v1.83 content pipeline release.
