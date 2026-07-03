# V15.0.2 Renderer Hung Investigation

Date: 2026-07-03

Status: root cause identified and V15.0.2 Copilot safe-shell hotfix implemented.

## Incident Context

Production after PR #101 showed Chrome renderer hangs:

- `RESULT_CODE_HUNG`
- First observed on `https://app.ixuan.ai/my-ixai/home`
- Reproduced again on the PR #102 hotfix preview route:
  - `/my-ixai/copilot`

PR #102 should not be merged as the final fix. It addressed one real risk, collapsed diagnostics eager mounting, but the Copilot reproduction proves the renderer hang is not Home-only and not fully explained by hidden diagnostics.

## Investigation Scope

Reviewed:

- `app/my-ixai/*`
- `app/layout.tsx`
- `components/layout/app-shell.tsx`
- `components/layout/sidebar.tsx`
- `components/layout/mobile-nav.tsx`
- `components/layout/mobile-drawer.tsx`
- `components/auth/auth-entry-gate.tsx`
- `components/auth/auth-provider.tsx`
- `components/auth/identity-provider.tsx`
- `components/copilot/copilot-experience-workspace.tsx`
- `components/home/workspace-home-dashboard.tsx`
- `components/workspace/product/*`
- PWA / service worker registration path
- V15 changes from PR #101
- PR #102 lazy diagnostics change

Note: `app/my-ixai/layout.tsx` does not exist in the repo. Workspace routes use the global `app/layout.tsx` -> `AppShell` path.

## Primary Root Cause

Primary root cause: V15 introduced unbounded client-side Workspace service fan-out during initial page mount.

The strongest concrete reproduction path is `/my-ixai/copilot`.

Before V15, `/my-ixai/copilot` rendered `WorkspaceCopilotSummary`, whose expensive summary refresh was manual-only. After V15 Wave 2, the page renders `CopilotExperienceWorkspace`, and that component automatically calls `getWorkspaceCopilotSummary()` on mount.

Evidence:

- `components/copilot/copilot-experience-workspace.tsx:40-54`
  - `useEffect` queues an initial load on mount.
  - That load calls `runWorkspaceSafe("copilot-experience-summary", getWorkspaceCopilotSummary, ...)`.
- `src/lib/copilot/copilot-service.ts:9-15`
  - `getWorkspaceCopilotSummary()` calls:
    - `getWorkspaceGraph()`
    - `getWorkspaceIntelligenceReportV14()`
    - `getWorkspaceMorningBriefV14()`
  - These run in `Promise.allSettled`.
- `src/lib/workspace/graph/workspace-graph-service.ts:78-155`
  - `getWorkspaceGraph()` performs a single large `Promise.all` across 37 workspace module reads.

The 37 reads include:

- Portfolio persistence
- Portfolio truth
- Portfolio valuation
- Portfolio risk
- FCN risk
- FCN schedule
- Watchlist
- Alerts
- Intelligence
- Daily Brief
- Market status
- Portfolio / FCN / Watchlist / Alert persistence readiness
- Ownership readiness
- Live persistence readiness
- Migration health
- Database read priority
- Platform cutover
- V11 / V12 / V13 / V14 database activation diagnostics
- Legacy risk engine
- Morning brief engine
- Market data foundation
- Intelligence v2 foundation
- SaaS foundation
- Live provider readiness
- Live valuation readiness
- Broker readiness
- Risk automation readiness

This is not a safe first-paint operation for a production authenticated Workspace route.

## Why PR #102 Did Not Fix The Crash

PR #102 lazy-mounted children inside `WorkspaceDiagnosticsPanel`. That was a valid stabilization improvement, because closed `<details>` still mounted children before the hotfix.

However, `/my-ixai/copilot` still crashes on the hotfix preview because the heavy work is not only inside diagnostics:

- `CopilotExperienceWorkspace` performs an automatic main-content summary load on mount.
- That load calls `getWorkspaceCopilotSummary()`.
- `getWorkspaceCopilotSummary()` calls `getWorkspaceGraph()`.
- `getWorkspaceGraph()` fans out across 37 modules.

Lazy diagnostics prevents hidden diagnostic children from running, but it does not stop main-page auto-load fan-out.

## Home Route Findings

`/my-ixai/home` also became more active after V15.

Evidence:

- `components/home/workspace-home-dashboard.tsx:572-601`
  - Home auto-loads data in `useEffect`.
  - It runs a `Promise.all` across:
    - `getWorkspacePortfolioValuation`
    - `getWorkspaceAlertSummary`
    - `getWorkspaceFcnRiskSummary`
    - `getWorkspaceTimelineSummary`
- `getWorkspaceTimelineSummary()` itself reads alerts and FCN schedule.

This is smaller than Copilot's graph fan-out, but it shows the same architectural pattern: first paint now triggers immediate client-side workspace data aggregation. In authenticated production, with real persisted state and route transitions, this can create render pressure before the user interacts.

## Navigation / Layout Findings

No direct infinite render loop was found in the V15 navigation components.

Reviewed:

- `components/layout/sidebar.tsx`
- `components/layout/mobile-nav.tsx`
- `components/layout/mobile-drawer.tsx`
- `components/layout/mobile-header.tsx`
- `components/layout/app-shell.tsx`

Findings:

- `Sidebar` reads `usePathname()` and computes active nav state during render.
- `MobileNav` reads `usePathname()` and computes active nav state during render.
- `MobileDrawer` uses `useEffect` only for body scroll lock and ESC close while open.
- No navigation component writes route-derived state in a loop.
- No `router.refresh`, `router.replace`, or pathname-driven repeated `setState` loop was found in these V15 navigation components.

Navigation is not the primary root cause based on source evidence.

## Auth / Provider Findings

Reviewed:

- `AuthEntryGate`
- `AuthProvider`
- `IdentityProvider`
- `LocaleProvider`
- `LocalizationProvider`

Findings:

- `AuthEntryGate` redirects only unauthenticated `/account` to `/login`; no Workspace route redirect loop was found.
- `IdentityProvider` refreshes `/api/auth/me` once through a timeout-backed effect; no pathname loop found.
- `AuthProvider` performs session hydration and profile persistence; no V15-specific pathname loop found.
- Locale / localization stores use `useSyncExternalStore`; no writer loop was found.

These providers remain possible background cost, but source evidence does not identify them as the renderer-hung root cause.

## PWA / Service Worker Findings

Reviewed:

- `components/pwa/pwa-register.tsx`
- `src/lib/pwa/register-sw.ts`
- `public/sw.js`

Findings:

- `PwaRegister` runs on all non-admin routes and depends on `pathname`.
- On every route transition, it calls `registerServiceWorker()`.
- `registerServiceWorker()` is idempotent during an in-flight call and no-ops in non-production.
- This was not introduced by V15 PR #101 and is not the primary root cause for the Copilot-specific crash.

Risk:

- Because the incident is production-only and service workers are production-only, repeated SW registration remains a secondary route-transition risk.
- If V15.0.3 still sees hangs after disabling client graph fan-out, the next investigation should temporarily disable Workspace SW registration or make it once-per-session.

## Comparison With Pre-V15 Behavior

Pre-V15 Copilot:

- `app/my-ixai/copilot/page.tsx` rendered only `WorkspaceCopilotSummary`.
- `WorkspaceCopilotSummary` did not auto-load `getWorkspaceCopilotSummary()` on mount.
- The expensive summary path was behind a manual refresh button.

Post-V15 Copilot:

- `app/my-ixai/copilot/page.tsx` renders `CopilotExperienceWorkspace`.
- `CopilotExperienceWorkspace` auto-loads `getWorkspaceCopilotSummary()` on mount.
- That auto-load triggers `getWorkspaceGraph()` and its 37-module fan-out.

This is the clearest behavioral regression from PR #101 for the Copilot crash.

## Root Cause Confidence

High confidence:

- Unbounded client-side Workspace Graph fan-out on initial mount, especially via Copilot.

Medium confidence:

- Home and other V15 pages also introduced first-paint auto-load effects that should be budgeted or moved behind explicit user action.

Low / secondary confidence:

- PWA service worker route-transition registration.
- Navigation active-state calculation.
- Auth/provider redirect loops.

## Recommended V15.0.2 Fix Direction

Do not merge PR #102 as the final fix.

Next hotfix should be smaller and more direct:

1. Disable automatic Copilot graph load on mount.
   - `CopilotExperienceWorkspace` should start from a static safe shell.
   - `Available Context` should show `待整理` or safe default.
   - Full `getWorkspaceCopilotSummary()` should run only after explicit user click.
2. Keep `WorkspaceCopilotSummary` manual-only.
   - Its current manual refresh path already uses `runWorkspaceRuntimeBudget`.
3. Do not call `getWorkspaceGraph()` on first paint from any Workspace page.
4. Add a lightweight Copilot summary helper if needed.
   - It should not call `getWorkspaceGraph()`.
   - It may read only cheap/local counts or static defaults.
5. Budget Home auto-loads.
   - Consider `runWorkspaceRuntimeBudget(..., { auto: true, timeoutMs })`.
   - Consider loading only portfolio + alerts first, then deferring FCN/timeline.
6. If route hangs persist, make `PwaRegister` once-per-session rather than pathname-dependent.

## Validation Plan For Next Hotfix

Before merge:

- `git diff --check`
- `npm run lint`
- `npm run build`
- Production preview smoke:
  - `/my-ixai/home` stays open for 2 minutes.
  - `/my-ixai/copilot` stays open for 2 minutes.
  - Route switching:
    - Home -> Portfolio -> FCN -> Risk -> Intelligence -> Copilot -> Settings -> Home
  - No `RESULT_CODE_HUNG`.
  - No console error storm.
  - No failed request storm.
  - No repeated request burst from Copilot on first paint.

Instrumentation recommendation:

- Temporarily log or inspect whether `getWorkspaceGraph()` runs on initial Copilot mount.
- Expected after fix: it should not run until manual user action.

## Files Most Likely To Change In V15.0.2

Recommended minimal code changes:

- `components/copilot/copilot-experience-workspace.tsx`

Possible follow-up if Home still hangs:

- `components/home/workspace-home-dashboard.tsx`
- `src/lib/workspace/runtime-safety/runtime-budget.ts`
- `components/pwa/pwa-register.tsx`

Do not change:

- API
- DB
- Supabase
- Auth logic
- Risk engine
- FCN engine
- Market provider
- AI / LLM
- Scheduler
- Trading / recommendation

## V15.0.2 Fix Implemented

Implemented after this investigation:

- `CopilotExperienceWorkspace` no longer imports or calls `getWorkspaceCopilotSummary()` during initial render.
- `/my-ixai/copilot` now starts from a static safe shell.
- `Available Context` displays a manual-only state instead of a graph-derived count.
- Diagnostics stay collapsed and do not trigger Workspace Graph fan-out on initial render.
- The full Copilot summary remains available through the existing manual run button in `WorkspaceCopilotSummary`.

Source of truth:

- `docs/V1502_COPILOT_SAFE_SHELL_HOTFIX.md`

## Current Decision

PR #102 should remain unmerged.

Proceed with V15.0.2 as the replacement hotfix path. The investigation found no stronger evidence for a global navigation render loop than the auto-run service graph path introduced by V15.
