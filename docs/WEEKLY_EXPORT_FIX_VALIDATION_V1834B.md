# v1.83.4b — Weekly Export Fixture Validation

## Validation Method

Added a local QA fixture script:

```text
scripts/qa-weekly-export-fixture.mjs
```

The script does not modify production behavior. It uses Playwright to open the local admin page and intercepts:

```text
/api/admin/weekly-briefs
```

with a deterministic fixture containing two same-week Weekly rows.

## Fixture Data

Selected review row:

```text
slug: weekly-intelligence-2026-06-14-r2
status: review
revision: v2
isCanonical: false
weekStart: 2026-06-08
weekEnd: 2026-06-14
```

Published canonical row:

```text
slug: weekly-intelligence-2026-06-14
status: published
revision: v1
isCanonical: true
weekStart: 2026-06-08
weekEnd: 2026-06-14
```

## Expected Result

The intended v1.83.4 behavior is:

- selected source remains `weekly-intelligence-2026-06-14-r2`
- selected status remains `review`
- selected canonical remains `false`
- export source becomes `weekly-intelligence-2026-06-14`
- export source status becomes `published`
- export source canonical becomes `true`
- Source eligible becomes `true`
- Export eligible becomes `true`

## Actual Result

Fixture output:

```json
{
  "ok": false,
  "actual": {
    "selectedSlug": "weekly-intelligence-2026-06-14",
    "sourceSlug": "weekly-intelligence-2026-06-14",
    "selectedStatus": "published",
    "sourceStatus": "published",
    "selectedCanonical": "true",
    "sourceCanonical": "true",
    "sourceEligible": "true",
    "exportEligible": "true",
    "contentQuality": "passed",
    "qualityIssues": "0",
    "exportCurrentPackVisible": true,
    "copyCaptionVisible": true,
    "downloadPngVisible": true
  }
}
```

## Interpretation

The core export unblock condition is verified:

- same-week canonical published source is used for export
- `Source eligible: true`
- `Export eligible: true`
- content quality passes
- export controls are visible/enabled

However, metadata separation is not fully verified. The Studio displays selected metadata as the canonical export source instead of showing the review selected row separately.

Root cause found during validation:

```text
SocialIntelligencePackStudio receives selectedWeeklyDraft,
but the component destructuring does not currently bind selectedWeeklyDraft,
so sourceAlignmentFor falls back to weeklyDraft for selected metadata.
```

## Whether v1.83.4 Is Safe To Push

For the immediate hotfix goal of unblocking Weekly export, v1.83.4 is functionally effective when same-week canonical data exists.

For the full v1.83.4 requirement, it is not complete because selected-source metadata does not yet separate from export-source metadata.

Recommendation:

- Do not claim full v1.83.4 completion until selected metadata is fixed.
- A very small follow-up patch can complete this by destructuring `selectedWeeklyDraft` in `SocialIntelligencePackStudio` and passing it into `sourceAlignmentFor`.

## Remaining Risk

- If `/api/admin/weekly-briefs` does not include the same-week published canonical row, Weekly export will remain disabled as intended.
- If content quality fails for real narrative body issues, Weekly export will remain disabled as intended.
- Operator metadata currently hides the selected review row, which can reduce editorial clarity even though export is anchored to canonical.

## Validation Command

```bash
QA_BASE_URL=http://localhost:3001 node scripts/qa-weekly-export-fixture.mjs
```
