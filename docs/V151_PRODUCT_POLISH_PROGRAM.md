# V15.1 Product Polish Program

Date: 2026-07-03

## Objective

V15.1 moves IXAI Workspace from feature-complete to externally usable product experience.

This program does not add core functionality. It refines copywriting, information hierarchy, empty states, Morning Brief structure, and shared design language while preserving all existing backend and engine boundaries.

## Scope

### Wave 1 — Copywriting Unification

Status: completed in this pass.

- Added `productPolish` dictionary namespace.
- Replaced newly introduced V15.1 visible copy with dictionary-backed labels.
- Changed default diagnostics language to `Advanced / 進階資訊`.
- Reduced first-screen engineering terms such as provider, runtime, graph, readback, source, cache, and diagnostics.

### Wave 2 — Morning Brief 2.0

Status: completed in this pass.

- Kept Home as a summary-only dashboard.
- Kept `/my-ixai/morning-brief` as the full report route.
- Reworked the full report card around:
  - Daily summary.
  - Portfolio.
  - Risk.
  - FCN.
  - Market and alerts.
  - Next actions.
- Removed raw source labels from primary report cards and replaced them with user-facing data status language.

### Wave 3 — Portfolio Experience 2.0

Status: completed in this pass.

- Strengthened first-screen Portfolio language around:
  - Total assets.
  - Today's performance.
  - Allocation.
  - Holdings summary.
  - FCN positions.
- Added a CTA-backed empty state for users without asset data.
- Kept technical valuation and persistence details in the advanced information panel.

### Wave 4 — Notifications Experience

Status: completed in this pass.

- Reworked notifications into user-facing groups:
  - Today.
  - Important.
  - Completed.
  - History.
- Added an actionable empty state that points users toward Watchlist monitoring.
- Kept delivery readiness in advanced information.

### Wave 5 — Empty States and CTA

Status: completed in this pass.

- Added shared `WorkspaceEmptyState`.
- Applied CTA-based empty states to Portfolio and Notifications.
- Empty states now explain what will appear and what the user can do next.

### Wave 6 — Design System Polish

Status: completed in this pass.

- Added a reusable empty-state primitive to the Workspace product component layer.
- Unified advanced information wording through `WorkspaceDiagnosticsPanel`.
- Preserved existing Hero, KPI, Product Section, and Diagnostics layout primitives.

## Safety Boundary

V15.1 does not modify:

- API.
- Database.
- Supabase.
- Auth.
- AI engine.
- Workspace Graph.
- Market provider.
- Trading.
- Recommendation logic.
- Portfolio / Risk / FCN calculations.
- Morning Brief engine internals.

## Validation

Required:

- `git diff --check`.
- `npm run lint`.
- `npm run build`.

Manual verification:

- Home shows Morning Brief summary only.
- `/my-ixai/morning-brief` shows the full report.
- Portfolio empty state has a clear next action.
- Notifications are grouped by user priority.
- Advanced information is collapsed and uses user-facing language.
