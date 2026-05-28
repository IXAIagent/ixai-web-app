# IXAI v1.40.0 — Onboarding Foundation

This document describes the first IXAI Intelligence Activation layer.

## Goal

v1.40.0 starts the shift from a public intelligence app into a relationship-driven intelligence workspace.

The onboarding flow asks a user what IXAI should understand first:

- Which markets they follow.
- Which investment style best describes their workflow.
- How they think about risk.
- Which intelligence topics matter most.
- Which symbols should seed their watchlist.
- Whether they want to connect LINE for future opt-in intelligence delivery.

This version does not add billing, portfolio upload, broker integration, or automated trading.

## Routes

- `/welcome`: marketing-aware welcome surface for the Intelligence Activation entry.
- `/onboarding`: structured onboarding flow.

Both routes can be used before full identity persistence. The onboarding state is local/session-first.

## Investor Profile Model

The current model lives in `src/lib/onboarding/profile.ts`.

The profile includes:

- `markets`: US equities, crypto, Taiwan equities, FCN, ETF.
- `styles`: long-term, swing, income, growth, conservative.
- `riskPreference`: conservative, balanced, aggressive.
- `interests`: Daily Brief, AI Watchlist, FCN Intelligence, Macro Risk, BTC / ETH Alert, AI Risk Monitor.
- `watchlist`: local watchlist seed with symbol and asset type.
- `lineIntent`: whether the user opened the LINE intelligence step.

The storage key is:

```text
ixai.onboarding.profile.v1
```

## Intelligence Activation Philosophy

IXAI onboarding should not feel like a consumer quiz or gamified trading app.

It should feel like the beginning of a daily intelligence relationship:

- IXAI learns what to prioritize.
- The user starts a watchlist seed.
- LINE becomes a future delivery entry, not a push-marketing channel.
- The future Pro layer can inherit these preferences when durable persistence is added.

## Analytics

v1.40.0 adds typed analytics events:

- `onboarding_started`
- `onboarding_step_completed`
- `onboarding_watchlist_added`
- `onboarding_line_connect_open`
- `onboarding_completed`

Events must not send raw watchlist symbols or sensitive identity values.

## Admin Visibility

The Admin console now includes an Onboarding Snapshot card.

In this version, the snapshot is analytics-ready and aggregate-only. Durable onboarding aggregation can later be powered by PostHog, Supabase profile persistence, or a dedicated onboarding table if the product needs server-side history.

## Future Portfolio Intelligence Direction

The onboarding output is designed to become the seed for:

- Portfolio intelligence onboarding.
- Watchlist memory and AI alerts.
- FCN risk education to Pro FCN monitoring transition.
- LINE / LIFF identity continuity.
- Membership-aware intelligence delivery.

No brokerage integration or automatic execution is introduced in this phase.

## Boundaries

This phase intentionally does not change:

- Auth/session architecture.
- LINE Login / LIFF architecture.
- Existing Supabase core tables.
- FCN engine logic.
- Editorial pipeline.
- Market/news providers.
- Monetization or Stripe.
