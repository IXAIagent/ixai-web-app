# IXAI Project Map

This document classifies the main IXAI project folders so future AI agents do not confuse the active production app with legacy prototypes or side projects.

## Active Project Roles

```text
/Users/itsunkuo/Desktop/IXAI_PROJECTS
├─ app/ixai-web-app
│  └─ Active Production App
├─ backend/ixai_agent
│  └─ Active backend mainline candidate
├─ frontend/ixai-website-clean
│  └─ IXAI Pro Legacy Dashboard Prototype
└─ brand/ixuan-brand-site
   └─ Brand / Social Kit
```

## app/ixai-web-app

Role:

- Active Production App.
- Current Vercel / public app mainline.
- Owns the public IXAI experience: landing, onboarding, Daily Brief, Weekly Intelligence, Share Intelligence, Account, Pro Preview, Admin Editorial Studio, and Social Intelligence Pack Studio.
- Highest-level product philosophy source: `docs/IXAI_PRODUCT_PHILOSOPHY.md`.
- Highest-level product vision source: `docs/IXAI_PRODUCT_VISION.md`.
- Highest-level V16 strategy source: `docs/V16_PRODUCT_STRATEGY.md`.
- Core product positioning: IXAI has two complementary products, AI Financial Media and AI Investment Monitoring.
- Next major direction: `V16 Product Strategy`.

Product vision hierarchy:

```text
docs/IXAI_PRODUCT_PHILOSOPHY.md
↓
docs/IXAI_PRODUCT_VISION.md
↓
docs/V16_PRODUCT_STRATEGY.md
↓
docs/V16_AI_MONITORING_PLATFORM.md
↓
docs/V16_NOTIFICATION_ARCHITECTURE.md
docs/V16_DATA_ARCHITECTURE.md
docs/V16_EDITORIAL_ARCHITECTURE.md
↓
docs/PROJECT_CONTEXT.md
↓
docs/ROADMAP.md
↓
V15 / V16 implementation docs
```

V16 Product Strategy:

- Product philosophy doc: `docs/IXAI_PRODUCT_PHILOSOPHY.md`.
- Canonical planning doc: `docs/V16_PRODUCT_STRATEGY.md`.
- Current phase: Architecture Planning Phase before coding.
- Strategic posture: Always-On AI Monitoring before billing-first SaaS.
- Architecture gate docs:
  - `docs/V16_NOTIFICATION_ARCHITECTURE.md`.
  - `docs/V16_DATA_ARCHITECTURE.md`.
  - `docs/V16_EDITORIAL_ARCHITECTURE.md`.
- Provider independence: external news, price, event, earnings, crypto, notification, and AI services must pass through IXAI abstractions.
- Failure degradation: provider failures should produce cached, limited, unavailable, or fallback intelligence rather than product failure.
- Product A: AI Financial Media.
  - Daily Brief.
  - Weekly Brief.
  - Answers: `今天市場發生什麼？`
  - Mission: build trust, habit, and brand.
  - Public Brief = AI Curated Financial Media, not a generic news list.
- Product B: AI Investment Monitoring.
  - Workspace.
  - Answers: `今天哪些事情影響我的投資？`
  - Mission: AI monitors the user's own investments continuously in the background.
- Product funnel: Public Visitor -> Daily Brief -> Weekly Brief -> trust/habit -> Workspace -> input assets -> AI Monitoring -> Subscription.
- SaaS timing: delay paid-tier planning until product-market signal, daily usage, monitoring retention, and FCN wow moment are validated.

V16A AI Financial Media:

- Priority 1 roadmap.
- Sprint 1: Editorial Architecture.
- Sprint 2: Daily Brief 2.0.
- Sprint 3: Weekly Brief 2.0.
- Sprint 4: Content Quality Engine.
- Daily / Weekly cannot depend on user Portfolio.
- Daily / Weekly are not Workspace free tier.

V16B AI Monitoring Platform:

- Canonical planning doc: `docs/V16_AI_MONITORING_PLATFORM.md`.
- Product model: AI Investment Monitoring System.
- Highest product question: `這件事為什麼跟我的投資有關？`
- Always-on workflow: News -> Events -> Prices -> Earnings -> Portfolio -> FCN -> Crypto -> Risk -> AI Analysis -> Today Focus -> Telegram / Workspace.
- Telegram-first notification strategy: Telegram is the first external monitoring channel before App Push.
- Channel Router architecture: AI Monitoring Engine -> Notification Engine -> Channel Router -> Telegram / LINE / Email / In-App / Browser Push / Mobile Push.
- Event matrix required before implementation: FCN KI distance, observation, coupon, earnings, price moves, crypto volatility, macro events, and news relevance.
- Priority 2 roadmap after V16A foundation.
- Workspace must depend on user Portfolio / asset context.
- Engine families: Global Asset Intelligence, News Relevance, Event Intelligence, FCN Intelligence, Portfolio Intelligence, AI Monitoring Feed, Today Focus, Copilot AI Analyst, and Memory Engine.

V15 Product Layer:

- Home — redesigned in V15 Sprint 2.1 / 2.1a.
- Portfolio — redesigned in V15 Wave 1.
- FCN — redesigned in V15 Wave 1.
- Risk — redesigned in V15 Wave 1.
- Intelligence — redesigned in V15 Wave 2.
- Copilot — redesigned in V15 Wave 2.
- Watchlist — redesigned in V15 Wave 2.
- Notifications — redesigned in V15 Wave 2.
- Timeline — redesigned in V15 Wave 2.
- Settings — redesigned in V15 Wave 3.
- Health — moved under Settings -> Advanced in V15 Wave 3.
- Beta — moved under Settings -> About in V15 Wave 3.
- V15.1 Product Polish — copywriting, Morning Brief 2.0, Portfolio 2.0, Notifications grouping, empty states, and shared design polish.

These Workspace product surfaces should follow one Dashboard Layout system:

```text
Hero / Summary
↓
KPI Row
↓
Primary user-facing cards
↓
Detail sections
↓
Secondary diagnostics
```

Diagnostics rule:

- Provider, runtime, health, source, readiness, cache, activation, foundation, and diagnostics surfaces belong at the bottom of the page or under Settings -> Advanced.
- They must not be first-screen primary content unless the page itself is Settings -> Advanced.
- AI / information surfaces remain explain-only and must not introduce AI provider calls, recommendation logic, trading actions, or external notification delivery.
- Workspace platform navigation uses the primary IA: 首頁, 我的資產, 市場, AI, 提醒, 設定.
- Mobile bottom navigation uses only five primary destinations: 首頁, 資產, 市場, AI, 設定.

Current V15 source docs:

- `docs/V15_PRODUCT_EXPERIENCE_CONTEXT.md`.
- `docs/V15_UX_AUDIT.md`.
- `docs/V15_SPRINT_1_IA_NAVIGATION_REDESIGN_PLAN.md`.
- `docs/V15_DESIGN_SYSTEM_2.md`.
- `docs/V15_SPRINT_2_UI_IMPLEMENTATION_SPEC.md`.
- `docs/V1503_INFORMATION_ARCHITECTURE_REFINEMENT.md`.
- `docs/V151_PRODUCT_POLISH_PROGRAM.md`.

V15.1 product polish layer:

- `src/lib/i18n/dictionaries.ts` includes `productPolish` for new polish copy.
- `components/workspace/product/workspace-empty-state.tsx` provides CTA-backed Workspace empty states.
- `components/workspace/product/workspace-diagnostics-panel.tsx` uses user-facing advanced information language by default.
- `/my-ixai/morning-brief` is the full report route; Home remains summary-only.

Production data ownership update:

- `app/ixai-web-app` now owns the real Portfolio / FCN production data layer.
- Production persistence contracts include `portfolios`, `fcn_positions`, `fcn_underlyings`, `stock_positions`, and `crypto_positions`.
- v1.87 adds the App-native Multi-Asset Portfolio abstraction for FCN, Stocks, Crypto, Grid, Dual, and Cash.
- v1.88 adds `/my-ixai/portfolio` as the first App-native Portfolio Center UI, while `/portfolio` remains the Portfolio Input route.
- v1.89 adds an IXAI Architecture Map inside `/my-ixai/portfolio` so users can see enabled Portfolio, Risk, Intelligence, Membership, and Readback modules.
- v1.90 adds `/my-ixai/input` as the Asset Input Hub and introduces the App-native global asset input model foundation for Manual Input, CSV Import, Broker Sync, Exchange Sync, Bank Statement Import, global regions, and multi-language readiness.
- v1.91 adds `/my-ixai/portfolio/assets` as the mock-only Asset Management Center for Portfolio CRUD Foundation. It validates CRUD UI and state behavior but does not write to Supabase.
- v1.92 adds the formal Portfolio Account → Asset → Position data model foundation and additive Supabase schema foundation for future persistent asset CRUD.
- v1.93 adds the Portfolio Repository Layer between UI and future Supabase persistence. The active implementation is mock-only and reads from v1.92 mock data.
- v1.94 connects the Portfolio Repository Layer to Supabase persistence for Create Asset and Read Asset only. Update / Delete remain Coming Soon.
- v1.95 adds Ownership Validation readback for current user, current account, account count, asset count, position count, repository source, and RLS status.
- v1.96 adds the first Repository-driven Portfolio Dashboard Foundation inside `/my-ixai/portfolio`, including account / asset / position totals, asset category allocation, provider allocation, and region allocation.
- v1.97 adds Portfolio News Intelligence Foundation by generating an Intelligence Universe from repository assets. This prepares future holding-aware news and AI commentary without connecting providers.
- v1.98 adds Portfolio News Provider Foundation by connecting the Intelligence Universe to a mock news provider and Portfolio News Feed readback. It still does not connect external News API, AI, market data, broker sync, or trading.
- v1.99 adds Portfolio AI Commentary Foundation by connecting Portfolio News Feed to a mock commentary provider. It does not connect OpenAI, Claude, Gemini, Anthropic, News API, market data, broker sync, or trading.
- v2.00 adds Portfolio Intelligence Engine Foundation by combining repository assets, mock news feed, and mock commentary into deterministic health, risk, concentration, and diversification scores. It still does not connect external AI, news, market data, broker sync, or trading.
- v2.01 adds Portfolio Risk Engine Foundation by generating deterministic risk reports from repository accounts, assets, and positions. It still does not add recommendation logic, external providers, broker sync, or trading.
- v2.02 adds Portfolio Recommendation Engine Foundation by generating deterministic monitoring prompts from the current Portfolio Risk Report. It still does not connect external AI, news, market data, broker sync, trading, or ticker-specific execution workflows.
- v2.03 adds Portfolio Market Data Foundation by generating deterministic mock market snapshots from repository-driven Intelligence Universe symbols. It still does not connect Yahoo Finance, Binance, CoinGecko, Finnhub, Polygon, broker sync, external AI, or trading.
- v2.04 adds Portfolio Valuation Engine Foundation by converting repository assets, positions, and mock market snapshots into portfolio value, unrealized P/L, and allocation metrics. It still does not connect real market data, broker sync, external AI, or trading.
- v2.05 adds Portfolio Exposure Engine Foundation by converting valuation output into asset type, symbol, FCN underlying, crypto, region, and provider exposure readback. It still does not connect real market data, broker sync, external AI, recommendation changes, or trading.
- v2.06 adds Portfolio Concentration Engine Foundation by converting exposure output into top symbol, FCN underlying, asset type, provider, and region concentration readback. It still does not connect real market data, broker sync, external AI, recommendation changes, or trading.
- v2.07 adds Portfolio Correlation Engine Foundation by converting exposure and concentration reports into deterministic high / medium / low correlation pairs and correlation risk readback. It still does not connect real market data, broker sync, external AI, recommendation changes, or trading.
- v2.08 adds Portfolio Scenario Engine Foundation by converting valuation, exposure, concentration, and correlation reports into market-agnostic deterministic scenario readback. It still does not connect real market data, broker sync, external AI, recommendation changes, or trading.
- v2.09 adds Portfolio Stress Test Engine Foundation by converting valuation, exposure, concentration, correlation, and scenario reports into market-agnostic deterministic stress-test readback. It still does not connect real market data, broker sync, external AI, recommendation changes, or trading.
- v2.10 adds Portfolio FCN Risk Engine Foundation by converting FCN assets, underlyings, exposure, concentration, correlation, and stress-test reports into market-agnostic deterministic FCN-risk readback. It still does not connect real market data, broker sync, external AI, recommendation changes, or trading.
- v2.10a adds a docs-first Global Market Foundation Review. It validates Portfolio Core engine consistency, global market readiness, FCN global expansion, multi-language readiness, multi-broker readiness, Legacy Pro migration, Portfolio Center complexity, and v2.11 platform IA direction without changing product code.
- v2.11 adds the Legacy Pro Migration Audit and Product Inventory. It is the pre-v3.00 source of truth for which Legacy Pro concepts are migrated, partially migrated, missing, or should be retired. Read `docs/LEGACY_PRO_MIGRATION_AUDIT_V211.md` before moving Legacy Pro ideas into the active App.
- v3.00 adds the UX / IA Foundation route structure for `/my-ixai`, `/my-ixai/home`, `/my-ixai/risk`, `/my-ixai/fcn`, `/my-ixai/intelligence`, and `/my-ixai/settings`. It is route and navigation foundation only; it does not move engine logic or add features.
- v3.01 separates public website navigation from Workspace application navigation. Public routes keep brand / education / lead-generation navigation. `/my-ixai/*` routes get Workspace-only navigation plus an explicit `返回官網` exit.
- v3.02 makes `/my-ixai/home` the authenticated entry after login / register and changes `/account` into a legacy transitional page that points users into Workspace.
- v3.03 repositions `/pro` as the public IXAI Platform introduction and conversion page. It is no longer the primary Legacy Pro or membership-status entry.
- v3.04 makes `/my-ixai/input` the canonical Workspace asset onboarding surface and moves FCN Wizard ownership from public `/fcn` into `/my-ixai/input/fcn`.
- v3.05 turns `/my-ixai/portfolio` into a user-readable Portfolio Workspace homepage and fixes `/pro` CTA contrast.
- v3.06 upgrades Asset Input from placeholder into usable Stock / ETF, Crypto, and FCN input flows, adds shared Input Review, and shows local mock Recent Inputs in Portfolio Center.
- v3.08 connects `/my-ixai/input/fcn` to `/my-ixai/fcn` through a local FCN Draft Store. FCN Center reads draft FCN positions, notional, barriers, observation dates, coupon dates, and underlyings without adding API, schema, market data, AI, broker, Telegram, scheduler, or trading logic.
- v3.08a fixes FCN Draft Store persistence and fallback hydration so FCN Center reads the same localStorage-backed data that FCN Wizard writes.
- v3.09 turns `/my-ixai/fcn` from placeholder into an FCN Position readback surface that uses the existing `/api/fcn` and Supabase `fcn_positions` / `fcn_underlyings` persistence path created by the FCN Wizard.
- v3.10 turns `/my-ixai/fcn` into the first FCN risk-monitoring workspace by adding KI-distance readback, GREEN / YELLOW / RED / UNKNOWN status, high-risk / watch counts, and underlying concentration from persisted FCN records only.
- v3.20 turns `/my-ixai/fcn` into the FCN Intelligence Center with lifecycle filters, manual local price overlay, timeline / event center, Risk Engine v2 score, and concentration analysis while preserving `/api/fcn` / Supabase readback.
- v3.30 turns `/my-ixai/risk` from placeholder into the first Global Risk Center foundation. It reuses v3.20 FCN Intelligence Center helpers, reads existing FCN / Stock / Crypto API paths for readiness, derives Grid / Dual readiness, lists upcoming FCN risk events, and reports data source status without adding live market data, broker sync, AI, schema changes, or trading logic.
- v3.40 turns `/my-ixai/intelligence` from placeholder into the first usable Intelligence Center. It links Daily / Weekly / Market public sources, reuses FCN v3.20 highlights, reads existing FCN / Stock / Crypto / Portfolio Dashboard APIs for readiness, and labels News / Commentary as readiness without adding external AI, external news, broker sync, market data providers, schema changes, or trading logic.
- v4.00 plans the Intelligence + Market Integration Program. It is not another page; it is the integration layer between Public Market, Portfolio Center, FCN Center, Global Risk Center, and Intelligence Center. The program should add a Portfolio Truth Layer, Workspace Market Service, FCN real-risk integration semantics, Intelligence Center V2, and integration QA in small sprints without rebuilding existing systems.
- v4.01 adds the Portfolio Truth Layer as the first shared readback layer across `/my-ixai/portfolio`, `/my-ixai/risk`, and `/my-ixai/intelligence`. It normalizes existing FCN / Stock / Crypto / Portfolio Dashboard API data into counts, known notional, source status, missing-data warnings, and available symbols without adding schema, migration, providers, AI, broker sync, or trading logic.
- v4.02 adds Portfolio Intelligence UI inside `/my-ixai/portfolio`. It visualizes the v4.01 Truth Layer with counts-based allocation, holdings summary, top symbol occurrence, source health, and missing-data warnings without adding schema, migration, providers, AI, broker sync, recommendation logic, or trading behavior.
- v4.03 adds Risk Intelligence Layer inside `/my-ixai/risk`. It extends the v4.01 Truth Layer with concentration and data-quality risk summaries, then reuses v3.20 FCN helper output for FCN worst-of readback without adding market data, AI, broker sync, recommendations, or trading behavior.
- v4.04 adds Intelligence Readback Layer inside `/my-ixai/intelligence`. It reuses Portfolio Truth and Risk Intelligence readback for portfolio summary, risk snapshot, exposure summary, and readiness warnings without adding AI commentary, LLM integration, news provider, market data, broker sync, recommendations, or trading behavior.
- v4.05 adds `src/lib/market/` as the Market Abstraction Layer. It defines provider-agnostic quote, snapshot, news, provider, registry, and market center contracts with a deterministic MockProvider only.
- v4.06 adds Market Readiness UI inside `/my-ixai/intelligence`. It displays provider registry status, contract coverage, and supported mock symbols from v4.05 metadata only.
- v4.07 adds Provider Health Framework under `src/lib/market/`. It defines provider status, data freshness, provider priority, health summary, and fallback policy contracts with deterministic mock health data only.
- v4.08 adds Market Service Layer under `src/lib/market/market-service.ts`. It exposes unified quote, snapshot, news, provider-health, and readiness entrypoints and surfaces service-status readback inside Intelligence Center without connecting external providers.
- v4.09 adds Workspace Market Integration by reusing the Market Service Layer in Portfolio Center, Risk Center, and Intelligence Center as read-only readiness, provider health, and fallback policy awareness.
- V410 adds `docs/V410_WORKSPACE_FULL_SCAN_REPORT.md` as a docs-only audit of workspace routes, navigation, data wiring, stale copy, and placeholder areas before the next implementation sprint.
- V410 scan caveat: Risk Center and Intelligence Center render Workspace Market Status, but the active `/my-ixai/portfolio` route does not currently render that section because `PortfolioCenterDashboard` is not the active Portfolio page component.
- v4.10 adds Input → Truth → Workspace Unification. It introduces a browser-local Input Truth Bridge for pending Stock / Crypto / FCN inputs, wires Workspace Market Status into the active Portfolio route, and keeps Recent Inputs plus v3.08 FCN Draft Store as compatibility fallbacks.
- v4.20 adds the Market Data Foundation under `src/lib/market/`. It introduces unified quote types, Yahoo Finance equity quote adapters, Binance crypto quote adapters, Market Service quote facade methods, and Workspace Market Status quote readback. It does not add schema, migrations, API contract changes, auth changes, broker integration, trading logic, recommendations, or FCN pricing.
- v4.30 adds the Portfolio Valuation Engine under `src/lib/portfolio/valuation/`. It reuses Portfolio Truth and v4.20 Market Service quotes to estimate market value, cost basis, unrealized P/L, and asset-class allocation in Portfolio Center. FCN values remain notional placeholder only.
- v4.40 adds Risk Engine v1 under `src/lib/risk/`. It reuses v4.30 Portfolio Valuation output to calculate deterministic risk score, risk levels, top signals, score breakdown, concentration warnings, crypto exposure warnings, market data quality warnings, and FCN placeholder awareness.
- v4.50 adds FCN Risk Engine v1 under `src/lib/fcn/risk/`. It reuses existing FCN readback, local FCN draft fallback, manual price overlays, and v4.20 market-service quotes to calculate worst-of, KI distance, strike distance, KO readiness, FCN-native risk levels, and top risk positions. The legacy `@/src/lib/fcn/risk` import remains available through `src/lib/fcn/risk/index.ts`.
- v4.60 adds FCN Coupon & Schedule Engine under `src/lib/fcn/schedule/`. It reuses existing FCN observation schedules, common metadata schedule shapes, maturity dates, and local FCN draft schedules to calculate coupon, observation, KO observation, maturity, next-30-day events, and monthly expected coupon cashflow when explicit amount data exists.
- v4.70 adds Server-side Market Cache Layer under `src/lib/market/cache/`. It routes Market Service quote readback through memory-only cache entries with 15-minute equity TTL, 2-minute crypto TTL, stale fallback, unavailable fallback, and Workspace cache diagnostics.
- v4.75 adds Workspace Full Integration Review under `src/lib/workspace/integration/`. It performs static/service-level lineage diagnostics for Truth Layer, Market Cache, Market Service, Portfolio Valuation, Portfolio Risk, FCN Risk, and FCN Schedule, then displays the result inside Settings.
- v4.80 adds Intelligence Engine v1 under `src/lib/intelligence/engine/`. It converts Portfolio Valuation, Risk Engine, FCN Risk, and FCN Schedule readback into deterministic structured Intelligence Cards for Intelligence Center.
- v5.00 adds Portfolio Persistence Layer under `src/lib/portfolio/persistence/`. It provides a canonical readback abstraction for persisted API records, local pending input, FCN drafts, and legacy fallback recent inputs, then surfaces the summary inside Portfolio Center without changing schema, migrations, API contracts, auth, broker sync, trading, recommendations, AI model calls, or alert delivery.
- V5 adds Workspace Expansion Program modules under `src/lib/watchlist/`, `src/lib/alerts/`, and `src/lib/daily-brief/`. It adds `/my-ixai/watchlist`, alert readback, Workspace Daily Brief readback, and Dashboard v2 cards without changing schema, migrations, auth, broker sync, trading, recommendations, AI model calls, or alert delivery.
- V5.10–V5.50 adds Workspace Foundation Program modules under `src/lib/workspace/graph/`, `src/lib/notifications/`, `src/lib/workspace/health/`, `src/lib/workspace/timeline/`, and `src/lib/workspace/api/`. It adds `/my-ixai/notifications`, `/my-ixai/timeline`, health readback, timeline readback, and API Gateway service metadata without changing schema, migrations, auth, broker sync, trading, recommendations, AI model calls, or notification delivery.
- V6 adds Platformization Program modules under `src/lib/watchlist/persistence/`, `src/lib/alerts/persistence/`, `src/lib/daily-brief/history/`, `src/lib/insights/`, `src/lib/notifications/delivery/`, and `src/lib/copilot/`. It adds read-only `/api/workspace/*` routes and `/my-ixai/copilot` without changing schema, migrations, auth, broker sync, trading, recommendations, AI model calls, or external notification delivery.
- V7 adds Data Persistence Program modules under `src/lib/persistence/portfolio/`, `src/lib/persistence/ownership/`, `src/lib/persistence/sync/`, and `src/lib/persistence/fcn/`, and extends `src/lib/watchlist/persistence/` and `src/lib/alerts/persistence/`. It adds readiness diagnostics without requiring new tables, applying migrations, changing auth, broker sync, trading, recommendations, AI model calls, or local fallback behavior.
- V8 adds Database Activation Program adapters and readiness services across `src/lib/persistence/portfolio/`, `src/lib/persistence/fcn/`, `src/lib/watchlist/persistence/`, `src/lib/alerts/persistence/`, `src/lib/persistence/ownership/`, and `src/lib/persistence/sync/`. It adds Settings activation diagnostics without applying migrations, requiring new tables at runtime, changing auth, broker sync, trading, recommendations, AI model calls, payment, or local fallback behavior.
- V9 adds Real Persistence Program live readback services across Portfolio, FCN, Watchlist, and Alert History; conservative ownership helpers; non-destructive sync planning; migration health diagnostics; Workspace Graph/API metadata; and Settings diagnostics without applying migrations, requiring new tables at runtime, changing auth, broker sync, trading, recommendations, AI model calls, payment, or local fallback behavior.
- V10.10 adds Database Read Priority under `src/lib/workspace/database-read-priority.ts` and source metadata under `src/lib/workspace/database-read-priority-status.ts`. Portfolio, FCN, Watchlist, and Alert History now attempt database readback before Truth Layer or local fallback without changing auth, schema, RLS, migrations, write paths, broker sync, trading, recommendations, AI model calls, or local fallback behavior.
- V10.20-V10.70 add Platform Cutover readiness under `src/lib/workspace/platform/` and `components/workspace/workspace-platform-cutover-status.tsx`. The layer covers ownership enforcement, guarded write cutover, workspace membership readiness, sync reconciliation dry-runs, migration execution prep, and production readiness diagnostics without changing auth, schema, RLS, remote migrations, broker sync, trading, recommendations, AI model calls, or fallback behavior.
- V11.10 adds Database Activation Foundation under `src/lib/workspace/database-activation/`, `components/workspace/workspace-v11-database-activation-status.tsx`, `supabase/migrations/013_v11_database_activation_foundation.sql`, and `supabase/seed_v11_database_activation_demo.sql`. It prepares migration files, database readback validation, and write readiness without executing remote migrations or removing fallbacks.
- V12.1 Runtime Stabilization Program completion branch finishes Program A — Root Provider Stabilization, Program B — Workspace Runtime Hydration Safety, Program C — Market / Morning Brief Runtime Stabilization, Program D — Admin / Scheduler Runtime Stabilization, and Program E — Service Worker Fetch Safety. The completion fixes optional Supabase `ixai_profile_memory` / `ixai_user_preferences` missing-table fallback, live market / Morning Brief runtime fallbacks, and admin diagnostics fallback payloads. Route-level error boundaries were not shipped after production-like Next 16.2.6 smoke testing exposed a `client reference manifest` invariant on static Workspace routes. V12.1 is complete only after the completion PR is merged.
- V13.0 adds the Internationalization Foundation under `src/lib/i18n/` and `components/i18n/language-switcher.tsx`. Public App and Workspace share the same `ixai.locale` localStorage + cookie preference across `zh-TW`, `zh-CN`, `en-US`, `ja-JP`, and `ko-KR`. Public users can switch language without registration, and Workspace Settings manages the same locale state. V13.0 is foundation-only: no full content translation, no Supabase preference sync, no auth/RLS/schema/migration/billing changes, and no Portfolio / FCN / Risk / Intelligence engine changes.
- V13 Sprint 1 expands the Internationalization Foundation with namespace dictionaries, translation helpers, `LocaleProvider`, `useTranslation`, shared Language Switcher wiring, and initial Public / Workspace integrations. It documents the architecture in `docs/V13_SPRINT_1_INTERNATIONALIZATION_FOUNDATION.md` and does not change auth, schema, migrations, API contracts, billing, broker/trading, scheduler/delivery, AI provider behavior, or Portfolio / FCN engine logic.
- V13 Sprint 2 completes the Region / Currency / Localization foundation with region metadata, currency metadata, Intl formatting helpers, `LocalizationProvider`, `useLocalization`, local-only `ixai.region` / `ixai.currency` preferences, and Settings / Public / Workspace display wiring. It documents the architecture in `docs/V13_SPRINT_2_REGION_CURRENCY_LOCALIZATION.md` and does not add exchange rates, exchange-rate providers, valuation-engine changes, live market provider changes, auth/schema/API changes, billing, broker/trading, scheduler/delivery, AI behavior, or Portfolio / FCN / Risk engine changes.
- V13 Sprint 3 repairs visible translation coverage after the foundation work. It adds dictionary-backed display wiring for primary Workspace navigation, Home, Settings, Morning Brief, Workspace Intelligence, Health, Beta, and Settings localization labels. It documents the audit and remaining long-tail translation gaps in `docs/V13_SPRINT_3_TRANSLATION_COVERAGE_REPAIR.md`.
- V13 Sprint 4 audits authenticated Workspace translation coverage after production signed-in review found remaining English in `/my-ixai/portfolio`. It adds dictionary-backed display mapping for Portfolio page, Portfolio Truth, Portfolio Persistence, Portfolio Valuation, Portfolio Live Valuation, and the FCN Live Underlying card. It documents remaining deep Workspace gaps in `docs/V13_SPRINT_4_AUTHENTICATED_WORKSPACE_TRANSLATION_AUDIT.md` and keeps all Portfolio / FCN / Risk / Intelligence engine contracts unchanged.
- Translation Maintenance Batch 1 scans all major authenticated Workspace routes after V13 Sprint 4 and repairs easy dictionary wiring for Watchlist, Notifications, Timeline, Copilot, Stock / Crypto input, Input Review, and FCN live underlying display labels. It documents remaining Risk / FCN / Intelligence / input-form translation work in `docs/TRANSLATION_MAINTENANCE_BATCH_1.md` without changing engines, APIs, auth, schema, migrations, broker/trading, scheduler/delivery, AI, or notification delivery.
- Translation Maintenance Batch 2 makes V13 translation maintenance production Visual QA driven. It documents that the available production browser session was unauthenticated, records `ja-JP` as metadata-supported but not content-covered, fixes first-pass FCN display labels and warning mappings, and replaces one low-contrast FCN Risk Summary icon with the shared `FeatureIcon` primitive. See `docs/TRANSLATION_VISUAL_QA_BATCH_2.md`.
- V13.7 Real Translation Coverage Completion Program extends `scripts/audit-production-authenticated.mjs` with DOM translation coverage scoring and writes `docs/V137_REAL_TRANSLATION_COVERAGE.md`. It repairs major authenticated Workspace content translation surfaces in shared Market Status, Health Center, FCN Center, Settings, Risk, Intelligence, and locale pack overrides without changing engines, APIs, auth, schema, migrations, market providers, broker/trading, scheduler/delivery, billing, AI, or notification delivery.
- V13.8 Full Workspace Localization Completion corrects the V13.7 audit blind spot by adding DOM visible text block evidence in `scripts/audit-production-authenticated.mjs` and writing `docs/V138_FULL_WORKSPACE_LOCALIZATION_COMPLETION.md`. It repairs Morning Brief export/preview copy, Workspace Health summary, Risk Engine / Live Risk display labels, FCN schedule summary, Intelligence v2 / structured cards, and source status badge localization without changing engines, APIs, auth, schema, migrations, market providers, broker/trading, scheduler/delivery, billing, AI, or notification delivery.
- V14.0 opens the Live Workspace Program as the active product mainline. It is docs-only planning for V14.1 Live Market Data, V14.2 Live Portfolio Valuation, V14.3 FCN Live Risk, V14.4 Workspace Intelligence, V14.5 Workspace Morning Brief, and V14.6 Beta Readiness. It does not implement live market features, product code, auth/RLS/schema/migration/billing changes, broker/trading/recommendation behavior, AI model calls, or scheduler/notification delivery activation.
- V14 Sprint 1 implements V14.1-V14.3. It adds the internal `/api/market/live-quotes` route, server-side Yahoo Finance equity quotes, Binance crypto quotes, short-lived memory cache with stale fallback, provider health state, live Portfolio valuation readback, and FCN live risk readback. V14.4-V14.6 remain pending.
- V14 Beta Release Review records that Sprint 1, Sprint 2, and Sprint 3 have merged, with Sprint 3 PR #89 completing Beta readiness polish. `docs/V14_BETA_RELEASE_REVIEW.md` is the source of truth for invite-only Beta governance, production verification checklist, known limitations, and the recommended next tracks.
- Global market principle: `app/ixai-web-app` should be treated as a Global Multi-Asset, Multi-Broker, Multi-Market AI Risk Platform. Future portfolio, FCN, valuation, exposure, concentration, correlation, scenario, stress-test, market data, news, and localization work must not assume US-only, Taiwan-only, or English-only data. See `docs/GLOBAL_MARKET_VISION.md`.
- Future Pro features should be built inside `app/ixai-web-app` instead of migrating the whole legacy frontend.
- Legacy Pro is reference-only and should gradually retire as App-native Portfolio, FCN, and Risk workflows mature.

Current architecture:

- Next.js App Router.
- Supabase / Next API routes / editorial static and dynamic intelligence.
- Public Intelligence, Account Intelligence, Social Intelligence, Daily / Weekly engines, and admin workflows.
- Market Abstraction Layer under `src/lib/market/` for future Workspace market provider contracts. v4.05 contract layer is mock-only, v4.06 surfaces registry readiness, v4.07 adds provider health / fallback policy contracts, v4.08 adds unified market service entrypoints, v4.09 surfaces those entrypoints across Portfolio, Risk, and Intelligence, and v4.20 adds the first public Yahoo Finance / Binance quote adapters behind the Market Service facade.
- V14 Sprint 1 live market route under `app/api/market/live-quotes/` uses the `src/lib/market/` provider/cache layer. Client Workspace components must use the internal API route and must not fetch Yahoo Finance or Binance directly.
- Portfolio Valuation Layer under `src/lib/portfolio/valuation/` now includes v4.30 estimated valuation readback for Portfolio Center. It remains a monitoring layer and does not change database schema, API contracts, trading, broker sync, or recommendation logic.
- Risk Engine v1 under `src/lib/risk/` now includes v4.40 valuation-derived risk readback for Risk Center. It remains monitoring-only and does not change database schema, API contracts, trading, broker sync, recommendation logic, or FCN pricing.
- FCN Risk Engine v1 under `src/lib/fcn/risk/` now includes v4.50 FCN-native monitoring readback for FCN Center. It remains monitoring-only and does not change database schema, API contracts, trading, broker sync, recommendation logic, Greeks, Monte Carlo, option valuation, scenario simulation, or full FCN pricing.
- FCN Coupon & Schedule Engine under `src/lib/fcn/schedule/` now includes v4.60 schedule normalization and coupon / observation / KO / maturity readback for FCN Center. It remains monitoring-only and does not change database schema, API contracts, tax reporting, trading, broker sync, recommendation logic, or full FCN pricing.
- Server-side Market Cache Layer under `src/lib/market/cache/` now provides memory-only market cache types, store, service, and snapshot diagnostics for Market Service quote consumers. It remains infrastructure-only and does not change database schema, API contracts, auth, broker sync, trading, recommendation logic, or FCN pricing.
- Workspace Integration diagnostics under `src/lib/workspace/integration/` now validate expected exports, fallback presence, and safe dependency chain across Workspace data layers without network tests, schema changes, auth changes, broker sync, trading, recommendation logic, or FCN pricing.
- Internationalization Foundation under `src/lib/i18n/` now provides supported locale metadata, dictionaries, localStorage + cookie locale storage, and a hydration-safe `useLocale()` hook for foundation labels. It does not translate full content or sync to Supabase.
- V13 Sprint 1 i18n architecture under `src/lib/i18n/` now includes namespace dictionaries, `LocaleProvider`, `useTranslation(namespace)`, and translation helper functions. `components/i18n/language-switcher.tsx` remains the shared Public / Workspace switcher, and `components/i18n/i18n-foundation-status-card.tsx` verifies Workspace provider wiring on Home and Settings.
- V13 Sprint 2 localization architecture under `src/lib/i18n/` now includes `regions.ts`, `currencies.ts`, `formatters.ts`, `localization-store.ts`, and `use-localization.ts`. `components/i18n/localization-preference-card.tsx` owns Settings controls, while `components/i18n/localization-preview.tsx` provides lightweight Public / Workspace display wiring.
- V13 Sprint 3 translation coverage repair adds `components/i18n/translated-text.tsx` as a small client bridge for server page labels and expands `src/lib/i18n/dictionaries.ts` with navigation, workspace, settings, health, beta, Morning Brief, status, action, and disclaimer labels. Engine contracts stay stable; UI display mapping owns localization.
- V13 Sprint 4 authenticated Workspace translation audit adds `src/lib/i18n/use-workspace-display-labels.ts` for source status, asset type, source name, and warning message display mapping. Portfolio authenticated readback cards now use dictionary-backed UI labels while deterministic engine output contracts stay stable.
- Translation Maintenance Batch 1 extends dictionary wiring inside authenticated Workspace summary and input surfaces. Watchlist, Notification Center, Timeline, Copilot, Stock / Crypto input, Input Review, and FCN live underlying display labels use i18n namespaces while deeper Risk / FCN / Intelligence migration remains pending.
- Translation Maintenance Batch 2 extends FCN display mapping for risk metrics, KO status, source status, unavailable / unknown labels, current / initial price labels, and FCN risk warnings. It does not change FCN risk calculations or engine contracts.
- V13.5 Full Translation Coverage Program expands `src/lib/i18n/dictionaries.ts` with `zh-CN`, `ja-JP`, and `ko-KR` locale pack mappings for major UI namespaces, and wires Settings diagnostics, Risk Center, and Intelligence Center visible labels to the shared translation layer. It remains UI copy / display mapping only and does not change auth, API, schema, runtime stabilization, valuation, risk scoring, FCN engine, market provider, broker/trading, scheduler, billing, or AI behavior.
- V13.7 Real Translation Coverage Completion Program adds authenticated production DOM coverage reporting through `scripts/audit-production-authenticated.mjs` and extends UI display mapping for shared Workspace Market Status, Health, FCN, and non-English locale packs. It remains UI copy / display mapping only and does not change auth, API, schema, runtime stabilization, valuation, risk scoring, FCN engine, market provider, broker/trading, scheduler, billing, or AI behavior.
- V13.8 Full Workspace Localization Completion extends the authenticated audit from body-token coverage to visible text block evidence and completes high-impact Workspace display mapping for Morning Brief, Health, Risk, FCN schedule, Intelligence, and shared status badges across supported locales. It remains UI copy / display mapping only and does not change auth, API, schema, runtime stabilization, valuation, risk scoring, FCN engine, market provider, broker/trading, scheduler, billing, or AI behavior.
- V14 Live Workspace Program is the active app evolution track. Its implementation phases should connect live market data, valuation, FCN live risk, Workspace Intelligence, Morning Brief, and Beta readiness only through approved phase work while preserving V12 runtime safety and V13 global localization readiness.
- V14 Sprint 2 adds Workspace Intelligence and Workspace Morning Brief under `src/lib/workspace/intelligence/` and `src/lib/workspace/morning-brief/`. These layers are deterministic, explain-only, Workspace-readable, and do not call AI models, deliver notifications, create recommendations, change schemas, or activate broker/trading behavior.
- V14 Sprint 3 adds Beta readiness polish through `/my-ixai/health`, `/my-ixai/beta`, Brief share/export helpers, feedback template, and release notes. These additions are read-only/local-only and do not write database records, send feedback, activate notification delivery, call AI models, or enable broker/trading/recommendation behavior.
- V14 Beta Release Review is docs/governance only. It does not add product code, routes, components, API routes, schema changes, migrations, auth/RLS changes, billing, broker/trading behavior, scheduler/delivery activation, or AI provider behavior.
- Intelligence Engine v1 under `src/lib/intelligence/engine/` now provides deterministic rule-based card generation for Portfolio, Risk, FCN, and Schedule intelligence. It remains no-AI, no-recommendation, no-broker, no-trading, and no-schema-change.
- Portfolio Persistence Layer under `src/lib/portfolio/persistence/` now provides v5.00 persisted/local/fallback readback contracts and summary utilities. It remains an abstraction layer and does not redesign database tables or replace the existing Portfolio Truth Layer in this release.
- Workspace Expansion Program now provides Watchlist, Alerts, Workspace Daily Brief, and Dashboard v2 surfaces. Watchlist remains local/fallback, Alerts remain UI-only, and Daily Brief remains rule-based.
- Workspace Foundation Program now provides Unified Workspace Graph, Notification Center, Workspace Health Engine, Timeline Engine, and Workspace API Gateway service layer. Notification delivery and route handlers remain deferred.
- V6 Platformization Program now provides read-only Workspace API route handlers, persistence foundation abstractions, Workspace Insights, Notification Delivery readiness, and rule-based explain-only Workspace Copilot. External delivery, durable schemas, AI model calls, trading, and broker actions remain out of scope.
- V7 Data Persistence Program now provides typed repository foundations, ownership readiness, sync readiness, FCN persistence readiness, Watchlist persistence readiness, and Alert persistence readiness. Durable schemas remain drafts until explicitly migrated later.
- V8 Database Activation Program now provides optional table readiness checks, disabled-by-default write draft methods, database activation report, and Settings activation diagnostics. Schema activation remains draft-only until explicitly applied later.
- V9 Real Persistence Program now provides guarded live database readback services, readiness-gated write scaffolds, ownership scope helpers, sync plan diagnostics, and migration health checks. It remains fallback-safe and does not require new tables at runtime.
- V10 Database Cutover Program now starts with read priority and platform readiness. Database is preferred when readable data exists; Truth Layer and local/draft fallback remain intact. Writes are guarded, sync apply is disabled by default, and migration execution is prepared but not run.
- V11 Database Activation Program now prepares reviewed database activation artifacts. Database remains optional at runtime; Truth Layer and local fallback remain intact.
- Multi-Asset Portfolio architecture:

```text
Portfolio
├─ FCN
├─ Stocks
├─ Crypto
├─ Grid
├─ Dual
└─ Cash
```

Portfolio data model foundation:

```text
Portfolio Account
↓
Portfolio Asset
↓
Portfolio Position
```

Repository boundary:

```text
UI
↓
Portfolio Repository
↓
Supabase Repository
↓
portfolio_accounts / portfolio_assets / portfolio_positions
↓
Portfolio Dashboard Foundation
↓
Portfolio News Intelligence Foundation
↓
Portfolio News Provider Foundation
↓
Portfolio AI Commentary Foundation
↓
Portfolio Intelligence Engine Foundation
↓
Portfolio Risk Engine Foundation
↓
Portfolio Recommendation Engine Foundation
↓
Portfolio Market Data Foundation
↓
Portfolio Valuation Engine Foundation
↓
Portfolio Exposure Engine Foundation
↓
Portfolio Concentration Engine Foundation
↓
Portfolio Correlation Engine Foundation
↓
Portfolio Scenario Engine Foundation
↓
Portfolio Stress Test Engine Foundation
↓
Portfolio FCN Risk Engine Foundation
↓
Portfolio Core Engine Foundation Complete
↓
Global Market Foundation Review
↓
Legacy Pro Migration Audit and Product Inventory
↓
Platform IA Refactor / Real Market Data Provider / Broker Sync Foundation / External News API (Coming Soon)
```

Platform IA direction after v2.10a:

```text
Home
├─ Portfolio Center
├─ Asset Input
├─ Risk Center
├─ Intelligence Center
├─ FCN Center
└─ Settings
```

v4.00 integration direction:

```text
Public Market
↓
Market Service Layer
↓
Workspace Market Service
↓
Portfolio / Risk / Intelligence market readiness
↓
Portfolio Truth Layer
↓
Portfolio / Risk / Intelligence shared readback
↓
FCN Intelligence Center
↓
Global Risk Center
↓
Intelligence Center V2
```

The active App already has separate route centers. v4.00 should connect their data flow and source-status contracts rather than adding another isolated Workspace page.

v2.11 center ownership rule:

- Portfolio Center owns accounts, assets, positions, valuation, allocation, exposure, and repository status.
- Asset Input owns asset onboarding for Stock / ETF, Crypto, FCN, and future import workflows.
- Risk Center owns concentration, correlation, scenario, stress test, risk report, and monitoring prompts.
- FCN Center owns FCN positions, underlyings, worst-of, KI / KO, observation calendar, coupon calendar, and FCN risk.
- Intelligence Center owns Daily, Weekly, watchlist intelligence, market news, AI commentary, and Social Pack distribution.
- Settings owns membership, entitlements, language, notifications, broker connections, data privacy, and preferences.

- Portfolio route split:
  - `/my-ixai`: Workspace index and center directory.
  - `/my-ixai/home`: Future logged-in workspace home placeholder.
  - `/portfolio`: Portfolio Input, creation, and product explanation.
  - `/my-ixai/portfolio`: Portfolio Workspace homepage with overview, holdings summary, risk snapshot, and quick actions.
  - `/my-ixai/input`: Asset Input Center, global input model foundation, CSV / broker / market / language readiness.
  - `/my-ixai/input/stock`: Usable Stock / ETF input form with local preview.
  - `/my-ixai/input/crypto`: Usable Crypto input form with local preview.
  - `/my-ixai/input/fcn`: FCN Wizard route and canonical FCN data-entry surface with Basic, Barrier, Observation, Dates, Underlyings, and Review.
  - `/my-ixai/portfolio/assets`: Asset Management Center, mock CRUD foundation, future persistent asset CRUD staging area.
  - `/my-ixai/risk`: Global Risk Center foundation with FCN risk summary, multi-asset readiness, upcoming FCN events, data source status, deterministic Foundation Score, and v4.03 Risk Intelligence Layer readback.
  - `/my-ixai/fcn`: FCN Intelligence Center for persisted FCN positions, lifecycle readback, manual local price overlay, KI-distance risk scoring, timeline events, concentration, observation schedule, and coupon dates.
  - `/my-ixai/intelligence`: Intelligence Center with Daily / Weekly / Market entries, FCN highlights, Portfolio Truth summary, Risk Intelligence snapshot, exposure summary, Market Readiness UI, v4.80 deterministic Intelligence Cards, readiness warnings, news readiness, commentary readiness, source status, and compliance footer.
  - v4.10 status: `/my-ixai/portfolio`, `/my-ixai/risk`, and `/my-ixai/intelligence` all consume Portfolio Truth readback. `/my-ixai/portfolio` now renders active-route Workspace Market Status. `/my-ixai/input/stock`, `/my-ixai/input/crypto`, and `/my-ixai/input/fcn` write browser-local pending records into the Input Truth Bridge while server persistence remains future work.
  - `/my-ixai/settings`: Workspace Settings Preview for account, notification, language, region, broker connection, data/privacy IA, and v4.75 Workspace Integration Status diagnostics. Full settings systems remain future work.

- Navigation split:
  - Public navigation mode: `/`, `/daily-brief`, `/market`, `/weekly-brief`, `/fcn`, `/pro`, `/about`, `/login`.
  - `/pro`: IXAI Platform public introduction and conversion page.
  - Workspace navigation mode: `/my-ixai`, `/my-ixai/home`, `/my-ixai/portfolio`, `/my-ixai/input`, `/my-ixai/risk`, `/my-ixai/fcn`, `/my-ixai/intelligence`, `/my-ixai/settings`.
  - Workspace navigation may include `返回官網` to `/`; it should not include the full public website menu.
  - Authenticated entry: Login / Register success should land on `/my-ixai/home`.
  - `/account`: Legacy transitional page only; it should not be the primary Pro / Legacy Pro entry.

This is the future product mainline.

Social Pack Note:

- Social Pack is a distribution asset for reviewed intelligence. It is not the core judgment engine.
- Do not let Social Pack hotfixes or export tooling destabilize Daily / Weekly intelligence, account memory, Portfolio Intelligence, or Pro workflow development.
- Future Social Pack work must follow `docs/SOCIAL_PACK_INCIDENT_REVIEW_20260609.md`.

## backend/ixai_agent

Role:

- Legacy backend mainline candidate and product-memory reference.
- FastAPI service for portfolio, FCN, crypto, cash, account, intelligence, alert, import, preferences, scheduler, notification, and market endpoints.
- v3.05a inventories this backend in `docs/LEGACY_BACKEND_INVENTORY_AUDIT_V305A.md`.
- v3.09 / v3.10 / v3.20 keep FCN Center in the active Next.js App. Do not migrate legacy backend FCN monitor code directly; use it only as conceptual reference for future FCN Center phases.

Current architecture:

- FastAPI.
- SQLAlchemy.
- Alembic.
- Local SQLite for development with PostgreSQL-compatible migration direction.
- JWT auth currently separate from the production frontend's Supabase identity model.

Future integration should happen through a clear boundary, likely a Next API proxy / backend client layer that maps Supabase identity to backend account context.

Migration guidance after v3.05a:

- Treat the backend as a reference library, not a codebase to copy wholesale.
- High-value migration candidates:
  - CSV import preview / validation / audit into `/my-ixai/input`.
  - FCN monitor, Worst-of, KI / KO, observation, and coupon schedule concepts into `/my-ixai/fcn`.
  - Risk alert taxonomy into `/my-ixai/risk`.
  - Portfolio-aware news relevance / impact / priority into `/my-ixai/intelligence`.
  - Scheduler and notification concepts into a future scheduler / notification service.
- Do not migrate legacy templates, localStorage token auth, legacy JWT identity, direct browser-to-FastAPI protected calls, `.next` artifacts, or real market data / LLM providers without dedicated governance.

## frontend/ixai-website-clean

Role:

- IXAI Pro Legacy Dashboard Prototype.
- Not the production frontend.
- Valuable as a reference for future Account / Pro / Portfolio Intelligence surfaces.

Current architecture:

- Next.js App Router.
- FastAPI JWT auth.
- `localStorage` token storage.
- Direct browser-to-FastAPI protected requests via `NEXT_PUBLIC_API_BASE_URL`.

High-value reusable modules:

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

Not recommended for direct migration:

- Legacy JWT login.
- `localStorage` token auth.
- Direct browser-to-FastAPI protected requests.
- Whole `AppShell` navigation.
- Terminal-heavy visual style.

Migration strategy:

- Do not move the whole legacy frontend into production.
- Reuse selected UI patterns, portfolio widgets, FCN risk information architecture, and backend contract ideas.
- First build a backend integration boundary in `app/ixai-web-app`, then migrate small reusable widgets.

## brand/ixuan-brand-site

Role:

- Brand / Social Kit side project.
- Useful for brand reference, content direction, and future visual/social assets.
- Not the production IXAI app mainline.

## Naming Guidance

Future agents should treat `frontend/ixai-website-clean` as a legacy reference project. If the folder is renamed later, `legacy-pro-dashboard` would be a clearer name, but no folder should be moved or deleted without explicit approval.

## V11 Database Cutover Map

New cutover layer:

- `src/lib/workspace/database-cutover/`
  - Controlled write guard.
  - Controlled write readiness service.
  - Remote migration readiness service.
  - Consolidated V11 cutover status.
- `scripts/v11-migration-readiness.mjs`
  - Dry-run local migration/seed review helper.

Diagnostics surfaces:

- `components/workspace/workspace-v11-database-activation-status.tsx`
- `components/workspace/workspace-database-activation-status.tsx`
- `components/workspace/workspace-platform-cutover-status.tsx`
- `src/lib/workspace/graph/workspace-graph-service.ts`
- `src/lib/workspace/integration/integration-audit.ts`

Documentation:

- `docs/V11_DATABASE_CUTOVER_PROGRAM.md`
- `docs/V1120_CONTROLLED_WRITE_ACTIVATION.md`
- `docs/V1130_REMOTE_MIGRATION_READINESS.md`

The V11 cutover layer must remain fallback-preserving and must not execute remote migrations or product writes from diagnostics.

## V12 Workspace Database Write Activation Map

New activation layer:

- `src/lib/workspace/database-write-activation/`
  - V12 write guard metadata.
  - Workspace bootstrap helper.
  - Guarded Watchlist write service.
  - Guarded Alert History write service.
  - Consolidated V12 diagnostics service.

Diagnostics surfaces:

- `components/workspace/workspace-v12-database-write-activation-status.tsx`
- `components/workspace/workspace-database-activation-status.tsx`
- `components/workspace/workspace-platform-cutover-status.tsx`
- `app/my-ixai/home/page.tsx`
- `app/my-ixai/settings/page.tsx`
- `src/lib/workspace/graph/workspace-graph-service.ts`
- `src/lib/workspace/integration/integration-audit.ts`

Persistence table alignment:

- Watchlist writes target `watchlists` and `watchlist_items`.
- Alert History reads and guarded writes target `alert_history`.
- Portfolio and FCN write paths are still disabled/readiness-only.

Documentation:

- `docs/V1200_WORKSPACE_DATABASE_WRITE_ACTIVATION.md`

## V13 Portfolio Database Write Activation Map

New activation layer:

- `src/lib/workspace/portfolio-database-write-activation/`
  - V13 Portfolio / Stock / Crypto write guard metadata.
  - Guarded Portfolio bootstrap through existing `/api/portfolio`.
  - Guarded Stock database write service through existing `/api/stocks`.
  - Guarded Crypto database write service through existing `/api/crypto`.
  - Readiness and diagnostics service.

Updated input surfaces:

- `components/portfolio/stock-input-form.tsx`
- `components/portfolio/crypto-input-form.tsx`

Diagnostics surfaces:

- `components/workspace/workspace-v13-portfolio-database-write-activation-status.tsx`
- `components/workspace/workspace-database-activation-status.tsx`
- `components/workspace/workspace-platform-cutover-status.tsx`
- `app/my-ixai/home/page.tsx`
- `app/my-ixai/settings/page.tsx`
- `src/lib/workspace/graph/workspace-graph-service.ts`
- `src/lib/workspace/integration/integration-audit.ts`

Documentation:

- `docs/V1300_PORTFOLIO_DATABASE_WRITE_ACTIVATION.md`

V13 keeps FCN writes disabled and preserves Truth Layer / local fallback behavior.

## V14 FCN Database Activation Map

New activation layer:

- `src/lib/workspace/fcn-database-activation/`
  - V14 FCN write guard metadata.
  - Guarded FCN position write service through existing `/api/fcn`.
  - FCN underlying normalization for guarded `/api/fcn` writes.
  - FCN observation schedule normalization for guarded position payloads.
  - Readiness and diagnostics service.

Updated FCN surface:

- `components/fcn/fcn-wizard.tsx`
  - Writes Draft Store / Input Truth Bridge / recent input fallback first.
  - Attempts guarded V14 database write only after explicit submit.
- `components/fcn/fcn-center-workspace.tsx`
  - Keeps `/api/fcn` readback first.
  - Preserves pending FCN fallback display.
  - Refreshes after V14 guarded write status events.

Diagnostics surfaces:

- `components/workspace/workspace-v14-fcn-database-activation-status.tsx`
- `components/workspace/workspace-database-activation-status.tsx`
- `components/workspace/workspace-platform-cutover-status.tsx`
- `app/my-ixai/home/page.tsx`
- `app/my-ixai/settings/page.tsx`
- `src/lib/workspace/graph/workspace-graph-service.ts`
- `src/lib/workspace/integration/integration-audit.ts`

Documentation:

- `docs/V1400_FCN_DATABASE_ACTIVATION.md`

V14 keeps database writes disabled by default and preserves FCN Draft Store, Truth Layer, `/api/fcn`, and local fallback behavior.

## V15 Legacy Risk Engine Migration Map

New read-only calculation layer:

- `src/lib/risk/legacy-risk-engine/`
  - Portfolio risk calculation.
  - FCN worst-of / KI / strike / KO risk calculation.
  - Concentration and repeated-underlying calculation.
  - Exposure aggregation and diagnostics.

New / updated UI surfaces:

- `components/risk/legacy-risk-engine-status.tsx`
- `components/risk/portfolio-risk-summary-card.tsx`
- `components/risk/fcn-risk-summary-card.tsx`
- `components/risk/concentration-risk-summary-card.tsx`
- `components/risk/global-risk-center-workspace.tsx`
- `app/my-ixai/home/page.tsx`
- `app/my-ixai/settings/page.tsx`

Workspace metadata:

- `src/lib/workspace/graph/workspace-graph-types.ts`
- `src/lib/workspace/graph/workspace-graph-service.ts`
- `src/lib/workspace/integration/integration-audit.ts`

Documentation:

- `docs/V1500_LEGACY_RISK_ENGINE_MIGRATION.md`

V15 is read-only. It does not add database writes, migrations, auth changes, broker sync, trading logic, Binance/Yahoo provider work, Morning Brief migration, or AI recommendations.

## V16 Morning Brief Engine Map

New read-only Morning Brief layer:

- `src/lib/morning-brief/`
  - `brief-types.ts`
  - `brief-engine.ts`
  - `brief-risk-adapter.ts`
  - `brief-fcn-adapter.ts`
  - `brief-portfolio-adapter.ts`
  - `brief-news-placeholder.ts`
  - `brief-snapshot.ts`
  - `brief-diagnostics.ts`
  - `index.ts`

New UI surfaces:

- `components/morning-brief/morning-brief-status.tsx`
- `components/morning-brief/morning-brief-summary-card.tsx`
- `components/morning-brief/morning-risk-card.tsx`
- `components/morning-brief/morning-fcn-card.tsx`
- `app/my-ixai/home/page.tsx`
- `app/my-ixai/settings/page.tsx`

Workspace metadata:

- `src/lib/workspace/graph/workspace-graph-types.ts`
- `src/lib/workspace/graph/workspace-graph-service.ts`
- `src/lib/workspace/integration/integration-audit.ts`

Documentation:

- `docs/V1600_MORNING_BRIEF_ENGINE.md`

V16 uses V15 Legacy Risk Engine output rather than recalculating another risk engine. It does not add DB writes, SQL, migrations, scheduler, Telegram, Yahoo, Binance, broker, trading, or AI recommendation logic.

## Program A V17-V20 Product Layer Map

New read-only product-layer foundations:

- `src/lib/market-data/`
  - V17 provider interface, manual placeholder provider, provider registry, market data snapshot, and diagnostics.
- `src/lib/morning-brief/brief-market-data-adapter.ts`
  - V18 Morning Brief market-data snapshot adapter.
- `src/lib/intelligence/v2/`
  - V19 deterministic Intelligence Center v2 context, adapters, diagnostics, and safety flags.
- `src/lib/saas-foundation/`
  - V20 plan, subscription, usage, team, and SaaS readiness metadata.

New / updated UI surfaces:

- `components/workspace/program-a-product-layer-status.tsx`
- `components/intelligence/intelligence-v2-summary.tsx`
- `app/my-ixai/home/page.tsx`
- `app/my-ixai/settings/page.tsx`
- `components/intelligence/intelligence-center-workspace.tsx`

Workspace metadata:

- `src/lib/workspace/graph/workspace-graph-types.ts`
- `src/lib/workspace/graph/workspace-graph-service.ts`
- `src/lib/workspace/integration/integration-audit.ts`

Documentation:

- `docs/PROGRAM_A_V17_V20_PRODUCT_LAYER.md`
- `docs/V1700_MARKET_DATA_PROVIDER_FOUNDATION.md`
- `docs/V1800_MORNING_BRIEF_LIVE_DATA_READINESS.md`
- `docs/V1900_INTELLIGENCE_CENTER_V2_FOUNDATION.md`
- `docs/V2000_SAAS_FOUNDATION_READINESS.md`

Program A is read-only. It does not add DB writes, SQL, migrations, schema/RLS/auth/membership changes, Yahoo, Binance, broker, Telegram, scheduler, OpenAI/AI calls, trading, recommendations, billing provider, or subscription enforcement.

## Program B V21-V24 Live Platform Map

New read-only readiness layers:

- `src/lib/market-data/live-provider-readiness/`
  - V21 provider config, health, quote request/response, cache policy, and disabled provider status.
- `src/lib/valuation/`
  - V22 valuation input, future portfolio valuation snapshot, FCN underlying valuation readiness, and missing/stale/manual quote states.
- `src/lib/broker/`
  - V23 broker provider interface, manual broker placeholder, account snapshot, sync readiness, and trading-disabled diagnostics.
- `src/lib/risk/automation-readiness/`
  - V24 risk rule, trigger, alert-evaluation, snapshot-comparison, and automation diagnostics.

New / updated UI surfaces:

- `components/workspace/program-b-live-platform-status.tsx`
- `app/my-ixai/home/page.tsx`
- `app/my-ixai/settings/page.tsx`

Workspace metadata:

- `src/lib/workspace/graph/workspace-graph-types.ts`
- `src/lib/workspace/graph/workspace-graph-service.ts`
- `src/lib/workspace/integration/integration-audit.ts`

Documentation:

- `docs/PROGRAM_B_LIVE_PLATFORM_READINESS.md`
- `docs/V2100_MARKET_DATA_LIVE_PROVIDER_READINESS.md`
- `docs/V2200_PORTFOLIO_LIVE_VALUATION_READINESS.md`
- `docs/V2300_BROKER_INTEGRATION_FOUNDATION.md`
- `docs/V2400_RISK_AUTOMATION_READINESS.md`

Program B is readiness-only. It does not add DB writes, SQL, migrations, schema/RLS/auth/membership changes, external fetch, Yahoo/Binance/Futu/IBKR live APIs, broker live API, Telegram, scheduler, notification sender, OpenAI/LLM calls, trading, recommendations, billing provider, or entitlement enforcement.

## Live Product Program 1 Map

New read-only live data layers:

- `src/lib/market-data/yahoo/`
  - Yahoo quote types, normalizer, server-side provider, in-memory cache, and diagnostics.
- `app/api/market/yahoo-quotes/route.ts`
  - Read-only API route for validated symbol quote snapshots.
- `src/lib/valuation/`
  - Portfolio live valuation preview, FCN live underlying status, and client preview loader.
- `src/lib/risk/legacy-risk-engine/live-risk-adapter.ts`
  - V15 Risk Engine output with Yahoo quote freshness metadata.
- `src/lib/morning-brief/`
  - Optional live preview summary for Morning Brief snapshots.

New / updated UI surfaces:

- `components/market/live-market-data-status.tsx`
- `components/portfolio/live-portfolio-valuation-card.tsx`
- `components/fcn/live-fcn-underlying-status-card.tsx`
- `components/risk/live-risk-adapter-card.tsx`
- `components/morning-brief/live-morning-brief-preview.tsx`
- `app/my-ixai/home/page.tsx`
- `app/my-ixai/portfolio/page.tsx`
- `components/fcn/fcn-center-workspace.tsx`
- `components/risk/global-risk-center-workspace.tsx`

Documentation:

- `docs/LIVE_PRODUCT_1_YAHOO_VALUATION_BRIEF.md`

Live Product Program 1 is read-only. It adds Yahoo quote fetch through a server-side route and in-memory cache, but does not add DB writes, Supabase mutations, SQL, migrations, schema/RLS/auth/membership changes, broker API, Binance trading, order execution, buy/sell/rebalance instructions, OpenAI/AI recommendations, Telegram, scheduler, Stripe, or billing.

## V12 Live Product Upgrade Program Map

New shared live market service:

- `src/lib/market-data/live-market-types.ts`
- `src/lib/market-data/live-market-snapshot.ts`
- `src/lib/market-data/live-market-service.ts`
- `src/lib/market-data/index.ts`

Morning Brief v1:

- `src/lib/morning-brief/morning-brief-live-service.ts`
- `src/lib/morning-brief/morning-brief-sections.ts`
- `src/lib/morning-brief/morning-brief-share.ts`
- `components/morning-brief/morning-brief-live-card.tsx`

Updated integrations:

- `src/lib/valuation/live-valuation-client.ts`
- `src/lib/watchlist/watchlist-service.ts`
- `src/lib/watchlist/watchlist-types.ts`
- `src/lib/alerts/alert-engine.ts`
- `components/alerts/alert-summary.tsx`
- `components/watchlist/watchlist-summary.tsx`
- `components/market/live-market-data-status.tsx`
- `components/portfolio/live-portfolio-valuation-card.tsx`
- `components/fcn/live-fcn-underlying-status-card.tsx`
- `components/risk/live-risk-adapter-card.tsx`
- `app/my-ixai/home/page.tsx`

Documentation:

- `docs/V12_LIVE_PRODUCT_UPGRADE_PROGRAM.md`

V12 is read-only. It does not add DB writes, Supabase mutations, SQL, migrations, schema/RLS/auth/membership changes, broker APIs, order execution, auto trading, buy/sell/rebalance instructions, AI recommendations, billing, Telegram scheduler, or external news providers.
