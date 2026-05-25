# IXAI PostHog Analytics Setup

v1.35 adds a real analytics provider foundation for IXAI Public App. The
implementation is intentionally minimal: no autocapture, no session replay, no
heatmaps, no feature flags, and no ad pixels.

## Environment Variables

Client-side event capture:

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Admin aggregation snapshot:

```bash
POSTHOG_PROJECT_ID=12345
POSTHOG_PERSONAL_API_KEY=phx_xxx
```

`NEXT_PUBLIC_POSTHOG_KEY` is public by design. Do not expose
`POSTHOG_PERSONAL_API_KEY` to the client.

## Event Flow

1. Public UI calls `trackEvent(...)` or `safeTrack(...)`.
2. `src/lib/analytics/provider.ts` validates the event name, sanitizes payloads,
   and isolates provider failures.
3. `src/lib/analytics/posthog-provider.ts` sends events to PostHog only when:
   - `NEXT_PUBLIC_POSTHOG_KEY` exists
   - the code is running in the browser
   - `NODE_ENV=production`
4. Development and missing-env modes use a disabled provider, so local work does
   not pollute production analytics.

## Page Views

`components/analytics/page-view-tracker.tsx` runs on route changes and captures:

- `page_view`
- `daily_open`
- `weekly_open`
- `market_open`
- `fcn_open`
- `article_read_depth` at 25 / 50 / 75 / 100 percent on Daily and Weekly slug pages

Read-depth tracking uses a lightweight passive scroll listener and does not block
rendering.

## Distribution Events

The distribution surfaces emit these events through the same provider registry:

- `distribution_cta_click`
- `email_capture_submit`
- `email_capture_success`
- `share_to_x`
- `share_to_line`
- `share_to_linkedin`

Payloads are sanitized before provider delivery. Email, token, cookie, password,
and secret-like fields are removed.

## Admin Snapshot

`/api/admin/analytics/snapshot` queries PostHog with HogQL and returns aggregated
metrics only:

- Weekly opens
- Daily opens
- Market opens
- Share clicks
- CTA clicks
- Top surfaces
- Top referrers
- Top UTM sources
- Last 7 days trends

The admin endpoint does not expose raw events, emails, user identifiers, or
session data.

If PostHog server env variables are missing, the snapshot returns a disabled
empty state instead of failing the admin UI.

## How To Verify

Production verification:

1. Deploy with `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`.
2. Open `https://app.ixuan.ai/`.
3. In PostHog, confirm `page_view`.
4. Open Daily or Weekly slug pages and scroll to confirm `article_read_depth`.
5. Click share buttons to confirm `share_to_x`, `share_to_line`, or
   `share_to_linkedin`.
6. Configure `POSTHOG_PROJECT_ID` and `POSTHOG_PERSONAL_API_KEY`.
7. Open `/admin/daily-briefs` and confirm the Intelligence Analytics Snapshot
   shows PostHog mode.

Local verification:

- With no PostHog env, the app should run normally.
- Admin snapshot should show disabled mode.
- No analytics events should be sent in development.

## Why Manual Capture Only

IXAI is a financial intelligence product. Manual event capture keeps telemetry
focused on product behavior and avoids collecting unnecessary behavioral data.
Autocapture, session recording, heatmaps, surveys, ads pixels, and experiments
remain intentionally disabled.
