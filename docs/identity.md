# IXAI Identity & Personal Intelligence Layer

v1.9 introduces a lightweight identity foundation for IXAI.

This is not enterprise auth and does not replace the existing admin password
gate. Public content remains readable in guest mode.

## Auth Strategy

The app uses Supabase Auth entry points without adding a client SDK dependency.

Supported flows:

- Google OAuth
- Email magic link
- Guest mode

Required public env vars:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

If these env vars are missing, the app remains build-safe and runs in guest /
local-first mode.

## Guest Mode

Guest users can:

- read the dashboard
- read Daily Brief and Weekly Brief
- create a local watchlist
- complete local onboarding interests

Guest data stays in browser localStorage.

## Personal Memory

The current MVP memory stores:

- watched symbols
- recently viewed sections
- preferred categories
- last visit timestamp

This is intentionally simple relational/profile memory. No vector database or
AI memory system is included in v1.9.

## Watchlist Sync

The UI now separates:

- local guest watchlist
- IXAI account-ready watchlist
- future Supabase-backed persistence

The sync adapter expects a future Supabase table such as `ixai_watchlists`.
Until the table and RLS policies are created, logged-in users still retain local
watchlist behavior and see sync readiness messaging.

## Free / Personal / Pro Progression

The product layers are:

- Free: content, basic watchlist, onboarding, daily intelligence
- Personal: account identity, preferences, watchlist sync, memory
- Pro: FCN monitoring, AI risk alerts, portfolio intelligence, advanced watchlists

Payments and subscription enforcement are intentionally deferred.
