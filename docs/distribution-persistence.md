# IXAI Distribution Persistence

v1.34.2 upgrades IXAI email capture from memory-only mock storage to a durable Supabase-backed subscriber table.

## Migration

Apply:

```sql
supabase/migrations/005_distribution_subscribers.sql
```

Creates:

- `public.ixai_distribution_subscribers`

The table stores normalized email, status, source surface, source path, UTM attribution, referrer, user agent, timestamps, and metadata.

RLS is enabled. There is no anon select policy and no anon insert policy.

## Required Environment

Server-side writes require:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The service role key must be configured only in server/Vercel environment variables. Never expose it to client code.

If either variable is missing, local development uses memory fallback.

## Why No Anon Insert Policy

IXAI does not allow direct browser inserts into the subscriber table because:

- it would expose the table to spam traffic
- it would make abuse/rate-limit controls harder
- it would make future consent and source validation weaker

All writes go through:

- `POST /api/distribution/subscribe`

The route validates the email, captures headers and attribution, and writes with the server-side service role.

## Subscribe API

Request:

```json
{
  "email": "reader@example.com",
  "surface": "daily",
  "path": "/daily-brief/2026-05-19",
  "attribution": {
    "utm_source": "line",
    "utm_campaign": "daily-share"
  }
}
```

Success:

```json
{
  "ok": true,
  "subscriber": {
    "email": "reader@example.com",
    "status": "active"
  },
  "persistence": "supabase"
}
```

Fallback local development success:

```json
{
  "ok": true,
  "subscriber": {
    "email": "reader@example.com",
    "status": "active"
  },
  "persistence": "memory"
}
```

If Supabase is configured but the table is missing or write fails, the API returns `502` with a safe generic message.

## Admin Stats

Admin-only aggregated stats:

- `GET /api/admin/distribution/subscribers`

The response contains:

- active subscriber count
- total captured
- last 7 days captures
- top surfaces
- top UTM sources
- persistence mode

The route does not expose raw email rows.

## Testing

No Supabase env:

1. Submit EmailCapture.
2. API returns `persistence: "memory"`.
3. Admin snapshot shows memory mode.

Supabase env configured, migration missing:

1. Submit EmailCapture.
2. API returns `502`.
3. UI displays: `Unable to subscribe right now. Please try again later.`

Migration applied:

1. Submit EmailCapture.
2. Row appears in `ixai_distribution_subscribers`.
3. Re-submit same email.
4. No duplicate row is created.
5. `status` returns to `active`.
6. `last_subscribed_at` and `updated_at` are refreshed.
7. Admin snapshot reflects updated subscriber counts.

## Deferred

Not included in v1.34.2:

- Mailchimp / Resend / Postmark
- email sending
- LINE API
- CRM SaaS sync
- payment / entitlement
