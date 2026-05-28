# IXAI v1.40.1 — Intelligence Delivery Foundation

This document describes the first IXAI Daily Intelligence Habit Loop foundation.

## Goal

v1.40.1 prepares IXAI to become a daily intelligence relationship rather than a passive content destination.

The product direction is:

```text
Investor preference
→ Watchlist seed
→ Daily intelligence relationship
→ LINE / app delivery readiness
→ future Pro personalized intelligence
```

This phase does not send real push notifications. It creates the architecture, message format, preference model, UI surfaces, and admin readiness snapshot needed before real delivery is enabled.

## Delivery Architecture

The delivery foundation lives under:

```text
src/lib/intelligence/delivery/
```

Core modules:

- `types.ts`: delivery tiers, categories, channels, schedules, preferences.
- `preferences.ts`: local/session-first delivery preference model.
- `access.ts`: Public / Preview / Pro delivery gating helpers.
- `formatter.ts`: Morning Intelligence preview formatter.
- `line-message-builder.ts`: safe LINE text message builder with mock/ready mode.
- `scheduler.ts`: delivery schedule definitions and scheduler readiness.

The architecture is intentionally small and event-driven friendly. It is designed so future versions can add a queue, cron, opt-in persistence, and personalized intelligence without rewriting the public UI.

## Intelligence Categories

Public foundation categories:

- Morning Intelligence
- Macro Intelligence
- Watchlist Alert
- Market Volatility Alert
- FCN Intelligence Preview

Public delivery remains generalized, educational, and informational. It must not provide direct trading instructions, target prices, or guaranteed-return language.

## Public vs Pro Strategy

Delivery tiers:

- `public`: generalized market intelligence, Morning Intelligence, macro context, educational FCN preview.
- `preview`: sample-only future workflows, watchlist delivery preview, Pro dashboard preview.
- `pro`: future personalized watchlist alert, FCN KI proximity alert, portfolio concentration warning, AI risk monitor, and personalized daily intelligence.

v1.40.1 does not implement paid access or real Pro locking. It only introduces the delivery access model.

## LINE Delivery Foundation

The LINE delivery layer uses the existing LINE Login / LIFF / identity session foundation.

This phase adds:

- Reusable LINE message structure.
- Safe text formatting.
- CTA and compliance footer.
- Mock delivery mode when LINE Messaging API env is not configured.
- `line-ready` status when Messaging API config exists.

This phase does not:

- hardcode LINE user IDs
- expose secrets
- send broadcasts
- schedule push jobs
- build a chatbot workflow

## Delivery Preferences

The delivery preference card is local/session-first. It can derive initial interests from the v1.40 onboarding profile.

Preference categories map to:

- Daily Brief
- AI Watchlist
- FCN Intelligence
- Macro Risk
- BTC / ETH Alert
- AI Risk Monitor

Future versions can promote this model into Supabase profile persistence after opt-in and consent rules are finalized.

## Admin Visibility

Admin now includes an Intelligence Delivery Snapshot.

It shows:

- delivery readiness
- onboarding to delivery conversion placeholder
- LINE readiness
- Public / Preview / Pro tier distribution
- top intelligence interests placeholder

The snapshot is aggregate-only and does not expose raw identity, email, watchlist symbols, LINE user IDs, or tokens.

## Analytics

v1.40.1 adds typed events:

- `intelligence_delivery_enabled`
- `intelligence_delivery_preview_open`
- `intelligence_delivery_line_connect`
- `intelligence_push_preview_view`
- `morning_intelligence_view`
- `pro_intelligence_preview_view`

Payloads must stay sanitized and must not include raw sensitive identity values.

## Future Roadmap

Before real push delivery:

- Add explicit opt-in persistence.
- Add a durable delivery queue.
- Add unsubscribe / pause controls.
- Add admin delivery logs.
- Exclude auth/admin routes from any delivery cache.
- Decide whether Morning Intelligence should be public-only, subscriber-only, or membership-aware.
- Add Pro entitlement checks before personalized alerts are sent.

## Boundaries

v1.40.1 intentionally does not change:

- Stripe or payment.
- Auth/session architecture.
- LINE Login / LIFF architecture.
- Editorial pipeline.
- FCN engine.
- Market/news providers.
- Portfolio persistence.
- Brokerage integration.
