# IXAI Roadmap

This document is the high-level product continuity layer for IXAI. It should help future AI agents understand what comes next without re-litigating the whole product direction.

## Current Version

`v1.40.6c`

## Current Product Flow

```text
Landing
→ Onboarding
→ Account
→ Future Pro Interest
```

Public intelligence acquisition flow:

```text
LINE / Social / Share
→ Daily / Weekly / Share Intelligence
→ Onboarding
→ Account
→ Personal Intelligence
```

## Current Product Positioning

### Public Intelligence

Purpose:

- Acquisition.
- Trust building.
- Daily habit.
- Public market education and awareness.

Includes:

- Daily Brief.
- Weekly Intelligence.
- Share Intelligence.
- Public landing.
- General market awareness.
- Public Intelligence Engine modules.

Does not include:

- Personalized portfolio analysis.
- Personal FCN risk monitoring.
- Buy / sell recommendations.

### Account Intelligence

Purpose:

- Watchlist Intelligence Lite.
- Identity continuity.
- Preference memory.
- LINE readiness.

Current status:

- Account is the AI Intelligence Workspace.
- Onboarding state is local/session-first.
- Watchlist Intelligence Lite surfaces onboarding seed, markets, and interests as lightweight market memory.
- LINE Delivery Foundation provides readiness-only delivery preferences, opt-in / pause / unsubscribe concepts, and Public / Account / Future Pro delivery separation.

### Pro Intelligence

Purpose:

- Future Portfolio Intelligence.
- Risk Intelligence.
- AI Alerts.
- Personal market memory.
- FCN risk workflow.

Current status:

- `/pro` is the conversion surface.
- `/pro-preview` is sample-only preview.
- `/pro-intelligence` is future gated shell.
- No Stripe or paid entitlement is live yet.

## Current Product Capabilities

### v1.40.3 — Public Intelligence Engine

Completed foundation:

- Daily Intelligence Upgrade.
- Weekly Intelligence Upgrade.
- Market Pulse.
- Macro Watch.
- AI / Tech Watch.
- Crypto Watch.
- FCN Awareness.
- Risk Regime.

Principle:

Public Intelligence should become more useful before IXAI asks users to create deeper personal or Pro workflows.

### v1.40.3a — Public Intelligence Engine Polish

Completed:

- Public Intelligence disclaimer layer.
- Mobile UX polish.
- CTA hierarchy audit.
- Compliance review.
- Public-to-Account narrative alignment.
- Risk Regime explanatory layer.

### v1.40.3b — Public Route Gate Hydration Fix

Completed:

- Fixed public route gate / hydration behavior for Public Intelligence routes.
- Preserved public readability for Landing, Daily Brief, Weekly Brief, and Share Intelligence.
- Preserved protected access boundaries for Account, Admin, and Pro Intelligence.

### v1.40.4 — Watchlist Intelligence Lite

Completed:

- Account Intelligence Workspace now surfaces onboarding watchlist seed.
- Added lightweight intelligence memory for selected markets, symbols, and interests.
- Mapped user interests to Public Intelligence modules.
- Preserved local/session-first model and non-advisory positioning.

### v1.40.5 — LINE Delivery Foundation

Completed:

- Added LINE delivery readiness foundation.
- Added local/session-first delivery preference model.
- Added opt-in / pause / unsubscribe concept.
- Clarified Public / Account / Future Pro delivery separation.
- Kept real push automation out of scope.

### v1.40.5a — Mobile Visual QA Readiness

Completed:

- Added mobile visual QA readiness.
- Added 390px route smoke checks.
- Verified Public Intelligence, Watchlist Intelligence Lite, and LINE Delivery Foundation mobile behavior at smoke-test level.
- Preserved product architecture and protected systems.

### v1.40.6 — Social Intelligence Engine

Completed:

- Added Daily / Weekly Social Pack foundation.
- Added 9:16 social story template preview.
- Added social caption drafts.
- Supported manual FB / IG / LINE publishing workflow.
- Preserved human review and avoided auto publishing.

### v1.40.6a — Social Pack Brand Asset Integration

Completed:

- Integrated official brand identity into Social Pack templates.
- Added reusable brand tokens.
- Added institutional research visual language.
- Standardized footer, disclaimer, and logo placement.

### v1.40.6b — Social Pack PNG Export

Completed:

- Added PNG export capability.
- Added download-ready social assets.
- Preserved brand identity and disclaimer layer.
- Removed dependency on manual screenshots.

### v1.40.6c — Social Pack Layout Redesign

Completed:

- Reduced visual clutter.
- Improved mobile readability.
- Added institutional research presentation style.
- Optimized content hierarchy.

## Next Suggested Version

`v1.40.7 — Publish Center Foundation`

Goal:

- Prepare approved Social Packs for publication workflow.
- Create approval-ready publishing queue.
- Keep human approval before publishing.
- Do not auto-publish.

## Future Roadmap

### v1.41 — Portfolio Intelligence


Goal:

- Establish future portfolio onboarding and relevance model.
- Keep it informational and risk-aware.
- Do not implement broker integration or automated trading.
- Before v1.41, mobile QA should remain part of done criteria for Account and Pro surfaces.

### v1.42 — AI Alert Engine

Goal:

- Design event-driven alert architecture.
- Separate public alerts from Pro personalized alerts.
- Require user opt-in and safe delivery controls.

### Dynamic Intelligence Provider Integration

Goal:

- Connect foundation-level public modules to approved provider data.
- Preserve Public / Account / Pro separation.

### Durable Preference Persistence

Goal:

- Move local/session-first preferences to durable persistence only after explicit approval.
- Include auditability, opt-in records, pause/unsubscribe state, and delivery logs.

## Do Not Touch Without Explicit Approval

- LINE Login architecture.
- LIFF architecture.
- Auth architecture.
- Lightweight identity session cookie model.
- FCN engine and calculations.
- Market provider layer.
- News provider / RSS ingestion core.
- Supabase core auth.
- Supabase schema.
- Analytics core schema.
- Editorial publish / review workflow.
- Admin route protection.

## Current Strategic Focus

IXAI is in seed-user acquisition mode.

Focus:

- Public intelligence quality.
- Daily and weekly reading habit.
- LINE and social distribution.
- Onboarding conversion.
- Account intelligence continuity.

Not focus:

- Paid ads.
- Aggressive monetization.
- Stripe checkout.
- Portfolio execution.
- Buy/sell signal products.
