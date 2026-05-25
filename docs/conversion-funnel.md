# Conversion Funnel — v1.36.3

The IXAI conversion funnel turns raw analytics events into a six-stage
reader journey: **Landing → Article Open → Read Depth 50% → CTA Click →
Subscribe → Return Visit**.

It lives entirely server-side. The admin UI fetches a single aggregated
snapshot via `/api/admin/analytics/funnel` and renders it with the
existing institutional admin tokens.

## Stage definitions

| Stage key | Events | Notes |
| --- | --- | --- |
| `landing` | `page_view` | unique distinct_ids hitting any IXAI public route in the window |
| `article_open` | `weekly_open`, `daily_open`, `market_open`, `fcn_open` | unique distinct_ids who opened any editorial surface |
| `read_depth_50` | `article_read_depth` (HogQL predicate `toFloat(properties['percent']) >= 50`) | scrolled at least halfway |
| `cta_click` | `cta_click`, `distribution_cta_click` | clicked any distribution / subscribe CTA |
| `subscribe` | `email_capture_success` | reconciled against the durable subscriber count from `ixai_distribution_subscribers` (the table is the floor — PostHog never undercounts the truth source) |
| `return_visit` | `page_view` aggregated by `count(DISTINCT toDate(timestamp)) >= 2` | distinct_ids active on at least two separate days in the 7-day window |

Each stage carries:

- `count` — raw distinct_id count.
- `conversionFromLanding` — `count / landing.count * 100`.
- `conversionFromPrevious` — step rate against the previous stage.
- `dropoffFromPrevious` — `1 − conversionFromPrevious`.

## API

`GET /api/admin/analytics/funnel`

- Admin-only (`isAdminRequestAuthorized`).
- Always returns 200 with a snapshot. When PostHog env is missing it
  returns the empty-state shape with `mode: "disabled"` and a note.
- Issues three HogQL queries:
  1. A `UNION ALL` over the six stages to get distinct_id counts.
  2. A `count(DISTINCT distinct_id) HAVING days >= 2` to get returning
     readers.
  3. A surface ranking to populate `topCapturePaths`.
- Reconciles `subscribe` count with the durable Supabase capture table
  so the floor is correct even when PostHog has a delay or partial
  retention window.

## Return-visit detection

`returning reader` = a distinct_id with `page_view` on at least two
separate calendar days within the past seven days. The HogQL is:

```
SELECT count(DISTINCT distinct_id)
FROM (
  SELECT distinct_id, count(DISTINCT toDate(timestamp)) AS days
  FROM events
  WHERE event = 'page_view'
    AND timestamp >= now() - INTERVAL 7 DAY
  GROUP BY distinct_id
  HAVING days >= 2
)
```

No cookie popup, no fingerprinting. The detection uses the PostHog
distinct_id that lives in `localStorage` already (set by the v1.35
analytics provider) — it's identical to the identity already
established for analytics, and is dropped when the visitor clears site
data.

## CTA attribution

`email_capture_success` events carry the `surface` property (e.g.
`weekly-slug-top`, `daily-article-bottom`). The funnel API groups by
`properties['surface']` to surface the top five capture sources. The
durable subscriber table ALSO carries `source_surface` + `source_path`
+ `utm_source/medium/campaign` per row (v1.34 schema) so the
attribution is independently verifiable from Supabase if PostHog drops.

A future v1.36.x extension can join the two: PostHog gives us the
session funnel context, Supabase gives us the source-of-truth row that
proves "this subscriber converted from the weekly slug CTA".

## Admin UI

`components/admin/conversion-funnel.tsx`:

- Mobile (`< sm`): vertical stack, ArrowDown separators, stage cards
  full-width.
- Desktop: horizontal cards (`flex-wrap`) with ArrowRight separators
  on `lg`.
- Each stage card shows count + `% of landing` + `% step rate` + `%
  dropoff` chips.
- Below the funnel: top capture surfaces (from PostHog) and totals
  (durable subscribers + returning readers).

Loading / error states are explicit (`Loading`, error banner with
muted red), so a PostHog outage degrades to "snapshot temporarily
unavailable" instead of a blank section.

## Disabled-mode rendering

When `POSTHOG_PROJECT_ID` / `POSTHOG_PERSONAL_API_KEY` are unset, the
API returns `mode: "disabled"` with stage counts of 0. The funnel UI
still renders all six stages so the contract is visible — operators
see exactly which numbers will populate once PostHog server keys
land.
