# V12.1 Production Authenticated Read Storm Fix

## Scope

PR #79 merged the V12.1 Runtime Stabilization completion branch, but production verification on `app.ixuan.ai` still showed authenticated runtime instability.

Observed production symptoms:

- `/my-ixai/portfolio`, `/my-ixai/watchlist`, `/my-ixai/notifications`, and `/my-ixai/timeline` rendered, but Console / Network showed repeated `401` / `404` reads.
- `/my-ixai/copilot`, `/my-ixai/settings`, and `/my-ixai/intelligence` could still gray-screen after route switching.
- Chrome DevTools reported `Debugging connection was closed` and `Reason: Render process gone`.
- Optional Supabase table `404` conditions became warnings, but could still repeat across route sessions.
- Private tables such as `stock_positions`, `crypto_positions`, and `watchlist_items` could be read before a stable authenticated session was available, producing repeated `401 Unauthorized` results.

V12.1 must not be marked production-complete until authenticated production verification and the later Settings / Copilot runtime hang verification both pass. The read-storm fix reduced one failure mode but did not complete runtime stabilization.

## Root Cause

Production authenticated Supabase reads were still firing before, without, or after loss of stable auth state.

The highest-risk path was the client-side database readiness/readback layer:

- `src/lib/persistence/database-activation-utils.ts`
- Portfolio persistence/readiness adapters.
- Watchlist persistence/readiness adapters.
- Settings diagnostics fan-out.

That layer used the public anon key as a bearer token for private table REST probes. Under RLS or unstable authenticated state, those reads could return `401` repeatedly during Workspace route transitions.

Optional tables also needed browser-session-level disable behavior:

- `ixai_profile_memory`
- `ixai_user_preferences`

Module-level cooldown alone was not enough to prevent repeated requests across route/module reloads.

## Private Table 401 Fallback Strategy

Added:

- `src/lib/workspace/runtime-safety/authenticated-supabase.ts`

Behavior:

- Private Supabase reads require a confirmed browser Supabase session and access token.
- Missing auth skips the table read and returns fallback/unavailable readback.
- `401 Unauthorized` marks the table temporarily disabled for the same browser session/auth state.
- Repeated route switches reuse that disabled state instead of retrying the same failing table.
- Missing table / schema-cache conditions return fallback without throwing.
- Network failures return fallback without throwing.
- No automatic sign-out.
- No auth redirect change.
- No RLS, schema, migration, membership, billing, broker, trading, recommendation, scheduler, OpenAI, or AI behavior change.

`readDatabaseTable(...)` now routes through this authenticated read gate so Portfolio, Watchlist, Alert, FCN, Workspace, and Settings diagnostics probes inherit the same protection.

## Optional 404 Spam Fix

Optional Supabase table disable state now persists in `sessionStorage` as well as module memory.

Behavior:

- First missing optional table `404` / `PGRST205` / schema-cache error marks the optional table unavailable for the browser session cooldown.
- Further reads/writes/upserts for that table skip immediately.
- UI falls back to local profile memory and local preferences.
- Warnings are controlled and low-frequency.
- Missing optional tables no longer repeatedly execute `on_conflict=user_id` upserts.

## Renderer Crash Prevention

Route-switch pressure was reduced by:

- Short in-flight / TTL coalescing for `loadPortfolioTruthReadback()`.
- Mounted guards in Portfolio dashboard and readback async state updates.
- Private-table session cooldowns that prevent repeated diagnostics fan-out from hitting the same unauthorized table.
- Repository read fallbacks for browser-side Portfolio repository reads.

This is runtime containment only. It does not introduce new product capabilities.

## QA Plan

Local validation:

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

Production-like browser QA:

- Clean `.next`.
- `npm run build`.
- `PORT=3001 npm run start`.
- Reload:
  - `/my-ixai/home` 5 times.
  - `/my-ixai/portfolio` 5 times.
  - `/my-ixai/watchlist` 5 times.
  - `/my-ixai/notifications` 5 times.
  - `/my-ixai/timeline` 5 times.
  - `/my-ixai/copilot` 10 times.
  - `/my-ixai/settings` 10 times.
  - `/my-ixai/intelligence` 10 times.
- Route switch at least 100 transitions:
  - home -> portfolio -> watchlist -> notifications -> timeline -> copilot -> settings -> intelligence -> risk -> fcn -> home.

Must not show:

- Render process gone.
- Gray screen / blank screen.
- Unhandled promise rejection.
- Uncaught error.
- Repeated `401` storm.
- Repeated optional `404` spam.
- Failed fetch storm.

Allowed:

- A controlled low-frequency warning for optional table unavailable.
- A controlled low-frequency warning for private table unauthorized fallback.

## Production Verification Checklist

After deployment to `app.ixuan.ai`:

- Verify authenticated session is active.
- Clear old service worker / site data if old `sw.js` behavior is still observed.
- Run the Workspace reload and route-switch QA above.
- Confirm Network no longer shows repeated `stock_positions`, `crypto_positions`, or `watchlist_items` `401` storms.
- Confirm optional `ixai_profile_memory` and `ixai_user_preferences` missing-table warnings are not spammed.
- Confirm `/my-ixai/copilot`, `/my-ixai/settings`, and `/my-ixai/intelligence` do not gray-screen after route switching.

Status wording:

- This authenticated read-storm fix is only one V12 runtime stabilization slice.
- V12.1 / V12.2 remains production-incomplete until `app.ixuan.ai` Settings / Copilot manual verification passes after the targeted runtime hang fix.
