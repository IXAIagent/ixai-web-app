# V15.2 Brief Reliability Recovery Program

## Incident Summary

From 2026-06-29 through 2026-07-04, production Daily / Weekly Brief output did not advance normally.

This is a P0 reliability blocker before V16 AI Monitoring Platform work. V16 should not begin until the public Brief production pipeline is fault-tolerant enough to produce a Daily / Weekly surface even when providers, optional downstream Social Pack work, or scheduler invocations fail.

This investigation is docs-only. It does not modify V16, provider behavior, AI behavior, database schema, API contracts, trading, recommendations, or product UI.

## Production Evidence

Production public API readback on 2026-07-04:

- Daily API: `https://app.ixuan.ai/api/daily-briefs`
- Latest Daily slug: `daily-intelligence-2026-06-29`
- Latest Daily status: `published`
- Latest Daily published at: `2026-06-29T05:36:33.407+00:00`
- Weekly API: `https://app.ixuan.ai/api/weekly-briefs/latest`
- Latest Weekly slug: `weekly-intelligence-2026-07-05`
- Latest Weekly published at: `2026-06-29T05:37:27.62+00:00`
- Weekly coverage: `2026-06-29 – 2026-07-05`

Conclusion:

- Daily has no newer public published brief after 2026-06-29.
- Weekly has a current-week published row, but it was published on 2026-06-29 and is not evidence of daily scheduler continuity after that date.
- Public Daily returned `briefs: []` while `latest` still contained the 2026-06-29 row, which indicates the public list/latest paths are not sufficient as a health signal by themselves.

## Timeline

| Date | Evidence | Status |
| --- | --- | --- |
| 2026-06-29 | Production Daily latest published at `2026-06-29T05:36:33.407+00:00`. | Last confirmed Daily published output. |
| 2026-06-29 | Production Weekly latest published at `2026-06-29T05:37:27.62+00:00`. | Last confirmed Weekly publish timestamp. |
| 2026-06-30 | No newer public Daily published row observed. | Suspected production gap. |
| 2026-07-01 | No newer public Daily published row observed. | Suspected production gap. |
| 2026-07-02 | No newer public Daily published row observed. | Suspected production gap. |
| 2026-07-03 | No newer public Daily published row observed. | Suspected production gap. |
| 2026-07-04 | V15.2 investigation confirms latest Daily still `2026-06-29`. | Incident active. |

## Pipeline Map

### Daily Brief

```text
Vercel Cron / Admin Generate
→ app/api/admin/daily-briefs/generate/route.ts
→ generateScheduledDailyDraft()
→ getLatestNewsIntakeResult()
→ generateDailyIntelligenceDraftFromNews()
→ saveDraftAsync()
→ ixai_daily_intelligence_drafts or server-memory fallback
→ manual admin publish
→ /api/daily-briefs public published readback
```

Key files:

- `vercel.json`
- `app/api/admin/daily-briefs/generate/route.ts`
- `app/api/admin/daily-briefs/draft/route.ts`
- `app/api/admin/daily-briefs/route.ts`
- `app/api/admin/daily-briefs/scheduler/status/route.ts`
- `src/lib/editorial/scheduler.ts`
- `src/lib/editorial/repository.ts`
- `src/lib/editorial/persistence.ts`
- `src/lib/intelligence/generator.ts`
- `src/lib/news/providers.ts`
- `app/api/daily-briefs/route.ts`

### Weekly Brief

```text
Vercel Cron / Admin Generate
→ app/api/cron/generate-weekly-brief/route.ts or app/api/admin/weekly-briefs/generate/route.ts
→ generateWeeklyIntelligenceDraft()
→ getLatestNewsIntakeResult()
→ getDraftsAsync()
→ saveWeeklyDraftAsync()
→ ixai_weekly_intelligence_drafts or local dev memory fallback
→ manual admin publish
→ /api/weekly-briefs/latest public canonical readback
```

Key files:

- `vercel.json`
- `app/api/cron/generate-weekly-brief/route.ts`
- `app/api/admin/weekly-briefs/generate/route.ts`
- `app/api/admin/weekly-briefs/[id]/route.ts`
- `app/api/admin/weekly-briefs/[id]/publish/route.ts`
- `src/lib/editorial/weekly.ts`
- `app/api/weekly-briefs/latest/route.ts`
- `app/api/weekly-briefs/[slug]/route.ts`

### Social Pack

```text
Admin selected Daily / Weekly row
→ SocialIntelligencePackStudio
→ generateDailySocialPack() or generateWeeklySocialPack()
→ preview / export
```

Social Pack generation is currently downstream UI work. It should remain optional and must not block Daily / Weekly text publication.

## Root Cause / Suspected Root Cause

### Root Cause 1 — Scheduler Generates Drafts, Not Public Briefs

Confidence: High.

Daily scheduled generation creates or reuses a draft. Weekly scheduled generation explicitly returns:

```text
Weekly cron creates draft/review material only. It never publishes.
```

Public Daily and Weekly routes only read `status = published` rows. Therefore a scheduler can succeed while public Brief output does not advance unless an operator manually publishes.

This explains why production can appear "stopped" even if generation continued in draft/review state.

### Root Cause 2 — Cron Secret Naming Risk

Confidence: Medium-high.

`vercel.json` schedules:

```json
{
  "path": "/api/admin/daily-briefs/generate",
  "schedule": "30 23 * * *"
}
```

and:

```json
{
  "path": "/api/cron/generate-weekly-brief",
  "schedule": "0 0 * * 0"
}
```

Both routes require a token. The code accepts:

- `authorization: Bearer ...`
- `x-cron-secret`
- `x-ixai-cron-secret` for Daily
- `token` query string

The expected token is:

```ts
process.env.IXAI_CRON_SECRET ?? process.env.CRON_SECRET
```

Vercel Cron sends an `Authorization` header automatically only when the project has an environment variable named `CRON_SECRET`. If production only has `IXAI_CRON_SECRET`, Vercel Cron would make an unauthenticated GET and both cron routes would return 401.

The Vercel docs also note that cron jobs use GET requests and may miss occasional invocations; jobs must be resilient to missed and duplicate delivery.

Reference:

- https://vercel.com/docs/cron-jobs
- https://vercel.com/docs/cron-jobs/manage-cron-jobs

### Root Cause 3 — Daily Persistence Fallback Is Not Durable

Confidence: Medium.

Daily persistence catches Supabase read/write failures and falls back to local/server memory:

```text
Supabase write failed → saveDraft() → serverDrafts memory
```

In production serverless runtime, memory fallback is not durable across cold starts or instances. If Supabase write fails, the route can still appear to generate a draft, but the draft may not remain available for publish or public readback.

Weekly write paths are stricter: configured Supabase write failures throw and return 502. Daily is more permissive and can create silent non-durable success.

### Root Cause 4 — Health Status Is Process-Memory Only

Confidence: Medium.

Daily scheduler status exposes:

```ts
getLastGenerationSummary()
```

This is an in-memory variable. It is not durable across Vercel function instances, deployments, or cold starts.

There is no durable Brief Health diagnostic showing:

- Last Daily generation attempt.
- Last Daily generation success.
- Last Daily publish success.
- Last Weekly generation attempt.
- Last Weekly generation success.
- Last Weekly publish success.
- Last Social Pack success/failure.

This creates an observability gap and allows silent failures.

## Failure Points

| Step | Daily | Weekly | Risk |
| --- | --- | --- | --- |
| Scheduler auth | Token required; Vercel only auto-sends `CRON_SECRET`. | Token required; Vercel only auto-sends `CRON_SECRET`. | Cron may 401 if only `IXAI_CRON_SECRET` exists. |
| Fetch news | Provider loop catches per-source failures and falls back to mock if all fail. | Same news intake. | Provider failure should not block by itself. |
| Generate brief | OpenAI failure falls back to deterministic generator. | Weekly deterministic generator. | Should not block unless internal code throws. |
| Save draft | Supabase failure degrades to memory fallback. | Supabase failure throws when configured. | Daily can silently become non-durable; Weekly can hard fail. |
| Publish | Manual only. | Manual only. | Scheduler success does not mean public production output. |
| Public read | Published rows only. | Published canonical rows only. | Draft/review rows are invisible. |
| Social Pack | Downstream admin preview/export. | Downstream admin preview/export. | Should not block core Brief. |
| Health status | Process memory only. | Last weekly summary process memory only. | Cannot reconstruct production failures reliably. |

## Silent Failure Risks

1. Daily Supabase write failure logs a warning and falls back to memory, which is not durable in production.
2. Scheduler status stores last generation in process memory only.
3. Public APIs show only published content; they do not reveal that newer draft/review rows may exist.
4. Vercel runtime logs were not accessible in this local investigation because `.vercel/project.json` is absent and MCP project/team lookup did not return the project.
5. Weekly generation has structured console logs, but Daily generation has much less structured step logging.
6. Cron success/failure is not persisted in the app database or a durable status table.

## Social Pack Blocking Assessment

Social Pack should not block Daily / Weekly production.

Current source audit found no required server-side Social Pack step in the Daily / Weekly cron routes. Social Pack generation is admin UI downstream work through `SocialIntelligencePackStudio` and local export/preview helpers.

However, previous content pipeline audits recorded Social Pack source alignment risks. V15.2 should preserve this rule:

```text
Brief Core publish first.
Social Pack second.
Social Pack failure never blocks Brief publication.
```

## Recovery Plan

### P0 — Restore Daily / Weekly Production Output

1. Verify production env has `CRON_SECRET`, not only `IXAI_CRON_SECRET`.
2. Trigger manual Daily regenerate with admin auth.
3. Confirm durable Daily row exists in `ixai_daily_intelligence_drafts`.
4. Publish the latest Daily row.
5. Confirm `/api/daily-briefs` latest advances beyond 2026-06-29.
6. Trigger manual Weekly generate if needed.
7. Publish Weekly only after editorial review.
8. Confirm `/api/weekly-briefs/latest` latest published timestamp advances.

### P0 — Make Core Brief Fault-Tolerant

1. Add structured step logs to Daily and Weekly:
   - fetch started/succeeded/failed
   - generate started/succeeded/failed
   - save started/succeeded/failed
   - publish started/succeeded/failed
   - social pack started/succeeded/failed
2. Add route-level try/catch to cron and admin generation routes.
3. Convert Daily write fallback into explicit status:
   - `durable: true`
   - `durable: false`
   - `fallback: server_memory`
   - `publishable: false` when not durable in production
4. Add Limited Brief output when provider data is insufficient.
5. Ensure provider failure does not abort generation.
6. Ensure Social Pack generation is optional and downstream only.

### P1 — Add Durable Brief Health

Add or update Brief Health diagnostics with durable status:

- Last Daily generation attempt.
- Last Daily generation success.
- Last Daily publish success.
- Last Weekly generation attempt.
- Last Weekly generation success.
- Last Weekly publish success.
- Last Social Pack generation/export status.
- Last error step.
- Last error message.
- Current provider mode.
- Current persistence mode.

This can be implemented without changing public product behavior.

### P1 — Manual Recovery Flow

Admin should have a clear recovery path:

1. Generate Daily.
2. Confirm durable save.
3. Mark review if needed.
4. Publish Daily.
5. Verify public latest.
6. Generate Social Pack only after Brief publish.

Weekly:

1. Generate Weekly draft.
2. Confirm durable save.
3. Review/edit.
4. Publish canonical Weekly.
5. Verify public latest.
6. Generate Social Pack from canonical published Weekly unless explicitly previewing a draft.

## Required Code Fixes

No code was changed in this investigation, but a V15.2 hotfix is recommended.

Recommended code scope:

- `app/api/admin/daily-briefs/generate/route.ts`
- `app/api/admin/daily-briefs/draft/route.ts`
- `app/api/admin/daily-briefs/route.ts`
- `app/api/admin/daily-briefs/scheduler/status/route.ts`
- `app/api/cron/generate-weekly-brief/route.ts`
- `app/api/admin/weekly-briefs/generate/route.ts`
- `src/lib/editorial/scheduler.ts`
- `src/lib/editorial/repository.ts`
- `src/lib/editorial/persistence.ts`
- `src/lib/editorial/weekly.ts`
- New or existing Brief Health diagnostics module.

Fix requirements:

1. Do not add external providers.
2. Do not add AI behavior.
3. Do not change trading or recommendation behavior.
4. Do not change V16 implementation.
5. Do not require DB schema change unless durable health cannot be implemented through existing persistence/status rows.
6. Separate generation success from publish success.
7. Make non-durable Daily fallback visible and non-silent.
8. Make cron authentication compatible with Vercel's `CRON_SECRET` behavior.

## Validation Checklist

### Source / Unit-Level

- `git diff --check`
- `npm run lint`
- `npm run build`
- Daily generator with all providers failing still returns Limited Brief.
- OpenAI failure still falls back to deterministic generator.
- Daily Supabase write failure returns explicit non-durable status.
- Weekly Supabase write failure returns structured failure.
- Social Pack failure cannot block Daily / Weekly generation or publish.

### Production Manual

- Verify `CRON_SECRET` exists in Vercel production environment.
- Use Vercel Cron logs filtered by:
  - `requestPath:/api/admin/daily-briefs/generate`
  - `requestPath:/api/cron/generate-weekly-brief`
- Confirm Daily cron returns 200 or structured non-durable status, not 401/500.
- Confirm Weekly cron returns 200 or structured blocked status, not 401/500.
- Generate Daily manually.
- Publish Daily manually.
- Confirm `/api/daily-briefs` latest advances beyond `daily-intelligence-2026-06-29`.
- Generate Weekly manually.
- Publish Weekly manually if editorially ready.
- Confirm `/api/weekly-briefs/latest` published timestamp advances.
- Generate Social Pack after Brief publish and confirm failure does not affect public Brief.

## Investigation Limitations

- Vercel runtime logs were requested as part of the investigation, but local repo has no `.vercel/project.json`, local `vercel` CLI was unavailable, and MCP project lookup did not return the target project under the attempted team slug.
- Direct Supabase SQL was not executed because the task requested investigation and no DB/schema changes.
- Root cause therefore combines production public API evidence with source-level failure analysis. The highest-confidence next confirmation is Vercel runtime log review for 401/500 on the two cron paths and Supabase row inspection for draft/review rows after 2026-06-29.

## Current Verdict

Root cause category:

```text
Brief production pipeline reliability / publish gating / scheduler observability
```

Most likely combined cause:

1. Scheduler generation does not equal public publish.
2. Cron auth may fail if production uses `IXAI_CRON_SECRET` without `CRON_SECRET`.
3. Daily save fallback can appear successful while being non-durable.
4. Health diagnostics do not persist enough information to detect or recover from the failure automatically.

Recommended next action:

```text
V15.2.1 Brief Pipeline Reliability Hotfix
```

Scope:

- Align cron auth with Vercel `CRON_SECRET`.
- Add structured generation/publish logging.
- Add durable or explicit Brief Health status.
- Make Daily non-durable fallback visible.
- Add Limited Brief path.
- Keep Social Pack optional and downstream.

## V15.2.1 Hotfix Status

V15.2.1 implements the first recovery layer:

- Admin Daily / Weekly APIs now return publish health derived from existing persisted rows.
- Admin UI shows latest published, latest draft/review, days since publish, stale published state, and draft/publish gap.
- Daily manual publish is durable-aware. If Supabase write fails while configured, the route returns a structured persistence failure instead of treating memory fallback as a successful public publish.
- Daily draft generation returns persistence metadata so non-durable fallback is visible.
- Weekly continues to require manual publish; the admin health explicitly documents that cron creates draft/review material only.
- Social Pack remains downstream optional and does not block core Brief publication.

Remaining reliability work:

- Verify Vercel Production `CRON_SECRET`.
- Review Vercel cron logs for both Brief cron routes.
- Consider a future durable run-log table only after approval for schema changes.

Source of truth: `docs/V1521_BRIEF_PUBLISH_RELIABILITY_HOTFIX.md`.
