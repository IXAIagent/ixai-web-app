# v3.03 IXAI Platform Page

Date: 2026-06-11

Objective: reposition `/pro` from a Legacy Pro / membership-status surface into the public IXAI Platform introduction and conversion page.

This release does not change membership logic, entitlement logic, auth providers, schema, migrations, broker integrations, external AI providers, market data providers, API contracts, or trading logic.

## 1. Route Decision

The route remains:

```text
/pro
```

Reason:

- Existing navigation already points to `/pro`.
- Users may already recognize the route.
- Avoiding route churn is lower risk than renaming the page during IA migration.

## 2. Positioning Before

Before v3.03, `/pro` was tightly coupled to Legacy Pro and membership / test access messaging.

It included:

- Pro SSO launch CTA.
- Membership status card.
- Portfolio readback summary.
- Legacy Pro / App bridge framing.

That made `/pro` feel like the old product entry instead of a clean public platform explanation.

## 3. Positioning After

`/pro` is now:

```text
IXAI Platform
AI Investment Risk Platform
```

Primary message:

```text
IXAI 不提供明牌，也不是自動交易工具。
IXAI 是一套幫助投資人整理資產、監控風險、理解市場的 AI 投資工作平台。
```

## 4. Page Sections

The new `/pro` page includes:

- Hero: IXAI AI 投資風控平台.
- Why IXAI: information overload, product fragmentation, unmanaged risk.
- Difference from normal investment apps.
- Product Centers: Portfolio, Risk, FCN, Intelligence.
- Product Roadmap: foundation, workspace experience, real market data / notification / AI Morning Brief, broker integration, global market platform.
- Future Pricing Direction: Free, Plus, Professional, Enterprise / Advisor.
- Founder / Advisory Philosophy.
- Compliance boundary.
- Global platform direction.

## 5. Navigation Update

Public navigation label may read:

```text
IXAI Platform
```

The route remains `/pro`.

Workspace navigation remains unchanged and does not include public platform navigation except `返回官網`.

## 6. Legacy Pro Boundary

Legacy Pro is preserved only as historical / transition context.

`/pro` should no longer be treated as:

- The primary Legacy Pro entry.
- The post-login workspace entry.
- A membership entitlement status page.
- A Pro SSO launch hub.

The authenticated product entry remains:

```text
/my-ixai/home
```

## 7. Compliance Boundary

The page states that IXAI:

- Does not provide automatic order execution.
- Does not guarantee returns.
- Does not replace investor judgment.
- Is for market information organization, risk monitoring, and investment workflow support.
- Does not constitute individualized investment advice.

## 8. Out of Scope

v3.03 does not:

- Change membership logic.
- Change entitlement logic.
- Change auth provider behavior.
- Change Supabase schema.
- Add migrations.
- Add broker integrations.
- Add external AI.
- Add market data providers.
- Add trading logic.

## 9. Validation Checklist

- `/pro` loads at status 200.
- `/pro` has no horizontal overflow on mobile.
- `/pro` is readable at 375px, 768px, and 1280px.
- Public navigation still links to `/pro`.
- Workspace navigation remains unchanged.
- `/my-ixai/home` remains the authenticated entry.
