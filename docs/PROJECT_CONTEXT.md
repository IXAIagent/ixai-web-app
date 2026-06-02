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

## Current Product State

Current Version:

`v1.52.0`

Current Core Flow:

```text
Landing
→ Onboarding
→ Account
→ Future Pro Interest
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
- Pro Intelligence: future Portfolio Intelligence, Risk Intelligence, AI Alerts, FCN risk workflow.
- Admin / Editorial Intelligence: human-reviewed Daily / Weekly generation, Provider Health, Coverage Score, Social Pack production, and future Publish Center operations.

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

1. Weekly Revision Migration Review / Rollout.
2. Publish Center Foundation.
3. Monthly / Yearly Periodic Intelligence planning.
4. Continued Social Pack Period Divergence QA after future Daily / Weekly engine changes.

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
- Production route QA after v1.50.2 found repeated Next.js `_rsc` prefetch abort noise for `/fcn` and `/weekly-brief`. This did not create console errors or route failures, but future navigation/prefetch policy changes should verify these routes.
- Provider coverage is materially improved in v1.41.3, but Reuters, Bloomberg, Yahoo Finance, CNYES, 工商時報, 經濟日報, and MoneyDJ remain disabled until stable legal RSS/API access is verified.
- Market Memory Layer is local / editorial-first and uses recent Daily Briefs as narrative context. It must not be represented as personal market memory, portfolio memory, or individualized investment advice.

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

## H. See Also

- `docs/PRODUCT_ORIGIN.md`: origin layer for why IXAI exists and how 一玄 advisory, monitoring, Morning Brief, Public Intelligence, Account Intelligence, and Future Pro Intelligence connect.
- `docs/AI_MORNING_BRIEF_HISTORY.md`: historical record of the pre-app AI Morning Brief, FCN monitoring, Crypto Grid / Dual monitoring, IXAI Agent, and Public App evolution.
- `docs/IXAI_VISION.md`: long-term vision layer for IXAI as an AI-native Wealth Intelligence Operating System.
