# V12.2 Production Runtime Root Cause Investigation

## A. Problem Statement

Local production-like QA cannot reproduce the crash, but production `https://app.ixuan.ai` still hangs.

Known state:

- Local `next start` QA has passed in prior V12.1 investigations.
- Production still reports Workspace hangs on Settings, Copilot, and Intelligence.
- Chrome shows `RESULT_CODE_HUNG`.
- DevTools disconnects with renderer gone / render process lost symptoms.
- `RESULT_CODE_HUNG` means the Chrome renderer main process became unresponsive. It is not the same class of failure as a normal React exception, caught promise rejection, or route-level error boundary.
- V12.1 remains production-incomplete.

This V12.2 investigation must capture production evidence before any further product/runtime fix is attempted.

## B. Known Evidence

- PR #79 did not solve the production HUNG.
- PR #80 reduced authenticated Supabase read storms but did not solve the production HUNG.
- 401/404 request storms were reduced, but that was not sufficient to prove renderer stability.
- Settings can show loading/spinner UI before Chrome crashes.
- Copilot / Intelligence route switching can trigger the crash.
- DevTools disconnects because the renderer process is gone.
- Local production-like smoke can pass while production still fails.

## C. Suspect Categories

1. Service Worker / stale cache / fetch event interaction.
   - Current `public/sw.js` contains guarded fetch handling, but production browsers may still be controlled by an older worker or stale app-shell assets.
   - A stale worker could serve old chunks, stale RSC/client navigation assets, or fallback responses during route transitions.
   - This is the first isolation target because it can create production-only behavior even when local clean-cache QA passes.

2. Next.js production runtime / RSC / Flight / client navigation.
   - A production-only app-router navigation issue can appear only with optimized assets, CDN caching, RSC/Flight payloads, chunk loading, or streaming behavior.
   - Settings, Copilot, and Intelligence are static routes with client components that hydrate and refresh after navigation.
   - Repeated `_next` route payloads, RSC requests, stalled Flight responses, or repeated chunk loads would move this higher.

3. React infinite render / effect loop.
   - Prior static review did not confirm a direct effect dependency loop in the main affected components.
   - It remains possible in production if a client boundary, provider state, or route transition changes behavior.
   - Evidence required: React commit storm, repeated component refresh keys, or Performance trace showing the same render path looping.

4. Main-thread CPU long task / memory growth.
   - Settings mounts many diagnostics cards and can schedule multiple deep refresh trees.
   - Copilot can read the Workspace Graph.
   - Intelligence can run Portfolio Truth and Intelligence refreshes together.
   - Evidence required: Chrome Performance trace with long tasks, heap growth, repeated function names, or scripting/layout storm before HUNG.

5. Browser extension / Chrome profile / cache / site data.
   - A stale Chrome profile, old service worker, persistent cache, extension, or corrupted site data can create production-only hangs.
   - Incognito and clean-profile tests separate browser/profile state from app runtime.

6. Production-only CDN / compression / streaming behavior.
   - Vercel/CDN cache, compression, static asset mismatch, or deployment skew can produce behavior that local cannot reproduce.
   - Evidence required: deployment commit verification, asset hash verification, stale cache headers, or preview deployment comparison.

## D. Required Evidence

Do not declare root cause without at least one concrete evidence source:

- Chrome Performance trace showing the long-task culprit.
- Runtime-loop-detector top refresh key immediately before hang.
- Network waterfall showing request/fetch loop.
- Service Worker disabled test result.
- Incognito / clean profile result.
- Different browser result.
- Preview deployment result.
- Production deployment build/commit verification.

Best evidence is a pair:

- One reproduction with normal production browser state.
- One isolation run with service worker bypassed/unregistered and clean site data.

## E. Manual Investigation Steps

1. Open `https://app.ixuan.ai`.
2. Log in.
3. Open Chrome DevTools -> Console.
4. Enable diagnostics:

```js
localStorage.setItem("ixai.runtime.diagnostics", "1");
location.reload();
```

5. Test:
   - `/my-ixai/settings` reload 5 times.
   - `/my-ixai/copilot` reload 5 times.
   - `/my-ixai/intelligence` reload 5 times.
   - Route switch 50 times:

```text
settings -> copilot -> intelligence -> settings
```

6. Copy console warnings before crash, especially:
   - `[IXAI Runtime Diagnostics] repeated runtime activity`
   - `Uncaught`
   - `unhandledrejection`
   - `Failed to fetch`
   - chunk load failures
   - RSC / Flight payload failures

7. Disable diagnostics after test:

```js
localStorage.removeItem("ixai.runtime.diagnostics");
location.reload();
```

Record:

- Route where crash happened.
- Last console warnings before renderer disappeared.
- Whether spinner/loading UI was visible.
- Whether DevTools stayed connected long enough to copy logs.

## F. Service Worker Isolation Steps

1. Open `https://app.ixuan.ai`.
2. Open DevTools -> Application -> Service Workers.
3. Check `Bypass for network`.
4. Unregister the active IXAI service worker.
5. Application -> Storage -> Clear site data.
6. Hard reload.
7. Re-open DevTools -> Application -> Service Workers and verify:
   - No old worker is controlling the page, or bypass is active.
   - If a worker re-registers, confirm script URL is `/sw.js`.
8. Repeat:
   - `/my-ixai/settings` reload 5 times.
   - `/my-ixai/copilot` reload 5 times.
   - `/my-ixai/intelligence` reload 5 times.
   - Route switch 50 times.

Record:

- Crash still happens?
- Does `sw.js` still appear in Console or Network?
- Any `Failed to fetch` storm?
- Any cache hits for `_next/static`, RSC, or route payloads?
- Active cache names. Current intended static cache is `ixai-static-v1.30`.

Interpretation:

- If crash disappears with SW bypass/unregister, service worker/cache/app-shell state becomes the leading root cause.
- If crash persists with SW disabled and site data cleared, app runtime / Next / React / production deployment behavior becomes more likely.

## G. Incognito / Clean Profile Steps

1. Open Chrome Incognito.
2. Log in fresh to `https://app.ixuan.ai`.
3. Enable diagnostics only if needed:

```js
localStorage.setItem("ixai.runtime.diagnostics", "1");
location.reload();
```

4. Repeat Settings / Copilot / Intelligence reloads and 50 route switches.

Record:

- Crash happens in Incognito?
- Console warning pattern before crash?
- Is a service worker active in Incognito?

Interpretation:

- If no crash in Incognito, stale SW/cache/extension/profile state is likely.
- If crash persists in Incognito, production app/runtime is likely.

## H. Different Browser Test

Test Safari or Edge if available.

Record:

- Only Chrome crashes?
- All browsers crash?
- Same route and same timing?
- Same network/request loop?

Interpretation:

- If only Chrome crashes, inspect Chrome profile, service worker state, extensions, cache, and GPU/hardware acceleration.
- If all browsers crash, app runtime or production deployment behavior is more likely.

## I. Chrome Performance Trace Steps

1. Open DevTools -> Performance.
2. Start recording.
3. Start on `/my-ixai/settings`.
4. Switch repeatedly:

```text
settings -> copilot -> intelligence -> settings
```

5. Record 20-30 seconds.
6. Stop before crash if possible.
7. Inspect:
   - Main thread long tasks.
   - Repeated function names.
   - JS heap growth.
   - Style recalculation / layout storm.
   - Evaluate Script loops.
   - React commit storm.
   - Network callbacks tied to `_next`, RSC/Flight, Supabase, or `sw.js`.

Record suspected function/module names:

- `getWorkspaceGraph`
- `getWorkspaceDatabaseReadPriorityStatus`
- `getWorkspacePlatformCutoverStatus`
- `getWorkspaceSyncReport`
- `loadPortfolioTruthReadback`
- `readDatabaseTable`
- app-router / RSC / Flight functions
- service worker fetch handlers

## J. Network / RSC / Flight Investigation

Open DevTools -> Network and preserve log.

Filters:

- `_next`
- `RSC`
- `fetch/XHR`
- `sw.js`
- `supabase`

Watch for:

- Repeated route payloads.
- Repeated app-router requests.
- Repeated chunk requests.
- Repeated Supabase calls.
- Stalled requests.
- 304/cache loops.
- `from ServiceWorker` responses for app-router or `_next` assets.
- Mismatched/stale chunk hashes.

Record:

- Exact repeated URL pattern.
- Count over 30 seconds.
- Status codes.
- Whether responses are served by Service Worker, memory cache, disk cache, or network.
- Last request before renderer disconnect.

## K. Deployment Verification

Verify:

- Production commit includes PR #80 or the latest intended commit.
- Vercel deployment status is Ready.
- Browser is not running stale service worker.
- App shell assets match current deployment.
- `public/sw.js` current source uses `IXAI_STATIC_CACHE = "ixai-static-v1.30"`.
- Current `sw.js:107` maps to the cache-hit branch in the intended source, not a raw fetch call.
- Preview deployment behavior compared with production.

## Evidence Tooling

Script:

```bash
npm run qa:production-runtime-evidence
```

Behavior:

- Opens Chromium with Playwright.
- Pauses for manual login.
- Enables `localStorage.setItem("ixai.runtime.diagnostics", "1")`.
- Navigates Settings, Copilot, and Intelligence.
- Records selected console warnings/errors, page errors, request failures, route status, and route timing.
- Saves JSON report to `artifacts/runtime-evidence/<timestamp>.json`.

Safety:

- No hardcoded credentials.
- No token capture.
- No raw localStorage dump.
- No holdings or portfolio content capture.
- No product runtime modification.

If Chromium crashes before the JSON report is written, copy visible Console and Network evidence manually before retrying.

## Static Review Findings

Service Worker registration:

- `components/pwa/pwa-register.tsx` registers the worker after page load on non-admin routes.
- It depends on `usePathname()`, so route changes can re-run the registration check.
- `src/lib/pwa/register-sw.ts` registers `/sw.js` in production only, scope `/`, with `updateViaCache: "none"`.
- Registration catches errors and de-dupes in-flight calls.

Service Worker source:

- `public/sw.js` uses cache name `ixai-static-v1.30`.
- It precaches icons, manifest, logo, and OG image.
- Navigation requests are network-first with offline fallback.
- Static assets use cache match first, then network, then 204 fallback.
- Excluded API/auth/market/news routes pass through network with contained fallback.
- Fetch event uses `event.respondWith(handleFetch(event))`.

Risk notes:

- An old active worker can keep controlling production pages until updated, bypassed, or unregistered.
- Static asset cache can serve old `_next/static` chunks if an older worker or old cache state remains active.
- Navigation fallback can mask network failure but should not normally serve `/my-ixai/*` unless network fails.
- A stale Service Worker / stale chunk mismatch remains a high-priority production-only suspect until SW-bypass evidence is captured.

Next runtime:

- `next.config.ts` only disables dev indicators.
- `app/layout.tsx` wraps the app in `AuthProvider`, `IdentityProvider`, `AuthEntryGate`, and `AppShell`.
- App shell includes PWA registration.
- Affected Workspace pages are static App Router routes containing client components that run async refresh work after hydration.
- No product code change is made in this investigation.

## Status

- V12.1 remains production-incomplete.
- Current blocker is production-only Renderer HUNG.
- Local QA is insufficient as completion evidence.
- Next decision requires production evidence capture.
- Do not proceed to Live Market, Beta, broker/trading/recommendation, scheduler, billing, or product feature work until HUNG root cause is confirmed and fixed.
