# V12.2 Settings / Copilot Runtime Hang Fix

## Production Evidence

Production testing confirmed:

- Clearing Service Worker and site data did not remove the hang.
- `/my-ixai/settings` can hang and end in Chrome `RESULT_CODE_HUNG`.
- `/my-ixai/copilot` can hang and end in Chrome `RESULT_CODE_HUNG`.
- `/my-ixai/intelligence` remains normal in the same route-switch set.
- Login can briefly show `503`, but the main blocker is the Settings / Copilot route hang.

Current conclusion:

- The issue is no longer treated as a whole-Workspace, whole-Supabase, or whole-Service-Worker failure first.
- The highest-risk chain is Settings / Copilot shared diagnostics and Workspace Graph runtime fan-out.

## Root Cause Direction

Settings and Copilot shared heavy runtime paths:

- Copilot mounted `WorkspaceCopilotSummary`, which immediately ran `getWorkspaceCopilotSummary()`.
- `getWorkspaceCopilotSummary()` read `getWorkspaceGraph()`.
- `getWorkspaceGraph()` fans out across Portfolio, Risk, FCN, Schedule, Alerts, Watchlist, Market, persistence, platform, database activation, and diagnostics services.
- Settings mounted many diagnostics cards at once. Several of those cards each started their own `queueMicrotask` refresh and nested `Promise.all(...)` trees.
- Settings also built the Workspace integration audit during server render.

This created production route-entry pressure on Settings and Copilot even before the user requested diagnostics.

## Fix Strategy

Settings:

- Initial route render is now a lightweight safe shell plus basic settings cards.
- Heavy diagnostics no longer mount automatically on route entry.
- Workspace Integration Status, Platform Cutover Status, Database Activation Status, Migration Health, Runtime Stabilization Status, and Workspace Graph Diagnostics are represented as fallback cards.
- Diagnostics run only after the user clicks `Run diagnostics`.
- Manual diagnostics use a runtime budget and timeout fallback.

Copilot:

- Initial render is an explain-only safe shell.
- Copilot no longer reads Workspace Graph on mount.
- Summary aggregation runs only after the user clicks `Run summary`.
- Manual summary refresh uses a runtime budget and timeout fallback.

Runtime budget guard:

- Added `src/lib/workspace/runtime-safety/runtime-budget.ts`.
- Provides `runWorkspaceRuntimeBudget(...)`.
- Supports per-key threshold, timeout fallback, hidden-tab auto-skip, and auto-run interval control.
- Provides idle scheduling helper for future safe diagnostics work.

## Validation Checklist

Local required:

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

Production-like route stress:

- `/my-ixai/settings` reload 20 times.
- `/my-ixai/copilot` reload 20 times.
- `settings -> copilot -> settings -> copilot` 100 times.
- `settings -> copilot -> intelligence -> settings` 50 times.

Must not show:

- blank screen
- HTTP 500
- infinite spinner
- unhandled rejection
- request storm
- route hang

Production verification after merge:

- Clear Service Worker and site data.
- Reload Settings 5 times.
- Reload Copilot 5 times.
- Switch Settings / Copilot 30 times.
- Confirm Intelligence remains normal as a control route.

## Status

V12.1 / V12.2 remains production-incomplete until the production manual verification above passes on `app.ixuan.ai`.

This fix does not change auth behavior, RLS, schema, migrations, membership, billing, broker, trading, AI recommendation, scheduler, or notification delivery.
