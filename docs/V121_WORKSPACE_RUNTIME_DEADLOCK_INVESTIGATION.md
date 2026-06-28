# V12.1 Workspace Runtime Deadlock Investigation

## Executive Summary

This investigation targets the production Chrome renderer `RESULT_CODE_HUNG` / gray-screen failure still observed after PR #75, PR #79, and the authenticated read-storm fix.

Finding:

- Local static inspection did not find a direct React infinite render loop in the inspected Workspace components.
- The highest-risk runtime pattern is Workspace route mount fan-out: Copilot, Settings, and Intelligence all start client-side async refreshes on mount, and several of those refreshes converge on the same deep services.
- Settings is the highest-risk page because it mounts many diagnostics cards at once. Those cards trigger overlapping `Promise.all(...)` trees for database readiness, platform readiness, sync readiness, graph readiness, Portfolio Truth, FCN, Watchlist, Alerts, migration health, and private Supabase table probes.
- Copilot is high risk because `WorkspaceCopilotSummary` calls `getWorkspaceCopilotSummary()`, which calls `getWorkspaceGraph()`. The graph currently starts 37 safe reads concurrently.
- Intelligence is medium-high risk because the page runs both `IntelligenceCenterWorkspace` and nested `IntelligenceSummary`; those independently call Portfolio Truth and Intelligence services on mount.
- `sw.js:107` in the current branch maps to `if (cached)`, not `fetch(request)`. Production screenshots that still point at `sw.js:107` can be explained by an older service worker / stale source map / stale bundle still controlling the page.
- Previous fixes contained thrown promises and repeated 401/404 reads, but they did not add backpressure, route-level dedupe, or shared in-flight coalescing for Workspace diagnostics fan-out.

Conclusion:

- V12.1 is still production-incomplete.
- Current blocker: Workspace Renderer HUNG / runtime deadlock under route switching.
- Do not continue Live Market, Beta, broker/trading/recommendation, scheduler, billing, or product feature work until a targeted Workspace runtime fan-out fix is designed and verified.

## Production Evidence

Reported production symptoms:

- Chrome renderer HUNG / `RESULT_CODE_HUNG`.
- Gray screen or blank Workspace pages after route switching.
- Affected pages include `/my-ixai/copilot`, `/my-ixai/settings`, and `/my-ixai/intelligence`.
- Previous service worker flood showed `Uncaught (in promise) TypeError: Failed to fetch` from `sw.js`.
- Authenticated read storms and optional-table 404 storms were reduced by earlier fixes but did not prove renderer stability.

## Runtime Dependency Graph

```text
/my-ixai/copilot
  -> WorkspaceCopilotSummary useEffect queueMicrotask
  -> runWorkspaceSafe("workspace-copilot-summary")
  -> getWorkspaceCopilotSummary
  -> getWorkspaceGraph
  -> 37 concurrent safeRead calls
     -> Portfolio Truth -> /api/fcn, /api/stocks, /api/crypto, /api/portfolio/dashboard
     -> Intelligence -> Portfolio Truth + Valuation + Risk + FCN Risk + FCN Schedule
     -> Database Read Priority -> Portfolio + FCN + Watchlist + Alerts
     -> Platform Cutover -> Membership + Migration + Production Readiness + Reconciliation + Write Cutover
     -> V11/V12/V13/V14 diagnostics

/my-ixai/settings
  -> WorkspacePersistenceReadiness -> 6 concurrent diagnostics, including Workspace Sync
  -> Workspace Sync -> Portfolio Persistence + Portfolio Truth + Workspace Graph Summary + DB Activation
  -> WorkspaceDatabaseReadPriorityStatus -> 4 concurrent diagnostics
  -> WorkspacePlatformCutoverStatus -> 6 concurrent diagnostics
  -> WorkspaceDatabaseActivationStatus -> 19 concurrent diagnostics
  -> V11/V12/V13/V14 status cards -> additional diagnostics
  -> overlapping private Supabase read gates and table probes

/my-ixai/intelligence
  -> IntelligenceCenterWorkspace useEffect queueMicrotask
  -> Portfolio Truth readback
  -> nested IntelligenceSummary useEffect queueMicrotask
  -> getWorkspaceIntelligenceReport
  -> Portfolio Truth + Valuation + Risk + FCN Risk + FCN Schedule
```

## Runtime Chain Inventory

| file | component/function | trigger | async work | state update? | dependency array? | cleanup exists? | can retrigger itself? | risk | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `components/copilot/workspace-copilot-summary.tsx` | `WorkspaceCopilotSummary.refresh` | mount `queueMicrotask`; button | `getWorkspaceCopilotSummary` | yes | `[]` | mounted/cancelled ref | no direct self-loop | high | Calls Workspace Graph; Graph fans out 37 reads. |
| `src/lib/copilot/copilot-service.ts` | `getWorkspaceCopilotSummary` | Copilot refresh | `getWorkspaceGraph` | no | n/a | n/a | no direct self-loop | high | Graph call is the expensive shared dependency. |
| `src/lib/workspace/graph/workspace-graph-service.ts` | `getWorkspaceGraph` | Copilot, Health, Sync, API | `Promise.all` of 37 `safeRead`s | no | n/a | n/a | indirect overlap | high | No backpressure or shared graph in-flight dedupe. |
| `app/my-ixai/settings/page.tsx` | Settings page | server render + client card mounts | many client cards mount together | via child cards | n/a | child-level | route remount repeats all | high | Densest route fan-out. |
| `components/workspace/workspace-database-activation-status.tsx` | `refresh` | mount `queueMicrotask`; button | `Promise.all` of 19 diagnostics | yes | `[]` | mounted/cancelled ref | no direct self-loop | high | Includes read priority and platform cutover, which call nested diagnostics. |
| `components/workspace/workspace-persistence-readiness.tsx` | `refresh` | mount `queueMicrotask`; button | `Promise.all` of 6 diagnostics | yes | `[]` | mounted/cancelled ref | indirect | high | Calls Workspace Sync; Sync calls Graph Summary. |
| `src/lib/persistence/sync/workspace-sync-service.ts` | `getWorkspaceSyncReport` | Settings persistence card | Portfolio Persistence + Truth + Graph Summary + DB Activation | no | n/a | n/a | indirect overlap | high | Re-enters Graph while Settings already runs other graph-adjacent diagnostics. |
| `components/workspace/workspace-platform-cutover-status.tsx` | `refresh` | mount `queueMicrotask`; button | `Promise.all` of 6 diagnostics | yes | `[]` | mounted/cancelled ref | no direct self-loop | high | Platform service includes production readiness, which calls database read priority and reconciliation. |
| `components/workspace/workspace-database-read-priority-status.tsx` | `refresh` | mount `queueMicrotask`; button | `getWorkspaceDatabaseReadPriorityStatus` | yes | `[]` | mounted/cancelled ref | no direct self-loop | medium-high | Duplicated by DB activation and Graph. |
| `components/workspace/workspace-v11-database-activation-status.tsx` | `refresh` | mount `queueMicrotask`; button | V11 activation + cutover | yes | `[]` | mounted/cancelled ref | no direct self-loop | medium | Adds duplicate diagnostics on Settings. |
| `components/workspace/workspace-v12-database-write-activation-status.tsx` | `refresh` | mount `queueMicrotask`; button | V12 write activation | yes | `[]` | mounted/cancelled ref | no direct self-loop | medium | Read-only diagnostics. |
| `components/workspace/workspace-v13-portfolio-database-write-activation-status.tsx` | `refresh` | mount + custom event | V13 diagnostics | yes | `[]` | event cleanup exists | event can retrigger | medium | Listener cleanup is present. |
| `components/workspace/workspace-v14-fcn-database-activation-status.tsx` | `refresh` | mount + custom event | V14 diagnostics | yes | `[]` | event cleanup exists | event can retrigger | medium | Listener cleanup is present. |
| `components/intelligence/intelligence-center-workspace.tsx` | `loadIntelligenceCenter` | mount `queueMicrotask` | Portfolio Truth | yes | `[loadIntelligenceCenter]` | mounted/cancelled ref | no direct self-loop | medium-high | Page also renders nested `IntelligenceSummary`. |
| `components/intelligence/intelligence-summary.tsx` | `loadReport` | mount `queueMicrotask`; button | Intelligence Report | yes | `[autoLoad, loadReport]` | mounted/cancelled ref | no direct self-loop | medium-high | Duplicates Portfolio Truth on Intelligence page. |
| `src/lib/intelligence/engine/intelligence-service.ts` | `getWorkspaceIntelligenceReport` | Intelligence summary and Graph | `Promise.all` of Truth, Valuation, Risk, FCN Risk, FCN Schedule | no | n/a | n/a | no direct self-loop | medium-high | Catches failure but still fans out. |
| `src/lib/portfolio/truth/portfolio-truth-client.ts` | `loadPortfolioTruthReadback` | Graph, Intelligence, Risk, Portfolio | 4 API fetches with short in-flight cache | no | n/a | n/a | no direct self-loop | medium | 1.5s coalescing helps but does not cover Graph or diagnostics. |
| `src/lib/persistence/database-activation-utils.ts` | `readDatabaseTable` | many diagnostics | auth gate + Supabase REST fetch | no | n/a | n/a | repeated by fan-out | medium-high | 401 cooldown exists; repeated route fan-out can still schedule many reads before cooldown settles. |
| `components/auth/auth-entry-gate.tsx` | `AuthEntryGate` | auth/session state | account redirect only | yes, through provider | `[shouldRedirectAccountToLogin]` | n/a | no Workspace redirect loop found | low | Workspace routes show gate UI for unauthenticated state but do not redirect. |
| `components/pwa/pwa-register.tsx` | `PwaRegister` | route pathname + load event | SW register | no | `[pathname]` | load cleanup exists | route switch repeats registration check | low-medium | Registration is de-duped but runs on every route pathname. |
| `public/sw.js` | `handleFetch` | browser fetch | network/cache fetch | no | n/a | n/a | old SW possible | medium | Current line 107 is cache hit branch, not fetch. |

## Pattern Audit

A. Missing dependency array:

- No high-confidence missing dependency array was found in the inspected Copilot, Settings, Intelligence, workspace diagnostics, auth gate, or PWA registration mount effects.

B. New object/array/function deps:

- `IntelligenceSummary` and `IntelligenceCenterWorkspace` use `useCallback` dependencies correctly.
- Settings diagnostics mostly use local `refresh` functions inside `useEffect([])`, so dependency churn is not the primary issue.

C. Refresh function dependency:

- Intelligence components use callback dependencies and do not create a direct refresh loop.
- Most Settings cards avoid refresh function dependencies by using `[]`.

D. Refresh setState -> dependency change:

- No direct effect dependency on refreshed state was found in the core inspected components.

E. Route switch fan-out:

- High risk. Route switches remount Workspace cards, and each mount schedules microtask refreshes. Settings can trigger many nested diagnostics in one render session.

F. Event listeners cleanup:

- V13/V14 Settings cards remove custom event listeners.
- FCN and Portfolio route components have storage/custom event listeners that should remain in the broader risk set, but the current production blocker is concentrated on Copilot/Settings/Intelligence.

G. Timers cleanup:

- PWA registration uses load listener cleanup.
- Intelligence delivery preference components use timeout cleanup outside the affected Workspace routes.

H. `Promise.all` fan-out setState:

- High risk. Settings and Graph contain the densest `Promise.all(...)` fan-out. Errors are mostly contained, but CPU/network pressure can still hang the renderer.

I. Render-path localStorage / `JSON.parse`:

- Program B added safe parse/storage helpers in many areas. Remaining browser storage reads are mostly guarded with `typeof window` and try/catch.

J. Diagnostics builder each render:

- Settings server render calls `getWorkspaceIntegrationAudit()` synchronously; child diagnostics run after mount. The issue is not a render-loop builder but mount-time diagnostics fan-out.

K. SW/storage/auth router refresh/global refresh loop:

- No `router.refresh` loop was found in Workspace runtime paths.
- `AuthEntryGate` uses `window.location.replace` only for `/account` unauthenticated redirects, not `/my-ixai/*`.
- Current SW fetch handler contains failures, but stale production SW remains plausible.

## Service Worker Findings

Current `public/sw.js` mapping:

- `sw.js:97` -> `return await fetch(request)` inside `safeFetch(...)`, caught locally.
- `sw.js:107` -> `if (cached)` inside `cacheStaticAsset(...)`.
- `sw.js:111` -> `const response = await fetch(request)` inside `cacheStaticAsset(...)`, caught by that function.
- `sw.js:215` -> `event.respondWith(handleFetch(event))`.

Implication:

- A production console pointing at `sw.js:107` as a failed fetch likely does not match this branch's current source.
- Old service worker registration/cache or stale source mapping remains possible and must be manually cleared during production verification.

Manual production verification steps:

1. Open Chrome DevTools -> Application -> Service Workers.
2. Check active script URL and update time.
3. Unregister the IXAI service worker.
4. Application -> Storage -> Clear site data for `https://app.ixuan.ai`.
5. Hard reload.
6. Confirm the active worker contains `IXAI_STATIC_CACHE = "ixai-static-v1.30"`.
7. Repeat Copilot -> Settings -> Intelligence route switching.

## Promise Audit

High-risk Promise chains:

- `getWorkspaceGraph()` starts 37 concurrent safe reads with no concurrency cap.
- `WorkspaceDatabaseActivationStatus.refresh()` starts 19 diagnostics at once.
- `WorkspacePersistenceReadiness.refresh()` calls `getWorkspaceSyncReadiness()`, which calls `getWorkspaceGraphSummary()`, which calls `getWorkspaceGraph()`.
- `WorkspacePlatformCutoverStatus.refresh()` calls platform cutover plus V11/V12/V13/V14 diagnostics. Platform cutover then calls production readiness, which calls database read priority and reconciliation.
- `getWorkspaceIntelligenceReport()` starts 5 data reads; on Intelligence page this overlaps with `IntelligenceCenterWorkspace` Portfolio Truth read.

Contained Promise paths:

- `runWorkspaceSafe(...)` catches task failures.
- `safeAuthenticatedSupabaseRead(...)` catches network, unauthorized, missing table, and non-OK results.
- `loadPortfolioTruthReadback()` catches individual API fetch failures through helper functions.
- Current service worker fetch paths catch network/cache failures.

Remaining gap:

- Containment prevents uncaught rejections, but it does not prevent a renderer hang caused by too many concurrent async tasks, JSON parses, response processing, and state commits during fast route switching.

## useEffect Audit

No direct infinite `useEffect` loop was confirmed in the inspected root paths.

High-risk effects are one-shot mount effects that fan out:

- `WorkspaceCopilotSummary`: one-shot mount refresh to full Graph.
- `WorkspacePersistenceReadiness`: one-shot mount refresh to sync + persistence diagnostics.
- `WorkspaceDatabaseActivationStatus`: one-shot mount refresh to 19 diagnostics.
- `WorkspacePlatformCutoverStatus`: one-shot mount refresh to nested platform diagnostics.
- `IntelligenceCenterWorkspace`: one-shot mount refresh to Portfolio Truth.
- `IntelligenceSummary`: one-shot mount refresh to Intelligence Report.

Effect cleanup status:

- Mounted/cancelled guards exist before state updates.
- Custom event listeners in V13/V14 cards are removed on unmount.
- No Workspace route-level interval loop was found.

## Provider / Context Audit

Provider order:

```text
DistributionProvider
PageViewTracker
AuthProvider
  IdentityProvider
    AuthEntryGate
      AppShell
        PwaRegister
        page
```

Findings:

- Program A contained root auth promises; no new provider-level throw path was identified in this investigation.
- `AuthEntryGate` does not redirect Workspace routes in a loop; unauthenticated Workspace routes show entry UI.
- `PwaRegister` runs per pathname but registration is production-only, catches errors, and de-dupes in-flight registration.

## Retry Loop Audit

Confirmed contained cooldowns:

- Optional Supabase tables use disable/cooldown behavior.
- Private Supabase reads use authenticated read gate and temporary table disable behavior.
- Portfolio Truth has short TTL / in-flight coalescing.

Open retry/fan-out risk:

- No graph-level in-flight coalescing.
- No diagnostics-level concurrency cap.
- No route-level cancellation through `AbortController`.
- No backpressure for Settings diagnostics cards mounting simultaneously.

## Instrumentation Added

Diagnostics-only code was added and is off by default:

- `src/lib/workspace/runtime-safety/runtime-loop-detector.ts`

Activation:

- Set `NEXT_PUBLIC_IXAI_RUNTIME_DIAGNOSTICS=1`, or
- In the browser console, run:

```js
localStorage.setItem("ixai.runtime.diagnostics", "1");
```

Behavior:

- Counts repeated runtime keys in a 5 second window.
- Warns when the same key exceeds the threshold.
- Default threshold: 20.
- Optional override: `NEXT_PUBLIC_IXAI_RUNTIME_DIAGNOSTICS_THRESHOLD`.
- No sensitive payloads are logged.

Instrumented keys:

- `safe-refresh:<label>` from `runWorkspaceSafe(...)`.
- `safe-sync:<label>` from `runWorkspaceSafeSync(...)`.
- `database-read:<table>` from `readDatabaseTable(...)`.
- `workspace-graph:read` from `getWorkspaceGraph()`.

## Top 10 Runtime Risks

1. Settings route mounts many diagnostics cards simultaneously.
2. `getWorkspaceGraph()` has 37-way concurrent fan-out and no shared in-flight coalescing.
3. Settings `WorkspaceDatabaseActivationStatus` duplicates many diagnostics already mounted elsewhere on the same page.
4. Settings `WorkspacePersistenceReadiness -> Workspace Sync -> Workspace Graph Summary -> Workspace Graph` creates an expensive indirect graph path.
5. Copilot depends on full Workspace Graph for a single summary card.
6. Intelligence page runs two independent mount refreshes that both touch Portfolio Truth.
7. Route switching remounts cards and repeats microtask refreshes.
8. Private Supabase cooldown starts after reads return; simultaneous initial reads can still stack before cooldown is known.
9. Current SW source does not match production line evidence, so stale service worker control remains a deployment/runtime risk.
10. Previous fixes focused on catching errors, not limiting runtime work volume.

## Top 3 Root Cause Candidates

1. High confidence: Workspace diagnostics fan-out saturates the renderer during route switching.
   - Evidence: Settings mounts many cards; DB activation alone runs 19 diagnostics; Graph runs 37 safe reads; overlapping nested services duplicate work.

2. Medium-high confidence: Lack of graph/diagnostics in-flight coalescing allows route remounts to stack expensive work.
   - Evidence: Portfolio Truth is coalesced for 1.5s, but Graph, database read priority, platform cutover, and Settings diagnostics are not.

3. Medium confidence: Production still has old service worker/cache control or stale `sw.js` mapping.
   - Evidence: current `sw.js:107` is `if (cached)`, not a fetch call; production still reported `sw.js:107` failed fetch.

Lower confidence:

- Root provider auth loop: Program A fixes and current inspection did not show a Workspace redirect loop.
- Direct React infinite render loop: no inspected core component has state-update dependency recursion.
- Yahoo CORS: browser bundles should no longer rely on client-side Yahoo provider for Workspace route survival.

## Recommended Fix Order

1. Add shared in-flight coalescing and short TTL to `getWorkspaceGraph()`, database read priority, platform cutover, and Settings diagnostics builders.
2. Split Settings diagnostics into lazy/visible sections or sequence them with a small concurrency limit.
3. Make Copilot summary consume a smaller graph summary or cached graph result instead of forcing a full graph read per mount.
4. Add route-level `AbortController` cancellation for client refreshes where underlying fetch paths can accept a signal.
5. Add production diagnostics sampling using the gated runtime-loop detector before and after fix deployment.
6. Verify production with old SW unregistered and site data cleared.

## Local Reproduction Plan

Commands:

```bash
rm -rf .next
npm run build
PORT=3001 npm run start
```

Browser actions:

- Enable diagnostics if needed:

```js
localStorage.setItem("ixai.runtime.diagnostics", "1");
```

- Reload `/my-ixai/copilot` 10 times.
- Reload `/my-ixai/settings` 10 times.
- Reload `/my-ixai/intelligence` 10 times.
- Switch routes at least 50 times:

```text
copilot -> settings -> intelligence -> copilot -> settings
```

Record:

- Whether local can reproduce renderer HUNG.
- Console warnings from `[IXAI Runtime Diagnostics]`.
- Network request volume per route switch.
- Main thread long tasks from Performance profile.
- Memory growth across 50 route switches.

## Local Reproduction Result

Local production-like smoke:

- Build: `npm run build`
- Server: `PORT=3001 npm run start`
- Browser: Playwright Chromium, clean local service worker registrations and caches before route stress.
- Diagnostics: `localStorage.setItem("ixai.runtime.diagnostics", "1")`.
- Reloads:
  - `/my-ixai/copilot` 10 times.
  - `/my-ixai/settings` 10 times.
  - `/my-ixai/intelligence` 10 times.
- Route switching:
  - 50 transitions across Copilot, Settings, and Intelligence.

Result:

- Local cannot reproduce renderer HUNG in this clean `next start` run.
- Console errors matching `Uncaught`, `unhandled`, `Failed to fetch`, or `[IXAI Runtime Diagnostics]`: 0.
- `pageerror`: 0.
- `_next`, API, or `sw.js` `requestfailed`: 0.
- Blank body checks: 0.

Interpretation:

- Production remains the source of truth for the blocker.
- Clean local SW/cache passing supports the stale service worker / production-only load hypothesis, but the static dependency graph still shows high fan-out risk that should be fixed before V12.1 is marked complete.

## Chrome Performance Profiling Guide

1. DevTools -> Performance.
2. Start recording.
3. Switch Settings -> Copilot -> Intelligence for 20 seconds.
4. Stop recording.
5. Inspect Main thread long tasks.
6. Search for repeated function names:
   - `getWorkspaceGraph`
   - `getWorkspaceDatabaseReadPriorityStatus`
   - `getWorkspacePlatformCutoverStatus`
   - `getWorkspaceSyncReport`
   - `loadPortfolioTruthReadback`
   - `readDatabaseTable`
7. Inspect memory allocation growth and detached tasks after route transitions.

## Validation Evidence

Static checks performed:

- Workspace layout/provider order inspected.
- Copilot, Settings, Intelligence mount effects inspected.
- Service worker current line mapping inspected.
- PWA registration inspected.
- Router refresh/replace and service worker registration searches performed.
- Workspace Graph, Intelligence, Copilot, Portfolio Truth, database read gate, and Settings diagnostics dependencies inspected.

Validation commands for this branch:

- `git diff --check` — PASS.
- `npm run lint` — PASS.
- `npm run build` — PASS.
- `QA_PORT=3001 npm run qa:mobile` — PASS.

Production requirement:

- `app.ixuan.ai` must be manually verified after any future fan-out/coalescing fix.
- V12.1 must not be marked production-complete until renderer HUNG is no longer reproducible in production route-switch stress.
