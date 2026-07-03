# V15.0.1 Production Renderer Hung Hotfix

Date: 2026-07-03

## Incident Summary

After the V15 Workspace redesign merged through PR #101, production showed a Chrome renderer hang on:

- `https://app.ixuan.ai/my-ixai/home`

Observed symptom:

- Authenticated Home appeared briefly.
- Chrome tab then crashed / hung with `RESULT_CODE_HUNG`.

This was treated as a production blocker. The hotfix scope is runtime stabilization only. It does not add product features, redesign Workspace, or change product direction.

## Suspected Root Cause

The strongest suspicion is eager mounting inside collapsed diagnostics panels.

V15 correctly demoted provider, runtime, cache, health, source, localization, and diagnostics UI into bottom `WorkspaceDiagnosticsPanel` sections. However, the panel used a closed native `<details>` element while still rendering its children immediately:

```tsx
<details>
  <summary>Advanced / 進階診斷</summary>
  <div>{children}</div>
</details>
```

Closed `<details>` hides content visually, but React still mounts child components. On `/my-ixai/home`, that meant hidden diagnostics could still mount and run client effects on initial page load:

- `LiveMarketDataStatus`
- `WorkspaceHealthSummary`
- `I18nFoundationStatusCard`
- `LocalizationPreview`

Across V15 pages, the same pattern could mount heavier legacy diagnostics even while collapsed. This created a plausible runtime fan-out path after the redesign and could contribute to renderer hangs, especially in production sessions with authenticated data and route switching.

## Exact Files Changed

- `components/workspace/product/workspace-diagnostics-panel.tsx`
- `docs/V1501_PRODUCTION_RENDERER_HUNG_HOTFIX.md`
- `docs/ROADMAP.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/VERSION_HISTORY.md`

## Fix

`WorkspaceDiagnosticsPanel` is now a small client component that tracks whether its native `<details>` has been opened.

Behavior:

- Default state remains collapsed.
- Children are not rendered while collapsed.
- Heavy diagnostics do not mount on first paint.
- Diagnostics mount only after the user explicitly opens the panel.
- Closing the panel unmounts diagnostics again.
- Existing V15 page layout and product hierarchy are preserved.

This fixes the suspected hidden diagnostics mount path without changing API, database, auth, Supabase, engines, providers, market logic, AI behavior, scheduler, trading, or recommendations.

## Why This Is Safe

- It changes only the visibility/mount timing of diagnostics children.
- Primary user-facing Home content remains unchanged.
- Diagnostics remain accessible under `Advanced / 進階診斷`.
- Hidden diagnostics no longer run effects or data reads before the user asks for them.
- The shared fix applies consistently to Home, Portfolio, FCN, Risk, Intelligence, Copilot, Watchlist, Notifications, Timeline, Settings, Health, and Beta where the shared panel is used.
- No business logic, calculation logic, persistence, routing, or backend behavior is changed.

## Validation

Required validation:

- `git diff --check`
- `npm run lint`
- `npm run build`

Local browser verification target:

- `/my-ixai/home` should render without mounting bottom diagnostics.
- Opening `Advanced / 進階診斷` should mount diagnostics on demand.
- Route switching should not trigger a diagnostics fan-out while panels remain collapsed.

Production verification target after deploy:

- Home remains open for at least 2 minutes.
- Route switching works:
  - Home -> Portfolio -> FCN -> Risk -> Intelligence -> Copilot -> Settings -> Home
- No `RESULT_CODE_HUNG`.
- No console error storm.
- No failed request storm.
- No repeated route re-render loop.

## Production Verification Checklist

Before marking V15.0.1 complete in production:

- Confirm authenticated production session reaches true Workspace Home, not account gate.
- Open `/my-ixai/home` and wait 2 minutes.
- Confirm bottom diagnostics remain collapsed.
- Confirm hidden diagnostics do not trigger visible request storms before opening.
- Open diagnostics once and confirm content appears on demand.
- Close diagnostics and confirm page remains responsive.
- Switch through key Workspace routes and return Home.
- Monitor Chrome Task Manager / performance where possible.
- Confirm no renderer hang, no `Aw, Snap`, and no `RESULT_CODE_HUNG`.

## Out of Scope

This hotfix does not modify:

- API routes
- Database
- Supabase
- Auth logic
- RLS / membership
- Risk engine
- FCN engine
- Portfolio engine
- Market provider behavior
- Morning Brief engine
- AI / LLM behavior
- Scheduler
- Broker / trading / recommendation logic
- V16 planning or product direction
