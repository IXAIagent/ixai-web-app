# v1.83.8b — Weekly Sentence Allocation Fix

## Root Cause

Production diagnostics showed Weekly Social Pack export was blocked by `duplicate_sentence` issues. The same generated source sentence could be allocated to multiple weekly cards, especially:

- Card 2 `market_review`
- Card 3 `ai_tech_watch`
- Card 4 `top_news`
- Card 5 `weekly_view`

This made content quality fail with similarity `1.00` and disabled Export / Download PNG / Copy Caption even though source and canonical guards were already passing.

## Modified Files

- `src/lib/intelligence/social/social-intelligence-pack.ts`
- `scripts/qa-weekly-export-fixture.mjs`

## Fix Summary

`generateWeeklySocialPack()` now uses a weekly-only sentence allocation pool:

- Card 2 market review marks its selected body sentences as used.
- Card 3 AI / Tech Watch avoids Card 2 sentences and avoids repeating among What Happened / Why It Matters / Watch Next.
- Card 4 Next Week Catalysts avoids Card 2 and Card 3 sentences.
- Card 5 I-Xuan Weekly View avoids Card 2 / Card 3 / Card 4 body sentences.

When source material is too thin, the generator falls back to concrete market anchors:

- Fed / Rates → USD
- AI guidance / earnings / capex
- Crypto → FCN Volatility
- FOMC / Powell
- KO / KI / worst-of

## Guard Behavior

No guard rule was relaxed.

The following remain blocked:

- `Watch 1 / Watch 2 / Watch 3`
- editor-pending text
- `TBD / TODO / placeholder`
- `Market Pulse / Market Pulse`
- blank cards
- true duplicate body sentences

## Fixture Validation

The weekly export fixture now explicitly checks:

- `duplicate_sentence = 0`
- Content quality passed
- Quality issues 0
- Export eligible true
- Export Current Pack enabled
- Download PNG enabled
- Copy Caption enabled

## Before / After

Before:

- A market sentence selected for Card 2 could be reused as Card 3 AI / Tech content or Card 5 I-Xuan View.
- Quality diagnostics reported `duplicate_sentence` with similarity `1.00`.

After:

- Weekly slides receive distinct body sentences from a shared allocation pool.
- Repetition is prevented at generation time instead of being papered over by the guard.

## Remaining Limitations

This patch only fixes sentence allocation for Weekly Social Pack. It does not rewrite the narrative engine, modify Daily generation, change canonical source selection, or change export eligibility logic.
