# v3.05a Legacy Backend Inventory Audit

Date: 2026-06-11

Legacy backend path:

`/Users/itsunkuo/Desktop/IXAI_PROJECTS/backend/ixai_agent`

Current IXAI App path:

`/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app`

This audit is documentation-only. No backend code, frontend product code, schema, migration, auth, API, or UI behavior was changed.

## 1. Executive Summary

The legacy backend is a FastAPI + SQLAlchemy + Alembic service with real product memory across portfolio input, CSV import, FCN monitoring, risk alerts, market data, news intelligence, scheduler, Telegram notification, preferences, and membership. It is valuable, but it should not be migrated wholesale.

The highest-value reusable areas are:

- CSV import preview / validation / audit flow.
- FCN monitoring logic: underlyings parsing, Worst-of, KI / KO distance, and schedule generation.
- Risk alert taxonomy and deterministic risk scoring concepts.
- Portfolio-aware news relevance / impact / priority logic.
- Scheduler and notification architecture.
- Tests as behavioral specifications.

The highest-risk areas are:

- Legacy JWT auth and localStorage-token assumptions.
- Direct browser-to-FastAPI protected calls.
- Real market data providers before App provider governance is ready.
- Claude / LLM summarizer hooks before AI provider governance is approved.
- Telegram push wording and delivery before consent, settings, and notification policy exist.
- Legacy HTML templates and mixed Next artifacts inside the backend repo.

Recommendation: migrate concepts by contract into the current App centers, not code by copy. The backend should be treated as a product-memory library and implementation reference.

## 2. Legacy Backend Structure

Top-level structure observed:

```text
backend/ixai_agent
├─ app/
│  ├─ api/v1/endpoints/
│  ├─ core/
│  ├─ models/
│  ├─ scheduler/
│  └─ services/
├─ migrations/
├─ scripts/
├─ templates/
├─ tests/
├─ alembic.ini
├─ ixai.db
├─ README.md
└─ requirements.txt
```

Framework and infrastructure:

- Backend framework: FastAPI.
- ORM: SQLAlchemy.
- Migration system: Alembic.
- Local development database: SQLite file `ixai.db`.
- Migration direction: PostgreSQL-compatible through Alembic.
- Scheduler: `app/scheduler/intelligence_runner.py` plus scripts such as `scripts/run_daily_summary_scheduler.py` and `scripts/run_risk_check.py`.
- Notification: Telegram services in `app/services/telegram_service.py`, `app/services/telegram_push_service.py`, and daily summary service.
- API prefix: `app/main.py` includes `api_router` under `/api/v1`.

Important caution:

The backend repo also contains legacy templates and unrelated Next/static artifacts. Those are not the current production App and should not be copied into `app/ixai-web-app`.

## 3. API Route Inventory

Observed API route families:

- Auth: `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/me`.
- Accounts: account listing, creation, portfolio creation, account intelligence summary.
- Portfolio input: stock, crypto, cash, FCN create/read/update/delete endpoints.
- FCN schedule: `/api/v1/portfolio/fcn/{fcn_id}/schedule`.
- Imports: CSV upload, preview, history, and import detail.
- Dashboard: portfolio summary, alerts, asset allocation, risk overview, Telegram test, development summaries.
- Market: price lookup, stock price, FCN underlying price, crypto price, refresh prices.
- Intelligence: portfolio news, priority, portfolio intelligence, timeline, reasoning, scenarios, graph, engine summary, market engine, copilot explain.
- Membership / entitlements / admin entitlements.
- Preferences.
- Integrations: Supabase account link.
- Assets: symbol resolve and search.

## 4. Reusable Module Inventory

| Legacy Module | Legacy Path | What It Does | Current IXAI App Equivalent | Migration Value | Migration Difficulty | Recommended Destination | Recommendation |
|---|---|---|---|---|---|---|---|
| Portfolio input endpoints | `app/api/v1/endpoints/portfolio_input.py` | Stock, crypto, cash, and FCN input endpoints, including FCN distance helpers and user portfolio fallback. | `/my-ixai/input`, `/my-ixai/portfolio/assets`, TS repository layer. | High | Medium | `/my-ixai/input` | Reuse field contracts and edge cases. Rewrite in App-native TS / Supabase flow. |
| CSV import preview / audit | `app/api/v1/endpoints/imports.py`, `app/services/importers/*`, `ImportBatch`, `ImportRow` | CSV upload, preview, normalization, import history, audit rows. | v1.90 CSV Foundation placeholder, v1.92 data model. | Very High | Medium | `/my-ixai/input`, backend API | Best v3.06 candidate. Port schema and validation concepts first; do not copy storage/auth flow. |
| Portfolio summary | `app/services/portfolio_service.py`, `dashboard.py` | Computes portfolio summary, allocation, alerts, FCN summary, and live price enrichment. | v1.96 dashboard, v2.04 valuation, v2.05 exposure. | Medium | Medium | `/my-ixai/portfolio` | Use as comparison spec. Avoid duplicating existing TS engines. |
| FCN monitoring | `app/services/fcn_monitor_service.py` | Parses underlyings, computes worst performer, KI / KO distance, risk level, warnings, price source. | v1.82-v2.10 FCN foundations. | Very High | Medium-High | `/my-ixai/fcn` | Strong v3.08 candidate. Port deterministic parsing and risk-state logic into App-native FCN Center. |
| FCN schedule | `app/services/fcn_schedule_service.py`, `FCNCouponSchedule` | Builds observation / coupon schedule dates, business-day offsets, replace schedule. | FCN Center placeholder, future coupon calendar. | High | Medium | `/my-ixai/fcn` | Port pure date helpers and schedule model after FCN Center IA is ready. |
| Risk alerts | `app/services/risk/*`, `app/services/alert_service.py`, `risk_engine_v3.py` | Risk scoring, allocation explanation, position analysis, alert generation, snapshots. | v2.01-v2.10 deterministic risk engines. | High | Medium | `/my-ixai/risk` | Use taxonomy, alert levels, and snapshot concepts. Rewrite compliance copy. |
| Portfolio-aware news | `app/services/news/*` | Builds news context from stocks, crypto, FCN underlyings, relevance, impact, priority, summaries. | v1.97-v1.99 mock news/commentary. | Very High | High | `/my-ixai/intelligence` | Migrate rule-based relevance / impact first. Delay real providers and LLM summarizer. |
| Intelligence engines | `app/services/intelligence/*`, `app/services/intelligence/engines/*` | Market regime, macro/news risk, FCN systemic risk, risk propagation, drift, graph, timeline, copilot. | v2.00-v2.10 mock engine foundations; v3 Intelligence Center planned. | High | High | `/my-ixai/intelligence` | Treat as a future engine library. Migrate after centers split and test contracts exist. |
| Market data providers | `app/services/market_data/*` | Provider abstraction, cache, Binance, Yahoo, manual fallback, stale state. | v2.03 mock market data provider. | High future | High | backend API | Do not migrate now. Use provider interface and stale-data semantics as future reference. |
| Scheduler | `app/scheduler/intelligence_runner.py`, `scripts/run_daily_summary_scheduler.py` | Batch portfolio intelligence runs, run logs, skip-news option, error statuses. | No current App scheduler. | High future | Medium-High | scheduler | v3.10 review candidate. Requires observability, consent, and durable job policy. |
| Notifications | `app/services/telegram_push_service.py`, `daily_summary_service.py` | Telegram risk push and daily risk summary. | No App notification center yet. | Medium future | High | notification service | Do not migrate until Settings / notification consent exists. Rewrite "AI 建議" wording. |
| Preferences / localization | `app/api/v1/endpoints/preferences.py`, `app/core/i18n.py`, `UserPreference` | User preferences, locale resolution, localization tests. | `/my-ixai/settings` placeholder; global language direction. | Medium | Medium | `/my-ixai/settings` | Port concepts after Settings Center foundation. |
| Accounts / membership | `app/services/accounts/*`, `membership_service.py`, entitlement endpoints. | Account/membership/entitlement in legacy backend. | Supabase auth + v1.86 membership foundation. | Low now | High | do not migrate | Do not mix legacy JWT/account model with current Supabase identity. |
| Tests | `tests/*.py` | Behavioral coverage for dashboard, cache, intelligence, scheduler, i18n, membership, risk, portfolio scoped API, persistence. | Current App TS/Playwright validation. | High | Medium | App test plan | Reuse as behavior specs, not as direct test files. |
| Legacy templates | `templates/*.html`, mixed `app/layout.tsx`, `.next` artifacts. | Old HTML dashboard/input pages and stale frontend artifacts. | Current Next App Router UI. | Low | High | do not migrate | Do not migrate. Replace with App-native Workspace screens. |

## 5. Special Review Areas

### Asset Input

Legacy backend has working input logic for:

- Stock positions.
- Crypto positions.
- Cash positions.
- FCN positions.
- CSV import for stock / crypto / cash.

It does not appear to provide production-ready Grid / Dual input as first-class persisted models, though crypto subtype routing and dual/grid concepts appear in risk logic.

Reusable for `/my-ixai/input`:

- CSV column contract and validation shape.
- Import preview / update / skip semantics.
- Asset resolver / normalization concepts.
- Stock / crypto / cash field names and validation constraints.

Do not reuse:

- Legacy HTML templates.
- Direct localStorage token flow.
- Direct legacy FastAPI auth assumptions.

### FCN Monitoring

Legacy FCN monitoring has strong migration value:

- FCN underlyings parsing from strings, JSON-like structures, and multiple legacy fields.
- Worst-of identification.
- Distance to KI / KO calculation.
- Risk-level classification.
- Price source / stale warnings.
- Observation and coupon schedule generation.

Recommended destination:

`/my-ixai/fcn`

Recommended migration style:

Port the logic into pure TypeScript helpers and App-native repository data. Do not bind the FCN Center to legacy SQLAlchemy models.

### Risk Alerts

Legacy risk modules include:

- Portfolio risk scoring.
- Position-level risk analysis.
- Allocation explanations.
- Alert generation.
- Snapshot save / comparison.
- Telegram push gating.

Recommended destination:

`/my-ixai/risk`

Migration caution:

Some text uses stronger action-oriented phrasing than the App should use. Any migrated alert wording must remain monitoring / risk-awareness only.

### Market Intelligence

Legacy market intelligence includes:

- Portfolio-aware news.
- News relevance / impact / priority.
- Rule-based summarizer.
- Optional LLM summarizer.
- Market regime / macro / FCN systemic risk engines.
- Timeline, graph, reasoning, and copilot endpoints.

Recommended destination:

`/my-ixai/intelligence`

Migration order:

1. Rule-based relevance / impact / priority.
2. Portfolio news feed contracts.
3. Intelligence timeline / graph readback.
4. LLM provider integration only after AI governance and cost/quality controls exist.

### Scheduler / Notifications

Legacy backend has real scheduler and Telegram delivery patterns. These should not be moved before the current App has:

- User notification preferences.
- Delivery channel consent.
- Rate limits.
- Push audit logs.
- Error visibility.
- Admin pause / resume controls.

Recommended destination:

`scheduler` and future notification service.

## 6. Compare With Current App

Current App already has:

- Workspace routes: `/my-ixai/home`, `/my-ixai/input`, `/my-ixai/portfolio`, `/my-ixai/risk`, `/my-ixai/fcn`, `/my-ixai/intelligence`, `/my-ixai/settings`.
- Asset Input Center and child input routes.
- Asset Management Center.
- Portfolio repository and Supabase persistence foundations.
- Deterministic mock foundations for news, commentary, intelligence, risk, recommendation, market data, valuation, exposure, concentration, correlation, scenario, stress test, and FCN risk.

Legacy backend should therefore fill production gaps, not restart foundations.

Best fit:

- Legacy CSV import -> App Asset Input.
- Legacy FCN monitor/schedule -> App FCN Center.
- Legacy risk alert taxonomy -> App Risk Center.
- Legacy news relevance / impact -> App Intelligence Center.
- Legacy scheduler / Telegram -> future notification and scheduler review.

## 7. Migration Priority Ranking

| Priority | Candidate | Why | Target Version |
|---|---|---|---|
| 1 | CSV import preview / validation / audit | Closest to current Asset Input gap; high user value; no external API required. | v3.06 |
| 2 | Risk alert taxonomy | Converts existing risk engines into user-readable alert states. | v3.07 |
| 3 | FCN monitor + schedule | Strong product wedge; clear Legacy Pro value; supports FCN Center. | v3.08 |
| 4 | Portfolio-aware news relevance / impact | Enables Intelligence Center to become holding-aware. | v3.09 |
| 5 | Scheduler / notification review | Needed for daily workflows but requires consent and operations policy. | v3.10 |
| 6 | Real market data provider concepts | Useful but high risk; should wait for provider governance. | v3.13+ |

## 8. Quick Wins

- Port CSV template columns and preview validation into App-native TypeScript.
- Add import-history data model planning before writing any upload logic.
- Port FCN schedule pure date helpers as unit-tested TS utilities.
- Port FCN underlyings parser as a pure helper.
- Port news relevance / impact scoring as deterministic functions.
- Convert legacy tests into App-side acceptance criteria.

## 9. High-Risk Migrations

- Legacy JWT auth and account linking.
- Supabase account-link endpoint without a fresh identity review.
- Real Yahoo / Binance market data providers.
- LLM summarizer provider.
- Telegram push delivery.
- Direct SQLAlchemy model migration into current Supabase schema.
- Legacy templates and browser localStorage token assumptions.
- Any alert copy that sounds like personalized investment instruction.

## 10. What Should NOT Be Migrated

Do not migrate:

- `templates/*.html` legacy UI.
- The old AppShell / direct FastAPI browser workflow.
- localStorage-token auth.
- Legacy JWT account model as the App identity source.
- `.next` artifacts or mixed legacy frontend artifacts inside the backend repo.
- Direct production use of Binance / Yahoo providers without provider governance.
- Telegram delivery before notification consent and Settings are ready.
- LLM summarizer hooks before AI provider governance is approved.

## 11. Recommended v3.06 / v3.07 / v3.08 Roadmap

### v3.06 — Asset Input Completion

- Use legacy CSV parser / preview / audit concepts.
- Build App-native CSV import foundation for Asset Input.
- Keep no broker sync, no real market data, no external AI.
- Prefer preview-only / validation-first before persistence write.

### v3.07 — Risk Alerts Migration

- Migrate alert taxonomy and deterministic status logic from legacy risk modules.
- Surface alerts in Risk Center.
- Keep copy compliance-safe and monitoring-oriented.

### v3.08 — FCN Center Migration

- Migrate FCN monitor and schedule concepts.
- Add FCN Center readback for underlyings, Worst-of, KI / KO distance, observation dates, and coupon schedule foundations.
- Keep market data mock/manual until provider governance is approved.

### v3.09 — Intelligence Center Migration

- Migrate portfolio-aware news relevance / impact / priority concepts.
- Use rule-based summary first.
- Keep external News API and LLM providers disabled until governance is ready.

### v3.10 — Scheduler / Notification Review

- Review scheduler, run logs, Telegram delivery, daily summary, and notification policy.
- Do not enable push channels without user preferences, consent, audit logs, and rate limits.

## 12. Suggested Migration Order

```text
v3.06 Asset Input Completion
→ v3.07 Risk Alerts Migration
→ v3.08 FCN Center Migration
→ v3.09 Intelligence Center Migration
→ v3.10 Scheduler / Notification Review
```

## 13. Readiness Estimates

| Area | Readiness | Notes |
|---|---:|---|
| Product concept reuse | 75% | Legacy backend contains many working concepts. |
| Direct code reuse | 25% | Most code should be rewritten for App-native TS, Supabase, and Workspace IA. |
| Asset Input migration | 65% | CSV/import concepts are clear; persistence target needs App-native implementation. |
| FCN migration | 70% | Monitoring logic is strong; App data shape alignment remains needed. |
| Risk alert migration | 60% | Taxonomy is useful; wording and center placement need care. |
| Intelligence migration | 45% | Valuable but broad; external providers and LLM hooks increase risk. |
| Scheduler / notification migration | 30% | Needs consent, Settings, observability, and delivery policy. |
| Multi-broker migration | 20% | Legacy has integration hints but not App-ready broker architecture. |

## 14. Final Recommendation

Proceed to `v3.06 Asset Input Completion` using the legacy CSV import and asset normalization modules as reference. Do not copy legacy backend code directly. The first migration should be small, testable, and App-native:

```text
Legacy CSV contract
→ App Asset Input preview
→ validation result
→ no broker sync
→ no real market data
→ no external AI
```

Keep the legacy backend available as a reference library for later Risk Center, FCN Center, Intelligence Center, and Scheduler work.

## 15. Validation

Required validation for this audit:

- `git diff --check`

No build is required because this task is docs-only and no product code should change.
