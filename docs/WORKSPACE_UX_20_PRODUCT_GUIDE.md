# Workspace UX 2.0 Product Guide

V19.0 establishes the product architecture foundation for Workspace UX 2.0. This document is a product and design guide only. It does not implement React, routes, APIs, engines, providers, schedulers, notifications, database schema, or business logic.

V19.1 extends this guide with page-level blueprints in `docs/WORKSPACE_PAGE_SPEC.md` and product decisions in `docs/UX_DECISION_LOG.md`.

## 1. Objective

Workspace UX 2.0 moves IXAI from an engineering-driven Workspace to a product-driven investment Workspace.

The user goal is simple:

```text
Users should understand today's portfolio, risk, market, and next actions within 30 seconds.
```

Every first-screen Workspace experience must answer:

- What happened today?
- How is my money performing?
- What deserves my attention?
- What should I do next inside IXAI?

IXAI must remain an AI Investment Monitoring System. It monitors, explains, prioritizes, and alerts. It does not provide buy / sell / hold instructions, target prices, guaranteed outcomes, automated trading, or personalized investment advice.

## 2. Current V18 UX Problems

V18 completed the service/domain foundation and connected read-only intelligence to Workspace UI. The next issue is product clarity, not engine capability.

Observed product problems:

- Home lacks a clear actionable portfolio summary.
- Portfolio lacks complete live valuation as the first user-facing story.
- FCN lacks complete KI / Strike / KO calculation hierarchy as the first user-facing story.
- Watchlist lacks a clear daily focus.
- Timeline mixes errors, diagnostics, and real market events.
- Morning Brief can resemble API output instead of a human report.
- Intelligence exposes implementation details before insight.
- Copilot exposes runtime concepts instead of suggested user questions.
- Notifications describe system state instead of user impact.

V19 does not fix all of these in code. V19 defines the product foundation required before implementation.

## 3. UX 2.0 Principles

Every page answers one question.

Answer first. Details second. Diagnostics last.

Human language comes before system language.

User impact comes before technical status.

Actions come before implementation details.

Progressive disclosure is mandatory. The first layer is for users. Advanced panels are for diagnostics.

## 4. First-Layer Anti-Patterns

The following terms must not dominate the first user-facing layer:

- Provider
- Placeholder
- Runtime
- Rule-based
- Deterministic
- Engine Status
- API Route
- Developer diagnostics
- Cache state
- Fallback source
- Implementation wording
- Readback
- Source status

These terms may exist only inside developer, debug, or Advanced diagnostics views.

## 5. Page Template

Every Workspace page should follow this structure:

1. User question and answer
2. Summary of what changed
3. Key numbers or status
4. Why it matters
5. What the user can inspect next
6. Supporting details
7. Advanced diagnostics, collapsed by default

## 6. Page Direction

### Today

Question: What happened today?

The Today page should combine portfolio movement, relevant market movement, risks requiring attention, and the next action inside IXAI.

### Portfolio

Question: How is my money performing?

Portfolio should lead with total value, daily movement, allocation, important movers, and portfolio-level risk before data quality or diagnostics.

### Markets

Question: What happened in markets that affects me?

Markets should prioritize relevant market movement and watchlist focus, not raw provider or source status.

### Risk

Question: What deserves my attention?

Risk should explain the most important risk changes, affected assets, affected FCNs, and why the user should look at them.

### Timeline

Question: What important event is coming next?

Timeline should separate real user events from system errors. Events should be ordered by relevance and time.

### Notifications

Question: What do I need to know right now?

Notifications should explain why each alert matters to the user's investments.

### Copilot

Question: What do I want to ask?

Copilot should start with suggested questions and context, not runtime or graph terminology.

### Morning Brief

Question: What is the market story I should understand in three minutes?

Morning Brief should read like a human editorial report, not an API response or diagnostics page.

## 7. 30-Second Rule

Within 30 seconds, a user must understand:

- Whether their portfolio needs attention.
- Whether risk increased.
- Whether markets moved in a way that matters to them.
- Which page or action to open next.

If a page cannot satisfy this rule, its first screen is too technical, too scattered, or too incomplete.

## 8. 3-Minute Morning Brief Rule

Morning Brief should be readable in three minutes.

It should include:

- Today's market summary.
- What changed.
- Why it matters.
- What to watch next.

It should not require the user to interpret provider output, debug labels, or implementation status.

## 9. Actionable Insight Principle

IXAI should not simply report data.

Every primary card should answer:

- What changed?
- Why does it matter?
- What should I inspect next?

Allowed action language:

- Review
- Check
- Monitor
- Watch
- Compare
- Open details

Forbidden investment advice language:

- Buy
- Sell
- Hold
- Guaranteed
- Must rise
- Must fall
- Target price
- Automated trade

## 10. Loading, Empty, and Error States

Loading states should say what is being prepared in user language.

Empty states should offer a next step, not simply say no data.

Error states should degrade gracefully:

- Provider unavailable -> Data is temporarily unavailable.
- Fallback active -> Using limited data.
- No coverage -> Not enough relevant coverage yet.
- No monitoring events -> Nothing needs attention right now.

## 11. Diagnostics Rules

Diagnostics are valid, but they must not be the product.

Advanced diagnostics may include:

- Provider health
- Cache state
- Runtime status
- Fallback source
- Readiness
- Data quality

Diagnostics must be collapsed by default and placed after the user-facing answer.

## 12. Implementation Guardrails

V19.0 is documentation-only.

V19.1 is also documentation-only.

Future implementation must not add:

- New engine behavior without product mapping.
- Provider-specific UI language in first screens.
- Trading or recommendation copy.
- Scheduler, notification, AI, DB, or API changes unless explicitly scoped.

Before implementing a Workspace page, read its section in `docs/WORKSPACE_PAGE_SPEC.md` and check `docs/UX_DECISION_LOG.md` for governing product decisions.
