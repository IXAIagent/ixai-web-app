# v1.88 — Portfolio Center UI MVP

## Goal

Turn the v1.82-v1.87 portfolio, FCN risk, intelligence, membership, and multi-asset foundation fields into the first visible Portfolio Center dashboard.

v1.88 does not create a new engine. It makes the existing App-owned dashboard summary readable from a dedicated user control surface.

## Route Strategy

- `/portfolio` remains the Portfolio Input and product explanation surface.
- `/my-ixai/portfolio` is the Portfolio Center Dashboard / readback surface.

This separation keeps asset creation and portfolio monitoring from competing on the same page.

## What Changed

New page:

- `app/my-ixai/portfolio/page.tsx`

New component:

- `components/portfolio/portfolio-center-dashboard.tsx`

Navigation:

- Desktop sidebar adds `Portfolio Center` under the personal / 我的 IXAI area.
- Mobile drawer adds `Portfolio Center` under the IXAI section.
- Mobile bottom nav treats `/my-ixai` as part of the `我的` active area.

## Existing Data Used

v1.88 uses only the existing dashboard readback path:

- `/api/portfolio/dashboard`
- `PortfolioDashboardSummary`
- `src/lib/portfolio/dashboard.ts`

No new API route is added.

## Dashboard Sections

### Portfolio Overview

Displays:

- Portfolio Health Score.
- Portfolio Risk Score.
- Portfolio Status.
- Membership Tier.

### Multi-Asset Allocation

Displays v1.87 fields:

- `assetAllocationSummary`
- `assetCategoryCounts`
- `portfolioAssetCategories`

Supported categories:

- FCN
- STOCK
- CRYPTO
- GRID
- DUAL
- CASH

### FCN Risk Dashboard

Displays v1.82 / v1.83 fields:

- Near KI Count.
- Worst-of Ranking Top 5.
- Concentration Exposure Top 5.
- FCN risk narrative.

### Portfolio Intelligence

Displays v1.84 / v1.85 fields:

- Monitoring Highlights.
- Risk Narrative.
- Worst-of Narrative.
- Concentration Narrative.
- Near-KI Narrative.

### Membership Status

Displays v1.86 fields:

- Current Plan.
- Available Features.
- Pro access status.
- Placeholder CTA: `Upgrade flow coming soon`.

No billing or payment flow is added.

## Mobile Requirements

Portfolio Center is mobile-first:

- Dashboard cards collapse to a single column on mobile.
- Ranking sections are stacked cards, not tables.
- Asset allocation uses compact category cards.
- Membership status uses a single-column card flow on mobile.
- CTA is full-width on mobile and does not overflow.
- Sidebar remains desktop-only and does not cover mobile content.

Target widths:

- 375px mobile.
- 768px tablet.
- 1280px desktop.

## Compliance Boundary

Portfolio Center is for asset organization, monitoring, and risk-awareness reading only.

It must not provide:

- Personalized investment advice.
- Trading instructions.
- Target prices.
- Return promises.
- Automated trading.
- Broker execution.

Footer copy:

`本頁僅用於資產整理、風險監控與資訊閱讀，不構成投資建議、買賣建議、目標價、報酬承諾或自動交易。`

## Out of Scope

- No migration.
- No Supabase schema change.
- No auth change.
- No membership / entitlement logic change.
- No market data API.
- No broker integration.
- No AI API.
- No Daily / Weekly / Social Pack changes.
- No LINE changes.
- No payment.
- No trading function.

## Validation

Required:

- `git diff --check`
- `npm run lint`
- `npm run build`

Responsive audit:

- `/my-ixai/portfolio` at 375px.
- `/my-ixai/portfolio` at 768px.
- `/my-ixai/portfolio` at desktop width.

## Next

- v1.89 Portfolio Center QA / Mobile Polish.
- Or v1.90 Billing Foundation, only after membership / entitlement and Portfolio Center UX are stable.
