# V15.0.2 Copilot Safe Shell Hotfix

Date: 2026-07-03

## Incident Summary

V15 production and preview verification reproduced Chrome renderer hangs after the V15 Workspace redesign:

- `RESULT_CODE_HUNG`
- Initially observed on `/my-ixai/home`
- Reproduced on PR #102 preview at `/my-ixai/copilot`

PR #102 lazy-mounted diagnostics and reduced one valid risk, but it did not resolve the Copilot crash. The V15.0.2 investigation identified a separate first-paint fan-out path inside Copilot.

## Root Cause

`CopilotExperienceWorkspace` automatically called `getWorkspaceCopilotSummary()` during mount.

That call path was:

```text
CopilotExperienceWorkspace useEffect
→ getWorkspaceCopilotSummary()
→ getWorkspaceGraph()
→ 37 Workspace module reads in one client-side Promise.all
```

This converted a previously manual, diagnostics-like summary operation into initial page-load work. In production authenticated sessions, that client-side graph fan-out is unsafe for first paint and is the strongest root-cause candidate for `/my-ixai/copilot` `RESULT_CODE_HUNG`.

## Fix

`/my-ixai/copilot` now starts as a static safe shell.

Initial render includes:

- Hero
- KPI row
- Suggested Questions
- Safe Mode / explain-only status
- Empty state
- Manual summary section
- Collapsed diagnostics

Initial render no longer:

- Calls `getWorkspaceCopilotSummary()`
- Calls `getWorkspaceGraph()`
- Reads the 37-module Workspace Graph
- Runs hidden diagnostics graph work
- Calls AI / LLM
- Produces recommendations or trading instructions

The full summary path remains available only behind the existing manual run button in `WorkspaceCopilotSummary`, which already uses runtime budget and loading state guards.

## Files Changed

- `components/copilot/copilot-experience-workspace.tsx`
- `docs/V1502_RENDERER_HUNG_INVESTIGATION.md`
- `docs/V1502_COPILOT_SAFE_SHELL_HOTFIX.md`
- `docs/ROADMAP.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/VERSION_HISTORY.md`

## Safety Boundary

This hotfix does not modify:

- API
- Database
- Supabase
- Auth
- Workspace Graph internals
- Risk engine
- FCN engine
- Portfolio engine
- Market provider
- AI / LLM behavior
- Scheduler
- Broker / trading / recommendation logic

## Validation

Required local validation:

- `git diff --check`
- `npm run lint`
- `npm run build`

Production preview validation:

- Open `/my-ixai/copilot`.
- Confirm initial load does not trigger Workspace Graph fan-out.
- Keep route open for at least 2 minutes.
- Click manual run once.
- Confirm loading state prevents repeat clicks.
- Confirm summary returns or safely falls back.
- Confirm route remains responsive.
- Switch:
  - Home -> Portfolio -> FCN -> Risk -> Intelligence -> Copilot -> Settings -> Home
- Confirm no `RESULT_CODE_HUNG`.
- Confirm no console error storm.
- Confirm no failed request storm.

## Release Recommendation

Use V15.0.2 as the replacement hotfix path for PR #102.

PR #102 should not be merged as the final fix unless it is updated to include the Copilot safe shell change. The important production gate is now `/my-ixai/copilot` staying stable without automatic Workspace Graph fan-out on initial load.
