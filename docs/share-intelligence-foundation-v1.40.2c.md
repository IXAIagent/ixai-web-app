# IXAI v1.40.2c — Share Intelligence Layer Foundation

This phase creates the first IXAI share intelligence system.

## Goal

Before v1.40.2c, shared IXAI links could feel generic:

- social previews were broad
- shared links had limited intelligence continuity
- users often landed on a generic product surface
- the acquisition loop did not clearly connect to onboarding

v1.40.2c adds static intelligence share routes so a user who opens a LINE, Facebook, Threads, or X link lands directly on a relevant intelligence page.

## Routes

Share index:

```text
/share
```

Static sample intelligence pages:

```text
/share/intelligence/market-pulse
/share/intelligence/fcn-awareness
/share/intelligence/watchlist-preview
/share/intelligence/ai-risk-monitor
/share/intelligence/morning-intelligence
```

No database is used in this phase.

## Share Page Structure

Each share page includes:

- Hero with intelligence title, category, and summary.
- AI Context explaining the market / risk context.
- Why It Matters section.
- CTA funnel:
  - 建立我的 Intelligence Layer → `/onboarding`
  - 查看 Intelligence Preview → `/pro-preview`
  - 加入 LINE Intelligence → LINE Official Account public URL
- Share row using existing share actions.

## Share Intelligence Cards

Reusable component:

```text
components/share/share-intelligence-card.tsx
```

Supported sample categories:

- Market Pulse
- FCN Awareness
- Watchlist Intelligence
- AI Risk Monitor
- Morning Intelligence

The data model lives in:

```text
src/lib/share/intelligence.ts
```

## Metadata / OG Foundation

Each share page has static metadata:

- title
- description
- Open Graph title / description through `buildPublicMetadata`

This phase intentionally uses the existing static brand image. It does not add a dynamic OG image generation service.

## Growth Funnel

The intended funnel is:

```text
Share Page
→ Intelligence Education
→ Onboarding
→ Account
→ Future Intelligence Delivery
```

Share routes are acquisition surfaces. They should not feel like generic marketing pages; they should feel like small pieces of an intelligence product.

## Analytics

v1.40.2c adds typed events:

- `share_page_view`
- `share_cta_click`
- `share_onboarding_click`
- `share_preview_click`
- `share_line_click`

Payloads must not include raw identity values.

## Boundaries

This phase does not implement:

- dynamic image generation
- real AI content generation
- LINE push
- portfolio intelligence
- Stripe
- database-backed share content

All content is static/sample and risk-aware.
