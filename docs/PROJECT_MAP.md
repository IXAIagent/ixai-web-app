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
- Global market principle: `app/ixai-web-app` should be treated as a Global Multi-Asset, Multi-Broker, Multi-Market AI Risk Platform. Future portfolio, FCN, valuation, exposure, concentration, correlation, scenario, stress-test, market data, news, and localization work must not assume US-only, Taiwan-only, or English-only data. See `docs/GLOBAL_MARKET_VISION.md`.
- Future Pro features should be built inside `app/ixai-web-app` instead of migrating the whole legacy frontend.
- Legacy Pro is reference-only and should gradually retire as App-native Portfolio, FCN, and Risk workflows mature.

Current architecture:

- Next.js App Router.
- Supabase / Next API routes / editorial static and dynamic intelligence.
- Public Intelligence, Account Intelligence, Social Intelligence, Daily / Weekly engines, and admin workflows.
- Market Abstraction Layer under `src/lib/market/` for future Workspace market provider contracts. v4.05 contract layer is mock-only, v4.06 surfaces registry readiness, v4.07 adds provider health / fallback policy contracts, v4.08 adds unified market service entrypoints, v4.09 surfaces those entrypoints across Portfolio, Risk, and Intelligence, and v4.20 adds the first public Yahoo Finance / Binance quote adapters behind the Market Service facade.
- Portfolio Valuation Layer under `src/lib/portfolio/valuation/` now includes v4.30 estimated valuation readback for Portfolio Center. It remains a monitoring layer and does not change database schema, API contracts, trading, broker sync, or recommendation logic.
- Risk Engine v1 under `src/lib/risk/` now includes v4.40 valuation-derived risk readback for Risk Center. It remains monitoring-only and does not change database schema, API contracts, trading, broker sync, recommendation logic, or FCN pricing.
- FCN Risk Engine v1 under `src/lib/fcn/risk/` now includes v4.50 FCN-native monitoring readback for FCN Center. It remains monitoring-only and does not change database schema, API contracts, trading, broker sync, recommendation logic, Greeks, Monte Carlo, option valuation, scenario simulation, or full FCN pricing.
- FCN Coupon & Schedule Engine under `src/lib/fcn/schedule/` now includes v4.60 schedule normalization and coupon / observation / KO / maturity readback for FCN Center. It remains monitoring-only and does not change database schema, API contracts, tax reporting, trading, broker sync, recommendation logic, or full FCN pricing.
- Server-side Market Cache Layer under `src/lib/market/cache/` now provides memory-only market cache types, store, service, and snapshot diagnostics for Market Service quote consumers. It remains infrastructure-only and does not change database schema, API contracts, auth, broker sync, trading, recommendation logic, or FCN pricing.
- Workspace Integration diagnostics under `src/lib/workspace/integration/` now validate expected exports, fallback presence, and safe dependency chain across Workspace data layers without network tests, schema changes, auth changes, broker sync, trading, recommendation logic, or FCN pricing.
- Intelligence Engine v1 under `src/lib/intelligence/engine/` now provides deterministic rule-based card generation for Portfolio, Risk, FCN, and Schedule intelligence. It remains no-AI, no-recommendation, no-broker, no-trading, and no-schema-change.
- Portfolio Persistence Layer under `src/lib/portfolio/persistence/` now provides v5.00 persisted/local/fallback readback contracts and summary utilities. It remains an abstraction layer and does not redesign database tables or replace the existing Portfolio Truth Layer in this release.
- Workspace Expansion Program now provides Watchlist, Alerts, Workspace Daily Brief, and Dashboard v2 surfaces. Watchlist remains local/fallback, Alerts remain UI-only, and Daily Brief remains rule-based.
- Workspace Foundation Program now provides Unified Workspace Graph, Notification Center, Workspace Health Engine, Timeline Engine, and Workspace API Gateway service layer. Notification delivery and route handlers remain deferred.
- V6 Platformization Program now provides read-only Workspace API route handlers, persistence foundation abstractions, Workspace Insights, Notification Delivery readiness, and rule-based explain-only Workspace Copilot. External delivery, durable schemas, AI model calls, trading, and broker actions remain out of scope.
- V7 Data Persistence Program now provides typed repository foundations, ownership readiness, sync readiness, FCN persistence readiness, Watchlist persistence readiness, and Alert persistence readiness. Durable schemas remain drafts until explicitly migrated later.
- V8 Database Activation Program now provides optional table readiness checks, disabled-by-default write draft methods, database activation report, and Settings activation diagnostics. Schema activation remains draft-only until explicitly applied later.
- V9 Real Persistence Program now provides guarded live database readback services, readiness-gated write scaffolds, ownership scope helpers, sync plan diagnostics, and migration health checks. It remains fallback-safe and does not require new tables at runtime.
- V10 Database Cutover Program now starts with read priority only. Database is preferred when readable data exists; Truth Layer and local/draft fallback remain intact.
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
