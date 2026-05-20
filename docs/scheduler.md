# IXAI Daily Auto Draft Scheduler

IXAI v1.8.3 adds scheduled Daily Intelligence draft creation.

This scheduler only creates drafts in `review` status. It does not auto-publish,
does not bypass editorial review, and does not send investment recommendations.

## Environment Variables

Required for the scheduler endpoint:

- `IXAI_CRON_SECRET`

Set a long random value in Vercel Project Settings.

For Vercel Cron Jobs, also set:

- `CRON_SECRET`

Vercel Cron invokes cron paths with a `Bearer` token from `CRON_SECRET` in the
`Authorization` header. Keep `CRON_SECRET` and `IXAI_CRON_SECRET` set to the
same value so the route can verify the request while the app continues using
the IXAI-specific env name internally.

Never commit the secret to the repo.

## Schedule

`vercel.json` registers:

```json
{
  "path": "/api/admin/daily-briefs/generate",
  "schedule": "30 23 * * *"
}
```

Vercel cron expressions use UTC. Taiwan time is UTC+8, so:

- `23:30 UTC` = `07:30 Asia/Taipei` on the next calendar day

## Endpoint

Primary scheduled/manual endpoint:

```txt
POST /api/admin/daily-briefs/generate
```

Accepted auth methods:

- `Authorization: Bearer <IXAI_CRON_SECRET>`
- `x-ixai-cron-secret: <IXAI_CRON_SECRET>`
- `?token=<IXAI_CRON_SECRET>` for local/manual testing

Vercel Cron currently invokes routes with `GET`, so the route also accepts a
GET request only for Vercel Cron compatibility. The generation behavior and
token checks are identical.

## Duplicate Prevention

If a draft already exists for the current UTC date, the endpoint returns the
existing draft summary and does not create a duplicate.

To intentionally create a new review draft:

```txt
POST /api/admin/daily-briefs/generate?force=1
```

`force=1` still requires a valid token and still creates a review draft only.

## MVP Persistence Note

Until Supabase persistence is wired into the editorial repository, scheduled
server drafts use the server-side repository fallback. This is sufficient for
local and warm serverless MVP verification, but production retention should move
to Supabase before relying on cron as the source of record.

## Editorial Rule

The publish workflow remains:

```txt
Generate Draft -> Admin Review -> Publish -> App Updates
```

No auto-publish behavior should be added without a separate product decision.
