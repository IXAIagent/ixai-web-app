# v1.37.4 Gated Intelligence Foundation

## Purpose

IXAI now separates public intelligence, sample preview surfaces, future Pro intelligence, and internal admin operations.

This phase does not add Stripe, checkout, payment state, or a new auth/session architecture. It creates the access-control vocabulary and UI layer that future paid intelligence modules can plug into.

## Route Hierarchy

- `/pro` is the public conversion surface.
- `/pro-preview` is a sample-only Pro showcase.
- `/pro-intelligence` is the future gated intelligence route.
- `/admin` remains the internal operating console.
- Public routes remain Daily Brief, Weekly Intelligence, Market, FCN education, and related public content.

## Access Model

The shared access layer lives in:

- `src/lib/intelligence/access.ts`

Current surfaces:

- `public_daily`
- `public_weekly`
- `market_overview`
- `fcn_education`
- `pro_preview`
- `pro_portfolio`
- `pro_fcn_risk`
- `pro_ai_alerts`
- `pro_watchlist`
- `pro_macro_intelligence`

Rules:

- Public surfaces are always readable.
- `pro_preview` is readable but sample-only.
- `pro_*` surfaces are gated by default.
- `enterprise` is reserved for future advisor-grade access.
- UI components should ask the access layer instead of hardcoding access rules.

## UI Components

Reusable Pro access UI lives in:

- `components/pro/gated-surface.tsx`
- `components/pro/gated-overlay.tsx`
- `components/pro/pro-lock-card.tsx`
- `components/pro/preview-badge.tsx`
- `components/pro/upgrade-intelligence-cta.tsx`

The intended tone is institutional and calm. The gated layer should explain that the surface belongs to IXAI Pro Intelligence without implying guaranteed returns, signals, or investment advice.

## Analytics

New typed events:

- `gated_surface_view`
- `gated_upgrade_click`
- `pro_intelligence_open`
- `preview_badge_view`

Payloads should remain non-sensitive:

- `surface`
- `membership`
- `source`

Do not send email, tokens, cookies, or raw account identifiers.

## Admin Visibility

`components/admin/pro-readiness-snapshot.tsx` aggregates existing signals from:

- membership snapshot
- audience graph
- analytics snapshot

It shows readiness indicators such as Pro waitlist count, Pro candidates, returning readers, high engagement users, LINE connected users, Pro preview opens, and upgrade CTA clicks. It does not expose raw emails or event rows.

## Why No Stripe Yet

IXAI needs entitlement-aware product architecture before payment activation. This keeps the product able to:

- test conversion surfaces
- measure Pro demand
- refine Pro messaging
- prepare gated intelligence surfaces
- avoid premature billing complexity

Stripe can later map subscription status into the existing membership and access layers.

## Future Path

Next steps may include:

- Supabase-auth-backed membership lookup
- Stripe subscription status sync
- Pro dashboard entitlement checks
- advisor-grade enterprise roles
- portfolio and FCN user-data upload flows
- audit logs for Pro intelligence access

Until then, `/pro-intelligence` remains a locked sample shell with a clear upgrade path.
