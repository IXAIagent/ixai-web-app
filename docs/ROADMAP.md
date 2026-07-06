# IXAI Roadmap

This document is the high-level product continuity layer for IXAI. It should help future AI agents understand what comes next without re-litigating the whole product direction.

## Current Version

`V16 Product Strategy`

## Current Strategic Direction

IXAI's long-term product direction has two complementary product lines:

```text
Product A — AI Financial Media
Product B — AI Investment Monitoring
```

Product A helps everyone understand what matters in today's market through Daily Brief and Weekly Brief.

Product B helps every investor understand what matters to their own investments through Workspace.

Core sentence:

```text
讓 AI 全天候監控你的投資，而不是你全天候盯著市場。
AI watches your investments, so you don't have to.
```

IXAI should not drift into being only a brokerage app, generic news platform, finance dashboard, robo-advisor, generic chatbot, trading system, or signal-selling product. The highest-level sources of truth are `docs/IXAI_PRODUCT_VISION.md` and `docs/V16_PRODUCT_STRATEGY.md`.

## Current Priority

Current priority is V16A Sprint 2 Daily Brief 2.0 Foundation after Sprint 1 Editorial Architecture Foundation merged.

V15.2 found that Daily / Weekly Brief public output had not advanced normally after 2026-06-29. V15.2.1 restores the publish pipeline control layer by making Admin Daily / Weekly health derive from persisted rows, surfacing stale published state, surfacing draft/publish gaps, and making Daily publish durable-aware. Scheduler still creates draft/review material only; manual publish remains required. Social Pack remains downstream optional.

Source of truth:

- `docs/V152_BRIEF_RELIABILITY_RECOVERY.md`
- `docs/V152_ADMIN_BRIEF_PIPELINE_AUDIT.md`
- `docs/V1521_BRIEF_PUBLISH_RELIABILITY_HOTFIX.md`

V15.2.1 source-level verification confirms the hotfix is present: Admin Daily / Weekly health derives from persisted rows, draft/publish gaps are visible, Daily publish is durable-aware, Weekly publish health is visible, scheduler remains draft/review only, and Social Pack remains downstream optional. Production should still verify the latest public Daily / Weekly readback after deploy.

V15 Product Experience Redesign and V15.1 Product Polish established the AI Wealth Workspace user experience. V16 now separates the public media habit layer from the personal monitoring layer.

V16A AI Financial Media is the first implementation priority because Daily / Weekly creates trust, habit, and brand before users create a Workspace.

V16B AI Investment Monitoring remains engine-centric, not page-centric. Every new user-facing monitoring item must answer:

```text
這件事為什麼跟我的投資有關？
Why does this matter to my investments?
```

V16 source of truth:

- `docs/IXAI_PRODUCT_PHILOSOPHY.md`
- `docs/V16_PRODUCT_STRATEGY.md`
- `docs/V16_AI_MONITORING_PLATFORM.md`
- `docs/V16_NOTIFICATION_ARCHITECTURE.md`
- `docs/V16_DATA_ARCHITECTURE.md`
- `docs/V16_EDITORIAL_ARCHITECTURE.md`
- `docs/IXAI_PRODUCT_VISION.md`

V16 is currently in Architecture Planning Phase.

Strategic notes before V16 Architecture Phase:

- Always-On AI Monitoring: AI works continuously in the background and should prepare results before the user opens Workspace.
- Public Brief = AI Curated Financial Media: Daily / Weekly should explain what truly matters in the market, not become a generic news list.
- Workspace = AI Investment Monitoring: Workspace should explain what affects the user's own investments.
- Telegram-first notification strategy: Telegram is the first external monitoring channel before App Push.
- SaaS delayed until product-market signal / wow moment: billing should wait until daily usage, monitoring retention, and FCN value are proven.
- Provider independence: news, market prices, events, earnings, crypto data, notification channels, and AI providers must go through IXAI abstractions.
- Failure degradation: provider failure must degrade intelligence, not crash the product.

Architecture Phase must happen before implementation sprints:

- Product Philosophy.
- Product Strategy.
- Editorial Architecture.
- System Architecture.
- Data Architecture.
- Notification Architecture.

Required architecture files before V16A / V16B implementation:

- `docs/V16_NOTIFICATION_ARCHITECTURE.md`.
- `docs/V16_DATA_ARCHITECTURE.md`.
- `docs/V16_EDITORIAL_ARCHITECTURE.md`.

These files must be completed and reviewed before V16 coding begins.

V16 notification / integration audit must happen before notification implementation:

- Telegram.
- LINE.
- Email.
- In-App.
- Browser Push.
- iOS Push.
- Android Push.
- Yahoo Finance.
- Binance.
- Supabase.
- Vercel Cron.
- News / RSS / market sources.

V16A — AI Financial Media roadmap:

- Sprint 1 — Editorial Architecture:
  - Editorial data model.
  - Story model.
  - Topic model.
  - Narrative model.
- Sprint 2 — Daily Brief 2.0:
  - Today Focus.
  - Market Pulse.
  - AI Market View.
  - Opportunity Radar.
- Sprint 3 — Weekly Brief 2.0:
  - Weekly Review.
  - Weekly Themes.
  - Next Week Radar.
- Sprint 4 — Content Quality Engine:
  - Narrative diversity.
  - Anti-repetition.
  - Editorial memory.
  - Dynamic prompts.

V16B — AI Investment Monitoring roadmap:

- Sprint 1 — Asset Intelligence Foundation.
- Sprint 2 — News Relevance Engine.
- Sprint 3 — Event Intelligence Engine.
- Sprint 4 — FCN Intelligence Engine.
- Sprint 5 — Portfolio Intelligence.
- Sprint 6 — Today Focus.
- Sprint 7 — AI Monitoring Feed.
- Sprint 8 — Copilot AI Analyst.
- Sprint 9 — Memory Engine.

First implementation recommendation:

```text
V16A Sprint 1 — Editorial Architecture
```

Status: implemented as `V16A Sprint 1 — Editorial Architecture Foundation`.

Scope defines editorial domain contracts, source normalization, story ranking, topic ranking, narrative model, fallback/degradation behavior, and editorial diagnostics for Daily / Weekly. It does not add Workspace monitoring implementation, external provider dependency, AI model calls, scheduler delivery, trading, recommendation, or billing.

Source of truth:

- `docs/V16A_SPRINT_1_EDITORIAL_ARCHITECTURE_FOUNDATION.md`

V16A Sprint 2 — Daily Brief 2.0 Foundation:

- Status: implemented.
- Adds the first deterministic Daily Brief 2.0 pipeline.
- Pipeline: Mock / Existing Editorial Source -> Normalize Story -> Story Ranking -> Topic Ranking -> Daily Brief Builder -> Daily Brief 2.0 Snapshot -> Public / Admin Preview Integration.
- Adds read-only preview integration to `/daily-brief` and `/admin/daily-briefs`.
- Does not add external provider fetch, AI model call, scheduler auto-publish, notification delivery, DB schema, trading, recommendation, billing, or V16B Workspace Monitoring.
- Source of truth: `docs/V16A_SPRINT_2_DAILY_BRIEF_2_FOUNDATION.md`.

V15 current sequence:

- Completed: Sprint 2.1 Home Redesign.
- Completed: Sprint 2.1a Dashboard Polish.
- Completed: Wave 1 Portfolio Experience for Home, Portfolio, FCN, and Risk.
- Completed: Wave 2 AI / Information Experience for Intelligence, Copilot, Watchlist, Notifications, and Timeline.
- Completed: Wave 3 Platform Experience & Navigation Polish for Workspace navigation, Settings, Health, Beta, Advanced diagnostics, mobile navigation, and platform consistency.
- Completed: V15.0.1 Production Renderer Hung Hotfix.
  - Collapsed Workspace diagnostics no longer mount heavy children until opened.
  - This addresses the high-confidence renderer-hang risk introduced by V15 diagnostics demotion.
  - See `docs/V1501_PRODUCTION_RENDERER_HUNG_HOTFIX.md`.
- Completed: V15.0.2 Copilot Safe Shell Hotfix.
  - Copilot no longer auto-runs `getWorkspaceCopilotSummary()` or `getWorkspaceGraph()` on initial mount.
  - Full Copilot summary generation is manual-only.
  - See `docs/V1502_RENDERER_HUNG_INVESTIGATION.md` and `docs/V1502_COPILOT_SAFE_SHELL_HOTFIX.md`.
- Active: V15.0.3 Information Architecture Refinement.
  - Home no longer embeds the full Workspace Morning Brief card.
  - Home now shows a lightweight Morning Brief Summary Card with a CTA to `/my-ixai/morning-brief`.
  - `/my-ixai/morning-brief` is the full daily Workspace report surface.
  - Desktop sidebar main navigation scrolls independently while Settings / exit actions remain fixed at the bottom.
  - See `docs/V1503_INFORMATION_ARCHITECTURE_REFINEMENT.md`.
- Active: V15.1 Product Polish Program.
  - Copywriting moves from engineering language to user language.
  - Morning Brief 2.0 keeps Home summary-only and `/my-ixai/morning-brief` as the full report.
  - Portfolio and Notifications gain clearer first-screen hierarchy and actionable empty states.
  - Shared product components now include `WorkspaceEmptyState` and dictionary-backed polish copy.
  - See `docs/V151_PRODUCT_POLISH_PROGRAM.md`.
- Next: Sprint 4 Design Polish.

Next major version:

- `V16 Product Strategy`.
- V16 should be driven by `docs/V16_PRODUCT_STRATEGY.md` and `docs/IXAI_PRODUCT_VISION.md`.
- Priority 1: V16A AI Financial Media.
- Priority 2: V16B AI Investment Monitoring.

V15 does not add:

- API.
- Database.
- AI model behavior.
- Risk Engine.
- FCN Engine.
- Scheduler.
- Trading.
- Recommendation.

V15 only refactors:

- UX.
- IA.
- Navigation.
- Dashboard.
- Design System.
- Copywriting.
- Component hierarchy.
- Diagnostics demotion.
- Shared page hierarchy across Home, Portfolio, FCN, Risk, Intelligence, Copilot, Watchlist, Notifications, and Timeline.
- Explain-only AI / information surfaces without new AI provider, recommendation, trading, or delivery behavior.
- Platform navigation IA with Health, Beta, and Diagnostics under Settings -> Advanced / About.
- Mobile bottom navigation limited to five primary destinations.

Use these V15 source documents before future Workspace UI work:

- `docs/V15_PRODUCT_EXPERIENCE_CONTEXT.md`.
- `docs/V15_UX_AUDIT.md`.
- `docs/V15_SPRINT_1_IA_NAVIGATION_REDESIGN_PLAN.md`.
- `docs/V15_DESIGN_SYSTEM_2.md`.
- `docs/V15_SPRINT_2_UI_IMPLEMENTATION_SPEC.md`.

IXAI has completed the Portfolio Foundation, FCN Foundation, FCN Worst-of Engine, FCN Risk Engine MVP, first Portfolio Intelligence Dashboard MVP, Membership / Entitlement Foundation, Multi-Asset Portfolio Foundation, Portfolio Center UI, Architecture Visualization, Portfolio Input Foundation, mock CRUD, Data Model, Repository, Persistence, Ownership Validation, Repository-driven Dashboard, News Intelligence, mock News Provider, mock AI Commentary, mock Intelligence Engine, mock Risk Engine, mock Recommendation Engine, mock Market Data, mock Valuation, mock Exposure, mock Concentration, mock Correlation, mock Scenario Engine, mock Stress Test Engine, mock Portfolio FCN Risk Engine, Global Market Foundation Review, and v2.11 Legacy Pro Migration Audit / Product Inventory.

Current priority is V13.8 Full Workspace Localization Completion. IXAI has completed V12 production runtime stabilization, V12.3.1 optional personalization fallback, V13.0 Internationalization Foundation, V13 Sprint 1 Internationalization Foundation, V13 Sprint 2 Region / Currency / Localization, V13 Sprint 3 Translation Coverage Repair, V13 Sprint 4 Authenticated Workspace Translation Audit, Translation Maintenance Batch 1, Translation Maintenance Batch 2, Translation Maintenance Batch 3 blocked-status documentation, V13.5 Full Translation Coverage Program, V13.6 authenticated production audit tooling, V13.7 Real Translation Coverage Completion Program, V14.0 program planning, V14 Sprint 1 Live Market Workspace, V14 Sprint 2 Workspace Intelligence + Morning Brief, V14 Sprint 3 Beta Readiness & Production Polish, and V14 Beta Release Review. V13.8 fixes the V13.7 audit blind spot by using DOM visible text block evidence, then repairs authenticated Workspace main-content localization for Morning Brief, Health, Risk, FCN schedule, Intelligence, source status badges, and non-English locale overrides without changing product behavior. See `docs/V138_FULL_WORKSPACE_LOCALIZATION_COMPLETION.md`, `docs/V137_REAL_TRANSLATION_COVERAGE.md`, `docs/V135_FULL_TRANSLATION_COVERAGE.md`, `docs/V123_TRANSLATION_MAINTENANCE_BATCH3.md`, `docs/TRANSLATION_VISUAL_QA_BATCH_2.md`, `docs/TRANSLATION_MAINTENANCE_BATCH_1.md`, `docs/V13_SPRINT_4_AUTHENTICATED_WORKSPACE_TRANSLATION_AUDIT.md`, `docs/V13_SPRINT_3_TRANSLATION_COVERAGE_REPAIR.md`, `docs/V13_SPRINT_2_REGION_CURRENCY_LOCALIZATION.md`, `docs/V13_SPRINT_1_INTERNATIONALIZATION_FOUNDATION.md`, `docs/V1300_INTERNATIONALIZATION_FOUNDATION.md`, and `docs/V14_BETA_RELEASE_REVIEW.md`.

V13 infrastructure foundation is complete after Sprint 2, but product translation coverage requires visual QA on production pages, not only source scans. Sprint 3 was the first coverage repair pass; Sprint 4 repaired Portfolio authenticated readback first; Batch 1 started the maintenance track for deeper Workspace pages; Batch 2 confirmed that authenticated production visual QA needs a signed-in browser session; Batch 3 remained blocked for the same reason. V13.5 repaired high-exposure translation coverage in dictionaries and authenticated Workspace display labels. V13.6 added the signed-in production audit tool. V13.7 added DOM translation coverage scoring but over-filtered several visible English product terms. V13.8 tightens the audit method and repairs remaining high-impact authenticated Workspace main-content gaps. Remaining work should be driven by the V13.8 production report after deployment. Recommended next options are signed-in production Workspace coverage verification after deploy, targeted long-tail input/public editorial cleanup, V14 Beta Production Verification / Invite-only Pilot, or V15 AI Wealth OS planning. V15 remains unchanged by translation maintenance.

Runtime Stabilization Program Status:

Completed:

- Program A — Root Provider Stabilization.
  - Root auth runtime promises stabilized.
  - PR #75 merged.
  - Commit: `9c73915`.
- Program B — Workspace Runtime Hydration Safety.
  - Workspace client refresh promises and mounted effects are contained.
  - Settings diagnostics and Workspace browser-storage parse failures degrade safely.
- Program E — Service Worker Fetch Safety.
  - Service worker fetch failures now degrade through safe responses.
  - Navigation, static asset/chunk, excluded GET, and cache write failures no longer reject `respondWith`.
- Program C — Market / Morning Brief Runtime Stabilization.
  - Market quote, live valuation, and Morning Brief failures degrade safely.
- Program D — Admin / Scheduler Runtime Stabilization.
  - Admin diagnostics and scheduler readiness failures degrade safely.

Important:

- Program A, Program B, Program C, Program D, and Program E implementation work has merged.
- PR #79 and PR #80 did not resolve the Settings / Copilot production HUNG; PR #82 appears to have resolved it in manual production verification.
- Local production-like QA is insufficient as completion evidence.
- V12 production runtime stabilization has passed production manual verification.
- V13.0 is i18n foundation only, not a full translation program.
- Public users can change language without registration; Workspace Settings manages the same locale state.
- Locale state uses localStorage + cookie only; no Supabase preference sync is enabled.
- V14 is the active main track, beginning with docs-only Live Workspace Program planning.
- V14 Sprint 1 implements V14.1-V14.3 as monitoring/risk-awareness functionality only.
- V14 Sprint 2 implements V14.4 Workspace Intelligence and V14.5 Workspace Morning Brief as rule-based and explain-only Workspace-readable summaries.
- V14 Sprint 3 implements V14.6 Beta readiness polish and has merged through PR #89.
- V14 Beta Release Review records that the V14 feature mainline is functionally ready after review, but invite-only Beta still requires production verification checklist completion.
- V13 Sprint 1 resumes the i18n mainline after V14 Beta Release Review.
- V13 Sprint 2 completes Region / Currency / Localization foundations.
- V13 Sprint 3 repairs visible translation coverage for primary Public / Workspace surfaces.
- V13 Sprint 4 audits signed-in Workspace translation coverage and repairs the Portfolio authenticated readback surfaces first.
- Translation Maintenance Batch 1 scans all major authenticated Workspace routes and repairs easy dictionary wiring while leaving deep Risk / FCN / Intelligence translation work pending.
- Translation Maintenance Batch 2 makes translation maintenance Visual QA driven, documents that the available production browser session was not authenticated, fixes first-pass FCN display labels and one FCN icon contrast issue, and records `ja-JP` as metadata-supported but not full content coverage.
- V12 Translation Maintenance Program Batch 3 attempts authenticated Workspace visual QA, but remains blocked because the production browser session is not signed in. It does not claim Workspace QA completion.
- V13.5 Full Translation Coverage Program expands locale packs and repairs high-exposure Settings, Risk, and Intelligence UI labels without changing runtime logic or product behavior.
- V13.7 Real Translation Coverage Completion Program adds DOM coverage reporting and repairs major Workspace content translation surfaces while preserving auth, API, Supabase, engine, market provider, broker/trading, billing, scheduler, and AI boundaries.
- V13.8 Full Workspace Localization Completion fixes the V13.7 audit method, adds visible text block evidence, and repairs Morning Brief, Health, Risk, FCN schedule, Intelligence, and source status UI display mapping across `zh-TW`, `zh-CN`, `en-US`, `ja-JP`, and `ko-KR` without changing product/runtime behavior.
- V13 completion criteria now include signed-in Workspace manual verification, not only infrastructure completion.
- Next recommended options: sign in to production Workspace and rerun Batch 3, V14 Beta Production Verification / Invite-only Pilot, V15 AI Wealth OS planning, or deeper dictionary migration as maintenance for remaining long-tail surfaces.
- V15 remains unchanged.
- Do not implement Live Market, broker/trading/recommendation, scheduler/notification delivery, billing, or AI model behavior outside an approved V14 phase.

- Use `docs/LEGACY_PRO_MIGRATION_AUDIT_V211.md` as the canonical inventory for Legacy Pro migration, App module ownership, and v3.00 IA boundaries.
- Use `docs/V300_UX_IA_FOUNDATION_PLAN.md` as the route and navigation foundation for v3.00.
- Use `docs/V301_NAVIGATION_SEPARATION_FOUNDATION.md` as the navigation separation rule for public website versus Workspace application surfaces.
- Use `docs/V302_WORKSPACE_ENTRY_MIGRATION.md` as the source of truth for Login / Register / Account entry flow.
- Use `docs/V303_IXAI_PLATFORM_PAGE.md` as the source of truth for `/pro` public platform positioning.
- Use `docs/V304_ASSET_INPUT_CENTER.md` as the source of truth for Workspace asset onboarding and FCN Wizard ownership.
- Use `docs/V305_PORTFOLIO_WORKSPACE_FOUNDATION.md` as the source of truth for Portfolio Workspace foundation and `/pro` CTA contrast.
- Use `docs/LEGACY_BACKEND_INVENTORY_AUDIT_V305A.md` as the source of truth for reusable legacy backend modules and migration sequencing.
- Use `docs/V306_ASSET_INPUT_COMPLETION.md` as the source of truth for Stock, Crypto, FCN, Review Summary, and Recent Inputs behavior.
- Use `docs/V308_FCN_CENTER_DATA_WIRING.md` as the source of truth for the first local FCN Input → FCN Draft Store → FCN Center data flow.
- Use `docs/V309_APP_CURRENT_STATE_AUDIT.md` and `docs/V309_FCN_POSITION_FOUNDATION.md` as the source of truth for the active-app FCN loop.
- Use `docs/V310_FCN_RISK_FOUNDATION.md` as the source of truth for FCN Center KI-distance risk readback from persisted FCN positions.
- Use `docs/V320_FCN_INTELLIGENCE_CENTER.md` as the source of truth for the integrated FCN lifecycle, manual price, timeline, Risk v2, and concentration workspace.
- Use `docs/V330_GLOBAL_RISK_CENTER_FOUNDATION.md` as the source of truth for the first `/my-ixai/risk` Global Risk Center foundation.
- Use `docs/V340_INTELLIGENCE_CENTER_V1.md` as the source of truth for the first usable `/my-ixai/intelligence` workspace.
- Use `docs/V400_INTELLIGENCE_MARKET_INTEGRATION_PROGRAM.md` as the source of truth for the v4.00 integration program across Market, Portfolio, FCN, Risk, and Intelligence.
- Use `docs/V401_PORTFOLIO_TRUTH_LAYER.md` as the source of truth for the first shared FCN / Stock / Crypto / Portfolio Dashboard readback layer across Portfolio, Risk, and Intelligence.
- Use `docs/V402_PORTFOLIO_INTELLIGENCE_UI.md` as the source of truth for Portfolio Center visualization of the shared Truth Layer.
- Use `docs/V403_RISK_INTELLIGENCE_LAYER.md` as the source of truth for Risk Center consumption of Truth Layer concentration, top exposure, FCN worst-of, and data quality readback.
- Use `docs/V404_INTELLIGENCE_READBACK_LAYER.md` as the source of truth for Intelligence Center consumption of Portfolio Truth and Risk Intelligence summaries.
- Use `docs/V405_MARKET_ABSTRACTION_LAYER.md` as the source of truth for market provider contracts, snapshots, news shapes, registry, and deterministic mock provider.
- Use `docs/V406_MARKET_READINESS_UI.md` as the source of truth for Intelligence Center market provider registry readiness UI.
- Use `docs/V407_PROVIDER_HEALTH_FRAMEWORK.md` as the source of truth for market provider status, freshness, priority, health summary, and fallback policy contracts.
- Use `docs/V408_MARKET_SERVICE_LAYER.md` as the source of truth for unified market service entrypoints and Intelligence Center service-status readback.
- Use `docs/V409_WORKSPACE_MARKET_INTEGRATION.md` as the source of truth for read-only market readiness, provider health, and fallback policy awareness across Portfolio, Risk, and Intelligence Centers.
- Use `docs/V410_WORKSPACE_FULL_SCAN_REPORT.md` as the post-v4.09 workspace scan before the next implementation sprint. It records route status, navigation status, data wiring gaps, stale version copy, placeholder areas, and the recommended v4.10 / v4.11 / v4.12 sequence.
- Use `docs/V410_INPUT_TRUTH_WORKSPACE_UNIFICATION.md` as the source of truth for the v4.10 browser-local pending input bridge, active Portfolio Market Status wiring, FCN pending readback, Workspace Home / Settings copy cleanup, and mobile Settings navigation cleanup.
- Use `docs/V420_MARKET_DATA_FOUNDATION.md` as the source of truth for the v4.20 Yahoo Finance / Binance public quote adapters, unified quote result contract, Market Service facade, and Workspace Market Status quote readback.
- Use `docs/V430_PORTFOLIO_VALUATION_ENGINE.md` as the source of truth for the v4.30 Portfolio Valuation Engine, estimated market value, cost basis, unrealized P/L, asset-class allocation, FCN notional placeholder limitation, and valuation compliance boundary.
- Use `docs/V440_RISK_ENGINE_V1.md` as the source of truth for the v4.40 Portfolio Risk Engine v1, valuation-derived risk score, risk levels, concentration signals, market-data quality warnings, crypto exposure warnings, and FCN placeholder awareness.
- Use `docs/V450_FCN_RISK_ENGINE_V1.md` as the source of truth for the v4.50 FCN Risk Engine v1, worst-of underlying, KI distance, strike distance, KO readiness, FCN risk levels, and FCN risk source-status boundaries.
- Use `docs/V460_FCN_COUPON_SCHEDULE_ENGINE.md` as the source of truth for the v4.60 FCN Coupon & Schedule Engine, coupon events, observation events, KO observation events, maturity awareness, monthly expected coupon cashflow, and schedule urgency rules.
- Use `docs/V470_SERVER_SIDE_MARKET_CACHE_LAYER.md` as the source of truth for the v4.70 memory-only market cache layer, cache TTL rules, stale fallback behavior, cache diagnostics, and Market Service cache-first routing.
- Use `docs/V475_WORKSPACE_FULL_INTEGRATION_REVIEW.md` as the source of truth for the v4.75 static/service-level Workspace integration audit, data lineage diagnostics, Settings diagnostics surface, and no-network audit boundary.
- Use `docs/V480_INTELLIGENCE_ENGINE_V1.md` as the source of truth for the v4.80 deterministic Workspace Intelligence Engine, structured Intelligence Cards, source-engine attribution, severity rules, and no-AI/no-recommendation boundary.
- Use `docs/V500_PORTFOLIO_PERSISTENCE_LAYER.md` as the source of truth for the v5.00 canonical Portfolio Persistence abstraction, persisted/local/fallback source statuses, Portfolio Center persistence summary, and no-schema/no-migration boundary.
- Use `docs/V5_WORKSPACE_EXPANSION_PROGRAM.md` as the source of truth for the V5 Watchlist Engine, Alert Engine, Workspace Daily Brief Engine, Workspace Dashboard v2, and no-delivery/no-AI/no-trading boundary.
- Use `docs/V5_WORKSPACE_FOUNDATION_PROGRAM.md` as the source of truth for the V5.10–V5.50 Workspace Graph, Notification Center, Workspace Health, Timeline, and API Gateway service-layer foundation.
- Use `docs/V6_PLATFORMIZATION_PROGRAM.md` as the source of truth for the V6 platformization bundle across Workspace API Routes, persistence foundations, Insights, delivery readiness, and explain-only Copilot.
- Use `docs/V610_WORKSPACE_API_ROUTES.md` as the source of truth for read-only server-safe Workspace API routes.
- Use `docs/V620_WATCHLIST_PERSISTENCE_FOUNDATION.md`, `docs/V630_ALERT_PERSISTENCE_FOUNDATION.md`, and `docs/V640_DAILY_BRIEF_HISTORY_FOUNDATION.md` as the source of truth for V6 persistence foundations without runtime schema dependency.
- Use `docs/V650_WORKSPACE_INSIGHTS_FOUNDATION.md`, `docs/V660_NOTIFICATION_DELIVERY_FOUNDATION.md`, and `docs/V670_WORKSPACE_COPILOT_FOUNDATION.md` as the source of truth for rule-based insights, delivery readiness, and no-AI explain-only Copilot.
- Use `docs/V7_DATA_PERSISTENCE_PROGRAM.md` as the source of truth for the V7 persistence foundation bundle across Portfolio, Ownership, Sync, FCN, Watchlist, and Alerts.
- Use `docs/V7_PERSISTENCE_SCHEMA_DRAFT.md` as a draft-only schema note. No migrations are applied automatically.
- Use `docs/V710_PORTFOLIO_PERSISTENCE_FOUNDATION.md`, `docs/V720_WORKSPACE_OWNERSHIP_FOUNDATION.md`, `docs/V730_WORKSPACE_SYNC_FOUNDATION.md`, `docs/V740_FCN_PERSISTENCE_FOUNDATION.md`, `docs/V750_WATCHLIST_PERSISTENCE_FOUNDATION.md`, and `docs/V760_ALERT_PERSISTENCE_FOUNDATION.md` as the V7 module-level source of truth.
- Use `docs/V8_DATABASE_ACTIVATION_PROGRAM.md` as the source of truth for V8 database activation readiness.
- Use `docs/V8_DATABASE_SCHEMA_ACTIVATION_DRAFT.md` as the V8 schema activation draft. It is not applied automatically.
- Use `docs/V810_PORTFOLIO_PERSISTENCE_ACTIVATION.md`, `docs/V820_FCN_PERSISTENCE_ACTIVATION.md`, `docs/V830_WATCHLIST_PERSISTENCE_ACTIVATION.md`, `docs/V840_ALERT_HISTORY_ACTIVATION.md`, `docs/V850_WORKSPACE_OWNERSHIP_ACTIVATION.md`, `docs/V860_WORKSPACE_SYNC_ACTIVATION.md`, and `docs/V870_DATABASE_ACTIVATION_DIAGNOSTICS.md` as the V8 module-level source of truth.
- Use `docs/V9_REAL_PERSISTENCE_PROGRAM.md` as the source of truth for V9 guarded live persistence.
- Use `docs/V910_PORTFOLIO_LIVE_PERSISTENCE.md`, `docs/V920_FCN_LIVE_PERSISTENCE.md`, `docs/V930_WATCHLIST_LIVE_PERSISTENCE.md`, `docs/V940_ALERT_HISTORY_LIVE_PERSISTENCE.md`, `docs/V950_WORKSPACE_OWNERSHIP_ENFORCEMENT.md`, `docs/V960_WORKSPACE_SYNC_ENGINE.md`, and `docs/V970_MIGRATION_HEALTH_CHECK.md` as the V9 module-level source of truth.
- Use `docs/V9_DATABASE_MIGRATION_HEALTH_CHECK.md` as the V9 migration health companion note.
- Use `docs/V1010_DATABASE_READ_PRIORITY.md` as the source of truth for V10.10 database-first read priority across Portfolio, FCN, Watchlist, and Alert History.
- Use `docs/V10_PLATFORM_CUTOVER_PROGRAM.md` as the source of truth for the V10.20-V10.70 Platform Cutover Program.
- Use `docs/V1020_OWNERSHIP_ENFORCEMENT.md`, `docs/V1030_DATABASE_WRITE_CUTOVER.md`, `docs/V1040_WORKSPACE_MEMBERSHIP.md`, `docs/V1050_SYNC_RECONCILIATION.md`, `docs/V1060_MIGRATION_EXECUTION_PREP.md`, and `docs/V1070_PRODUCTION_READINESS.md` as V10 module-level source docs.
- Use `docs/V1110_DATABASE_ACTIVATION.md` as the source of truth for V11.10 Database Activation Foundation, reviewed migration files, readback validation, write readiness, and fallback preservation.
- Use `docs/V1200_WORKSPACE_DATABASE_WRITE_ACTIVATION.md` as the source of truth for V12 guarded Watchlist / Alert History writes, read-only diagnostics, and disabled Portfolio / FCN write paths.
- Use `docs/V1300_PORTFOLIO_DATABASE_WRITE_ACTIVATION.md` as the source of truth for V13 guarded Portfolio / Stock / Crypto writes, local-first input submit, database-first readback priority, and FCN write deferral to V14.
- Use `docs/V1400_FCN_DATABASE_ACTIVATION.md` as the source of truth for V14 guarded FCN writes, Draft Store / Truth Layer fallback preservation, and disabled-by-default FCN database activation.
- Use `docs/V1500_LEGACY_RISK_ENGINE_MIGRATION.md` as the source of truth for V15 read-only legacy risk concepts, Portfolio risk, FCN worst-of / KI / KO / strike distance, concentration, and exposure diagnostics.
- Use `docs/V1600_MORNING_BRIEF_ENGINE.md` as the source of truth for V16 read-only Morning Brief Engine, Portfolio/Risk/FCN adapters, News Placeholder, and Morning Snapshot.
- Use `docs/PROGRAM_A_V17_V20_PRODUCT_LAYER.md` as the source of truth for Program A.
- Use `docs/V1700_MARKET_DATA_PROVIDER_FOUNDATION.md` as the source of truth for V17 market data provider contracts and manual placeholder snapshots.
- Use `docs/V1800_MORNING_BRIEF_LIVE_DATA_READINESS.md` as the source of truth for V18 Morning Brief market-data snapshot readiness.
- Use `docs/V1900_INTELLIGENCE_CENTER_V2_FOUNDATION.md` as the source of truth for V19 deterministic Intelligence Center v2 context.
- Use `docs/V2000_SAAS_FOUNDATION_READINESS.md` as the source of truth for V20 SaaS readiness metadata.
- Use `docs/PROGRAM_B_LIVE_PLATFORM_READINESS.md` as the source of truth for Program B.
- Use `docs/V2100_MARKET_DATA_LIVE_PROVIDER_READINESS.md` as the source of truth for V21 live market provider readiness contracts.
- Use `docs/V2200_PORTFOLIO_LIVE_VALUATION_READINESS.md` as the source of truth for V22 future quote snapshot and valuation readiness.
- Use `docs/V2300_BROKER_INTEGRATION_FOUNDATION.md` as the source of truth for V23 broker interface and disabled trading/sync flags.
- Use `docs/V2400_RISK_AUTOMATION_READINESS.md` as the source of truth for V24 risk rule, trigger, alert-evaluation, and automation readiness.
- Use `docs/LIVE_PRODUCT_1_YAHOO_VALUATION_BRIEF.md` as the source of truth for the first read-only Yahoo quote provider, live quote cache, Portfolio live valuation preview, FCN live underlying status, V15 Risk live adapter, and Morning Brief live preview.
- Use `docs/V12_LIVE_PRODUCT_UPGRADE_PROGRAM.md` as the source of truth for Live Product 2 Workspace Live Market Service, Live Product 3 Morning Brief v1, dashboard polish, Watchlist / Alert live-market integration, and V12 safety boundaries.
- Use `docs/V121_RUNTIME_STABILIZATION_PROGRAM.md` and `docs/V121_RUNTIME_STABILIZATION_COMPLETION.md` as the source of truth for V12.1 runtime stabilization completion. Runtime work does not change IXAI product positioning: intelligence, workflow, and risk awareness only; no broker, trading, signal selling, robo-advice, or recommendation functionality.
- Use `docs/V1300_INTERNATIONALIZATION_FOUNDATION.md` as the source of truth for shared Public App + Workspace locale state, supported locales, Language Switcher placement, and V13.0 translation scope.
- Use `docs/V13_SPRINT_1_INTERNATIONALIZATION_FOUNDATION.md` as the source of truth for namespace dictionaries, translation packs, LocaleProvider, useTranslation, localStorage + cookie locale persistence, and initial Public / Workspace i18n wiring.
- Use `docs/V13_SPRINT_2_REGION_CURRENCY_LOCALIZATION.md` as the source of truth for region metadata, currency metadata, Intl formatting helpers, local-only `ixai.region` / `ixai.currency` preferences, and Settings / Public / Workspace localization display wiring.
- Use `docs/V13_SPRINT_3_TRANSLATION_COVERAGE_REPAIR.md` and `docs/V13_SPRINT_4_AUTHENTICATED_WORKSPACE_TRANSLATION_AUDIT.md` as the source of truth for visible translation coverage repair status. Sprint 3 was the first Public / Workspace coverage pass; Sprint 4 is the authenticated Workspace audit plus first Portfolio readback repair pass.
- Use `docs/TRANSLATION_MAINTENANCE_BATCH_1.md` as the source of truth for the first authenticated Workspace full-scan maintenance batch across Home, Portfolio, Input, Watchlist, Notifications, Timeline, Copilot, Health, Beta, Risk, FCN, Intelligence, and Settings.
- Use `docs/TRANSLATION_VISUAL_QA_BATCH_2.md` as the source of truth for production visual QA status, unauthenticated audit limitation, first-pass FCN display-label repair, icon contrast finding, and `ja-JP` content coverage status.
- Use `docs/V123_TRANSLATION_MAINTENANCE_BATCH3.md` as the source of truth for the blocked authenticated Workspace visual QA attempt and route inventory for the next signed-in Batch 3 run.
- Use `docs/V1400_LIVE_WORKSPACE_PROGRAM.md` as the source of truth for the new V14 Live Workspace mainline, phase sequence, V13 reminder, compliance boundaries, technical boundaries, and done criteria.
- Use `docs/V14_SPRINT_1_LIVE_MARKET_WORKSPACE.md` as the source of truth for the V14.1-V14.3 Sprint 1 implementation across live market data, live portfolio valuation, FCN live risk, Workspace integration, runtime safety, and compliance boundaries.
- Use `docs/V14_SPRINT_2_WORKSPACE_INTELLIGENCE_BRIEF.md` as the source of truth for the V14.4-V14.5 Sprint 2 implementation across Workspace Intelligence, Workspace Morning Brief, Timeline enhancement, Copilot explain-only summary, Home / Intelligence integration, runtime safety, and compliance boundaries.
- Use `docs/V14_SPRINT_3_BETA_READINESS_POLISH.md`, `docs/V14_BETA_RELEASE_NOTES.md`, and `docs/V14_BETA_RELEASE_REVIEW.md` as the source of truth for V14.6 Beta readiness polish, Health Center, Beta dashboard, brief share/export, feedback template, release notes, production verification gates, and invite-only Beta governance.
- v4.00 is not another page. It is the integration layer that should connect existing centers into a coherent operating workflow.
- Do not add new investment features in v3.00 through v3.05.
- Login and Register should land authenticated users in `/my-ixai/home`, not `/account` or `/pro`.
- `/account` is a legacy transitional page, not the primary Workspace entry.
- `/pro` is now the public IXAI Platform introduction and conversion page, not the primary Legacy Pro entry.
- `/my-ixai/input` is now the canonical Asset Input Center. FCN Wizard belongs to `/my-ixai/input/fcn`, not public `/fcn`.
- `/my-ixai/input/stock`, `/my-ixai/input/crypto`, and `/my-ixai/input/fcn` own the first usable asset-input flows.
- `/my-ixai/portfolio` can show local mock Recent Inputs to make the input-to-portfolio flow visible.
- `/my-ixai/portfolio` should be understandable as a Workspace homepage, not an engineering dashboard dump.
- `/my-ixai/fcn` previously used a v3.08 local FCN Draft Store readback, but v3.09 promotes `/api/fcn` / Supabase readback as the active product source.
- `/my-ixai/fcn` now reads existing Supabase-backed FCN positions from `/api/fcn`; do not reintroduce a separate permanent local draft source unless the product explicitly defines a draft-to-position lifecycle.
- `/my-ixai/fcn` now adds v3.10 risk monitoring readback using stored current price only. Missing current price remains `UNKNOWN`; do not imply live market data.
- `/my-ixai/fcn` is now the v3.20 FCN Intelligence Center. Manual price updates are local overlays only; do not claim Supabase persistence or live market data.
- `/my-ixai/risk` is now the v3.30 Global Risk Center foundation. It reuses v3.20 FCN risk readback, shows multi-asset readiness, lists upcoming FCN risk events, and reports data source status without adding live market data, broker sync, AI, or trading logic.
- `/my-ixai/intelligence` is now the v3.40 Intelligence Center v1. It connects Daily / Weekly / Market entry points, FCN highlights, portfolio-aware readiness, news readiness, commentary readiness, and compliance boundaries without adding external AI, external news, broker sync, market data providers, or trading logic.
- Legacy backend modules should be migrated by contract and rewrite, not copied wholesale.
- Highest-priority legacy backend candidates are CSV import, risk alerts, FCN monitoring / schedules, portfolio-aware news relevance, and scheduler / notification review.
- Public navigation and Workspace navigation must remain separate.
- Do not add more isolated center modules until the v4.00 truth-layer and market-integration gaps are resolved.
- v4.01 resolves the first truth-layer gap by normalizing existing `/api/fcn`, `/api/stocks`, `/api/crypto`, and `/api/portfolio/dashboard` readback without adding schema, migration, API route, market data, broker sync, AI, or trading logic.
- v4.02 makes that Truth Layer visible inside Portfolio Center through holdings summary, counts-based allocation, top symbol occurrence, data health, and missing-data warnings.
- v4.03 makes that Truth Layer useful inside Risk Center through concentration risk, top exposure aggregation, FCN worst-of summary, and data quality risk readback.
- v4.04 makes Portfolio Truth and Risk Intelligence visible inside Intelligence Center through portfolio summary, risk snapshot, exposure summary, and readiness warnings.
- v4.05 adds the Market Abstraction Layer provider contracts and mock provider foundation without connecting external APIs.
- v4.06 makes Market Abstraction Layer registry readiness visible inside Intelligence Center without calling external providers.
- v4.07 adds Provider Health Framework contracts and deterministic mock health data for future market service routing.
- v4.08 adds the Market Service Layer with unified quote, snapshot, news, provider-health, and readiness entrypoints while keeping all market data mock/provider-metadata only.
- v4.09 integrates Market Service readiness into Portfolio Center, Risk Center, and Intelligence Center as read-only market readiness, provider health, and fallback policy awareness.
- V410 scan finding: Risk Center and Intelligence Center render Workspace Market Status, but the active `/my-ixai/portfolio` route does not render the v4.09 market status because that component is attached to `PortfolioCenterDashboard`, which is not the active portfolio page. Treat Portfolio market status as a pending wiring fix.
- V410 scan finding: active Stock / Crypto / FCN input routes are still local-only or draft-oriented, while Portfolio Truth reads persisted `/api/fcn`, `/api/stocks`, `/api/crypto`, and `/api/portfolio/dashboard` data. Treat input-to-truth persistence as a product gap.
- v4.10 resolves the scan findings by wiring Workspace Market Status into the active Portfolio route and adding an Input Truth Bridge so browser-local Stock / Crypto / FCN pending inputs appear in Portfolio Truth, FCN Center, Risk, and Intelligence readback without changing API contracts or schema.
- v4.10 has been merged into main and is complete.
- v4.20 introduces the first Market Data Foundation with unified quote types, public Yahoo Finance equity quote adapter, public Binance crypto quote adapter, Market Service quote facade, and Workspace Market Status quote readback. It does not add trading, recommendations, auth changes, Supabase schema changes, migrations, broker integration, or FCN pricing.
- v4.20 has been merged into main and is complete.
- v4.30 adds the first Portfolio Valuation Engine by combining Portfolio Truth positions, pending input readback, and v4.20 market quotes into estimated market value, cost basis, unrealized P/L, and asset-class allocation. FCN valuation is notional placeholder only; v4.30 does not add trading, recommendations, auth changes, Supabase schema changes, migrations, API contract changes, broker integration, or a full FCN pricing engine.
- v4.30 has been merged into main and is complete.
- v4.40 adds the first Portfolio Risk Engine v1 by converting v4.30 valuation output into deterministic risk score, risk levels, top signals, score breakdown, concentration warnings, crypto exposure warnings, market data quality warnings, and FCN placeholder valuation awareness. v4.40 does not add trading, recommendations, auth changes, Supabase schema changes, migrations, API contract changes, broker integration, or a full FCN pricing engine.
- v4.40 has been merged into main and is complete.
- v4.50 adds the first FCN-native Risk Engine v1 by converting existing FCN positions, local FCN drafts, manual price overlays, and v4.20 market-service quotes into worst-of, KI distance, strike distance, KO readiness, FCN risk level, top risk positions, and source-status readback. v4.50 does not add trading, recommendations, auth changes, Supabase schema changes, migrations, API contract changes, broker integration, Greeks, Monte Carlo, option valuation, scenario simulation, or a full FCN pricing engine.
- v4.50 has been merged into main and is complete.
- v4.60 adds the first FCN Coupon & Schedule Engine by converting existing FCN observation schedules, common metadata schedule shapes, maturity dates, and local FCN draft schedules into coupon, observation, KO observation, maturity, next-30-day event, and monthly expected coupon cashflow readback. v4.60 does not add trading, recommendations, auth changes, Supabase schema changes, migrations, API contract changes, broker integration, tax reporting, or a full FCN pricing engine.
- v4.60 has been merged into main and is complete.
- v4.70 adds the Server-side Market Cache Layer by routing Market Service quote readback through a memory-only cache before provider refresh. Equities use a 15-minute TTL, crypto uses a 2-minute TTL, stale cache refresh failures return fallback quotes, and no quote returns unavailable. v4.70 does not add auth changes, Supabase schema changes, migrations, API contract changes, broker integrations, trading logic, investment recommendations, or an FCN pricing engine.
- v4.70 has been merged into main and is complete.
- v4.75 adds the Workspace Full Integration Review by exposing static/service-level data lineage diagnostics in Settings. It audits Truth Layer, Market Cache, Market Service, Valuation, Risk, FCN Risk, and FCN Schedule wiring without runtime network tests. v4.75 does not add auth changes, Supabase schema changes, migrations, broker integrations, trading logic, investment recommendations, or an FCN pricing engine.
- v4.75 has been merged into main and is complete.
- v4.80 adds Intelligence Engine v1 by converting existing Portfolio Truth, Market Service, Market Cache, Portfolio Valuation, Risk Engine, FCN Risk, and FCN Schedule outputs into deterministic structured Intelligence Cards inside Intelligence Center. v4.80 does not call AI models, add recommendations, broker logic, auth changes, schema changes, API contract changes, migrations, trading logic, or an FCN pricing engine.
- v4.80 has been merged into main and is complete.
- v5.00 adds the Portfolio Persistence Layer as a canonical readback abstraction across persisted API records, browser-local pending input, FCN drafts, and legacy fallback recent inputs. v5.00 does not add auth changes, Supabase schema changes, migrations, API contract changes, broker integrations, trading logic, investment recommendations, AI model calls, alert delivery, or database redesign.
- v5.00 has been merged into main and is complete.
- V5 Workspace Expansion Program adds Watchlist Engine, Alert Engine, Workspace Daily Brief Engine, and Workspace Dashboard v2 using existing Workspace systems only. V5 does not add auth changes, Supabase schema changes, migrations, broker integrations, trading logic, investment recommendations, AI model calls, order execution, public landing page redesign, or alert delivery.
- V5 Workspace Expansion Program has been merged into main and is complete.
- V5.10–V5.50 Workspace Foundation Program adds Unified Workspace Graph, local-only Notification Center, deterministic Workspace Health Engine, Timeline Engine, and read-only Workspace API Gateway service layer. It does not add auth changes, schema migrations, broker integrations, trading logic, investment recommendations, AI model calls, order execution, public landing page redesign, or notification delivery.
- V5.10–V5.50 Workspace Foundation Program has been merged into main and is complete.
- V6 Platformization Program adds read-only Workspace API routes, persistence foundations, Workspace Insights, Notification Delivery readiness, and rule-based explain-only Workspace Copilot. It does not add broker integrations, trading execution, order routing, buy/sell/hold recommendations, AI model calls, auth behavior changes, Supabase schema changes, migrations, public landing page redesign, or legacy fallback removal.
- V6 Platformization Program has been merged into main and is complete.
- V7 Data Persistence Program has been merged into main and is complete.
- V8 Database Activation Program has been merged into main and is complete.
- V9 Real Persistence Program has been merged into main and is complete.
- V10 Database Cutover Program is active. V10.10 starts database-first read priority while preserving Truth Layer and local/draft fallbacks.
- V10.20-V10.70 add platform cutover readiness for ownership enforcement, guarded database write cutover, workspace membership, sync reconciliation, migration execution preparation, and production readiness diagnostics. V10 does not apply remote migrations, change auth behavior, change RLS, change schema, remove fallbacks, add broker integration, add trading logic, or add AI recommendation logic.
- V10 Database Cutover Program has been merged into main and is complete.
- V11 Database Activation Program is active. V11.10 prepares reviewed migration files, local/dev seed notes, database activation diagnostics, readback validation, and write activation readiness. V11.10 does not execute remote migrations, remove Truth Layer or local fallback, force database-only behavior, change auth redirects/onboarding, connect Binance/Yahoo, add broker sync, add trading logic, or add AI recommendations.
- Establish Home, Portfolio Center, Risk Center, FCN Center, Intelligence Center, and Settings as the user-facing workspace architecture.
- Preserve the rule that Legacy Pro is reference-only. Migrate selected concepts, not the whole legacy frontend or legacy auth shell.
- Keep Social Pack as a distribution asset, not the core product engine.

Operational validation priorities remain:

- Validate Portfolio Intelligence Universe output with authenticated repository data.
- Validate Portfolio News Feed output with repository-driven symbols and the mock provider.
- Validate Portfolio AI Commentary output from the existing News Feed and mock commentary provider.
- Validate Portfolio Intelligence Engine scoring from repository assets, news feed, and commentary.
- Validate Portfolio Risk Engine output from repository accounts, assets, positions, and deterministic risk rules.
- Validate Portfolio Recommendation Engine prompts from deterministic risk reports while preserving strict compliance language.
- Validate Portfolio Market Data snapshots from repository-driven Intelligence Universe symbols and deterministic mock provider.
- Validate Portfolio Valuation output from repository assets, positions, and mock market snapshots.
- Validate Portfolio Allocation metrics by asset type, provider, and region.
- Validate Portfolio Exposure output by asset type, symbol, FCN underlying, crypto, region, and provider.
- Validate Portfolio Concentration output by top symbol, FCN underlying, asset type, provider, and region.
- Validate Portfolio Correlation output by high / medium / low pair counts and deterministic top correlation pairs.
- Validate Portfolio Scenario output by technology selloff, crypto correction, FCN underlying stress, regional shock, and concentration shock.
- Validate Portfolio Stress Test output by global equity shock, crypto crash, FCN worst-of shock, high correlation shock, concentration breakdown, and regional crisis.
- Validate Portfolio FCN Risk output by FCN count, exposure, repeated underlyings, concentration, correlation, stress-test sensitivity, and global market readiness.
- Execute v3.00 Platform IA Refactor before adding more Portfolio Center dashboard modules.
- Split Portfolio Center complexity into Portfolio Center, Risk Center, Intelligence Center, FCN Center, and Settings.
- Preserve global market readiness across asset types, region enums, provider enums, market data interfaces, news interfaces, language interfaces, and localization surfaces.
- Validate the Repository-driven Portfolio Dashboard with authenticated User A / User B.
- Validate Supabase-backed Create / Read asset persistence with authenticated User A / User B.
- Validate the Portfolio Account → Asset → Position model under real dashboard readback.
- Keep Stock / Crypto / Grid / Dual / Cash expansion behind a clear data-entry and validation plan.
- Keep CRUD persistence behind explicit Supabase API and RLS validation.
- Plan CSV Import MVP after data model migration validation.
- Billing Foundation only after membership and Portfolio Center UX are stable.

Do not restart v1.82-v1.83 Social Pack hotfix work unless production Social Pack export regresses again and the incident-prevention rules in `docs/PROJECT_RULES.md` are followed.

## Future Version Plan

### v2.11 — Legacy Pro Migration Audit and Product Inventory

- Docs-first audit of Legacy Pro, AI Morning Brief, FCN Monitoring, Intelligence modules, Portfolio modules, and existing App functionality.
- Product inventory matrix across feature, current location, migration status, and future center.
- Migration status estimates:
  - Legacy Pro migration: 45%.
  - Active App migration: 72%.
  - Global market readiness: 58%.
  - Multi-language readiness: 35%.
  - Multi-broker readiness: 28%.
- Confirms v3.00 centers:
  - Home.
  - Portfolio Center.
  - Risk Center.
  - FCN Center.
  - Intelligence Center.
  - Settings.
- No product code, API, schema, migration, auth, broker, market data, or AI provider changes.

### v3.00 — UX / IA Refactor

- Route and navigation foundation only.
- Preserve existing public content routes.
- Add placeholders for `/my-ixai/home`, `/my-ixai/risk`, `/my-ixai/fcn`, `/my-ixai/intelligence`, and `/my-ixai/settings`.
- Keep `/portfolio` as input / creation and `/my-ixai/portfolio` as Portfolio Center.
- No new investment features, providers, broker integrations, recommendation logic, schema, migrations, API routes, auth changes, or membership changes.

### v3.01 — Navigation Separation Foundation

- Separate Public Website Navigation from Workspace Application Navigation.
- Public navigation keeps market homepage, Daily Brief, Market, Weekly, FCN, IXAI Pro, About, and Login.
- Workspace navigation keeps Workspace Home, Portfolio Center, Risk Center, FCN Center, Intelligence Center, Settings, and `返回官網`.
- Do not change auth, membership, entitlement, route URLs, public content, engine logic, API contracts, schema, migrations, or providers.

### v3.02 — Workspace Entry Migration

- Redirect successful Login / Register flows to `/my-ixai/home`.
- Convert `/account` into a legacy transitional page with primary CTA to Workspace Home.
- Remove `/account` as the primary IXAI Pro / Legacy Pro entry.
- Keep auth provider, membership, entitlement, engines, API contracts, schema, migrations, market data, and broker logic unchanged.

### v3.03 — IXAI Platform Page

- Reposition `/pro` as the public IXAI Platform introduction and conversion page.
- Explain IXAI as an AI investment risk platform for Portfolio, Risk, FCN, and Intelligence workflows.
- Document future pricing direction without fixed pricing.
- Keep membership, entitlement, auth, schema, migrations, broker, market data, AI provider, and trading logic unchanged.

### v3.04 — Asset Input Center

- Make `/my-ixai/input` the canonical Workspace asset onboarding surface.
- Add Workspace input routes for Stock / ETF, Crypto, and FCN.
- Move FCN Wizard ownership from public `/fcn` to `/my-ixai/input/fcn`.
- Keep public `/fcn` as education, Worst-of, KI / KO, case study, FAQ, and Workspace CTA.
- Add Asset Input to Workspace navigation and Workspace Home shortcuts.
- Keep schema, migrations, API, auth, membership, broker, market data, recommendation logic, and trading logic unchanged.

### v3.05 — Portfolio Workspace Foundation + CTA Fix

- Turn `/my-ixai/portfolio` into a user-readable Portfolio Workspace homepage.
- Add Portfolio Overview, Holdings Summary, Risk Snapshot, and Quick Actions sections.
- Keep data mock/placeholder only; do not connect real risk engines or new APIs.
- Fix `/pro` CTA contrast so hero and pricing buttons are visible.
- Keep schema, migrations, API, auth, membership, entitlements, broker, market data, AI, recommendation, and trading logic unchanged.

### v3.05a — Legacy Backend Inventory Audit

- Audit `/backend/ixai_agent` as a FastAPI / SQLAlchemy / Alembic legacy backend reference.
- Identify reusable modules for Asset Input, FCN Monitoring, Risk Alerts, Market Intelligence, Scheduler, Notifications, Position Lifecycle, database models, tests, services, and API routes.
- Record that legacy backend concepts should migrate into App-native centers by contract and rewrite, not by wholesale code copy.
- Establish the recommended migration order:
  - v3.06 Asset Input Completion.
  - v3.07 Risk Alerts Migration.
  - v3.08 FCN Center Migration.
  - v3.09 FCN Position Foundation.
  - v3.10 FCN Risk Foundation.
- Historical note: the separate v3.11-v3.14 FCN follow-up plan was folded into
  v3.20 FCN Intelligence Center. Post-v3.20 work now points toward v3.30
  Global Risk Center, v3.31 Intelligence Center Migration, and v3.32 Settings
  and Preferences Foundation.
- No product code, schema, migration, API, auth, UI, broker, market data, external AI, or production behavior changes.

### v3.06 — Asset Input Completion

- Upgrade `/my-ixai/input/stock` from placeholder to usable Stock / ETF input form.
- Upgrade `/my-ixai/input/crypto` from placeholder to usable Crypto input form.
- Extend `/my-ixai/input/fcn` with FCN Basic, Barrier, Observation, Observation Dates, Underlyings, and Review Summary.
- Add a shared Input Review pattern for Stock, Crypto, and FCN.
- Add local mock Recent Inputs to `/my-ixai/portfolio`.
- Keep local mock state only for Stock / Crypto and preserve existing FCN submit behavior.
- Do not add Supabase persistence, API routes, broker integration, market data, AI provider, Telegram, scheduler, or trading logic.

### v3.08 — FCN Center Data Wiring

- Connect `/my-ixai/input/fcn` to `/my-ixai/fcn` through a local FCN Draft Store.
- Display FCN draft count, notional, underlyings, observation dates, coupon dates, and detail panel in FCN Center.
- v3.08a fixes draft persistence so FCN Wizard writes to the same localStorage-backed key that FCN Center reads.
- Keep this as a local/mock bridge only; v3.09 supersedes it with Supabase-backed FCN Position readback.

### v3.09 — FCN Position Foundation

- Replace `/my-ixai/fcn` placeholder with a real FCN Center readback.
- Use existing `/my-ixai/input/fcn` → `/api/fcn` → Supabase `fcn_positions` / `fcn_underlyings` data path.
- Display FCN count, notional, position cards, issuer, strike, KI, KO, underlyings, observation schedule, coupon dates, created date, and empty / unauthenticated states.
- Do not add schema, migration, market data, broker sync, AI provider, recommendation logic, trading logic, Daily / Weekly, Social Pack, public `/fcn`, legacy frontend, or FastAPI backend changes.

### v3.10 — FCN Risk Foundation

- Add the first `/my-ixai/fcn` risk-monitoring layer on top of persisted FCN positions.
- Display high-risk count, watch count, unknown-data count, underlying concentration, worst underlying, worst KI distance, and per-position risk status.
- Calculate KI distance as `(current_price - ki_price) / ki_price * 100` using stored current price only.
- Keep missing current price as `UNKNOWN`; do not add or imply live market data.
- Do not add schema, migration, API route, broker sync, market data provider, AI provider, recommendation logic, trading logic, Daily / Weekly, Social Pack, public `/fcn`, or auth / membership changes.

### v3.20 — FCN Intelligence Center

- Fold the separate v3.11 / v3.12 / v3.13 / v3.14 FCN follow-up plan into one integrated FCN upgrade.
- Upgrade `/my-ixai/fcn` into a practical FCN management and risk workspace.
- Add lifecycle readback and filters, manual local price overlay, timeline / event center, Risk Engine v2 scoring, and richer underlying concentration.
- Preserve v3.09 `/api/fcn` / Supabase readback and v3.10 risk summary behavior.
- Keep manual price updates local until a dedicated persistence path is approved.
- Do not add schema, migration, external market data, broker sync, AI provider, recommendation logic, trading logic, public `/fcn`, Daily / Weekly, Social Pack, auth, or membership changes.

### v3.30 — Global Risk Center Foundation

- Replace the `/my-ixai/risk` placeholder with the first working Global Risk Center.
- Reuse v3.20 FCN Intelligence Center calculations for FCN risk summary and upcoming FCN events.
- Add Stock / Crypto / Grid / Dual readiness cards without building full risk engines.
- Add Data Source Status for FCN API, Stock API, Crypto API, Manual Price Overlay, and Live Market Data.
- Add a deterministic `Foundation Score` weighted by FCN RED / YELLOW / UNKNOWN readback.
- Keep monitoring / risk-awareness language; do not introduce trading instructions, personalized recommendations, live market data, broker sync, AI providers, or schema changes.

### v3.31 — Intelligence Center Migration

- Consolidate Daily Intelligence, Weekly Intelligence, watchlists, market news, AI commentary, and Social Pack distribution into one Intelligence Center.
- Use Legacy Pro market/news/workspace ideas as reference only.
- Do not reintroduce legacy JWT, localStorage token auth, or direct browser-to-FastAPI protected calls.

### v3.40 — Intelligence Center v1

- Replace the `/my-ixai/intelligence` placeholder with the first usable Intelligence Center.
- Add Daily Brief, Weekly Intelligence, and Market Overview entry points.
- Add portfolio-aware highlights from existing FCN / Stock / Crypto / Portfolio Dashboard readiness.
- Reuse v3.20 FCN Intelligence Center helpers for FCN highlights and upcoming FCN events.
- Add News Feed Readiness and Commentary Readiness with explicit mock / provider boundaries.
- Keep public Daily / Weekly, public Market, admin editorial workflows, Social Pack, auth, membership, schema, migrations, external AI, external news, market data provider, broker sync, and trading logic unchanged.

### v3.40 — Global Risk Center Expansion

- Expand Risk Center from FCN-led foundation into multi-asset risk readback after Stock / Crypto / Grid / Dual data contracts are mature.
- Move appropriate concentration, correlation, scenario, and stress-test ownership from Portfolio Center into Risk Center.
- Add explicit data-source freshness and provider-health semantics before live market data is used in risk readback.
- Keep the product boundary as monitoring and risk-awareness only; no trading instructions, order execution, broker sync, personalized recommendations, or AI advisory claims.

### v4.00 — Intelligence + Market Integration Program

- Treat v4.00 as an integration program, not a single small feature.
- Connect Market, Portfolio, FCN, Risk, and Intelligence into one user workflow.
- First establish a Portfolio Truth Layer so Portfolio Center can reconcile `/api/fcn`, `/api/stocks`, `/api/crypto`, `/api/portfolio/dashboard`, and repository assets.
- Add a Workspace Market Service plan that wraps existing quote / market-intelligence providers with source, timestamp, stale, fallback, and provider-status semantics.
- Use FCN v3.20 helpers rather than rebuilding FCN risk logic.
- Prepare Intelligence Center V2 to aggregate Daily / Weekly, Market, Portfolio, FCN, and Risk readback without inventing data.
- Do not add new external market providers, external news providers, AI providers, broker sync, schema changes, migrations, trading logic, Social Pack changes, admin editorial changes, auth changes, or membership changes.

Suggested v4.00 sprint order:

1. `v4.00a` Architecture Audit.
2. `v4.01` Portfolio Truth Layer.
3. `v4.02` Portfolio Intelligence UI.
4. `v4.03` Risk Intelligence Layer.
5. `v4.04` Intelligence Readback Layer.
6. `v4.05` Market Abstraction Layer.
7. `v4.06` Market Readiness UI.
8. `v4.07` Provider Health Framework.
9. `v4.08` Market Service Layer.
10. `v4.09` Workspace Market Integration.
11. `v4.10` Input → Truth → Workspace Unification.
12. `v4.11` Market Data Provider / FCN Risk Engine.
13. `v4.12` Unified Dashboard / Release Hardening.

### v4.01 — Portfolio Truth Layer

- Establish the first shared readback layer across Portfolio Center, Risk Center, and Intelligence Center.
- Normalize existing `/api/fcn`, `/api/stocks`, `/api/crypto`, and `/api/portfolio/dashboard` data into counts, known notional, source status, missing-data warnings, and available symbols.
- Update `/my-ixai/portfolio` so overview counts no longer stay at zero when FCN / Stock / Crypto records exist.
- Update `/my-ixai/risk` to show Portfolio Truth source status and holdings counts while preserving the existing v3.30 risk scoring logic.
- Update `/my-ixai/intelligence` to show Portfolio Truth readiness, holdings counts, and top available symbols without inventing news, AI commentary, prices, or recommendations.
- No schema, migration, new API route, external market provider, external news provider, AI provider, broker sync, auth, membership, Social Pack, admin editorial, or trading changes.

### v4.02 — Portfolio Intelligence UI

- Transform the v4.01 Portfolio Truth Layer into visible Portfolio Center intelligence.
- Add counts-based allocation for Stocks, FCN, and Crypto.
- Add holdings summary, top symbol occurrence summary, source health, and missing-data warnings.
- Use only existing `/api/fcn`, `/api/stocks`, `/api/crypto`, `/api/portfolio/dashboard`, and Portfolio Truth Layer data.
- Do not add AI, market data, broker sync, recommendation logic, schema, migration, API routes, auth, membership, Social Pack, admin editorial, or trading behavior.

### v4.03 — Risk Intelligence Layer

- Extend the v4.01 Portfolio Truth Layer with deterministic risk readback for concentration and data quality.
- Upgrade `/my-ixai/risk` with concentration risk, top exposure aggregation, FCN worst-of summary, and data quality risk summary.
- Reuse v3.20 FCN Intelligence Center helper output for FCN worst-of readback; do not duplicate FCN calculations.
- Keep the existing v3.30 Foundation Score and data source status behavior.
- Do not add market data, broker sync, AI commentary, recommendation logic, schema, migration, API routes, auth, membership, Social Pack, admin editorial, or trading behavior.

### v4.04 — Intelligence Readback Layer

- Reuse the Portfolio Truth Layer and Risk Intelligence Layer inside `/my-ixai/intelligence`.
- Add portfolio intelligence summary, risk snapshot summary, exposure intelligence summary, and readiness warning summary.
- Keep Daily / Weekly / Market entry points, FCN highlights, news readiness, commentary readiness, and source status intact.
- Do not add AI commentary, LLM integration, market data, broker sync, news provider, recommendation logic, schema, migration, API routes, auth, membership, Social Pack, admin editorial, or trading behavior.

### v4.05 — Market Abstraction Layer

- Add `src/lib/market/` contracts for `MarketQuote`, `MarketSnapshot`, `MarketNews`, `MarketProvider`, provider registry, and market center helpers.
- Add deterministic `MockProvider` for contract validation only.
- Keep existing public market utilities untouched.
- Do not add Yahoo API, Binance API, CoinGecko API, broker integration, API keys, external news provider, external service, database change, schema change, migration, or API route.

### v4.06 — Market Readiness UI

- Reuse v4.05 Market Abstraction Layer inside `/my-ixai/intelligence`.
- Add Market Readiness section showing provider registry status, quote/news contract coverage, mock provider count, and supported mock symbols.
- Use only `MockProvider` and provider registry metadata.
- Do not add Yahoo API, Binance API, broker integrations, external services, API routes, database changes, schema changes, or migrations.

### v4.07 — Provider Health Framework

- Extend `src/lib/market/` with `provider-health.ts`.
- Add `ProviderStatus`, `DataFreshness`, `ProviderPriority`, `ProviderHealthSummary`, and fallback policy support.
- Add deterministic mock provider health data and expose it through the market center.
- Do not add Yahoo API, Binance API, external services, API routes, database changes, schema changes, or migrations.

### v4.08 — Market Service Layer

- Add `src/lib/market/market-service.ts` as the unified Workspace market-service boundary.
- Expose `getQuote()`, `getQuotes()`, `getMarketSnapshot()`, `getMarketNews()`, `getProviderHealth()`, and `getMarketReadiness()`.
- Reuse the Market Abstraction Layer, Provider Health Framework, provider registry, market center helpers, and deterministic `MockProvider`.
- Add Market Service Status readback inside `/my-ixai/intelligence`.
- Do not add Yahoo API, Binance API, external providers, API routes, database changes, schema changes, or migrations.

### v4.09 — Workspace Market Integration

- Add a shared Workspace Market Status component.
- Integrate Market Service readiness into `/my-ixai/portfolio`, `/my-ixai/risk`, and `/my-ixai/intelligence`.
- Display market readiness, provider health, and fallback policy awareness as read-only metadata.
- Do not fetch live quotes, call external providers, add API routes, database changes, schema changes, or migrations.

### V410 — Workspace Full Scan Report

- Audit-only workspace scan after v4.09.
- Confirms primary navigation routes are present and valid.
- Confirms Portfolio Truth is consumed by Portfolio, Risk, and Intelligence.
- Confirms FCN Center reads persisted `/api/fcn` data and manual price overlays.
- Flags the active Portfolio route missing the Workspace Market Status section.
- Flags the local-only Stock / Crypto / FCN input paths as disconnected from the persisted Truth Layer.
- Recommends the next implementation sequence:
  - `v4.10` Market Data Layer.
  - `v4.11` FCN Risk Engine.
  - `v4.12` Unified Dashboard.

### v4.10 — Input → Truth → Workspace Unification

- Add `src/lib/portfolio/input/input-truth-bridge.ts` as the canonical browser-local pending input bridge.
- Keep `ixai.portfolio.recent-inputs.v306` and `ixai.fcn.drafts.v308` as compatibility fallbacks.
- Extend Portfolio Truth with pending input records, pending counts, pending known notional, and an Input Truth Bridge source status.
- Wire Stock, Crypto, and FCN input forms into the bridge while preserving current local fallback behavior.
- Display pending FCN inputs in FCN Center without changing `/api/fcn` or Supabase persistence.
- Render Workspace Market Status on the active `/my-ixai/portfolio` route.
- Update Workspace Home, Settings, and mobile Settings active-state copy.
- Do not add schema, migrations, new API routes, broker sync, live market data, AI, recommendations, or trading behavior.
- Recommended next:
  - `v4.20` Market Data Foundation.
  - `v4.21` FCN Market Price Readiness.
  - `v4.22` Portfolio Valuation Readiness.

### v4.20 — Market Data Foundation

- Add unified Workspace quote types for equity and crypto symbols.
- Add a Yahoo Finance equity provider for supported public equity symbols.
- Add a Binance crypto provider for supported public crypto pairs.
- Add Market Service facade methods for single quote, multi-quote, and default Workspace quote sets.
- Update Workspace Market Status to display quote price, percent change, and source status while keeping failures non-blocking.
- Keep v4.20 informational only: no broker sync, no trading, no recommendations, no auth change, no schema change, no migration, no API contract change, and no FCN pricing engine.

### v4.30 — Portfolio Valuation Engine

- Add Portfolio Valuation types, engine, and service.
- Reuse Portfolio Truth Layer readback and v4.20 Market Service quotes.
- Calculate estimated market value, cost basis, unrealized P/L, and asset-class allocation.
- Value Stock and Crypto positions with market quotes when available.
- Keep FCN valuation as notional placeholder only and clearly label the limitation.
- Keep pending input valuation partial/local only.
- Add Portfolio Valuation Summary to `/my-ixai/portfolio`.
- Do not add schema, migrations, API contract changes, auth changes, broker sync, trading, recommendations, or full FCN pricing.
- Recommended next:
  - `v4.40` Risk Engine v1.

### v4.40 — Risk Engine v1

- Add Portfolio Risk types, engine, and service.
- Reuse v4.30 Portfolio Valuation output as the input to risk calculations.
- Calculate deterministic 0-100 risk score and low / medium / high / critical / unavailable risk levels.
- Detect single-position concentration, asset-class concentration, crypto exposure, market-data quality gaps, and FCN notional placeholder valuation.
- Add Risk Engine Summary to `/my-ixai/risk`.
- Keep FCN pricing as placeholder / notional-awareness only.
- Do not add schema, migrations, API contract changes, auth changes, broker sync, trading, recommendations, or full FCN pricing.
- Recommended next:
  - `v4.50` FCN Risk Engine v1 with KI / KO distance monitoring and provider freshness semantics.

### v4.50 — FCN Risk Engine v1

- Add FCN Risk Engine v1 types, engine, service, and FCN Center summary UI.
- Reuse existing `/api/fcn` / Supabase readback, local FCN draft fallback, manual price overlays, and v4.20 market-service quotes.
- Calculate worst-of underlying, performance, KI distance, strike distance, KO readiness, and FCN risk level.
- Keep unsupported or incomplete market quote data visible with `partial` / `unavailable` source status and warnings.
- Preserve the legacy `src/lib/fcn/risk` import by moving the old file to `src/lib/fcn/risk/legacy-risk.ts` and re-exporting through `src/lib/fcn/risk/index.ts`.
- Do not add schema, migrations, API contract changes, auth changes, broker sync, trading, recommendations, Greeks, Monte Carlo, option valuation, scenario simulation, or full FCN pricing.
- Recommended next:
  - `v4.60` FCN Coupon and Schedule Engine.

### v4.60 — FCN Coupon & Schedule Engine

- Add FCN schedule types, engine, service, and FCN Center summary UI.
- Reuse existing `/api/fcn` / Supabase readback, local FCN draft fallback, observation schedules, maturity dates, and common metadata schedule shapes.
- Normalize coupon, observation, KO observation, maturity, and unknown events.
- Calculate local-date urgency: overdue, due soon, upcoming, future, unavailable.
- Build next-30-day event readback and monthly expected coupon cashflow when explicit coupon amount data exists.
- Keep coupon events visible even when amount is missing; do not invent coupon amount.
- Do not add schema, migrations, API contract changes, auth changes, broker sync, trading, recommendations, tax reporting, or full FCN pricing.
- Recommended next:
  - `v4.70` Server-side Market Cache Layer.

### v4.70 — Server-side Market Cache Layer

- Add memory-only market cache types, store, service, and barrel export under `src/lib/market/cache/`.
- Route `getMarketQuote()`, `getMarketQuotes()`, and default Workspace quote readback through the cache layer before refreshing Yahoo Finance or Binance providers.
- Use 15-minute TTL for equities and 2-minute TTL for crypto.
- Return fresh cached quotes when available, stale fallback quotes when refresh fails, and unavailable results when no usable quote exists.
- Add compact cache diagnostics to Workspace Market Status.
- Do not add schema, migrations, API contract changes, auth changes, broker sync, trading, recommendations, durable cache infrastructure, or full FCN pricing.
- Recommended next:
  - `v4.75` Workspace Full Integration Review.

### v4.75 — Workspace Full Integration Review

- Add static/service-level Workspace integration audit types, engine, and service under `src/lib/workspace/integration/`.
- Add Workspace Integration Status diagnostics to Settings.
- Audit expected exports and fallback presence for Truth Layer, Market Cache, Market Service, Portfolio Valuation, Portfolio Risk, FCN Risk, and FCN Schedule.
- Show lineage flow, healthy / warning / broken module counts, detected issues, and generated timestamp.
- Do not run runtime network tests or authenticated API probes.
- Do not add schema, migrations, auth changes, broker sync, trading, recommendations, redesign, or full FCN pricing.
- Recommended next:
  - `v4.80` Intelligence Engine v1.

### v4.80 — Intelligence Engine v1

- Add deterministic Workspace Intelligence Engine types, engine, and service under `src/lib/intelligence/engine/`.
- Generate structured Intelligence Cards from Portfolio Valuation, Risk Engine, FCN Risk, and FCN Schedule readback.
- Add Intelligence Summary UI to `/my-ixai/intelligence`.
- Cover Portfolio, Risk, FCN, and Schedule card categories.
- Include severity, title, summary, and source-engine attribution for every card.
- Do not call AI models, add recommendations, broker logic, schema changes, migrations, API contract changes, auth changes, trading logic, or FCN pricing.
- Recommended next:
  - `v4.90` Intelligence Card QA / User Workflow Review or FCN Scenario Monitoring.

### v3.32 — Settings and Preferences Foundation

- Migrate Legacy Pro preference concepts into App-native account settings.
- Cover language, region, notifications, delivery channels, default landing, compact mode, advanced intelligence preference, and risk interpretation mode.

### v3.33 — Real Market Data Provider Foundation

- Replace deterministic mock market snapshots behind the existing provider contract.
- Add source, timestamp, stale-data, provider health, and failure semantics before using values in production risk readback.

### v3.34 — Broker Adapter Security Foundation

- Define read-only broker sync, consent, credential storage, audit log, refresh, revocation, rate limits, and partial-sync failure states.

### v3.35 — Legacy Pro Decommission Plan

- Mark each Legacy Pro screen as replaced, migrated conceptually, retained as reference, or retired.
- Preserve product ideas and discard unsafe legacy auth/data patterns.

### v1.82 — FCN Risk Engine

- v1.82.1: Worst-of MVP from stored `initial_price` / `current_price`.
- v1.82.2: Distance to KI.
- v1.82.3: Distance to KO.
- v1.82.4: Strike distance.
- v1.82.5: Observation calendar.
- v1.82.6: Coupon calendar.
- v1.82.7: FCN risk score.
- Monitoring / risk-awareness output only; no personalized product advice.

### v1.83 — FCN Risk Engine

- KI distance.
- Risk level.
- Portfolio risk score.
- Concentration exposure.
- Worst-of ranking.
- Additive Risk / Pro dashboard readback.
- No live market data and no personalized product advice.

### v1.83.1 — FCN Risk Engine Staging Validation

- Validate dashboard additive fields.
- Validate FCN Risk Engine output with staging data.
- Confirm mobile readback safety on `/risk` and `/pro`.
- Confirm no Supabase schema change is required.

### v1.84 — FCN Intelligence Layer

- Risk narrative.
- Worst-of narrative.
- Concentration narrative.
- Near-KI narrative.
- Deterministic interpretation only.
- No OpenAI API and no external market data.

### v1.85 — Portfolio Intelligence Dashboard

- Portfolio health score.
- Portfolio status.
- Risk distribution.
- Monitoring highlights.
- Risk / Pro dashboard readback.
- Retain FCN Worst-of MVP, FCN Risk Engine MVP, and FCN Intelligence MVP sections.
- Compliance-safe monitoring language only.

### v1.86 — Membership & Entitlement Foundation

- Free.
- Basic.
- Pro.
- Entitlement-based feature gating.
- Portfolio / FCN / Risk / Pro access matrix.
- `membershipTier` and `entitlements` dashboard fields.
- `/pro` visible membership guard.
- Feature access must be enforced through membership / entitlement logic, not frontend hiding alone.

### v1.87 — Multi-Asset Portfolio Foundation

- Normalize portfolio asset categories:
  - FCN.
  - STOCK.
  - CRYPTO.
  - GRID.
  - DUAL.
  - CASH.
- Add portfolio asset abstraction layer.
- Add asset category counts and allocation summary to dashboard readback.
- No migration, no schema change, no input forms, no market data API.

### v1.88 — Portfolio Center UI MVP

- `/portfolio` remains Portfolio Input.
- `/my-ixai/portfolio` becomes Portfolio Center Dashboard / readback.
- Visualize v1.82-v1.87 fields:
  - Portfolio health and risk scores.
  - Multi-asset allocation.
  - FCN Worst-of and concentration.
  - FCN / Portfolio intelligence narratives.
  - Membership status and feature availability.
- No new API, schema, market data, AI, payment, or trading function.

### v1.89 — Portfolio Architecture Visualization MVP

- Add IXAI Architecture Map inside `/my-ixai/portfolio`.
- Visualize completed v1.80-v1.88 capabilities:
  - Portfolio Layer.
  - Risk & Intelligence Layer.
  - Membership Layer.
  - Readback Layer.
- Show future boundaries as Coming Soon:
  - Broker Integration.
  - Market Data API.
  - Payment / Billing.
  - AI Advisory Agent.
- No new API, schema, AI, market data, broker, payment, or trading function.

### v1.90 — Portfolio Input Foundation + Global Asset Model Foundation

- Add `/my-ixai/input` as Asset Input Hub.
- Define input modes:
  - Manual Input.
  - CSV Import.
  - Broker Sync.
  - Exchange Sync.
  - Bank Statement Import.
- Define asset categories:
  - FCN.
  - STOCK.
  - CRYPTO.
  - GRID.
  - DUAL.
  - CASH.
- Add CSV template / validation foundation without parsing or upload.
- Add i18n / global market foundation for Taiwan, Hong Kong, China, Japan, Korea, United States, Europe, and Global workflows.
- Prepare holding-aware news intelligence architecture without adding news API or AI API.
- No migration, schema, API, broker, market data, payment, or trading function.

### v1.91 — Portfolio CRUD Foundation MVP

- Add `/my-ixai/portfolio/assets` as Asset Management Center.
- Add mock-only Create / Read / Update / Delete interactions.
- Add asset list, asset card, asset form, and delete confirmation dialog.
- Use v1.90 asset categories: FCN, STOCK, CRYPTO, GRID, DUAL, CASH.
- Mobile stacked cards; desktop responsive grid.
- No migration, schema change, Supabase write, API route, auth, membership, external data, or trading function.

### v1.92 — Portfolio Data Model Foundation

- Add Portfolio Account → Asset → Position TypeScript model.
- Add mock account / asset / position repository.
- Add additive Supabase migration foundation:
  - `portfolio_accounts`.
  - `portfolio_assets`.
  - `portfolio_positions`.
- Add owner-only RLS foundation.
- Add Portfolio Center Data Model Status.
- Do not connect UI to Supabase yet.
- No Broker API, News API, AI API, Market Data API, real import, real sync, auth, membership, entitlement, or trading function.

### v1.93 — Portfolio Repository Foundation

- Add Portfolio Repository contract:
  - `getAccounts`.
  - `getAssets`.
  - `getPositions`.
  - `createAsset`.
  - `updateAsset`.
  - `deleteAsset`.
  - `createPosition`.
  - `updatePosition`.
  - `deletePosition`.
- Add Mock Portfolio Repository backed by v1.92 mock data.
- Update CRUD mock adapter to go through repository.
- Add Repository Status to Portfolio Center.
- Keep Persistence Layer Coming Soon.
- No Supabase read / write, no API route, no migration apply, no auth, membership, or entitlement change.

### v1.94 — Portfolio Persistence Foundation

- Add Supabase Portfolio Repository implementation.
- Add Portfolio Persistence Provider.
- Connect Asset Management Center to Supabase read/create.
- Use existing v1.92 tables:
  - `portfolio_accounts`.
  - `portfolio_assets`.
  - `portfolio_positions`.
- Enable Create Asset and Read Asset only.
- Keep Update Asset and Delete Asset Coming Soon.
- No migration, schema change, API route, auth, membership, entitlement, CSV upload, broker sync, market data, news API, FCN engine, intelligence engine, or risk engine change.

### v1.95 — Portfolio Ownership Validation MVP

- Add Ownership Validation Status inside Portfolio Center.
- Display current user id, account id, account count, asset count, position count, repository source, and RLS status.
- Confirm Asset Create re-reads repository data after persistence.
- Keep isolation enforced by authenticated user scope and Supabase RLS.
- No auth, membership, entitlement, schema, or API route changes.

### v1.96 — Portfolio Dashboard Foundation

- Add repository-driven dashboard section inside `/my-ixai/portfolio`.
- Display total accounts, total assets, and total positions.
- Display asset category allocation:
  - FCN.
  - STOCK.
  - CRYPTO.
  - GRID.
  - DUAL.
  - CASH.
- Display provider allocation:
  - MANUAL.
  - BINANCE.
  - BYBIT.
  - OKX.
  - CTBC.
  - FUBON.
  - YUANTA.
  - IBKR.
  - FIRSTRRADE.
  - CSV.
- Display region allocation:
  - TW.
  - HK.
  - CN.
  - JP.
  - KR.
  - US.
  - EU.
  - GLOBAL.
- No migration, schema change, API route, auth, membership, entitlement, market data, news, AI, broker sync, or FCN engine change.

### v1.97 — Portfolio News Intelligence Foundation

- Create Portfolio Intelligence Universe from repository-backed assets.
- Map STOCK / CRYPTO symbols directly.
- Map FCN underlyings from asset metadata.
- Map GRID / DUAL pair symbols into base crypto symbols.
- Ignore CASH.
- Display tracked symbol badges inside `/my-ixai/portfolio`.
- No News API, OpenAI, Claude, Gemini, market data, broker sync, API route, migration, schema, auth, membership, or entitlement changes.

### v1.98 — Portfolio News Provider Foundation

- Add Portfolio News Provider contract.
- Add mock news provider for supported tracked symbols.
- Build Portfolio News Feed from:
  - Repository assets.
  - Intelligence Universe.
  - News Provider.
- Display News Provider Status, tracked symbols, news count, and latest mock headlines inside `/my-ixai/portfolio`.
- No external News API, OpenAI, Claude, Gemini, market data, broker sync, API route, migration, schema, auth, membership, entitlement, or FCN engine change.

### v1.99 — Portfolio AI Commentary Foundation

- Add Portfolio Commentary types:
  - sentiment.
  - risk level.
  - category.
  - confidence.
  - headline and summary.
- Add Portfolio Commentary Provider contract.
- Add mock commentary provider.
- Build Portfolio Commentary from existing Portfolio News Feed.
- Display Commentary Count, sentiment counts, risk-watch counts, and Latest Commentary inside `/my-ixai/portfolio`.
- No real AI provider, OpenAI, Claude, Gemini, Anthropic, LangChain, LlamaIndex, News API, market data, broker sync, API route, migration, schema, auth, membership, entitlement, FCN engine, or Daily / Weekly / Social Pack change.

### v2.00 — Portfolio Intelligence Engine Foundation

- Add Portfolio Intelligence Engine types and contract.
- Add deterministic mock scoring for health, risk, concentration, and diversification.
- Reuse Repository, News Feed, and Commentary layers through the Intelligence Score Builder.
- Display Portfolio Intelligence Score and summary inside `/my-ixai/portfolio`.
- No OpenAI, Claude, Gemini, Anthropic, News API, market data, broker sync, API route, migration, schema, auth, membership, entitlement, FCN engine, or Daily / Weekly / Social Pack change.

### v2.01 — Portfolio Risk Engine Foundation

- Add Portfolio Risk types and contract.
- Add deterministic mock risk report.
- Score concentration, diversification, FCN, crypto-like exposure, and cash buffer risk.
- Display Overall Risk, Risk Score, risk category levels, Summary, and Alerts inside `/my-ixai/portfolio`.
- No migration, schema, API route, auth, membership, entitlement, market data, News API, broker sync, recommendation logic, or trading feature.

### v2.02 — Portfolio Recommendation Engine Foundation

- Add Portfolio Recommendation types and contract.
- Add deterministic mock recommendation engine.
- Generate monitoring prompts from the current Portfolio Risk Report.
- Display Recommendation Count, High Priority Count, Generated Time, and Recommendation Cards inside `/my-ixai/portfolio`.
- Preserve compliance boundaries: monitoring prompts only, no ticker-specific order instruction, no price targets, no external AI, no broker sync, no market data, and no trading function.

### v2.03 — Portfolio Market Data Foundation

- Add Portfolio Market Snapshot types.
- Add Market Data Provider contract.
- Add deterministic mock market data provider for BTC, ETH, AAPL, TSLA, NVDA, MSFT, MDB, ORCL, AVGO, PLTR, and GOOGL.
- Build Market Data Feed from Portfolio Assets -> Intelligence Universe -> Mock Market Data Provider.
- Display Market Data Status, Provider Source, Tracked Symbols, Snapshot Count, Updated Time, and Market Snapshot Cards inside `/my-ixai/portfolio`.
- No real market provider, no Yahoo Finance, no Binance, no CoinGecko, no Finnhub, no Polygon, no API route, no migration, no schema change, no broker sync, no recommendation logic, and no trading function.

### v2.04 — Portfolio Valuation Engine Foundation

- Add Portfolio Valuation types.
- Add Portfolio Allocation types.
- Add Valuation Engine contract.
- Add deterministic mock valuation engine.
- Build Portfolio Valuation Report from repository assets, positions, and mock market snapshots.
- Display Total Cost Basis, Total Market Value, Unrealized P/L, Unrealized Return, and allocation metrics inside `/my-ixai/portfolio`.
- No real market provider, broker sync, API route, migration, schema change, recommendation logic, or trading function.

### v2.05 — Portfolio Exposure Engine Foundation

- Add Portfolio Exposure types.
- Add Exposure Engine contract.
- Add deterministic mock exposure engine.
- Build Portfolio Exposure Report from repository assets, market data, and valuation output.
- Display Total Market Value, Top Exposures, Asset Type Exposure, Symbol / Underlying Exposure, Region Exposure, and Provider Exposure inside `/my-ixai/portfolio`.
- No real market provider, broker sync, API route, migration, schema change, recommendation logic change, or trading function.

### v2.06 — Portfolio Concentration Engine Foundation

- Add Portfolio Concentration types.
- Add Concentration Engine contract.
- Add deterministic mock concentration engine.
- Build Portfolio Concentration Report from the existing Portfolio Exposure Report.
- Display Overall Concentration, Concentration Score, Top Symbol, Top FCN Underlying, Top Asset Type, Top Provider, Top Region, Alerts, Summary, and Generated Time inside `/my-ixai/portfolio`.
- No real market provider, broker sync, API route, migration, schema change, recommendation logic change, or trading function.

### v2.07 — Portfolio Correlation Engine Foundation

- Add Portfolio Correlation types.
- Add Correlation Engine contract.
- Add deterministic mock correlation engine.
- Build Portfolio Correlation Report from the existing Portfolio Exposure Report and Portfolio Concentration Report.
- Display Correlation Score, Correlation Risk Level, High / Medium / Low Counts, Top Correlation Pairs, Alerts, Summary, and Generated Time inside `/my-ixai/portfolio`.
- No real market provider, broker sync, API route, migration, schema change, recommendation logic change, or trading function.

### v2.08 — Portfolio Scenario Engine Foundation

- Add Portfolio Scenario types.
- Add Scenario Engine contract.
- Add deterministic mock scenario engine.
- Build Portfolio Scenario Report from valuation, exposure, concentration, and correlation reports.
- Display Scenario Count, Worst Scenario, Average Impact, Scenario Risk Level, Scenario Cards, Alerts, Summary, and Generated Time inside `/my-ixai/portfolio`.
- Keep scenario logic deterministic and market-agnostic until real market data and broker sync are approved.
- No live provider, broker sync, external AI, recommendation logic, or trading feature.

### v2.09 — Portfolio Stress Test Engine Foundation

- Add Portfolio Stress Test types.
- Add Stress Test Engine contract.
- Add deterministic mock stress-test engine.
- Build Portfolio Stress Test Report from valuation, exposure, concentration, correlation, and scenario reports.
- Display Stress Test Count, Worst Stress Test, Average Stress Impact, Stress Risk Level, Capital Preservation Warning, Stress Test Cards, Alerts, Summary, and Generated Time inside `/my-ixai/portfolio`.
- Keep stress-test logic deterministic and market-agnostic until real market data and broker sync are approved.
- No live provider, broker sync, external AI, recommendation logic, or trading feature.

### v2.10 — FCN Risk Engine Foundation

- Add Portfolio FCN Risk types.
- Add FCN Risk Engine contract.
- Add deterministic mock FCN-risk engine.
- Build Portfolio FCN Risk Report from portfolio assets, exposure, concentration, correlation, and stress-test reports.
- Display FCN Count, FCN Exposure, FCN Risk Score, FCN Risk Level, Underlying Count, Repeated Underlying Count, Correlation Count, Stress-Test Sensitivity, Alerts, Summary, and Generated Time inside `/my-ixai/portfolio`.
- Keep FCN-risk logic deterministic and market-agnostic until real market data, broker sync, and product-level FCN governance are approved.
- No broker API, real market data, external AI, personalized advice, recommendation logic change, or trading execution.

### v2.10a — Global Market Foundation Review

- Review all Portfolio Foundation engines and ensure global market compatibility.
- Review Asset Types.
- Review Region Enums.
- Review Provider Enums.
- Review Market Data Interfaces.
- Review News Interfaces.
- Review Language Interfaces.
- Review Localization Readiness.
- Confirm FCN support beyond US equities:
  - Taiwan equities.
  - Hong Kong equities.
  - China A-Shares.
  - Japan equities.
  - Korea equities.
  - European equities.
  - Singapore equities.
  - Crypto-linked structured products.
- Review future broker integration compatibility.
- No broker API, market data API, AI API, migration, schema change, or trading function.

### v2.11 — Platform IA Refactor

- Split the current dense Portfolio Center into clear product centers:
  - Home.
  - Portfolio Center.
  - Risk Center.
  - Intelligence Center.
  - FCN Center.
  - Settings.
- Move risk-heavy modules out of Portfolio Center.
- Move news / commentary / intelligence modules into Intelligence Center.
- Move FCN-specific monitoring into FCN Center.
- Move membership / entitlement / diagnostics into Settings.
- No new engine, provider, broker, market data, external AI, trading, migration, or schema change.

### v2.12 — Broker Integration Foundation

- Define broker provider contracts and consent boundaries.
- Plan future providers:
  - Binance.
  - IBKR.
  - Firstrade.
  - Futu.
  - CTBC.
  - Fubon.
  - Yuanta.
  - Future Bank Custody.
- No live broker sync until credential handling, server-side adapters, user consent, ownership isolation, and failure-mode governance are approved.

### v2.13 — Real Market Data Foundation

- Define real market data provider contracts.
- Define freshness, attribution, stale data, fallback, and provider failure rules.
- Review market support across US / TW / HK / CN / JP / KR / EU / SG / Crypto / FCN underlyings.
- No live trading, broker sync, or personalized advice.

### v2.14 — Global Market Center Foundation

- Define market-aware routing and product surfaces for global coverage.
- Review localization and market-region copy.
- Prepare user-visible global market readiness without implying all feeds are live.

### v2.15 — Legacy Pro Migration Phase 1

- Selectively migrate Legacy Pro concepts into App-native centers.
- Reuse product concepts, not legacy JWT / localStorage auth patterns.
- Prioritize Portfolio Intelligence, FCN Monitoring, Risk, News, AI Commentary, and Client Reporting concepts.

### v2.16 — Broker Sync Foundation Planning

- Define broker sync boundaries before any provider connection.
- Keep Supabase ownership, membership, and compliance gates explicit.
- No broker API until product, security, and data-governance checks are approved.

### v2.17 — CSV Import MVP

- Map CSV rows into Portfolio Account → Asset → Position.
- Use v1.92 model as the import target.
- Validate rows before persistence.
- No broker API or automatic sync.

### v2.18 — Holding-Aware News Engine

- Use Portfolio Assets and FCN underlyings to identify relevant news categories.
- Add risk impact note and IXAI perspective architecture.
- No AI API until explicitly approved.

### Deferred — Portfolio Input QA / Mobile Polish

- Validate `/my-ixai/input` and `/my-ixai/portfolio/assets` at 375px, 768px, and desktop widths.
- Confirm no horizontal overflow.
- Confirm mock CRUD copy does not imply persistence.
- Confirm placeholder CTAs do not imply live CSV upload, broker sync, payment, or external integrations.
- Confirm model foundation stays pure and does not call DB / API / browser storage.

### Deferred — Stock Portfolio Foundation

- Stock / ETF portfolio readback expansion.
- Stock position monitoring UX planning.
- Asset allocation and concentration foundation.
- No broker execution and no personalized trading advice.

### Deferred — Crypto / Grid Foundation

- Crypto spot portfolio expansion.
- Grid strategy monitoring foundation.
- Dual investment monitoring foundation.
- No exchange execution and no automated trading.

### Deferred — Unified Risk Engine

- Combine FCN, stock, crypto, grid, dual, and cash awareness into a unified risk model.
- Cross-asset concentration.
- Cross-market exposure.
- Compliance-safe monitoring language only.

### v2.19 — SaaS Beta

- Free / Basic / Pro product packaging.
- Upgrade flow and pricing page.
- Legacy Pro migration / retirement plan.
- Server-enforced paid API gates.
- No payment provider until explicitly approved.

### v1.90+ — IXAI AI Wealth Intelligence OS

- Multi-Asset.
- Multi-Market.
- Multi-Broker readiness.
- AI Monitoring.
- No automated trading.
- No buy/sell recommendations.

## Related Strategic Documents

- `docs/PRODUCT_ORIGIN.md`
- `docs/IXAI_VISION.md`
- `docs/PROJECT_MAP.md`
- `docs/SOCIAL_PACK_INCIDENT_REVIEW_20260609.md`
- `docs/PRO_INTEGRATION_PLAN.md`
- `docs/SSO_FOUNDATION_PLAN.md`
- `docs/SSO_IMPLEMENTATION_PLAN.md`
- `docs/SSO_FILE_CHANGESET.md`
- `docs/SSO_PROTOTYPE_BLUEPRINT.md`
- `docs/SSO_SECURITY_REVIEW.md`
- `docs/DAILY_BRIEF_ROOT_CAUSE_ANALYSIS.md`
- `docs/CONTENT_ENGINE_V162_PLAN.md`
- `docs/CONTENT_ENGINE_ARCHITECTURE.md`
- `docs/PROVIDER_HEALTH_REVIEW.md`
- `docs/TAIWAN_USER_UX_CLEANUP_V163.md`
- `docs/UX_PRODUCT_ROLE_CORRECTION_V1631.md`
- `docs/PRO_MODULE_PAGES_REDESIGN_V165.md`
- `docs/HOMEPAGE_CONVERSION_REDESIGN_V166.md`
- `docs/SSO_LAUNCH_PROTOTYPE_V167.md`
- `docs/SSO_CTA_PROMOTION_V1671.md`
- `docs/ACCOUNT_ICON_CLEANUP_V1672.md`
- `docs/UNIFIED_IDENTITY_MVP_V168.md`
- `docs/PRO_SESSION_HARDENING_V169.md`
- `docs/SSO_STABILITY_VALIDATION_V170.md`
- `docs/APP_LOGIN_ENTRY_FIX_V1702.md`

## v1.70.2 — App Login Entry Fix

Goal:

- Make `/login` clearly support existing-user login after Pro logout QA.
- Keep `/register` as the account creation surface.
- Preserve Supabase auth logic and SSO launch behavior unchanged.

Out of scope:

- No SSO logic changes.
- No Pro session changes.
- No Legacy Pro, backend, Daily / Weekly, FCN, provider, Stripe, trading, or portfolio engine changes.

## v1.70.0 — SSO Stability Validation

Goal:

- Validate the App to Pro SSO path after v1.69.1 without adding features.
- Confirm a logged-in App user can launch Legacy Pro, land on `/dashboard`, refresh, switch routes, re-enter from App `/account`, and logout predictably.
- Confirm invalid / replayed codes show the safe fallback page and do not clear an already valid SSO session.
- Record known limitations of the localStorage MVP SSO bridge before production release QA.

Out of scope:

- No UI changes.
- No App `/api/pro/launch` behavior changes.
- No backend, Supabase schema, auth provider, Daily / Weekly, FCN content, provider, Stripe, broker, trading, or portfolio engine changes.

Next:

- v1.70.1 should run credential-dependent production release QA after the v1.69.1 Legacy Pro persistence fix is deployed.
- v1.71 should decide whether to move the Pro bridge toward Supabase session reuse or backend-validated bridge tokens for protected Pro APIs.

## v1.69.0 — Pro Session Hardening

Goal:

- Upgrade the Legacy Pro MVP SSO marker from `ixai_sso_v1` to structured `ixai_sso_v2`.
- Centralize session helpers for legacy JWT and App SSO sessions.
- Keep refresh behavior stable on `/dashboard`.
- Let protected Pro routes accept SSO UI sessions without treating them as backend JWTs.
- Ensure logout clears both legacy JWT and SSO session state predictably.

Out of scope:

- No Supabase migration.
- No backend production membership logic changes.
- No Stripe, billing, broker, trading, Portfolio engine, FCN calculation engine, provider ingestion, or Daily / Weekly generation changes.

Next:

- v1.70 should move from localStorage MVP session markers toward a safer shared Supabase or backend-validated session model for protected Pro APIs.

## v1.68.0 — App ↔ Pro Unified Identity MVP

Goal:

- Complete the first usable App to Pro login experience.
- Keep App login as Supabase Auth.
- Keep App `/api/pro/launch` as a short-lived one-time-code boundary.
- Let Legacy Pro validate the launch code, create a short-lived `ixai_sso_v1` MVP session, and redirect users directly to `/dashboard`.
- Preserve legacy Pro `/login` as fallback.

Out of scope:

- No Stripe, billing, broker integration, trading, portfolio engine, FCN calculation engine, Daily / Weekly generation, provider ingestion, Supabase schema change, or legacy login removal.
- The MVP session does not grant paid Pro access and does not authorize backend Portfolio / FCN / Risk data.

Next:

- v1.69 should replace the MVP localStorage bridge with a safer session model: direct Supabase session in Legacy Pro or backend-validated bridge tokens for protected Pro APIs.

## v1.67.2 — Account Icon Cleanup

Goal:

- Remove remaining off-style icon treatments from `/account` lower user sections.
- Keep card / section icons aligned with the v1.64.2 shared `FeatureIcon` system.
- Preserve SSO CTA placement and launch behavior unchanged.

Out of scope:

- No SSO logic changes.
- No backend, auth, content engine, provider, FCN content, or layout changes.

## v1.67.1 — Promote Pro SSO CTA

Goal:

- Make the App to Pro SSO launch visible and testable from `/pro` and `/account`.
- Put `開啟 IXAI Pro` first in the `/pro` hero CTA order.
- Surface the same SSO launch action near the top of the `/account` Pro card.

Out of scope:

- No launch-token behavior changes.
- No Legacy Pro receive route changes.
- No auth, backend, Daily / Weekly, provider, or FCN education changes.

## v1.67.0 — App ↔ Pro SSO Launch Prototype

Goal:

- Prove the first low-risk App to Pro launch handoff.
- Keep App login as Supabase Auth.
- Keep Legacy Pro login intact as fallback.
- Use a short-lived one-time launch code instead of sending Supabase tokens to Legacy Pro.
- Let Legacy Pro receive and validate App identity on `/sso/receive`.

Out of scope:

- No full SSO rollout.
- No legacy login removal.
- No Stripe, broker, portfolio engine, FCN calculation, payment, trading, or Daily / Weekly engine changes.

Next:

- v1.68 should decide between a protected JWT exchange bridge and a direct Legacy Pro Supabase migration path after reviewing the v1.67 prototype.

## Current Product Flow

```text
Landing
→ Onboarding
→ Account
→ Future Pro Interest
```

Public intelligence acquisition flow:

```text
LINE / Social / Share
→ Daily / Weekly / Share Intelligence
→ Onboarding
→ Account
→ Personal Intelligence
```

## Current Product Positioning

## Long Product Arc

IXAI's roadmap should preserve the long arc from internal 一玄AI tooling into a public and Pro intelligence product:

```text
AI Morning Brief
→ Telegram-style morning intelligence
→ FCN / Crypto Grid / Dual / stock monitoring prototypes
→ Public Intelligence
→ Account Intelligence
→ Future Pro Intelligence
→ Intelligence Distribution Layer
```

The early Morning Brief era proved the daily habit loop: users need a calm, structured market interpretation before they need more dashboards. FCN monitoring, Crypto Grid / Dual monitoring, stock watch monitoring, and market-news intake proved the core intelligence primitives: risk context, market regime, instrument-specific awareness, and human-readable summaries. The public app now turns those primitives into Public Intelligence, while Account and Pro surfaces gradually restore the personal monitoring depth in a compliant product architecture.

Roadmap decisions should therefore follow this principle:

- Public Intelligence builds trust and daily reading habit.
- Account Intelligence remembers preferences and watchlist context.
- Pro Intelligence may later add portfolio, FCN, alert, and risk workflows.
- Distribution turns reviewed intelligence into LINE / social / publish workflows.
- None of these layers should become buy/sell signals, automated trading, or return promises.

### Public Intelligence

Purpose:

- Acquisition.
- Trust building.
- Daily habit.
- Public market education and awareness.

Includes:

- Daily Brief.
- Weekly Intelligence.
- Share Intelligence.
- Public landing.
- General market awareness.
- Public Intelligence Engine modules.

Does not include:

- Personalized portfolio analysis.
- Personal FCN risk monitoring.
- Buy / sell recommendations.

### Account Intelligence

Purpose:

- Watchlist Intelligence Lite.
- Identity continuity.
- Preference memory.
- LINE readiness.

Current status:

- Account is the AI Intelligence Workspace.
- Onboarding state is local/session-first.
- Watchlist Intelligence Lite surfaces onboarding seed, markets, and interests as lightweight market memory.
- LINE Delivery Foundation provides readiness-only delivery preferences, opt-in / pause / unsubscribe concepts, and Public / Account / Future Pro delivery separation.

### Pro Intelligence

Purpose:

- Future Portfolio Intelligence.
- Risk Intelligence.
- AI Alerts.
- Personal market memory.
- FCN risk workflow.

Current status:

- `/pro` is the conversion surface.
- `/pro-preview` is sample-only preview.
- `/pro-intelligence` is future gated shell.
- No Stripe or paid entitlement is live yet.

## Current Product Capabilities

### v1.40.3 — Public Intelligence Engine

Completed foundation:

- Daily Intelligence Upgrade.
- Weekly Intelligence Upgrade.
- Market Pulse.
- Macro Watch.
- AI / Tech Watch.
- Crypto Watch.
- FCN Awareness.
- Risk Regime.

Principle:

Public Intelligence should become more useful before IXAI asks users to create deeper personal or Pro workflows.

### v1.40.3a — Public Intelligence Engine Polish

Completed:

- Public Intelligence disclaimer layer.
- Mobile UX polish.
- CTA hierarchy audit.
- Compliance review.
- Public-to-Account narrative alignment.
- Risk Regime explanatory layer.

### v1.40.3b — Public Route Gate Hydration Fix

Completed:

- Fixed public route gate / hydration behavior for Public Intelligence routes.
- Preserved public readability for Landing, Daily Brief, Weekly Brief, and Share Intelligence.
- Preserved protected access boundaries for Account, Admin, and Pro Intelligence.

### v1.40.4 — Watchlist Intelligence Lite

Completed:

- Account Intelligence Workspace now surfaces onboarding watchlist seed.
- Added lightweight intelligence memory for selected markets, symbols, and interests.
- Mapped user interests to Public Intelligence modules.
- Preserved local/session-first model and non-advisory positioning.

### v1.40.5 — LINE Delivery Foundation

Completed:

- Added LINE delivery readiness foundation.
- Added local/session-first delivery preference model.
- Added opt-in / pause / unsubscribe concept.
- Clarified Public / Account / Future Pro delivery separation.
- Kept real push automation out of scope.

### v1.40.5a — Mobile Visual QA Readiness

Completed:

- Added mobile visual QA readiness.
- Added 390px route smoke checks.
- Verified Public Intelligence, Watchlist Intelligence Lite, and LINE Delivery Foundation mobile behavior at smoke-test level.
- Preserved product architecture and protected systems.

### v1.40.6 — Social Intelligence Engine

Completed:

- Added Daily / Weekly Social Pack foundation.
- Added 9:16 social story template preview.
- Added social caption drafts.
- Supported manual FB / IG / LINE publishing workflow.
- Preserved human review and avoided auto publishing.

### v1.40.6a — Social Pack Brand Asset Integration

Completed:

- Integrated official brand identity into Social Pack templates.
- Added reusable brand tokens.
- Added institutional research visual language.
- Standardized footer, disclaimer, and logo placement.

### v1.40.6b — Social Pack PNG Export

Completed:

- Added PNG export capability.
- Added download-ready social assets.
- Preserved brand identity and disclaimer layer.
- Removed dependency on manual screenshots.

### v1.40.6c — Social Pack Layout Redesign

Completed:

- Reduced visual clutter.
- Improved mobile readability.
- Added institutional research presentation style.
- Optimized content hierarchy.

### v1.40.6d — Social Pack Layout Safety Fix

Completed:

- Fixed footer overlap.
- Fixed oversized text.
- Added fixed safe-area layout.
- Added content compression rules.
- Improved export readiness for FB / IG / LINE.

### v1.41.0 — Daily Intelligence Content Engine Upgrade

Completed:

- Executive Summary section.
- Macro Watch.
- AI Tech Watch.
- Crypto Watch.
- Risk Regime reasoning.
- FCN Awareness.
- I-Xuan View.
- Provider Health.
- Coverage Score.
- Content Quality Score.

### v1.41.1 — Daily Brief Public Preview QA / UI Polish

Completed:

- Sanitized public Daily Brief API responses so provider diagnostics remain admin-only.
- Improved generated Daily Brief reading hierarchy after the v1.41.0 content engine upgrade.
- Made Executive Summary, Risk Regime reasoning, FCN Awareness, I-Xuan View, and public compliance boundaries easier to read.
- Confirmed public preview surfaces do not expose Provider Health, Coverage Score, Content Quality Score, or raw provider errors.

### v1.41.2 — Social Pack Renderer Hardening

Completed:

- Hardened Daily Intelligence Social Pack renderer after the v1.41.0 content engine upgrade.
- Removed clipped core headings and unreadable truncated main content from Daily Social Pack slides.
- Reserved reliable header / main / footer safe zones for exported PNGs.
- Improved Cover, Market Pulse, AI / Tech Watch, FCN / Risk Watch, and I-Xuan View social copy hierarchy.
- Preserved manual publishing, disclaimer visibility, and non-advisory positioning.

### v1.41.3 — News Provider Recovery & US Equity Coverage Expansion

Completed:

- Recovered verified public RSS providers for CNBC, CNBC Technology, Nasdaq, Seeking Alpha, The Block, and Decrypt.
- Expanded US equity, AI / semiconductor, macro / rates, crypto, and Taiwan technology supply-chain coverage.
- Added provider classification for Production Active, Recoverable, Experimental, and Deprecated states.
- Added empty-feed diagnostics so reachable providers with zero usable items are not shown as successful.
- Adjusted Coverage Score to reflect actual category/source coverage instead of synthetic provider inflation.
- Kept unstable, blocked, empty, or unverified providers disabled with explicit reasons.

### v1.42.0 — Intelligence Distribution Layer

Completed:

- Added local/session-first Distribution Preference model.
- Added Account Delivery Preferences for Daily / Weekly / Daily + Weekly frequency.
- Added Macro, AI / Tech, Crypto, Taiwan Market, FCN Awareness, and Risk Regime distribution categories.
- Enabled In-App as the only active channel while reserving LINE, Email, and Push as future disabled channels.
- Added read-only Admin Distribution Queue with Draft / Reviewed / Published foundation states.
- Added lightweight distribution viewed / published analytics event names.
- Preserved no-push, no-email, no-notification, no-marketing-automation boundaries.

### v1.42.2 — Daily Intelligence Experience Upgrade

Completed:

- Upgraded Daily Brief from summary-first news grouping into interpretation-first Market Intelligence Brief.
- Added stronger Daily reading hierarchy around 今日一句話, 今日最重要的三件事, Market Interpretation, Investor Watchpoints, and complete I-Xuan View.
- Upgraded Daily Social Pack copy from template shortening into social intelligence extraction and rewrite.
- Added guardrails against generic repeated filler, template residue, clipped English fragments, and non-advisory boundary drift.

### v1.42.3 — Market Memory Layer

Completed:

- Added lightweight Daily Intelligence memory foundation.
- Added What Changed Since Last Brief as a market continuity layer.
- Added continuity tags for Daily Brief, Social Pack, future Weekly Intelligence, and Account Intelligence reuse.
- Made I-Xuan View reflect market narrative continuity instead of single-day isolation.
- Kept memory local / editorial-first without Supabase schema changes, user-specific memory, portfolio memory, or personal recommendations.

### v1.42.4 — Social Media Optimization Layer

Completed:

- Added Social Export Format Layer.
- Added IG Feed / Carousel 4:5 format at 1080 × 1350 as the primary feed / carousel output.
- Preserved Story / Reels 9:16 format at 1080 × 1920 for LINE / Story / Reels distribution.
- Added admin format selector and export dimension mapping.
- Optimized Social Pack preview density so feed cards feel more platform-native and less like report slides.

### v1.43.0 — Intelligence Source of Truth Architecture

Completed:

- Added Daily Intelligence Core as the shared source for Daily Brief, Daily Social Pack, Weekly Aggregation, and future Account / Pro Intelligence.
- Standardized core fields: todaySignal, topThreeThings, marketInterpretation, investorWatchpoints, whatChanged, continuityTags, I-Xuan View, socialHooks, and weeklySignals.
- Made Social Pack derive hooks, market pulse, AI / Tech signal, risk / FCN awareness, and I-Xuan View from Daily / Weekly Core.
- Made Weekly Intelligence aggregate recent Daily Core signals, continuity tags, whatChanged copy, and I-Xuan View before manual review.
- Added difference-aware continuity copy when Daily themes overlap across days.

### v1.43.1 — Weekly Revision Workflow Phase 1

Completed:

- Selected Option B: revision columns / constraint change as the Weekly revision model.
- Added reviewed migration SQL plan for revision_number, parent_weekly_id, is_canonical, superseded_at, superseded_by, and revision_note.
- Added backward-compatible repository / API / admin UI support that keeps production safe when revision columns do not exist yet.
- Preserved current locked Weekly behavior until the migration is manually reviewed and applied.
- Kept public Weekly reads canonical-only when the revision schema is available, with status=published fallback before migration.

### v1.44.0 — Social Conversion Layer

Completed:

- Added social conversion fields to Daily Intelligence Core: headline, headlineHook, conversionHook, socialThesis, socialCuriosity, socialCTA, weeklyThesis, and contentFunnelTarget.
- Rewired Daily Social Pack into a funnel structure: Stop-scroll Hook, Curiosity Builder, Signal Explainer, Risk Contrast, and I-Xuan View + contextual CTA.
- Aligned public Daily title / SEO title, Daily Core headline, and Social Slide 1 hook to the same market theme.
- Preserved platform-aware IG Feed / Story export while making Social Packs a conversion entry into Daily / Weekly / Account / Future Pro.
- Kept manual publishing, no platform APIs, and non-advisory compliance boundaries.

### v1.45.0 — Periodic Intelligence Engine Correction

Completed:

- Re-centered source-of-truth architecture around News Source → IXAI Intelligence Engine → period output.
- Added a Periodic Narrative Model for Daily / Weekly with Monthly / Yearly type-level reservation.
- Corrected Weekly so weekly news intake, weekly categorization, upcoming-week calendar, and periodic narrative are the primary Weekly sources.
- Kept Daily Core as optional Weekly continuity context only.
- Reworked Weekly Social Pack as a Weekly conversion entry, not a Daily aggregation image.
- Preserved manual publishing, no platform APIs, no Supabase migration, and non-advisory compliance boundaries.

### v1.46.0 — IXAI Insight Engine Fix

Completed:

- Added the core Insight Engine layer between news intake and Daily / Weekly outputs.
- Added event extraction, signal extraction, narrative tension, change detection, I-Xuan View, and social funnel generation.
- Rewired Daily generation to use insight output for the largest event, market signal, why it matters, next watchpoint, and I-Xuan View.
- Rewired Weekly generation to use insight output from weekly news intake and upcoming events.
- Rewired Daily / Weekly Social Packs to use hook, conflict, payoff, and contextual CTA instead of summary compression.
- Preserved manual publishing, no platform APIs, no Supabase migration, and non-advisory compliance boundaries.

### v1.47.0 — Question Driven Intelligence Engine

Completed:

- Added QuestionDrivenInsight as the Daily / Weekly narrative spine.
- Daily Intelligence now starts from the market's central question, then answers with key answer, evidence, counter-evidence, watch next, and I-Xuan View.
- Weekly Intelligence now asks the week-level market question before interpreting evidence and next-week events.
- Daily / Weekly Social Packs now use question-led funnel roles rather than repeating the same summary thesis across slides.
- Preserved non-advisory, educational, risk-aware boundaries.

### v1.47.1 — Evidence Quality Sprint

Completed:

- Added event/source/whyItMatters evidence details to the question-driven insight model.
- Added evidence scoring for specificity, recency, relevance, named entities, and catalyst strength.
- Added narrative repetition detection for social slide copy.
- Rewrote Weekly Social Pack flow around What Changed This Week, The One Thing That Matters, Next Week catalysts, and I-Xuan Weekly View.
- Preserved non-advisory, educational, risk-aware boundaries.

### v1.48.0 — Weekly Persistence Fix + Social Pack Layout System

Completed:

- Added production-safe Weekly generation diagnostics for started/completed/save states, existing weekly row, revision schema availability, blocked reason, and next action.
- Kept Weekly revision migration unapplied; same-week revision creation still requires explicit migration approval when the old unique week range constraint is active.
- Added format-specific Social Pack layout rules for IG Feed / Carousel 4:5 and Story / Reels 9:16.
- Added social text compression constraints before rendering so cards avoid footer overlap, paragraph walls, repeated filler, and slide 5 text explosion.
- Preserved manual publishing only; no platform API, auto-publish, auth, LINE, LIFF, provider pipeline, or Supabase migration execution changes.

### v1.49.0 — Social Intelligence Rewrite

Completed:

- Rewrote Social Pack generation from Brief → compress → slide into slide-native social card generation.
- Daily Social Pack now follows Hook, What the market is seeing, The real risk, What to watch next, and I-Xuan View.
- Weekly Social Pack now follows Weekly question, What changed this week, The one thing that matters, Next week catalysts, and I-Xuan Weekly View.
- Preserved format-specific 4:5 / 9:16 layout constraints from v1.48.0 while increasing intentional card content density.
- Preserved manual publishing and non-advisory compliance boundaries.

### v1.50.1 — Daily / Weekly Social Pack Divergence Fix

Completed:

- Split Daily / Weekly narrative source priority at generator level.
- Ensured Daily Social Pack and Weekly Social Pack are separate period products.
- Daily Social Pack now answers what happened today, today's biggest market question, and what to watch today.
- Weekly Social Pack now answers what changed this week, what next-week catalysts matter, and whether the weekly thesis is extending, reversing, or rotating.
- Weekly Social Pack prioritizes weekly major events, upcoming events, weekly periodic narrative, and weekly-only I-Xuan View before any generic shared insight fallback.
- Added Social Pack Period Divergence QA so Daily Slide 1 / 2 / 3 / 4 / 5 and Weekly Slide 1 / 2 / 3 / 4 / 5 are manually compared after Social Pack, Daily engine, or Weekly engine changes.
- Preserved auth, LINE, LIFF, billing, portfolio, trading, platform APIs, auto publishing, and Supabase migration boundaries.

### v1.50.2 — LINE OAuth Prefetch CORS Fix

Completed:

- Fixed `/pro-preview` LINE OAuth CORS console error caused by Next.js RSC/prefetch behavior on `/api/line/login`.
- LINE OAuth entry now uses normal document navigation instead of client-side Link prefetch.
- Preserved homepage, auth main flow, LINE Login API, LIFF, and protected routes.
- Confirmed `npm run lint`, `npm run build`, mobile QA, and production route QA passed.
- Confirmed no hydration errors and no LINE OAuth CORS errors in checked routes.
- Confirmed `main` and `origin/main` synchronized at commit `385ff518f9ee57b58c1b4fbb1fc98473563201a7`.

## Current Engineering Health

- Engineering Health Score: 8.2/10.
- `npm run lint`: passed.
- `npm run build`: passed.
- 390px mobile QA: passed.
- Production route QA: passed.
- Hydration errors: none found in checked routes.
- LINE OAuth CORS: none found after v1.50.2.
- Working tree: clean at audit time.
- Git: `main` / `origin/main` synchronized.

## Next Suggested Version

`v1.66.0 — Homepage Conversion Redesign`

Goal:

- Redesign `/` as a clear Taiwan-investor conversion page.
- Explain IXAI as 一玄 AI 投資助理 within the first screen.
- Make FCN monitoring the core Pro moat.
- Preserve App / Pro / Consulting role separation.
- Keep SSO, auth, backend, Supabase, Stripe, broker integration, and content
  engine work separate.

## v1.66.0 — Homepage Conversion Redesign

Completed:

- Added `docs/HOMEPAGE_CONVERSION_REDESIGN_V166.md`.
- Reworked `/` from a technical system explanation into a conversion page
  for Taiwan investors.
- Updated the hero around 一玄 AI 投資助理, market intelligence, FCN risk,
  portfolio context, and consulting service.
- Added trust / origin, real pain points, three-layer IXAI offer, FCN moat,
  App / Pro / Consulting split, compact latest intelligence, and final CTA
  sections.
- Kept homepage language Chinese-first and reduced public-facing "engine"
  / system wording.

Out of scope:

- SSO / auth / Supabase / JWT.
- Backend / legacy Pro.
- Daily / Weekly generation.
- Provider ingestion.
- Stripe, payment, broker integration, real portfolio / FCN data, trading,
  or investment advice.

## v1.65.0 — Pro Module Product Pages Redesign

Completed:

- Added `docs/PRO_MODULE_PAGES_REDESIGN_V165.md`.
- Reworked `/pro` as a conversion page for IXAI Pro with hero, pain points,
  FCN-first Pro modules, App-vs-Pro explanation, and Pro / consulting CTAs.
- Reworked `/portfolio` as a Portfolio Analysis value page explaining asset
  allocation, concentration, theme exposure, FCN overlap, and market-risk
  linkage.
- Reworked `/risk` as a Risk Center value page explaining market regime,
  major events, concentration, FCN risk, scenarios, and AI risk summaries.
- Kept `/fcn` as an education and conversion page; FCN Monitoring remains
  a Pro capability.
- Continued using `components/ui/feature-icon.tsx` for card icons.

Out of scope:

- SSO / auth / Supabase / JWT.
- Backend / legacy Pro.
- Daily / Weekly generation.
- Provider ingestion.
- Stripe, payment, broker integration, real portfolio / FCN data, trading,
  or investment advice.

## v1.64.2 — Shared Icon System + Visual Screenshot QA

Completed:

- Added `components/ui/feature-icon.tsx` — single shared primitive for
  any feature/card/badge icon on light surfaces. Codifies the Icon
  Contrast Rule in code: forest container, gold/cream glyph, visible
  border, minimum 36×36 (or 32×32 for sm size).
- Migrated /portfolio, /risk, /account, /pro consumers off
  inline-styled `<span>` icon containers onto `<FeatureIcon>`.
- Added `scripts/qa-visual.mjs` + `npm run qa:visual` — Playwright-
  driven screenshot QA for /pro /account /portfolio /risk at 390×844.
- Gitignored `/tmp` so visual QA artefacts stay local.

Out of Scope (unchanged):

- Daily / Weekly content surfaces.
- Public Intelligence Engine consumers.
- FCN education page.
- Pro copy, Account layout.
- SSO, auth, Supabase, backend, content engine, providers.
- Pale-icon containers in home component children and on /about,
  /feedback (deferred to a future design-system pass).

## v1.64.1 — Visual QA Fix

Completed:

- Removed `<PublicIntelligenceEngine>` block from `/daily-brief`,
  `/daily-brief/[slug]`, `/weekly-brief/[slug]`, and the local detail
  component. Block remains on the homepage and `/share` surfaces.
- Fixed low-contrast icons on `/portfolio` and `/risk` via the shared
  `LockedFeatureCard` and `FeatureGatedPage` components — replaced
  pale-gold-on-cream containers with the forest+gold pattern, and
  swapped off-token emerald / amber utility classes for
  `color-mix(in srgb, var(--ixai-risk-*), ...)` IXAI tokens.
- Fixed low-contrast icons on `/account` (WatchlistIntelligenceLite
  card icon + disclaimer aside icon + feedback button leading glyphs).
- Verified `/pro` CTA text visibility: already token-driven (cream-
  on-forest and forest-on-cream), no change needed.
- Codified the Icon Contrast Rule and the Public Intelligence Engine
  Placement Rule in `docs/PROJECT_RULES.md`.

Out of Scope (unchanged):

- SSO, auth, Supabase, backend, content engine, providers, payment.
- Account / homepage rebalance (still deferred to v1.65).
- Full design-system pale-icon pass across `/`, `/about`, `/feedback`,
  and home component children (deferred to v1.65+).

## v1.64.0 — App UX / FCN Education / Pro Conversion Redesign

Completed:

- Added `docs/APP_UX_REDESIGN_V164.md` planning document.
- Rebuilt `/fcn` as education + conversion (added high-net-worth pillar,
  worked example, manual-pain block, expanded Pro FCN moat list, consulting
  CTA, compliance footer).
- Rebuilt `/pro` with a marketing prelude (hero, pain points, FCN-primary
  module hierarchy, consulting CTA) wrapping the existing workspace hub.
- FCN module gets primary / wider visual treatment inside the workspace hub.
- Added App / Pro / 顧問服務 tri-fold line to the homepage hero.
- Daily / Weekly / Account already in v1.63.1 shape; no changes in this cut.

Out of Scope (deferred):

- Account information-architecture rebalance.
- Full homepage rewrite.
- SSO, auth, backend, Supabase, content engine, providers, payment.

## v1.62.0 — Content Intelligence Foundation

Why:

- v1.62 SSO implementation was paused because Daily / Weekly / Social Pack
  quality had a more immediate root-cause issue.
- Production review found 2026-06-02 and expected 2026-06-03 Daily Brief /
  Social Pack narratives could appear nearly identical.
- The root-cause audit found that production did not expose a public
  `daily-intelligence-2026-06-03` brief and that the 2026-06-02 public title
  was driven by `questionDriven.centralQuestion`, not the generated provider
  headline.
- The content engine still has deterministic AI + macro narrative rules that
  can repeat the same title, key answer, and I-Xuan View across adjacent dates.

Completed:

- Added `docs/DAILY_BRIEF_ROOT_CAUSE_ANALYSIS.md`.
- Added `docs/CONTENT_ENGINE_V162_PLAN.md`.
- Added `docs/CONTENT_ENGINE_ARCHITECTURE.md`.
- Added `docs/PROVIDER_HEALTH_REVIEW.md`.
- Documented current Daily Brief, Daily Social Pack, Weekly Intelligence,
  Weekly Social Pack, and Provider Health flows.
- Documented root-cause matrix, Narrative Diversification design, Daily /
  Social separation, Weekly / Daily separation, Asia/Taipei product-date key
  design, regression test plan, v1.62.1 implementation scope, and rollback plan.

Provider decisions:

- App Daily `Yahoo Finance` RSS remains disabled because repeated intake checks
  hit 429 / rate-limit responses.
- App Daily `Bloomberg` remains disabled because stable public RSS access and
  terms are not verified.
- App market quote Yahoo chart API and backend / legacy yfinance paths are
  separate from App Daily news intake and must not be treated as the same
  provider pipeline.

## v1.62.1 — Content Engine Rewrite Implementation

Completed:

- Removed the fixed AI + Macro Daily question / answer / I-Xuan View branch.
- Added event-sensitive Daily AI + Macro question, answer, and I-Xuan View
  construction using dominant event, secondary macro/risk context, and source
  evidence.
- Added 7-day Daily title uniqueness guard for draft/review/published Daily
  titles.
- Decoupled Daily Social Pack Slide 1 and Slide 5 from direct Daily
  `questionDriven` reuse by introducing social-native title and I-Xuan helpers.
- Strengthened Weekly summary / suggestion priority around weekly periodic
  narrative instead of shared question-driven thesis.
- Added Asia/Taipei product-date helpers for Daily scheduler date key and
  generated Daily slug.
- Added provider disabled `reasonCode` visibility for Yahoo Finance,
  Bloomberg, and other disabled provider slots.
- Added `scripts/test-content-engine-v162.mjs` regression checks.
- Added `docs/CONTENT_ENGINE_REWRITE_V162.md`.

Still required:

- Real output QA for adjacent Daily Briefs, Daily Social Packs, Weekly
  Intelligence, and Weekly Social Packs.
- Production Admin Provider Health visual verification.
- No provider activation until source stability / policy review is complete.

## v1.63.0 — Taiwan User UX Cleanup

Completed:

- Localized normal user-facing routes toward Traditional Chinese copy.
- Simplified `/account` hero and Pro entry language.
- Replaced engineering labels such as Backend, Account Link, Membership,
  Entitlement, Feature Gate, Beta Enabled, and Reserved for Pro with
  user-facing labels such as 系統連線, 帳號綁定, 會員方案, 功能權限, 測試可用, and
  Pro 保留功能.
- Updated `/pro` to explain IXAI Pro in short Chinese copy while preserving the
  existing Pro Lab bridge.
- Updated `/portfolio`, `/fcn`, and `/risk` to present 投資組合分析, FCN 監控,
  and 風險中心 as clear Pro modules rather than engineering skeletons.
- Updated `/daily-brief` and `/weekly-brief` public labels to 每日晨報 and
  每週情報.
- Added `docs/TAIWAN_USER_UX_CLEANUP_V163.md`.
- Updated mobile QA route expectations for the localized copy.

Out of scope:

- SSO / auth changes.
- Daily / Weekly generation engine.
- Provider logic.
- Backend / legacy Pro changes.
- Stripe, portfolio data, FCN data, or investment advice.

## v1.63.1 — UX Product Role Correction

Completed:

- Added `docs/UX_PRODUCT_ROLE_CORRECTION_V1631.md`.
- Repositioned `/fcn` as an FCN education and introduction page.
- Clarified that FCN Monitoring belongs to IXAI Pro because it can imply
  personal structured-product risk conclusions.
- Simplified Daily / Weekly archive pages so users see reading entry points
  instead of product architecture cards.
- Strengthened `/pro` icon / CTA contrast rules.
- Simplified `/account` around account status, Pro connection, membership plan,
  and feature access.

Out of scope:

- SSO / auth changes.
- Daily / Weekly content generation engine.
- Provider logic.
- Backend / legacy Pro changes.
- Stripe, broker integration, real portfolio / FCN data, trading, or
  investment advice.

Out of Scope:

- Code changes.
- `build-insight.ts` changes.
- Social Pack generator changes.
- Weekly generator changes.
- Scheduler changes.
- Publish flow changes.
- Auth / SSO changes.
- Provider activation.
- Supabase schema changes.

## v1.59.0 — Real Pro Bridge + Icon Cleanup

Why:

- v1.58 opened in-app Pro workspace skeletons, but users still expect the
  existing IXAI Pro Lab to be reachable as the recognizable Pro surface.
- The App and legacy Pro Lab do not yet share login / SSO, so Pro CTAs must not
  imply that App credentials work in the legacy lab.
- Several Pro icons and CTA treatments were too low-contrast for the forest /
  cream / gold design system.

What Changed:

- `/account` Pro CTA now clearly opens the existing IXAI Pro Lab as a separate
  preview environment.
- `/pro` is split into two explicit paths: existing IXAI Pro Lab and the new
  in-app beta workspace.
- Legacy Pro Lab login now explains that App shared login is still being
  connected and beta testers should use assigned Pro Lab credentials.
- Pro icons, badges, and CTA labels now use clearer contrast and visible text.

Out of Scope:

- True SSO between Supabase App auth and legacy Pro JWT auth.
- Stripe, billing, broker API, real Portfolio / FCN data, trading execution, or
  investment advice.
- Continue Social Pack Period Divergence QA after Daily / Weekly engine changes.
- Keep changes small, verifiable, and non-architectural unless explicitly approved.

## v1.60.0 — Unified Login Foundation

Why:

- v1.59 clarified that the existing IXAI Pro Lab is still a separate preview
  environment, but true App → Pro shared login is not implemented.
- IXAI needs a documented identity architecture before any SSO prototype changes
  production auth surfaces.

What Changed:

- Added `docs/SSO_FOUNDATION_PLAN.md`.
- Audited the Production App, Legacy Pro, and Backend identity models.
- Documented current Supabase App auth, legacy FastAPI JWT auth, backend
  account-link, membership, and entitlement trust boundaries.
- Compared Unified Supabase Auth, JWT Exchange Bridge, and custom SSO server
  options.
- Recommended Supabase Auth as the single identity source whenever practical.
- Added phased SSO migration plan: audit, prototype, beta users, production
  rollout, legacy login retirement.

Out of Scope:

- Enabling SSO in production.
- Changing App login, Legacy Pro login, or backend auth behavior.
- Stripe, billing, broker integration, portfolio engines, trading features, or
  investment advice.

## v1.61.0 — SSO Prototype & Implementation Readiness

Why:

- v1.60 defined the identity foundation, but the team still needed exact
  prototype flows, rollback paths, security requirements, and phase estimates
  before changing login behavior.

What Changed:

- Added `docs/SSO_IMPLEMENTATION_PLAN.md`.
- Documented deep auth audit details for App, Legacy Pro, and Backend:
  session lifecycle, JWT usage, refresh behavior, account-link, membership,
  entitlement, and protected-route behavior.
- Produced current and target identity sequence diagrams.
- Compared Unified Supabase Auth, JWT Exchange Bridge, and custom SSO server
  with security, complexity, migration, rollback, and maintenance tradeoffs.
- Recommended Option A Unified Supabase Auth as the target, with Option B JWT
  Exchange Bridge only as a transitional fallback.
- Defined technical prototype specs for login, logout, expiration, refresh,
  failure recovery, CSRF, XSS, replay, token leakage, and session fixation.
- Mapped v1.62–v1.66 rollout: SSO bridge prototype, silent login, Pro dashboard
  auto-auth, duplicate login removal, and full unified identity.

Out of Scope:

- Production SSO.
- Production login behavior changes.
- JWT issuance changes.
- Supabase config changes.
- Deployment.
- UI redesign.
- Stripe, broker integration, portfolio engines, or trading features.

## v1.61.1 — SSO Design Review

Why:

- v1.60 and v1.61 recommended Unified Supabase Auth, but IXAI needed to verify
  whether Legacy Pro can realistically adopt that architecture before any auth
  code is changed.

Completed:

- Reviewed App, Legacy Pro, and Backend auth implementation boundaries.
- Confirmed GO with constraints for Unified Supabase Auth as the target
  architecture.
- Confirmed Legacy Pro can migrate toward Supabase Auth, but only by changing
  session source, protected route behavior, API Authorization headers, and
  backend token validation together.
- Added exact expected file changes in `docs/SSO_FILE_CHANGESET.md`.
- Added v1.62-v1.66 implementation blueprint in
  `docs/SSO_PROTOTYPE_BLUEPRINT.md`.
- Added SSO risk and mitigation review in `docs/SSO_SECURITY_REVIEW.md`.

Deferred SSO code version:

- `SSO Launch Endpoint Prototype` is deferred until after the v1.62 Content
  Engine root-cause work. The next implementation version is now
  `v1.62.1 — Content Engine Implementation`.

Still not included:

- Production SSO.
- Supabase configuration changes.
- JWT issuance changes.
- Legacy login removal.
- UI redesign.
- Stripe, broker integration, portfolio engines, or trading features.

## Future Roadmap

### v1.51.0 — IXAI App ↔ IXAI Pro Integration Foundation

Completed / in progress:

- Project map finalized across production app, legacy Pro dashboard prototype, backend, and brand side project.
- Added `docs/PRO_INTEGRATION_PLAN.md`.
- Added backend health proxy foundation at `/api/backend/health`.
- Added Pro external dashboard link to the production app flow.
- Added Account Pro integration status surface with backend connection status.
- Preserved Supabase auth, LINE, LIFF, backend code, legacy frontend code, Daily / Weekly generation, and admin workflows.

Goal:

- Make the production IXAI App aware of the IXAI Pro Lab and backend without migrating the legacy frontend.
- Establish the first server-side backend connection from app.ixuan.ai.
- Prepare future Supabase user → backend account bridge.

### v1.51.1 — App User → Pro Access Identity Bridge

Completed / in progress:

- Added Pro access decision layer for production App users.
- Added `/api/pro/access`.
- Defined Pro states: `not_connected`, `connected`, `preview`, `active`, `expired`, and `revoked`.
- Account page now shows Pro access status without unlocking paid capabilities.
- Pro / Pro Preview now explain that access is account-based but entitlement-controlled.
- Future billing / entitlement model documented without Stripe integration.

Goal:

- Let App users connect a Pro identity without automatically granting paid Pro entitlement.
- Preserve future Stripe / subscription / manual approval control.
- Keep Portfolio / FCN / risk intelligence closed until active entitlement and backend account mapping are approved.

### v1.51.2 — Supabase User → Backend Account Link

Completed / in progress:

- Clarified that App users live in Supabase while legacy Pro Lab users live in the FastAPI JWT backend user table.
- Updated `/account` Pro Lab copy so users do not assume App credentials can log into the legacy Pro Lab.
- Reframed Pro Lab as a separate preview environment, not the long-term primary Pro entry point.
- Documented backend account-link contract options.

Goal:

- Make App the primary login surface.
- Design the Supabase user → backend account bridge before real portfolio / FCN data is exposed.
- Keep browser clients away from protected FastAPI endpoints.
- Preserve entitlement control: signup creates identity, not paid Pro access.

### v1.52.0 — Supabase User → Backend Account Link Foundation

Completed / in progress:

- Audited `backend/ixai_agent` and confirmed it does not yet expose Supabase external-user account-link fields or endpoints.
- Added production-app `POST /api/pro/account-link` as a server-side-only create-or-find contract boundary.
- Extended `/api/pro/access` with accountLink status:
  - `not_started`
  - `linked`
  - `backend_not_configured`
  - `backend_contract_missing`
  - `error`
- Added `/account` Account Link Status and `Connect Pro Account` action.
- Kept Portfolio / FCN disabled until backend entitlement and account mapping are complete.

Goal:

- Establish the first minimal App user → backend account-link flow without changing backend code.
- Keep account linking separate from paid Pro entitlement.
- Prepare backend implementation for `POST /api/v1/integrations/supabase/account-link`.

Constraints:

- No backend code changes.
- No legacy frontend changes.
- No Supabase schema changes.
- No Stripe, billing UI, portfolio data, FCN data, direct browser-to-FastAPI protected calls, or Pro auto-entitlement.

### v1.53.1 — Account Link End-to-End Verification

Completed / in progress:

- Verified backend health locally with the v1.53 account-link endpoint.
- Verified direct backend account-link idempotency:
  - first request creates backend account link
  - repeated request returns existing link
  - default `pro_access_status` remains `connected`
- Verified frontend backend health proxy can reach local backend through development fallback.
- Verified frontend production server smoke test can reach local backend with `IXAI_BACKEND_URL` configured.
- Verified unauthenticated frontend `/api/pro/account-link` remains closed with `401 not_authenticated`.

Known blocker:

- Full authenticated App → Next API → Backend account-link verification requires a valid Supabase browser session / access token.
- Do not weaken auth, add auth bypass, or expose backend protected routes directly to the browser.

Next:

- Test `/account` `Connect Pro Account` with a real Supabase session.
- Configure `IXAI_BACKEND_URL` in the frontend runtime for non-fallback backend health.
- After authenticated link passes, evaluate the first read-only Pro summary proxy.

### v1.54 — Real Account Linking Verification

Completed / in progress:

- Verified backend account-link endpoint against a clean temporary E2E database.
- Verified backend idempotency and default `connected` Pro access state.
- Verified frontend backend health with `IXAI_BACKEND_URL` configured.
- Verified unauthenticated frontend account-link remains closed with `401 not_authenticated`.

Blocked:

- Full `/account` button-click E2E requires a valid Supabase authenticated browser session.
- Local and production account checks did not have an authenticated session available.

Next:

- Perform authenticated `/account` Connect Pro Account test with a real App user.
- If successful, update Account Link Status to `Linked` and then consider v1.55 Account Portfolio Summary Preview.

### v1.54.1 — Real Supabase Session Button Test

Completed / in progress:

- Rebuilt a clean backend E2E database at `/tmp/ixai_v1541_e2e.db`.
- Verified backend health / readiness.
- Verified frontend health proxy with `IXAI_BACKEND_URL` configured.
- Verified unauthenticated `/api/pro/account-link` remains closed with `401 not_authenticated`.

Blocked:

- No authenticated Supabase browser session was available locally or in production.
- `/account` showed the App entry shell, so the `Connect Pro Account` button was not reachable.

Next:

- Obtain a real App user session and run the button-click test.
- After `accountLink.status = linked` is verified, proceed toward v1.55 Account Portfolio Summary Preview.

### v1.54.2 — Auth Session Recovery / Debug

Completed / in progress:

- Added safe `/api/auth/session-debug` diagnostics for Supabase Bearer, lightweight server cookie, and cookie-presence state.
- Confirmed the production app has two identity layers:
  - Supabase browser session in client storage for App login.
  - Lightweight `ixai_identity` server cookie for legacy identity continuity.
- Confirmed backend account linking must use Supabase identity because it needs the Supabase user id.
- Verified unauthenticated local debug state reports `source: none`.
- Verified lightweight identity cookie debug state reports `source: server-cookie` and no Supabase user id.

Current blocker:

- Next API routes cannot read Supabase `sessionStorage`; the client must provide a valid Bearer token for account linking unless a future server-cookie Supabase session strategy is adopted.
- The lightweight identity cookie cannot safely create backend account links because it lacks Supabase user id.

Next:

- Use `/api/auth/session-debug` before and after login to confirm whether the browser has a valid Supabase Bearer token.
- If a real logged-in session is available, retry `/account` `Connect Pro Account`.
- If Bearer is missing despite authenticated UI, patch the client button/token retrieval path rather than weakening server auth.

### v1.54.3 — Supabase Bearer Token Client Bridge

Completed / in progress:

- Made the browser Supabase session → Bearer header bridge explicit through `getSupabaseAuthorizationHeaders()`.
- Reused the same Bearer bridge for `/api/pro/access` and `/api/pro/account-link`.
- Kept `/api/pro/account-link` closed to anonymous and lightweight identity-only requests.

Expected authenticated flow:

```text
Supabase browser session
→ access_token
→ Authorization: Bearer
→ /api/pro/account-link
→ backend account-link
→ Account Link Status: Linked
```

Next:

- Run the button test with a real logged-in Supabase App user.
- Confirm `/api/auth/session-debug` reports `source: bearer`.
- Confirm backend account link is created / found and paid Pro access remains entitlement-gated.

### v1.55.0 — Membership Foundation

Completed / in progress:

- Added the backend membership / entitlement foundation for linked IXAI App accounts.
- Added `subscriptions` and `entitlements` as the minimal backend model for
  future Free / Personal / Pro / Enterprise access.
- Linked backend accounts default to Free membership.
- Free entitlements enable Daily Brief, Weekly Brief, and Watchlist only.
- Portfolio, FCN Monitoring, Risk Engine, AI Copilot, and Pro Preview remain locked by default.
- Added production-app `/api/pro/membership` as a sanitized Next API proxy.
- Added `/account` membership and entitlement display without enabling paid Pro features.

Goal:

- Make the same App identity capable of carrying future Pro membership state.
- Keep account linking separate from paid entitlement.
- Prepare for future manual approval, Stripe, and Pro subscription logic without
  adding payment UI in this version.

Out of scope:

- Stripe.
- Payment UI.
- Portfolio / FCN real data.
- LINE Login changes.
- Daily / Weekly / Admin workflow changes.
- Legacy frontend changes.

Next:

- Apply backend membership migration through a protected migration workflow.
- Verify `/api/pro/membership` against production backend after migration.
- Prepare v1.56 read-only Portfolio Summary Preview only after membership state is stable.

### v1.56.0 — Unified Identity Foundation

Completed / in progress:

- Added backend `GET /api/v1/entitlements/me`.
- Added production-app `GET /api/pro/entitlements` as a sanitized Next API proxy.
- Added feature gate helpers for Portfolio, FCN Monitoring, and Risk Engine.
- Added a compact Membership badge on the Account Pro card.
- Kept Free accounts enabled for Daily Brief, Weekly Brief, and Watchlist.
- Kept Portfolio, FCN Monitoring, Risk Engine, and AI Copilot locked.

Goal:

- Establish the SaaS permission layer that lets one App identity carry future
  Free / Personal / Pro / Enterprise access decisions.
- Keep Membership as identity / plan state and Entitlements as feature access.

Still not included:

- Stripe.
- Billing.
- Portfolio Center.
- FCN Center.
- Risk Engine UI.
- AI Copilot.
- Broker or real portfolio data.

### v1.56.1 — Feature Gate UI

Completed:

- Added visible Account UI cards for Portfolio Intelligence, FCN Monitoring,
  and Risk Engine feature gates.
- Reused the v1.56 entitlement helpers:
  `canAccessPortfolio()`, `canAccessFCN()`, and `canAccessRiskEngine()`.
- Kept Free accounts in the expected locked state for Portfolio, FCN
  Monitoring, and Risk Engine.
- Added clear "Reserved for Pro" / "Upgrade path coming soon" messaging without
  payment flow or Stripe integration.

Still not included:

- Stripe.
- Billing or upgrade checkout.
- Real Portfolio Center data.
- Real FCN Monitoring data.
- Risk Engine workflow UI.
- Broker integrations.

### v1.57.0 — Pro Connection Completion

Completed:

- Added feature-gated route skeletons for `/portfolio`, `/fcn`, and `/risk`.
- Connected those route entrances to the same App membership / entitlement
  state used by `/account`.
- Kept Free accounts in a `Reserved for Pro` state for Portfolio Intelligence,
  FCN Monitoring, and Risk Engine.
- Updated Pro entry surfaces so Pro modules reflect the same entitlement
  decision rather than a separate Pro Lab-only state.

Backend counterpart:

- Added an internal manual entitlement test mechanism in the backend so IXAI can
  verify Pro unlock behavior before Stripe.

Still not included:

- Stripe.
- Billing or payment UI.
- Broker API.
- Real Portfolio / FCN data.
- Legacy Pro frontend migration.

### v1.58.0 — Unified Pro Product Integration

Completed:

- Added Beta Open Access policy for authenticated and account-linked users.
- Kept membership / entitlement architecture intact while adding a temporary
  beta override for Portfolio, FCN Monitoring, and Risk Engine.
- Replaced `/pro` marketing preview with an in-app Unified Pro Workspace hub.
- Let `/portfolio`, `/fcn`, and `/risk` render beta workspace skeletons for
  linked users.
- Changed Account Pro CTA toward `/pro` instead of legacy Pro Lab login.
- Downgraded Legacy Pro Lab to reference-only status.

Important boundaries:

- Beta Open Access is temporary testing access, not permanent free Pro.
- No Stripe or billing.
- No broker connection.
- No real Portfolio / FCN data.
- No trading execution.
- No investment advice.

### v1.51.x — Backend Integration Boundary Strategy

Goal:

- Do not migrate the legacy `frontend/ixai-website-clean` project wholesale.
- Build a backend integration boundary in the active production frontend first.
- Add a backend health proxy / readiness check before exposing portfolio workflows in production UI.
- Define Supabase user → backend account mapping before moving protected portfolio or FCN data into `/account` or future Pro surfaces.
- Migrate reusable Pro dashboard widgets only after the identity and backend boundary are clear.

Recommended sequence:

```text
Document legacy frontend role
→ Backend health proxy
→ Supabase user to backend account-link route
→ Backend implements trusted account-link contract
→ Account / Pro backend data boundary
→ Small reusable widget migration
```

High-value reusable assets from `frontend/ixai-website-clean`:

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

Do not directly migrate:

- Legacy JWT login.
- `localStorage` token auth.
- Direct browser-to-FastAPI protected requests.
- Whole legacy `AppShell` navigation.
- Terminal-heavy visual style.

### v1.43.2 — Weekly Revision Migration Review / Rollout

Goal:

- Review and apply the Weekly revision migration only after backup and approval.
- Verify that same-week canonical published weekly + revision draft can coexist.
- Verify revision publish promotion, previous canonical archival, and canonical public reads.
- Do not auto-overwrite published Weekly Intelligence or change public URL behavior without review.

### v1.40.7 — Publish Center Foundation

Goal:

- Prepare approved Social Packs for publication workflow.
- Create approval-ready publishing queue.
- Keep human approval before publishing.
- Do not auto-publish.

### Portfolio Intelligence

Goal:

- Reintroduce the depth of the early personal monitoring workflows in a compliant product layer.
- Use onboarding, watchlist memory, and future durable preferences to organize portfolio relevance.
- Keep the first version informational, risk-aware, and non-advisory.
- Do not implement broker integration, automatic trading, individual execution instructions, or performance promises.

Mobile QA should remain part of done criteria for Account and Pro surfaces before portfolio expansion.

### v1.42 — AI Alert Engine

Goal:

- Design event-driven alert architecture.
- Separate public alerts from Pro personalized alerts.
- Require user opt-in and safe delivery controls.
- Treat FCN / Crypto / Portfolio alerts as risk-awareness monitoring, not trade instructions.

### Dynamic Intelligence Provider Integration

Goal:

- Connect foundation-level public modules to approved provider data.
- Preserve Public / Account / Pro separation.

### Durable Preference Persistence

Goal:

- Move local/session-first preferences to durable persistence only after explicit approval.
- Include auditability, opt-in records, pause/unsubscribe state, and delivery logs.

## Do Not Touch Without Explicit Approval

- LINE Login architecture.
- LIFF architecture.
- Auth architecture.
- Lightweight identity session cookie model.
- FCN engine and calculations.
- Market provider layer.
- News provider / RSS ingestion core.
- Supabase core auth.
- Supabase schema.
- Analytics core schema.
- Editorial publish / review workflow.
- Admin route protection.

## Current Strategic Focus

IXAI is in seed-user acquisition mode.

Focus:

- Public intelligence quality.
- Daily and weekly reading habit.
- LINE and social distribution.
- Onboarding conversion.
- Account intelligence continuity.

Not focus:

- Paid ads.
- Aggressive monetization.
- Stripe checkout.
- Portfolio execution.
- Buy/sell signal products.

## V11 Database Cutover Program

Status:

- V11.10 Database Activation Foundation: merged.
- V11.20 Controlled Write Activation: active in `feature/v11-database-cutover`.
- V11.30 Remote Migration Readiness: active in `feature/v11-database-cutover`.
- V11.40 Production-Safe Manual Migration Split: active in `feature/v11-database-cutover`.
- V11.51 Index Compatibility Fix: active in `feature/v11-index-compatibility-fix`.

Direction:

- Move from database diagnostics toward guarded database cutover.
- Keep database writes disabled by default unless global and module-level guards are explicitly enabled.
- Keep Truth Layer, localStorage, FCN Draft Store, and deterministic fallback behavior active.
- Require manual migration review before any remote Supabase execution.
- Use the V11.40 manual split for production review: create tables, add nullable columns, create indexes concurrently, enable RLS, then validate.
- Use V11.51 `03b_create_indexes_sql_editor_compatible.sql` only when Supabase SQL Editor transaction wrapping blocks concurrent index creation.

Out of scope:

- Remote migration execution from the app.
- Blind execution of the original monolithic V11.10 migration against production.
- Running non-concurrent index creation during a high-traffic window.
- Auth redirect or onboarding changes.
- RLS policy changes outside reviewed migration work.
- Binance / Yahoo Finance integration.
- Broker sync, trading logic, order execution, or AI recommendations.

## V12 Workspace Database Write Activation

Status:

- V11.51 Index Compatibility Fix: completed / merged into main.
- V12.00 Workspace Database Write Activation: active in `feature/v12-workspace-database-write-activation`.

Direction:

- Start the first guarded database-backed write flow.
- Keep Watchlist and Alert History as the only V12 write candidates.
- Keep Portfolio and FCN writes disabled/readiness-only.
- Preserve database-first reads, Truth Layer fallback, localStorage fallback, and FCN Draft Store fallback.
- Surface V12 write guard, workspace bootstrap, and fallback metadata in Home, Settings, Database Activation Status, Platform Cutover Status, Workspace Graph, and Integration Audit.

Out of scope:

- Remote migration execution.
- Schema or RLS changes.
- Auth redirect / onboarding changes.
- Portfolio / FCN write cutover.
- Binance / Yahoo Finance integration.
- Broker sync, trading logic, order execution, or AI recommendations.

## V13 Portfolio Database Write Activation

Status:

- V12 Workspace Database Write Activation: completed / merged into main.
- V13.00 Portfolio Database Write Activation: completed / merged into main.
- V14.00 FCN Database Activation: active in `feature/v14-fcn-database-activation`.

Direction:

- Start guarded Portfolio / Stock / Crypto database write activation.
- Keep Stock and Crypto input submit local-first: Input Truth Bridge and recent input fallback are written before any database attempt.
- Require V12 global write cutover guard plus V13 module guard before database writes are attempted.
- Keep FCN writes explicitly disabled and defer FCN Wizard database write activation to V14.
- Preserve database-first readback, Truth Layer fallback, and localStorage fallback.

Out of scope:

- FCN database write activation.
- Migration execution, schema changes, RLS changes, or auth behavior changes.
- Broker sync, Binance/Yahoo provider work, trading logic, order execution, or AI recommendations.

## V14 FCN Database Activation

Status:

- V13 Portfolio Database Write Activation: completed / merged into main.
- V14.00 FCN Database Activation: completed / merged into main.
- V15.00 Legacy Risk Engine Migration: active in `feature/v15-legacy-risk-engine-migration`.

Direction:

- Start guarded FCN database write activation after explicit FCN Wizard submit.
- Keep FCN Wizard local-first: FCN Draft Store, Input Truth Bridge, and recent input fallback are written before any database attempt.
- Require V12 global write guard plus V14 FCN, position, underlying, and schedule module guards before database writes are attempted.
- Preserve database-first `/api/fcn` readback, Truth Layer fallback, FCN Draft Store fallback, and legacy recent input fallback.
- Surface V14 guard metadata in Home, Settings, Database Activation Status, Platform Cutover Status, Workspace Graph, and Integration Audit.

Out of scope:

- Migration execution, schema changes, RLS changes, or auth behavior changes.
- FCN pricing engine, edit/delete, destructive sync, or automatic reconciliation writes.
- Broker sync, Binance/Yahoo provider work, trading logic, order execution, or AI recommendations.
- Removing FCN Draft Store, Truth Layer, `/api/fcn`, or local fallback behavior.

## V15 Legacy Risk Engine Migration

Status:

- V14 FCN Database Activation: completed / merged into main.
- V15.00 Legacy Risk Engine Migration: completed / merged into main.
- V16.00 Morning Brief Engine Migration: active in `feature/v16-morning-brief-engine`.

Direction:

- Migrate legacy risk concepts as pure, read-only calculations.
- Add Portfolio risk, FCN worst-of / KI / strike / KO readback, concentration, and exposure summaries.
- Surface V15 diagnostics in Risk Center, Home, Settings, Workspace Graph, and Integration Audit.
- Preserve Portfolio Truth, FCN Draft Store, `/api/fcn`, and local fallback behavior.

Out of scope:

- Database writes, migration execution, schema/RLS/auth changes, broker sync, Binance/Yahoo integration, trading logic, order execution, AI recommendations, Morning Brief migration, or FCN pricing engine.

Next:

- V16 Morning Brief Engine Migration.

## V16 Morning Brief Engine Migration

Status:

- V15 Legacy Risk Engine Migration: completed / merged into main.
- V16.00 Morning Brief Engine Migration: active in `feature/v16-morning-brief-engine`.

Direction:

- Build the Morning Brief Engine core as a read-only adapter layer.
- Reuse V15 Legacy Risk Engine for risk and FCN summaries.
- Add Portfolio, Risk, FCN, and News Placeholder sections.
- Add reusable Morning Snapshot for Workspace Home and future Web / Telegram / API surfaces.
- Surface V16 diagnostics in Home, Settings, Workspace Graph, and Integration Audit.

Out of scope:

- Database writes, SQL, migrations, scheduler, Telegram bot, Yahoo, Binance, OpenAI/AI calls, broker sync, trading, order execution, or recommendation logic.

Next:

- Program A: V17 Market Data Provider Foundation, V18 Morning Brief Live Data Readiness, V19 Intelligence Center v2 Foundation, and V20 SaaS Foundation Readiness.

## Program A: V17-V20 Product Layer Acceleration

Status:

- V16 Morning Brief Engine Migration: completed / merged into main.
- Program A V17-V20 Product Layer Acceleration: active in `feature/program-a-v17-v20-product-layer`.

Direction:

- Add read-only product-layer foundations for market data contracts, Morning Brief live-data readiness, Intelligence v2, and SaaS readiness.
- Keep all external providers disabled.
- Surface Program A diagnostics in Workspace Home, Settings, Workspace Graph, and Integration Audit.

Out of scope:

- Database writes, Supabase mutations, SQL, migrations, schema/RLS/auth/membership changes.
- Yahoo, Binance, broker, Telegram, scheduler, external news, OpenAI, AI recommendations, trading, order execution, buy/sell/rebalance instructions, billing provider, or subscription enforcement.

Next:

- Program B: provider/broker readiness decisions, controlled live integrations, portfolio sync, and advanced risk automation after separate review.

## Program B: V21-V24 Live Platform Readiness

Status:

- Program A V17-V20 Product Layer Acceleration: completed / merged into main.
- Program B V21-V24 Live Platform Readiness: active in `feature/program-b-live-platform`.

Direction:

- Add live provider readiness contracts, future quote/valuation snapshot contracts, broker interface readiness, and risk automation readiness.
- Keep Yahoo, Binance, Futu, IBKR, broker live API, external fetch, scheduler, notification sender, AI provider, and trading disabled.
- Surface Program B diagnostics in Workspace Home, Settings, Workspace Graph, and Integration Audit.

Out of scope:

- DB writes, Supabase mutations, SQL, migrations, schema/RLS/auth/membership changes.
- External fetch, Yahoo/Binance/Futu/IBKR live APIs, broker sync, Telegram, scheduler/cron, notification sender, OpenAI/LLM, AI recommendations, trading, order execution, buy/sell/rebalance/action instructions, billing provider, or entitlement enforcement.

Next:

- Program C: Live Data Integration, Intelligence Automation, and Notification Delivery after explicit safety review.
