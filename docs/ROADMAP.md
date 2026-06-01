# IXAI Roadmap

This document is the high-level product continuity layer for IXAI. It should help future AI agents understand what comes next without re-litigating the whole product direction.

## Current Version

`v1.46.0`

## Related Strategic Documents

- `docs/PRODUCT_ORIGIN.md`
- `docs/IXAI_VISION.md`

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

Next:

`v1.43.2 — Weekly Revision Migration Review / Rollout`

## Next Suggested Version

`v1.43.2 — Weekly Revision Migration Review / Rollout`

Goal:

- Review and apply the Weekly revision migration only after backup and approval.
- Verify that same-week canonical published weekly + revision draft can coexist.
- Verify revision publish promotion, previous canonical archival, and canonical public reads.
- Do not auto-overwrite published Weekly Intelligence or change public URL behavior without review.

## Future Roadmap

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
