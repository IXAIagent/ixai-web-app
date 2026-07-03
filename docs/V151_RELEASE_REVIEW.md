# V15.1 Product Polish Release Review

Date: 2026-07-03

## Executive Summary

Release recommendation: Nearly Ready.

V15.1 successfully moves the Workspace product surface closer to an externally usable AI Wealth Workspace. The main product hierarchy is clearer, Home no longer duplicates the full Morning Brief, Morning Brief has a stronger full-report structure, Portfolio and Notifications have more useful empty states, and new polish copy is dictionary-backed through `productPolish`.

The release is not marked fully Ready because a few long-tail engineering terms remain in secondary / legacy surfaces and metadata. They do not block the V15.1 polish release, but they should be cleaned in V15.1.1 or the next copy QA pass.

## UX Score

| Surface | Score | Review |
| --- | ---: | --- |
| Home | 8.5 / 10 | Home is now correctly summary-only for Morning Brief and keeps dashboard hierarchy focused on work priority. |
| Portfolio | 8 / 10 | First screen emphasizes total assets, today's performance, allocation, holdings, and actionable empty state. Some deeper diagnostic cards still carry older technical labels. |
| Morning Brief | 8.5 / 10 | Full report route is clear and report cards now prioritize daily summary, portfolio, risk / FCN, market / alerts, and next actions. |
| Risk | 7.5 / 10 | First-screen language is product-oriented, but some source-status logic and deeper legacy cards still contain technical vocabulary. |
| Intelligence | 7.5 / 10 | Better user-facing summary and advanced information language. Still has some source/readiness wording in secondary areas. |
| Copilot | 8 / 10 | Safe shell remains intact and copy now avoids graph/runtime language in the primary experience. Manual summary internals still expose source-engine text in secondary cards. |
| Notifications | 8.5 / 10 | Priority groups are much clearer: Today, Important, Completed, History. Empty state has a next action. |

## Copywriting Review

Completed:

- New V15.1 copy is dictionary-backed via `productPolish`.
- Default diagnostics language changed to `Advanced / 進階資訊`.
- Home, Morning Brief, Portfolio, Notifications, Copilot, Risk, and Intelligence no longer lead with provider / runtime / graph / source / diagnostics language in primary copy.
- Morning Brief primary report cards use user-facing `資料狀態` instead of raw source labels.

Remaining copy risks:

- Some legacy or secondary components still contain `readback`, `source`, `provider`, `partial`, or `diagnostics`.
- Route metadata for Watchlist / Notifications still mentions readback or quote status.
- Older FCN / Risk / Intelligence legacy components still contain technical language, mostly outside the V15.1 primary changed surfaces.

Assessment:

- P0 copywriting objective is satisfied for the V15.1 changed primary surfaces.
- Full-site technical-language cleanup remains a follow-up maintenance task.

## Morning Brief Review

Passed:

- Home only shows Morning Brief Summary.
- `/my-ixai/morning-brief` is the full report route.
- The report structure now surfaces:
  - 今日摘要.
  - 我的資產.
  - 風險.
  - FCN.
  - 市場與提醒.
  - 下一步行動.
- Full report generation remains manual / on-demand.

Notes:

- The underlying Morning Brief engine contract was not changed.
- Home remains summary-only and does not auto-run the full report.

## Portfolio Review

Passed:

- Portfolio uses `WorkspaceEmptyState` when no asset data exists.
- CTA points users to asset input.
- First screen prioritizes total assets, today performance, allocation, holdings summary, and data status.
- Advanced valuation / persistence details remain in the collapsed advanced information panel.

Remaining issue:

- Some lower-level Portfolio diagnostic cards still use older source/persistence terms. This is acceptable for advanced areas but should be softened later.

## Notifications Review

Passed:

- Notifications are grouped by:
  - Today.
  - Important.
  - Completed.
  - History.
- Empty state is actionable and points users to Watchlist monitoring.
- Delivery readiness remains in advanced information.

Remaining issue:

- Delivery readiness copy still references channel state in technical-ish terms, but not in first-screen primary content.

## Design Consistency

Passed:

- Hero: consistent with Workspace product hero system.
- KPI: uses `WorkspaceKpiGrid`.
- Section: uses `WorkspaceProductSection`.
- Empty State: new `WorkspaceEmptyState` added and applied to Portfolio / Notifications.
- Diagnostics: shared `WorkspaceDiagnosticsPanel` default wording now uses advanced information language.
- CTA: primary CTAs are explicit and action-oriented.

Remaining issue:

- A few older page-specific cards still have their own card styling and copy conventions. This is P2 design-system polish, not a release blocker.

## Empty State Review

Passed:

- Portfolio empty state explains what to do next and links to asset input.
- Notifications empty state explains what will appear and links to Watchlist.

Needs follow-up:

- Watchlist, Timeline, Copilot history, FCN, Risk, and Intelligence should receive the same `WorkspaceEmptyState` treatment in a later V15.1.1 polish pass.

## Outstanding Issues

### P0

None found.

### P1

- Long-tail technical copy remains in secondary / legacy surfaces, especially old FCN, Risk, Intelligence, and metadata descriptions.
- Some secondary Copilot summary cards still expose source-engine style text.
- Full authenticated visual QA on production should still confirm that no primary first-screen surfaces show engineering terms.

### P2

- Extend `WorkspaceEmptyState` to Watchlist, Timeline, FCN, Risk, Intelligence, and Copilot history.
- Continue dictionary migration for remaining V15 primary page hard-coded labels.
- Polish older diagnostic card styling so advanced areas feel less like internal tooling.

## Release Recommendation

Nearly Ready.

V15.1 is suitable for a preview / staging release and manual authenticated Workspace QA. It should not be considered fully polished for broad external launch until P1 copy QA is completed on production screenshots, but no P0 blocker was found in the changed surfaces.

## Validation Checklist

Required validation:

- `git diff --check`.
- `npm run lint`.
- `npm run build`.

Product verification checklist:

- Home shows Morning Brief Summary only.
- `/my-ixai/morning-brief` shows the full report.
- Portfolio empty state uses `WorkspaceEmptyState`.
- Notifications show Today / Important / Completed / History.
- Advanced information remains collapsed.
- No API, DB, Auth, AI, Workspace Graph, Provider, Trading, or Recommendation behavior changed.
