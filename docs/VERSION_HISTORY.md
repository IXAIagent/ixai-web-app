# IXAI Version History

This document is a concise continuity layer for AI handoff. It captures why each recent version existed, what changed, key decisions, and what stayed out of scope.

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
