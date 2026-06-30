# Translation Maintenance Batch 1

Review date: 2026-07-01

## Background

V13 Sprint 1 through Sprint 4 established the i18n foundation, region / currency localization, primary visible translation coverage, and authenticated Portfolio readback translation repair. Production signed-in review still found English copy across deeper authenticated Workspace routes, so translation work moves into focused maintenance batches instead of adding more V13 Sprints.

Batch 1 scanned all major authenticated Workspace routes, documented remaining English UI, and repaired low-risk dictionary wiring where the display layer could be changed without touching product logic.

## Scope

Scanned routes:

- `/my-ixai/home`
- `/my-ixai/portfolio`
- `/my-ixai/input`
- `/my-ixai/watchlist`
- `/my-ixai/notifications`
- `/my-ixai/timeline`
- `/my-ixai/copilot`
- `/my-ixai/health`
- `/my-ixai/beta`
- `/my-ixai/risk`
- `/my-ixai/fcn`
- `/my-ixai/intelligence`
- `/my-ixai/settings`

Out of scope:

- Auth, API, Supabase, schema, migrations, RLS, billing, broker, trading, scheduler, notification delivery, AI providers, valuation engine, risk engine, FCN engine, and recommendation logic.
- Engine output contract changes. Engine values should be localized at UI display mapping only.

## Fix Summary

Batch 1 added easy dictionary wiring for:

- Watchlist summary card headings, metrics, source status, quote status, readiness, and actions.
- Notification Center summary headings, metrics, delivery readiness, empty states, error states, and actions.
- Timeline summary headings, group labels, empty states, and actions.
- Copilot summary safe shell headings, fallback copy, disclaimer, and actions.
- Stock / Crypto input form labels, section titles, review labels, and submit actions.
- Input Review status label.
- FCN live underlying card display labels for current price and timestamp.

## Audit Inventory

| Route | Remaining English | Priority | Likely Component | Recommended Fix | Status |
| --- | --- | --- | --- | --- | --- |
| `/my-ixai/home` | Possible source names, provider identifiers, and engine-generated Morning Brief / market status details. | Medium | `app/my-ixai/home/page.tsx`, Workspace Home cards | Continue UI display mapping for provider/source output. | Audited |
| `/my-ixai/portfolio` | Financial abbreviations such as `P/L %`, source identifiers, and any engine warning strings from valuation / truth readback. | Medium | `components/portfolio/*`, Workspace market status cards | Keep abbreviations where product-accepted; map source and warning output through display labels. | Audited |
| `/my-ixai/input` | Asset Input Hub card copy, FCN wizard deep fields, success/error toast text, and some source names remain English. | High | `components/portfolio/asset-input-hub.tsx`, `components/portfolio/fcn-input-wizard.tsx`, stock/crypto forms | Extend `portfolio` namespace to Asset Input Hub, FCN Wizard, validation messages, and toasts. | Partially fixed |
| `/my-ixai/watchlist` | Watchlist manager / deep edit form labels, source identifiers, teaser fallback values, and individual item titles may remain English. | High | `components/watchlist/watchlist-summary.tsx`, Watchlist manager components | Continue dictionary wiring for manager tables, edit forms, badges, empty states, and item metadata. | Partially fixed |
| `/my-ixai/notifications` | Notification title / message / category / source engine text and delivery summary output can remain English because it is generated readback. | High | `components/notifications/notification-center-summary.tsx`, notification engines | Add display mapping for category, severity, source engine, and generated delivery summary. | Partially fixed |
| `/my-ixai/timeline` | Event title, event type, event description, source labels, and day suffix output remain English. | Medium | `components/workspace/workspace-timeline-summary.tsx`, timeline engine | Map event type and source values; decide whether authored event titles/descriptions are content or UI. | Partially fixed |
| `/my-ixai/copilot` | Refreshed Copilot capability/source identifiers and generated explanation output can remain English. | High | `components/copilot/workspace-copilot-summary.tsx`, `src/lib/copilot/*` | Map capability/source IDs and safe explanation labels at UI layer; do not alter explain-only engine behavior. | Partially fixed |
| `/my-ixai/health` | Diagnostics source IDs and technical readiness output can remain English. | Medium | `components/workspace/*status*.tsx`, health cards | Add diagnostic-source display mapping; keep technical IDs visible only where helpful. | Audited |
| `/my-ixai/beta` | Release-governance terms, technical limitation labels, and source labels may remain English. | Low | Beta dashboard components | Translate user-facing Beta labels; keep formal version identifiers unchanged. | Audited |
| `/my-ixai/risk` | `Foundation Score`, `Total Holdings`, `Portfolio Truth Status`, `Global Risk Overview`, `Concentration Risk`, `Warnings`, `Partial Sources`, `Unavailable`, and risk card labels. | High | `components/risk/global-risk-center-workspace.tsx`, `risk-engine-summary.tsx`, `live-risk-adapter-card.tsx`, `legacy-risk-engine-status.tsx` | Next batch should prioritize Risk Center dictionary migration and risk display-label mapping. | Pending |
| `/my-ixai/fcn` | `Readback Error`, `Loading`, `Enabled`, `Sign In Required`, lifecycle labels, event labels, filter labels, summary metrics, current price overlays, manual price labels, and FCN risk summaries. | High | `components/fcn/fcn-center-workspace.tsx`, `fcn-risk-summary.tsx`, `fcn-schedule-summary.tsx`, `live-fcn-underlying-status-card.tsx` | Next batch should translate FCN center chrome, lifecycle/status labels, schedule cards, tables, and badges. | Partially fixed |
| `/my-ixai/intelligence` | `Needs Review`, `Partial`, `Readiness`, `Ready`, `FCN Highlights`, `Stock Positions`, `Crypto Positions`, `Truth Assets`, `Source Status`, and suggested flow labels. | High | `components/intelligence/intelligence-center-workspace.tsx`, V14 intelligence summary cards | Next batch should map intelligence status labels, suggested flow labels, metric labels, and source output. | Pending |
| `/my-ixai/settings` | Some diagnostics component source IDs, runtime diagnostics labels, and technical status output may remain English. | Medium | Settings page and `components/workspace/*status*.tsx` | Translate visible diagnostics labels while preserving technical source IDs where useful for support. | Audited |

## Remaining English By Route

- High user impact: `/my-ixai/risk`, `/my-ixai/fcn`, `/my-ixai/intelligence`, `/my-ixai/input`, `/my-ixai/watchlist`, `/my-ixai/notifications`, `/my-ixai/copilot`.
- Medium user impact: `/my-ixai/timeline`, `/my-ixai/settings`, `/my-ixai/portfolio`, `/my-ixai/home`, `/my-ixai/health`.
- Low user impact: `/my-ixai/beta`.

## Recommended Next Batch

Translation Maintenance Batch 2 should prioritize:

1. `/my-ixai/risk` because it is a core workspace decision-support page and still contains many visible labels.
2. `/my-ixai/fcn` because FCN monitoring is central to IXAI and has many table, badge, lifecycle, and schedule labels.
3. `/my-ixai/intelligence` because it is a primary Workspace interpretation surface and has many status and metric labels.
4. `/my-ixai/input` FCN Wizard and Asset Input Hub because it affects onboarding and first data entry.
5. `/my-ixai/watchlist` and `/my-ixai/notifications` deep manager states after the summary cards.

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

