# IXAI Roadmap

This document is the high-level product continuity layer for IXAI. It should help future AI agents understand what comes next without re-litigating the whole product direction.

## Current Version

`v1.40.2f`

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

Does not include:

- Personalized portfolio analysis.
- Personal FCN risk monitoring.
- Buy / sell recommendations.

### Account Intelligence

Purpose:

- Future Watchlist Intelligence Lite.
- Identity continuity.
- Preference memory.
- LINE readiness.

Current status:

- Account is the AI Intelligence Workspace.
- Onboarding state is local/session-first.
- Watchlist and delivery preferences are foundation-level.

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

## Next Version

`v1.40.3 — Public Intelligence Engine`

Goals:

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

## Future Roadmap

### v1.40.4 — Watchlist Intelligence Lite

Goal:

- Turn basic watchlist setup into lightweight intelligence memory.
- Preserve local/session-first model unless persistence is explicitly requested.
- Avoid portfolio-style claims.

### v1.40.5 — LINE Delivery Foundation

Goal:

- Move from LINE readiness to explicit opt-in delivery design.
- Prepare delivery logs, unsubscribe/pause controls, and safe public intelligence templates.
- Do not launch push automation without explicit approval.

### v1.41 — Portfolio Intelligence

Goal:

- Establish future portfolio onboarding and relevance model.
- Keep it informational and risk-aware.
- Do not implement broker integration or automated trading.

### v1.42 — AI Alert Engine

Goal:

- Design event-driven alert architecture.
- Separate public alerts from Pro personalized alerts.
- Require user opt-in and safe delivery controls.

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
