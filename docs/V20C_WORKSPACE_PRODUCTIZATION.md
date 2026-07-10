# V20C — Workspace Productization

## Purpose

V20C turns the V20A Intelligence Platform and V20B Alert & Notification Platform into a clearer Workspace product experience.

This version does not create a new engine. It reuses the existing read models and productizes them into pages that help users:

1. Read what matters.
2. Understand why it matters.
3. Prioritize what deserves attention.
4. Explain what is affected.
5. Inspect details only when needed.

## Product Principle

Workspace should not dump everything.

The first layer of each page should answer a user question:

- Home: what matters today?
- Portfolio: how is my money doing?
- FCN: which FCNs need attention?
- Markets: what happened outside my portfolio?
- Risk: what deserves attention?
- Notifications: what requires action or review?

Implementation details stay in Advanced.

## Audit Findings

- Home previously mixed Today Focus, Portfolio, Market, Timeline, FCN, alerts, and diagnostics into separate read paths.
- Portfolio was a strong asset dashboard, but lacked V20A/V20B position health and alert context.
- FCN had useful risk and schedule sections, but the user-facing hierarchy needed clearer FCN alerts, Worst-of, KI/KO, observation, coupon, and coverage sections.
- Markets / Watchlist explained symbols, but needed a shared V20 market intelligence overview and clearer separation from Portfolio.
- Risk already behaved like a decision center, but needed V20B alert integration and a visible split between investment risk and data-quality issues.
- Notifications already used V20B, but needed to read as Open Alerts, Recent Alerts, Resolved, History, Channel Status, and Alert Detail instead of only priority buckets.
- Advanced diagnostics were already collapsed by default through `WorkspaceDiagnosticsPanel`.

## Home Productization

Home now keeps the first layer focused on:

- Today Focus
- Portfolio Health
- Critical Alerts
- FCN Watch
- Market Summary
- Morning Brief Preview

Home reads a single V20B alert snapshot and uses the embedded V20A platform snapshot. This reduces duplicate client-side aggregation and keeps data quality or technical items in Advanced.

## Portfolio Productization

Portfolio remains the asset dashboard and adds:

- Position Health
- Portfolio-related Risk Summary
- V20A/V20B insight cards that answer:
  - What happened
  - Why it matters
  - Inspect

The page continues to show asset classes, allocation, insights, and detailed holdings without adding trading, recommendations, buy / sell / hold language, target prices, or new valuation logic.

## FCN Productization

FCN is framed as a real FCN workspace:

- FCN Summary
- FCN Alerts
- Worst-of Overview
- KI / KO Status
- Observation / Coupon Timeline
- Upcoming Events
- Data Coverage in Advanced

It reuses the existing FCN risk / schedule read models and V20B alert snapshot. No new FCN engine was created.

## Notifications Productization

Notifications now reads as:

- Open Alerts
- Recent Alerts
- Resolved
- History
- Channel Status
- Alert Detail
- Technical Diagnostics under Advanced

External delivery remains disabled. The page is still an in-app preview only.

## Markets Productization

Markets / Watchlist now separates:

- Market Overview
- Relevant Symbols
- Portfolio Exposure
- Market News / Economic Calendar
- Data Freshness and readiness under Advanced

The page explains external events and avoids duplicating Portfolio valuation.

## Risk Productization

Risk keeps the Decision Center model and adds:

- V20B risk alert cards
- Data Quality as a separate user-facing section
- Risk events that point to Notifications for inspection

Engine status and implementation details stay under Advanced.

## Shared UX

V20C adds `WorkspaceInsightCard` as a small shared product primitive for cards that must answer:

- What happened
- Why it matters
- Inspect

Existing shared primitives remain the source for loading, empty, unavailable, fallback, warning, info, success, error, status, and collapsed diagnostics patterns.

## Mobile / Accessibility / Performance Notes

- Main sections use responsive grids and avoid dense tables above the fold.
- Buttons and inspect links use visible focus states.
- Advanced sections remain collapsed by default.
- Home uses one V20B snapshot instead of multiple separate user-facing data reads.
- No client-side notification delivery, AI calls, external provider fetches, or scheduler behavior were added.

## Out of Scope

V20C does not change:

- API contracts
- Database schema
- Migrations
- Auth / RLS
- V20A Intelligence Platform internals
- V20B Alert Platform internals
- Risk Engine
- FCN Engine
- Portfolio Truth
- Market Provider
- Notification Router
- AI model calls
- Scheduler
- Telegram / LINE / Email / Push delivery
- Trading
- Recommendations
- Target prices
- Billing

## Validation Checklist

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`
- `npm run qa:editorial-beta`
