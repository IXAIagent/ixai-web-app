# V15.2.1 Brief Publish Reliability Hotfix

Date: 2026-07-04

Scope: Daily / Weekly Brief publish reliability, admin recovery visibility, and durable publish health. This hotfix does not implement V16 and does not add new providers, AI behavior, trading, recommendation, schema, or migrations.

## Incident Summary

Production Daily / Weekly Brief public output stopped advancing after 2026-06-29.

Confirmed latest public rows:

- Daily: `daily-intelligence-2026-06-29`
- Weekly: `weekly-intelligence-2026-07-05`, published on `2026-06-29T05:37:27.62+00:00`

The V15.2 audits found that scheduler generation and public publication were separate steps. Public routes read only `status=published`, while scheduler routes create draft/review material and require human publish.

## Confirmed Root Cause

The production pipeline had a draft/publish reliability gap:

1. Daily scheduler generated or reused drafts but did not publish.
2. Weekly cron explicitly generated drafts only and never published.
3. Public Daily / Weekly routes read only published rows.
4. Daily Supabase write failures could fall back to memory, which is non-durable in production and not public-readback visible.
5. Scheduler health depended on process memory and could not explain stale public output after cold starts or deployment.

Social Pack was not the primary blocker. It remains an optional downstream export workflow.

## Files Changed

- `app/api/admin/daily-briefs/route.ts`
- `app/api/admin/daily-briefs/draft/route.ts`
- `app/api/admin/daily-briefs/scheduler/status/route.ts`
- `app/api/admin/weekly-briefs/route.ts`
- `app/api/admin/weekly-briefs/generate/route.ts`
- `app/api/admin/weekly-briefs/[id]/publish/route.ts`
- `components/admin/daily-briefs-admin.tsx`
- `src/lib/editorial/brief-health.ts`
- `src/lib/editorial/persistence.ts`
- `src/lib/editorial/repository.ts`
- `src/lib/editorial/scheduler.ts`
- `src/types/editorial.ts`
- `docs/V152_BRIEF_RELIABILITY_RECOVERY.md`
- `docs/V152_ADMIN_BRIEF_PIPELINE_AUDIT.md`
- `docs/ROADMAP.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/VERSION_HISTORY.md`

## Before / After

Before:

- Admin could generate drafts, but the UI did not clearly show the public publish gap.
- Daily publish could appear successful even if the write fell back to server memory.
- Scheduler status showed only process-local `lastGeneration`.
- Weekly manual publish existed, but health did not prominently explain that cron never publishes.
- Social Pack shared the same admin page, which made it easy to confuse downstream export with core publication.

After:

- Admin APIs return Brief publish health derived from existing persisted rows.
- Daily health shows latest published, latest draft/review, days since publish, stale state, and publish gap.
- Weekly health shows latest published, latest draft/review, and manual-publish requirement.
- Daily manual publish is durable-aware. If Supabase write fails while configured, the API returns `502 persistence_failed` and marks the memory fallback as not public-readback visible.
- Manual draft generation returns persistence metadata so operators can distinguish durable drafts from non-durable fallback.
- Scheduler status includes derived Daily health and keeps the explicit note that human publish is required.
- Social Pack remains optional and downstream.

## Admin Manual Recovery Flow

Daily:

1. Open `/admin/daily-briefs`.
2. Confirm `Daily Publish Health`.
3. If latest published is stale, click `Generate Daily Draft`.
4. Review the generated draft and provider/fallback metadata.
5. Move through editorial review if needed.
6. Click `Publish`.
7. Confirm the publish message says durable readback is available.
8. Verify `/api/daily-briefs` latest slug/publishedAt advanced.
9. Verify `/daily-brief/[slug]` loads.
10. Generate/export Social Pack separately only after public readback succeeds.

Weekly:

1. Open `/admin/daily-briefs`.
2. Switch to `Weekly Intelligence`.
3. Confirm `Weekly Publish Health`.
4. Generate or select the latest weekly draft.
5. Mark as Review after editorial review.
6. Click `Publish Weekly`.
7. Verify `/api/weekly-briefs/latest` publishedAt advanced.
8. Verify `/weekly-brief/[slug]` loads.
9. Generate/export Weekly Social Pack separately.

## Public Readback Validation

Required production checks after deploy:

- `/api/daily-briefs` returns the newly published Daily as `latest`.
- `/daily-brief/[new-daily-slug]` returns 200.
- `/api/weekly-briefs/latest` returns the newly published Weekly.
- `/weekly-brief/[new-weekly-slug]` returns 200.
- Admin `Daily Publish Health` no longer shows stale published state after manual publish.
- Admin `Weekly Publish Health` no longer shows a draft/publish gap after manual publish.

## Production Env Checklist

Still required:

- Confirm `CRON_SECRET` exists in Vercel Production.
- Confirm whether `IXAI_CRON_SECRET` is also configured and whether custom callers use it.
- Confirm Vercel Cron invocations for:
  - `/api/admin/daily-briefs/generate`
  - `/api/cron/generate-weekly-brief`
- Confirm cron responses are not 401/500.
- Confirm Supabase service-role write env is present.
- Confirm Daily writes land in `ixai_daily_intelligence_drafts`.
- Confirm Weekly writes land in `ixai_weekly_intelligence_drafts`.

## Limitations

- This hotfix does not add a durable run-log table because no migration/schema changes are allowed.
- Health is inferred from existing persisted Brief rows, not from a new scheduler-event log.
- Scheduler still does not auto-publish; this preserves editorial review rules.
- Daily local/dev fallback remains available, but production write failure is now visible to admin publish flows.
- Social Pack is still manual export only and does not publish to external channels.
