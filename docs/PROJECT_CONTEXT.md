# IXAI Project Context

This document is the long-term project memory layer for AI-assisted development on IXAI. It should be read before substantial product, architecture, or UI work.

## A. Project Identity

IXAI is an AI-native investment intelligence platform built around market interpretation, risk awareness, and investor workflow.

IXAI is not a broker, not an automated order execution system, and not a signal-selling product. The product direction is to help users understand what matters in markets, organize that intelligence into daily habits, and eventually connect public market intelligence to personal risk workflows.

The core product layers are:

- Intelligence: daily and weekly market interpretation, cross-asset context, and AI-assisted synthesis.
- Workflow: watchlist, account identity, editorial review, distribution, and future Pro operating surfaces.
- Risk layer: FCN education, gated Pro intelligence previews, and future portfolio and alert workflows.

I-Xuan remains the trust brand behind the product. IXAI is the AI operating layer that extends that trust into a durable market intelligence system.

Global market principle:

- IXAI is a Global Multi-Asset, Multi-Broker, Multi-Market AI Risk Platform.
- Strategic market direction includes US equities, Taiwan equities, Hong Kong equities, China A-Shares, Japan equities, Korea equities, European equities, Singapore equities, crypto assets, and FCN structured products.
- Strategic language direction includes `zh-TW`, `zh-CN`, `en-US`, `ja-JP`, and `ko-KR`, with `en-GB`, French, and German future-ready.
- Portfolio, FCN, valuation, exposure, concentration, correlation, scenario, stress-test, market data, news, and future engines must not assume US-only, Taiwan-only, or English-only data.
- FCN underlyings may originate from the United States, Hong Kong, China, Japan, Korea, Europe, Global Indexes, and future markets.

See `docs/GLOBAL_MARKET_VISION.md` before changing region, provider, market data, news, localization, or FCN-underlying assumptions.

## A1. Product Origin: AI Morning Brief Era

IXAI did not begin as a generic SaaS app. It evolved from an internal "一玄AI" operating workflow built to help monitor markets, risk, and structured-product exposure every day.

The earliest product shape was an AI Morning Brief: a daily Telegram-style market briefing that organized macro, US equities, Taiwan market themes, crypto, and FCN-related risk observations into a morning decision-support ritual. The point was not to create trading signals; it was to compress market noise into a structured daily awareness layer.

Several early monitoring systems became the practical product prototypes behind IXAI:

- FCN monitoring: tracking structured-product concepts such as KO, KI, worst performer, observation dates, volatility, and underlying asset sensitivity. This became the seed for IXAI's risk-first FCN education and future Pro FCN workflow.
- Crypto Grid / Dual monitoring: tracking Binance-style grid ranges, dual-investment states, BTC / ETH volatility, liquidity, and market regime changes. This became the seed for Crypto Watch, risk regime awareness, and future alert architecture.
- Stock and market monitoring: tracking US technology names, Taiwan AI supply-chain names, macro/rates, and market news. This became the seed for Public Intelligence, Daily Intelligence, Watchlist Intelligence Lite, and future Portfolio Intelligence.
- Market news module: ingesting and organizing public market headlines into daily narrative form. This became the seed for the Daily Intelligence Content Engine, Provider Health, Coverage Score, and News Provider Recovery work.

The product therefore moved through this arc:

```text
AI Morning Brief / Telegram-style daily intelligence
→ FCN / Crypto Grid / Dual / stock monitoring prototypes
→ Public Intelligence and Daily / Weekly Briefs
→ Account Intelligence and watchlist memory
→ IXAI Pro preview and future portfolio / FCN / alert workflows
→ Social Intelligence Engine and distribution-ready intelligence assets
```

This origin matters because IXAI's product center is not "content marketing" or "signals." The durable product center is an AI-native investment intelligence workflow: remember what matters, monitor risk context, organize daily reading, and eventually support deeper personal and Pro intelligence layers while preserving compliance boundaries.

## B. Current Product Status

The current IXAI public app is live and deployed on Vercel, with `https://app.ixuan.ai` as the production public domain.

## B0. v1.80 / v1.81 Production Status — Portfolio + FCN Foundation

Production foundation:

`v1.81 — Portfolio + FCN Foundation`

Current development version:

`v4.07 — Provider Health Framework`

Current production state:

- Production domain: `https://app.ixuan.ai`.
- Vercel production deployment: Ready.
- Production Supabase project: `IXAIagent's Project`.
- Production Supabase Project ID: `uoyeeojnyswytutmhptk`.
- Production migrations applied: `009_portfolio_foundation.sql`, `010_fcn_position_foundation.sql`, `011_stock_crypto_position_foundation.sql`.
- Production tables confirmed: `portfolios`, `fcn_positions`, `fcn_underlyings`, `stock_positions`, `crypto_positions`.

IXAI has moved from a demonstration-oriented public intelligence App into a logged-in product where users can create Portfolio / FCN records and persist them in Supabase. The App now owns the first real personal-data layer for future Portfolio Intelligence, FCN Risk Engine, and Pro workflows.

v1.82.1 began the FCN Risk Engine in the smallest possible increment: Worst-of readback from already stored FCN underlyings. v1.83 extended that into the first portfolio-level FCN Risk Engine layer: KI distance, risk level, portfolio risk score, concentration exposure, and Worst-of ranking. v1.84 adds the first FCN Intelligence Layer: deterministic risk, Worst-of, concentration, and Near-KI narratives. v1.85 combines these existing fields into the first Portfolio Intelligence Dashboard MVP on Risk / Pro surfaces: portfolio health score, portfolio status, risk distribution, and monitoring highlights. v1.86 adds the first Membership / Entitlement foundation for Free / Basic / Pro access rules without introducing payment or schema migration. v1.87 shifts the portfolio architecture from FCN-centric readback toward a Multi-Asset AI Risk Platform by normalizing FCN, Stock, Crypto, Grid, Dual, and Cash categories. v1.88 makes those fields visible in the first dedicated Portfolio Center at `/my-ixai/portfolio`. v1.89 adds an IXAI Architecture Map so users can understand the Portfolio, FCN, Risk, Intelligence, Membership, and Readback capabilities currently enabled. v1.90 adds `/my-ixai/input` as the Asset Input Hub and defines the first global asset input model for future manual input, CSV import, broker sync, holding-aware news, and multilingual portfolio workflows. v1.91 adds `/my-ixai/portfolio/assets` as a mock-only Asset Management Center that validates Create / Read / Update / Delete UI and state behavior without writing to Supabase. v1.92 adds the formal Account → Asset → Position data model foundation and an additive Supabase schema / RLS foundation for future persistent multi-asset CRUD. v1.93 adds the Portfolio Repository Layer so UI can depend on a stable contract before Supabase persistence is connected. v1.94 connects the Repository Layer to Supabase for Create Asset and Read Asset only, while Update / Delete remain future work. v1.95 adds Ownership Validation readback. v1.96 adds the first Repository-driven Portfolio Dashboard Foundation with account, asset, position, category, provider, and region allocation summaries. v1.97 adds the Portfolio News Intelligence Foundation by turning repository assets into a deduplicated Intelligence Universe of tracked symbols for future news and AI commentary layers. v1.98 adds the first Portfolio News Provider Foundation by using a mock provider to turn tracked symbols into Portfolio News Feed readback without connecting external News API, AI, market data, broker, or trading systems. v1.99 adds the first Portfolio AI Commentary Foundation by turning the existing Portfolio News Feed into mock commentary readback without calling OpenAI, Claude, Gemini, Anthropic, News API, market data, or broker providers. v2.00 adds the first Portfolio Intelligence Engine Foundation by combining repository assets, news feed, and commentary into deterministic mock health, risk, concentration, and diversification scores. v2.01 adds the first Portfolio Risk Engine Foundation by producing deterministic mock risk reports from repository accounts, assets, and positions. v2.02 adds the first Portfolio Recommendation Engine Foundation by turning deterministic risk reports into monitoring prompts without external AI, market data, broker sync, News API, or trading functionality. v2.03 adds the first Portfolio Market Data Foundation by turning repository-driven Intelligence Universe symbols into deterministic mock market snapshots without connecting real market data providers. v2.04 adds the first Portfolio Valuation Engine Foundation by converting repository assets, positions, and mock market snapshots into total value, unrealized P/L, and allocation metrics without connecting real market data, broker sync, or trading systems. v2.05 adds the first Portfolio Exposure Engine Foundation by converting valuation output into asset type, symbol, FCN underlying, crypto, region, and provider exposure readback without connecting real market data, broker sync, recommendation changes, or trading systems. v2.06 adds the first Portfolio Concentration Engine Foundation by converting exposure output into top symbol, FCN underlying, asset type, provider, and region concentration readback without connecting external market data, broker sync, recommendation changes, or trading systems. v2.07 adds the first Portfolio Correlation Engine Foundation by converting exposure and concentration reports into deterministic high / medium / low correlation pairs and correlation risk readback without connecting external market data, broker sync, recommendation changes, or trading systems. v2.08 adds the first Portfolio Scenario Engine Foundation by converting valuation, exposure, concentration, and correlation reports into market-agnostic deterministic scenario readback without connecting external market data, broker sync, recommendation changes, or trading systems. v2.09 adds the first Portfolio Stress Test Engine Foundation by converting valuation, exposure, concentration, correlation, and scenario reports into market-agnostic deterministic stress-test readback without connecting external market data, broker sync, recommendation changes, or trading systems. v2.10 adds the first Portfolio FCN Risk Engine Foundation by converting FCN assets, underlyings, exposure, concentration, correlation, and stress-test reports into market-agnostic deterministic FCN risk readback without connecting external market data, broker sync, recommendation changes, or trading systems. v2.10a completes a docs-first Global Market Foundation Review across Portfolio Core engines, FCN global expansion, multi-language readiness, multi-broker readiness, Legacy Pro migration, Portfolio Center complexity, and the platform IA proposal. v2.11 adds the Legacy Pro Migration Audit and Product Inventory as the pre-v3.00 source of truth for migration status, future App centers, and what should not be migrated from Legacy Pro.

Before continuing v3 UX / IA work, read `docs/LEGACY_PRO_MIGRATION_AUDIT_V211.md`, `docs/V300_UX_IA_FOUNDATION_PLAN.md`, `docs/V301_NAVIGATION_SEPARATION_FOUNDATION.md`, `docs/V302_WORKSPACE_ENTRY_MIGRATION.md`, and `docs/V303_IXAI_PLATFORM_PAGE.md`. Legacy Pro should remain reference-only: selected concepts may migrate, but legacy JWT login, localStorage token auth, direct browser-to-FastAPI protected requests, and the full legacy AppShell should not.

v3.01 separates public website navigation from Workspace application navigation. Public navigation is for SEO, brand, education, lead generation, and login. Workspace navigation is only for Workspace Home, Portfolio Center, Risk Center, FCN Center, Intelligence Center, Settings, and an explicit `返回官網` exit. Do not mix public and Workspace entries in the same primary navigation mode.

v3.02 makes `/my-ixai/home` the authenticated entry point. Login and Register success flows should land in Workspace Home. `/account` is now a legacy transitional page with a primary CTA into Workspace, not the main Pro / Legacy Pro entry.

v3.03 repositions `/pro` as the public IXAI Platform introduction and conversion page. `/pro` should explain what IXAI is, why it differs from normal investment apps, how it supports Portfolio / Risk / FCN / Intelligence workflows, future roadmap, future pricing direction, and founder / advisory philosophy. It should not be treated as the primary Legacy Pro or membership-status entry.

v3.04 makes `/my-ixai/input` the canonical Workspace asset onboarding surface. FCN Wizard ownership moves from public `/fcn` to `/my-ixai/input/fcn`; public `/fcn` should remain education, Worst-of, KI / KO, case study, FAQ, and Workspace CTA only. Do not place data-entry workflows back into public FCN.

v3.05 turns `/my-ixai/portfolio` into the first user-readable Portfolio Workspace homepage. The page should explain Portfolio Overview, Holdings Summary, Risk Snapshot, and Quick Actions without connecting new APIs or real engines. v3.05 also fixes `/pro` CTA contrast so public conversion buttons remain visible.

v3.05a audits `/Users/itsunkuo/Desktop/IXAI_PROJECTS/backend/ixai_agent` as the legacy FastAPI backend inventory. The audit identifies reusable concepts for Asset Input, CSV import, FCN monitoring, risk alerts, market intelligence, scheduler, notification, position lifecycle, models, tests, services, and API routes. The rule is explicit: migrate concepts by contract and App-native rewrite, not by copying the legacy backend, templates, JWT auth, localStorage token flow, or direct browser-to-FastAPI protected calls.

v3.06 upgrades Asset Input from placeholder into usable Workspace input flows. `/my-ixai/input/stock` supports Stock / ETF input fields and local preview. `/my-ixai/input/crypto` supports Crypto input fields and local preview. `/my-ixai/input/fcn` keeps the FCN Wizard and extends it with Basic, Barrier, Observation Frequency, Observation Dates, Underlyings, and final Input Review. `/my-ixai/portfolio` displays local mock Recent Inputs so the user can see the path from input to Portfolio readback. This version does not add schema, migration, API, auth, membership, broker, market data, external AI, recommendation, or trading changes.

v3.08 wires the FCN Input flow into the first FCN Center readback using local/mock state. `/my-ixai/input/fcn` writes FCN draft data into a local FCN Draft Store, and `/my-ixai/fcn` reads that store to display FCN overview, position cards, underlying exposure, coupon calendar, and detail panel. v3.08a fixes the FCN Draft Store visibility path so FCN Wizard writes to the canonical local draft key and FCN Center reads the same key.

v3.09 closes the first active-app FCN loop: `/my-ixai/input/fcn` creates FCN positions through `POST /api/fcn`, the existing API writes Supabase `fcn_positions` and `fcn_underlyings`, and `/my-ixai/fcn` now reads the same persisted records through `GET /api/fcn`. FCN Center displays count, notional, position cards, issuer, strike, KI, KO, underlyings, observation / coupon schedule, created date, and empty / unauthenticated states. v3.09 does not add migration, schema change, market data, broker sync, AI provider, recommendation logic, trading logic, Daily / Weekly, Social Pack, public `/fcn`, legacy frontend, or FastAPI backend changes.

v3.10 upgrades `/my-ixai/fcn` into the first FCN risk-monitoring workspace. It keeps the v3.09 Supabase `/api/fcn` data path and adds FCN risk summary, underlying concentration, KI distance readback, worst underlying, and per-position risk status using stored current price only. Missing current price or invalid KI data remains `UNKNOWN`. v3.10 does not add migration, schema change, API route, external market data, broker sync, AI provider, recommendation logic, trading logic, Daily / Weekly, Social Pack, public `/fcn`, auth, or membership changes.

v3.20 upgrades `/my-ixai/fcn` into the FCN Intelligence Center. It folds the separate v3.11-v3.14 FCN follow-up plan into one integrated FCN workspace: lifecycle readback and filters, manual current-price overlay, FCN Timeline / Event Center, Risk Engine v2 scoring, and richer underlying concentration. It preserves the existing `/api/fcn` / Supabase readback path. Manual price updates are browser-local overlays only and do not write to Supabase. v3.20 does not add migration, schema change, external market data, broker sync, AI provider, recommendation logic, trading logic, Daily / Weekly, Social Pack, public `/fcn`, auth, or membership changes.

v3.30 upgrades `/my-ixai/risk` from placeholder into the first Global Risk Center foundation. It reuses v3.20 FCN Intelligence Center helpers for FCN risk summary and upcoming FCN events, reads existing FCN / Stock / Crypto API paths for readiness, derives Grid / Dual readiness from crypto position metadata, and reports data source status. The v3.30 Foundation Score is deterministic and currently weighted by FCN RED / YELLOW / UNKNOWN readback only. v3.30 does not add migration, schema change, live market data, broker sync, AI provider, recommendation logic, trading logic, auth, or membership changes.

v3.40 upgrades `/my-ixai/intelligence` from placeholder into the first usable Intelligence Center. It keeps Daily / Weekly / Market as public source routes, adds Workspace entry points, reuses FCN v3.20 helper output for FCN highlights, reads existing FCN / Stock / Crypto / Portfolio Dashboard APIs for readiness, and clearly labels News Feed and Commentary as readiness layers. v3.40 does not add migration, schema change, new API route, external news provider, external AI provider, broker sync, trading logic, public Daily / Weekly changes, Social Pack changes, auth, or membership changes.

v4.00 is the Intelligence + Market Integration Program. It is not another page. It is a docs-first architecture plan for connecting Market, Portfolio, FCN, Risk, and Intelligence into one operating workflow. The program should establish a Portfolio Truth Layer, a Workspace Market Service, FCN real-risk integration semantics, Intelligence Center V2, and integration QA while preserving the boundaries of no new external market provider, no external news provider, no AI provider, no broker sync, no schema/migration, no trading logic, no Social Pack changes, no admin editorial changes, no auth changes, and no membership changes.

v4.01 implements the first Portfolio Truth Layer. It normalizes existing `/api/fcn`, `/api/stocks`, `/api/crypto`, and `/api/portfolio/dashboard` readback into one shared holdings summary for Portfolio Center, Risk Center, and Intelligence Center. It fixes the product gap where Portfolio Center could show zero assets while FCN / Stock / Crypto records existed elsewhere. v4.01 adds no schema, migration, API route, external market provider, external news provider, AI provider, broker sync, auth, membership, Social Pack, admin editorial, or trading changes.

v4.02 builds the Portfolio Intelligence UI on top of the v4.01 Truth Layer. `/my-ixai/portfolio` now visualizes holdings summary, counts-based Stock / FCN / Crypto allocation, top symbol occurrence, source health, and missing-data warnings using only existing truth-layer data. It adds no schema, migration, API route, external market provider, external news provider, AI provider, broker sync, auth, membership, Social Pack, admin editorial, recommendation, or trading changes.

v4.03 adds the Risk Intelligence Layer on top of the v4.01 Truth Layer. `/my-ixai/risk` now shows deterministic concentration risk, top exposure aggregation, FCN worst-of summary, and data quality risk summary while reusing v3.20 FCN helper output. It adds no market data, broker sync, AI commentary, recommendation logic, trading functionality, schema, migration, API route, auth, membership, Social Pack, or admin editorial changes.

v4.04 adds the Intelligence Readback Layer on top of Portfolio Truth and Risk Intelligence. `/my-ixai/intelligence` now shows portfolio intelligence summary, risk snapshot summary, exposure intelligence summary, and readiness warning summary while preserving Daily / Weekly / Market entries, FCN highlights, news readiness, commentary readiness, and compliance boundaries. It adds no AI commentary, LLM integration, market data, broker sync, news provider, recommendation logic, trading functionality, schema, migration, API route, auth, membership, Social Pack, or admin editorial changes.

v4.05 adds the Market Abstraction Layer under `src/lib/market/`. It defines MarketQuote, MarketSnapshot, MarketNews, MarketProvider, provider registry, market center helpers, and a deterministic MockProvider for contract validation. It does not connect Yahoo, Binance, CoinGecko, broker feeds, API keys, external news providers, external services, database changes, schema changes, migrations, or API routes.

v4.06 adds Market Readiness UI to `/my-ixai/intelligence`. It reuses the v4.05 Market Abstraction Layer and displays provider registry status, quote/news contract coverage, mock provider count, and supported mock symbols. It uses only MockProvider and registry metadata and does not connect Yahoo, Binance, broker integrations, external services, API routes, database changes, schema changes, or migrations.

v4.07 adds the Provider Health Framework under `src/lib/market/`. It defines ProviderStatus, DataFreshness, ProviderPriority, ProviderHealthSummary, fallback policy support, and deterministic mock health data. It exposes provider health through the market center without connecting Yahoo, Binance, external services, API routes, database changes, schema changes, or migrations.

Validated production behavior:

- Portfolio creation succeeds in app.ixuan.ai.
- FCN Wizard reads Portfolio dropdown options.
- FCN can attach to a Portfolio.
- Risk / Pro readback surfaces can display data-layer status.

Validated staging behavior before production:

- Migration PASS.
- Lint PASS.
- Build PASS.
- Static API audit PASS.
- Authenticated CRUD PASS.
- User A / User B ownership isolation PASS.
- Unauthenticated 401 PASS.
- Soft archive PASS.
- UI smoke QA PASS.

Current mainline relationship:

- `app/ixai-web-app` is the active production App and should be the home of future Pro features.
- Legacy Pro remains reference-only and should gradually retire rather than be migrated wholesale.
- Reusable Legacy Pro concepts may inform FCN, Risk, Portfolio, Crypto, News Intelligence, and multilingual modules, but not legacy JWT login, localStorage token auth, direct browser-to-FastAPI protected requests, or the old AppShell architecture.

Still not complete:

- Full KI / KO monitoring, price freshness, and live-price-backed distance semantics.
- KO distance.
- Strike distance.
- Full observation calendar and notification workflow.
- Full coupon calendar and payment tracking workflow.
- AI Risk Engine.
- Unified multi-asset risk engine.
- Stock / Crypto / Cash input expansion.
- SaaS membership / entitlement limits and payment flow.
- Live broker data, live prices, trading execution, or personalized investment advice.

## Current Product State

Current Development Version:

`v4.07 — Provider Health Framework`

Current Core Flow:

```text
Landing
→ Onboarding
→ Account
→ Portfolio / FCN data entry
→ Worst-of / FCN Risk / Intelligence / Multi-Asset Portfolio Dashboard / Pro readback
→ Portfolio Center
→ Asset Input Center
→ Asset Management Center
→ Portfolio Recommendation Engine readback
→ Portfolio Market Data readback
→ Portfolio Valuation / Allocation readback
→ Portfolio Exposure readback
→ Portfolio Concentration readback
→ Portfolio Correlation readback
→ Portfolio Scenario readback
→ Portfolio Stress Test readback
→ Portfolio FCN Risk readback
→ Global Market Foundation Review
→ Legacy Pro Migration Audit and Product Inventory
→ UX IA route foundation
→ Asset Input usable local workflows
→ FCN Draft Store local readback
→ Membership / Entitlement visibility
→ FCN Position readback in FCN Center
→ FCN KI-distance risk monitoring in FCN Center
→ FCN Intelligence Center with lifecycle, manual price overlay, timeline, and concentration
→ Global Risk Center with FCN risk summary, multi-asset readiness, upcoming risk events, data source status, and deterministic foundation score
→ Risk Intelligence Layer with concentration, top exposure, FCN worst-of, and data quality readback
→ Intelligence Readback Layer with portfolio summary, risk snapshot, exposure summary, and readiness warnings
→ Market Abstraction Layer with provider contracts, snapshots, news shapes, registry, and mock provider
→ Market Readiness UI with provider registry status and mock contract coverage
→ Provider Health Framework with status, freshness, priority, health summary, and fallback policy
→ Intelligence Center with Daily / Weekly / Market entries, FCN highlights, portfolio-aware readiness, news readiness, and commentary readiness
→ v4.00 Integration Program connecting Market, Portfolio, FCN, Risk, and Intelligence through truth-layer and market-service planning
→ Portfolio Truth Layer shared by Portfolio Center, Risk Center, and Intelligence Center
→ Portfolio Intelligence UI visualizing allocation, holdings, source health, and top symbol occurrence
```

Public Intelligence Funnel:

```text
LINE / Social / Share
→ Daily / Weekly / Share Intelligence
→ Onboarding
→ Account
→ Personal Intelligence
```

Product Layers:

- Public Intelligence: acquisition, trust building, daily/weekly market awareness, shareable intelligence.
- Account Intelligence: identity continuity, Watchlist Intelligence Lite, preference memory, LINE readiness.
- Multi-Asset Portfolio Intelligence: production persistence for Portfolio containers, FCN positions, underlyings, Stock / Crypto foundations, normalized asset categories, and dashboard readback.
- FCN Risk / Intelligence Engine: Worst-of, KI distance, lifecycle status, manual local price overlay, event timeline, risk score, concentration exposure, Worst-of ranking, and deterministic intelligence narratives start from persisted FCN records and user-entered prices; persisted price update, KO distance, alert delivery, AI risk summary, and entitlement gating remain future work.
- Global Risk Center Foundation: v3.30 makes `/my-ixai/risk` a first working risk workspace by reusing FCN v3.20 readback, showing Stock / Crypto / Grid / Dual readiness, listing upcoming FCN events, and reporting data source status. It is not a full multi-asset risk engine yet.
- Intelligence Center v1: v3.40 makes `/my-ixai/intelligence` a first working intelligence workspace by linking Daily / Weekly / Market sources, surfacing FCN highlights, and labeling portfolio-aware news / commentary readiness without external providers.
- Intelligence + Market Integration Program: v4.00 plans the connective layer between existing centers. It should not rebuild existing FCN, portfolio, market, risk, or intelligence systems; it should normalize data flow, source status, and ownership boundaries so users can understand what matters in their holdings and market context today.
- Portfolio Truth Layer: v4.01 provides the first shared readback across Portfolio Center, Risk Center, and Intelligence Center. It reports FCN / Stock / Crypto counts, known notional, source status, available symbols, and missing-data warnings from existing active-app APIs only.
- Portfolio Intelligence UI: v4.02 makes the Truth Layer visible inside Portfolio Center through counts-based allocation, holdings summary, top symbol occurrence, source health, and missing-data warnings. It remains a UI / visualization layer only.
- Risk Intelligence Layer: v4.03 makes the Truth Layer visible inside Risk Center through concentration risk, top exposure aggregation, FCN worst-of summary, and data quality risk summary. It remains deterministic and does not add market data, AI, broker sync, recommendations, or trading behavior.
- Intelligence Readback Layer: v4.04 makes Portfolio Truth and Risk Intelligence visible inside Intelligence Center through portfolio summary, risk snapshot summary, exposure intelligence summary, and readiness warning summary. It does not add AI commentary, LLM integration, news provider, market data, broker sync, recommendations, or trading behavior.
- Market Abstraction Layer: v4.05 defines provider-agnostic market quote, snapshot, and news contracts plus a deterministic MockProvider. It is a contract foundation only and does not connect external APIs or write data.
- Market Readiness UI: v4.06 makes provider registry readiness visible inside Intelligence Center. It remains metadata-only and does not call external market or news services.
- Provider Health Framework: v4.07 adds deterministic provider status, data freshness, priority, fallback policy, and health summary contracts for future Workspace Market Service routing.
- Portfolio Intelligence Dashboard: v1.85 combines the existing FCN Risk and Intelligence layers into health score, status, risk distribution, and monitoring highlights on `/risk` and `/pro`.
- Membership / Entitlement Foundation: v1.86 defines Free / Basic / Pro tiers, App entitlement fields, visible `/pro` guard, and Membership Status display on `/account` and `/pro`. Payment, pricing, and upgrade flow remain future work.
- Multi-Asset Foundation: v1.87 introduces asset categories FCN / STOCK / CRYPTO / GRID / DUAL / CASH and additive dashboard fields for asset allocation summary, category counts, and portfolio asset categories.
- Portfolio Center UI: v1.88 adds `/my-ixai/portfolio` as the first user control surface for Portfolio Overview, Multi-Asset Allocation, FCN Risk Dashboard, Portfolio Intelligence, and Membership Status. `/portfolio` remains the input route.
- Portfolio Architecture Visualization: v1.89 adds an IXAI Architecture Map inside Portfolio Center to show enabled Portfolio, Risk, Intelligence, Membership, and Readback layers, plus Coming Soon boundaries for Broker Integration, Market Data API, Payment / Billing, and AI Advisory Agent.
- Portfolio Input Foundation: v1.90 adds `/my-ixai/input` as the Asset Input Hub and defines a pure TypeScript global asset model for FCN, Stock, Crypto, Grid, Dual, Cash, CSV import, future broker / exchange / bank sources, global regions, and supported language codes. It adds no DB, API, migration, market data, broker, news, or AI integration.
- Portfolio CRUD Foundation: v1.91 adds `/my-ixai/portfolio/assets` as a mock-only Asset Management Center with create, read, update, and delete UI state. It adds no DB, API, migration, auth, membership, broker, news, AI, or trading integration.
- Portfolio Data Model Foundation: v1.92 adds Portfolio Account → Asset → Position types, mock repositories, and additive Supabase migration foundation for `portfolio_accounts`, `portfolio_assets`, and `portfolio_positions`. UI persistence is still not connected.
- Portfolio Repository Foundation: v1.93 adds the Repository contract between UI and future persistence. The active repository source is mock-only; Supabase persistence remains Coming Soon.
- Portfolio Persistence Foundation: v1.94 adds Supabase-backed repository read/create for Asset Management Center. It uses authenticated Supabase sessions and RLS; Update / Delete remain Coming Soon.
- Portfolio Ownership Validation: v1.95 displays current user, current account, account count, asset count, position count, repository source, and RLS status.
- Portfolio Dashboard Foundation: v1.96 uses the Repository Layer to visualize account totals, asset totals, position totals, asset category allocation, provider allocation, region allocation, and dashboard status inside `/my-ixai/portfolio`.
- Portfolio News Intelligence Foundation: v1.97 maps repository assets into a deduplicated tracked-symbol universe. It supports STOCK, CRYPTO, FCN underlyings, GRID, DUAL, and ignores CASH. It adds no News API, AI provider, market data, broker sync, API route, migration, schema, auth, membership, or entitlement changes.
- Portfolio News Provider Foundation: v1.98 adds a mock Portfolio News Provider contract and Portfolio News Feed readback from Intelligence Universe symbols. It is provider architecture only and does not connect News API, AI commentary, market data, broker sync, API routes, migrations, schema, auth, membership, or entitlement changes.
- Portfolio AI Commentary Foundation: v1.99 adds mock commentary types, provider contract, deterministic commentary provider, and Portfolio AI Commentary readback from the existing News Feed. It does not call OpenAI, Claude, Gemini, Anthropic, News API, market data, broker sync, API routes, migrations, schema, auth, membership, or entitlement systems.
- Portfolio Intelligence Engine Foundation: v2.00 adds mock intelligence engine types, contract, deterministic scoring, and Portfolio Intelligence Score readback from Repository -> News -> Commentary -> Intelligence Engine. It does not call OpenAI, Claude, Gemini, Anthropic, News API, market data, broker sync, API routes, migrations, schema, auth, membership, or entitlement systems.
- Portfolio Risk Engine Foundation: v2.01 adds mock risk engine types, contract, deterministic risk report, and Portfolio Risk Engine readback from repository accounts, assets, and positions. It does not add recommendation logic, market data, News API, broker sync, API routes, migrations, schema, auth, membership, or entitlement changes.
- Portfolio Recommendation Engine Foundation: v2.02 adds mock recommendation types, contract, deterministic monitoring prompts, and Portfolio Recommendation Engine readback from the existing Portfolio Risk Report. It does not add market data, News API, broker sync, API routes, migrations, schema, auth, membership, entitlement, external AI, or trading functionality.
- Portfolio Market Data Foundation: v2.03 adds mock market snapshot types, provider contract, deterministic mock provider, and Portfolio Market Data readback from the existing Intelligence Universe. It does not add real market data, Yahoo Finance, Binance, CoinGecko, Finnhub, Polygon, API routes, migrations, schema, auth, membership, entitlement, recommendation logic, or trading functionality.
- Portfolio Valuation Engine Foundation: v2.04 adds valuation types, allocation types, a valuation engine contract, deterministic mock valuation engine, and Portfolio Valuation / Allocation readback from repository assets, positions, and mock market snapshots. It does not add real market data, broker sync, API routes, migrations, schema, auth, membership, entitlement, recommendation logic, or trading functionality.
- Portfolio Exposure Engine Foundation: v2.05 adds exposure types, an exposure engine contract, deterministic mock exposure engine, and Portfolio Exposure readback from repository assets, market snapshots, and valuation output. It does not add real market data, broker sync, API routes, migrations, schema, auth, membership, entitlement, recommendation logic changes, or trading functionality.
- Portfolio Concentration Engine Foundation: v2.06 adds concentration types, a concentration engine contract, deterministic mock concentration engine, and Portfolio Concentration readback from the existing Exposure Report. It does not add real market data, broker sync, API routes, migrations, schema, auth, membership, entitlement, recommendation logic changes, or trading functionality.
- Portfolio Correlation Engine Foundation: v2.07 adds correlation types, a correlation engine contract, deterministic mock correlation engine, and Portfolio Correlation readback from the existing Exposure Report and Concentration Report. It does not add real market data, broker sync, API routes, migrations, schema, auth, membership, entitlement, recommendation logic changes, or trading functionality.
- Portfolio Scenario Engine Foundation: v2.08 adds scenario types, a scenario engine contract, deterministic mock scenario engine, and Portfolio Scenario readback from existing Valuation, Exposure, Concentration, and Correlation reports. It remains market-agnostic and does not add real market data, broker sync, API routes, migrations, schema, auth, membership, entitlement, recommendation logic changes, or trading functionality.
- Portfolio Stress Test Engine Foundation: v2.09 adds stress-test types, a stress-test engine contract, deterministic mock stress-test engine, and Portfolio Stress Test readback from existing Valuation, Exposure, Concentration, Correlation, and Scenario reports. It remains market-agnostic and does not add real market data, broker sync, API routes, migrations, schema, auth, membership, entitlement, recommendation logic changes, or trading functionality.
- Portfolio FCN Risk Engine Foundation: v2.10 adds FCN-risk types, an FCN-risk engine contract, deterministic mock FCN-risk engine, and Portfolio FCN Risk readback from existing Portfolio Assets, Exposure, Concentration, Correlation, and Stress Test reports. It remains market-agnostic and does not add real market data, broker sync, API routes, migrations, schema, auth, membership, entitlement, recommendation logic changes, or trading functionality.
- Global Market Foundation Review: v2.10a reviews Portfolio Core foundation readiness for global markets, global FCN products, multi-language, multi-broker, Legacy Pro migration, real market data, and platform IA. It is docs-first and does not add product code, UI redesign, API, schema, migration, provider integration, or trading functionality.
- Legacy Pro Migration Audit and Product Inventory: v2.11 reviews Legacy Pro, AI Morning Brief, FCN Monitoring, Intelligence modules, Portfolio modules, and active App functionality before v3.00. It creates the product inventory matrix and recommends splitting the App into Home, Portfolio Center, Risk Center, FCN Center, Intelligence Center, and Settings. It is docs-first and does not add product code, UI redesign, API, schema, migration, provider integration, or trading functionality.
- UX IA Foundation: v3.00 establishes workspace route placeholders and navigation for Home, Portfolio Center, Risk Center, FCN Center, Intelligence Center, and Settings. It does not move business logic, add investment features, add providers, change auth, change schema, add migrations, or change APIs.
- Navigation Separation Foundation: v3.01 separates public website navigation from Workspace application navigation across desktop sidebar, mobile drawer, and mobile bottom navigation. It keeps public content routes intact and does not change auth, membership, entitlement, APIs, schema, migrations, engines, providers, or recommendation logic.
- Workspace Entry Migration: v3.02 makes `/my-ixai/home` the logged-in entry point, updates `/account` into a transition page, and removes Legacy Pro as the primary post-login path. It does not redesign auth, change auth provider behavior, alter membership / entitlement rules, add APIs, change schema, add migrations, or modify engines.
- IXAI Platform Page: v3.03 repositions `/pro` into a public product-positioning and conversion page for IXAI Platform. It removes the page's dependency on Legacy Pro launch / membership readback while keeping the route stable and public. It does not change membership, entitlement, auth, schema, migrations, broker integrations, external AI, market data providers, APIs, or trading logic.
- Asset Input Center: v3.04 makes `/my-ixai/input` the canonical Workspace asset onboarding route, adds Stock / ETF, Crypto, and FCN child routes, and moves FCN Wizard ownership into `/my-ixai/input/fcn`. Public `/fcn` remains educational and should not own data-entry workflow.
- Portfolio Workspace Foundation: v3.05 makes `/my-ixai/portfolio` readable to normal users with Overview, Holdings Summary, Risk Snapshot, and Quick Actions. It does not add APIs, schema changes, real risk engine connections, broker integration, market data, AI, recommendation logic, or trading logic.
- Pro Intelligence: future Portfolio Intelligence, Risk Intelligence, AI Alerts, and SaaS-gated Pro workflows inside the active App.
- FCN Draft Store Transition: v3.08 / v3.08a created a local draft-store bridge from FCN Wizard to FCN Center. v3.09 supersedes that as the primary product source of truth by reading persisted `/api/fcn` records from Supabase.
- FCN Position Foundation: v3.09 makes `/my-ixai/fcn` a real readback surface for existing Supabase-backed FCN positions created by `/my-ixai/input/fcn`. It uses the existing `/api/fcn` data path and does not introduce a local draft store, schema change, market data, broker sync, AI provider, recommendation logic, or trading logic.
- FCN Risk Foundation: v3.10 adds first-pass risk monitoring to `/my-ixai/fcn`: high-risk count, watch count, unknown-data count, underlying concentration, worst underlying, worst KI distance, and per-position GREEN / YELLOW / RED / UNKNOWN status. It uses stored current price only and does not add live market data or external providers.
- FCN Intelligence Center: v3.20 upgrades `/my-ixai/fcn` into the practical FCN workspace with lifecycle filters, local manual price overlay, timeline / event center, Risk Engine v2 score, and concentration analysis. It does not add schema, migration, live market data, broker sync, AI provider, recommendation logic, or trading logic.
- Admin / Editorial Intelligence: human-reviewed Daily / Weekly generation, Provider Health, Coverage Score, Social Pack production, and future Publish Center operations.

## v1.67.0 — App ↔ Pro SSO Launch Prototype

v1.67.0 starts the first safe App to Pro identity handoff. The production App remains the Supabase Auth surface and the legacy IXAI Pro Lab remains a separate FastAPI JWT environment, but the App can now prepare a short-lived one-time launch code for `開啟 IXAI Pro`.

The prototype proves that Legacy Pro can receive App identity without exposing Supabase refresh tokens, service role keys, or long-lived credentials in a URL. It does not remove the legacy Pro login, does not issue a production Pro session, and does not change membership, entitlement, Stripe, portfolio, FCN, or trading behavior.

## v1.67.1 — Promote Pro SSO CTA

v1.67.1 makes the App to Pro launch prototype visible in the primary user flow. `/pro` now leads with `開啟 IXAI Pro` as the first hero CTA, while `/account` surfaces the same launch action near the top of the Pro card. This version only promotes the SSO launch entry point; it does not change launch-token behavior, Legacy Pro receive behavior, auth, backend, Daily / Weekly generation, provider ingestion, or FCN education content.

## v1.67.2 — Account Icon Cleanup

v1.67.2 cleans the remaining off-style account icons in the `關注清單與接收偏好` area. Account lower-section card markers now follow the shared `FeatureIcon` rule from v1.64.2: forest container, gold/cream glyph, visible border, and minimum 32px. This is visual-only and does not touch SSO logic, `/api/pro/launch`, Legacy Pro receive, backend, auth, Daily / Weekly, providers, FCN content, or page layout.

## v1.68.0 — App ↔ Pro Unified Identity MVP

v1.68.0 turns the v1.67 App to Pro handoff into the first usable identity bridge. App `/api/pro/launch` remains stable: it validates the Supabase user, issues a short-lived one-time launch code, and never exposes Supabase access or refresh tokens in the URL. Legacy Pro now validates the launch code, creates a clearly marked short-lived `ixai_sso_v1` MVP session, and redirects the user into `/dashboard` instead of leaving them on the Pro login path.

This is not a full Supabase migration and not paid Pro authorization. The MVP session is a local UI bridge for Legacy Pro only; it does not grant backend Portfolio / FCN / Risk data access, does not replace FastAPI JWT login, and does not change membership or entitlement rules. Future v1.69+ work should replace the localStorage MVP marker with a safer shared Supabase / backend-validated session model.

## v1.69.0 — Pro Session Hardening

v1.69.0 stabilizes the v1.68 local App-to-Pro session bridge. Legacy Pro now uses a structured `ixai_sso_v2` session object with provider, App user id tail, masked email, issuedAt, expiresAt, and source fields. Session helpers are centralized around `getProSession`, `setProSsoSession`, `clearProSession`, `isSsoSession`, `isLegacyJwtSession`, and `isSessionExpired`.

The hardening goal is practical stability: refresh should keep a valid SSO user in `/dashboard`, protected Legacy Pro routes should accept either a legacy FastAPI JWT or the App SSO marker, and backend API 401 responses under SSO should produce degraded UI states rather than immediately destroying the SSO session. The marker remains localStorage MVP infrastructure and does not authorize paid Pro, portfolio, FCN, risk, trading, or broker functionality.

## v1.70.0 — SSO Stability Validation

v1.70.0 is a validation-only checkpoint after the v1.69.1 Legacy Pro persistence fix. It documents the required App to Pro SSO stability checklist: launch from the App, land in Legacy Pro `/dashboard`, refresh without falling back to `/login`, switch Pro routes without destroying the SSO session, handle invalid / replayed codes safely, and keep Legacy Pro logout separate from the App Supabase session.

No product behavior changes are introduced in the App for v1.70.0. App `/api/pro/launch`, SSO launch-code behavior, backend membership / entitlement logic, Daily / Weekly generation, provider ingestion, FCN content, Stripe, broker, trading, and portfolio engines remain out of scope. See `docs/SSO_STABILITY_VALIDATION_V170.md` before running production SSO release QA.

## v1.70.2 — App Login Entry Fix

v1.70.2 clarifies the App login entry after Pro logout QA. `/login` is now visibly an existing-user login surface with the title `進入 IXAI`, a primary `登入` action, and a secondary `建立 IXAI Account` path. `/register` remains the account creation page. This is a UX copy / hierarchy fix only; it does not change Supabase auth logic, SSO launch behavior, Legacy Pro session behavior, backend, Daily / Weekly generation, FCN content, providers, Stripe, trading, or portfolio engines.

Current surface relationship:

```text
Public App
├─ Landing / Share / Daily / Weekly: trust-building Public Intelligence
├─ Onboarding: captures markets, watchlist seed, risk preference, and intelligence interests
├─ Account: lightweight AI Intelligence Workspace with preference memory and LINE readiness
├─ IXAI Pro / Pro Preview / Pro Intelligence: future paid/intensive intelligence path
├─ Admin Editorial Studio: internal human-in-the-loop content operations
└─ Social Intelligence Engine: converts reviewed Daily / Weekly briefs into manual FB / IG / LINE assets
```

Public Intelligence Engine now includes foundation-level modules for Market Pulse, Macro Watch, AI / Tech Watch, Crypto Watch, FCN Awareness, and Risk Regime. v1.40.3a adds production polish for compliance language, mobile rhythm, CTA hierarchy, and Public-to-Account narrative continuity.

Watchlist Intelligence Lite now surfaces onboarding watchlist seed, selected markets, and intelligence preferences inside the Account Intelligence Workspace. It maps user interests to Public Intelligence modules without implying holdings, portfolio analysis, personal FCN risk conclusions, or trading recommendations.

LINE Delivery Foundation now adds local/session-first delivery preferences, Account delivery readiness UI, and opt-in / pause / unsubscribe concepts without activating real LINE push automation. Delivery language separates Public, Account, and Future Pro intelligence delivery.

Mobile Visual QA readiness now adds a lightweight 390px browser smoke check for public, account/pro gated, and admin surfaces. The QA script verifies route load, no obvious application/hydration error text, no horizontal overflow, and route-specific key UI text.

Social Intelligence Engine foundation now turns reviewed Daily / Weekly Intelligence into manual FB / IG / LINE social content packs. The current implementation provides 9:16 story-style preview cards, caption drafts, 一玄 / IXAI visual framing, official logo usage, reusable brand tokens, client-side PNG export, and compliance footnotes for human-reviewed manual publishing only. v1.40.6c redesigned the pack layout toward institutional research and social-first readability. v1.40.6d adds Social Pack Layout Safety: a fixed header / main / footer safe-area structure, capped social typography ceilings, render-layer text compression helpers, and a simplified single-state risk panel so exported PNGs no longer suffer footer / disclaimer overlap, oversized headlines, or symbol-tag clipping.

Daily Intelligence Content Engine now upgrades generated Daily Brief drafts into a fixed editorial structure: Executive Summary, Macro Watch, AI / Tech Watch, Crypto Watch, Risk Regime reasoning, FCN Awareness, and I-Xuan View. Drafts now carry Provider Health, Coverage Score, and Content Quality Score metadata so the Editorial Studio can judge source health and content depth before manual publish.

Daily Brief Public Preview QA / UI Polish now keeps v1.41.0 diagnostics admin-only, sanitizes public Daily Brief API responses, and improves generated Daily Brief reading hierarchy for Executive Summary, Risk Regime reasoning, FCN Awareness, I-Xuan View, and Taiwan Market continuity.

Social Pack Renderer Hardening now makes Daily Intelligence Social Pack PNG output safe for external LINE / FB / IG use by reserving header/main/footer safe areas, removing clipped core headings, rendering Executive Summary / AI Tech / Risk / FCN / I-Xuan View as concise complete social copy, and keeping disclaimer and footer separated from content.

News Provider Recovery & US Equity Coverage Expansion now increases real Daily Intelligence intake coverage by enabling verified public RSS sources for CNBC, CNBC Technology, Nasdaq, Seeking Alpha, The Block, and Decrypt while keeping unstable or legally unverified sources disabled with explicit reasons. Provider Health now distinguishes production active, recoverable, experimental, disabled, failed, and empty-feed states.

Intelligence Distribution Layer foundation now connects Account Intelligence preferences to a local/session-first Distribution Preference model and a read-only Admin Distribution Queue. The flow is Generate Intelligence → Review Intelligence → Distribute Intelligence → Measure Intelligence, with only In-App channel enabled. LINE, Email, and Push remain future disabled channels; no external delivery or automation is active.

Daily Intelligence Experience Upgrade now shifts Daily Brief from summary-first news classification into interpretation-first Market Intelligence Brief. The Daily experience now leads with 今日一句話, 今日最重要的三件事, Market Interpretation, Investor Watchpoints, and a fuller I-Xuan View. Social Packs now extract and rewrite market insight for social distribution instead of filling templates with raw brief fragments.

Market Memory Layer now adds a lightweight Daily Intelligence memory foundation. Generated Daily Briefs can compare today's market signal against recent generated / published briefs, surface What Changed Since Last Brief, attach continuity tags, and make I-Xuan View read with market continuity rather than single-day isolation. This is editorial-first market narrative memory only, not user-specific portfolio memory.

Social Media Optimization Layer now makes Social Packs platform-aware. Admin Social Pack Studio supports IG Feed / Carousel 4:5 export at 1080 × 1350 as the primary feed format while preserving Story / Reels 9:16 export at 1080 × 1920 for LINE / Story distribution. The same reviewed intelligence pack can now be previewed and exported for different social contexts without auto-publishing.

Intelligence Source of Truth Architecture now makes Daily Intelligence Core the shared source for Public Daily Brief and Daily Social Pack. Daily Core standardizes todaySignal, topThreeThings, marketInterpretation, investorWatchpoints, whatChanged, continuityTags, I-Xuan View, socialHooks, and weeklySignals. Social Pack is now an entry asset derived from reviewed Daily / Weekly intelligence instead of a parallel content generator.

Weekly Revision Workflow Phase 1 selects the Option B revision model for same-week Weekly Intelligence revisions. The project now contains a reviewed migration SQL plan and backward-compatible code support for revision_number, parent_weekly_id, is_canonical, superseded_at, superseded_by, and revision_note. Production migration is not applied automatically; until the migration is manually approved and executed, Weekly generation keeps the current locked behavior and clearly explains that revision workflow requires migration. Public Weekly routes remain canonical-only when the revision schema is available, and fall back to status=published reads before migration.

Social Conversion Layer now treats Social Pack as the conversion entry point into Daily / Weekly Intelligence rather than a compressed brief. Daily Intelligence Core now carries headline, headlineHook, conversionHook, socialThesis, socialCuriosity, socialCTA, weeklyThesis, and contentFunnelTarget so the public Daily title, SEO title, Social Slide 1 hook, and Slide 5 CTA follow one content funnel. Daily Social Pack slides now map to stop-scroll hook, curiosity builder, signal explainer, risk contrast, and I-Xuan View + contextual CTA.

Periodic Intelligence Engine Correction now re-centers the content architecture around news sources and the IXAI Intelligence Engine. Daily, Weekly, Monthly, and Yearly are separate period outputs. Daily uses recent daily news intake; Weekly uses weekly news intake, the weekly categorizer, upcoming-week calendar, and periodic narrative model as its primary source. Daily Core may provide optional continuity context, but Weekly is no longer primarily Daily aggregation. Daily and Weekly Social Packs are conversion entries for their respective period briefs, not compressed article images.

IXAI Insight Engine Fix now adds the missing core interpretation layer between news intake and period outputs. Daily and Weekly generation now follow News Source → Event Extraction → Signal Extraction → Tension / Change Detection → Insight Generation → Brief → Social Pack. The engine produces keyEvents, marketSignals, narrativeTension, whatChanged, whyItMatters, whatToWatchNext, I-Xuan View, and socialFunnel fields so briefs and social assets carry actual market interpretation instead of summary fallback text.

Question Driven Intelligence Engine now makes Daily and Weekly outputs start from the market question users actually have. Each intelligence output carries centralQuestion, keyAnswer, evidence, counterEvidence, whatChangesMyMind, watchNext, and I-Xuan View. Daily / Weekly Social Packs now follow a question-led funnel instead of repeating the same AI / rates thesis across slides.

Evidence Quality Sprint now makes the evidence layer event-first instead of conclusion-first. Daily and Weekly question-driven outputs now carry scored evidence details with event, source, whyItMatters, category, and score. Weekly Social Pack is rewritten around What Changed This Week, The One Thing That Matters, Next Week catalysts, and I-Xuan Weekly View.

Weekly Persistence Fix + Social Pack Layout System now makes Weekly generation failures observable instead of generic. When the current week is blocked by an existing published Weekly row and the revision migration is not applied, the Admin UI surfaces the existing weekly id/slug, exact blocked reason, migration requirement, and next action. Social Pack rendering now uses format-specific layout rules, text compression, and separate 4:5 / 9:16 constraints so exported cards reserve footer safe area and avoid paragraph overflow.

Social Intelligence Rewrite now moves Social Pack generation from Brief compression into slide-native social cards. Daily Social Pack is generated as Hook → What the market is seeing → Real risk → Watch next → I-Xuan View, while Weekly Social Pack is generated as Weekly question → What changed this week → The one thing that matters → Next week catalysts → I-Xuan Weekly View. Social assets remain manual publishing material and still route readers back into Daily / Weekly Intelligence.

Daily / Weekly Social Pack Divergence Fix now separates Daily and Weekly social narrative source priority. Daily Social Pack answers today's market question, today's signal, and today's watch-next items; Weekly Social Pack answers what changed this week, next-week catalysts, and period-specific I-Xuan Weekly View. Weekly social cards must not reuse Daily Core as their primary thesis source.

LINE OAuth Prefetch CORS Fix now prevents the LINE login entry from being prefetched as a Next.js RSC request. The LINE OAuth link uses normal document navigation to `/api/line/login`, so `/pro-preview` no longer triggers `access.line.me` CORS console errors during route load.

IXAI App ↔ IXAI Pro Integration Foundation now creates the first formal connection between the production app and the backend / legacy Pro Lab world. The production app exposes `/api/backend/health` as a server-side backend health proxy, reads `IXAI_BACKEND_URL` with development-only localhost fallback, and surfaces IXAI Pro Lab entry points on `/account`, `/pro`, and `/pro-preview` without migrating legacy UI, legacy JWT auth, or direct browser-to-FastAPI protected requests.

App User → Pro Access Identity Bridge now lets the production app derive a Pro access state for the current App user without granting paid rights by default. The bridge resolves `not_connected`, `connected`, `preview`, `active`, `expired`, and `revoked` states from existing identity / membership data, exposes `/api/pro/access`, and keeps Portfolio / FCN capabilities closed unless an active Pro entitlement exists.

Supabase User → Backend Account Link design now clarifies that App users and legacy Pro Lab users are not the same identity yet. App users live in Supabase Auth; Pro Lab users currently live in the backend FastAPI JWT users table. `/account` Pro Lab links must present the external dashboard as a separate preview environment and must not imply that an App password can log into the legacy Pro Lab. The target bridge is Supabase user → Next API server-side verification → backend account link / lookup → backend account id and Pro access state.

Supabase User → Backend Account Link foundation now adds the first production-app server-side account-link boundary. `/api/pro/account-link` verifies the Supabase App user through the App layer, builds the future backend create-or-find payload, and attempts the backend contract only from the Next API route. `/api/pro/access` now reports accountLink status separately from paid Pro entitlement. If `IXAI_BACKEND_URL` is not configured or the backend endpoint is not implemented, the app shows `backend_not_configured` / `backend_contract_missing` without exposing secrets, backend URLs, portfolio data, FCN data, or granting paid Pro access.

Real Pro Bridge + Icon Cleanup clarifies the current relationship between the production App and the existing IXAI Pro Lab. `app.ixuan.ai` now presents the existing Pro Lab as a clear external preview environment, while the new in-app Pro workspace remains a secondary beta skeleton. There is no true shared-login SSO yet: App users should not assume their app.ixuan.ai password works in the legacy Pro Lab unless assigned separate Pro Lab credentials. Pro CTAs and icons must use readable contrast, visible labels, and normal external anchors for Pro Lab navigation.

Unified Login Foundation documents the target identity architecture for true App → Pro shared login. The recommended target is Supabase Auth as the single identity source, backend accounts as the product ownership layer, and backend subscriptions / entitlements as the authorization layer. Legacy Pro still uses FastAPI JWT + `localStorage` today, so v1.60.0 does not change production login behavior. See `docs/SSO_FOUNDATION_PLAN.md` before implementing any SSO prototype, token exchange, or legacy login retirement.

SSO Prototype & Implementation Readiness turns the v1.60 identity foundation into a concrete implementation specification. `docs/SSO_IMPLEMENTATION_PLAN.md` defines the target "login once in App, enter Pro without second login" flow, compares Unified Supabase Auth against a transitional JWT Exchange Bridge, and recommends prototyping Unified Supabase Auth first while keeping JWT Exchange as fallback. v1.61.0 is still docs / architecture only; it does not enable production SSO, change App login, change Legacy Pro login, issue new JWTs, or modify Supabase configuration.

SSO Design Review validates that the v1.60 / v1.61 architecture is implementable before writing authentication code. The review concludes GO with constraints: Legacy Pro can migrate toward Supabase Auth, but only if its session source, protected route gate, API Authorization header, and backend JWT validation model are changed together. `docs/SSO_FILE_CHANGESET.md`, `docs/SSO_PROTOTYPE_BLUEPRINT.md`, and `docs/SSO_SECURITY_REVIEW.md` define the expected file impact, v1.62-v1.66 rollout, rollback path, and security controls. v1.61.1 remains documentation-only and does not change production authentication.

Content Intelligence Foundation pauses v1.62 SSO implementation work to document the Daily / Weekly / Social Pack content-engine failure mode first. `docs/DAILY_BRIEF_ROOT_CAUSE_ANALYSIS.md` confirms that production does not expose a published `daily-intelligence-2026-06-03` brief and that repeated Daily titles / Social Packs are primarily caused by deterministic AI + macro question-driven narrative logic in the content engine. `docs/CONTENT_ENGINE_V162_PLAN.md`, `docs/CONTENT_ENGINE_ARCHITECTURE.md`, and `docs/PROVIDER_HEALTH_REVIEW.md` define the v1.62.1 implementation scope, provider health boundaries, Asia/Taipei product-date design, regression tests, and rollback plan. v1.62.0 remains documentation-only and does not modify generation code.

Content Engine Rewrite v1.62.1 implements the approved content-engine safety patch. Daily AI + Macro narrative no longer returns fixed question-driven copy, Daily title selection now checks recent 7 Daily titles before publishing near-duplicates, Daily Social Pack builds social-native card copy instead of directly reusing Daily `questionDriven`, Weekly summary layers prioritize weekly periodic narrative, Daily draft / slug generation uses Asia/Taipei product date, and provider health now exposes structured disabled reason codes for sources such as Yahoo Finance and Bloomberg. See `docs/CONTENT_ENGINE_REWRITE_V162.md`.

Taiwan User UX Cleanup v1.63.0 localizes normal user-facing pages for Taiwan users, simplifies mixed English / engineering copy, and separates user information from internal system diagnostics. `/account`, `/pro`, `/pro-preview`, `/portfolio`, `/fcn`, `/risk`, `/daily-brief`, and `/weekly-brief` now favor Traditional Chinese labels such as 每日晨報, 每週情報, 關注清單, 投資組合分析, FCN 監控, 風險中心, 會員方案, 帳號綁定, and 系統連線. Admin and technical surfaces may retain diagnostics, but normal users should not see raw backend / entitlement / feature-gate language. See `docs/TAIWAN_USER_UX_CLEANUP_V163.md`.

UX Product Role Correction v1.63.1 restores the App / Pro product boundary after the v1.63 localization pass. The App is the public market intelligence, education, account, and membership entry surface. IXAI Pro is the advanced investment workspace. `/fcn` must be an FCN education and introduction page, not a free App FCN monitoring skeleton. Personal FCN monitoring, KI / KO watch, worst-of monitoring, coupon calendars, portfolio analysis, and risk-engine workflows belong to Pro / paid / beta surfaces only. Daily and Weekly archive pages should prioritize reading and avoid foregrounding Public Intelligence Engine architecture cards. See `docs/UX_PRODUCT_ROLE_CORRECTION_V1631.md`.

Unified Pro Product Integration now makes app.ixuan.ai the primary IXAI Pro beta surface. During Beta Open Access, authenticated and account-linked users can enter Portfolio Intelligence, FCN Monitoring, and Risk Engine workspace skeletons inside the production app. This is not permanent free Pro, Stripe billing, broker access, real Portfolio / FCN data, trading execution, or investment advice. The legacy Pro Lab remains a reference-only environment rather than the primary product entry.

Pro Module Product Pages Redesign v1.65.0 turns `/pro`, `/portfolio`, and `/risk` from skeleton / permission pages into product-value pages for Taiwan users. `/pro` explains IXAI Pro as the advanced monitoring workspace with FCN first, Portfolio second, and Risk Center third. `/portfolio` explains asset allocation, concentration, theme exposure, FCN overlap, and market-risk linkage without loading real holdings. `/risk` explains market regime, scenarios, FCN risk, concentration, and AI risk summaries without becoming a trading or advice surface. App remains education / public intelligence / lead capture; Pro remains the paid or invited professional monitoring workspace; consulting remains the high-touch advisory service. See `docs/PRO_MODULE_PAGES_REDESIGN_V165.md`.

Homepage Conversion Redesign v1.66.0 turns `/` from an internal product-system explanation into a Taiwan investor conversion page. The homepage now explains IXAI as 一玄 AI 投資助理, frames I-Xuan's credibility through FCN advisory and market monitoring origins, makes FCN monitoring the Pro moat, separates App / Pro / Consulting roles, and gives visitors clear next steps: read Daily Brief, learn FCN, apply for Pro testing, or book advisory consultation. See `docs/HOMEPAGE_CONVERSION_REDESIGN_V166.md`.

Latest engineering health check:

- Engineering Health Score: 8.2/10.
- Latest commit: `385ff518f9ee57b58c1b4fbb1fc98473563201a7`.
- `main` and `origin/main` synchronized.
- Working tree clean at audit time.
- `npm run lint` passed.
- `npm run build` passed.
- 390px mobile QA passed.
- Production route QA passed for `/`, `/daily-brief`, `/weekly-brief`, `/share`, `/pro`, `/pro-preview`, `/account`, and `/admin`.
- No hydration errors found in checked routes.
- No LINE OAuth CORS errors found after the v1.50.2 fix.

## B1. Legacy Frontend Classification

`/Users/itsunkuo/Desktop/IXAI_PROJECTS/frontend/ixai-website-clean` is not the production frontend. It is a legacy Pro / Portfolio Dashboard prototype that already connects to `/Users/itsunkuo/Desktop/IXAI_PROJECTS/backend/ixai_agent`.

The legacy frontend uses FastAPI JWT auth, `localStorage` token storage, and direct browser-to-FastAPI protected requests through `NEXT_PUBLIC_API_BASE_URL`. The current production mainline, `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app`, uses Supabase identity, Next API routes, public intelligence surfaces, editorial workflows, and the current IXAI design / conversion architecture.

Future development should not migrate the legacy frontend wholesale. The recommended strategy is hybrid reuse:

- Keep `app/ixai-web-app` as the active production frontend.
- Treat `frontend/ixai-website-clean` as a reusable legacy Pro / Portfolio Dashboard reference.
- Reuse UI patterns, portfolio widgets, FCN risk information architecture, asset-allocation layout ideas, alert taxonomy, and backend API contract ideas.
- Avoid directly migrating legacy JWT login, `localStorage` token auth, direct browser-to-FastAPI protected requests, the whole legacy `AppShell` navigation, or the terminal-heavy visual style.

High-value reusable modules and patterns include:

- `RiskPill`
- `StatusBadge`
- `SummaryCard`
- `PortfolioEnginePanel`
- `MarketEnginePanel`
- `ScenarioSensitivityPanel`
- `DashboardTodayFocus`
- FCN position / schedule display pattern
- Asset allocation layout
- Alert center taxonomy
- Backend API client contract ideas

## B2. IXAI Pro Integration Foundation

The v1.51 integration direction connects the current production app, the legacy Pro dashboard prototype, and the FastAPI backend without merging them prematurely.

Current roles:

- `app/ixai-web-app`: Active Production App, public app mainline, Supabase / Next API based.
- `frontend/ixai-website-clean`: IXAI Pro Legacy Dashboard Prototype, already connected to `backend/ixai_agent`.
- `backend/ixai_agent`: Active Backend Mainline Candidate for portfolio, FCN, crypto, alerts, account, preferences, imports, and intelligence APIs.
- `brand/ixuan-brand-site`: Brand / Social Kit side project.

v1.51.0 adds:

- `/api/backend/health`: first server-side IXAI App → Backend health proxy.
- `/account`: Pro integration card with backend status.
- `/pro`: IXAI Pro Lab external entry.
- `/pro-preview`: IXAI Pro Lab external entry.
- `docs/PRO_INTEGRATION_PLAN.md`: formal integration sequence.

v1.51.1 adds:

- `/api/pro/access`: server-side Pro access status API.
- `src/lib/pro/access.ts`: Pro access decision helper using existing identity / membership data.
- Account Pro status card showing `not_connected`, `connected`, `preview`, `active`, `expired`, or `revoked`.
- Pro / Pro Preview messaging that Pro access is account-based but entitlement-controlled.
- Future billing / entitlement model documentation.

v1.51.2 adds:

- `/account` Pro Lab UX clarification: Pro Lab is a separate preview environment.
- Pro Lab external link copy changed away from `Open IXAI Pro`.
- Explicit warning that App account login is not yet shared with the legacy Pro Lab.
- Supabase User → Backend Account Link design documentation.
- Backend contract options for create-or-find and lookup account mapping.

v1.52.0 adds:

- `POST /api/pro/account-link`: first server-side App → Backend account link contract boundary.
- `/api/pro/access` accountLink status alongside entitlement status.
- `/account` Account Link Status and `Connect Pro Account` action.
- Backend contract audit confirmation that `backend/ixai_agent` does not yet expose Supabase external-user linking fields or endpoints.
- Clear separation between identity linking and paid Pro entitlement.

The integration plan remains intentionally narrow:

- Do not migrate the legacy frontend wholesale.
- Do not migrate legacy JWT login or `localStorage` token auth.
- Do not let browser clients call protected FastAPI endpoints directly.
- Do not load real portfolio / FCN data before Supabase user → backend account mapping is approved.
- Do not connect Stripe, paid entitlement, broker integration, or trading workflows.

Current Highest Priorities:

1. v1.62.1 Content Engine implementation: remove deterministic Daily narrative repetition, add Asia/Taipei product-date key, and add Daily / Social / Weekly regression tests.
2. Weekly Revision Migration Review / Rollout.
3. Publish Center Foundation.
4. Monthly / Yearly Periodic Intelligence planning.
5. Continued Social Pack Period Divergence QA after future Daily / Weekly engine changes.

Growth Strategy:

- Current focus: seed users.
- Not current focus: paid ads or aggressive monetization.
- Primary channels: LINE, Facebook, Threads, existing FCN clients.

Completed product capabilities include:

- Public app live with responsive public UI.
- Public root landing system that explains IXAI before login and now prioritizes onboarding before preview or LINE decisions.
- UX cohesion pass aligning the simplified core path: Public Landing → Onboarding → AI Intelligence Workspace → Future Pro Interest.
- Public Intelligence access layer: Daily Brief, Weekly Intelligence, and Share Intelligence are publicly readable before account creation, then convert through onboarding / LINE / preview CTAs.
- Public Intelligence Engine foundation: Market Pulse, Macro Watch, AI / Tech Watch, Crypto Watch, FCN Awareness, and Risk Regime modules on public surfaces.
- Public Intelligence Engine polish: shared disclaimer layer, compliance review, mobile polish, CTA hierarchy refinement, Risk Regime explanatory layer, and Public-to-Account intelligence narrative improvements.
- Public route gate hydration fix: Public Intelligence routes now render without AuthEntryGate / session hydration blocking, and acquisition routes remain readable before account creation.
- Watchlist Intelligence Lite foundation: Account Intelligence Workspace now reflects onboarding watchlist seed and intelligence preferences.
- Local/session-first intelligence memory layer for selected markets, symbols, and interests.
- Public Intelligence modules can be mapped to user interests without personalization claims.
- LINE Delivery Foundation: Account delivery readiness UI, local/session-first delivery preference model, opt-in / pause / unsubscribe concept layer, and Public / Account / Future Pro delivery separation.
- Mobile Visual QA readiness: 390px mobile smoke check foundation and Playwright / browser QA readiness for public, account, Pro, and admin surfaces.
- Social Intelligence Engine foundation: Daily / Weekly Social Pack generation, 9:16 social story template preview, copy-ready caption drafts, and manual FB / IG / LINE publishing workflow support.
- 一玄品牌化 Daily / Weekly visual content framework for social distribution using forest green, muted gold, cream, and institutional editorial tone.
- Brand asset integration for Social Intelligence Engine using the official `/logo/ixuan-logo.png` asset.
- Consistent 一玄 / IXAI visual identity, institutional research branding, standardized Social Pack footer, and reusable social brand token structure.
- Social Pack PNG Export: Daily / Weekly Social Pack slides can be downloaded as 1080 × 1920 PNG assets.
- Screenshot workflow is no longer required for Social Pack distribution assets.
- Social Pack Layout Redesign: improved information hierarchy, institutional research style visual system, and social-first content presentation for Daily / Weekly Social Packs.
- Social Pack Layout Safety: fixed header / main / footer safe-area layout, capped social typography ceilings, render-layer text compression helpers, simplified single-state risk panel, and footer/disclaimer overlap prevention for exported 1080×1920 PNGs.
- Daily Intelligence Content Engine: Executive Summary, Macro Watch, AI Tech Watch, Crypto Watch, Risk Regime Reasoning, FCN Awareness, I-Xuan View, Provider Health, Coverage Score, and Content Quality Score.
- Daily Brief Public Preview QA / UI Polish: public Daily Brief API diagnostics sanitization, stronger generated Daily Brief reading hierarchy, compliance wording cleanup, and admin-only diagnostic boundary confirmation.
- Social Pack Renderer Hardening: Daily Social Pack cover, Market Pulse, AI / Tech Watch, FCN / Risk Watch, and I-Xuan View now use content-aware social copy and reliable footer safe zones for PNG export.
- News Provider Recovery & Coverage Expansion: verified public sources now improve US equities, AI / semiconductor, macro, crypto, and Taiwan technology supply-chain coverage while preserving provider health diagnostics and disabled-source reasons.
- Intelligence Distribution Layer foundation: Account Delivery Preferences now support Daily / Weekly / Daily + Weekly frequency, Macro / AI Tech / Crypto / Taiwan Market / FCN Awareness / Risk Regime categories, and In-App-only channel preferences with LINE / Email / Push reserved as future disabled channels.
- Admin Distribution Queue foundation: read-only Draft / Reviewed / Published status visibility for future delivery channels without persistence queue, push automation, or marketing workflow.
- Daily Intelligence Experience Upgrade: Daily Briefs now prioritize today's market signal, three important market points, market interpretation, investor watchpoints, and complete I-Xuan View commentary before source-level sections.
- Social Pack intelligence upgrade: Daily Social Pack content now extracts insight and rewrites for social readability, avoiding template residue such as Short Insight / Observation labels, generic repeated filler, clipped English fragments, and non-compliant trading language.
- Market Memory Layer: Daily Briefs now include What Changed Since Last Brief, continuity tags, and memory-aware I-Xuan View language based on recent editorial briefs.
- Social Media Optimization Layer: Social Pack Studio now supports IG Feed / Carousel 4:5 and Story / Reels 9:16 export formats with platform-specific preview dimensions and copy density.
- Periodic Intelligence Engine Correction: News Source is the source of truth; IXAI Intelligence Engine produces Daily / Weekly / future Monthly / Yearly outputs; Social Packs are conversion entries for each period.
- IXAI Insight Engine: event extraction, signal extraction, narrative tension, what changed, what to watch next, I-Xuan View, and social funnel generation for Daily / Weekly outputs.
- Question Driven Intelligence Engine: Daily / Weekly now begin with a central market question and answer it through evidence, counter-evidence, observable watchpoints, and I-Xuan View.
- Evidence Quality Sprint: Daily / Weekly evidence now prioritizes specific events, named entities, sources, catalysts, and upcoming events before interpretation.
- Share Intelligence foundation with static intelligence share routes for acquisition and continuity.
- Welcome and onboarding foundation for investor profile, watchlist seed, intelligence preference, and LINE entry.
- Intelligence delivery foundation for Morning Intelligence, delivery preferences, LINE readiness, and Public / Pro delivery tier separation.
- Vercel deployment and production metadata / PWA installability foundation.
- Daily Brief and Weekly Intelligence editorial surfaces.
- Editorial Studio and admin/public shell separation.
- Pro conversion page, Pro preview dashboard, and gated Pro intelligence shell.
- LINE consultation flow and LINE Official Account connection surfaces.
- LINE Login and LIFF foundation.
- Lightweight identity session with signed cookie persistence.
- Membership foundation with free / pro / enterprise architecture.
- Pro waitlist capture through the distribution subscriber layer.
- PostHog-ready analytics foundation and identity-aware analytics stitching.
- Supabase integration for durable Daily / Weekly editorial persistence, subscribers, profiles, identity, and membership foundations.
- Responsive mobile-first public UI with public, admin, and Pro surface separation.

## C. Current Architecture

IXAI uses Next.js App Router as the primary application framework.

Primary architectural layers:

- Public shell: market intelligence, Daily Brief, Weekly Intelligence, FCN education, IXAI Pro conversion, account, and public brand pages.
- Admin shell: internal operating console for editorial workflow, analytics, audience, distribution, membership, and system snapshots.
- Pro surfaces: `/pro` as conversion surface, `/pro-preview` as sample dashboard, and `/pro-intelligence` as gated intelligence shell.
- Supabase: persistence layer for editorial content, subscribers, profile / CRM foundations, identity continuity, and membership foundations.
- PostHog: optional production analytics provider through an internal analytics abstraction.
- LINE integration: LINE configuration, connect surface, identity merge foundation, LINE Login route, callback route, and LIFF entry surface.
- Vercel: deployment, route handlers, cron readiness, static assets, PWA manifest, and service worker installability foundation.

The app intentionally separates public user-facing intelligence from internal admin operations. Admin surfaces must not inherit public navigation or consumer conversion UI.

## D. Product Direction

### v1.40

Near-term direction should focus on Intelligence Activation and operational reliability:

- Onboarding foundation for investor profile, watchlist seed, intelligence preference, and LINE entry.
- Daily intelligence relationship: help users establish what IXAI should monitor first.
- Intelligence delivery foundation: Morning Intelligence preview, LINE delivery readiness, and opt-in delivery architecture.
- Public acquisition landing: the root route should communicate IXAI value before asking for account creation.
- Public Intelligence funnel: LINE / Social / Share should open Daily / Weekly / Share Intelligence content first, then guide users into onboarding and account setup.
- UX cohesion: keep CTA language and product narrative aligned around the core flow: Landing → Onboarding → Account → Future Pro Interest.
- Share Intelligence foundation: reusable share cards and `/share/intelligence/*` routes should route new users into onboarding and preview without generic landing breaks.
- Membership entitlement activation.
- Pro intelligence delivery mechanics.
- Portfolio onboarding foundation.
- AI alert delivery planning and opt-in flow.
- Subscriber to member conversion instrumentation.
- Cleaner entitlement-aware UI without full Stripe dependency yet.

### Long-Term

Long-term IXAI direction:

- AI operating system for investors.
- Multi-asset intelligence layer across US equities, Taiwan AI supply chain, macro, crypto, rates, and structured products.
- FCN intelligence with risk-first education and future personal monitoring workflows, descended from the early FCN monitor prototypes.
- Crypto grid / dual / liquidity awareness as a risk-monitoring and education layer, not automated trading.
- Portfolio risk workflow and personal market memory, descended from the early stock / crypto / FCN monitoring workflows.
- Institutional-grade investment OS for daily interpretation, risk awareness, and decision support.

IXAI should evolve from public intelligence into a personal AI wealth intelligence platform while preserving compliance discipline and human review where needed.

## E. Design Language

IXAI design should feel institutional, calm, and premium.

Current visual language:

- Forest green, cream, and muted gold palette.
- Bloomberg x Linear x Notion influence.
- Intelligence dashboard feeling rather than a media site.
- Clear hierarchy, quiet density, and low-noise controls.
- Mobile-first, app-like rhythm.

Avoid:

- Flashy crypto styling.
- Generic SaaS gradients.
- Retail trading app hype.
- Aggressive paywall or pop-up behavior.
- Decorative icon blocks that do not carry functional meaning.

## F. Current Known Issues

Known areas that require care:

- CTA and icon contrast consistency across public / admin / Pro surfaces.
- Token inheritance conflicts between Tailwind utility classes and shared CTA classes.
- CSS utility layering complexity after multiple visual cleanup passes.
- Need for future design-system cleanup around buttons, icon color rules, shell primitives, and card variants.
- Some older components still contain legacy force-icon classes and should be cleaned only through audited, scoped changes.
- Onboarding profile state is local/session-first in v1.40; durable persistence and portfolio-intelligence promotion remain future work.
- Intelligence delivery is foundation-only in v1.40.1; real push requires explicit opt-in persistence, queueing, delivery logs, and unsubscribe controls.
- Root landing should remain public and product-led; do not turn `/` back into a login-only gate without explicit product approval.
- Daily Brief, Weekly Intelligence, and Share Intelligence are trust-building public surfaces. Do not put an auth wall in front of public article reading.
- Public Intelligence modules are foundation-level and may still use static / editorial-safe data until provider integration is explicitly approved.
- Public Intelligence Engine still relies on editorial/static-safe intelligence data; dynamic market intelligence provider integration remains future work.
- Weekly Revision Workflow Phase 1 includes migration SQL and code support only. The Supabase migration must be manually reviewed, backed up, and explicitly approved before production execution.
- Auth and identity architecture remains protected and should not be rewritten without explicit approval.
- Watchlist Intelligence Lite remains local/session-first.
- Durable watchlist persistence remains future work unless explicitly approved.
- Watchlist relevance is topic-level and not personalized investment advice.
- LINE Delivery remains readiness-only.
- Real push automation requires explicit opt-in persistence, delivery logs, unsubscribe/pause controls, and approval before production launch.
- Delivery preferences remain local/session-first unless persistence migration is explicitly approved.
- Visual QA is smoke-level and should be expanded before App Store / Google Play submission.
- Browser binaries should not be committed.
- Social packs are manual publishing assets.
- Automatic FB / IG / LINE publishing is not active.
- Publish Center remains future work.
- Social Pack layouts are optimized for readability first; visual complexity and app-card styling should remain limited.
- Daily Social Pack renderer must continue to prioritize complete, readable social copy over raw Daily Brief density. Core headings and I-Xuan View copy should not be clipped in exported PNGs.
- CTA and product wording should reinforce one flow: Public Landing → Onboarding → AI Intelligence Workspace → Future Pro Interest. Intelligence Preview is secondary, not the default next step after onboarding.
- Share pages are acquisition surfaces; keep them educational, intelligence-first, and clearly connected to onboarding / preview / LINE.
- Daily Intelligence quality is now a retention bottleneck priority. Drafts should target 3-5 minute reading value, with provider health and coverage gaps visible to editors.
- Daily Brief and Social Pack content must remain interpretation-first. Avoid reverting Daily output to raw news summary, generic filler, or template labels.
- Social Pack I-Xuan View must remain complete Chinese commentary and should not display raw English headlines, clipped fragments, or duplicated placeholder copy.
- Daily / Weekly Social Pack period separation is fixed in v1.50.1, but must remain a permanent QA rule. Daily and Weekly Social Packs should fail QA if they can be swapped without obvious period mismatch, if Slide 1 asks the same question, if Slide 2 reuses the same evidence role, or if Slide 5 reuses the same I-Xuan View with only "today" / "this week" wording changed.
- Daily Brief consecutive-date repetition is a current Content Engine risk. `docs/DAILY_BRIEF_ROOT_CAUSE_ANALYSIS.md` found that the public 2026-06-02 title came from `questionDriven.centralQuestion`, while `daily-intelligence-2026-06-03` was not publicly published through the checked API. Future Daily engine changes must not let a broad AI + macro branch produce the same title, key answer, I-Xuan View, and Social Pack slides across adjacent dates.
- Daily title, Social Pack Slide 1, and Social Pack Slide 5 must be date/event-specific. If two adjacent Daily Briefs with different source events produce the same central question or same I-Xuan View, QA should fail.
- Daily product date / slug generation currently has UTC-date risk. Future work should explicitly design an Asia/Taipei product-date key before changing scheduler or publish behavior.
- Production route QA after v1.50.2 found repeated Next.js `_rsc` prefetch abort noise for `/fcn` and `/weekly-brief`. This did not create console errors or route failures, but future navigation/prefetch policy changes should verify these routes.
- Provider coverage is materially improved in v1.41.3, but Reuters, Bloomberg, Yahoo Finance, CNYES, 工商時報, 經濟日報, and MoneyDJ remain disabled until stable legal RSS/API access is verified.
- Market Memory Layer is local / editorial-first and uses recent Daily Briefs as narrative context. It must not be represented as personal market memory, portfolio memory, or individualized investment advice.
- Weekly Social Pack is now a high-risk area. v1.82-v1.83.8d included repeated Social Pack / Weekly Export hotfixes where fixture, build, or mobile smoke checks passed while production still failed.
- Future Social Pack work must first read `docs/SOCIAL_PACK_INCIDENT_REVIEW_20260609.md`.
- Major Social Pack fixes must not rely only on fixture/build/lint proof. They require production-like regression across selected review source, same-week canonical published source, rendered slide text, caption text, quality diagnostics, export eligibility, Download PNG, and Copy caption.

## G. AI Collaboration Workflow

IXAI uses a multi-agent collaboration model:

- ChatGPT: strategy, product architecture, roadmap, and product brain.
- Claude / Codex: execution layer, code changes, verification, and commits.
- GitHub: source of truth for implementation history.
- `docs/PROJECT_CONTEXT.md`: persistent project memory layer.
- `docs/PROJECT_RULES.md`: governance layer and development constitution.
- `docs/ROADMAP.md`: current and future product direction.
- `docs/VERSION_HISTORY.md`: concise implementation history for handoff.

Before major work, AI agents should read `PROJECT_CONTEXT.md`, `PROJECT_RULES.md`, `ROADMAP.md`, and `VERSION_HISTORY.md`, audit the relevant files, and only then patch. The goal is to prevent context loss, version drift, accidental architecture rewrites, and product misalignment.

For Social Pack / Weekly Export work, the agent must also read `docs/SOCIAL_PACK_INCIDENT_REVIEW_20260609.md` and must not claim completion until the production-like regression gate in `docs/PROJECT_RULES.md` is satisfied.

## H. See Also

- `docs/PRODUCT_ORIGIN.md`: origin layer for why IXAI exists and how 一玄 advisory, monitoring, Morning Brief, Public Intelligence, Account Intelligence, and Future Pro Intelligence connect.
- `docs/AI_MORNING_BRIEF_HISTORY.md`: historical record of the pre-app AI Morning Brief, FCN monitoring, Crypto Grid / Dual monitoring, IXAI Agent, and Public App evolution.
- `docs/IXAI_VISION.md`: long-term vision layer for IXAI as an AI-native Wealth Intelligence Operating System.
- `docs/SSO_FOUNDATION_PLAN.md`: unified login foundation and current App / Legacy Pro / Backend identity model.
- `docs/SSO_IMPLEMENTATION_PLAN.md`: SSO prototype implementation readiness plan.
- `docs/SSO_FILE_CHANGESET.md`: expected file-level impact before v1.62+ SSO code changes.
- `docs/SSO_PROTOTYPE_BLUEPRINT.md`: v1.62-v1.66 SSO rollout plan.
- `docs/SSO_SECURITY_REVIEW.md`: SSO token, trust-boundary, replay, logout, and entitlement security review.
- `docs/DAILY_BRIEF_ROOT_CAUSE_ANALYSIS.md`: root-cause audit for repeated 2026-06-02 / expected 2026-06-03 Daily Brief and Social Pack narratives.
- `docs/CONTENT_ENGINE_V162_PLAN.md`: v1.62 Content Intelligence Foundation plan and v1.62.1 implementation scope.
- `docs/CONTENT_ENGINE_ARCHITECTURE.md`: Daily / Weekly / Social Pack content-engine architecture baseline.
- `docs/PROVIDER_HEALTH_REVIEW.md`: provider health review for App Daily news, App quotes, backend / legacy providers, Yahoo Finance, and Bloomberg.
- `docs/CONTENT_ENGINE_REWRITE_V162.md`: v1.62.1 content-engine rewrite implementation record, including Daily title diversification, Social Pack separation, Weekly separation, Asia/Taipei date fix, provider health reason codes, tests, and rollback plan.
- `docs/SOCIAL_PACK_INCIDENT_REVIEW_20260609.md`: v1.82-v1.83.8d Social Pack / Weekly Export incident review and prevention rules.
- `docs/TAIWAN_USER_UX_CLEANUP_V163.md`: v1.63.0 Traditional Chinese UX cleanup source-of-truth for normal user pages, engineering-info separation, wording table, pages changed, and rollback plan.
- `docs/UX_PRODUCT_ROLE_CORRECTION_V1631.md`: v1.63.1 App / Pro role correction source-of-truth, FCN education-page positioning, Daily / Weekly reading-page cleanup, Pro icon/CTA rules, and account information architecture.
