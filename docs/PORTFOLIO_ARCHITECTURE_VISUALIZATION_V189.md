# v1.89 — Portfolio Architecture Visualization MVP

## Goal

Visualize the IXAI capabilities completed from v1.80 through v1.88 inside the Portfolio Center.

This version does not add a new risk engine, API, database table, market data integration, AI API, broker connection, payment flow, or trading function. It makes the current architecture understandable to users.

## Route

Primary surface:

- `/my-ixai/portfolio`

Portfolio route split remains:

- `/portfolio`: Portfolio Input and product explanation.
- `/my-ixai/portfolio`: Portfolio Center Dashboard / readback / system capability view.

## New UI Section

Section name:

- `IXAI Architecture Map`

Placement:

- Inside Portfolio Center.
- After Portfolio Overview.
- Before Multi-Asset Allocation.

Title:

`IXAI 投資系統架構`

Subtitle:

`目前已啟用的 Portfolio、FCN、Risk、Intelligence 與 Membership 能力。`

Compliance reminder:

`這些模組代表系統能力，並不構成投資建議、交易指令或績效承諾。`

## Layers

### Layer 1 — Portfolio Layer

Shows:

- Portfolio Foundation.
- Multi-Asset Foundation.
- FCN Foundation.
- Portfolio Dashboard.

### Layer 2 — Risk & Intelligence Layer

Shows:

- Worst-of Engine.
- FCN Risk Engine.
- FCN Intelligence Layer.
- Portfolio Intelligence Dashboard.

### Layer 3 — Membership Layer

Shows:

- Free.
- Basic.
- Pro.
- Entitlement Guard.

### Readback Layer

Shows:

- Portfolio Readback.
- Risk Dashboard.
- Intelligence Dashboard.
- Multi-Asset Dashboard.

### Future Boundaries

Shows as `Coming Soon`:

- Broker Integration.
- Market Data API.
- Payment / Billing.
- AI Advisory Agent.

## Status Vocabulary

Architecture Map uses three statuses:

- `Enabled`
- `MVP`
- `Coming Soon`

These labels describe system capability state, not investment quality or product performance.

## Files Changed

New component:

- `components/portfolio/portfolio-architecture-map.tsx`

Updated component:

- `components/portfolio/portfolio-center-dashboard.tsx`

## Mobile Rules

The map is mobile-first:

- Single-column on mobile.
- Two-column on tablet.
- Four-column capability cards on wide desktop where space allows.
- No tables.
- No fixed-width content.
- No horizontal overflow.

Target checks:

- 375px mobile.
- 768px tablet.
- Desktop width.

## Out of Scope

- No migration.
- No Supabase schema change.
- No auth change.
- No membership / entitlement logic change.
- No AI API.
- No market data API.
- No broker integration.
- No trading function.
- No Daily / Weekly / Social Pack / LINE changes.
- No payment / billing.

## Next

Next version can be selected by business priority:

- v1.90 Portfolio Input v2.
- v1.90 Billing Foundation.

Do not start either until Portfolio Center visualization is validated on mobile and production.
