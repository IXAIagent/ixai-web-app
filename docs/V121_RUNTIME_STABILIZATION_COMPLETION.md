# V12.1 Runtime Stabilization Completion

## Scope

This completion branch finishes the remaining V12.1 runtime stabilization work after Program A, Program B, and Program E.

V12.1 is complete only after this PR is merged.

Completed before this branch:

- Program A — Root Provider Stabilization.
- Program B — Workspace Runtime Hydration Safety.
- Program E — Service Worker Fetch Safety.

Completed in this branch:

- Production Gray Screen Regression fix.
- Program C — Market / Morning Brief Runtime Stabilization.
- Program D — Admin / Scheduler Runtime Stabilization.

## Production Gray Screen Regression Root Cause

Production testing still showed gray-screen risk on `/my-ixai/copilot` and `/my-ixai/settings`, with Chrome reporting render process loss and Supabase REST 404s for optional tables:

- `ixai_profile_memory`
- `ixai_user_preferences`

Those tables are optional runtime persistence surfaces. A missing optional table must not be treated as a fatal app condition.

## Optional Supabase Missing Table Fallback

This branch adds optional-table safety helpers under `src/lib/workspace/runtime-safety/`:

- `isSupabaseMissingTableError(...)`
- `isOptionalSupabase404(...)`
- `shouldDisableOptionalTable(...)`
- `markOptionalTableUnavailable(...)`
- `isOptionalTableDisabled(...)`
- `safeOptionalSupabaseRead(...)`
- `safeOptionalSupabaseWrite(...)`
- `logWorkspaceRuntimeWarning(...)`

Behavior:

- Missing optional table / `404` / `PGRST205` / relation-not-found conditions degrade to local defaults.
- Optional table failures are one-shot disabled with a cooldown to avoid request spam.
- Runtime logs are controlled warnings, not uncaught errors.
- Local memory and preference fallback remains intact.

## Program C Completion

Market / Morning Brief runtime paths now fail safely:

- Live market quote API JSON/network failures return unavailable snapshots.
- Live valuation falls back to empty/unavailable quote state when Portfolio Truth or quote providers fail.
- Morning Brief v1 uses settled source reads so one failed source does not crash the brief.
- Clipboard failure in the Morning Brief card is contained.
- News remains placeholder-only.

No Yahoo/Binance behavior was expanded, no external news provider was added, and no OpenAI / LLM / investment recommendation logic was introduced.

## Program D Completion

Admin / Scheduler runtime paths now degrade safely:

- Admin identity, audience, LINE Login, and LINE identity snapshots use source-level fallback payloads.
- Scheduler and delivery readiness remain foundation-only.
- No automatic publishing, notification delivery, Telegram scheduler, auth behavior, RLS, schema, or membership behavior changed.

## Route-Level Fallback Boundary Decision

Route-level error boundaries were intentionally not shipped in this completion branch.

Production-like `next start` smoke testing showed segment-level Workspace/Admin error boundaries can trigger a Next 16.2.6 invariant:

- `Invariant: The client reference manifest for route ... does not exist. This is a bug in Next.js.`

The shipped V12.1 completion therefore relies on source-level fail-safe reads, optional Supabase table fallback, component refresh guards, and Admin diagnostic fallback payloads instead of adding segment-level error boundaries that would create route 500s.

## Browser QA Standard

Required production-like QA:

- Clean `.next`.
- `npm run build`.
- `PORT=3001 npm run start`.
- Reload Workspace routes:
  - `/my-ixai/home` 5 times.
  - `/my-ixai/copilot` 10 times.
  - `/my-ixai/settings` 10 times.
  - `/my-ixai/intelligence` 5 times.
  - `/my-ixai/risk` 5 times.
  - `/my-ixai/fcn` 5 times.
  - `/my-ixai/portfolio` 5 times.
  - `/my-ixai/watchlist` 5 times.
  - `/my-ixai/notifications` 5 times.
  - `/my-ixai/timeline` 5 times.
- Route switch stress at least 50 transitions across the same Workspace routes.

Console must not show:

- Uncaught error.
- Unhandled promise rejection.
- React fatal error.
- Hydration mismatch crash.
- Render process gone.
- Failed fetch storm.
- Repeated optional Supabase 404 spam.

Acceptable:

- Controlled warning for optional table unavailable.
- Controlled warning for provider unavailable / fallback used.

## Service Worker Production Verification

Program E remains the service worker safety layer. If production still shows an old `sw.js` line number:

- Open Chrome DevTools -> Application -> Service Workers.
- Unregister the active IXAI worker.
- Clear site data for `https://app.ixuan.ai`.
- Hard reload.
- Repeat Workspace route-switch stress.

This branch does not add aggressive precache, offline-first behavior, or route precaching.

## Out Of Scope

This completion work does not add:

- Investment features.
- Buy / sell / rebalance advice.
- Broker integration.
- Trading or order execution.
- AI recommendation / OpenAI / LLM calls.
- Telegram scheduler.
- Notification delivery activation.
- Auth behavior changes.
- RLS, schema, or migrations.
- Billing.

IXAI remains an intelligence, workflow, and risk-awareness platform. It is not a broker, trading bot, signal-selling product, or robo-advisor.

## Remaining Future Work

Future work should focus on monitored production validation after deploy:

- Confirm optional Supabase table warnings do not spam.
- Confirm production browsers are running the newest service worker.
- Confirm no gray-screen regression after extended Workspace sessions.
