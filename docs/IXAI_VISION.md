# IXAI Vision

This document is the long-term Vision Layer for IXAI. It defines what the product is trying to become and which strategic principles should guide future architecture, UX, monetization, and intelligence work.

## Vision Statement

IXAI aims to become an AI-native Wealth Intelligence Operating System.

The product should help investors build a durable intelligence relationship across markets, assets, risk contexts, and personal workflows. The goal is not to replace human judgment. The goal is to make human judgment better informed, better organized, and more consistent over time.

## Trust Layer

I-Xuan is the Trust Layer.

The I-Xuan brand represents:

- Relationship trust.
- Institutional discipline.
- Risk-first thinking.
- Human review.
- Professional restraint.

IXAI should extend this trust into software. It should not dilute it with aggressive trading language, hype-driven marketing, or automation claims.

## Operating Layer

IXAI is the operating layer.

It combines:

```text
Intelligence Layer
+
Workflow Layer
+
Risk Layer
```

The Intelligence Layer explains what matters in the market.

The Workflow Layer turns reading, onboarding, account memory, social distribution, and future alerts into repeatable operations.

The Risk Layer keeps FCN, crypto, portfolio, macro, and market-regime content framed as awareness and monitoring rather than trading instruction.

Social distribution is part of the Workflow Layer, but it is not the core judgment engine. Social Pack assets should help reviewed intelligence travel to LINE / FB / IG audiences without weakening the underlying intelligence workflow, risk discipline, or user trust.

## Membership Layer

Future IXAI Pro is the Membership Layer.

It may eventually provide:

- Portfolio Intelligence.
- Risk Intelligence.
- AI Alert Engine.
- Personal Market Memory.
- FCN workflow awareness.
- Watchlist and market relevance.

Membership should represent deeper intelligence relationship, not access to signals. Pro should not be positioned as a paid tip service, auto-trading layer, or guaranteed-return product.

## Multi-Asset Portfolio / FCN Intelligence Layer

Portfolio Intelligence and FCN Intelligence are now the first real personal-data layers in IXAI App. v1.80 / v1.81 established production persistence for Portfolio containers, FCN positions, FCN underlyings, Stock positions, and Crypto positions.

v1.87 begins the shift from an FCN Intelligence Platform toward a Multi-Asset AI Risk Platform. FCN remains the strongest origin wedge, but the long-term product needs one portfolio model that can organize FCN, stocks, crypto, grid strategies, dual investment structures, and cash.

```text
Portfolio
├─ FCN
├─ Stocks
├─ Crypto
├─ Grid
├─ Dual
└─ Cash
```

v1.88 turns this architecture into the first Portfolio Center UI. v1.89 adds the Architecture Map so users can understand which Portfolio, FCN, Risk, Intelligence, Membership, and Readback modules are enabled. v1.90 adds the Asset Input Hub and global asset model foundation for FCN, Stock, Crypto, Grid, Dual, Cash, CSV import, broker / exchange / bank source readiness, and future holding-aware news intelligence. v1.91 adds the first mock-only Asset Management Center so IXAI can validate Portfolio CRUD behavior before connecting persistence. v1.92 establishes the formal Account → Asset → Position data model foundation that future CSV import, broker sync, holding-aware news, and unified risk workflows should target. v1.93 adds the Repository Layer so UI and import workflows can depend on a stable contract before Supabase persistence is introduced. v1.94 connects that Repository Layer to Supabase for Create Asset and Read Asset, marking the first step from mock portfolio management into durable asset persistence. v1.95 adds explicit ownership validation readback, and v1.96 turns repository data into the first Portfolio Dashboard Foundation with account, asset, position, category, provider, and region allocation visibility. v1.97 adds the first Portfolio News Intelligence Foundation: a provider-free Intelligence Universe that converts holdings into tracked symbols for future news and AI commentary. v1.98 adds the first Portfolio News Provider Foundation: a mock-only provider contract that turns tracked symbols into Portfolio News Feed readback without connecting external News API, AI commentary, market data, or broker sync. v1.99 adds the first Portfolio AI Commentary Foundation: a mock-only commentary contract that turns Portfolio News Feed into monitoring commentary before any real AI provider is approved. v2.00 adds the first Portfolio Intelligence Engine Foundation: a deterministic mock scoring contract that turns assets, news, and commentary into health, risk, concentration, and diversification scores. v2.01 adds the first Portfolio Risk Engine Foundation: a deterministic mock risk report that turns accounts, assets, and positions into concentration, diversification, FCN, crypto, and cash-buffer risk readback. v2.02 adds the first Portfolio Recommendation Engine Foundation: deterministic monitoring prompts derived from the risk report, with no external AI, broker sync, market data, or trading functionality. v2.03 adds the first Portfolio Market Data Foundation: deterministic mock market snapshots derived from Intelligence Universe symbols, with no Yahoo Finance, Binance, CoinGecko, Finnhub, Polygon, or real-time provider connection. v2.04 adds the first Portfolio Valuation Engine Foundation: deterministic mock valuation and allocation metrics derived from repository assets, positions, and market snapshots, with no real-time provider, broker sync, trading, or recommendation logic. v2.05 adds the first Portfolio Exposure Engine Foundation: deterministic mock exposure readback across FCN, stock, crypto, cash, region, provider, and FCN underlying dimensions, with no real market data, broker sync, recommendation change, or trading logic. v2.06 adds the first Portfolio Concentration Engine Foundation: deterministic mock concentration readback across top symbol, FCN underlying, asset type, provider, and region dimensions, with no real market data, broker sync, recommendation change, or trading logic. v2.07 adds the first Portfolio Correlation Engine Foundation: deterministic mock correlation readback across high, medium, and low co-movement pairs, with no real market data, broker sync, recommendation change, or trading logic. The product should keep separating input routes from dashboard routes: `/portfolio` is for creating and explaining Portfolio data, `/my-ixai/portfolio` is the user's readback, architecture, and control surface, `/my-ixai/input` is the unified asset input foundation, and `/my-ixai/portfolio/assets` is the persistent asset management surface.

The Portfolio AI Commentary Layer should sit in this sequence:

```text
Portfolio Assets
↓
News
↓
AI Commentary
↓
Intelligence Engine
↓
Risk Engine
↓
Recommendation Engine
↓
Market Data Foundation
↓
Valuation Engine Foundation
↓
Exposure Engine Foundation
↓
Concentration Engine Foundation
↓
Correlation Engine Foundation
↓
Future Scenario Engine / Real Market Data / Broker Sync
```

The Portfolio Exposure Layer should unify FCN exposure, stock exposure, crypto exposure, cash exposure, region exposure, provider exposure, and FCN underlying exposure into monitoring readback. It must not become a recommendation engine or a trading instruction layer.

The Portfolio Concentration Layer should identify where exposure is becoming concentrated. It should remain a risk-awareness and monitoring layer, not a position-sizing, trading, or recommendation layer.

The Portfolio Correlation Layer should identify where exposure may move together under deterministic mock assumptions. It should remain a risk-awareness and monitoring layer, not a prediction, trading, or recommendation layer.

This layer must remain monitoring and risk-awareness oriented. It is not a place for investment advice, trading instructions, performance promises, or automated execution.

This does not turn IXAI into a signal-selling product. Pro membership should represent deeper risk workflow, portfolio organization, FCN monitoring, and intelligence continuity. SaaS monetization should use membership, entitlement, and feature gating rather than trading calls, price prediction products, performance promises, or automated execution.

## Future Wealth OS

The long-term direction is:

```text
Multi-Asset
+
Multi-Market
+
Multi-Broker
+
AI Intelligence
```

The system may eventually understand equities, crypto, structured products, cash, funds, rates, macro, and personal preferences across multiple platforms and institutions.

But the operating constraints should remain:

- Human review.
- Compliance-first.
- Risk-first.
- Opt-in delivery.
- No automated execution without explicit future governance.
- No personalized advice unless a compliant workflow is intentionally designed and approved.

## Strategic Principles

1. Intelligence before prediction.
2. Monitoring before automation.
3. Risk before returns.
4. Trust before growth.
5. Membership before monetization.
6. Workflow before signals.

These principles should be used when making roadmap decisions. If a feature increases hype but weakens trust, it should wait. If a feature improves monitoring, workflow, or risk context without crossing compliance boundaries, it likely belongs in the roadmap.

## Long-Term Product Map

```text
Public Intelligence
↓
Account Intelligence
↓
Pro Intelligence
↓
Portfolio Intelligence
↓
AI Alert Engine
↓
AI Wealth Intelligence OS
```

## Product Interpretation

Public Intelligence is the trust-building layer.

Account Intelligence is the memory layer.

Pro Intelligence is the deeper workflow layer.

Portfolio Intelligence is the personal relevance layer.

AI Alert Engine is the delivery and attention layer.

AI Wealth Intelligence OS is the long-term operating system that ties them together.

IXAI should grow toward this vision gradually, preserving human review and compliance boundaries at every layer.
