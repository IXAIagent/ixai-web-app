# IXAI Daily Intelligence Persistence

Date: 2026-05-21

v1.18.1 moves Daily Intelligence toward durable production persistence before
PWA work begins.

## Architecture

Daily Intelligence now uses this read/write order:

```txt
Supabase Daily Intelligence table
↓
server memory fallback
↓
static editorial fallback
```

Runtime pieces:

- `src/lib/editorial/persistence.ts`
- `src/lib/editorial/repository.ts`
- `app/api/daily-briefs/route.ts`
- `app/api/admin/daily-briefs/route.ts`
- `app/api/admin/daily-briefs/draft/route.ts`

## Supabase Table

Migration:

```txt
supabase/migrations/002_daily_intelligence_persistence.sql
```

Table:

```txt
public.ixai_daily_intelligence_drafts
```

Key fields:

- `source_id`
- `slug`
- `status`
- `title`
- `market_summary`
- `editorial_note`
- `sections`
- `risk_focus`
- `intelligence`
- `source_mode`
- `provider_mode`
- `input_news_count`
- `generated_at`
- `published_at`
- `created_at`
- `updated_at`

## Environment Variables

Required for public reads:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Required for server-side admin writes:

```bash
SUPABASE_SERVICE_ROLE_KEY=
```

The service role key must only exist as a server-side environment variable.
Never expose it to client code, screenshots, logs, or public docs.

## Public Read Path

Public surfaces read from `app/api/daily-briefs/route.ts`:

- homepage Daily Brief
- homepage Risk Focus
- homepage Intelligence Feed
- mobile top insight
- `/daily-brief`
- `/daily-brief/[slug]`

Only published briefs are returned to public routes.

## Admin Workflow

The existing workflow remains:

```txt
Generate Draft
→ Review
→ Publish
→ Public updates
```

Admin routes use the existing admin session gate. Draft generation saves through
the repository, which attempts Supabase first and falls back safely if the table
or env vars are unavailable.

## Scheduler

Scheduled draft generation uses durable duplicate checks when Supabase is
available:

- existing draft for today → return existing
- no draft → generate and save
- `force=1` → create a forced draft slug

No auto-publish is performed.

## Fallback Behavior

Fallback is intentionally conservative:

- missing Supabase env → local/server fallback
- missing service role key → read-ready/write fallback
- table/RLS error → safe fallback
- no published intelligence → static editorial fallback

Public UI does not expose technical fallback wording.

## PWA Guidance

PWA implementation has not started.

Before offline Daily Brief caching:

- confirm Supabase migration is applied in production
- confirm public read policy returns only published rows
- confirm admin writes persist after deploy/restart
- exclude `/admin` and `/api/admin/*` from service worker caching
- cache only published public responses
