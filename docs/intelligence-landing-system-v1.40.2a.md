# IXAI v1.40.2a — Intelligence Landing System

This document describes the public landing system for `app.ixuan.ai`.

## Why Root Should Be Public Landing First

The root route is the first trust moment for a new user.

Before v1.40.2a, the app entry could feel like a login or account gate. That created friction because new users did not yet understand:

- what IXAI is
- why an account matters
- what intelligence value they get first
- how onboarding, LINE, Pro preview, and delivery connect

The root route now explains IXAI as an AI-native investment intelligence platform before asking the user to create an account or continue to onboarding.

## Product Positioning

IXAI is not:

- a broker
- an automated trading tool
- a signal-selling product
- a registered investment advisory surface
- a generic news site

IXAI is:

- an AI-native investment intelligence platform
- a market intelligence layer
- a watchlist memory foundation
- an FCN risk awareness surface
- a portfolio relevance foundation
- a LINE intelligence delivery layer

The landing headline is:

```text
讓 AI 開始理解你的投資世界
```

## Landing Role In Acquisition

The landing page should do three jobs:

1. Establish trust and product clarity.
2. Demonstrate sample intelligence value before login.
3. Route the user into onboarding, Pro preview, or LINE consultation.

Primary path:

```text
/ → /welcome → /onboarding → delivery preferences / account / Pro preview
```

Secondary path:

```text
/ → /pro-preview
```

LINE path:

```text
/ → LINE Official Account consultation URL
```

## Relationship To Onboarding And Delivery

The landing page introduces the same product language used by v1.40.0 and v1.40.1:

- investor profile
- watchlist seed
- intelligence preferences
- Morning Intelligence
- LINE delivery readiness
- Public / Preview / Pro delivery separation

It does not start real push automation. It only explains the delivery concept and routes users to onboarding or LINE.

## Share Layer

The landing page reserves product language for a future share layer but does not implement:

- dynamic OG
- `/share/*`
- article-specific social cards
- campaign landing variants

Those should come after the public landing and onboarding path are stable.

## Analytics

v1.40.2a adds typed events:

- `landing_view`
- `landing_primary_cta_click`
- `landing_preview_click`
- `landing_line_cta_click`
- `intelligence_landing_preview_view`

Events must not include raw user identity.

## Boundaries

This phase does not change:

- LINE Login / LIFF architecture.
- LINE push delivery.
- Stripe or billing.
- Pro backend.
- Supabase schema.
- FCN engine.
- Market/news providers.
- Dynamic OG or share routes.
