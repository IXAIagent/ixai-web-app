# v1.83.4 — Weekly Export Fix

## Root Cause

Daily Social Pack export had already recovered after v1.83.3, but Weekly Social Pack could still be blocked because the Social Pack Studio used the admin-selected Weekly draft as its source.

When the selected Weekly row was a `review` / non-canonical revision, the v1.82.3 canonical guard correctly blocked export:

- source status: `review`
- canonical: `false`
- source eligible: `false`
- export eligible: `false`

The guard was correct. The missing layer was source selection: formal Weekly Social Pack generation should use the same-week published canonical Weekly source when it exists, not the selected review draft.

## Source Selection Before / After

Before:

```text
Admin selected Weekly draft
↓
Social Pack source
↓
review / non-canonical can preview
↓
canonical guard blocks export
```

After:

```text
Admin selected Weekly draft
↓
Find same-week published canonical Weekly row
↓
Use canonical row as export/generation source
↓
Keep selected row visible as selected metadata
↓
export allowed only if source + quality guards pass
```

## Canonical Fallback Behavior

Weekly source selection now follows this order:

1. If the selected Weekly draft is `published` and `isCanonical === true`, use it.
2. If the selected Weekly draft is `review` / `draft` / non-canonical, look for a same-week row with:
   - `status === "published"`
   - `isCanonical === true`
3. If found, generate the formal Weekly Social Pack from that canonical row.
4. If not found, keep the selected row as preview-only and keep export disabled.

This does not loosen the canonical export rule.

## UI Metadata Changes

The Social Pack Studio now shows both selected-source and export-source metadata for Weekly:

- selected source slug
- export source slug
- selected status
- export source status
- selected revision
- export source revision
- selected canonical
- export source canonical
- source eligibility reason

This makes it clear when the editor is previewing a selected review draft while export is anchored to the public canonical Weekly.

## Export Eligibility Flow

Weekly export remains allowed only when all checks pass:

- active period is Weekly
- export source id exists
- export source slug exists
- export source is not fallback
- export source status is `published`
- export source `isCanonical === true`
- content quality guard passes

If only review / non-canonical source exists:

- preview is allowed
- Export Current Pack is disabled
- Download PNG is disabled
- Copy caption is disabled
- warning asks the editor to publish a canonical Weekly first

## QA Checklist

- Daily pack remains export eligible when its source and quality guards pass.
- Weekly selected `review` row with same-week published canonical row uses the canonical source for formal pack generation.
- Weekly metadata shows selected source and export source separately.
- Weekly selected `review` row without same-week published canonical row remains preview-only.
- Review / non-canonical Weekly never becomes formal export source.
- v1.83.3 quality guard still ignores CTA / URL / footer / caption metadata false positives.
- Placeholder / `Watch 1 / Watch 2 / Watch 3` / editor-pending text still blocks export.

## Known Limitations

This hotfix does not change Weekly publish or persistence. It relies on the admin Weekly list already containing the same-week canonical row. If Supabase does not return the canonical row in `/api/admin/weekly-briefs`, the Studio cannot promote the export source and will correctly remain disabled.
