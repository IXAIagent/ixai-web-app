# V12.1 Runtime Stabilization Program

## Scope

V12.1 is a runtime stability program for production Workspace pages that were still vulnerable to cross-page crashes, Chrome Error code 5, and large `Uncaught (in promise)` storms.

Program A completed Root Provider Stabilization. Program B covers Workspace Runtime Hydration Safety. Program E covers Service Worker Fetch Safety. This completion branch covers Program C, Program D, and the production gray-screen regression. The full V12.1 Runtime Stabilization Program is complete only after the completion PR is merged.

## Runtime Stabilization Program Status

Completed:

- Program A — Root Provider Stabilization.
  - Root auth runtime promises stabilized.
  - PR #75 merged.
  - Commit: `9c73915`.
- Program B — Workspace Runtime Hydration Safety.
  - Workspace client refresh effects now use contained async boundaries.
  - Settings diagnostics refresh paths degrade to fallback UI instead of throwing into the global promise queue.
  - Workspace localStorage/JSON parse diagnostics reads use safe fallback helpers.
- Program E — Service Worker Fetch Safety.
  - `public/sw.js` fetch events are contained behind safe fallbacks.
  - Navigation, static asset, chunk, excluded GET, and pass-through fetch failures no longer reject the service worker `respondWith` promise.
  - Install and activate lifecycle failures fail open so a transient precache/cache-cleanup error does not keep an older unsafe service worker active.
  - This is runtime flood control only; no product feature, cache strategy expansion, or API mutation behavior is upgraded.
- Program C — Market / Morning Brief Runtime Stabilization.
  - Market quote, live valuation, and Morning Brief source failures degrade to unavailable/fallback readback.
  - Morning Brief builder uses safe source fallbacks and remains news-placeholder-only.
- Program D — Admin / Scheduler Runtime Stabilization.
  - Admin diagnostics use source-level fallback payloads.
  - Scheduler and delivery readiness remain disabled/foundation-only.

Important:

- Program A, Program B, Program C, Program D, and Program E are complete in this branch after validation.
- The full V12.1 Runtime Stabilization Program is complete only after this PR is merged.

## Audit Basis

Source audit:

- `docs/WORKSPACE_RUNTIME_AUDIT_20260627.md`

Audit root-cause summary:

- Root `AuthProvider` had multiple async paths that could reject without a catch.
- `public/sw.js` routed several fetch paths through promises that could reject from `fetch(request)` or async cache writes, surfacing as `sw.js` `Uncaught (in promise) TypeError: Failed to fetch`.
- Supabase session, auth refresh, storage, and network failures should fall back gracefully.
- Market / Morning Brief runtime paths and Admin / Scheduler runtime paths remain high-priority follow-up work, but they are not changed in Program A, Program B, or Program E.
- Production gray-screen regression risk was linked to optional Supabase persistence tables (`ixai_profile_memory`, `ixai_user_preferences`) returning REST 404 when absent.
- Browser bundles no longer contain direct Yahoo endpoints; Yahoo CORS is not treated as the primary crash cause.

## Program A Completed

Root provider stabilization is implemented for:

- `components/auth/auth-provider.tsx`
- `components/auth/identity-provider.tsx`
- `components/auth/auth-entry-gate.tsx` reviewed; no routing change required.
- `app/layout.tsx` reviewed; provider order remains unchanged.

### AuthProvider Stabilization

Program A adds safe boundaries around:

- Initial identity hydration.
- Auth state change activation.
- Authenticated session activation.
- Profile bootstrap.
- Visit-time profile memory persistence.
- Onboarding preference persistence.
- Profile memory updates.
- Google sign-in, magic link, password sign-in, password registration, and sign-out task wrappers.
- Synchronous identity localStorage write/remove failures.

Errors are contained with safe fallback state and local `console.warn` diagnostics. The provider does not throw into the browser global promise queue.

Business logic is unchanged:

- No auth redirect policy change.
- No RLS change.
- No Supabase policy change.
- No membership change.
- No schema or SQL change.

### IdentityProvider Stabilization

Program A hardens the lightweight identity provider by:

- Keeping `/api/auth/me` refresh failures inside `try/catch/finally`.
- Handling invalid or non-JSON auth responses as anonymous fallback.
- Catching the mount-triggered refresh promise.
- Catching logout request failures while still clearing local provider state.
- Wrapping logout analytics tracking so analytics errors cannot affect auth state.

## Program B Completed

Workspace Runtime Hydration Safety is implemented for:

- `/my-ixai/home`
- `/my-ixai/settings`
- `/my-ixai/copilot`
- `/my-ixai/intelligence`
- `/my-ixai/risk`
- `/my-ixai/fcn`
- `/my-ixai/portfolio`

Program B adds a shared Workspace runtime safety layer under `src/lib/workspace/runtime-safety/`:

- `runWorkspaceSafe(...)` for async client refresh tasks.
- `runWorkspaceSafeSync(...)` for synchronous browser/runtime tasks.
- `parseWorkspaceJsonSafe(...)` for localStorage JSON parse fallbacks.
- `readWorkspaceStorageSafe(...)` and `writeWorkspaceStorageSafe(...)` for browser storage access.
- Diagnostics fallback helpers that return safe unavailable/degraded results instead of throwing.

Workspace client components now protect mount-triggered refresh work with mounted/cancelled guards before setting state. Failed refreshes are converted to null/fallback state instead of unhandled promise rejections.

Settings diagnostics safety includes:

- Database read priority status.
- Platform cutover status.
- Persistence readiness.
- V11/V12/V13/V14 database activation status cards.
- Workspace health and timeline summaries.

Copilot, Intelligence, Risk, FCN, and Portfolio summary refreshes now degrade safely when a readback builder, fetch, storage read, or diagnostic helper fails.

Program B does not change product behavior, routing, database writes, auth, membership, broker, trading, recommendation, scheduler, billing, OpenAI, or AI behavior.

## Program C Completed

Program C stabilizes Market / Morning Brief runtime paths:

- Live market quote API JSON/network failures return unavailable snapshots.
- Live valuation falls back to empty/unavailable quote state when Portfolio Truth or quote providers fail.
- Morning Brief v1 uses settled source reads so one failed source does not crash the brief.
- News remains placeholder-only.
- No Telegram scheduler, OpenAI / LLM, broker, trading, or recommendation behavior is introduced.

## Program D Completed

Program D stabilizes Admin / Scheduler runtime paths:

- Admin identity, audience, LINE Login, and LINE identity snapshots use source-level fallback payloads.
- Scheduler and delivery readiness remain foundation-only.
- No automatic publishing, notification delivery activation, auth behavior, membership, RLS, schema, or migration behavior changed.

## Production Gray Screen Regression Fixed

Optional Supabase persistence tables now degrade safely:

- `ixai_profile_memory`
- `ixai_user_preferences`

Missing optional table / REST `404` / `PGRST205` / relation-not-found conditions use local fallback state, mark the table unavailable with cooldown, and log one controlled warning instead of repeatedly spamming requests or throwing into Workspace runtime.

Route-level error boundaries were not shipped in this completion branch. A production-like Next 16.2.6 smoke test showed segment-level Workspace/Admin error boundaries can trigger a `client reference manifest for route ... does not exist` invariant for static Workspace routes, so V12.1 uses source-level fail-safe reads and component refresh guards instead.

## Program E Completed

Service Worker Fetch Safety is implemented in:

- `public/sw.js`

Program E adds safe boundaries around:

- Navigation requests, using network-first behavior with a stable offline HTML fallback.
- Static asset and Next.js chunk requests, using existing cache-first behavior with network fallback contained by a `204` empty response.
- Excluded GET routes, using pass-through network behavior with a non-throwing fallback response.
- Non-GET requests, using direct fetch behavior with a contained failure response so the service worker does not emit an unhandled rejection.
- Cache write failures, which are caught locally and never reject the fetch event.
- Install precache failures and activate cache-cleanup failures, which are best-effort and cannot prevent the safer service worker from activating.

Program E does not add aggressive cache behavior, pre-cache Workspace routes, change API contracts, change auth/membership/database logic, or alter product features.

### Program E Debug Notes

- Production screenshots still showing `sw.js:107` as `Uncaught (in promise) TypeError: Failed to fetch` may be running an older service worker script. In this branch, `public/sw.js:107` maps to `return cached;` inside the static cache branch, not to a raw `fetch(request)` call.
- The previous unsafe paths included raw pass-through `fetch(request)` and static asset/chunk fetch/cache promises that could reject through `event.respondWith(...)`.
- The cache name was bumped to `ixai-static-v1.30` so the new service worker activation can retire older `ixai-*` caches.
- Because browsers can keep an old active service worker until update/activation, production verification should check the active service worker script after deploy.

How to verify after deploy:

- Open Chrome DevTools → Application → Service Workers.
- Confirm the active worker is `/sw.js` from the newest deployment.
- Enable "Update on reload" for one reload, then refresh `/my-ixai/settings`.
- Open `/my-ixai/copilot`, `/my-ixai/intelligence`, and `/my-ixai/settings`.
- Reload `/my-ixai/settings`.
- Switch between those Workspace routes at least five times.
- Console should not continuously add `sw.js` `Uncaught (in promise) TypeError: Failed to fetch`.

If the browser is still running an old worker:

- Chrome DevTools → Application → Service Workers → Unregister the IXAI worker.
- Chrome DevTools → Application → Storage → Clear site data for `https://app.ixuan.ai`.
- Hard reload the page.
- Reopen the three Workspace routes and repeat the route-switch verification.

### Settings Runtime Investigation

Settings render path review:

- `app/my-ixai/settings/page.tsx` is a server component and does not use browser-only APIs directly.
- `getWorkspaceIntegrationAudit()` already catches builder failures and returns a renderable audit fallback.
- Several Settings diagnostics client components used `queueMicrotask(() => void refresh())` and `onClick={() => void refresh()}` with async `refresh()` functions that had no local `try/catch/finally`.
- Program E verification added local catch/finally guards to the Settings diagnostics refresh paths so builder failures produce warning/fallback UI instead of unhandled promise rejections or stuck loading state.
- No broker, trading, recommendation, scheduler, billing, auth, RLS, SQL, or migration behavior was changed.

## Deferred Work

The following audit recommendations remain intentionally out of scope after Program A, Program B, and Program E:

- Program C: diagnostics stabilization and `Promise.allSettled(...)` migration for Settings / Workspace cards.
- Program D: global runtime monitor for `unhandledrejection` and `error`.

## Safety Boundaries

Program A, Program B, and Program E do not include:

- DB migration.
- SQL.
- RLS, auth policy, or membership change.
- Billing or Stripe.
- Scheduler.
- Broker integration.
- Trading, order execution, rebalance, or investment recommendation.
- New external monitoring service.

## Validation Plan

Required validation for Program A / Program B / Program E:

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`
- Browser smoke on `/my-ixai/settings`, `/my-ixai/copilot`, and `/my-ixai/home`, with focus on absence of repeated auth-provider `Uncaught (in promise)` storms.
- Browser smoke on `/my-ixai/copilot`, `/my-ixai/intelligence`, and `/my-ixai/settings`, with refreshes and route switching focused on absence of repeated `sw.js` `Uncaught (in promise) TypeError: Failed to fetch` storms.
- Browser smoke on `/my-ixai/home`, `/my-ixai/settings`, `/my-ixai/copilot`, `/my-ixai/intelligence`, `/my-ixai/risk`, `/my-ixai/fcn`, and `/my-ixai/portfolio`, with reloads and at least 10 Workspace route switches focused on absence of unhandled promise rejections, fatal React errors, hydration mismatch crashes, repeated runtime error floods, and white screens.

## Known Limitations

Program A reduces the highest-confidence root provider unhandled rejection risk. Program B reduces Workspace client hydration, diagnostics refresh, mounted-state update, and browser-storage parse risks. Program E reduces service worker fetch/cache unhandled rejection risk. The broader Runtime Stabilization Program still does not yet address Market / Morning Brief runtime paths or Admin / Scheduler runtime paths. Those remain future stabilization slices.
