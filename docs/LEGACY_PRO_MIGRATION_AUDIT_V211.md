# v2.11 Legacy Pro Migration Audit and Product Inventory

Date: 2026-06-11

Scope: docs-first product architecture audit before the v3.00 UX / IA refactor.

No product code, API, auth, schema, migration, broker integration, market data provider, AI provider, or production behavior was changed for this audit.

## 1. Executive Summary

IXAI has a strong App-native Portfolio Core foundation, but the product is now carrying two histories at once:

- The active production App in `app/ixai-web-app` owns Portfolio, FCN, risk, intelligence, membership, and public brief surfaces.
- Legacy Pro in `frontend/ixai-website-clean` still contains useful workflow concepts for market news, preferences, terminal-style panels, FCN monitoring, dashboard focus, multi-language structure, and Pro workspace IA.

The main v3.00 task is not to add another engine. It is to reorganize the App into clear centers so users and future agents can understand where each capability belongs.

Recommended v3.00 centers:

```text
Home
Portfolio Center
Risk Center
FCN Center
Intelligence Center
Settings
```

Current readiness estimates:

| Area | Status |
| --- | ---: |
| Legacy Pro migration status | 45% |
| Active App migration status | 72% |
| Global market readiness | 58% |
| Multi-language readiness | 35% |
| Multi-broker readiness | 28% |

## 2. Review Boundaries

Reviewed active App areas:

- Public Daily / Weekly Intelligence routes and admin editorial surfaces.
- Watchlist, onboarding, distribution, membership, and account surfaces.
- Portfolio Center, Asset Input Hub, Asset Management Center, Repository, Persistence, Ownership Validation, and Portfolio Core engines.
- FCN Wizard, FCN server helpers, FCN risk helpers, and portfolio FCN-risk foundation.
- Pro, Risk, and App dashboard readback surfaces.

Reviewed Legacy Pro areas:

- `frontend/ixai-website-clean/app/dashboard`
- `frontend/ixai-website-clean/app/portfolio`
- `frontend/ixai-website-clean/app/fcn`
- `frontend/ixai-website-clean/app/market`
- `frontend/ixai-website-clean/app/intelligence`
- `frontend/ixai-website-clean/app/alerts`
- `frontend/ixai-website-clean/app/input`
- `frontend/ixai-website-clean/app/import`
- `frontend/ixai-website-clean/app/accounts`
- `frontend/ixai-website-clean/app/settings`
- Legacy components including PortfolioEnginePanel, MarketEnginePanel, ScenarioSensitivityPanel, MemoryNarrativePanel, CopilotQuestionPanel, DashboardTodayFocus, RiskPill, StatusBadge, SummaryCard, and AppShell.
- Legacy utilities for preferences, i18n/locales, workspace context, API clients, and SSO session markers.

## 3. Product Inventory Matrix

| Feature | Current Location | Migration Status | Future Center |
| --- | --- | --- | --- |
| Morning Brief / Daily Intelligence | Active App `daily-brief`, admin daily studio, intelligence libs | Migrated foundation, still needs UX center | Intelligence Center |
| Weekly Intelligence | Active App `weekly-brief`, admin weekly flow | Migrated foundation, needs readback IA cleanup | Intelligence Center |
| Social Pack | Active App admin studio | Migrated as distribution asset, not core engine | Intelligence Center / Publish tools |
| Watchlists | Active App watchlist plus Legacy Pro concepts | Partial | Intelligence Center and Settings |
| Market News | Active App mock Portfolio News Provider plus Legacy Pro Market page | Partial | Intelligence Center |
| AI Commentary | Active App mock Portfolio Commentary plus Legacy Pro memory panels | Partial | Intelligence Center |
| Recommendation Logic | Active App deterministic Recommendation Engine | Migrated as monitoring prompts only | Risk Center / Intelligence Center |
| User Preferences | Active App distribution preferences and account basics; Legacy Pro richer preferences | Partial | Settings |
| Portfolio Assets | Active App `/my-ixai/portfolio/assets` | Migrated foundation | Portfolio Center |
| Portfolio Input | Active App `/portfolio` and `/my-ixai/input` | Migrated foundation | Portfolio Center |
| Portfolio Repository | Active App `src/lib/portfolio/repository` | Migrated foundation | Portfolio Center |
| Portfolio Persistence | Active App Supabase repository read/create | Partial | Portfolio Center |
| Market Data | Active App deterministic mock provider | Foundation only | Portfolio Center / Provider layer |
| Valuation | Active App deterministic valuation engine | Foundation only | Portfolio Center |
| Exposure | Active App deterministic exposure engine | Foundation only | Portfolio Center / Risk Center |
| Concentration | Active App deterministic concentration engine | Foundation only | Risk Center |
| Correlation | Active App deterministic correlation engine | Foundation only | Risk Center |
| Scenario | Active App deterministic scenario engine | Foundation only | Risk Center |
| Stress Test | Active App deterministic stress-test engine | Foundation only | Risk Center |
| FCN Position Management | Active App FCN Wizard and FCN server helpers | Partial | FCN Center |
| FCN Worst-of | Active App FCN worst-of and portfolio FCN-risk foundations | Partial | FCN Center |
| KI Monitoring | Active App has early risk-score helpers; full monitoring missing | Partial | FCN Center |
| KO Monitoring | Not production-ready | Not migrated | FCN Center |
| Observation Calendar | Not production-ready | Not migrated | FCN Center |
| Coupon Calendar | Not production-ready | Not migrated | FCN Center |
| FCN Risk Engine | Active App deterministic portfolio FCN-risk foundation | Foundation only | FCN Center / Risk Center |
| Broker Adapters | Legacy Pro and roadmap concepts only | Not migrated | Settings / Provider Center |
| CSV Import | Active App input foundation and Legacy Pro import concept | Partial | Portfolio Center |
| Multi-language shell | Legacy Pro locale files; active App mostly zh-TW text | Partial | Settings / Platform |
| Pro Workspace | Active App Pro surfaces plus Legacy Pro dashboard concepts | Partial | Home / Intelligence / Risk / FCN |

## 4. Legacy Pro Audit

### Existing Implementation

Legacy Pro contains a dashboard-oriented workspace with routes for dashboard, portfolio, FCN, market, intelligence, alerts, input, import, accounts, and settings. It has a reusable panel vocabulary: summary cards, risk pills, portfolio engine panel, market engine panel, scenario sensitivity panel, memory narrative panel, copilot question panel, and daily focus panels.

It also contains useful product primitives:

- Preferences for locale, default landing page, compact mode, terminal mode, advanced intelligence, alert mode, email, Telegram, and risk interpretation mode.
- Multi-language locale files for English, Traditional Chinese, Simplified Chinese, Japanese, and Korean.
- Market news and priority surfaces that connect portfolio context to headline relevance.
- FCN-focused panels for worst-of pressure, KI clusters, repeated underlyings, and schedule displays.
- Import and account concepts that point toward CSV and broker workflows.

### Current Migration Status

Migrated or partially migrated into the active App:

- Portfolio and FCN data persistence.
- Asset model, repository, persistence, and ownership validation foundations.
- Portfolio dashboard, valuation, exposure, concentration, correlation, scenario, stress test, FCN risk, recommendation, news, commentary, and intelligence foundations.
- Daily / Weekly public intelligence and admin editorial workflows.
- Membership and entitlement foundation.
- Watchlist and onboarding memory basics.

Not migrated or incomplete:

- Rich Settings and preferences.
- Legacy Pro market news workflow and dashboard relevance model.
- Copilot-style question panels.
- Alert center taxonomy and delivery workflow.
- Import UI and CSV/broker mapping.
- Multi-language runtime architecture.
- Legacy Pro FCN schedule and monitoring depth.
- Workspace shell IA that separates dashboard, market, intelligence, portfolio, alerts, accounts, and settings.

### Recommended Destination Inside App

- Market news, AI commentary, Morning Brief, Weekly Intelligence, and watchlist relevance should move into Intelligence Center.
- FCN positions, worst-of, KI / KO, observation calendar, coupon calendar, and FCN exposure should move into FCN Center.
- Concentration, correlation, scenario, stress test, recommendation prompts, and risk alerts should move into Risk Center.
- Portfolio accounts, assets, positions, valuation, allocation, exposure, and import should stay in Portfolio Center.
- User preferences, language, broker connections, notifications, membership, and account identity should move into Settings.

## 5. Portfolio System Audit

### Foundation Completed

The active App has completed foundations for:

- Asset Input Hub.
- Portfolio Asset CRUD UI foundation.
- Account / Asset / Position data model.
- Repository abstraction.
- Supabase persistence read/create foundation.
- Ownership validation readback.
- Repository-driven dashboard.
- Intelligence Universe.
- Mock News Provider.
- Mock AI Commentary.
- Mock Intelligence Engine.
- Mock Risk Engine.
- Mock Recommendation Engine.
- Mock Market Data.
- Mock Valuation.
- Mock Exposure.
- Mock Concentration.
- Mock Correlation.
- Mock Scenario.
- Mock Stress Test.
- Mock Portfolio FCN Risk.

### Missing Production Components

- Full persistent update/delete for assets and positions.
- Real CSV import parsing and validation.
- Broker adapter architecture with credential security.
- Real market data providers.
- Provider health, cache, and stale-data semantics for portfolio prices.
- Unified error states for repository, provider, market data, valuation, and dashboard surfaces.
- Separation of Portfolio Center from risk/intelligence/FCN-heavy readback modules.

### Missing Data Providers

- Real equities market data.
- Real crypto market data.
- Real FCN underlying pricing.
- Real broker/custody portfolio source.
- Real news provider.
- Real AI commentary provider.

## 6. FCN Platform Audit

### Completed

- FCN Wizard can create FCN records and attach them to Portfolio records.
- FCN underlyings exist in the data model.
- Worst-of MVP exists for stored underlyings where price inputs are available.
- Early KI distance and risk helpers exist.
- Portfolio FCN Risk Engine Foundation exists as deterministic mock readback.
- FCN exposure can be represented inside Portfolio Exposure and FCN Risk foundations.

### Missing

- Full KI monitoring with current price source and threshold semantics.
- Full KO monitoring.
- Observation calendar.
- Coupon calendar.
- Issuer/product metadata workflow.
- Global FCN terms normalization.
- Structured-product-specific scenario and stress semantics.
- FCN center UI that separates structured product monitoring from generic portfolio dashboard readback.

### Future Roadmap

FCN Center should support:

- US-linked FCN.
- Taiwan-linked FCN.
- Hong Kong-linked FCN.
- China A-share-linked FCN.
- Japan-linked FCN.
- Korea-linked FCN.
- Europe-linked FCN.
- Singapore-linked FCN.
- Crypto-linked FCN.
- Future structured products.

## 7. Global Market Readiness

| Market | Readiness | Notes |
| --- | --- | --- |
| US Equities | Partially Ready | Symbol examples and mock providers exist, but no real provider or exchange calendar. |
| Taiwan Equities | Partially Ready | Region enums and product origin exist, but ticker normalization and local market data are not production-ready. |
| Hong Kong Equities | Partially Ready | Region direction exists, no provider contract specifics. |
| China A Shares | Partially Ready | Region direction exists, no exchange or ticker normalization. |
| Japan Equities | Partially Ready | Region and language direction exist, no provider integration. |
| Korea Equities | Partially Ready | Region and language direction exist, no provider integration. |
| Europe | Partially Ready | Region direction exists, no multi-exchange handling. |
| Singapore | Partially Ready | Strategic direction exists, but enums and provider flows need review. |
| Crypto | Partially Ready | Asset categories and mock market data exist, no exchange integration or wallet/custody model. |

Overall global market readiness: 58%.

## 8. Multi-Language Readiness

| Language | Readiness | Notes |
| --- | --- | --- |
| zh-TW | Ready for current UX copy | Active App mainly uses Traditional Chinese. |
| zh-CN | Partially Ready | Legacy Pro has locale precedent; App does not have full i18n runtime. |
| en-US | Partially Ready | Legacy Pro has locale precedent; App docs and code names are English, UI is not localized. |
| ja-JP | Not Ready | Legacy Pro locale precedent only. |
| ko-KR | Not Ready | Legacy Pro locale precedent only. |

Missing localization contracts:

- Centralized UI label dictionary.
- Engine-output localization contract.
- Compliance-copy localization contract.
- Region/currency/provider label localization.
- Date, number, currency, and exchange calendar formatting rules.

Overall multi-language readiness: 35%.

## 9. Multi-Broker Readiness

| Broker / Provider | Readiness | Notes |
| --- | --- | --- |
| Binance | Partially Ready | Crypto provider concept exists, no adapter or credential model. |
| Futu | Not Ready | Future broker target only. |
| Cathay Securities | Not Ready | Strategic Taiwan broker target only. |
| Interactive Brokers | Partially Ready | Provider enum direction exists, no adapter. |
| Future broker adapters | Not Ready | Need common adapter contract, consent, vault, audit log, refresh, and revocation. |

Required architecture:

- Broker adapter interface.
- User consent and connection status model.
- Credential storage strategy that does not expose tokens to client code.
- Read-only portfolio sync mode before any trading function is considered.
- Provider-specific data normalization into Portfolio Account, Asset, and Position.
- Sync audit logs and stale-data warnings.
- Failure states for expired credentials, rate limits, and partial imports.

Overall multi-broker readiness: 28%.

## 10. v3.00 Recommended IA Structure

### Home

Purpose: user landing after login, daily focus, portfolio health headline, urgent risk alerts, and next action.

Preserve:

- Overview cards.
- Daily focus.
- Navigation to major centers.

### Portfolio Center

Purpose: accounts, assets, positions, valuation, allocation, exposure, import, and portfolio source management.

Keep:

- Portfolio overview.
- Asset counts and positions.
- Valuation and allocation.
- Asset input and asset management.
- Repository and ownership status.

Move out:

- News feed.
- AI commentary.
- Recommendation engine.
- Correlation, scenario, stress test.
- FCN-specific risk panels.

### Risk Center

Purpose: portfolio risk, concentration, correlation, scenario, stress test, alerts, and monitoring prompts.

Owns:

- Portfolio Risk Engine.
- Recommendation Engine monitoring prompts.
- Concentration.
- Correlation.
- Scenario.
- Stress Test.
- Global risk summary.

### FCN Center

Purpose: structured-product monitoring and education.

Owns:

- FCN positions.
- Underlyings.
- Worst-of.
- KI / KO.
- Observation calendar.
- Coupon calendar.
- FCN Risk Engine.
- Global FCN support.

### Intelligence Center

Purpose: public and personal intelligence workflows.

Owns:

- Daily Intelligence.
- Weekly Intelligence.
- Market news.
- Watchlist intelligence.
- Portfolio news feed.
- AI commentary.
- Social Pack as a distribution asset.
- Future Legacy Pro intelligence migration.

### Settings

Purpose: account, membership, notifications, language, preferences, broker connections, data privacy, and audit.

Owns:

- Membership status.
- Entitlements.
- Notification and delivery preferences.
- Language and region preferences.
- Broker connection management.
- Data import settings.

## 11. Recommended v3.10 Development Priorities

After v3.00 IA refactor, prioritize:

1. v3.10 Intelligence Center Migration: move Daily / Weekly / Watchlist / News / Commentary into one coherent center.
2. v3.11 FCN Center Phase 1: separate FCN positions, underlyings, worst-of, KI, and FCN risk readback from generic Portfolio Center.
3. v3.12 Settings and Preferences Foundation: migrate Legacy Pro preference concepts into App-native account settings.
4. v3.13 Real Market Data Provider Foundation: replace mock portfolio market snapshots behind the existing provider contract.
5. v3.14 Broker Adapter Security Foundation: define read-only broker sync, consent, credentials, audit logs, and revocation.
6. v3.15 Legacy Pro Decommission Plan: list which Legacy Pro screens are retired, copied conceptually, or replaced by App centers.

## 12. Risks and Open Questions

- Portfolio Center is too long and mixes portfolio, risk, FCN, news, commentary, architecture, and provider status.
- Many portfolio engines are deterministic mock foundations, not production intelligence.
- Legacy Pro has useful workflow ideas but unsafe patterns for direct migration, especially legacy JWT, localStorage token auth, and browser-to-FastAPI protected calls.
- Multi-language support needs architecture, not copy-by-copy translation.
- Multi-broker support needs security architecture before UI expansion.
- FCN global support requires product-term normalization before real risk scoring.
- Real market data and broker data must include stale-data, source, and provider-health semantics.

## 13. No-Code-Change Confirmation

This audit is documentation and architecture review only. It does not change:

- Product runtime behavior.
- APIs.
- Auth.
- Supabase schema.
- Migrations.
- UI components.
- Broker integrations.
- Market data providers.
- AI providers.
- Trading or recommendation logic.
