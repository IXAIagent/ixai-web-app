# v4.00 Intelligence + Market Integration Program

## 1. Why v4.00 Exists

IXAI has accumulated many strong foundations: public Market, Portfolio Center, Asset Input, FCN Intelligence Center, Global Risk Center, Portfolio engine foundations, public Daily / Weekly Intelligence, and Legacy Pro migration audits.

The current problem is not a lack of modules. The problem is that the modules are not yet connected into one operating workflow.

v4.00 should therefore be treated as an integration program, not another page or another isolated engine.

The target user feeling is:

```text
I can open IXAI and understand what matters in my holdings, FCN, market context, and risk workflow today.
```

## 2. Product Problem Statement

Current IXAI has:

- Market data and public intelligence surfaces.
- Portfolio and position persistence foundations.
- FCN position readback and FCN risk/intelligence readback.
- A Global Risk Center foundation.
- Many mock / deterministic portfolio engines.
- Legacy backend and Legacy Pro concepts for news relevance, risk alerts, FCN schedules, CSV import, and notification workflow.

But the user still sees disconnected centers:

```text
Market
Portfolio
FCN
Risk
Intelligence
```

The missing layer is the connective tissue that turns these centers into one daily investment intelligence workflow.

## 3. Current App State

Main branch state during this audit:

- `/market`: public Market Overview with quote / market intelligence components and provider-status copy.
- `/my-ixai/home`: Workspace landing placeholder / directory.
- `/my-ixai/portfolio`: user-readable Portfolio Workspace homepage, but core overview cards still show foundation / placeholder values.
- `/my-ixai/input`: canonical Asset Input Center.
- `/my-ixai/input/fcn`: FCN Wizard and active FCN data-entry surface.
- `/my-ixai/input/stock`: Stock / ETF input surface, still mostly input/readiness.
- `/my-ixai/input/crypto`: Crypto input surface, still mostly input/readiness.
- `/my-ixai/fcn`: FCN Intelligence Center with Supabase `/api/fcn` readback, lifecycle, manual local price overlay, timeline, risk scoring, and concentration.
- `/my-ixai/risk`: Global Risk Center foundation using FCN v3.20 helper output plus Stock / Crypto / Grid / Dual readiness.
- `/my-ixai/intelligence`: placeholder on current main. A v3.40 branch exists conceptually, but `docs/V340_INTELLIGENCE_CENTER_V1.md` is not present on main during this audit.
- `/my-ixai/settings`: placeholder.

## 4. Current Route / Center Map

| Center | Current Readiness | Real Data Sources | Mock / Placeholder Data | Missing Connections | Should Own | Should Not Own |
|---|---|---|---|---|---|---|
| Public Market `/market` | Real public surface | `app/api/market/quotes`, `app/api/market/intelligence`, public news providers, market quote providers | Fallback quotes when providers fail | Workspace-safe market service, portfolio symbol targeting, FCN underlying quotes | Public market context, quote/readiness labels, public intelligence links | Private holdings, personalized risk, broker data |
| Workspace Home `/my-ixai/home` | Directory / entry | None meaningful | Center links | Daily state summary across Portfolio / Risk / FCN / Intelligence | Workspace entry | Deep engine readback |
| Portfolio Center `/my-ixai/portfolio` | User-readable foundation | Some legacy dashboard/API helpers exist; repository/portfolio APIs exist elsewhere | Overview cards show zeros / foundation values | Truth layer across `/api/fcn`, `/api/stocks`, `/api/crypto`, Portfolio Repository, dashboard summary | Assets, positions, valuation, allocation, exposure | News/commentary, FCN-specific KI workflow, scenario/stress ownership |
| Asset Input `/my-ixai/input` | Usable input foundation | FCN submit path writes through `/api/fcn`; Stock/Crypto APIs exist | Some local preview/recent input behavior | Unified post-submit readback, Portfolio truth layer, CSV import | Manual input, CSV import, future broker import staging | Risk scoring, intelligence interpretation |
| FCN Center `/my-ixai/fcn` | Strongest Workspace center | `/api/fcn`, `fcn_positions`, `fcn_underlyings`, local manual price overlay | Manual prices are local only | Shared market quote overlay, persisted price update, KO distance, alert routing | FCN positions, KI/KO, observation/coupon, FCN lifecycle, FCN-specific risk | Generic multi-asset risk center ownership |
| Risk Center `/my-ixai/risk` | Working foundation | `/api/fcn`, `/api/stocks`, `/api/crypto`, v3.20 FCN helpers | Stock/Crypto/Grid/Dual readiness, foundation score | Portfolio truth layer, real multi-asset valuation/exposure, market-service freshness | Global risk overview, FCN risk summary, concentration/correlation/scenario/stress over time | Raw data entry, public market page |
| Intelligence Center `/my-ixai/intelligence` | Placeholder on main | Public Daily / Weekly routes exist; public Market exists | Placeholder owner list | v3.40 or later Intelligence Center v1, portfolio-aware highlights, FCN/Risk/Market highlight aggregation | Daily/Weekly entry, portfolio-aware highlights, FCN/Risk/Market narrative readiness | Direct market provider integration, trading recommendations |
| Settings `/my-ixai/settings` | Placeholder | None meaningful | Placeholder | Language, region, notification, broker consent, membership details | Preferences, notifications, language, broker connections | Core risk calculations |

## 5. Current Data Flow Map

```text
Public Market
  → app/api/market/quotes
  → src/lib/market-data/providers.ts
  → src/lib/market-data/fallback.ts
  → Market page components

Public Market Intelligence
  → app/api/market/intelligence
  → src/lib/market-data/intelligence.ts
  → src/lib/news/providers.ts
  → Market page components

FCN Input
  → /my-ixai/input/fcn
  → FCNWizard
  → POST /api/fcn
  → src/lib/fcn/server.ts
  → Supabase fcn_positions / fcn_underlyings
  → GET /api/fcn
  → FCN Intelligence Center

Manual FCN Prices
  → src/lib/fcn/manual-price-overrides.ts
  → localStorage ixai.fcn.manual-prices.v320
  → src/lib/fcn/intelligence-center.ts
  → FCN Center and Risk Center readback

Global Risk Center
  → GET /api/fcn
  → GET /api/stocks
  → GET /api/crypto
  → src/lib/risk/global-risk-center.ts
  → /my-ixai/risk

Portfolio Dashboard
  → app/api/portfolio/dashboard
  → src/lib/portfolio/dashboard.ts
  → Portfolio / FCN / Stock / Crypto summary

Portfolio Repository Foundation
  → src/lib/portfolio/repository/*
  → portfolio_accounts / portfolio_assets / portfolio_positions
  → mock and Supabase repository boundary

Portfolio Engine Foundations
  → src/lib/portfolio/market-data
  → valuation
  → exposure
  → concentration
  → correlation
  → scenario
  → stress-test
  → FCN-risk
```

## 6. Broken Or Disconnected Data Flows

| Flow | Current Gap | Why It Matters | Safe Fix Direction |
|---|---|---|---|
| Asset Input → Portfolio Center | Portfolio overview cards can remain zero even when FCN / Stock / Crypto records exist. | Users cannot see that their input changed Portfolio truth. | Build a Portfolio Truth Layer that reads `/api/fcn`, `/api/stocks`, `/api/crypto`, and portfolio dashboard/repository data. |
| Public Market → Workspace | Public Market has quote/news logic, but Workspace centers do not share one service contract. | FCN risk and Intelligence cannot safely use quote context without duplicating providers. | Add a Workspace Market Service wrapper with source, timestamp, status, stale/fallback semantics. |
| FCN Underlyings → Market Quotes | FCN Center supports manual prices, but no approved shared market overlay exists. | KI distance remains UNKNOWN unless user manually enters prices. | Let FCN consume Workspace Market Service after provider/freshness governance is explicit. Keep manual overlay as user override. |
| Risk Center → Portfolio Engines | Risk Center currently uses FCN helper output and readiness cards, not the full portfolio engine chain. | Risk Center is not yet a true multi-asset risk workspace. | Move deterministic engine outputs behind a shared builder once Portfolio Truth Layer is stable. |
| Intelligence Center → Real Workflow | Intelligence route is placeholder on main; public Daily/Weekly and Market are not aggregated into Workspace. | User cannot yet read “what matters today” in one place. | Productize Intelligence Center after truth/market services are available; v3.40 branch may be the first step. |
| Legacy Backend → App | Valuable concepts exist, but unsafe auth/provider/scheduler patterns must not be copied. | Direct migration can break production auth and compliance. | Migrate concepts by App-native contracts and rewrite only. |

## 7. Existing Reusable Systems

Reuse these systems instead of rebuilding:

- `/api/fcn`, `src/lib/fcn/server.ts`, `src/lib/fcn/intelligence-center.ts`, and `src/lib/fcn/manual-price-overrides.ts`.
- `/api/stocks`, `src/lib/stock/server.ts`, and `stock_positions` contracts.
- `/api/crypto`, `src/lib/crypto/server.ts`, and `crypto_positions` contracts.
- `/api/portfolio/dashboard` and `src/lib/portfolio/dashboard.ts`.
- Portfolio Repository contracts under `src/lib/portfolio/repository/`.
- Portfolio engine foundations under `src/lib/portfolio/*`.
- Public quote and market intelligence providers under `src/lib/market-data/*` and `src/lib/news/*`.
- Public Daily / Weekly routes and editorial workflows.
- Legacy backend audit conclusions as product concepts, not direct code.

## 8. What Must Not Be Rebuilt

Do not rebuild:

- FCN risk calculation from scratch. Reuse v3.20 helpers.
- Auth/session logic.
- Membership / entitlement logic.
- Market quote providers directly inside Workspace components.
- News providers directly inside Workspace components.
- Portfolio engine chains already present under `src/lib/portfolio`.
- Legacy Pro auth, templates, AppShell, localStorage token model, or direct browser-to-FastAPI calls.

## 9. Data Source Audit

| Source | Path | Real Or Mock | Authenticated | Workspace Reusable | Normalization Needed |
|---|---|---|---|---|---|
| FCN positions | `/api/fcn`, `src/lib/fcn/server.ts` | Real Supabase | Yes | Yes | Map to FCN risk, Portfolio truth, Intelligence highlights |
| FCN underlyings | `fcn_underlyings` via `/api/fcn` | Real Supabase | Yes | Yes | Symbol, current price, KI/KO, observation/coupon normalization |
| Manual FCN prices | `ixai.fcn.manual-prices.v320` | Local overlay | Browser-local | Yes, as override | Staleness, source label, persistence boundary |
| Stock positions | `/api/stocks`, `src/lib/stock/server.ts` | Real Supabase path | Yes | Yes | Map input forms to API, market/current price semantics |
| Crypto positions | `/api/crypto`, `src/lib/crypto/server.ts` | Real Supabase path | Yes | Yes | Strategy type normalization for Grid / Dual |
| Portfolio dashboard | `/api/portfolio/dashboard`, `src/lib/portfolio/dashboard.ts` | Real computed summary | Yes | Yes | Align with Portfolio Truth Layer |
| Portfolio repository assets | `src/lib/portfolio/repository/*` | Supabase + mock boundary | Yes | Yes | Decide when repository assets are canonical versus position tables |
| Public market quotes | `/api/market/quotes`, `src/lib/market-data/providers.ts` | Live/fallback public providers | Public | Yes with wrapper | Workspace-safe freshness, provider, fallback labels |
| Public market intelligence | `/api/market/intelligence` | Public provider + fallback/news logic | Public | Link/reuse with caution | Workspace summary contract |
| News feed | `src/lib/news/providers.ts`, `src/lib/portfolio/news/*` | Public RSS + mock portfolio news foundation | Mixed | Future | Relevance to holdings and provider provenance |
| Daily / Weekly | `/daily-brief`, `/weekly-brief`, admin/editorial libs | Real public/editorial | Public | Link/reuse | Workspace entry and summary contract |
| Portfolio mock engines | `src/lib/portfolio/*/mock-*` | Deterministic mock | No | Planning/reference | Label as mock/foundation only |

## 10. Market → Workspace Integration Plan

Public Market already has reusable quote and news/signal logic:

- `app/api/market/quotes`
- `app/api/market/intelligence`
- `src/lib/market-data/providers.ts`
- `src/lib/market-data/intelligence.ts`
- `src/lib/news/providers.ts`

The missing layer is a Workspace-safe service that prevents each Workspace center from importing provider details directly.

Recommended first helper:

```text
src/lib/market/workspace-market-service.ts
```

Responsibilities:

- Accept symbols from Portfolio Truth Layer, FCN underlyings, or Intelligence Center.
- Call existing quote provider boundary rather than duplicating provider code.
- Return normalized quote objects with:
  - `symbol`
  - `price`
  - `currency`
  - `source`
  - `sourceLabel`
  - `status`
  - `updatedAt`
  - `isFallback`
  - `isStale`
  - `disclaimer`
- Keep public Market as the full detail page.
- Let Workspace surfaces show concise source/freshness status.

Do not connect new providers in v4.00.

## 11. Portfolio Truth Layer Plan

Current issue:

- Portfolio Center can show zero / placeholder cards.
- FCN Center can show real FCN records.
- Risk Center can read FCN / Stock / Crypto APIs.
- Portfolio Repository has a separate Account → Asset → Position foundation.

This creates multiple “truth” candidates.

Recommended first builder:

```text
src/lib/portfolio/workspace-portfolio-truth.ts
```

or, if the existing dashboard route is preferred:

```text
src/lib/portfolio/dashboard.ts
```

Safe implementation path:

1. Define a normalized readback shape for Workspace:
   - portfolios
   - fcnPositions
   - stockPositions
   - cryptoPositions
   - repositoryAccounts
   - repositoryAssets
   - repositoryPositions
   - derived grid/dual counts
   - source statuses
2. First implementation may run client-side by calling existing APIs with Supabase authorization headers.
3. Do not create new schema or migration.
4. Update Portfolio Center to show real counts from the truth layer.
5. Later decide whether `/api/portfolio/dashboard` should become the server-side canonical summary.

What can be fixed without schema/migration:

- Real counts for FCN / Stock / Crypto.
- Grid / Dual counts from crypto metadata/strategy fields.
- Recent input / persisted record reconciliation copy.
- Portfolio Center source-status cards.

What may require future schema/migration:

- Durable asset-position unification across `portfolio_assets` and `fcn_positions` / `stock_positions` / `crypto_positions`.
- Persistent manual price overrides.
- Broker/source account mapping.
- CSV import batch/audit tables.

## 12. FCN Real Risk Plan

Current FCN risk inputs:

- FCN position fields from `/api/fcn`.
- Underlying symbol, initial price, KI/KO price, current price if stored.
- Manual local price overlay.
- Observation / coupon / maturity dates.

Missing current price problem:

- Current price is often absent.
- Manual overlay solves immediate display but is not persistent and has no freshness semantics.
- Public Market quote provider can supply some symbols but is not yet wrapped for private Workspace usage.

Safe FCN risk integration order:

1. Keep v3.20 manual overlay as explicit user override.
2. Add Workspace Market Service as optional quote source.
3. Compute effective current price by priority:
   - manual overlay
   - stored current price
   - workspace market quote, once approved
   - missing/UNKNOWN
4. Keep source label visible per underlying.
5. Recompute:
   - current price
   - Worst-of
   - KI distance
   - KO distance, when data is available
   - risk status
   - upcoming observation
   - upcoming coupon
6. Do not imply live market data unless quote source is active and timestamped.

What can be completed with existing data:

- Worst-of from stored/manual current prices.
- KI distance.
- risk status.
- upcoming observation/coupon events from stored dates.
- concentration by underlying.

What requires future provider/persistence changes:

- live price-backed KI/KO monitoring.
- stale price alerts.
- persisted price overrides.
- automated alert routing.

## 13. Intelligence Center V2 Plan

Intelligence Center should aggregate, not invent.

It should use:

- Daily / Weekly public intelligence as entry points and summaries.
- Public Market page as market context.
- Portfolio Truth Layer for holdings counts and missing data state.
- FCN v3.20 helpers for FCN highlights.
- Risk Center readback for foundation risk highlights.
- News readiness and commentary readiness as explicit state until real provider/AI governance is approved.

Target sections:

- Today’s Portfolio Highlights.
- FCN Highlights.
- Risk Highlights.
- Market Highlights.
- Daily / Weekly entry points.
- News readiness.
- Commentary readiness.
- Next action workflow.
- Source status / compliance footer.

Rules:

- Do not invent holdings.
- Do not invent prices.
- Do not invent news.
- Do not imply live AI commentary.
- Do not provide investment recommendations.

## 14. Legacy Pro / Backend Reuse Plan

| Candidate | Classification | Migration Direction |
|---|---|---|
| Portfolio-aware news relevance | Must migrate soon | Rewrite as deterministic relevance rules for Intelligence Center V2. |
| Risk alert taxonomy | Must migrate soon | Move concepts into Risk Center after truth layer exists. |
| FCN monitor / schedule | Mostly migrated, continue | Continue enriching FCN Center using App-native TS helpers. |
| CSV import | Must migrate soon | Add after Portfolio Truth Layer so imports land in trusted data model. |
| Scheduler / notification | Later | Requires Settings consent, delivery logs, pause/unsubscribe, audit controls. |
| Multi-language | Later foundation | Needs Settings/i18n contracts before UI localization. |
| Market provider concepts | Soon, with governance | Reuse stale/fallback/provider status ideas; do not copy providers blindly. |
| LLM summarizer | Do not migrate now | Requires AI provider governance, cost/quality controls, compliance review. |
| Telegram delivery | Do not migrate now | Requires notification policy and consent. |
| Legacy auth/templates/AppShell | Do not migrate | Unsafe and conflicts with active App architecture. |

## 15. v4.00 Program Goals

v4.00 should deliver an integration layer across:

```text
Market
↓
Portfolio
↓
FCN
↓
Risk
↓
Intelligence
```

Program goals:

1. Establish one Portfolio Truth Layer.
2. Establish one Workspace Market Service.
3. Integrate FCN risk with stored/manual/future market price source semantics.
4. Turn Intelligence Center into a truthful operating surface.
5. Keep source status visible everywhere.
6. Preserve compliance boundaries.
7. Avoid new schema/migration until the data-contract gap is explicit.

## 16. Suggested Sprint Breakdown

### v4.00a — Architecture Audit

Goal:

- Document route state, data sources, reusable systems, disconnected flows, and integration phases.

Likely files:

- `docs/V400_INTELLIGENCE_MARKET_INTEGRATION_PROGRAM.md`
- `docs/ROADMAP.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/PROJECT_MAP.md`
- `docs/IXAI_VISION.md`
- `docs/VERSION_HISTORY.md`

Validation:

- `git diff --check`

Out of scope:

- Product code.

### v4.01 — Portfolio Truth Layer

Goal:

- Make Portfolio Center trust one normalized readback across FCN / Stock / Crypto / Portfolio Dashboard / Repository.

Likely files:

- `src/lib/portfolio/workspace-portfolio-truth.ts`
- `components/portfolio/*`
- `app/my-ixai/portfolio/page.tsx`
- optional update to `app/api/portfolio/dashboard/route.ts`

Data sources:

- `/api/fcn`
- `/api/stocks`
- `/api/crypto`
- `/api/portfolio/dashboard`
- Portfolio Repository.

Validation:

- `git diff --check`
- `npm run lint`
- `npm run build`
- route smoke `/my-ixai/portfolio`.

Out of scope:

- schema/migration, broker sync, live market data.

### v4.02 — Workspace Market Service

Goal:

- Wrap existing public market quote / market intelligence provider boundary for Workspace use.

Likely files:

- `src/lib/market/workspace-market-service.ts`
- FCN/Risk/Intelligence helper tests or docs.

Data sources:

- existing `src/lib/market-data/providers.ts`
- existing `app/api/market/quotes`
- fallback quote semantics.

Validation:

- lint/build.
- source/freshness/fallback labels visible in readback.

Out of scope:

- new providers, provider credentials, broker data.

### v4.03 — FCN Real Risk Integration

Goal:

- Let FCN risk use a consistent effective price source: manual overlay, stored current price, and eventually Workspace market quote.

Likely files:

- `src/lib/fcn/intelligence-center.ts`
- `components/fcn/fcn-center-workspace.tsx`
- possibly `src/lib/market/workspace-market-service.ts`.

Data sources:

- `/api/fcn`
- manual overlay
- Workspace Market Service.

Validation:

- route smoke `/my-ixai/fcn`.
- verify UNKNOWN remains for missing/invalid data.

Out of scope:

- live-market claims, persisted price update, alert push.

### v4.04 — Intelligence Center V2

Goal:

- Turn Intelligence Center into the daily operating surface that aggregates Market, Portfolio Truth, FCN, and Risk readback.

Likely files:

- `app/my-ixai/intelligence/page.tsx`
- `components/intelligence/intelligence-center-workspace.tsx`
- `src/lib/intelligence/workspace-intelligence-center.ts`

Data sources:

- Daily / Weekly links.
- Market service.
- Portfolio Truth Layer.
- FCN helper output.
- Risk Center helper output.

Validation:

- route smoke `/my-ixai/intelligence`, `/daily-brief`, `/weekly-brief`, `/market`.

Out of scope:

- external AI/news provider, personalized advice.

### v4.05 — Integration QA / Release Hardening

Goal:

- Validate the end-to-end user workflow:

```text
Input
→ Portfolio
→ FCN
→ Risk
→ Intelligence
→ Market
```

Validation:

- lint/build.
- authenticated smoke with test account.
- route smoke all Workspace centers.
- source status audit.
- compliance wording audit.

Out of scope:

- new features.

## 17. Scope Boundaries

v4.00 program must not implement:

- New external market provider.
- New external news provider.
- OpenAI / Claude / Gemini.
- Broker sync.
- Telegram / LINE push.
- Payment / billing.
- Trading / order execution.
- Personalized buy/sell recommendations.
- New schema or migration unless a dedicated future sprint proves unavoidable.
- Major UI redesign.
- Social Pack changes.
- Admin editorial changes.
- Auth or membership changes.

## 18. Compliance Boundaries

All v4.00 work remains:

- Monitoring.
- Risk awareness.
- Intelligence workflow.
- Data organization.

It must not become:

- Investment advice.
- Buy / sell instruction.
- Exact position sizing.
- Target price prediction.
- Return promise.
- Automated trading.
- Broker execution.

Every center must show data source / freshness / placeholder state where relevant.

## 19. Validation Strategy

For docs-only audit:

- `git diff --check`

For implementation sprints:

- `git diff --check`
- `npm run lint`
- `npm run build`
- Route smoke for touched routes.
- Authenticated smoke when reading private APIs.
- Source-status QA: live / fallback / placeholder / unavailable labels must match actual source behavior.
- Compliance QA: no trading instruction, no target price, no return promise.

## 20. Future Direction

### v4.10 — Workspace Market Data Integration

- Promote Workspace Market Service from foundation to shared runtime helper.
- Add stale/fallback/provider-health semantics to FCN, Risk, and Intelligence readback.

### v4.20 — Portfolio-Aware Intelligence

- Use Portfolio Truth Layer and Workspace Market Service to produce deterministic portfolio-aware market/news highlights.
- Migrate Legacy backend news relevance concepts by rewrite.

### v5.00 — AI Wealth Intelligence OS Beta

- Only after truth layer, market source governance, alert consent, and compliance copy are stable.
- Potentially introduce approved AI provider governance.
- Keep human judgment, source transparency, and non-advisory boundaries central.
