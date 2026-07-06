# V18.3 Workspace UX & Beta Polish

Review date: 2026-07-06

## Executive Summary

V18.3 improves Workspace UX consistency and Beta readiness across the V18 product integration layer. It does not add engines, services, AI calls, notification delivery, trading, recommendations, schedulers, database schema, or migrations.

The release focuses on polish across Workspace Home, Portfolio, FCN, Watchlist, Daily Brief, Weekly Brief, and Admin Daily Briefs.

## Scope

Updated surfaces:

- Workspace Home.
- Portfolio.
- FCN.
- Watchlist.
- Daily Brief.
- Weekly Brief.
- Admin Daily Briefs.

Added shared UI primitives:

- `WorkspaceStatusBadge`
- `WorkspaceLoadingCard`
- `WorkspaceLoadingKpi`
- `WorkspaceSkeleton`
- `WorkspaceStateMessage`

## UX Improvements

### Status Language

V18.3 standardizes visible Beta status language:

- Health: `Healthy`, `Warning`, `Critical`, `Unknown`.
- Readiness: `Green`, `Yellow`, `Red`.
- Priority: `Urgent`, `High`, `Normal`, `Low`.

Workspace item cards now use the shared status badge instead of ad-hoc badge styles where V18 intelligence fields are shown.

### Loading State

Shared loading primitives were added for:

- Loading card.
- Loading KPI.
- Skeleton rows.

Home and Watchlist now use the shared loading card for safer, consistent loading messaging.

### Empty / Error State

Shared state message coverage now includes:

- Provider unavailable.
- Fallback active.
- No coverage.
- No data.

Portfolio, FCN, and Watchlist now show more consistent state messages when intelligence coverage is limited or data is unavailable.

### Diagnostics

Diagnostics stay collapsed by default:

- Workspace `WorkspaceDiagnosticsPanel` remains lazy-mounted.
- Daily Brief and Weekly Brief now show a public Beta readiness summary first, with developer diagnostics inside native collapsed details.
- Portfolio / FCN / Watchlist intelligence diagnostics remain inside existing collapsed diagnostics sections.

## Beta Polish

Added Beta readiness signals:

- Beta badge.
- Version / readiness style labels.
- Last updated label.
- Readiness summary.

Applied to:

- Workspace Home intelligence summary.
- Daily Brief hero.
- Weekly Brief hero.
- Admin Daily Briefs header.

## Responsive Improvements

The polish keeps the existing V15/V18 responsive system:

- Cards stay on single-column mobile layouts.
- KPI grids retain existing responsive breakpoints.
- Long diagnostics are hidden behind collapsed panels / details.
- Watchlist, Portfolio, and FCN item cards use wrapping, two-column metadata only from small breakpoints upward.

## Accessibility Improvements

Updated states use:

- Native `<details>` / `<summary>` for public Brief diagnostics.
- `aria-busy` on loading cards and loading KPI primitives.
- Decorative icons marked with `aria-hidden`.
- Native buttons / links remain unchanged.

## Validation Checklist

Required:

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

Manual preview checklist:

- Workspace Home renders Beta/readiness labels and loading state.
- Portfolio renders unified health badges and no-coverage state.
- FCN renders unified health badges and no-data state.
- Watchlist renders unified quote health badges, loading state, and provider-unavailable state.
- Daily / Weekly public diagnostics are collapsed by default.
- Admin Daily Briefs shows Beta/readiness/last updated labels.

## Out of Scope

Not changed:

- Engine logic.
- Service layer.
- API routes.
- Database schema.
- Migrations.
- Auth.
- AI calls.
- Scheduler behavior.
- Telegram / LINE / Email / Push delivery.
- Trading.
- Recommendation.
- Billing.
- Copilot Chat.
- Timeline rewrite.
- Major navigation rewrite.
