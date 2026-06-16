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
- Global market principle: `app/ixai-web-app` should be treated as a Global Multi-Asset, Multi-Broker, Multi-Market AI Risk Platform. Future portfolio, FCN, valuation, exposure, concentration, correlation, scenario, stress-test, market data, news, and localization work must not assume US-only, Taiwan-only, or English-only data. See `docs/GLOBAL_MARKET_VISION.md`.
- Future Pro features should be built inside `app/ixai-web-app` instead of migrating the whole legacy frontend.
- Legacy Pro is reference-only and should gradually retire as App-native Portfolio, FCN, and Risk workflows mature.

Current architecture:

- Next.js App Router.
- Supabase / Next API routes / editorial static and dynamic intelligence.
- Public Intelligence, Account Intelligence, Social Intelligence, Daily / Weekly engines, and admin workflows.
- Market Abstraction Layer under `src/lib/market/` for future Workspace market provider contracts. v4.05 contract layer is mock-only and does not connect external providers.
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
Workspace Market Service
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
  - `/my-ixai/intelligence`: Intelligence Center with Daily / Weekly / Market entries, FCN highlights, Portfolio Truth summary, Risk Intelligence snapshot, exposure summary, Market Readiness UI, readiness warnings, news readiness, commentary readiness, source status, and compliance footer.
  - `/my-ixai/settings`: Settings placeholder.

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
