# V12.1 Runtime Stabilization Program

## Scope

V12.1 is a runtime stability program for production Workspace pages that were still vulnerable to cross-page crashes, Chrome Error code 5, and large `Uncaught (in promise)` storms.

Program A completed Root Provider Stabilization. Program E now covers Service Worker Fetch Safety. The full V12.1 Runtime Stabilization Program is partial complete, not complete.

## Runtime Stabilization Program Status

Completed:

- Program A — Root Provider Stabilization.
  - Root auth runtime promises stabilized.
  - PR #75 merged.
  - Commit: `9c73915`.
- Program E — Service Worker Fetch Safety.
  - `public/sw.js` fetch events are contained behind safe fallbacks.
  - Navigation, static asset, chunk, excluded GET, and pass-through fetch failures no longer reject the service worker `respondWith` promise.
  - Install and activate lifecycle failures fail open so a transient precache/cache-cleanup error does not keep an older unsafe service worker active.
  - This is runtime flood control only; no product feature, cache strategy expansion, or API mutation behavior is upgraded.

Pending:

- Program B — Workspace Runtime Stabilization.
- Program C — Market / Morning Brief Runtime Stabilization.
- Program D — Admin / Scheduler Runtime Stabilization.

Important:

- Program A and Program E are complete after validation.
- The full V12.1 Runtime Stabilization Program is not complete yet.

## Audit Basis

Source audit:

- `docs/WORKSPACE_RUNTIME_AUDIT_20260627.md`

Audit root-cause summary:

- Root `AuthProvider` had multiple async paths that could reject without a catch.
- `public/sw.js` routed several fetch paths through promises that could reject from `fetch(request)` or async cache writes, surfacing as `sw.js` `Uncaught (in promise) TypeError: Failed to fetch`.
- Supabase session, auth refresh, storage, and network failures should fall back gracefully.
- Settings diagnostics and client async helpers remain high-priority follow-up work, but they are not changed in Program A or Program E.
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

The following audit recommendations remain intentionally out of scope after Program A and Program E:

- Program B: shared safe client async helper for `queueMicrotask`, `void promise.then(...)`, and mounted refresh patterns.
- Program C: diagnostics stabilization and `Promise.allSettled(...)` migration for Settings / Workspace cards.
- Program D: global runtime monitor for `unhandledrejection` and `error`.

## Safety Boundaries

Program A and Program E do not include:

- DB migration.
- SQL.
- RLS, auth policy, or membership change.
- Billing or Stripe.
- Scheduler.
- Broker integration.
- Trading, order execution, rebalance, or investment recommendation.
- New external monitoring service.

## Validation Plan

Required validation for Program A / Program E:

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`
- Browser smoke on `/my-ixai/settings`, `/my-ixai/copilot`, and `/my-ixai/home`, with focus on absence of repeated auth-provider `Uncaught (in promise)` storms.
- Browser smoke on `/my-ixai/copilot`, `/my-ixai/intelligence`, and `/my-ixai/settings`, with refreshes and route switching focused on absence of repeated `sw.js` `Uncaught (in promise) TypeError: Failed to fetch` storms.

## Known Limitations

Program A reduces the highest-confidence root provider unhandled rejection risk. Program E reduces service worker fetch/cache unhandled rejection risk. The broader Runtime Stabilization Program still does not yet address Settings diagnostics fan-out, shared client async wrappers, or global runtime monitoring. Those remain future stabilization slices.
