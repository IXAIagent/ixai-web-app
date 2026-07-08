# Workspace Information Architecture

V19.0 defines the Workspace Product Architecture and UX 2.0 information architecture. This document is the IA source of truth before implementation begins.

V19.1 adds page-level product blueprints in `docs/WORKSPACE_PAGE_SPEC.md` and decision governance in `docs/UX_DECISION_LOG.md`.

## 1. Architecture Goal

Workspace should be organized around user questions, not internal engines.

The top-level architecture should help users answer:

- What happened today?
- How is my money performing?
- What happened in markets that affects me?
- What deserves my attention?
- What important event is coming next?
- What do I need to know right now?
- What do I want to ask?

## 2. Proposed Top Navigation

Primary Workspace navigation:

- Today
- Portfolio
- Markets
- Risk
- Timeline
- Notifications
- Copilot

This navigation should replace engineering-led mental models with user tasks.

## 3. Page Missions

### Today

Mission: Answer "What happened today?"

Today should summarize portfolio state, relevant risk, market context, notifications, and next action.

### Portfolio

Mission: Answer "How is my money performing?"

Portfolio should show asset value, performance, allocation, exposure, health, and relevant intelligence.

### Markets

Mission: Answer "What happened in markets that affects me?"

Markets should focus on watchlist, relevant market moves, editorial signals, and source context only as secondary detail.

### Risk

Mission: Answer "What deserves my attention?"

Risk should prioritize user-impacting risk changes, affected assets, affected FCNs, and next monitor actions.

### Timeline

Mission: Answer "What important event is coming next?"

Timeline should separate meaningful events from diagnostics and order events by time and relevance.

### Notifications

Mission: Answer "What do I need to know right now?"

Notifications should communicate impact, priority, and why each alert matters.

### Copilot

Mission: Answer "What do I want to ask?"

Copilot should start from suggested questions based on Workspace context.

## 4. Portfolio Asset Classes

Current asset classes:

- All Assets
- FCN
- Stocks
- ETF
- Crypto
- Cash

Future asset classes:

- Bond
- Funds
- Structured Products
- Options
- Alternative Assets

Portfolio IA must remain extensible. Do not hard-code a single market, broker, provider, language, or asset class.

## 5. Workspace Layers

Workspace has three independent layers.

### Layer 1: User Tasks

- Today
- Portfolio
- Markets
- Risk
- Timeline
- Notifications
- Copilot

Layer 1 owns navigation, page missions, user-facing copy, and first-screen hierarchy.

### Layer 2: Assets

- FCN
- Stocks
- ETF
- Crypto
- Cash
- Future asset classes

Layer 2 owns asset identity, grouping, relationships, and asset-specific intelligence.

### Layer 3: Platform Engines

- Market Engine
- Risk Engine
- Valuation Engine
- Timeline Engine
- Alert Engine
- Intelligence Engine
- Copilot Engine

Layer 3 owns system logic and diagnostics. It should never define top-level navigation labels or first-screen product language.

## 6. Layer Independence Rules

User tasks must not depend on engine names.

Asset classes must not be hidden behind provider diagnostics.

Platform engines must not leak implementation wording into the primary user layer.

Diagnostics are allowed only behind Advanced panels or developer/debug views.

## 7. Engineering-Language Replacement Rules

Use user-facing language in primary UI:

- Provider -> Data source
- Cache -> Update status
- Runtime -> System status
- Engine -> Analysis system
- Diagnostics -> Advanced details
- Fallback -> Limited data
- Readback -> Saved result
- Source status -> Data availability
- Placeholder -> Not ready yet

Even these replacements should be used sparingly on first screens.

## 8. V19 Roadmap

V19 implementation should proceed in product-order:

1. V19.0 — Product Philosophy & IA Foundation
2. V19.1 — Workspace Page Specification & UX Decision Log
3. V19.2 — Today Dashboard UX Implementation
4. V19.3 — Portfolio Live Valuation UX Implementation
5. V19.4 — Markets & Watchlist UX Implementation
6. V19.5 — Risk Decision Center UX Implementation
7. V19.6 — Timeline UX Implementation
8. V19.7 — Morning Brief UX Implementation
9. V19.8 — Notifications UX Implementation
10. V19.9 — Copilot UX Implementation
11. V19.10 — Product QA, Translation, Beta RC

Each sprint should preserve existing engine behavior unless explicitly scoped.

## 9. Out of Scope for V19.0

V19.0 does not implement:

- React changes
- Route changes
- API changes
- Database schema
- Migrations
- Auth changes
- AI calls
- Notification delivery
- Scheduler behavior
- Trading
- Recommendation
- Billing
