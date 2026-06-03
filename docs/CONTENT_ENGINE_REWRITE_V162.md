# Content Engine Rewrite v1.62.1

This document records the v1.62.1 implementation pass for the content engine issues documented in `docs/DAILY_BRIEF_ROOT_CAUSE_ANALYSIS.md`, `docs/CONTENT_ENGINE_V162_PLAN.md`, and `docs/CONTENT_ENGINE_ARCHITECTURE.md`.

## Scope

v1.62.1 fixes deterministic Daily / Social / Weekly narrative repetition, Taiwan product-date drift, and provider-health ambiguity.

Out of scope:

- SSO / Auth.
- Membership / Pro integration.
- Portfolio / FCN / Risk Engine.
- Stripe.
- Provider activation.
- Scraping or unofficial provider workarounds.
- Publish workflow changes.

## Files Changed

- `src/lib/intelligence/insight/build-insight.ts`
- `src/lib/intelligence/generator.ts`
- `src/lib/intelligence/social/social-intelligence-pack.ts`
- `src/lib/editorial/weekly.ts`
- `src/lib/editorial/scheduler.ts`
- `src/lib/editorial/product-date.ts`
- `src/lib/news/providers.ts`
- `src/types/news.ts`
- `src/types/editorial.ts`
- `src/lib/intelligence/insight/repetition-detector.ts`
- `scripts/test-content-engine-v162.mjs`

## Before

The AI + Macro path in the insight builder could return fixed Daily question-driven output:

- Same central question.
- Same key answer.
- Same I-Xuan View.

The Daily title then prioritized `questionDriven.centralQuestion`, so adjacent same-theme days could publish near-identical titles.

Daily Social Pack consumed the same `questionDriven` object directly, so Social Slide 1 and Slide 5 could repeat Daily title / I-Xuan wording.

Weekly generation already had a weekly intake path, but summary and suggestion layers still allowed shared question-driven insight to dominate weekly thesis copy.

Daily scheduling used ISO/UTC date slicing in critical date-key paths, which could expose the wrong product-date slug in Asia/Taipei around UTC boundary hours.

Provider Health displayed disabled providers but did not expose structured disabled reason codes.

## After

### Title Diversification

`build-insight.ts` now generates AI + Macro Daily questions from:

- AI event subject.
- Macro / rates evidence subject.
- Risk event context.
- Evidence source.

The same AI + Macro regime can still produce AI-centered interpretation, but the title angle changes with the event mix. Example angle families:

- What the top AI event now needs to prove.
- Whether capital is rotating toward proven AI winners.
- Whether AI capex is moving into cash-flow validation.
- How the AI event changes risk tolerance under rates / dollar pressure.

### 7-Day Title Uniqueness Guard

`generator.ts` now selects Daily title candidates against the recent 7 Daily drafts / review / published rows. If the preferred title is too similar, it tries alternate event-driven angles before falling back to a difference-aware title.

This guards against same-theme adjacent briefs becoming same-title briefs.

### Daily / Social Separation

`social-intelligence-pack.ts` now builds Daily social title and I-Xuan copy through social-native helpers:

- `buildDailySocialTitle()`
- `buildDailySocialView()`

Daily Social Pack still uses the same market events, but it no longer directly reuses the Daily `questionDriven.centralQuestion` or full Daily I-Xuan View as slide copy.

### Weekly Separation

`weekly.ts` now prioritizes weekly periodic narrative for summary / suggestion fields:

- Weekly pricing / thesis uses `periodicNarrative.mainNarrative`.
- Weekly risk tone uses `periodicNarrative.riskNarrative`.
- Weekly What Changed uses `periodicNarrative.whatChanged`.
- Weekly AI suggestion uses weekly narrative before shared question-driven view.

Daily aggregation remains continuity metadata, not the primary weekly thesis source.

### Taiwan Date Fix

`src/lib/editorial/product-date.ts` centralizes product-date helpers:

- `getProductDateKey()`
- `getDailyIntelligenceSlugDate()`
- `buildDailyIntelligenceSlug()`

Daily scheduler and generated Daily slugs now use Asia/Taipei as the canonical product date.

### Provider Health Fix

`NewsSourceStatus` now supports structured `reasonCode` values:

- `rate_limited`
- `empty_feed`
- `forbidden`
- `unsupported_source`
- `disabled_by_policy`
- `active_in_pro_via_different_path`

Yahoo Finance final status:

- App Daily RSS path remains disabled.
- Reason: repeated 429 / rate-limit responses.
- This does not disable App quote Yahoo chart API or backend / Pro yfinance paths, which are separate provider paths.

Bloomberg final status:

- App Daily Bloomberg RSS remains disabled.
- Reason: stable public RSS access and usage terms are unverified.
- No scraping, unofficial endpoint, or workaround is added.

## Regression Tests

`scripts/test-content-engine-v162.mjs` checks:

- Daily AI + Macro path does not retain the old fixed central question.
- Daily generator includes 7-day title uniqueness and Asia/Taipei slug helpers.
- Daily Social Pack does not directly reuse Daily `questionDriven.centralQuestion`.
- Weekly summary prioritizes weekly periodic narrative over shared question-driven thesis.
- Asia/Taipei date key maps UTC boundary time correctly.
- Yahoo Finance and Bloomberg expose explicit disabled reason codes.

Validation results:

- `node scripts/test-content-engine-v162.mjs`: passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- `git diff --check`: passed.
- `QA_BASE_URL=http://localhost:3001 npm run qa:mobile`: failed because no server was running on `localhost:3001`.
- `QA_PORT=3001 npm run qa:mobile`: passed; the script started the dev server and verified 390px routes.

## Rollback Plan

If production content regresses:

1. Revert v1.62.1 code changes.
2. Keep v1.62.0 architecture docs.
3. Restore previous Daily / Social / Weekly generation behavior.
4. Keep provider activation unchanged.
5. Re-run lint, build, content regression checks, and manual Daily / Social / Weekly output QA before reattempting a narrower patch.
