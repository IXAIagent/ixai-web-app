# v1.82.0 — Daily / Weekly Social Pack Source Alignment Fix

## Root Cause

The 2026-06-07 content pipeline incident audit found the highest-confidence Social Pack issue in the admin studio source boundary:

- `SocialIntelligencePackStudio` computed both Daily and Weekly packs on every render.
- The Daily admin desk passed only `dailyDraft`.
- The Weekly admin desk passed only `weeklyDraft`.
- When the operator switched to the period without a matching source, the generator still returned fallback content.
- That fallback preview could be exported like a formal Social Pack, making Daily / Weekly source mapping look crossed.

The generators are still separate:

- `generateDailySocialPack(dailyDraft)`
- `generateWeeklySocialPack(weeklyDraft)`

The bug was not that Weekly directly called Daily Social Pack generation. The bug was that the shared admin studio allowed a pack to be exported when no matching period source existed.

## Fix Scope

Modified file:

- `components/admin/social-intelligence-pack-studio.tsx`

No Daily generator, Weekly generator, Supabase schema, Portfolio / FCN / Stock / Crypto, auth, SSO, backend, LINE, Stripe, or Pro launch code was modified.

## Source Guard Behavior

The Social Pack Studio now enforces:

- Daily mode requires a matching `dailyDraft`.
- Weekly mode requires a matching `weeklyDraft`.
- The active pack period must match the selected source period.
- The source must have an id and slug.
- Fallback-only packs can be previewed but cannot be exported as official Social Packs.

If a matching source is missing, the studio shows a warning:

- `找不到對應的 Daily Brief 來源，請先產生或選擇 Daily Brief。`
- `找不到對應的 Weekly Brief 來源，請先產生或選擇 Weekly Brief。`
- `此為 fallback preview，不可匯出為正式社群包。`

## Source Metadata Display

The studio now displays source diagnostics before export:

- Source period
- Source slug
- Source title
- Source date or week range
- Source status
- Fallback state

This makes the source boundary visible before a human operator exports PNG slides or copies captions.

## Disabled Button Rules

Generate / export controls are disabled when:

- The active period has no matching source draft.
- The source slug is missing.
- The active pack is fallback-only.
- The pack period does not match the active period.

Disabled actions:

- Period switch button for an unavailable source period.
- Export Current Pack.
- Per-slide Download PNG.
- Copy caption.

## Fallback Handling

Fallback generation remains available as a visual preview and emergency editorial reference. It is no longer allowed to behave like a formal export source.

Expected behavior:

```text
Daily desk + dailyDraft present
→ Daily Social Pack export allowed
→ Weekly button disabled unless weeklyDraft exists

Weekly desk + weeklyDraft present
→ Weekly Social Pack export allowed
→ Daily button disabled unless dailyDraft exists

No matching source
→ Fallback preview only
→ Export / download / copy disabled
```

## Remaining Weekly Canonical Diagnostics

This version does not modify weekly persistence or Supabase data.

The incident audit found a separate pending diagnostics issue:

- Production latest Weekly slug: `weekly-intelligence-2026-06-07-r3`
- Base slug `weekly-intelligence-2026-06-07` returned `not_found`
- Latest Weekly `publishedAt` appeared stale relative to the revision slug

Recommended next investigation:

- Inspect Supabase weekly rows for canonical uniqueness.
- Confirm `published_at`, `revision_number`, `is_canonical`, `week_start`, and `week_end`.
- Confirm only one canonical published row per week.
- Confirm admin share/export uses the exact revision slug, not a guessed base slug.

Do not patch production weekly rows without a separate migration / operations plan.

## QA Checklist

Manual QA:

1. Open `/admin/daily-briefs`.
2. Select a Daily Brief.
3. Confirm Daily Social Pack shows source period `daily`, source slug, source title, source status, and fallback `false`.
4. Confirm Daily export controls are enabled.
5. Confirm Weekly period button is disabled if no Weekly source is passed.
6. Open Weekly editor in the same admin surface.
7. Select a Weekly Brief.
8. Confirm Weekly Social Pack shows source period `weekly`, exact revision slug, source title, week range, source status, and fallback `false`.
9. Confirm Weekly export controls are enabled.
10. Confirm Daily period button is disabled if no Daily source is passed.
11. Force a no-source state if possible and confirm fallback preview is visible but export / download / copy controls are disabled.

Automated validation:

- `npm run lint`
- `npm run build`
- `git diff --check`
- `QA_PORT=3001 npm run qa:mobile`

## Out Of Scope

v1.82.0 does not:

- Rewrite Daily or Weekly content generation.
- Modify weekly canonical persistence.
- Apply Supabase migrations.
- Patch production weekly rows.
- Change provider ingestion.
- Change auth, SSO, Pro launch, backend account-link, LINE, or Stripe.
- Touch Portfolio / FCN / Stock / Crypto v1.80 / v1.81 files.

## Next Recommended Version

Recommended follow-up:

`v1.82.1 — Weekly Canonical Revision Diagnostics`

Goal:

- Add or run safe diagnostics for weekly canonical row state.
- Confirm why the latest weekly revision slug has stale-looking `publishedAt`.
- Confirm public readback, admin selected row, and Social Pack source slug all point to the same canonical weekly revision.
