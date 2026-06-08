# v1.83.8 — Social Pack Quality Diagnostics UI

## Purpose

v1.83.8 adds diagnostics visibility for Social Pack quality guard failures. It does not change narrative generation, export eligibility, source guards, canonical guards, or the quality guard rules themselves.

The goal is to make each blocked issue inspectable in the admin UI so production failures can be attributed to the generator, renderer, caption, or metadata layer.

## Modified Files

- `components/admin/social-intelligence-pack-studio.tsx`

## Diagnostics Fields

Each quality issue now exposes:

- issue type
- slide id
- slide title
- offending text A
- offending text B when applicable
- matched rule
- similarity or repetition count when applicable
- source layer: generated slide, rendered slide, caption, or metadata

## Repeated Sentence Diagnostics

`repeatedSentences()` now returns structured diagnostics instead of plain strings. Exact duplicate sentences keep the existing blocking behavior, but the UI can now show:

- the duplicated sentence
- the first slide/body text that contained it
- the second slide/body text that contained it
- repetition count
- similarity score of `1.00` for exact repeated sentence matches

## Export Behavior

Export behavior is unchanged:

- `canExport` remains based on blocker count.
- Placeholder, editor-pending text, Watch 1/2/3, Market Pulse duplication, empty bullets, and true body repetition remain blocked.
- No guard rule has been relaxed.
- No narrative generator code has been changed.

## Production Verification

When production shows `Content quality: failed`, inspect the expanded issue list and record:

- Issue type
- Source
- Slide id
- Slide title
- Matched rule
- Offending text A
- Offending text B
- Similarity / repetition count

This should identify whether the failure comes from generated slide content, rendered slide text, caption text, or metadata.

## Known Limitation

The current implementation reports existing guard sources. Most current checks operate on generated slide body/subtitle text, so source will usually be `generated slide` unless future diagnostics are added for rendered-slide or caption-specific scans.

## Rollback

Revert the diagnostics-only changes in `components/admin/social-intelligence-pack-studio.tsx`. Export behavior should remain identical before and after rollback because eligibility logic was not changed.
