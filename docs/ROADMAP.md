# IXAI Roadmap

This document is the high-level product continuity layer for IXAI. It should help future AI agents understand what comes next without re-litigating the whole product direction.

## Current Version

`v1.85 / Portfolio Intelligence Dashboard MVP`

## Current Priority

IXAI has completed the Portfolio Foundation, FCN Foundation, FCN Worst-of Engine, FCN Risk Engine MVP, FCN Intelligence Layer MVP, and first Portfolio Intelligence Dashboard MVP. Current priority remains the main product line:

- Portfolio Intelligence Dashboard validation on `/risk` and `/pro`.
- SaaS Membership / Entitlement.
- Legacy Pro gradual retirement into IXAI App.

Do not restart v1.82-v1.83 Social Pack hotfix work unless production Social Pack export regresses again and the incident-prevention rules in `docs/PROJECT_RULES.md` are followed.

## Future Version Plan

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

### v1.86 — SaaS Membership / Feature Gate

- Free.
- Pro.
- Advisor.
- Entitlement-based feature gating.
- Portfolio / FCN / Risk Engine limits.
- Feature access must be enforced through membership / entitlement logic, not frontend hiding alone.

### v1.87 — Portfolio Intelligence Expansion

- Asset allocation.
- Concentration.
- Exposure analysis.
- FCN overlap.
- AI summary.
- Compliance-safe monitoring language only.

### v1.88 — Stock / Crypto Position Expansion

- Stock positions.
- ETF positions.
- Crypto spot.
- Grid / dual investment future-ready fields.
- No broker execution and no automated trading.

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
