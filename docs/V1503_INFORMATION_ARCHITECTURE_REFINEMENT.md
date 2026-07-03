# V15.0.3 Information Architecture Refinement

Date: 2026-07-03

## Purpose

V15.0.3 refines the Workspace information architecture after the V15 Product Experience Redesign and V15.0.1 / V15.0.2 runtime hotfixes.

The goal is to remove duplicate content between Home and Morning Brief while keeping both product surfaces clear:

- Home is the daily Workspace dashboard.
- Morning Brief is the full daily Workspace report.

## Home Dashboard Change

Before V15.0.3, Home embedded the compact Workspace Morning Brief card directly below the hero. This made Home and Morning Brief feel like overlapping surfaces.

After V15.0.3, Home keeps:

- Hero Summary.
- KPI row.
- Morning Brief Summary Card.
- Portfolio Snapshot.
- Risk / Today's Alerts.
- Market Snapshot.
- Quick Actions.
- Recent Activity.
- Collapsed diagnostics.

Home no longer embeds the full Workspace Morning Brief card.

## Morning Brief Summary Card

The new Home Morning Brief Summary Card is intentionally lightweight.

It shows:

- A short daily summary.
- Portfolio availability context.
- Risk / attention count.
- Market update timing.
- CTA: `閱讀完整 Morning Brief`.

The CTA routes to:

```text
/my-ixai/morning-brief
```

## Morning Brief Page

V15.0.3 adds `/my-ixai/morning-brief` as the complete report surface.

The full Workspace Morning Brief remains available there without shrinking its content. It keeps the existing manual generation behavior and does not auto-run heavy report generation from Home.

## Hero Positioning

Home hero now focuses on today's work priority:

- What should I check first?
- Which risks or alerts need attention?
- What market state is available?
- Where should I go next?

Morning Brief Summary focuses on the daily report preview, not the hero.

## Sidebar Refinement

Workspace desktop sidebar now separates:

- Main navigation: scrollable middle region.
- Footer actions: fixed bottom region.

Footer actions include:

- Settings.
- Exit public site.
- Sign out.

This keeps navigation usable on shorter viewport heights and prevents Settings / exit actions from becoming unreachable.

The AI navigation Morning Brief entry now routes to `/my-ixai/morning-brief` instead of returning to Home.

## Safety Boundary

V15.0.3 does not modify:

- API.
- Database.
- Supabase.
- Auth.
- AI / LLM behavior.
- Workspace Graph.
- Portfolio engine.
- Risk engine.
- FCN engine.
- Morning Brief engine.
- Market data provider.
- Trading / recommendation behavior.

## Validation

Required validation:

- `git diff --check`.
- `npm run lint`.
- `npm run build`.

Manual verification:

- Home should show a Morning Brief summary, not the full Morning Brief card.
- `/my-ixai/morning-brief` should show the full Workspace Morning Brief.
- Sidebar main navigation should scroll independently.
- Sidebar footer actions should remain available at the bottom.
