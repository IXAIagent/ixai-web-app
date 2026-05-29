# IXAI v1.40.2f Public Intelligence Access Layer

Status: implemented  
Scope: Public reading access for Daily / Weekly / Share intelligence, CTA footer, analytics, docs  
Out of scope: Stripe, LINE push, portfolio DB, AI agent, Pro billing, Supabase schema changes, route deletion

## Product Problem

Before this pass, users opening a Daily Brief or Weekly Intelligence link from LINE, Facebook, Threads, or X could hit the account entry wall before seeing the content.

That is wrong for the public funnel. IXAI should earn trust through public intelligence first.

## Public Intelligence Funnel

```text
LINE / Social / Share
→ Daily Brief / Weekly Intelligence / Share Intelligence
→ Public Intelligence CTA
→ Onboarding
→ Account / AI Intelligence Workspace
→ Personal Intelligence / Future Pro
```

## Access Policy

Public readable routes:

- `/`
- `/daily-brief`
- `/daily-brief/*`
- `/weekly-brief`
- `/weekly-brief/*`
- `/share`
- `/share/*`

Protected / gated routes:

- `/account`
- `/pro`
- `/pro-preview`
- `/pro-intelligence`
- `/admin` remains isolated by the admin shell / admin route pattern
- Admin APIs and user/session APIs remain unchanged

## Public CTA Footer

Added reusable component:

- `components/intelligence/public-intelligence-cta.tsx`

The CTA is designed for public content surfaces after the reader has seen the intelligence content.

CTA hierarchy:

1. `建立免費 Intelligence Layer` → `/onboarding`
2. `查看 Intelligence Preview` → `/pro-preview`
3. `加入 LINE 接收情報` → LINE Official Account

The copy avoids investment advice, trading instructions, return promises, and target prices. It positions IXAI as intelligence, awareness, workflow, and risk context.

## Applied Surfaces

The footer CTA is applied to:

- Daily Brief detail page
- Supabase-backed Daily Brief local detail renderer
- Weekly Brief detail page
- Share Intelligence detail page

Each detail surface also includes a small public positioning label:

- `Public Intelligence`
- `General Market Awareness` or `Sample / General Market Awareness`

## Analytics

Added typed analytics events:

- `public_intelligence_view`
- `public_intelligence_cta_click`
- `public_intelligence_onboarding_click`
- `public_intelligence_preview_click`
- `public_intelligence_line_click`

The page view tracker emits `public_intelligence_view` for public intelligence paths. CTA events include only surface, path, and target. They do not send raw identity or sensitive personal data.

## Notes

`/pro-preview` remains protected per v1.40.2f scope. Public content can still link to it as a secondary path, but the primary conversion path is onboarding.

This keeps the trust-building funnel public while preserving Account / Pro / Admin boundaries.
