# v1.83.4c — Weekly Metadata Separation Patch

## Problem

v1.83.4b fixture validation confirmed that Weekly export could become eligible when a same-week published canonical row existed, but the Social Pack Studio metadata still showed the selected source as the canonical export source.

Observed before patch:

```text
Selected slug = weekly-intelligence-2026-06-14
Selected status = published
Selected canonical = true
Source eligible = true
Export eligible = true
```

Expected:

```text
Selected slug = weekly-intelligence-2026-06-14-r2
Selected status = review
Selected canonical = false
Export source slug = weekly-intelligence-2026-06-14
Export source status = published
Export source canonical = true
```

## Root Cause

`DailyBriefsAdmin` already passed `selectedWeeklyDraft` into `SocialIntelligencePackStudio`, but the Studio component did not destructure that prop. As a result, `sourceAlignmentFor()` fell back to `weeklyDraft`, which is the canonical export source.

## Patch

`SocialIntelligencePackStudio` now:

- destructures `selectedWeeklyDraft`
- passes it into `sourceAlignmentFor`
- keeps `weeklyDraft` as the export/generation source
- keeps `selectedWeeklyDraft` as selected-source metadata

No export guard, canonical guard, quality guard, narrative generator, Supabase schema, Portfolio, FCN, Pro, or v1.80/v1.81 files were changed.

## Validation

Fixture command:

```bash
QA_BASE_URL=http://localhost:3001 node scripts/qa-weekly-export-fixture.mjs
```

Expected final result:

- selected slug: `weekly-intelligence-2026-06-14-r2`
- selected status: `review`
- selected canonical: `false`
- export source slug: `weekly-intelligence-2026-06-14`
- export source status: `published`
- export source canonical: `true`
- Source eligible: `true`
- Export eligible: `true`

## Release Recommendation

v1.83.4 + v1.83.4b + v1.83.4c should be treated as one Weekly export hotfix set. The patch completes both:

- the actual export-source promotion
- the admin metadata separation needed for editorial clarity
