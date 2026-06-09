# IXAI Version History

This document is a concise continuity layer for AI handoff. It captures why each recent version existed, what changed, key decisions, and what stayed out of scope.

## Historical Context

- `docs/AI_MORNING_BRIEF_HISTORY.md`: detailed pre-app history of the Telegram Morning Brief, FCN risk monitor, Binance Grid / Dual monitoring, IXAI Agent, and Public App evolution.

## v1.83 — FCN Risk Engine

Why:

- v1.82.1 established Worst-of readback from stored FCN underlyings.
- IXAI needed the first portfolio-level FCN risk aggregation before expanding into SaaS gating or broader Portfolio Intelligence.

What Changed:

- Added `src/lib/fcn/risk-score.ts`.
- Added KI distance calculation.
- Added risk level calculation.
- Added portfolio risk score calculation.
- Added FCN concentration exposure aggregation.
- Added FCN Worst-of ranking aggregation.
- Added additive dashboard fields: `portfolioRiskScore`, `nearKiCount`, `fcnExposureSummary`, and `fcnWorstOfRanking`.
- Added Risk Dashboard MVP readback on Risk / Pro surfaces.

Key Decisions:

- v1.83 uses existing stored manual prices only.
- No migration or schema change is required.
- Dashboard fields are additive and do not break existing API consumers.
- Risk output remains monitoring and risk awareness, not product recommendation.

Out of Scope:

- No live market prices.
- No AI summary.
- No coupon calendar.
- No observation calendar.
- No auth, membership, entitlement, billing, or Legacy Pro changes.

Next:

- v1.83.1 should validate Risk Engine fields in staging.
- v1.84 should continue toward Portfolio Intelligence Dashboard.

## v1.82.1 — FCN Worst-of Engine MVP

Why:

- v1.80 / v1.81 moved Portfolio and FCN persistence into production.
- The next product step is turning stored FCN underlyings into risk-awareness readback, starting with Worst-of.

What Changed:

- Added a pure FCN Worst-of calculation helper for stored FCN underlyings.
- Calculated each underlying return percentage using stored `initial_price` and `current_price`.
- Added additive `worstOfSummary` fields to FCN position readback.
- Added additive Worst-of summary counts to Portfolio dashboard readback.
- Added minimal Worst-of readback on FCN / Risk / Pro surfaces.

Validation:

- No production Supabase migration is required because `fcn_underlyings.current_price` already exists.
- Validation should include `git diff --check`, lint, and build because TypeScript / runtime code changed.

Key Decisions:

- Worst-of MVP uses only stored manual prices.
- No external market data provider is connected.
- Missing current price returns an explicit `missing_current_price` status.
- Output remains monitoring / risk awareness, not investment advice.

Out of Scope:

- No KI distance.
- No KO distance.
- No coupon calendar.
- No observation calendar.
- No FCN risk score.
- No AI summary.
- No membership / billing / entitlement changes.

Next:

- v1.82.2 — KI Distance Engine.

## v1.81 — FCN Foundation

Why:

- IXAI needed the first production-ready FCN persistence workflow inside the active App, not only FCN education or Legacy Pro references.
- FCN advisory workflow is the strongest bridge from I-Xuan's origin into SaaS-ready Portfolio Intelligence.

What Changed:

- Added FCN position persistence with user ownership and portfolio attachment.
- Added FCN underlyings persistence so each FCN can store symbols, markets, initial/current prices, KI/KO/strike reference prices, and metadata.
- Added App API routes for FCN create, read, update, and soft archive.
- Added FCN Wizard UI that can read active Portfolio options and create an FCN under a selected Portfolio.
- Connected FCN readback into FCN / Risk / Pro surfaces as data-layer status.

Validation:

- Staging migrations 009 / 010 / 011 passed.
- Static API audit passed.
- Authenticated FCN CRUD passed.
- User A / User B ownership isolation passed.
- Unauthenticated access returned 401.
- Soft archive passed.
- Production UI confirmed FCN Wizard can read Portfolio dropdown and create FCN under a Portfolio.

Production Deployment:

- PR `feat: portfolio foundation and fcn foundation v1.80 v1.81` was merged into `main`.
- Vercel production deployment is Ready.
- Production domain: `https://app.ixuan.ai`.
- Production Supabase project: `IXAIagent's Project` / `uoyeeojnyswytutmhptk`.
- Production tables confirmed: `fcn_positions`, `fcn_underlyings`, plus Portfolio / Stock / Crypto foundation tables.

Key Decisions:

- FCN storage is an App-owned production persistence contract.
- FCN monitoring remains risk-awareness and workflow support.
- FCN creation does not calculate worst-of, distance to KI/KO, coupon status, or risk score yet.
- Legacy Pro remains reference-only; future FCN Pro features should be built inside `app/ixai-web-app`.

Out of Scope:

- No FCN Risk Engine.
- No personalized product recommendation.
- No buy/sell advice.
- No broker or trading execution.
- No Stripe billing.
- No Legacy Pro backend migration.

Next:

- v1.82 should build FCN Risk Engine: worst-of, KI/KO distance, strike distance, observation calendar, coupon calendar, and FCN risk score.

## v1.80 — Portfolio Foundation

Why:

- IXAI had completed Public Intelligence, Account, and Pro SSO MVP work, but users could not yet persist personal asset containers in the production App.
- Portfolio Foundation is the first step from a demonstration-oriented App into a user-owned data workflow.

What Changed:

- Added production Portfolio persistence contract through `portfolios`.
- Added Stock and Crypto position storage foundations for future Portfolio Intelligence expansion.
- Added Dashboard readback summary for Portfolio / FCN / Stock / Crypto counts and approximate stored-value fields.
- Added Portfolio Form so authenticated users can create Portfolio containers in App.
- Added API routes for Portfolio CRUD, Stock CRUD, Crypto CRUD, and dashboard readback.

Validation:

- Staging migration validation passed.
- Lint passed.
- Build passed.
- Static API audit passed.
- Authenticated Portfolio / Stock / Crypto CRUD passed.
- User A / User B ownership isolation passed.
- Unauthenticated private API access returned 401.
- Soft archive passed.
- UI smoke QA passed.

Production Deployment:

- PR `feat: portfolio foundation and fcn foundation v1.80 v1.81` was merged into `main`.
- Vercel production deployment is Ready.
- Production domain: `https://app.ixuan.ai`.
- Production Supabase project: `IXAIagent's Project` / `uoyeeojnyswytutmhptk`.
- Production migrations applied: `009_portfolio_foundation.sql`, `010_fcn_position_foundation.sql`, `011_stock_crypto_position_foundation.sql`.
- Production tables confirmed: `portfolios`, `fcn_positions`, `fcn_underlyings`, `stock_positions`, `crypto_positions`.

Key Decisions:

- App `app/ixai-web-app` is the active product mainline and now owns real Portfolio / FCN data persistence.
- Portfolio / FCN / Stock / Crypto records must preserve Supabase ownership isolation and RLS.
- DELETE behavior is soft archive for user-facing workflows.
- Production migration must be staged and validated before production application.

Out of Scope:

- No FCN calculation engine.
- No Portfolio AI analysis.
- No live prices.
- No broker integration.
- No automated trading.
- No personalized investment advice.
- No Stripe billing.

Next:

- v1.82 FCN Risk Engine.
- v1.83 SaaS Membership / Feature Gate.
- v1.84 Portfolio Intelligence Dashboard.

## v1.83.x Social Pack Stabilization Incident

Why:

- v1.82-v1.83.8d produced a sequence of Social Pack / Weekly Export hotfixes, but production repeatedly remained blocked after fixture, build, lint, or mobile smoke checks passed.
- User-provided production screenshots showed disabled export controls, failed content quality, source/canonical mismatches, `Market Pulse` fallback residue, and repeated Weekly narrative sentences after earlier fixes were declared complete.
- The real failure was not only code quality. It was a verification and governance failure.

What Changed:

- v1.82.4 added Social Pack quality guard rules.
- v1.82.5 and v1.82.7 rewrote narrative expectations and strategist-style depth.
- v1.83.0 introduced an Intelligence Extraction Layer.
- v1.83.2 patched extraction and quality-guard false positives.
- v1.83.3 unblocked Daily export by narrowing quality scan scope.
- v1.83.4-v1.83.4c addressed Weekly canonical export source selection, fixture validation, and selected/export metadata separation.
- v1.83.5-v1.83.8d focused on Weekly narrative dedupe, renderer fallback, diagnostics, sentence allocation, and market-review sentence-level dedupe.
- `docs/SOCIAL_PACK_INCIDENT_REVIEW_20260609.md` was added as the incident review and prevention document.

Key Learning:

- Weekly Social Pack is a high-risk workflow because selected review source, same-week canonical published source, generator output, rendered slide text, caption text, quality guard, and export controls must all agree.
- Fixture pass does not equal production truth.
- Build/lint/mobile smoke does not prove Social Pack export readiness.
- Root-cause claims must remain tentative until production diagnostics and actual issue text are verified.

Governance Change:

- `docs/PROJECT_RULES.md` now requires production-like Social Pack regression before completion can be claimed.
- Weekly Social Pack fixes must verify selected review plus same-week canonical published cases, rendered slide text, caption text, quality issues, source eligibility, export eligibility, Download PNG, and Copy caption.
- Social Pack hotfixes must update the incident log or governance docs.
- The project should not return to App / Pro mainline while Social Pack export remains blocked.

Out of Scope:

- This incident record does not authorize new narrative engine work.
- This does not change auth, SSO, backend, Portfolio / FCN / Stock / Crypto, or Pro integration priorities.
- Social Pack remains a distribution asset, not IXAI's core judgment engine.

## v1.70.2 — App Login Entry Fix

Why:

- After Legacy Pro logout QA, users may return to the App and need to sign in again.
- `/login` technically rendered login mode, but the page hierarchy and surrounding copy still felt too close to account creation.

What Changed:

- Added `docs/APP_LOGIN_ENTRY_FIX_V1702.md`.
- Updated `/login` copy so the page title is `進入 IXAI`.
- Added a simple `登入 / 建立帳號` switch in the shared password auth form.
- Kept `/register` as the account creation route.

Key Decisions:

- Keep email / password auth behavior unchanged.
- Keep Supabase auth helpers unchanged.
- Do not change SSO or Legacy Pro behavior.

Out of Scope:

- SSO launch code.
- Pro session logic.
- Legacy Pro.
- Backend.
- Daily / Weekly generation.
- FCN content.
- Provider ingestion.
- Stripe / trading.

## v1.70.0 — SSO Stability Validation

Why:

- v1.69.1 fixed the Legacy Pro persistence regression where a replayed launch code could clear an already valid App SSO session.
- Before more SSO work, IXAI needs a documented stability checkpoint for dashboard refresh, route switching, re-entry, invalid code fallback, and logout behavior.

What Changed:

- Added `docs/SSO_STABILITY_VALIDATION_V170.md`.
- Updated project context and roadmap to mark v1.70.0 as validation-only.
- Documented the manual QA checklist for App login → `開啟 IXAI Pro` → Legacy Pro `/dashboard` → refresh / route switch / logout stability.

Key Decisions:

- Do not change App `/api/pro/launch` in v1.70.0.
- Do not add credential-dependent automation for SSO.
- Treat the localStorage SSO bridge as MVP infrastructure pending a future Supabase session or backend-validated bridge-token design.

Out of Scope:

- UI changes.
- SSO launch-code behavior changes.
- Backend changes.
- Auth provider or Supabase schema changes.
- Daily / Weekly generation.
- FCN content.
- Provider ingestion.
- Stripe / billing.
- Broker integration.
- Trading.
- Portfolio engine.

## v1.69.0 — Pro Session Hardening

Why:

- v1.68 let App users enter Legacy Pro without seeing `/login`, but the MVP localStorage marker was still too thin for refresh, protected routes, logout, and API failure behavior.

What Changed:

- Documented v1.69 Pro Session Hardening.
- Upgraded Legacy Pro SSO marker to structured `ixai_sso_v2`.
- Centralized session helpers: `getProSession`, `setProSsoSession`, `clearProSession`, `isSsoSession`, `isLegacyJwtSession`, and `isSessionExpired`.
- Kept legacy FastAPI JWT login working.
- Prevented `ixai_sso_v2` from being sent to FastAPI as a backend JWT.
- Preserved SSO session on backend API 401 so pages can show degraded states instead of forcing `/login`.
- Logout now clears legacy JWT and SSO session state predictably.

Key Decisions:

- Keep App `/api/pro/launch` unchanged.
- Keep localStorage only as MVP infrastructure.
- Treat the SSO marker as UI identity bridge only, not paid Pro authorization.
- Defer true Supabase session / backend JWT validation for protected Pro APIs to v1.70+.

Out of Scope:

- Stripe / billing.
- Broker integration.
- Trading.
- Portfolio engine.
- FCN calculation engine.
- Daily / Weekly generation.
- Provider ingestion.
- Backend production membership logic.
- Supabase schema changes.
- App login UX changes.
- Legacy Pro login fallback removal.

## v1.68.0 — App ↔ Pro Unified Identity MVP

Why:

- v1.67 proved that Legacy Pro could receive and validate an App launch code, but users still had to continue through the legacy Pro login path.
- The next product requirement is a real App to Pro entry where a logged-in App user lands directly inside the Pro dashboard.

What Changed:

- Documented the v1.68 Unified Identity MVP.
- Legacy Pro validates the App one-time launch code and creates a short-lived `ixai_sso_v1` MVP session.
- Legacy Pro redirects valid SSO users to `/dashboard`.
- API 401 responses under the MVP SSO marker no longer force an immediate logout redirect back to `/login`; Pro can show degraded dashboard states while the true backend auth model remains unchanged.

Key Decisions:

- Keep App `/api/pro/launch` stable.
- Keep launch codes short-lived and one-time use.
- Do not expose Supabase access tokens, refresh tokens, service role keys, or backend secrets to Legacy Pro.
- Keep legacy FastAPI JWT login as fallback.
- Treat the localStorage MVP marker as temporary; it does not grant paid Pro access or protected backend data access.

Out of Scope:

- Stripe / billing.
- Broker integration.
- Trading.
- Portfolio engine.
- FCN calculation engine.
- Daily / Weekly generation.
- Provider ingestion.
- Backend production membership logic.
- Supabase schema changes.
- Existing App login changes.
- Legacy Pro login removal.

## v1.67.2 — Account Icon Cleanup

Why:

- After v1.67.1, `/account` still had lower-section icon treatments that could look off-style compared with the shared v1.64.2 icon system.

What Changed:

- Migrated remaining account lower-section card markers to `FeatureIcon`.
- Focused on `IXAI 正在整理你的市場記憶` and `LINE 情報接收偏好` child surfaces.
- Kept inline button glyphs unchanged where they follow button text rules.

Out of Scope:

- SSO logic.
- `/api/pro/launch`.
- Legacy Pro receive route.
- Pro CTA placement.
- Backend.
- Auth.
- Daily / Weekly generation.
- Provider logic.
- FCN education content.

## v1.67.1 — Promote Pro SSO CTA

Why:

- v1.67.0 created the SSO launch endpoint and button, but the `/pro` hero still led with education / consulting CTAs.
- Users needed an obvious first-screen `開啟 IXAI Pro` action to test the App to Pro handoff.

What Changed:

- Promoted `ProSsoLaunchButton` into the `/pro` hero as the primary CTA.
- Moved the `/account` Pro launch action near the top of the Pro card.
- Added visual QA text checks for `/pro` and `/account`.

Out of Scope:

- SSO backend logic.
- `/api/pro/launch` token behavior.
- Legacy Pro receive route.
- Auth.
- Backend.
- Daily / Weekly generation.
- Provider ingestion.
- FCN education content.

## v1.67.0 — App ↔ Pro SSO Launch Prototype

Why:

- The App and legacy IXAI Pro Lab need a real identity handoff before true shared login can replace the legacy Pro login.
- Previous versions clarified product copy and SSO architecture, but users still landed on a separate Pro login surface.

What Changed:

- Added the v1.67 SSO launch prototype plan.
- App prepares a short-lived one-time launch code for `開啟 IXAI Pro`.
- Legacy Pro can receive and validate the launch code on a dedicated receive route.
- The prototype validates App identity without putting Supabase tokens in query strings.

Key Decisions:

- Keep legacy Pro login as fallback.
- Do not issue production Pro JWTs in this version.
- Do not store App tokens in Legacy Pro localStorage.
- Treat in-memory launch-code storage as prototype-only.

Out of Scope:

- Stripe.
- Broker integration.
- Portfolio engine.
- FCN calculation engine.
- Trading.
- Full auth replacement.
- Legacy Pro login removal.

## Pre-App Origin / AI Morning Brief Era

Why:

- 一玄AI / IXAI began as an internal intelligence workflow, not a generic web app.
- The original need was to compress daily market noise into a morning briefing that could support risk-aware reading before market decisions.
- The earliest product behavior lived closer to a Telegram Morning Brief and personal monitoring system than to a public SaaS landing page.

What Existed:

- Telegram-style AI Morning Brief: daily macro, US equity, Taiwan market, crypto, and risk notes delivered in a concise morning format.
- FCN risk monitor prototypes: tracking KO, KI, strike, coupon observation, worst performer, volatility, observation dates, and structured-product risk context.
- Binance Grid / Dual monitoring prototypes: tracking BTC / ETH market ranges, dual-investment states, volatility, liquidity, and risk-regime context.
- Stock / AI supply-chain monitoring: tracking US AI / semiconductor names, Taiwan AI supply-chain names, macro/rates, and market-moving headlines.
- Market news module: early ingestion and classification of market news into a readable daily intelligence narrative.

Key Decisions:

- The product center should be intelligence and risk workflow, not buy/sell calls.
- FCN, crypto, grid, dual, stock, and portfolio concepts should be treated as monitoring and education layers unless a compliant Pro workflow is explicitly approved.
- Daily intelligence habit comes before advanced personalization.
- Public Intelligence should earn trust before asking users to create deeper account or Pro workflows.

How It Became IXAI:

```text
Telegram Morning Brief
→ Personal FCN / Crypto Grid / Dual / stock monitoring
→ Daily / Weekly Public Intelligence
→ Account Intelligence and watchlist memory
→ IXAI Pro preview and future portfolio / FCN / AI alert workflows
→ Social Intelligence Engine and distribution-ready content assets
```

Out of Scope Then and Now:

- Automated trading.
- Buy/sell recommendations.
- Guaranteed returns.
- Personal FCN conclusions without a future compliant Pro workflow.
- Portfolio execution or broker integration.

## v1.40.0 — Onboarding Foundation

Why:

- IXAI needed to start remembering user intent instead of acting like a static content site.

What Changed:

- Added `/welcome` and `/onboarding`.
- Built investor profile steps for markets, style, risk preference, intelligence interests, watchlist seed, and LINE entry.
- Added onboarding state model and local/session-first structure.

Key Decisions:

- Onboarding is intelligence activation, not a generic signup wizard.
- Persistence remains future-ready but not overbuilt.

Out of Scope:

- Stripe.
- Portfolio DB.
- Advanced AI agent.
- LINE auth rewrite.

## v1.40.1 — Intelligence Delivery Foundation

Why:

- IXAI needed a daily habit loop and a clear future delivery model.

What Changed:

- Added intelligence delivery architecture foundation.
- Added Morning Intelligence, delivery preference, and LINE readiness surfaces.
- Established Public / Preview / Pro delivery tier structure.

Key Decisions:

- Delivery is opt-in future architecture.
- Public delivery remains generalized and educational.
- Pro delivery will be personalized later.

Out of Scope:

- Real LINE push automation.
- Notification scheduler.
- Portfolio-specific alerts.

## v1.40.2a — Intelligence Landing System

Why:

- The root page felt too much like an entry gate and not enough like an AI investment intelligence product.

What Changed:

- Rebuilt `/` as a public intelligence landing surface.
- Added product positioning, intelligence preview cards, delivery concept, and onboarding CTA.

Key Decisions:

- New users should understand IXAI before being asked to create an account.
- Landing is an acquisition and education surface.

Out of Scope:

- Dynamic OG.
- Share routes.
- Real intelligence engine rewrite.
- Stripe / Pro backend.

## v1.40.2b — UX Cohesion Pass

Why:

- Landing, onboarding, account, Pro, LINE, and preview surfaces felt like separate pages instead of one product.

What Changed:

- Aligned narrative, CTA language, section rhythm, and mobile hierarchy across the main product surfaces.
- Reinforced Public → Preview → Onboarding → Workspace → Future Pro language.

Key Decisions:

- UX should feel like one AI-native investment intelligence product.
- LINE consultation and LINE intelligence delivery must remain distinct.

Out of Scope:

- Backend infrastructure.
- Stripe.
- Dynamic share system.
- Portfolio DB.

## v1.40.2c — Share Intelligence Foundation

Why:

- Shared IXAI links needed intelligence continuity instead of generic previews.

What Changed:

- Added `/share`.
- Added `/share/intelligence/[slug]` static share routes.
- Added reusable share intelligence cards and share CTA flow.

Key Decisions:

- Share routes are acquisition surfaces.
- Shared content should lead to onboarding and preview without implying investment advice.

Out of Scope:

- Dynamic image generation.
- AI content generation engine.
- LINE push.
- Portfolio Intelligence.

## v1.40.2d — Product Flow Audit

Why:

- IXAI had grown complex, with too many CTA paths and unclear page roles.

What Changed:

- Added `docs/product-flow-audit-v1.40.2d.md`.
- Mapped page purpose, CTA overload, user journeys, and simplification strategy.

Key Decisions:

- The real core flow should be Landing → Onboarding → Account → Future Pro Interest.
- `/share` and `/pro-intelligence` should not be main user-flow destinations.

Out of Scope:

- Code changes.
- Route deletion.
- Navigation overhaul.

## v1.40.2e — Product Flow Simplification

Why:

- The audit showed onboarding and Pro CTAs were pulling users away from the main activation path.

What Changed:

- Onboarding completion now routes to `/account`.
- Sidebar `IXAI Pro` points to `/pro`.
- Homepage CTA count was reduced.
- `/pro` hero was simplified.
- `/pro-preview` and `/pro-intelligence` gained clearer exits back to `/account`.
- Removed unused first-visit banner.

Key Decisions:

- Account is the current AI Intelligence Workspace.
- Pro Preview is secondary context, not the default next step.

Out of Scope:

- Auth architecture.
- Share architecture.
- Pro backend.
- LINE Login / LIFF.

## v1.40.2f — Public Intelligence Access Layer

Why:

- Users clicking Daily or Weekly links from LINE/social should see content before account creation.

What Changed:

- Daily Brief, Weekly Intelligence, and Share Intelligence became publicly readable before login.
- Added `PublicIntelligenceCta` footer for content-to-onboarding conversion.
- Added public intelligence positioning labels.
- Added public intelligence view and CTA analytics events.

Key Decisions:

- Public Intelligence builds trust first.
- Account / Pro / Admin remain protected or gated.

Out of Scope:

- Stripe.
- LINE push.
- Portfolio DB.
- Supabase schema changes.
- Large UI redesign.

## v1.40.3 — Public Intelligence Engine

Why:

- IXAI needed to move beyond public readable content into a structured public intelligence engine.
- Public users should understand IXAI's market interpretation framework before entering account or Pro workflows.

What Changed:

- Added Public Intelligence Engine foundation.
- Introduced public-safe modules for Market Pulse, Macro Watch, AI / Tech Watch, Crypto Watch, FCN Awareness, and Risk Regime.
- Strengthened Daily / Weekly / Share Intelligence continuity into onboarding and account flows.
- Clarified that public intelligence is general market awareness and education, not personalized advice.

Key Decisions:

- Public Intelligence should become more useful before deeper account or Pro workflows are requested.
- Public modules remain educational, risk-aware, and non-personalized.
- FCN content remains awareness and education only unless future Pro workflows are explicitly approved.

Out of Scope:

- Supabase schema changes.
- Market/news provider pipeline rewrite.
- LINE push automation.
- Portfolio DB.
- Stripe / paid entitlement.
- Personalized portfolio or FCN risk conclusions.
- Buy/sell recommendations.
- Automated trading.

## v1.40.3a — Public Intelligence Engine Polish

Why:

- Public Intelligence Engine foundation required consistency, compliance, and conversion optimization before expanding intelligence capabilities.

What Changed:

- Added Public Intelligence disclaimer layer.
- Improved mobile UX and CTA hierarchy.
- Refined Public → Account → Future Pro narrative.
- Strengthened FCN and Risk Regime educational positioning.
- Audited Public Intelligence modules for compliance consistency.

Key Decisions:

- Public Intelligence remains educational and risk-aware.
- Public modules should increase trust and onboarding conversion rather than act as trading tools.
- Compliance clarity is more important than feature expansion.

Out of Scope:

- Dynamic market providers.
- Portfolio intelligence.
- Personalized alerts.
- LINE push automation.
- Portfolio DB.
- Stripe.
- Automated trading.
- Personalized recommendations.

## v1.40.3b — Public Route Gate Hydration Fix

Why:

- Public Intelligence Engine must remain readable from LINE, social, and share links before account creation.
- Browser QA found existing AuthEntryGate / hydration behavior could show an entry shell on public routes.

What Changed:

- Audited public route gating and session hydration behavior.
- Ensured Public Intelligence and Share routes render public content without auth blocking.
- Preserved protected boundaries for Account, Admin, Pro Intelligence, and sensitive routes.

Key Decisions:

- Public Intelligence is a trust-building acquisition surface and must not be account-gated.
- Auth/session hydration may personalize CTA state but must not block public reading.
- Protected product areas remain gated.

Out of Scope:

- Auth architecture rewrite.
- LINE / LIFF changes.
- Supabase schema changes.
- Portfolio DB.
- Stripe.
- Market/news provider changes.
- FCN engine changes.

## v1.40.4 — Watchlist Intelligence Lite

Why:

- IXAI needed to make the Account surface feel like an AI Intelligence Workspace rather than a static profile page.
- Onboarding preferences and watchlist seed needed to become visible as lightweight market memory.

What Changed:

- Added Watchlist Intelligence Lite foundation.
- Surfaced onboarding watchlist seed and intelligence preferences in the Account workspace.
- Mapped selected markets, symbols, and interests to relevant Public Intelligence modules.
- Added empty state for users who have not completed onboarding.
- Reinforced that Watchlist Intelligence Lite is topic organization, not personalized advice.

Key Decisions:

- Watchlist Intelligence Lite remains local/session-first.
- Watchlist memory is about relevance and workflow, not portfolio analysis.
- Account Intelligence is the bridge between Public Intelligence and future Pro Intelligence.

Out of Scope:

- Supabase persistence migration.
- Portfolio DB.
- Broker integration.
- Buy/sell recommendations.
- Target prices.
- Personal FCN risk conclusions.
- LINE push automation.
- Stripe or paid entitlement.

## v1.40.5 — LINE Delivery Foundation

Why:

- IXAI needed to move from LINE readiness messaging toward an explicit delivery preference foundation.
- Future delivery must be opt-in, reversible, and clearly separated between Public, Account, and Pro intelligence.

What Changed:

- Added LINE Delivery Foundation.
- Added local/session-first delivery preference model.
- Added Account delivery readiness UI.
- Added opt-in, pause, and unsubscribe concept layer.
- Clarified that automated LINE push delivery is not active yet.
- Reinforced delivery compliance language.

Key Decisions:

- Delivery preferences prepare future intelligence workflows but do not trigger push automation.
- Public delivery remains general and educational.
- Account delivery may organize preferences but remains non-advisory.
- Real push requires durable opt-in persistence, delivery logs, unsubscribe/pause controls, and explicit approval.

Out of Scope:

- Real LINE push automation.
- LINE Login / LIFF architecture changes.
- Supabase schema changes.
- Notification scheduler.
- Portfolio-specific alerts.
- Personalized recommendations.
- Stripe / paid entitlement.
- FCN engine changes.
- Market/news provider changes.

## v1.40.5a — Mobile Visual QA Readiness

Why:

- Public Intelligence, Watchlist Intelligence Lite, and LINE Delivery Foundation added new visible surfaces that require mobile QA before expanding into Portfolio Intelligence.
- Previous validation passed lint/build and HTTP route checks, but browser-level 390px QA was blocked by missing Playwright browser binaries.

What Changed:

- Added mobile visual QA readiness.
- Added lightweight 390px route smoke checks for public, account, Pro, and admin surfaces.
- Verified checks for no horizontal overflow, CTA wrapping, and key intelligence sections at smoke-test level.
- Kept browser binaries out of source control.

Key Decisions:

- Mobile QA should be part of Definition of Done before major product expansion.
- QA readiness should remain lightweight and not become a product refactor.
- Visual QA should validate public acquisition routes and account intelligence surfaces first.

Out of Scope:

- Full E2E test suite.
- Auth rewrite.
- LINE / LIFF changes.
- Supabase schema changes.
- Portfolio Intelligence.
- AI Alert Engine.
- App Store / Google Play submission flow.

## v1.40.6 — Social Intelligence Engine

Why:

- IXAI already had Daily / Weekly Intelligence generation and publication into the public app.
- The next growth bottleneck was turning reviewed intelligence into reusable FB / IG / LINE promotional assets.
- Daily and weekly content needed brand-consistent 9:16 social templates based on actual brief content, not generic app advertising.

What Changed:

- Added Social Intelligence Engine foundation.
- Added Daily Social Pack and Weekly Social Pack structure.
- Added 9:16 story-style preview cards for up to five slides.
- Added caption drafts for manual FB / IG / LINE publishing.
- Added 一玄 / IXAI brand-oriented visual direction with deep green, champagne gold, and institutional research tone.
- Reinforced disclaimer and non-advisory language.

Key Decisions:

- Social packs are generated from reviewed intelligence content or clear editorial-safe fallback content.
- Publishing remains manual for now.
- The system should support human review before any external distribution.
- Social content should promote the intelligence, not hype the app.

Out of Scope:

- Facebook Graph API integration.
- Instagram Graph API integration.
- LINE OA broadcast integration.
- Automatic publishing.
- Supabase schema changes.
- Market/news provider pipeline changes.
- Portfolio Intelligence.
- Personalized recommendations.
- Trading signals.

## v1.40.6a — Social Pack Brand Asset Integration

Why:

- Social Intelligence Packs needed a recognizable 一玄 / IXAI identity before becoming a repeatable distribution asset.
- Generic templates were insufficient for long-term brand building.

What Changed:

- Added brand asset integration.
- Added reusable brand tokens.
- Added institutional research visual language.
- Standardized logo, footer, and disclaimer placement.
- Reinforced 一玄觀點 as a recurring intelligence section.

Key Decisions:

- Brand consistency is more important than visual complexity.
- Social packs should promote intelligence credibility, not app hype.
- Institutional tone should remain consistent across Daily and Weekly content.

Out of Scope:

- PNG export.
- Publish Center.
- Auto publishing.
- Portfolio Intelligence.
- AI Alert Engine.

## v1.40.6b — Social Pack PNG Export

Why:

- Social Packs were already previewable but still required manual screenshots.
- Export-ready PNG assets reduce friction for daily FB, IG, and LINE distribution.

What Changed:

- Added PNG export capability.
- Added download-ready Daily and Weekly Social Pack assets.
- Preserved logo, footer, disclaimer, and brand identity.
- Improved editorial workflow efficiency.

Key Decisions:

- Export assets remain manual publishing assets.
- Human review remains mandatory.
- Export should be lightweight and browser-based.

Out of Scope:

- Auto publishing.
- Publish Center.
- Meta API integration.
- LINE Broadcast API integration.
- Portfolio Intelligence.
- AI Alert Engine.

## v1.40.6c — Social Pack Layout Redesign

Why:

- Initial Social Pack output was functionally correct but visually resembled application UI and presentation slides.
- Social distribution requires stronger information hierarchy and faster readability.

What Changed:

- Redesigned layout system.
- Reduced oversized headers.
- Reduced visual weight of cards.
- Introduced social-first content hierarchy.
- Improved brand presentation.

Key Decisions:

- Readability over decoration.
- Institutional research tone over app-marketing aesthetics.
- Short-form insights over long-form text.

Out of Scope:

- Publish Center.
- Auto publishing.
- Portfolio Intelligence.
- AI Alert Engine.

## v1.40.6d — Social Pack Layout Safety Fix

Why:

- v1.40.6c improved direction but exported PNGs still had text overflow and footer overlap.
- Social assets must be safe for direct FB / IG / LINE publishing.

What Changed:

- Added fixed header/main/footer safe areas.
- Reduced oversized typography.
- Added copy compression rules.
- Simplified slide layouts.
- Prevented footer, page number, and disclaimer overlap.

Key Decisions:

- Layout safety is more important than decorative design.
- Social copy must be shorter than app/public brief content.
- PNG export requires visual QA before use.

Out of Scope:

- Publish Center.
- Auto publishing.
- Portfolio Intelligence.
- AI Alert Engine.

## v1.41.0 — Daily Intelligence Content Engine Upgrade

Why:

- Daily Brief quality became the primary bottleneck for retention.
- Content depth was more important than additional UI work.
- Editors needed source health, coverage, and draft quality visibility before manual publish.

What Changed:

- Added structured Daily Intelligence sections.
- Expanded content depth through Executive Summary, Macro Watch, AI / Tech Watch, Crypto Watch, Risk Regime reasoning, FCN Awareness, and I-Xuan View.
- Added Provider Health monitoring.
- Added Coverage Score for Macro, AI Tech, Crypto, Taiwan, and Risk.
- Added Content Quality Score based on source count, coverage, diversity, content length, and insight depth.
- Upgraded news deduplication and priority scoring around Fed, Treasury, NVDA, MSFT, BTC, and FCN-related terms.

Key Decisions:

- Content quality before UI.
- Insight before summary.
- Reading value before social distribution.
- Provider coverage gaps should be visible to editors instead of hidden behind generic fallback drafts.

Out of Scope:

- Publish Center.
- Auto publishing.
- Portfolio Intelligence.
- AI Alert Engine.
- Supabase schema changes.
- LINE / LIFF changes.
- FCN engine changes.
- PNG export or Social Pack UI changes.

## v1.41.1 — Daily Brief Public Preview QA / UI Polish

Why:

- v1.41.0 expanded Daily Brief content depth, but the public preview needed reading hierarchy, mobile spacing, and diagnostic visibility checks.
- Provider Health, Coverage Score, Content Quality Score, and raw provider errors should support editors without leaking into public Daily Brief surfaces.

What Changed:

- Sanitized public Daily Brief API responses to remove admin-only diagnostics.
- Polished generated Daily Brief reading hierarchy for Executive Summary, Risk Regime, FCN Awareness, I-Xuan View, and Daily Intelligence sections.
- Replaced public source/debug metadata display with a public intelligence boundary note.
- Cleaned risky wording in static Daily Brief fallback content.

Key Decisions:

- Public Daily Briefs should feel like finished intelligence, not an admin diagnostic payload.
- Admin diagnostics remain available in Editorial Studio.
- Compliance and readability polish should not rewrite the v1.41.0 content engine architecture.

Out of Scope:

- Provider architecture changes.
- Scoring logic changes.
- Auth changes.
- Supabase schema changes.
- Social Pack engine changes.
- FCN engine changes.

## v1.41.2 — Social Pack Renderer Hardening

Why:

- v1.41.0 made Daily Intelligence drafts deeper, but the Daily Social Pack renderer still assumed very short source copy.
- Exported PNGs could show clipped headings, unreadable I-Xuan View fragments, truncated FCN / AI Tech content, and unsafe spacing near the footer.
- Social assets need to be reliable enough for external LINE, FB, IG, and Threads distribution.

What Changed:

- Hardened the Daily Social Pack generator and renderer for content-aware short-form social output.
- Reworked the cover slide to show concise Executive Summary bullets instead of a low-information title page.
- Reworked Market Pulse, AI / Tech Watch, FCN / Risk Watch, and I-Xuan View to prioritize complete readable points over clipped source text.
- Reserved safer header / main / footer zones so page number, company name, URL, and disclaimer stay separated from content.
- Kept PNG export workflow, brand identity, logo, and manual publishing model intact.

Key Decisions:

- Daily Social Pack slides should summarize Daily Intelligence into complete social copy instead of rendering raw long-form brief text.
- Fewer readable points are better than many clipped points.
- Footer and disclaimer readability are part of compliance, not decoration.

Out of Scope:

- Provider recovery.
- Admin redesign.
- Auth changes.
- Supabase schema changes.
- Publish Center.
- Auto publishing.
- PNG export architecture rewrite.
- FCN engine changes.

## v1.41.3 — News Provider Recovery & US Equity Coverage Expansion

Why:

- Daily Intelligence quality depends on usable real coverage, not just a polished Provider Health display.
- US equity, AI / semiconductor, macro, crypto, and Taiwan technology supply-chain coverage were still too dependent on a small set of active sources.
- Editors needed clearer differentiation between active, recoverable, experimental, disabled, failed, and empty-feed providers.

What Changed:

- Recovered verified public RSS providers: CNBC, CNBC Technology, Nasdaq, Seeking Alpha, The Block, and Decrypt.
- Expanded US equity and AI / Tech symbol/theme coverage for NVDA, MSFT, AVGO, AMD, PLTR, MDB, TSLA, META, AMZN, GOOGL, cloud, semiconductors, enterprise software, cybersecurity, hyperscalers, and data centers.
- Expanded crypto coverage for BTC, ETH, stablecoins, ETF developments, regulation, custody, institutional adoption, and liquidity themes.
- Added provider classification metadata for Production Active, Recoverable, Experimental, and Deprecated states.
- Added empty-feed diagnostics so reachable feeds with zero usable items are not displayed as successful.
- Adjusted Coverage Score to reflect actual item/category/source coverage rather than synthetic provider inflation.
- Improved Admin Provider Health summary with active, recoverable, and disabled counts.

Key Decisions:

- Do not simply enable every provider slot.
- Reuters remains disabled because the configured endpoint returns 404.
- MoneyDJ remains experimental/disabled because verification returned HTML with zero RSS items.
- CNYES and 經濟日報 remain disabled because their configured RSS endpoints returned empty channels.
- 工商時報 remains disabled because the configured endpoint returned 403.
- Coverage quality is source/category/symbol diversity, not raw headline volume.

Out of Scope:

- News provider architecture rewrite.
- Scraping full article text.
- Supabase schema changes.
- Auth changes.
- LINE / LIFF changes.
- FCN engine changes.
- Market quote provider changes.
- Portfolio Intelligence.
- Automated publishing or push delivery.

## v1.42.0 — Intelligence Distribution Layer

Why:

- IXAI needed to connect stronger Daily / Weekly intelligence output to a distribution-ready operating layer.
- The next product step was not more intelligence generation, but the workflow between Generate Intelligence, Review Intelligence, Distribute Intelligence, and Measure Intelligence.
- Account users needed clearer delivery preferences without implying real LINE, email, or push automation.

What Changed:

- Added local/session-first Distribution Preference model.
- Extended Account Delivery Preferences with Daily / Weekly / Daily + Weekly frequency.
- Added distribution categories for Macro, AI / Tech, Crypto, Taiwan Market, FCN Awareness, and Risk Regime.
- Kept In-App as the only active channel while showing LINE, Email, and Push as future disabled channels.
- Added a read-only Admin Distribution Queue with Draft, Reviewed, and Published foundation states.
- Added lightweight analytics event names for intelligence distribution viewed and published states.
- Updated docs to define distribution as a foundation layer, not an external sending system.

Key Decisions:

- Distribution preferences remain local/session-first.
- Distribution Queue is operational visibility only, not a persistence-backed send queue.
- In-App is the only active channel in v1.42.0.
- External delivery requires future opt-in persistence, delivery logs, unsubscribe / pause controls, human review, and compliance approval.
- Distribution should measure intelligence operations, not create marketing automation or user profiling.

Out of Scope:

- LINE Push.
- Email delivery.
- Push notifications.
- Stripe or paid entitlement.
- Portfolio Intelligence.
- AI Alert Engine.
- Broker integration.
- Portfolio monitoring.
- Personal FCN monitoring.
- Auto trading.
- Robo-advisor behavior.
- Buy/sell recommendations.

## v1.42.2 — Daily Intelligence Experience Upgrade

Why:

- Daily Briefs had become structurally deeper, but the reading experience still felt too much like a news summarizer.
- Users needed to understand the day's market signal in the first 30 seconds.
- Daily Social Pack PNGs were layout-safe, but the content still felt too template-driven for external LINE / FB / IG distribution.

What Changed:

- Shifted Daily Brief from summary-first to interpretation-first.
- Added 今日一句話, 今日最重要的三件事, Market Interpretation, and Investor Watchpoints into Daily Intelligence output.
- Strengthened I-Xuan View so it reads as complete branded commentary rather than a clipped source summary.
- Upgraded Daily Social Pack copy generation from Brief → Shorten → Image to Brief → Extract Insight → Rewrite for Social → Image.
- Removed Social Pack template residue such as Short Insight / Observation labels and improved fallback copy quality.

Key Decisions:

- Daily Intelligence should answer what the market is signaling before it lists categories.
- Social Pack slides should each be shareable as standalone market insight cards.
- Fewer complete, readable insights are better than many generic or clipped points.
- All Daily and Social Intelligence remains public, educational, non-personalized, and non-advisory.

Out of Scope:

- New news providers.
- Provider pipeline changes.
- Supabase schema changes.
- Auth, LINE Login, or LIFF changes.
- Distribution Layer changes.
- FCN engine changes.
- Portfolio Intelligence.
- AI Alert Engine.
- Real push delivery.
- Automated trading or personalized investment advice.

## v1.42.3 — Market Memory Layer

Why:

- Daily Intelligence had become more interpretation-first, but each brief still behaved too much like an isolated daily artifact.
- IXAI needed a lightweight market continuity layer so Daily Briefs could explain what changed since the previous brief.
- The product origin from AI Morning Brief and monitoring workflows requires memory of market narratives, not just daily summaries.

What Changed:

- Added Market Memory Layer foundation for Daily Intelligence.
- Added What Changed Since Last Brief to generated Daily Briefs.
- Added continuity tags such as AI infrastructure, enterprise software, rates pressure, Taiwan AI supply chain, crypto liquidity, and risk regime.
- Made I-Xuan View include market continuity language when previous generated / published briefs are available.
- Allowed Daily Social Pack I-Xuan View to reuse a concise memory point without crowding slides.

Key Decisions:

- Market Memory is editorial-first and local / session-aware through existing draft history.
- Memory tracks public market narratives, rising / fading themes, and continuity tags.
- This is not user-specific memory, portfolio memory, personal FCN monitoring, or personal investment advice.

Out of Scope:

- Supabase schema changes.
- Auth, LINE Login, or LIFF changes.
- Distribution Layer changes.
- News provider pipeline changes.
- New providers.
- Portfolio Intelligence.
- Personal Market Memory.
- AI Alert Engine.
- Buy/sell recommendations.
- Automated trading.

## v1.42.4 — Social Media Optimization Layer

Why:

- Social Packs had become content-safe and exportable, but the visual system still treated every platform like a 9:16 story slide.
- IG Feed / Carousel needs faster visual impact, tighter copy, and a 4:5 layout that occupies more mobile feed space.
- The same reviewed intelligence content needed platform-aware export modes without adding auto-publishing or platform APIs.

What Changed:

- Added Social Export Format Layer.
- Added IG Feed / Carousel 4:5 export at 1080 × 1350.
- Preserved Story / Reels 9:16 export at 1080 × 1920.
- Added Admin Social Pack format selector.
- Added format-specific preview aspect ratio, export dimensions, file names, safe areas, and copy density.
- Kept Daily / Weekly Social Pack content sourced from reviewed intelligence content.

Key Decisions:

- IG Feed / Carousel 4:5 is the primary social feed format.
- Story / Reels 9:16 remains the distribution / traffic-driving format.
- Platform optimization should improve social readability without changing the Daily Brief content engine or publishing workflow.
- Publishing remains manual and human-reviewed.

Out of Scope:

- Facebook / Instagram / Threads API integration.
- LINE broadcast.
- Auto publishing.
- News provider changes.
- Market Memory changes.
- Supabase schema changes.
- Auth, LINE Login, or LIFF changes.
- Portfolio Intelligence.
- Buy/sell recommendations or return promises.

## v1.43.0 — Intelligence Source of Truth Architecture

Why:

- Daily Brief, Weekly Brief, and Social Pack had improved individually but still behaved like parallel content products.
- Weekly Intelligence needed to inherit recent Daily market signals instead of generating a disconnected narrative.
- Social Pack needed to function as the acquisition entry into Daily / Weekly Intelligence, not a separate image template.
- Daily Briefs with overlapping themes needed difference-aware copy so consecutive days do not feel repetitive.

What Changed:

- Added Daily Intelligence Core as the common contract for Daily, Social, Weekly, and future Account / Pro reuse.
- Standardized core fields for todaySignal, topThreeThings, marketInterpretation, investorWatchpoints, whatChanged, continuityTags, I-Xuan View, socialHooks, and weeklySignals.
- Made Daily Social Pack derive Slide 1 hook, Market Pulse, AI / Tech Watch, FCN / Risk Watch, and I-Xuan View from Daily Core.
- Made Weekly Intelligence aggregate recent Daily Core signals, continuity tags, whatChanged, and I-Xuan View before manual review.
- Added admin copy showing that Social Pack is derived from Daily / Weekly Core and Weekly aggregates recent Daily Core.
- Strengthened difference-aware Market Memory copy when themes overlap across days.

Key Decisions:

- Daily Intelligence Core is the source of truth.
- Social Pack is an entry asset into Daily / Weekly Intelligence, not a standalone narrative engine.
- Weekly Intelligence should be built from recent Daily Core first, with news intake and calendar data supporting the weekly view.
- The architecture remains editorial-first and does not require a Supabase schema migration.

Out of Scope:

- Supabase schema changes.
- Auth, LINE Login, or LIFF changes.
- News provider pipeline changes.
- New providers.
- Auto publishing or platform APIs.
- Portfolio Intelligence.
- Pro subscription.
- Buy/sell recommendations, target prices, return promises, or automated trading.

## v1.43.1 — Weekly Revision Workflow Phase 1

Why:

- Weekly Production QA showed that the existing unique `(week_start, week_end)` constraint prevents a same-week revision draft when a canonical weekly is already published.
- IXAI needs a safe editorial revision model that preserves public URL stability and does not overwrite published Weekly Intelligence.
- The revision model requires database review before production migration, so Phase 1 establishes migration SQL and backward-compatible code support first.

What Changed:

- Added a reviewed Supabase migration SQL plan for Weekly revision columns.
- Added backward-compatible Weekly repository / API support for revision_number, parent_weekly_id, is_canonical, superseded_at, superseded_by, and revision_note.
- Added Generate Revision Draft behavior when the revision schema is available.
- Added Publish Revision promotion behavior: previous canonical is archived/non-canonical and the new revision becomes canonical.
- Updated Admin Weekly UI to show revision number, canonical status, parent weekly, superseded state, schema availability, and migration-required locked messaging.
- Kept production safe when the migration has not been applied.

Key Decisions:

- Option B — Revision Columns / Constraint Change — is the selected architecture.
- Production migration requires explicit manual approval, backup, and review.
- Public Weekly reads must prefer canonical published rows when the revision schema is available.
- Previous canonical Weekly rows are preserved for audit/history instead of being deleted or overwritten.
- Before migration, Weekly generation keeps the locked behavior and explains that revision workflow requires migration.

Out of Scope:

- Applying the Supabase production migration.
- Dropping production indexes directly.
- Deleting or overwriting published Weekly Intelligence.
- Changing public Weekly URL behavior.
- Auth, LINE Login, LIFF, provider pipeline, Daily/Social source-of-truth changes.
- Auto publishing or platform APIs.
- Buy/sell recommendations, target prices, return promises, or automated trading.

## v1.44.0 — Social Conversion Layer

Why:

- Daily → Social Pack linkage existed, but Social Pack still behaved like a compressed Daily Brief.
- Social images need to act as a conversion entry point: stop the user, create curiosity, then route into Daily / Weekly Intelligence and eventually Account / Future Pro.
- Daily title and Social Slide 1 hook could drift because they came from different fields.

What Changed:

- Added social conversion fields to Daily Intelligence Core: headline, headlineHook, conversionHook, socialThesis, socialCuriosity, socialCTA, weeklyThesis, and contentFunnelTarget.
- Made public Daily title / SEO title, Daily Core headline, and Social Slide 1 hook share the same market theme.
- Rewired Daily Social Pack slides into funnel roles: Stop-scroll Hook, Curiosity Builder, Signal Explainer, Risk Contrast, and I-Xuan View + contextual CTA.
- Made Slide 5 CTA contextual to the Daily headline / funnel target rather than a fixed generic line.
- Preserved IG Feed 4:5 and Story 9:16 export behavior without adding auto-publishing.

Key Decisions:

- Social Pack is a conversion surface, not a standalone intelligence artifact.
- Daily Intelligence Core remains the source of truth for social hooks and funnel targeting.
- Social copy can be shorter and more curiosity-driven, but it must remain aligned with the Daily title and non-advisory.

Out of Scope:

- Weekly revision migration execution.
- Supabase schema changes.
- Auth, LINE Login, or LIFF changes.
- News provider pipeline changes.
- Platform APIs, auto publishing, LINE broadcast, or marketing automation.
- Portfolio Intelligence or Pro monetization.
- Buy/sell recommendations, target prices, return promises, or automated trading.

## v1.45.0 — Periodic Intelligence Engine Correction

Why:

- The v1.43 source-of-truth model made Daily Core too central, causing Weekly Intelligence to behave like Daily aggregation.
- Product direction required News Source → IXAI Intelligence Engine → Daily / Weekly / Monthly / Yearly as separate periodic outputs.
- Social Packs needed to represent each period's brief as a conversion entry, not a compressed article image.

What Changed:

- Added a Periodic Narrative Model with whatHappened, whyItMatters, whatChanged, whatToWatchNext, mainNarrative, riskNarrative, I-Xuan View, socialHook, socialConflict, socialPayoff, and clearCTA.
- Added Daily / Weekly implementation support with Monthly / Yearly reserved at the type/model layer.
- Corrected Weekly generation so weekly news intake, categorization, upcoming-week events, and periodic narrative drive Weekly Brief content.
- Kept Daily Core as optional continuity context only; it no longer overrides Weekly market highlights, Weekly intelligence summary, or Weekly Social Pack main narrative.
- Reworked Weekly Social Pack into a Weekly conversion funnel: weekly turn, three signals, AI / Tech line, Macro / Risk / FCN watch, and I-Xuan Weekly View + CTA.
- Preserved Daily Social Pack as a Daily conversion entry and removed recurring "previous brief" language from social copy.

Key Decisions:

- News Source is the source of truth; IXAI Intelligence Engine is the interpreter.
- Daily / Weekly / Monthly / Yearly are separate periodic products.
- Social Pack is a traffic entry for its period brief.
- Weekly may reference Daily for continuity, but Weekly must remain weekly-news-source driven.

Out of Scope:

- Supabase migration execution.
- Weekly revision schema rollout.
- Auth, LINE Login, LIFF, or provider pipeline changes.
- Platform APIs, auto publishing, LINE broadcast, or marketing automation.
- Portfolio Intelligence or Pro monetization.
- Buy/sell recommendations, target prices, return promises, or automated trading.

## v1.46.0 — IXAI Insight Engine Fix

Why:

- Daily Brief and Weekly Brief still behaved too much like news summaries even after periodic source correction.
- Social Packs had platform-ready layout but needed stronger hooks, tension, payoff, and I-Xuan viewpoint.
- IXAI needed a dedicated interpretation layer between news intake and brief / social outputs.

What Changed:

- Added `src/lib/intelligence/insight/` as the core Event Extraction → Signal Extraction → Tension / Change Detection → Insight Generation layer.
- Added keyEvents, marketSignals, narrativeTension, whatChanged, whyItMatters, whatToWatchNext, I-Xuan View, and socialFunnel output.
- Rewired Daily generation so Daily Brief fields come from insight output instead of category summary fallback.
- Rewired Weekly generation so Weekly Brief fields use weekly news-source insight and upcoming events.
- Rewired Daily / Weekly Social Packs to use hook, conflict, payoff, and contextual CTA from the insight social funnel.
- Cleaned recurring generic phrases such as previous-brief wording and generic app CTA fallbacks from generated social surfaces.

Key Decisions:

- News Source remains the source of truth, but raw news must pass through an insight engine before becoming a brief or social asset.
- Daily and Weekly are separate period outputs, but both use the same insight contract.
- Social Packs are traffic entry points built from insight, not compressed brief screenshots.
- Compliance boundaries remain unchanged: education, risk awareness, and market interpretation only.

Out of Scope:

- Supabase migration execution.
- Weekly revision schema rollout.
- Auth, LINE Login, LIFF, or provider pipeline changes.
- Platform APIs, auto publishing, LINE broadcast, or marketing automation.
- Portfolio Intelligence or Pro monetization.
- Buy/sell recommendations, target prices, return promises, or automated trading.

## v1.47.0 — Question Driven Intelligence Engine

Why:

- v1.46.0 added the insight engine, but real outputs still repeated similar AI / rates / risk phrasing across Daily, Weekly, and Social Pack surfaces.
- IXAI needed to answer the user's actual market question rather than simply improve summary structure.
- Social Packs needed slide-level roles that do not repeat the same thesis.

What Changed:

- Added QuestionDrivenInsight with centralQuestion, keyAnswer, evidence, counterEvidence, whatChangesMyMind, watchNext, and I-Xuan View.
- Rewired Daily generation so the public Daily title and today signal start from the central question and answer.
- Rewired Weekly generation so weekly summary and next-week watchlist can use question-driven evidence and counter-evidence.
- Rewired Daily / Weekly Social Packs into question-led funnels: question, answer, evidence, counter-evidence / risk, and I-Xuan View + contextual CTA.
- Strengthened AI provider instructions around central question, key answer, evidence, counter-evidence, and observable watch next.

Key Decisions:

- Question-driven intelligence is now the narrative spine for Daily and Weekly outputs.
- Tension is not enough; every output must answer a concrete market question.
- Social Packs must avoid repeating the same idea across slides.
- Compliance boundaries remain unchanged: public education, risk awareness, and market interpretation only.

Out of Scope:

- Supabase migration execution.
- Weekly revision schema rollout.
- Auth, LINE Login, LIFF, or provider pipeline changes.
- Platform APIs, auto publishing, LINE broadcast, or marketing automation.
- Portfolio Intelligence or Pro monetization.
- Buy/sell recommendations, target prices, return promises, or automated trading.

## v1.47.1 — Evidence Quality Sprint

Why:

- v1.47.0 made Daily and Weekly question-led, but the evidence layer still contained too many conclusions rather than specific events.
- Weekly still needed a stronger report structure: what changed this week, the one thing that matters, next week catalysts, and I-Xuan Weekly View.
- Social Packs needed a stricter anti-repetition pass so each slide introduces new information.

What Changed:

- Added scored evidence details with event, source, whyItMatters, category, and score.
- Added evidence scoring based on specificity, recency, relevance, named entities, and catalyst strength.
- Added narrative repetition detection and distinct slide fallback support for social content.
- Rewired Daily and Weekly question-driven evidence to prefer concrete events such as company adoption, crypto flows, CPI, MediaTek, and other catalysts.
- Reworked Weekly Social Pack structure around What Changed This Week, The One Thing That Matters, Next Week, and I-Xuan Weekly View.

Key Decisions:

- Evidence must answer "what actually happened" before explaining what it means.
- Generic macro or AI statements are not evidence unless attached to a concrete event, company, data point, or upcoming catalyst.
- Weekly should read like a report, not seven Daily Briefs merged together.

Out of Scope:

- Supabase migration execution.
- Weekly revision schema rollout.
- Auth, LINE Login, LIFF, or provider pipeline changes.
- Platform APIs, auto publishing, LINE broadcast, or marketing automation.
- Portfolio Intelligence or Pro monetization.
- Buy/sell recommendations, target prices, return promises, or automated trading.

## v1.48.0 — Weekly Persistence Fix + Social Pack Layout System

Why:

- Production Weekly generation could appear to fail generically when the existing `(week_start, week_end)` uniqueness constraint blocked same-week revisions before the reviewed migration was applied.
- Social Pack 4:5 cards still had format-specific layout risk: footer overlap, dense slide 3 content, and oversized I-Xuan View / CTA text on slide 5.

What Changed:

- Added structured Weekly generation diagnostics for generation start/completion, week range, existing row, revision schema availability, save attempts, blocked reason, PostgREST error code, list count after save, and final response.
- Preserved the safe locked behavior when revision schema is unavailable and an existing published weekly blocks same-week draft creation.
- Added centralized Social Pack layout rules for Feed 4:5 and Story 9:16.
- Added social copy normalization, line clamping, and slide-specific compression before rendering cards.
- Updated Admin UI to display Weekly persistence debug details and actionable migration-required messaging.

Key Decisions:

- Weekly revision migration remains a reviewed manual DB operation and is not applied by application code.
- If the old unique week range constraint blocks revision creation, IXAI should expose the exact reason and next action rather than pretending a draft was saved.
- Social layouts should reduce bullets and compress copy before shrinking typography or allowing footer collision.

Out of Scope:

- Supabase migration execution.
- Auth, LINE Login, LIFF, billing, provider pipeline, or FCN engine changes.
- Platform APIs, auto publishing, LINE broadcast, or marketing automation.
- Portfolio Intelligence, Pro monetization, trading recommendations, target prices, return promises, or automated trading.

## v1.49.0 — Social Intelligence Rewrite

Why:

- v1.48.0 made Social Pack cards safe, but the copy could become underfilled because cards were still rendered from compressed brief text.
- Social Pack should be a conversion entry point with intentional slide-native copy, not a clipped or compressed version of the Daily / Weekly Brief.

What Changed:

- Rewired Daily Social Pack generation into Hook, What the market is seeing, The real risk, What to watch next, and I-Xuan View.
- Rewired Weekly Social Pack generation into Weekly question, What changed this week, The one thing that matters, Next week catalysts, and I-Xuan Weekly View.
- Made slide 2 / slide 4 carry 2–3 social-native evidence or watch items instead of one-line compressed filler.
- Kept v1.48.0 layout constraints and footer safety while improving card intentionality.

Key Decisions:

- Social cards should be generated as social cards from the beginning.
- The brief remains the source material, but each slide has a conversion role and should introduce new information.
- Manual publishing, compliance language, and non-advisory boundaries remain unchanged.

Out of Scope:

- Auth, LINE Login, LIFF, billing, provider infrastructure, Supabase schema, Weekly migration execution, platform APIs, auto publishing, portfolio workflows, trading logic, buy/sell recommendations, target prices, return promises, or automated trading.

## v1.50.1 — Daily / Weekly Social Pack Divergence Fix

Why:

- v1.49.0 rewrote Social Packs as slide-native social cards, but production review still found Daily Social Pack and Weekly Social Pack content can become too similar.
- The failure mode is not merely wording polish. It means the period separation promised by v1.45.0 Periodic Intelligence Engine Correction and v1.49.0 Social Intelligence Rewrite is not fully enforced.
- Audit found that `buildIXAIInsight`, `QuestionDrivenInsight`, `socialFunnel`, and Daily Core aggregation can still leak the same thesis into Weekly output.
- Daily and Weekly cards must not look like the same social asset with different labels.

What Changed:

- Separate Daily and Weekly Social Pack narrative sources.
- Split or strictly branch Daily / Weekly question-driven logic and source priority.
- Remove Daily aggregation as a Weekly thesis source; Daily continuity may remain metadata only.
- Reorder Weekly Social Pack priority toward weekly events, next-week catalysts, weekly periodic narrative, and weekly-only I-Xuan View.
- Daily Social Pack must answer what happened today, today's biggest market question, and what to watch today.
- Weekly Social Pack must answer what changed this week, what next-week catalysts matter, and whether the weekly thesis is extending, reversing, or rotating.
- Prevent Weekly Social Pack from directly reusing Daily Social Pack generator output.
- Prevent Weekly Social Pack from using Daily Core as its primary narrative source.
- Prevent identical Daily / Weekly Slide 1 questions, Slide 2 evidence, and nearly identical Slide 5 I-Xuan View.
- Prevent the same fallback copy from filling both Daily and Weekly cards.

Key Decisions:

- Daily Social Pack and Weekly Social Pack are separate period products, not one shared card set with different labels.
- Weekly may use Daily context as secondary continuity metadata, but not as the primary social thesis source.
- Social Pack Period Divergence QA is now a standing quality gate for future Daily / Weekly engine changes.

QA:

- Run Social Pack Period Divergence QA after Social Pack, Daily engine, or Weekly engine changes.
- Compare Daily Slide 1 against Weekly Slide 1; questions must not match.
- Compare Daily Slide 2 against Weekly Slide 2; evidence and information role must differ.
- Compare Daily Slide 3 against Weekly Slide 3; Daily should emphasize today's signal, Weekly should emphasize week-level thesis.
- Compare Daily Slide 4 against Weekly Slide 4; Daily should emphasize today's watch next, Weekly should emphasize next-week catalysts.
- Compare Daily Slide 5 against Weekly Slide 5; I-Xuan View must be period-specific, not a "today" / "this week" word swap.
- If the two card sets look interchangeable, QA fails.

Out of Scope:

- Auth, LINE Login, LIFF, billing, portfolio workflows, trading logic, Supabase migration execution, provider infrastructure, platform APIs, auto publishing, buy/sell recommendations, target prices, return promises, or automated trading.

## v1.50.2 — LINE OAuth Prefetch CORS Fix

Why:

- Production QA found `/pro-preview` could trigger LINE OAuth CORS console errors when the LINE login endpoint was handled as a Next.js client-side/RSC navigation.
- `/api/line/login` redirects to LINE OAuth and should be reached through normal document navigation, not prefetch or RSC fetch.

What Changed:

- Changed the LINE login button navigation from Next.js `Link` to a normal anchor for `/api/line/login`.
- Preserved click-through behavior to LINE Login while preventing App Router prefetch / RSC fetch from touching the OAuth redirect.
- Kept the fix scoped to the LINE login entry and did not change the homepage, auth main flow, LINE Login API, LIFF, or protected routes.

Validation:

- Engineering Health Score: 8.2/10.
- `npm run lint` passed.
- `npm run build` passed.
- 390px mobile QA passed.
- Production route QA passed.
- No hydration errors found in checked routes.
- No LINE OAuth CORS errors found after the fix.
- Working tree was clean at the project health audit.
- `main` and `origin/main` synchronized at `385ff518f9ee57b58c1b4fbb1fc98473563201a7`.

Out of Scope:

- Auth architecture changes.
- LINE Login API or LIFF changes.
- Homepage changes.
- Supabase schema changes.
- Platform APIs, auto publishing, portfolio workflows, trading logic, buy/sell recommendations, target prices, return promises, or automated trading.

## Planned Note — Legacy Pro Dashboard Audit

Why:

- IXAI now has multiple project folders under `/Users/itsunkuo/Desktop/IXAI_PROJECTS`.
- Future agents need a clear distinction between the active production frontend, backend mainline candidate, legacy Pro / Portfolio Dashboard prototype, and brand side project.
- The legacy frontend contains useful Pro / Portfolio UI and backend contract ideas, but it should not be confused with the production app.

What Was Classified:

- `app/ixai-web-app`: active production frontend.
- `backend/ixai_agent`: active backend mainline candidate.
- `frontend/ixai-website-clean`: legacy Pro / Portfolio Dashboard prototype.
- `brand/ixuan-brand-site`: brand / social kit side project.

Reusable Legacy Assets:

- `RiskPill`
- `StatusBadge`
- `SummaryCard`
- `PortfolioEnginePanel`
- `MarketEnginePanel`
- `ScenarioSensitivityPanel`
- `DashboardTodayFocus`
- FCN position / schedule display pattern.
- Asset allocation layout.
- Alert center taxonomy.
- Backend API client contract ideas.

Not Recommended For Direct Migration:

- Legacy JWT login.
- `localStorage` token auth.
- Direct browser-to-FastAPI protected requests.
- Whole legacy `AppShell` navigation.
- Terminal-heavy visual style.

Key Decision:

- Future Pro Dashboard work should use a hybrid strategy: keep `app/ixai-web-app` as the mainline, build a backend integration boundary first, and then migrate selected reusable widgets or information architecture patterns.

Out of Scope:

- Moving folders.
- Deleting legacy projects.
- Changing auth, LINE, LIFF, Supabase, backend, provider infrastructure, billing, portfolio logic, or production app code.

## v1.51.0 — IXAI App ↔ IXAI Pro Integration Foundation

Why:

- IXAI now has a stable production app and a separate IXAI Pro Legacy Dashboard Prototype that already connects to the FastAPI backend.
- The next engineering step is not to move the whole legacy dashboard, but to create a safe connection layer between app.ixuan.ai, IXAI Pro Lab, and `backend/ixai_agent`.
- Users should understand that Public App, Account, Pro Preview, and Pro Lab are part of one future product path.

What Changed:

- Added `docs/PRO_INTEGRATION_PLAN.md`.
- Updated project map and roadmap with the production app / Pro Lab / backend roles.
- Added `/api/backend/health` as the first server-side backend health proxy.
- Added IXAI Pro Lab external entry points to `/pro`, `/pro-preview`, and `/account`.
- Added Account Pro integration status surface with Backend Connected / Not configured / Unavailable states.

Key Decisions:

- Keep `app/ixai-web-app` as the active production frontend.
- Keep `frontend/ixai-website-clean` as IXAI Pro Legacy Dashboard Prototype and reusable reference.
- Use Next API server-side proxy patterns for backend integration.
- Avoid direct browser-to-FastAPI protected requests in the production app.
- Future integration must define Supabase user → backend account mapping before loading portfolio / FCN data.

Out of Scope:

- Backend code changes.
- Legacy frontend code changes.
- Moving folders or deleting projects.
- Migrating legacy JWT auth.
- Loading real portfolio, FCN, broker, trading, or paid entitlement data.
- Stripe, billing, auth, LINE, LIFF, Daily / Weekly generation, admin workflow, or provider infrastructure changes.

## v1.51.1 — App User → Pro Access Identity Bridge

Why:

- App users need a path to connect IXAI Pro identity without automatically receiving paid Pro rights.
- IXAI Pro access must preserve preview, manual approval, paid subscription, expired, and revoked states before Stripe or backend portfolio integration is added.

What Changed:

- Added a server-side Pro access decision helper.
- Added `/api/pro/access` for current-user Pro access state.
- Added status model: `not_connected`, `connected`, `preview`, `active`, `expired`, and `revoked`.
- Account Pro status now communicates whether the user can open Pro, whether billing is required, and whether Portfolio / FCN capabilities remain closed.
- Pro and Pro Preview now state that Pro access is account-based but controlled by preview / paid subscription entitlement.
- Documented future backend account mapping endpoints and future billing / entitlement model.

Key Decisions:

- App registration / login can establish Pro identity connection.
- Pro identity connection is not the same as paid Pro entitlement.
- Active Pro or Enterprise membership is required before Portfolio / FCN capabilities are treated as open.
- Stripe remains future work and must update entitlement state through trusted server-side flows.

Out of Scope:

- Backend code changes.
- Legacy frontend code changes.
- Supabase schema changes.
- Stripe, billing portal, subscription management, or checkout.
- Real portfolio / FCN / broker data.
- Auth, LINE Login, LIFF, Daily / Weekly generation, admin workflow, provider infrastructure, platform APIs, auto publishing, buy/sell recommendations, target prices, return promises, or automated trading.

## v1.51.2 — Supabase User → Backend Account Link

Why:

- App users authenticate through Supabase Auth, while the legacy Pro Lab still uses backend FastAPI JWT users.
- A user who signs up on app.ixuan.ai cannot automatically log into the legacy Pro Lab with the same credentials.
- `/account` needed clearer UX so users do not mistake the Pro Lab preview link for a shared-login Pro dashboard.

What Changed:

- Reframed `/account` Pro Lab entry as a preview / integration explanation surface.
- Changed misleading `Open IXAI Pro` wording toward `View Pro Lab Preview` / `Learn about Pro Integration`.
- Added explicit warning that App login is not yet shared with Pro Lab and users should not use their App password unless they have a separate Pro Lab account.
- Updated `/api/pro/access` reasons so `connected`, `preview`, and `active` states do not imply direct legacy Pro login.
- Documented Supabase User → Backend Account Link target architecture.

Target Backend Contract:

- `POST /api/v1/integrations/supabase/account-link` for server-side create-or-find.
- `GET /api/v1/accounts/by-external-user/{provider}/{external_user_id}` for lookup.
- Backend must verify trusted Next server requests before account linking.

Key Decisions:

- App remains the primary login surface.
- Supabase user is the source identity.
- Next API verifies the user server-side before calling backend.
- Legacy Pro Lab login is not the long-term entry point.
- App signup creates identity only; it does not grant paid Pro access.

Out of Scope:

- Backend code changes.
- Legacy frontend code changes.
- Supabase schema changes.
- Stripe, payment UI, subscription management, or pricing.
- Portfolio / FCN real data.
- Auth, LINE Login, LIFF, Daily / Weekly generation, admin workflow, provider infrastructure, platform APIs, auto publishing, buy/sell recommendations, target prices, return promises, or automated trading.

## v1.52.0 — Supabase User → Backend Account Link Foundation

Why:

- IXAI App users live in Supabase Auth, while backend / legacy Pro users currently live in FastAPI JWT tables.
- The production app needed the first safe server-side account-link boundary without moving legacy auth or exposing backend protected endpoints to the browser.
- `/account` needed to distinguish identity linking from paid Pro entitlement.

Backend Audit:

- `backend/ixai_agent` currently exposes FastAPI JWT auth, user, account, portfolio, FCN, crypto, alert, and intelligence surfaces.
- It does not yet expose `external_user_id`, `provider`, `integrations`, `account-link`, or by-external-user lookup support.
- Existing account APIs require backend JWT identity and cannot directly link Supabase users yet.

What Changed:

- Added `POST /api/pro/account-link`.
- The route verifies the Supabase App user server-side, builds the future backend account-link payload, and calls `POST /api/v1/integrations/supabase/account-link` only from the Next API layer.
- Added safe responses for `backend_not_configured`, `backend_contract_missing`, and backend errors.
- Extended `/api/pro/access` with accountLink status.
- Added `/account` Account Link Status and `Connect Pro Account`.
- Kept Portfolio / FCN capabilities closed unless paid Pro entitlement and backend mapping are both available in future versions.

Key Decisions:

- Supabase remains the App source identity.
- Backend account linking is server-side only.
- Browser never receives backend admin secrets, service tokens, Supabase access tokens, or backend protected credentials.
- Account linking does not activate paid Pro access.
- Portfolio / FCN data remains disabled until backend entitlement and account mapping are complete.

Future Backend Contract:

```text
POST /api/v1/integrations/supabase/account-link
GET /api/v1/accounts/by-external-user/{provider}/{external_user_id}
```

Out of Scope:

- Backend code changes.
- Legacy frontend code changes.
- Supabase schema changes.
- Stripe, payment UI, subscription management, or pricing.
- Portfolio / FCN real data.
- Auth, LINE Login, LIFF, Daily / Weekly generation, admin workflow, provider infrastructure, platform APIs, auto publishing, buy/sell recommendations, target prices, return promises, or automated trading.

## v1.53.1 — Account Link End-to-End Verification

Why:

- v1.52 added the production-app account-link proxy and v1.53 added the backend account-link endpoint.
- The next risk was whether frontend and backend could actually communicate without weakening auth or exposing protected backend APIs to the browser.

What Was Verified:

- Backend `/health` returned `ok`.
- Backend `/readyz` returned database ready state.
- Backend `POST /api/v1/integrations/supabase/account-link` returned `created: true` on first test payload.
- Repeating the same payload returned `created: false`.
- The backend created / found a backend `User`, `Account`, and owner `AccountMembership`.
- `pro_access_status` stayed `connected`, not `active`.
- Frontend `/api/backend/health` reached the local backend through development fallback.
- Frontend production server smoke test with `IXAI_BACKEND_URL=http://localhost:8000` returned `backendUrlConfigured: true` and `ok: true`.
- Frontend `/api/pro/account-link` returned `401 not_authenticated` without a Supabase Bearer token.

Known Blocker:

- Full `/account` Connect Pro Account E2E still requires a real Supabase authenticated browser session / access token.
- The local frontend dev server already running on port 3001 did not include `IXAI_BACKEND_URL`, so a separate short-lived production server on port 3002 was used to verify configured backend health.

Key Decisions:

- Do not bypass Supabase auth for local E2E.
- Do not apply auth hacks or direct browser-to-FastAPI calls.
- Keep account linking separate from paid Pro entitlement.

Out of Scope:

- Legacy frontend changes.
- Supabase schema changes.
- Stripe, payment UI, subscription management, or pricing.
- Portfolio / FCN real data.
- Auth, LINE Login, LIFF, Daily / Weekly generation, admin workflow, provider infrastructure, platform APIs, auto publishing, buy/sell recommendations, target prices, return promises, or automated trading.

## v1.54 — Real Account Linking Verification

Why:

- v1.52 and v1.53 established the frontend and backend account-link endpoints.
- The remaining question was whether a configured frontend runtime could reach the backend and whether `/account` could complete real linking for a Supabase-authenticated user.

What Was Verified:

- Temporary E2E database `/tmp/ixai_v154_e2e.db` upgraded to `0009_supabase_account_link`.
- Backend `/health` and `/readyz` passed.
- Backend direct `POST /api/v1/integrations/supabase/account-link` returned `created: true` first and `created: false` on repeat.
- Backend created / found a backend `User`, `Account`, and owner `AccountMembership`.
- `pro_access_status` stayed `connected`, not `active`.
- Frontend `/api/backend/health` returned `backendUrlConfigured: true` and `ok: true` when started with `IXAI_BACKEND_URL=http://localhost:8000`.
- Frontend unauthenticated `POST /api/pro/account-link` returned `401 not_authenticated`.

Blocked:

- Full `/account` Connect Pro Account browser E2E requires a valid Supabase App session.
- Local and production browser checks both displayed the account entry shell rather than an authenticated Account workspace.

Key Decisions:

- Do not bypass Supabase auth for local verification.
- Do not weaken auth, migrate legacy Pro login, or expose backend protected endpoints directly.
- Account linking remains separate from paid Pro access.

Out of Scope:

- Legacy frontend changes.
- Supabase schema changes.
- Stripe, payment UI, subscription management, or pricing.
- Portfolio / FCN real data.
- Auth, LINE Login, LIFF, Daily / Weekly generation, admin workflow, provider infrastructure, platform APIs, auto publishing, buy/sell recommendations, target prices, return promises, or automated trading.

## v1.54.1 — Real Supabase Session Button Test

Why:

- v1.54 verified backend and frontend readiness, but did not complete a real logged-in `/account` button click.
- The remaining requirement was to confirm that an authenticated Supabase App user can click `Connect Pro Account` and receive `accountLink.status = linked`.

What Was Verified:

- Backend temporary DB `/tmp/ixai_v1541_e2e.db` upgraded to `0009_supabase_account_link`.
- Backend `/health` and `/readyz` passed.
- Frontend local server with `IXAI_BACKEND_URL=http://localhost:8000` returned `backendUrlConfigured: true` and `ok: true`.
- Frontend unauthenticated `POST /api/pro/account-link` returned `401 not_authenticated`.
- Local and production `/account` both showed unauthenticated App entry shell.

Blocked:

- No valid Supabase authenticated browser session was available.
- The `Connect Pro Account` button was not reachable because Account workspace was not authenticated.

Key Decisions:

- Do not bypass Supabase auth.
- Do not inject fake cookies or fake Supabase tokens.
- Do not modify legacy Pro login, LINE Login, Stripe, Portfolio / FCN, or admin flows.

Out of Scope:

- Legacy frontend changes.
- Supabase schema changes.
- Stripe, payment UI, subscription management, or pricing.
- Portfolio / FCN real data.
- Auth, LINE Login, LIFF, Daily / Weekly generation, admin workflow, provider infrastructure, platform APIs, auto publishing, buy/sell recommendations, target prices, return promises, or automated trading.

## v1.54.2 — Auth Session Recovery / Debug

Why:

- v1.54.1 could not complete the real `/account` button test because local and production `/account` did not have an authenticated Supabase App session available.
- The next step was to determine whether the issue was missing login state, server-cookie visibility, Bearer-token forwarding, or account-link response mapping.

What Changed:

- Added safe `GET /api/auth/session-debug`.
- The endpoint reports only non-sensitive diagnostics:
  - valid Supabase Bearer session present or absent
  - lightweight server cookie present or absent
  - masked cookie-name categories and cookie count
  - user id / email presence as booleans only
  - source as `bearer`, `server-cookie`, or `none`
- Documented the identity boundary between Supabase browser session and lightweight `ixai_identity` cookie.

Key Findings:

- Supabase App auth currently persists in browser `sessionStorage`.
- Next API routes cannot read client `sessionStorage`.
- `/api/pro/account-link` correctly requires Supabase identity because backend account linking needs the Supabase user id.
- The lightweight identity cookie does not contain Supabase user id and should not be used to create backend account links.
- Local unauthenticated debug returned `source: none`, no user, and no Supabase session.
- Local lightweight identity debug returned `source: server-cookie`, user presence, but no Supabase user id.
- With lightweight identity only, `/api/pro/access` can return manual connected status, while `/api/pro/account-link` correctly remains `401 not_authenticated`.

Out of Scope:

- Auth rewrite.
- Supabase schema changes.
- LINE Login / LIFF changes.
- Backend changes.
- Legacy frontend changes.
- Stripe, payment UI, portfolio / FCN data, auto publishing, platform APIs, buy/sell recommendations, target prices, return promises, or automated trading.

## v1.54.3 — Supabase Bearer Token Client Bridge

Why:

- v1.54.2 confirmed that Next API routes cannot read the Supabase browser session from `sessionStorage`.
- The correct low-risk path is not an auth rewrite, but an explicit client bridge that sends the current Supabase access token as an `Authorization: Bearer` header to trusted Next API routes.

What Changed:

- Added `getSupabaseAuthorizationHeaders()` to centralize Supabase `access_token` → Bearer header creation.
- Updated Pro Lab connection client calls so `/api/pro/access` and `/api/pro/account-link` both use the same Bearer bridge.
- Kept `/api/pro/account-link` server-side validation unchanged: it still verifies Supabase user identity before calling backend account-link.

Expected Flow:

```text
Browser Supabase Session
→ access_token
→ Authorization: Bearer
→ /api/pro/account-link
→ Backend Account Link
→ accountLink.status = linked
```

Key Decisions:

- Do not use lightweight `ixai_identity` to create backend account links.
- Do not accept anonymous account-link requests.
- Do not expose backend tokens, Supabase tokens, or backend protected endpoints directly to the browser.
- Account linking remains separate from paid Pro access.

Out of Scope:

- Backend changes.
- Legacy frontend changes.
- Auth rewrite.
- Supabase schema changes.
- LINE Login / LIFF changes.
- Stripe, payment UI, portfolio / FCN data, auto publishing, platform APIs, buy/sell recommendations, target prices, return promises, or automated trading.

## v1.55.0 — Membership Foundation

Why:

- v1.54.x completed the App → Backend account-link path, but linked identity
  still needed a shared membership and entitlement boundary.
- IXAI needs the same App account to carry future Free / Personal / Pro /
  Enterprise access state without granting paid Pro automatically.

What Changed:

- Added backend `subscriptions` and `entitlements` foundation.
- Linked backend accounts default to Free membership.
- Default Free entitlements enable Daily Brief, Weekly Brief, and Watchlist.
- Portfolio, FCN Monitoring, Risk Engine, AI Copilot, and Pro Preview remain locked by default.
- Added backend membership service and `GET /api/v1/membership/me`.
- Added production-app `GET /api/pro/membership` as a sanitized Next API proxy.
- Added `/account` membership / entitlement display in the Pro card.

Key Decisions:

- Account linking does not equal paid Pro access.
- Paid Pro remains entitlement-gated.
- Stripe is future work.
- Portfolio and FCN data remain disabled until future versions.
- Browser clients still do not call protected backend endpoints directly.

Out of Scope:

- Stripe.
- Payment UI.
- Portfolio / FCN real data.
- LINE Login changes.
- Legacy frontend changes.
- Daily / Weekly / Admin workflow changes.
- Buy/sell recommendations, target prices, return promises, or automated trading.

## v1.55.1 — Production Migration Finalize

Why:

- v1.55.0 added the membership foundation, but production PostgreSQL still
  needed explicit verification that Alembic had moved from
  `0009_supabase_account_link` to `0010_membership_foundation`.
- `/account` membership UI depends on the backend `subscriptions` and
  `entitlements` tables existing in production.

What Changed:

- Added a temporary read-only backend migration status endpoint:
  `GET /admin/migration-status`.
- The endpoint reports current revision, expected revision, Alembic heads, and
  whether `users`, `accounts`, `account_memberships`, `subscriptions`, and
  `entitlements` exist.
- Documented the production verification sequence in backend deployment notes.

Key Decisions:

- The endpoint is debug-only and does not execute migrations.
- The endpoint should be removed after production verification or replaced with
  protected ops tooling.
- Account link can initialize Free membership only after migration 0010 is live.

Out of Scope:

- Stripe.
- Portfolio / FCN real data.
- Payment UI.
- LINE Login changes.
- Trading advice, target prices, return promises, or automated trading.

## v1.55.2 — Production Migration Execution

Why:

- Production migration status confirmed the backend was still at
  `0009_supabase_account_link`; follow-up verification also observed
  `0008_fcn_coupon_sched`, which is the direct parent of `0009`.
- The v1.55 membership tables were missing in production:
  `subscriptions = false`, `entitlements = false`.
- Membership lookup and account-link could not complete reliably until
  production PostgreSQL reached `0010_membership_foundation`.

What Changed:

- Added a temporary, token-protected backend migration executor:
  `POST /admin/run-membership-migration`.
- The executor requires `MIGRATION_BOOTSTRAP_TOKEN` and the matching
  `X-IXAI-MIGRATION-TOKEN` request header.
- The executor refuses unsupported source revisions and is intended only for
  the linear `0008_fcn_coupon_sched` / `0009_supabase_account_link` →
  `0010_membership_foundation` transition.
- Documented the exact Render execution sequence, verification checks, and
  cleanup requirement.

Key Decisions:

- This is not a product feature.
- The endpoint must be removed after migration verification.
- No membership rules, Stripe, Portfolio, FCN, or Pro entitlement logic changed.
- A linked account remains Free by default after migration.

Out of Scope:

- Stripe.
- Portfolio / FCN real data.
- Payment UI.
- LINE Login changes.
- Membership logic changes.
- Trading advice, target prices, return promises, or automated trading.

## v1.56.0 — Unified Identity Foundation

Why:

- v1.55 established membership, but IXAI still needed a clearer SaaS feature
  gate boundary so the same App account can later evaluate Free / Personal /
  Pro / Enterprise access.
- Portfolio, FCN Monitoring, and Risk Engine must remain locked until explicit
  entitlement unlocks them.

What Changed:

- Added backend `GET /api/v1/entitlements/me`.
- Added frontend `GET /api/pro/entitlements` proxy.
- Added `src/lib/pro/feature-gates.ts`.
- Added `canAccessPortfolio()`, `canAccessFCN()`, and `canAccessRiskEngine()`.
- Added a compact Membership badge in the Account Pro card.

Key Decisions:

- Membership is the identity / plan layer.
- Entitlements are the permission / feature-access layer.
- Free accounts keep Daily Brief, Weekly Brief, and Watchlist access.
- Portfolio, FCN Monitoring, Risk Engine, and AI Copilot remain locked.

Out of Scope:

- Stripe.
- Billing.
- Portfolio Center.
- FCN Center.
- Risk Engine UI.
- AI Copilot.
- Broker integrations.
- Real portfolio / FCN data.

## v1.56.1 — Feature Gate UI

Why:

- v1.56.0 established the entitlement layer, but locked Pro capabilities still
  needed clearer UI treatment in the Account workspace.
- Users should see that Portfolio, FCN Monitoring, and Risk Engine are future
  Pro-gated capabilities rather than missing or broken features.

What Changed:

- Added a small Account feature-gate card component.
- Displayed Portfolio Intelligence, FCN Monitoring, and Risk Engine as gated
  cards under the Membership / Entitlements area.
- Reused `canAccessPortfolio()`, `canAccessFCN()`, and
  `canAccessRiskEngine()` from the v1.56 feature-gate foundation.
- Preserved the Free-plan expectation that these Pro capabilities remain
  locked.

Out of Scope:

- Stripe.
- Billing.
- Payment UI.
- Real Portfolio / FCN data.
- Risk Engine workflow UI.
- Legacy Pro frontend migration.

## v1.57.0 — Pro Connection Completion

Why:

- v1.56 added membership / entitlement state, but remaining Pro product entries
  still needed to be controlled by the same feature-gate foundation.
- IXAI needed a small bridge from "identity is linked" to "product entrances
  respect the linked account's entitlement state."

What Changed:

- Added `/portfolio` as a Portfolio Intelligence feature-gated route.
- Changed `/fcn` into an FCN Monitoring feature-gated route.
- Added `/risk` as a Risk Engine feature-gated route.
- Updated Pro entry surfaces to show Pro module availability from the same
  membership / entitlement state used in Account.
- Added mobile QA coverage for `/portfolio`, `/fcn`, and `/risk`.

Backend Counterpart:

- Backend v1.57 adds a protected manual entitlement test endpoint for internal
  QA before Stripe.

Out of Scope:

- Stripe.
- Billing.
- Payment UI.
- Broker API.
- Real Portfolio / FCN data.
- Legacy Pro frontend migration.

## v1.58.0 — Unified Pro Product Integration

Why:

- Users could link an account and see feature gates, but the product still felt
  like a locked preview rather than an actual Pro beta workspace.
- IXAI Pro needed to live inside app.ixuan.ai instead of sending users toward
  the legacy Pro Lab login.

What Changed:

- Added Beta Open Access for authenticated and account-linked users.
- Added a beta override that opens Portfolio, FCN Monitoring, and Risk Engine
  workspace skeletons without deleting the underlying entitlement model.
- Replaced `/pro` with an in-app Unified Pro Workspace hub.
- Updated `/portfolio`, `/fcn`, and `/risk` to show beta workspace sections
  when the user is authenticated and linked.
- Changed Account Pro CTA toward `/pro`.
- Downgraded Legacy Pro Lab to secondary reference-only status.

Out of Scope:

- Stripe.
- Billing.
- Broker API.
- Real Portfolio / FCN data.
- Trading execution.
- Personalized investment advice.
- Legacy frontend migration.

## v1.59.0 — Real Pro Bridge + Icon Cleanup

Why:

- v1.58 created an in-app Pro beta workspace, but users still need a clear path
  to the existing IXAI Pro Lab.
- The legacy Pro Lab remains a separate FastAPI JWT environment, so App account
  shared login is not true SSO yet.
- Pro icons and CTA states needed stronger contrast and visible labels.

What Changed:

- `/account` now uses `Open IXAI Pro Lab` as the clear external Pro Lab CTA.
- `/pro` now separates the existing Pro Lab path from the in-app beta workspace
  path.
- Legacy Pro Lab `/login` now explains that App shared login is being connected
  and beta testers should use assigned Pro Lab credentials if available.
- Pro CTA buttons, icon containers, badges, and locked / beta states now use
  more readable contrast.

Out of Scope:

- Stripe or billing.
- Broker API or trading execution.
- Real Portfolio / FCN data.
- Investment advice, buy/sell signals, target prices, or return promises.
- True SSO between App Supabase auth and legacy Pro JWT login.

## v1.60.0 — Unified Login Foundation

Why:

- v1.59 clarified the real Pro bridge, but App and Legacy Pro still do not
  share a login session.
- IXAI needs an explicit SSO architecture before changing production auth,
  removing legacy login, or exposing real Pro data through shared identity.

What Changed:

- Added `docs/SSO_FOUNDATION_PLAN.md`.
- Audited authentication across:
  - Production App: Supabase Auth, sessionStorage, Bearer token bridge, Next API
    verification, account-link / membership / entitlement proxy.
  - Legacy Pro: FastAPI JWT login, `localStorage` `ixai_token`, direct
    browser-to-FastAPI protected API calls.
  - Backend: email/password users, custom HS256 JWT, Supabase external account
    link, subscriptions, and entitlements.
- Compared three SSO directions:
  - Unified Supabase Auth.
  - Transitional JWT Exchange Bridge.
  - Custom SSO server.
- Recommended Supabase Auth as the single identity source whenever practical,
  with backend accounts as product ownership and entitlements as authorization.
- Documented security requirements for JWT validation, token exchange, replay
  prevention, logout behavior, and account-link failure modes.
- Added phased migration plan from audit through beta SSO and legacy login
  retirement.

Out of Scope:

- Enabling SSO in production.
- Modifying App login, Legacy Pro login, or backend JWT behavior.
- Removing existing Legacy Pro login.
- Stripe, broker integration, portfolio engines, trading, or investment advice.

## v1.61.0 — SSO Prototype & Implementation Readiness

Why:

- IXAI needs an implementation-ready SSO prototype plan before changing App,
  Legacy Pro, or backend login behavior.
- The target product outcome is login once in the App, click Open IXAI Pro, and
  enter Pro without a second login.

What Changed:

- Added `docs/SSO_IMPLEMENTATION_PLAN.md`.
- Expanded the auth architecture audit with:
  - App Supabase auth flow, session lifecycle, JWT usage, refresh behavior, and
    route-gate behavior.
  - Backend account-link, membership lookup, entitlement lookup, and current
    backend JWT validation.
  - Legacy Pro login, backend JWT creation, `localStorage ixai_token`, dashboard
    access flow, and protected route behavior.
- Added sequence diagrams for current App identity, current Legacy Pro login,
  target unified login, Option A Unified Supabase Auth, and Option B JWT
  Exchange Bridge.
- Recommended Unified Supabase Auth as the target SSO architecture, with JWT
  Exchange Bridge as a transitional fallback only if direct migration is too
  disruptive.
- Defined prototype requirements for login, logout, expiration, session refresh,
  failure recovery, CSRF, XSS, JWT replay, token leakage, and session fixation.
- Added v1.62–v1.66 migration roadmap with scope, risk, rollback, and success
  criteria.

Out of Scope:

- Enabling SSO in production.
- Changing production App / Legacy Pro / backend auth flows.
- Issuing new JWTs.
- Supabase configuration changes.
- Deployment.
- UI redesign.
- Stripe, broker integration, portfolio engines, or trading features.

## v1.61.1 — SSO Design Review

Why:

- v1.60 and v1.61 recommended Unified Supabase Auth, but IXAI needed a
  feasibility review before editing authentication code.
- Legacy Pro still uses FastAPI JWT + `localStorage ixai_token`, while the App
  uses Supabase Auth and the backend now owns account-link / membership /
  entitlement decisions.

What Changed:

- Added `docs/SSO_FILE_CHANGESET.md` with expected App, Backend, and Legacy Pro
  file-level changes for v1.62+.
- Added `docs/SSO_PROTOTYPE_BLUEPRINT.md` with v1.62-v1.66 rollout phases,
  rollback paths, and success criteria.
- Added `docs/SSO_SECURITY_REVIEW.md` with critical / high / medium SSO risks
  and mitigations.
- Confirmed GO with constraints: Legacy Pro can migrate toward Supabase Auth,
  but session source, protected route gate, API Authorization header, and
  backend JWT validation must be changed together.
- Confirmed v1.62 is the first expected version to write SSO prototype code.

Out of Scope:

- Production auth changes.
- Supabase configuration changes.
- JWT issuance changes.
- Deployment.
- UI redesign.
- Legacy login retirement.
- Stripe, broker integration, portfolio engines, trading, or investment advice.

## v1.62.0 — Content Intelligence Foundation

Why:

- v1.62 SSO work was paused to investigate a more urgent content-quality root
  cause.
- Production review found the 2026-06-02 and expected 2026-06-03 Daily Brief /
  Social Pack narratives could appear nearly identical.
- `docs/DAILY_BRIEF_ROOT_CAUSE_ANALYSIS.md` found that production did not expose
  a public `daily-intelligence-2026-06-03` brief through the checked API.
- The same audit found that the 2026-06-02 public title came from
  `intelligence.insight.questionDriven.centralQuestion`, not the provider
  `todayHeadline`.
- The primary repeated-title cause is deterministic AI + macro question-driven
  logic in the content engine.

What Changed:

- Added `docs/CONTENT_ENGINE_V162_PLAN.md`.
- Added `docs/CONTENT_ENGINE_ARCHITECTURE.md`.
- Added `docs/PROVIDER_HEALTH_REVIEW.md`.
- Documented the existing Daily Brief generation flow.
- Documented the existing Social Pack generation flow.
- Documented the existing Weekly Intelligence / aggregation flow.
- Documented Provider Health flow and disabled-provider reasons.
- Added a root-cause matrix for Daily title repetition, Social Pack repetition,
  Weekly similarity risk, UTC date-key risk, and provider-health ambiguity.
- Defined Narrative Diversification, Daily / Social separation, Weekly / Daily
  separation, Asia/Taipei product-date key design, regression test plan,
  v1.62.1 implementation scope, and rollback plan.

Key Decisions:

- v1.62.0 is documentation / architecture only.
- Do not patch `build-insight.ts`, Social Pack generator, Weekly generator,
  scheduler, or publish flow until v1.62.1 implementation is approved.
- Daily and Weekly content quality fixes must be regression-tested before
  another production content-engine change.
- `Yahoo Finance` Daily RSS remains disabled because of repeated 429 /
  rate-limit responses.
- `Bloomberg` Daily RSS remains disabled because stable public RSS access and
  legal / terms suitability have not been verified.
- App quote Yahoo chart API and backend / legacy yfinance providers are
  separate provider paths and should not be confused with App Daily news intake.

Out of Scope:

- Production generation code changes.
- Auth / SSO work.
- LINE / LIFF.
- Supabase schema changes.
- Provider activation.
- Bloomberg / Yahoo scraping.
- Weekly revision migration.
- Publish workflow changes.
- Stripe, broker integration, portfolio engines, trading, or investment advice.

## v1.62.1 — Content Engine Rewrite Implementation

Why:

- v1.62.0 confirmed the Daily / Social / Weekly repetition issue was a content
  engine problem, not a UI issue.
- Same-theme Daily news could still produce the same AI + Macro question,
  answer, and I-Xuan View.
- Social Packs could still look like Daily narrative reuse because Slide 1 and
  Slide 5 consumed Daily `questionDriven` too directly.
- Weekly summary layers still allowed shared question-driven thesis to compete
  with weekly periodic narrative.
- UTC date keys could create Asia/Taipei product-date drift around boundary
  hours.
- Disabled provider health needed structured reason visibility.

What Changed:

- Replaced the fixed AI + Macro Daily narrative branch with event-sensitive
  question, answer, and I-Xuan View construction.
- Added 7-day Daily title uniqueness guard across draft / review / published
  Daily titles.
- Added social-native Daily Social title and I-Xuan helpers so Social Pack uses
  the same market events without directly copying Daily wording.
- Reprioritized Weekly summary / suggestion fields toward weekly periodic
  narrative before shared question-driven fallback.
- Added Asia/Taipei product-date helpers for scheduler date key and generated
  Daily slugs.
- Added provider health `reasonCode` support for disabled sources.
- Added regression checks in `scripts/test-content-engine-v162.mjs`.
- Added `docs/CONTENT_ENGINE_REWRITE_V162.md`.

Provider Decisions:

- Yahoo Finance App Daily RSS remains disabled with `rate_limited` because the
  RSS path repeatedly hit 429 responses.
- Yahoo App quote chart API and backend / Pro yfinance paths are separate
  provider paths and are not disabled by the Daily RSS decision.
- Bloomberg App Daily RSS remains disabled with `disabled_by_policy` until
  stable public RSS access and usage terms are verified.
- No scraping, unofficial feeds, or workaround sources were added.

Out of Scope:

- SSO / Auth.
- LINE / LIFF.
- Membership / Pro integration.
- Provider activation.
- Publish workflow changes.
- Supabase schema changes.
- Stripe, broker integration, portfolio engines, trading, or investment advice.

## v1.63.0 — Taiwan User UX Cleanup

Why:

- Taiwan users were seeing too many mixed English product terms and engineering
  labels in normal user-facing pages.
- `/account` and Pro surfaces exposed backend / account-link / entitlement /
  feature-gate concepts that should be internal or simplified.
- `/portfolio`, `/fcn`, and `/risk` still read like beta skeletons instead of
  clear Pro module entrances.
- Daily / Weekly public pages still used English labels such as Daily Brief and
  Weekly Intelligence in visible UI.

What Changed:

- Added `docs/TAIWAN_USER_UX_CLEANUP_V163.md` as the Taiwan UX source-of-truth.
- Localized normal user-facing labels toward Traditional Chinese.
- Updated `/account` hero and Pro connection card copy.
- Updated `/pro` into a clearer Chinese IXAI Pro entrance with Pro Lab and
  App-side Pro module language.
- Updated `/portfolio`, `/fcn`, and `/risk` module copy to 投資組合分析, FCN 監控,
  and 風險中心.
- Updated `/daily-brief` and `/weekly-brief` archive labels to 每日晨報 and 每週情報.
- Updated `/pro-preview` sample copy and preview badge language.
- Updated 390px mobile QA route expectations for localized copy.

Key Decisions:

- Normal users should see user-facing status language such as 系統連線, 帳號綁定,
  會員方案, 功能權限, 測試可用, and Pro 保留功能.
- Engineering diagnostics such as provider health, scheduler status, raw
  backend state, and provider metadata should remain in admin/internal surfaces.
- `/daily` and `/weekly` are not active App Router routes; the active public
  routes are `/daily-brief` and `/weekly-brief`.

Out of Scope:

- SSO.
- Auth / Supabase / JWT changes.
- Daily / Weekly content generation engine.
- Provider logic.
- Backend or legacy Pro changes.
- Stripe, broker integration, real portfolio / FCN data, trading, or investment advice.

## v1.63.1 — UX Product Role Correction

Why:

- v1.63.0 improved localization, but it also made `/fcn` look like an App-side
  FCN Monitoring entry.
- That blurred the product boundary: the App is public market intelligence,
  education, account, and membership entry; Pro is the advanced investment
  workspace.
- FCN Monitoring can imply personal structured-product risk conclusions, so it
  must remain a Pro / paid / beta capability rather than a free public App page.

What Changed:

- Added `docs/UX_PRODUCT_ROLE_CORRECTION_V1631.md`.
- Changed `/fcn` back into FCN education and introduction.
- Removed the App-local FCN Monitoring skeleton from `/fcn`.
- Simplified `/daily-brief` and `/weekly-brief` reading pages by removing
  non-essential architecture cards from the primary archive view.
- Improved `/pro` icon and CTA contrast guidance / implementation.
- Reorganized `/account` around account status, Pro connection, membership
  plan, and feature access while avoiding raw backend / entitlement /
  feature-gate language.

Key Decisions:

- App may explain FCN concepts, KI / KO, worst-of, and coupon calendar at an
  educational level.
- Personal FCN monitoring, KI / KO watch, worst-of monitoring, coupon
  calendars, portfolio analysis, and risk-engine workflows belong in IXAI Pro.
- Daily / Weekly archive pages should prioritize reading over product
  architecture explanation.

Out of Scope:

- SSO.
- Auth / Supabase / JWT changes.
- Daily / Weekly content generation engine.
- Provider logic.
- Backend or legacy Pro changes.
- Stripe, broker integration, real portfolio / FCN data, trading, or
  investment advice.

## v1.64.0 — App UX / FCN Education / Pro Conversion Redesign

Why:

- v1.63.1 corrected the product role split (App = public education + lead
  capture; Pro = monitoring + workspace) but stopped at structural correction.
- After v1.63.1 the `/fcn` page was education-only and did not convert.
- After v1.63.1 the `/pro` page was a stub wrapping the workspace hub without
  any marketing prelude, so first-time visitors read the page as a status
  notice instead of a value proposition.
- The user is head of 一玄投資 and provides FCN 健檢, portfolio diagnosis,
  and high-net-worth consulting. None of those services had a CTA on the
  public app — the funnel terminated at "申請 Pro 測試".
- The App / Pro / 顧問服務 tri-fold needed to be explicit in user-facing copy.

What Changed:

- Added `docs/APP_UX_REDESIGN_V164.md` — planning document for the cut.
- Rebuilt `/fcn` as education + conversion. Added: "為什麼高資產投資人會用
  FCN" pillar block; "實境舉例" non-advisory worked example; "為什麼今日很
  難做到" manual-pain block; expanded Pro FCN moat list (KI/KO/Worst-of/
  observation calendar/risk tier/concentration/AI alerts) clearly labeled
  as Pro-only; consulting CTA (預約 FCN 健檢); compliance footer.
- Rebuilt `/pro` page wrapper. Added a marketing prelude before the existing
  workspace hub: hero with App-vs-Pro line, three pain-point cards, FCN-
  primary module hierarchy override, consulting CTA. The workspace hub
  itself was left functionally intact.
- Updated `components/pro/pro-workspace-hub.tsx` to render the FCN module
  with a wider span / primary visual treatment in the module grid. Portfolio
  and Risk remain as secondary cards. All entitlement, backend health, and
  account-link logic preserved unchanged.
- Updated `components/home/intelligence-landing.tsx` with a one-line App /
  Pro / 顧問服務 tri-fold under the hero copy block. No structural rebuild.

Key Decisions:

- App stays education + lead capture. FCN Monitoring stays a Pro moat.
- Consulting CTAs route to the existing `/feedback?intent=...` lead-capture
  vector; no new analytics events, no new API surface.
- `/daily-brief`, `/weekly-brief`, `/account` are already in v1.63.1 shape;
  no changes in this cut.
- Homepage gets a copy nudge only — full landing rewrite deferred to v1.65+.
- All v1.62.1 content engine guarantees (title diversification, period
  separation, Asia/Taipei dates) preserved.
- All v1.63 Taiwan UX cleanup guarantees (Traditional Chinese, no
  engineering jargon in public pages) preserved and extended.

Out of Scope:

- SSO. Backend. Supabase. Auth. JWT. Membership entitlements logic.
- Daily / Weekly content generation engine.
- Provider ingestion / news pipeline.
- Trading features, broker integration, Stripe, paywall.
- Real FCN holdings, real portfolio data, real risk monitoring.
- Account page rebalance (deferred to v1.65).
- Full homepage rewrite (deferred to v1.65+).

## v1.64.1 — Visual QA Fix

Why:

- After v1.64.0 shipped, live visual QA found two regressions that the
  v1.64.0 audit had missed.
- The Public Intelligence Engine block was still being rendered on
  `/daily-brief` (via `DailyBriefUnifiedArchive`), on the Daily slug
  page, and on the Weekly slug page. The v1.64.0 audit had assumed
  Daily / Weekly were already in v1.63.1 reading-first shape; the
  audit was wrong.
- The shared `LockedFeatureCard` component used by `/portfolio` and
  `/risk` rendered a pale gold icon on a cream container — exactly the
  "pale gold outline on beige card" pattern the icon-contrast rule
  forbids. Off-token emerald / amber utility classes also lived in the
  same component.
- `/account` carried the same pale-gold-on-cream pattern in
  WatchlistIntelligenceLite and on its feedback buttons.

What Changed:

- Removed `<PublicIntelligenceEngine>` from 4 Daily / Weekly surfaces:
  `components/daily-brief/daily-brief-unified-archive.tsx`,
  `components/daily-brief/daily-brief-local-detail.tsx`,
  `app/daily-brief/[slug]/page.tsx`,
  `app/weekly-brief/[slug]/page.tsx`. Block remains on the homepage and
  on `/share` + `/share/intelligence/[slug]`.
- Rewrote `components/pro/locked-feature-card.tsx`: 36×36 forest icon
  container; gold glyph for locked state, cream glyph for enabled
  state; visible 0.34-opacity border; soft shadow. Enabled card body
  switched from `border-emerald-700/20 bg-emerald-50/70 text-emerald-950`
  to `color-mix(in srgb, var(--ixai-risk-clear), ...)` triplet.
- Updated `components/pro/feature-gated-page.tsx` locked-state
  instruction box: replaced `border-amber-700/20 bg-amber-50/80 text-amber-950`
  with `color-mix(in srgb, var(--ixai-risk-watch), ...)` triplet and
  added a forest-iconed ShieldCheck container for the instruction.
- Updated `components/account/watchlist-intelligence-lite.tsx`: Brain
  card icon and ShieldCheck disclaimer aside icon switched to the
  forest+gold pattern.
- Updated `app/account/page.tsx` feedback buttons: leading glyphs
  (MessageSquare, Bug) now use `text-[var(--ixai-forest)]` so they
  match the button's forest text color instead of fading on cream;
  trailing ArrowUpRight glyphs keep gold as the forward-action accent.
- Added `docs/VISUAL_QA_FIX_V1641.md` with the codified rules.
- Added Icon Contrast Rule and Public Intelligence Engine Placement
  Rule to `docs/PROJECT_RULES.md`.

Key Decisions:

- `<PublicIntelligenceEngine>` belongs on homepage and acquisition
  surfaces only. Daily / Weekly / Pro / Account surfaces must not
  render it.
- Card icons on cream surfaces must use the dark-forest container +
  gold (or cream) glyph + visible border pattern, at minimum 32×32
  (prefer 36×36).
- Inline button glyphs may match the button text color and skip the
  container; trailing forward-action glyphs may keep gold accent.
- Off-token Tailwind colors (`emerald-*`, `amber-*`, `red-*`) are
  forbidden on Pro surfaces — must use IXAI risk tokens via
  `color-mix()`.

Out of Scope:

- SSO. Backend. Supabase. Auth. JWT. Membership entitlements logic.
- Daily / Weekly content generation engine.
- Provider ingestion / news pipeline.
- Trading features, broker integration, Stripe, paywall.
- Real FCN holdings, real portfolio data, real risk monitoring.
- FCN education content (unchanged).
- Account / homepage rebalance (still deferred to v1.65).
- Pale-icon containers on `/about`, `/feedback`, and home component
  children (deferred to a future design-system pass).

## v1.64.2 — Shared Icon System + Visual Screenshot QA

Why:

- v1.64.1 codified the Icon Contrast Rule in PROJECT_RULES but each
  consumer still inline-styled its own 36×36 forest container. Small
  drift had already started — `h-9 w-9` vs `h-10 w-10`, border
  opacities 0.24 / 0.28 / 0.32 / 0.34, inconsistent shadow specs.
- Future contributors could slip a pale-gold-on-cream pattern back in.
  The rule needs a code-enforced primitive, not just a doc.
- The icon-contrast complaint also asked for visual screenshot QA on
  /pro, /account, /portfolio, /risk; no script existed.

What Changed:

- New shared primitive `components/ui/feature-icon.tsx`. Sizes md
  (36×36) and sm (32×32); tones gold (accent) and cream (success).
  Forest container + visible border + optional shadow. Cannot be
  mis-sized below the Icon Contrast Rule floor.
- Migrated 5 consumers off inline `<span>` markup to `<FeatureIcon>`:
  - `components/pro/locked-feature-card.tsx` (used by /portfolio, /risk)
  - `components/pro/feature-gated-page.tsx` (used by /portfolio, /risk)
  - `components/account/watchlist-intelligence-lite.tsx` (used by /account)
  - `components/pro/pro-workspace-hub.tsx` (used by /pro)
  - `app/pro/page.tsx` (pain-point cards + App-vs-Pro AlarmClock)
- New screenshot QA: `scripts/qa-visual.mjs` + `npm run qa:visual`.
  Playwright launches a 390×844 mobile viewport, navigates each of
  /pro /account /portfolio /risk, saves a full-page PNG to
  `tmp/visual-qa/<route>-<timestamp>.png`. `/tmp` is gitignored.
- Added `docs/SHARED_ICON_SYSTEM_V1642.md` (rule + rollback plan).

Key Decisions:

- One primitive, not per-page CSS. The rule must be self-enforcing in
  code, not just in markdown.
- No `lg` size — `<FeatureIcon>` floors at 32×32 / 36×36 by design.
- Visual QA is a script, not a manual checklist. Screenshots are local
  artefacts (gitignored); the script is committed.
- `/fcn` not migrated this turn — its icons are already in forest-bg
  shape from v1.64.0 and `/fcn` is not in the v1.64.2 brief scope.
- `<PublicIntelligenceEngine>`, FCN education content, Pro copy,
  Account layout untouched.

Out of Scope:

- SSO. Auth. Supabase. JWT. Backend. Providers.
- Daily / Weekly content. Generation engine.
- FCN education page redesign.
- /pro copywriting changes. /account layout rebalance.
- Pale icons in `/about`, `/feedback`, and home component children
  (deferred to a future design-system pass).
- Stripe, paywall, broker integration, real portfolio data.

## v1.66.0 — Homepage Conversion Redesign

Why:

- The homepage still felt like a technical product-system page after the
  Pro module pages were fixed.
- Taiwan visitors need to understand in the first 10 seconds what IXAI is,
  why I-Xuan is credible, why FCN is a core moat, and what action to take.
- The homepage needed to connect 一玄投資顧問能力 with IXAI's AI investment
  intelligence system instead of over-explaining internal architecture.

What Changed:

- Added `docs/HOMEPAGE_CONVERSION_REDESIGN_V166.md`.
- Rebuilt `/` around a clear conversion flow: hero, trust / origin, pain
  points, what IXAI provides, FCN moat, App / Pro / Consulting split,
  compact Daily / Weekly entry, and final CTA.
- Replaced English-heavy and technical homepage modules with Chinese-first
  product communication.
- Made FCN monitoring the homepage's primary Pro differentiation message.
- Added `/` to visual screenshot QA coverage.

Key Decisions:

- App = public intelligence, education, and account activation.
- IXAI Pro = advanced monitoring workspace for FCN, portfolio, and risk.
- Consulting = high-touch FCN checkup, portfolio diagnosis, and advisory
  service.
- Public homepage must not read like a system architecture page.

Out of Scope:

- SSO, Auth, Supabase, JWT.
- Backend / legacy Pro.
- Daily / Weekly generation.
- Provider ingestion.
- Stripe / payment.
- Broker integration.
- Real portfolio / FCN data.
- Trading features or investment advice.

## v1.65.0 — Pro Module Product Pages Redesign

Why:

- v1.64.2 made icons readable, but `/pro`, `/portfolio`, and `/risk` still
  felt like permission or skeleton pages rather than product-value pages.
- Taiwan users need to understand what IXAI Pro is, why Portfolio / FCN /
  Risk matter, and why Pro testing or consulting is relevant before they see
  access states.
- Icon fixes alone cannot explain product value.

What Changed:

- Added `docs/PRO_MODULE_PAGES_REDESIGN_V165.md`.
- Rebuilt `/pro` as a conversion page: hero, pain points, FCN-first module
  positioning, App vs Pro explanation, and CTAs for Pro testing, FCN health
  check, and consulting.
- Rebuilt `/portfolio` as a product-value page explaining asset allocation,
  concentration risk, theme exposure, FCN overlap, and market-risk linkage.
- Rebuilt `/risk` as a product-value page explaining market regime, major
  events, concentration, FCN risk, scenarios, and AI risk summaries.
- Used the existing shared `FeatureIcon` primitive for the redesigned cards.

Key Decisions:

- App = education / public intelligence / lead capture.
- Pro = paid or invited professional monitoring workspace.
- Consulting = personalized high-touch advisory service.
- FCN Monitoring remains the primary Pro wedge, but `/fcn` remains a public
  education page.

Out of Scope:

- SSO.
- Auth / Supabase / JWT.
- Backend / legacy Pro.
- Daily / Weekly generation.
- Provider ingestion.
- Stripe / payment.
- Broker integration.
- Real portfolio / FCN data.
- Trading features or investment advice.
