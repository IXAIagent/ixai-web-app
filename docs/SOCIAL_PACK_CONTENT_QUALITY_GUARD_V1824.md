# v1.82.4 — Social Pack Content Quality Guard

## Bug Summary

v1.82.0 through v1.82.3 fixed Social Pack source alignment, period matching, weekly revision status, and canonical export eligibility.

The remaining release risk is content quality:

- Daily Social Pack can contain editor-pending text such as `具體事件待 editor 審閱`.
- Weekly Social Pack can contain repeated generic fallback sentences.
- Weekly AI / Tech cards can drift into crypto or macro-only copy while still being labeled AI / Tech.
- Weekly packs can miss the core Weekly Brief value: cross-market chain, FOMC catalyst, and FCN awareness.

This version adds an export quality guard only. It does not rewrite Social Pack generation.

## Modified Files

- `components/admin/social-intelligence-pack-studio.tsx`

No Daily generator, Weekly generator, Supabase schema, Portfolio / FCN / Stock / Crypto, auth, SSO, backend, LINE, Stripe, or Pro launch code was changed.

## Quality Issues Found

The current incident QA found examples that should block formal export:

- `具體事件待 editor 審閱`
- repeated generic sentence: `這不是新聞數量，而是市場定價正在改變。`
- bare `Watch 1 / Watch 2 / Watch 3` labels without enough specific content
- AI / Tech card content that talks only about BTC / ETH or macro pressure
- Weekly cards that omit next-week catalyst terms such as FOMC / Powell / rates / CPI / PCE / earnings / guidance / TSMC / QQQ / SPY / BTC

## Quality Guard Rules

The studio now runs `detectSocialPackQualityIssues(pack)` before formal output.

The detector checks all slide text and caption text for:

- placeholder or editor-pending language
- `TBD`, `TODO`, `placeholder`, `fallback`
- `Watch 1`, `Watch 2`, `Watch 3`
- repeated exact sentences
- empty or overly short bullets
- consecutive highly generic slides without concrete market elements

Preview remains available. Formal output is blocked when quality issues exist.

## Weekly-Specific Checks

Weekly Social Pack formal export requires:

- no placeholder text
- no repeated sentence blockers
- at least one next-week catalyst keyword:
  - FOMC
  - Powell
  - 利率
  - CPI
  - PCE
  - 財報
  - guidance / 指引
  - 台積電 / 2330
  - QQQ / SPY / BTC
- AI / Tech Watch content must include AI / semiconductor / guidance / capex / cloud / data center language, not only BTC / ETH or pure macro wording.
- If an FCN / Risk Watch card exists, it must include FCN risk language such as KO / KI / worst-of / volatility / 波動 / 籃子.

## Daily-Specific Checks

Daily Social Pack formal export requires:

- no placeholder or editor-pending language
- cover title and I-Xuan View must share a basic market theme
- I-Xuan View must not contain obvious repeated phrases that create grammar issues
- Watch Next must contain concrete observations, not only bare `Watch 1 / Watch 2 / Watch 3`

## Export Disable Behavior

The final export eligibility now requires both:

1. Source / period / canonical guard passes.
2. Content quality guard passes.

If quality fails:

- preview stays visible
- `Export Current Pack` is disabled
- per-slide `Download PNG` is disabled
- `Copy caption` is disabled
- the UI shows `Content quality: failed`, issue count, and top issues

Warning copy:

```text
目前 Social Pack 含待審閱文字或 placeholder。可以預覽，但不可正式匯出。
```

## Known Limitations

- This is a guard, not a narrative rewrite.
- It blocks bad exports but does not improve the underlying Social Pack copy.
- It detects obvious placeholders and generic fallback patterns, but it cannot fully judge editorial nuance.
- It does not force Weekly Social Pack to include a dedicated cross-market chain card.
- It does not add a dedicated FCN Weekly card when the generator did not produce one.

## QA Checklist

Manual checks:

1. Open `/admin/daily-briefs`.
2. Select a Daily source that produces `具體事件待 editor 審閱`.
3. Confirm preview renders but export / download / copy are disabled.
4. Select a Weekly source that produces repeated generic copy.
5. Confirm preview renders but export / download / copy are disabled.
6. Confirm a review / non-canonical Weekly remains blocked by the v1.82.3 canonical guard.
7. Confirm a clean published canonical pack can export only when both source guard and quality guard pass.

Automated validation:

- `npm run lint`
- `npm run build`
- `git diff --check`
- `QA_PORT=3001 npm run qa:mobile`

## Next Step

Recommended follow-up:

`v1.82.5 — Weekly Social Pack Narrative Rewrite`

Goal:

- Rewrite Weekly Social Pack structure so it carries:
  - cross-market chain
  - FOMC / next-week catalyst
  - AI earnings / guidance
  - FCN worst-of / KI / volatility awareness

