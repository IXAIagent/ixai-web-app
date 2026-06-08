# v1.83.1 — Intelligence Extraction QA Validation

## QA summary

This validation reviewed the v1.83.0 Intelligence Extraction Layer as a release candidate for Social Pack quality.

Scope:

- docs-only QA validation
- no product code changes
- no auth, SSO, Supabase schema, backend, LINE, LIFF, Stripe, Membership, Portfolio, FCN, Stock, or Crypto changes

Files reviewed:

- `docs/INTELLIGENCE_EXTRACTION_LAYER_V1830.md`
- `docs/NARRATIVE_DEPTH_ENGINE_V1827.md`
- `docs/SOCIAL_PACK_CONTENT_QUALITY_GUARD_V1824.md`
- `docs/PROJECT_RULES.md`
- `src/lib/intelligence/social/brief-intelligence-extractor.ts`
- `src/lib/intelligence/social/social-intelligence-pack.ts`
- `components/admin/social-intelligence-pack-studio.tsx`

Validation method:

- static code review of extraction and generator mapping
- static code review of source / quality export eligibility
- local generator smoke run with representative Daily and Weekly mock sources
- standard project validation commands

## Daily QA result

Pass:

- Daily generator no longer emits `Watch 1 / Watch 2 / Watch 3`.
- Daily generator no longer emits `具體事件待 editor 審閱`.
- Daily generator no longer emits `Market Pulse / Market Pulse`.
- Watch Next uses `24h / 48h / 72h` labels with concrete anchors.
- Risk card includes `FCN Translation`.
- FCN translation now references worst-of / KO / KI / basket / volatility context rather than only defining KO / KI.

Remaining issue:

- A representative mock Daily pack showed repeated text inside `What The Market Sees` bullets because `whatHappened` and `whyItMatters` can both be built from the same source phrase.
- The cover card can still feel slightly generic when the Daily source only contains legacy sections and no rich `questionDriven` fields.

Daily sample before / after assessment:

- Before v1.83: Daily Social Pack could collapse into generic source splitting, weak Watch labels, or editor-pending language.
- After v1.83: Daily structure is materially better, but the repeated `whatHappened + whyItMatters` phrase should be patched before release.

## Weekly QA result

Pass:

- Weekly generator now explicitly exposes cross-market chain fields.
- Weekly Social Pack includes:
  - `Fed / Rates`
  - `USD`
  - `AI Beta`
  - `Taiwan Semis`
  - `Crypto`
  - `FCN Volatility`
- Weekly Next Week Catalysts can produce three concrete catalyst items.
- Weekly View includes `FCN Translation`.
- The generator no longer directly emits the known banned phrase `本週市場重點在事件下週催化`.

Remaining issues:

- A representative mock Weekly pack showed `AI Beta` content being populated by the macro event when the AI event exists but the extraction pattern selects the wrong source first. This means the extraction architecture is right, but the weekly event matching / assignment needs tightening.
- Weekly `ai_tech_watch` bullets can repeat the same sentence because `whatHappened`, `whyItMatters`, and `whatChangesMyMind` may come from the same extracted text.
- Weekly Market Review currently slices only the first three chain items, so `Crypto` and `FCN Volatility` can be omitted from the visible card even though the extraction object contains them. This weakens the required `Crypto → FCN Volatility` visible story.

Weekly sample before / after assessment:

- Before v1.83: Weekly Social Pack could lose the Weekly Brief chain and become generic.
- After v1.83: the chain exists and is used, but the card rendering still needs one tightening pass so the visible card carries the full strategist chain cleanly.

## Quality guard result

Confirmed by code review:

- Source alignment guard remains active.
- Weekly export still requires published + canonical source.
- Fallback preview remains non-exportable.
- Formal export eligibility still uses:

```ts
sourceAlignment.canExport && quality.canExport
```

Confirmed guard coverage:

- placeholder / editor-pending terms
- `Watch 1 / Watch 2 / Watch 3`
- repeated exact sentences
- weak / short bullets
- consecutive generic slides
- weekly catalyst keyword presence
- AI / Tech card content relevance
- FCN risk language when the relevant slide exists

Potential guard issue:

- The I-Xuan View repetition detector receives full slide text including eyebrow and title. Because both can contain `I-Xuan View` / `一玄觀點`, a clean I-Xuan View may be falsely flagged as a repeated phrase. This should be patched by running the repeated phrase detector on the body bullets only, or by adding `I-Xuan View` / `一玄觀點` to the ignore list.

## URL / CTA quality issue check

Code review result:

- URLs and CTA text are included in `packTexts`.
- Current placeholder patterns do not target URLs.
- Repeated sentence detection should not normally flag a URL.

Remaining risk:

- Caption and CTA are still included in repeated-sentence checks. If the same disclaimer or CTA sentence appears elsewhere in a slide, it could become a false blocker. This was not observed as the primary issue in the local sample, but it is worth excluding CTA href from quality issue text scanning in a future hardening pass.

## Export eligible check

Code-level result:

- Export can become eligible when both source and content quality pass.
- Daily source requires matching source id, slug, period match, and non-fallback source.
- Weekly source additionally requires `status === "published"` and `isCanonical === true`.
- Output buttons use the shared `canExportPack` state, so Download PNG and Copy caption stay aligned with the guard.

Release concern:

- With the current v1.83 sample output, quality is likely to fail because of repeated sentences. That is a useful guard behavior, but it means v1.83.0 should not be pushed as the final quality fix without a small v1.83.2 patch.

## Strategist note assessment

Compared with v1.82.7, v1.83.0 is closer to an I-Xuan strategist note because:

- source evidence is extracted before card rendering
- Daily and Weekly now have explicit extraction contracts
- Weekly has a dedicated cross-market chain object
- FCN translation is elevated from education to market-risk translation

However, it is not fully release-ready because:

- some extracted fields can repeat the same source sentence
- Weekly chain rendering can omit visible Crypto / FCN linkage
- AI / Tech source selection can still drift when macro event text is selected first
- I-Xuan View quality guard may produce false repetition blockers

## Remaining issues

1. Deduplicate `whatHappened` and `whyItMatters` when both are derived from the same source phrase.
2. Ensure Weekly AI / Tech extraction always uses AI / earnings / guidance / capex / Taiwan AI supply chain sources.
3. Render Weekly chain as grouped pairs so the visible card includes:
   - Fed / Rates → USD
   - AI Beta → Taiwan Semis
   - Crypto → FCN Volatility
4. Adjust quality guard I-Xuan View repeated phrase detection to avoid eyebrow/title false positives.
5. Consider excluding `pack.cta.href` from content quality text scanning.

## Whether v1.83.0 is safe to release

Verdict: **Conditionally No-Go**

v1.83.0 is architecturally correct and passes technical validation, but content QA found enough narrative-quality edge cases that it should receive a small patch before push.

## Recommended next step

Recommendation: **B. patch v1.83.2 before push**

Suggested v1.83.2 scope:

- patch extractor sentence deduplication
- patch Weekly AI / Tech source selection
- patch Weekly visible cross-market chain grouping
- patch I-Xuan View quality guard false-positive risk

Do not return to App / Pro work until this Social Pack release path is stable, because v1.83.0 is directly addressing an active content pipeline quality incident.

## Validation commands

Required validation:

- `npm run lint`
- `npm run build`
- `git diff --check`
- `QA_PORT=3001 npm run qa:mobile`

No product code was modified in v1.83.1.
