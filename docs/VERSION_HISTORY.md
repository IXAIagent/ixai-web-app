# IXAI Version History

This document is a concise continuity layer for AI handoff. It captures why each recent version existed, what changed, key decisions, and what stayed out of scope.

## Historical Context

- `docs/AI_MORNING_BRIEF_HISTORY.md`: detailed pre-app history of the Telegram Morning Brief, FCN risk monitor, Binance Grid / Dual monitoring, IXAI Agent, and Public App evolution.

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
