# v1.82.3 — Weekly Social Pack Canonical Export Guard

## Bug Summary

v1.82.0 fixed Daily / Weekly period alignment, but Weekly Social Pack export could still use a selected Weekly `review` or non-canonical revision.

Observed risk:

```text
Public Weekly Brief
→ r3
→ status=published
→ is_canonical=true

Admin selected Weekly source
→ r4
→ status=review
→ is_canonical=false

Weekly Social Pack
→ generated from selected r4
→ export allowed before v1.82.3
```

This created a revision/status mismatch: Weekly Social Pack could differ from the public Weekly Brief even when the period source was technically Weekly.

## Root Cause

`SocialIntelligencePackStudio` used the selected admin Weekly draft as the Weekly Social Pack source.

The v1.82.0 export guard checked:

- matching period
- source id
- source slug
- not fallback

It did not require Weekly source status or canonical state.

## Modified Files

- `components/admin/social-intelligence-pack-studio.tsx`

No generator, Weekly persistence, Supabase schema, Portfolio / FCN / Stock / Crypto, auth, SSO, backend, LINE, Stripe, or Pro launch code was changed.

## New Weekly Export Rule

Formal Weekly Social Pack export now requires:

- active period is `weekly`
- source id exists
- source slug exists
- source is not fallback
- source status is `published`
- source `isCanonical === true`

If the selected Weekly draft is `draft`, `review`, `archived`, or non-canonical:

- preview remains visible
- `Export Current Pack` is disabled
- per-slide `Download PNG` is disabled
- `Copy caption` is disabled
- warning copy is shown

Warning:

```text
目前選取的是 Weekly review / non-canonical 版本。可以預覽，但不可下載 PNG 或複製正式 caption。請先發布成 canonical weekly，再產出正式 Social Pack。
```

## Daily Behavior Unchanged

Daily Social Pack keeps the v1.82.0 source guard:

- Daily mode requires `dailyDraft`
- source id and slug must exist
- fallback is preview-only

No Daily canonical rule was added because Daily does not currently use the Weekly revision/canonical model.

## Source Metadata

The studio now surfaces:

- source period
- source slug
- source title
- source date / week range
- source status
- revision number
- canonical true / false
- export eligible true / false
- fallback state

For Daily, revision and canonical show `not applicable`.

## Fallback Handling

Fallback packs remain preview-only:

- no formal PNG export
- no per-slide download
- no caption copy
- warning stays visible

This keeps emergency editorial preview available without allowing fallback material to become a formal Social Pack.

## QA Checklist

Manual:

1. Open `/admin/daily-briefs`.
2. In Weekly desk, select `weekly-intelligence-2026-06-07-r4` or another `review` / non-canonical Weekly.
3. Confirm Social Pack preview renders.
4. Confirm metadata shows:
   - source status `review`
   - revision `v4`
   - canonical `false`
   - export eligible `false`
5. Confirm `Export Current Pack`, `Download PNG`, and `Copy caption` are disabled.
6. Select `weekly-intelligence-2026-06-07-r3` or another `published + canonical` Weekly.
7. Confirm metadata shows:
   - source status `published`
   - canonical `true`
   - export eligible `true`
8. Confirm export/download/copy controls are enabled.
9. Confirm Daily Social Pack still follows the existing Daily source guard and is not blocked by Weekly canonical rules.

Automated:

- `npm run lint`
- `npm run build`
- `git diff --check`
- `QA_PORT=3001 npm run qa:mobile`

## Remaining Limitations

- The studio still relies on the admin-selected Weekly row.
- It does not automatically switch to public latest canonical Weekly.
- It does not fetch or display a separate public canonical slug beside the selected draft.
- It does not alter Weekly revision creation or publish workflow.

Recommended follow-up:

`v1.82.4 — Weekly Social Pack Canonical Source Selector`

Goal:

- Show selected draft slug versus public canonical slug.
- Optionally allow the operator to switch preview source.
- Keep formal export tied to published canonical Weekly only.
