# v1.82.5 — Narrative Intelligence Rewrite Implementation

## Summary

v1.82.5 rewrites the Social Pack narrative mapping layer so Daily and Weekly packs are generated from stricter editorial contracts before they reach the v1.82.4 export quality guard.

This version changes only the Social Pack narrative generator:

- `src/lib/intelligence/social/social-intelligence-pack.ts`

No auth, SSO, Supabase schema, LINE, LIFF, backend, Stripe, Portfolio, FCN, Stock, Crypto, Pro launch, or account-link code was changed.

## Problem Fixed

Previous Social Pack generation could produce preview cards with weak generator text:

- `具體事件待 editor 審閱`
- `Watch 1 / Watch 2 / Watch 3`
- generic Weekly catalyst language
- Weekly AI / Tech card content drifting into BTC / ETH or pure macro risk
- Daily I-Xuan View repeating the same subject twice
- Weekly Social Pack missing cross-market chain and FCN risk awareness

v1.82.4 blocked those packs from formal export. v1.82.5 reduces the chance they are generated in the first place.

## Daily Rewrite

Daily Social Pack now follows this fixed contract:

1. Cover: today's core market question.
2. What The Market Sees: three axes:
   - Macro
   - AI-Tech
   - Taiwan-Crypto
3. Risk Regime:
   - Risk State
   - Why It Matters
   - FCN Awareness
4. Watch Next:
   - three 24-72 hour observations
   - no `Watch 1 / Watch 2 / Watch 3` labels
5. I-Xuan View:
   - source-aware view
   - avoids repeated subject pairs
   - focuses on evidence, risk tolerance, and continuation logic

Implementation notes:

- Daily market axes are built from `questionDriven.evidenceDetails`, intelligence watch blocks, and public brief sections.
- Risk bullets use `riskRegimeReasoning` and `fcnAwareness` when available.
- Watch Next uses concrete investor watchpoints and only falls back to specific time-window observations.
- I-Xuan View no longer blindly combines the first two evidence subjects if they collapse to the same phrase.
- Daily caption is now source-aware and includes the actual title, market axes, and risk point.

## Weekly Rewrite

Weekly Social Pack now follows this fixed contract:

1. Cover: weekly core market question.
2. What Changed This Week:
   - Macro
   - AI
   - Market
3. The One Thing That Matters:
   - requires AI earnings / guidance / capex / cloud / data center context
4. Next Week Catalysts:
   - at least three concrete catalysts
   - includes FOMC / Powell / rates, AI earnings / guidance, and FCN volatility fallback coverage when source is thin
5. I-Xuan Weekly View:
   - market view
   - risk view
   - next-week observation
   - FCN risk awareness

Implementation notes:

- Weekly changed bullets are sourced from major events, `fedRates`, `taiwanAi`, `intelligenceSummary`, and `sections.narrative.crossMarketNarrative`.
- Next Week Catalysts prioritize `upcomingWeek`, then `nextWeekFocus`, then question-driven watch items, with concrete fallback catalysts.
- The AI / Tech card now explicitly carries earnings / guidance / capex / cloud / data center language.
- Weekly View includes FCN risk awareness through KO / KI / worst-of / volatility / basket language.
- Weekly caption is now source-aware and includes changed-market bullets and catalysts.

## Placeholder Removal

The generator no longer emits formal Social Pack text containing:

- `具體事件待 editor 審閱`
- `待 editor`
- `editor 審閱`
- `Watch 1`
- `Watch 2`
- `Watch 3`
- `TBD`
- `TODO`
- `placeholder`

Code-level helper parameter names may still use the word `fallback`, but that string is not emitted as Social Pack content.

## Quality Guard Relationship

v1.82.4 quality guard remains unchanged and still controls formal export eligibility.

Final export remains blocked when:

- source period / source id / slug guard fails
- Weekly source is not `published + canonical`
- fallback preview source is used
- content quality guard detects placeholder, weak generic output, repeated sentences, title/content mismatch, or missing weekly catalyst terms

v1.82.5 improves generator output, but it does not loosen any export guard.

## Known Limitations

- This does not fix Daily public slug readback loading / 404 behavior. That remains a separate recommended `v1.82.6 — Daily Public Readback Fix`.
- This does not alter Weekly publish or canonical persistence.
- This does not add database fields for narrative contract metadata.
- This does not create automated tests for specific generated card snapshots yet.
- If a source brief is extremely thin, the generator now uses concrete educational fallbacks rather than editor placeholders; the quality guard still decides formal export eligibility.

## QA Checklist

Daily:

- Generate / preview Daily Social Pack.
- Confirm no `具體事件待 editor 審閱`.
- Confirm no `Watch 1 / Watch 2 / Watch 3`.
- Confirm Slide 2 has Macro / AI-Tech / Taiwan-Crypto.
- Confirm Slide 3 has Risk State / Why It Matters / FCN Awareness.
- Confirm Slide 5 is coherent and non-repetitive.

Weekly:

- Generate / preview Weekly Social Pack from published canonical source.
- Confirm Slide 2 has Macro / AI / Market.
- Confirm Slide 3 discusses AI earnings / guidance / capex / cloud / data center.
- Confirm Slide 4 has concrete next-week catalysts.
- Confirm Slide 5 includes market view, risk view, next-week observation, and FCN awareness.
- Confirm v1.82.3 canonical export guard and v1.82.4 quality guard still apply.

Automated validation:

- `npm run lint`
- `npm run build`
- `git diff --check`
- `QA_PORT=3001 npm run qa:mobile`

## Rollback

To roll back v1.82.5 implementation:

1. Revert `src/lib/intelligence/social/social-intelligence-pack.ts`.
2. Keep `components/admin/social-intelligence-pack-studio.tsx` v1.82.4 quality guard in place.
3. Remove this document if reverting the implementation record.

No database rollback is required.
