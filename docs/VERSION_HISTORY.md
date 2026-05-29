# IXAI Version History

This document is a concise continuity layer for AI handoff. It captures why each recent version existed, what changed, key decisions, and what stayed out of scope.

## v1.40.0 — Onboarding Foundation

Why:

- IXAI needed to start remembering user intent instead of acting like a static content site.

What Changed:

- Added `/welcome` and `/onboarding`.
- Built investor profile steps for markets, style, risk preference, intelligence interests, watchlist seed, and LINE entry.
- Added onboarding state model and local/session-first structure.

Key Decisions:

- Onboarding is intelligence activation, not a generic signup wizard.
- Persistence remains future-ready but not overbuilt.

Out of Scope:

- Stripe.
- Portfolio DB.
- Advanced AI agent.
- LINE auth rewrite.

## v1.40.1 — Intelligence Delivery Foundation

Why:

- IXAI needed a daily habit loop and a clear future delivery model.

What Changed:

- Added intelligence delivery architecture foundation.
- Added Morning Intelligence, delivery preference, and LINE readiness surfaces.
- Established Public / Preview / Pro delivery tier structure.

Key Decisions:

- Delivery is opt-in future architecture.
- Public delivery remains generalized and educational.
- Pro delivery will be personalized later.

Out of Scope:

- Real LINE push automation.
- Notification scheduler.
- Portfolio-specific alerts.

## v1.40.2a — Intelligence Landing System

Why:

- The root page felt too much like an entry gate and not enough like an AI investment intelligence product.

What Changed:

- Rebuilt `/` as a public intelligence landing surface.
- Added product positioning, intelligence preview cards, delivery concept, and onboarding CTA.

Key Decisions:

- New users should understand IXAI before being asked to create an account.
- Landing is an acquisition and education surface.

Out of Scope:

- Dynamic OG.
- Share routes.
- Real intelligence engine rewrite.
- Stripe / Pro backend.

## v1.40.2b — UX Cohesion Pass

Why:

- Landing, onboarding, account, Pro, LINE, and preview surfaces felt like separate pages instead of one product.

What Changed:

- Aligned narrative, CTA language, section rhythm, and mobile hierarchy across the main product surfaces.
- Reinforced Public → Preview → Onboarding → Workspace → Future Pro language.

Key Decisions:

- UX should feel like one AI-native investment intelligence product.
- LINE consultation and LINE intelligence delivery must remain distinct.

Out of Scope:

- Backend infrastructure.
- Stripe.
- Dynamic share system.
- Portfolio DB.

## v1.40.2c — Share Intelligence Foundation

Why:

- Shared IXAI links needed intelligence continuity instead of generic previews.

What Changed:

- Added `/share`.
- Added `/share/intelligence/[slug]` static share routes.
- Added reusable share intelligence cards and share CTA flow.

Key Decisions:

- Share routes are acquisition surfaces.
- Shared content should lead to onboarding and preview without implying investment advice.

Out of Scope:

- Dynamic image generation.
- AI content generation engine.
- LINE push.
- Portfolio Intelligence.

## v1.40.2d — Product Flow Audit

Why:

- IXAI had grown complex, with too many CTA paths and unclear page roles.

What Changed:

- Added `docs/product-flow-audit-v1.40.2d.md`.
- Mapped page purpose, CTA overload, user journeys, and simplification strategy.

Key Decisions:

- The real core flow should be Landing → Onboarding → Account → Future Pro Interest.
- `/share` and `/pro-intelligence` should not be main user-flow destinations.

Out of Scope:

- Code changes.
- Route deletion.
- Navigation overhaul.

## v1.40.2e — Product Flow Simplification

Why:

- The audit showed onboarding and Pro CTAs were pulling users away from the main activation path.

What Changed:

- Onboarding completion now routes to `/account`.
- Sidebar `IXAI Pro` points to `/pro`.
- Homepage CTA count was reduced.
- `/pro` hero was simplified.
- `/pro-preview` and `/pro-intelligence` gained clearer exits back to `/account`.
- Removed unused first-visit banner.

Key Decisions:

- Account is the current AI Intelligence Workspace.
- Pro Preview is secondary context, not the default next step.

Out of Scope:

- Auth architecture.
- Share architecture.
- Pro backend.
- LINE Login / LIFF.

## v1.40.2f — Public Intelligence Access Layer

Why:

- Users clicking Daily or Weekly links from LINE/social should see content before account creation.

What Changed:

- Daily Brief, Weekly Intelligence, and Share Intelligence became publicly readable before login.
- Added `PublicIntelligenceCta` footer for content-to-onboarding conversion.
- Added public intelligence positioning labels.
- Added public intelligence view and CTA analytics events.

Key Decisions:

- Public Intelligence builds trust first.
- Account / Pro / Admin remain protected or gated.

Out of Scope:

- Stripe.
- LINE push.
- Portfolio DB.
- Supabase schema changes.
- Large UI redesign.

## v1.40.3 — Public Intelligence Engine

Why:

- IXAI needed to move beyond public readable content into a structured public intelligence engine.
- Public users should understand IXAI's market interpretation framework before entering account or Pro workflows.

What Changed:

- Added Public Intelligence Engine foundation.
- Introduced public-safe modules for Market Pulse, Macro Watch, AI / Tech Watch, Crypto Watch, FCN Awareness, and Risk Regime.
- Strengthened Daily / Weekly / Share Intelligence continuity into onboarding and account flows.
- Clarified that public intelligence is general market awareness and education, not personalized advice.

Key Decisions:

- Public Intelligence should become more useful before deeper account or Pro workflows are requested.
- Public modules remain educational, risk-aware, and non-personalized.
- FCN content remains awareness and education only unless future Pro workflows are explicitly approved.

Out of Scope:

- Supabase schema changes.
- Market/news provider pipeline rewrite.
- LINE push automation.
- Portfolio DB.
- Stripe / paid entitlement.
- Personalized portfolio or FCN risk conclusions.
- Buy/sell recommendations.
- Automated trading.
