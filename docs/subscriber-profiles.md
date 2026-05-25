# Subscriber Profile Layer — v1.36.2

The subscriber profile layer sits one level above
`ixai_distribution_subscribers` (raw email capture) and exposes a
per-subscriber engagement graph IXAI Pro / future personalization can
read from.

## Schema

Table: `public.ixai_subscriber_profiles` (migration `006_subscriber_profiles.sql`)

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | primary key |
| `email`, `normalized_email` | `text` | both unique |
| `subscriber_status` | `text` | `active` / `unsubscribed` / `bounced` / `complained` |
| `first_seen_at`, `last_seen_at` | `timestamptz` | seen-at telemetry |
| `total_reads` | `integer` | sum of `weekly_reads + daily_reads + market_reads + fcn_reads` (tracked separately because aggregate writes happen out of band) |
| `weekly_reads` / `daily_reads` / `market_reads` / `fcn_reads` | `integer` | per-surface counters |
| `total_shares` | `integer` | sum of `share_to_*` events |
| `avg_read_depth` | `numeric` | running average of `article_read_depth` |
| `favorite_surface` | `text` | computed from the highest per-surface counter |
| `engagement_score` | `numeric` | see formula below |
| `pro_candidate_score` | `numeric` | amplifies engagement for FCN / market readers |
| `utm_source`, `utm_medium`, `utm_campaign` | `text` | first-touch attribution carried over from `/api/distribution/subscribe` |
| `tags` | `jsonb` | canonical-only: `line_connected`, `high_engagement`, `pro_candidate`, `crypto_reader`, `fcn_reader`, `macro_reader` |
| `metadata` | `jsonb` | freeform key-value (capture surface, landing path, etc.) |
| `created_at`, `updated_at` | `timestamptz` | row lifecycle |

Indexes: `normalized_email` (unique), `engagement_score desc`,
`last_seen_at desc`, `subscriber_status`, `favorite_surface`.

RLS: **enabled with no policies**. The table is service-role-only.
Aggregated reads are exposed exclusively through admin API endpoints
under `/api/admin/audience`.

## Engagement score

```
+2  weekly_open
+1  daily_open
+1  market_open
+2  fcn_open
+6  share_to_*
+10 subscribe (email present on row)
+4  article_read_depth_100 (scaled by avg_read_depth / 100)
+5  return_visit (>=3 reads within ~14 days of last_seen_at)
```

`pro_candidate_score = engagement * 0.6 + fcn_reads * 1.5 + market_reads * 1.0`.

Tags are recomputed every time the profile updates:

- `high_engagement` — `engagement_score >= 20`
- `pro_candidate` — `pro_candidate_score >= 20`
- `fcn_reader` / `macro_reader` — derived from favorite surface
- `crypto_reader` — reserved for a future surface; harmless when no
  crypto reads exist
- `line_connected` — managed exclusively by the v1.36.4 LINE link API;
  never auto-set / auto-cleared by this module

## Why aggregated-only admin

The admin snapshot (`AudienceSnapshot`) and the audience snapshot API
(`/api/admin/audience/snapshot`) return:

- total profiles
- active profiles
- high engagement count
- pro candidate count
- returning reader count
- LINE connected count
- avg read depth
- favorite-surface distribution
- top audience segment counts
- recently active (7d) count

Emails and per-user rows never leave the database. This keeps the
admin console PII-light by default and lets future personalization
deliberately opt into row-level reads only when wired through a
service-role server endpoint with explicit access logging.

## Sync surface

`src/lib/subscribers/profile-sync.ts` exposes:

```
syncProfileFromEvent(event, { email, surface, utm_*, depthPercent })
syncProfileFromIdentity({ email, utm_* })
```

Both are fire-and-forget. Profile writes happen in the background and
never block UI / analytics fire-and-forget paths.

Hooked sites today:

- `POST /api/distribution/subscribe` → calls `syncProfileFromIdentity`
  after a successful subscribe.
- v1.36.4 `POST /api/line/link` → calls `setProfileTag` for
  `line_connected` and updates last-seen.

Event-driven reads (e.g. `weekly_open` → `incrementProfileRead`) will
land behind the v1.36.3 funnel hooks; the sync surface already accepts
them so the wiring is additive.

## Future personalization path

Once the profile graph is populated, future surfaces can:

- **Push segmentation** — segment by tag (`fcn_reader`, `macro_reader`)
  and route LINE OA / push intelligence accordingly.
- **AI portfolio intelligence** — pull `pro_candidate_score` for the
  Pro waiting list and route the cohort into the Pro early-access flow.
- **Editorial routing** — surface "high engagement readers' favourite
  surface" on the editorial dashboard so the next IXAI Daily / Weekly
  is informed by what readers actually return for.
- **CRM bridge** — once a CRM is wired, the profile graph is the
  canonical source of truth for engagement aggregates; the CRM stores
  identity + commerce, IXAI stores engagement.

All of these are deliberately *not* implemented in v1.36.2. The job
of this layer is to expose a stable, durable graph so the next layer
lands without rewriting capture.
