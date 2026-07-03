# IXAI Project Rules

This document is the AI development constitution for IXAI. It defines boundaries, governance, and done criteria for future AI-assisted work.

## A. Architecture Rules

Do not break or casually rewrite these systems:

- Auth and lightweight identity session architecture.
- Supabase schemas and persistence contracts.
- LINE Login flow.
- LIFF identity restore and merge foundations.
- FCN engine and calculation logic.
- Analytics event schema and provider abstraction.
- Editorial publish / review workflow.
- Market quote and news provider pipelines.
- Onboarding profile foundation and local/session-first state model unless a persistence migration is explicitly requested.
- Intelligence delivery foundation, especially opt-in boundaries and Public / Pro tier separation.

Public and admin surfaces must remain separated:

- Public app: user-facing intelligence, education, conversion, and account surfaces.
- Admin console: internal operations, editorial workflow, analytics, audience, distribution, and system status.
- Pro surfaces: conversion, preview, and gated intelligence shell.

Do not merge these shells without an explicit architecture audit.

## A1. Production Persistence Contract Rules

Portfolio / FCN / Stock / Crypto tables are production persistence contracts.

Current production contracts:

- `portfolios`
- `fcn_positions`
- `fcn_underlyings`
- `stock_positions`
- `crypto_positions`

Rules:

- Do not casually rename, rewrite, or delete these schemas without a migration plan, staging validation, rollback plan, and explicit approval.
- Portfolio / FCN / Risk features must preserve Supabase ownership isolation and RLS.
- Every private Portfolio / FCN / Stock / Crypto API must validate the authenticated Supabase user and must not allow cross-user reads or writes.
- Production migrations must be staged first and validated with authenticated CRUD, User A / User B isolation, unauthenticated 401 behavior, soft archive, lint, build, and UI smoke checks.
- SaaS feature gating must use membership / entitlement logic. Do not expose paid Pro features only by frontend hiding.
- v1.86 membership tiers are `free`, `basic`, and `pro`; do not introduce payment-provider-specific logic into this foundation without a separate approved billing version.
- Free / Basic may access Portfolio, FCN, and Risk foundation surfaces; full Pro Workspace access requires `canViewPro`.
- Paid Pro-only APIs must enforce entitlement server-side. A frontend disabled button or hidden card is not sufficient for production access control.
- Legacy Pro compatibility may map explicit `legacy_pro` / manual access flags to Pro tier, but do not migrate Legacy Pro JWT, localStorage auth, or direct FastAPI protected request patterns into the production App.
- FCN Risk Engine must remain monitoring, risk awareness, and workflow support. It must not output personalized product advice, product recommendation, buy/sell instruction, guaranteed coupon language, target price, or automated trading instruction.
- Legacy Pro data and JWT/session patterns must not be migrated wholesale into the production App. Reuse product concepts, not the legacy auth architecture.


The root route `/` is the public product landing surface. It should explain IXAI and route users into onboarding, Pro preview, LINE, or account flows. Do not convert it back into a login-only gate without explicit product approval.

Public, preview, account, LINE, and Pro surfaces should share one user journey:

```text
Public Landing → Onboarding → AI Intelligence Workspace → Future Pro Interest
```

Intelligence Preview is a secondary route for users who ask for deeper context, not the default next step after onboarding.

Prefer CTA wording such as "開始 Onboarding", "建立 Intelligence Layer", "回到 AI Intelligence Workspace", "查看 Intelligence Preview", "連接 LINE 接收情報", and "加入 Pro 等候名單".

Share routes under `/share` are public acquisition surfaces. They must stay educational, risk-aware, and connected to onboarding / preview / LINE without implying investment advice or live personalized monitoring.

Public Intelligence access rule:

```text
LINE / Social / Share → Daily / Weekly / Share Intelligence → Onboarding → Account → Personal Intelligence
```

Daily Brief, Weekly Intelligence, Share Intelligence, and the root landing are public trust-building surfaces. Do not put an account wall before public content reading. Account, Pro, Pro Preview, Pro Intelligence, admin, and sensitive APIs must remain protected or gated according to their existing route policy.

Public Route Gate rules:

- Public Intelligence routes must not be blocked by `AuthEntryGate` or session hydration.
- Public content routes should render before account creation.
- Auth/session checks may enhance CTA state but must not prevent public content reading.
- Protected routes such as account, admin, Pro Intelligence, and sensitive APIs must remain gated through their existing route-specific protection.
- Public route allowlists must be kept explicit and audited when new public acquisition routes are added.

## B. Design System Rules

Product First Rule:

- UX priority is higher than new feature creation during V15 Product Experience Redesign.
- Unless a major product requirement explicitly approves it, do not add Engine, Runtime, Provider, Cache, Source status, Readback, Diagnostics, Activation, Foundation, or Readiness content to the first screen of Workspace pages.
- Workspace first screens should prioritize Morning Brief, Portfolio, Risk, Alerts, Market, and Quick Actions.
- Diagnostics belong at the bottom of the page, collapsed by default, or under Settings -> Advanced.
- Future V15 work must follow `docs/V15_PRODUCT_EXPERIENCE_CONTEXT.md`, `docs/V15_DESIGN_SYSTEM_2.md`, and `docs/V15_SPRINT_2_UI_IMPLEMENTATION_SPEC.md`.

CTA and icon color rules:

- Forest CTA: cream text with cream or gold icon.
- Gold CTA: forest icon and forest text.
- Cream surface: forest text with gold or forest icon.
- Dark forest surface: cream text with gold highlights.
- Icons must use `currentColor` or explicit IXAI design tokens.
- Icons must not appear black or near-black on public UI unless part of approved text color on a light surface.
- Icons must not use low contrast opacity on key CTA surfaces.

Avoid:

- Hardcoded black icons.
- Excessive opacity reductions on CTA icons.
- Utility-class conflicts where a child icon overrides CTA intent.
- Overuse of `!important`.
- Patch-style CSS that piles new overrides on top of old overrides.
- Cascading hotfixes without root-cause audit.

When fixing visual regressions, identify the shared component and rendered route before patching.

## C. UI / Mobile Rules

Every public, admin, and Pro surface must support 390px mobile width.

Required:

- No horizontal overflow.
- CTA buttons must stack or wrap safely on mobile.
- Long emails, slugs, URLs, and labels must truncate or wrap.
- Sidebar, mobile header, bottom nav, and footer spacing must remain consistent.
- CTA alignment must be consistent across public / admin / Pro shells.
- Cards must preserve readable padding and line-height on Chinese copy.

Do not make desktop-only fixes that break mobile, and do not make mobile-only markup drift away from desktop behavior without documenting why.

Mobile Visual QA Rules:

- Public, account, Pro, and admin surfaces must pass 390px mobile smoke checks before major release.
- No horizontal overflow is allowed on public acquisition or account intelligence surfaces.
- CTA groups must wrap or stack safely.
- Browser binaries must not be committed.
- QA scripts should remain lightweight and should not rewrite product architecture.

Social Pack Layout Safety Rules:

- Every 9:16 social slide must reserve header, main, and footer safe areas.
- Footer and disclaimer must never overlap with main content.
- Social pack copy must be compressed for mobile social reading.
- Long source content must be summarized before rendering; core headings and primary insights must not show clipped ellipsis fragments.
- PNG export must be visually inspected after layout changes.
- Slide content must use flex column flow (`header / main flex-1 / footer`); only background decoration may be absolutely positioned.
- Social typography must respect the export ceilings: cover H1 ≤ 72px, content H1 ≤ 64px, body ≤ 34px, footer 22–26px, disclaimer 18–22px at 1080×1920 export scale.
- Per-slide copy should prefer fewer complete points over many clipped points. Cover should surface 3-5 concise Executive Summary bullets when available.
- Risk Watch slide may show one regime state, 2-3 short reasons, and one readable FCN Awareness line. It must not collide with the footer.
- I-Xuan View should be a complete concise branded viewpoint, not a clipped headline fragment.

Icon Contrast Rule (v1.64.1):

- Card icons and badge icons on light (cream / white) surfaces must use a dark forest icon container (`bg-[var(--ixai-forest)]`), with a gold (`text-[var(--ixai-gold)]`) or cream (`text-[var(--ixai-cream)]`) symbol, a visible border (at least `border-[rgba(9,41,31,0.32)]`), and a minimum 32×32 (`h-8 w-8`) size — prefer 36×36 (`h-9 w-9`) for primary cards.
- Inline button glyphs (16×16 alongside button text) may skip the container, but must match the button's text color. Trailing forward-action glyphs (ArrowRight, ArrowUpRight) may keep `text-[var(--ixai-gold)]` as a forward-cue accent.
- Forbidden: `bg-[rgba(176,141,87,0.10)]` / `bg-[rgba(176,141,87,0.13)]` icon containers on cream surfaces; pale gold icons on `bg-white/55` without a container.
- Forbidden: off-token Tailwind utility colors for state pills on Pro / Account / Portfolio / Risk surfaces — `border-emerald-*`, `bg-emerald-*`, `text-emerald-*`, `border-amber-*`, `bg-amber-*`, `text-amber-*`, `border-red-*`, `bg-red-*`, `text-red-*`. Use `color-mix(in srgb, var(--ixai-risk-*), ...)` over `--ixai-risk-clear` / `--ixai-risk-watch` / `--ixai-risk-elevated` / `--ixai-risk-critical` instead.

Public Intelligence Engine Placement Rule (v1.64.1):

- `<PublicIntelligenceEngine>` may only render on the homepage and on acquisition / share surfaces (`/`, `/share`, `/share/intelligence/[slug]`).
- Daily / Weekly archive and detail pages must remain reading-first and must not render `<PublicIntelligenceEngine>`. This applies to `/daily-brief`, `/daily-brief/[slug]`, `/weekly-brief`, `/weekly-brief/[slug]`, the `DailyBriefUnifiedArchive` component, and the `DailyBriefLocalDetail` component.
- Pro surfaces (`/pro`, `/pro-preview`, `/pro-intelligence`) and `/account` must not render `<PublicIntelligenceEngine>` — Pro is the conversion surface, Account is the workspace, neither is the architecture explainer.
- Code review should fail any diff that re-introduces the `PublicIntelligenceEngine` import on a Daily / Weekly / Pro / Account surface without an explicit product decision.

## D. Commit Rules

Use small commits.

Rules:

- One feature or fix per commit.
- Run lint and build before commit when code changes are made.
- Do not make giant refactors without an audit document or explicit approval.
- Preserve user changes in the working tree.
- Do not revert unrelated changes.

Commit message examples:

- `feat: add membership foundation v1.37.1`
- `fix: repair production auth redirect`
- `style: polish mobile CTA alignment`
- `refactor: normalize shell primitives`
- `docs: initialize IXAI project context and governance rules`

## E. AI Workflow Rules

Before starting substantial work, read:

- `docs/PROJECT_CONTEXT.md`
- `docs/PROJECT_RULES.md`

Before editing:

- Inspect `git status`.
- Audit the relevant files.
- Identify whether the issue is local, shared component, route shell, API, or persistence layer.
- Patch only after the source is understood.

Forbidden:

- Large changes without understanding the current architecture.
- Guessing from screenshots when source / DOM can be inspected.
- Pushing or committing without verification.
- Rewriting flows outside the requested scope.
- Touching admin, auth, Supabase, LINE, analytics, FCN, or market systems when the task is visual-only.

## F. Security Rules

Never:

- Hardcode secrets.
- Commit `.env` files.
- Expose Supabase service role keys to client code.
- Send auth tokens, cookies, service role keys, or LINE secrets to analytics.
- Expose raw `line_user_id` or sensitive identity payloads in analytics.
- Return raw database errors to public UI.

Analytics must sanitize payloads. Subscriber and identity analytics should avoid raw personal data unless explicitly required and safe.

Onboarding analytics must not send raw watchlist symbols, phone numbers, auth tokens, LINE user IDs, or other sensitive identifiers. It may send aggregate counts, option IDs, surface names, and non-sensitive preference categories.

Delivery analytics must not send raw LINE user IDs, email addresses, watchlist symbols, portfolio holdings, auth tokens, or notification tokens. Real push delivery must require explicit opt-in, pause/unsubscribe controls, and a server-side delivery log before production automation.

## G. Monetization Rules

IXAI monetization is based on membership and intelligence workflow, not signal selling.

IXAI must not:

- Provide direct individual investment advice.
- Provide automatic trading or order execution.
- Promise returns.
- Sell "hot tips" or "guaranteed" outcomes.

IXAI should emphasize:

- Intelligence.
- Workflow.
- Risk awareness.
- Personal market memory.
- Membership and entitlement-based product value.

Membership is more important than signals.

## H. Product Strategy Rules

Public surfaces may provide:

- Market Intelligence.
- Educational content.
- Awareness content.
- General risk context.
- Daily and weekly market interpretation.
- Market Pulse.
- Macro Watch.
- AI / Tech Watch.
- Crypto Watch.
- FCN Awareness.
- Risk Regime.

Public surfaces must never provide:

- Personalized portfolio analysis.
- Personal FCN risk conclusions.
- Buy / sell recommendations.
- Target prices.
- Return promises.

Public Intelligence must not be written as individual investment advice. It may explain market context, risk awareness, education, and general scenario observation, but it must not tell a specific user what to buy, sell, hold, size, hedge, subscribe to, redeem, or execute.

FCN / Portfolio / Crypto Boundary Rules:

- FCN, portfolio, crypto, grid, dual, and watchlist content may provide risk awareness, monitoring, education, and scenario context.
- These surfaces must not provide buy/sell instructions, automatic trading instructions, exact position sizing, target prices, guaranteed returns, guaranteed coupon language, or personalized execution recommendations.
- FCN content must not imply personal knock-in probability, personal knock-out expectation, principal protection, or product suitability unless a future compliant Pro workflow explicitly supports it.
- Crypto Grid / Dual content must not imply automated Binance execution, grid parameter recommendations, guaranteed yield, or leverage instructions.
- Portfolio Intelligence and Pro Intelligence must preserve compliance boundaries: no brokerage execution, no individualized investment advice, no performance promises, and no automated trading.
- Any future Pro workflow that touches portfolio, FCN, crypto, or AI alerts must be framed as intelligence, risk context, monitoring, and workflow support unless separately approved by legal/compliance review.

News Provider Recovery Rules:

- Only enable providers that are publicly accessible, technically stable, and appropriate for headline / summary intake.
- Do not mark a provider as active if it is reachable but contributes zero usable items.
- Empty feeds, 403 / 404 responses, rate limits, and compliance uncertainty must remain visible in Provider Health.
- Provider recovery should improve source, category, and symbol diversity without inflating Coverage Score synthetically.
- Reuters, Bloomberg, Yahoo Finance, Taiwan financial sources, or any third-party source must stay disabled when legal access, RSS stability, or endpoint reliability is not verified.
- IXAI uses headlines, links, timestamps, and short feed summaries for editorial intelligence; it must not scrape full article text unless explicitly approved.

Account surfaces may provide:

- Watchlist Intelligence Lite.
- Preference memory.
- Identity continuity.
- LINE readiness.
- Future delivery setup.

Watchlist Intelligence Lite Rules:

- Watchlist Intelligence Lite may organize user-selected symbols, markets, and themes.
- It must not imply holdings, position size, cost basis, or portfolio risk.
- It must not generate buy/sell recommendations, target prices, or trading instructions.
- It should connect user interests to public intelligence modules.
- It must preserve local/session-first behavior unless a persistence migration is explicitly approved.
- It should route users toward Account Intelligence, LINE readiness, and Future Pro Interest without implying paid advice.

LINE Delivery Foundation Rules:

- LINE delivery must remain opt-in.
- Delivery preferences must not imply active push automation unless the delivery system is actually implemented.
- Pause and unsubscribe concepts must be present before any production push delivery.
- Public delivery must remain general and educational.
- Account delivery may use preference memory but must not imply personalized portfolio advice.
- Future Pro delivery may be designed but not represented as active unless implemented.
- Delivery analytics must not send raw LINE user IDs, watchlist symbols, portfolio holdings, auth tokens, email addresses, or notification tokens.

Social Intelligence Engine Rules:

- Social Intelligence content must be generated from reviewed Daily / Weekly Intelligence content or a clearly marked editorial-safe fallback.
- Social packs are promotional distribution assets, not standalone investment advice.
- All social packs must include disclaimer language.
- Social packs must not include buy/sell recommendations, target prices, return promises, or personalized portfolio/FCN conclusions.
- FB / IG / LINE publishing must remain manual unless a future Publish Center with explicit approval is implemented.
- Automated publishing requires human review, audit trail, platform API governance, and compliance approval.
- Social visual templates should use 一玄 / IXAI institutional brand language: forest green, muted gold, cream, premium editorial density, and no crypto-hype effects.

Social Brand Rules:

- Social Intelligence assets must use approved 一玄 / IXAI branding.
- Social packs must preserve institutional and educational positioning.
- Logo placement should remain consistent across cover and non-cover slides.
- Disclaimer must remain visible.
- Marketing assets must not resemble trading signal advertisements.
- The official brand logo source for Social Pack templates is `/logo/ixuan-logo.png`.

Social Pack Export Rules:

- Exported PNG assets must preserve approved branding.
- Logo, footer, and disclaimer must remain visible.
- PNG export must not imply automated publishing.
- Export assets remain subject to editorial review.
- Export tooling should stay browser-based and lightweight unless a future Publish Center is explicitly approved.

Social Layout Rules:

- Social Packs prioritize readability over decorative UI.
- Content hierarchy must be optimized for mobile social consumption.
- Intelligence insights should be concise.
- Visual design should resemble institutional research content rather than app marketing.
- Avoid oversized headers, dominant page numbers, and border-heavy app-card layouts inside 9:16 Social Packs.

Pro surfaces may provide, once implemented:

- Portfolio Intelligence.
- Risk Intelligence.
- AI Alerts.
- Personal FCN workflow.
- Personalized market relevance.

Keep Public, Account, and Pro product value clearly separated.

Public Intelligence Engine governance:

- Market Pulse, Macro Watch, AI / Tech Watch, Crypto Watch, FCN Awareness, and Risk Regime are public trust-building modules.
- These modules may provide general market awareness, education, and risk context.
- These modules should route users toward onboarding and account setup, not direct trading.
- These modules must not provide personalized portfolio analysis, personalized FCN risk conclusions, buy/sell recommendations, target prices, return promises, or automated trading instructions.
- Any future dynamic provider integration must preserve Public / Account / Pro separation.

Public Intelligence Compliance Layer:

- Public Intelligence must clearly distinguish education from personalized advice.
- Public Intelligence modules should include appropriate disclaimer language when discussing FCN, Crypto, Macro, or Risk topics.
- Risk Regime is educational context only and must not be framed as a market prediction tool.
- FCN Awareness is educational context only and must not imply personal FCN risk assessment, knock-in probability, product recommendation, guaranteed coupon, or principal protection.
- Public Intelligence surfaces should reinforce onboarding and account journeys rather than direct trading actions.

Daily Intelligence Rules:

- Daily Brief must prioritize insight over summary.
- Daily Brief should target 3-5 minute reading value.
- Daily drafts should target 800-2000 words or equivalent CJK content depth.
- Risk Regime must include reasoning, not only a single status label.
- I-Xuan View must be present in every Daily Brief draft.
- Executive Summary should surface the five most important points in concise form.
- Macro Watch, AI / Tech Watch, Crypto Watch, Risk Regime, FCN Awareness, and I-Xuan View are required Daily Intelligence sections.
- Daily Brief content must not include buy/sell recommendations, target prices, return promises, or personalized portfolio / FCN conclusions.
- Editorial drafts that lack source coverage, content length, or insight depth should be visibly flagged before manual publish.
- Provider Health, Coverage Score, Content Quality Score, raw provider errors, and source debug metadata are admin-only diagnostics and must not be exposed through public Daily Brief responses.

Periodic Intelligence Source Rules:

- News Source is the source of truth. IXAI Intelligence Engine interprets news intake into period-specific outputs.
- Periodic outputs must follow News Source → Event Extraction → Signal Extraction → Tension / Change Detection → Insight Generation → Brief → Social Pack.
- Daily and Weekly briefs must include key events, market signals, narrative tension, what changed, why it matters, what to watch next, and I-Xuan View.
- Social Packs must use the insight social funnel: hook, conflict, payoff, and contextual CTA.
- Daily, Weekly, Monthly, and Yearly are separate periodic intelligence products, not nested summaries of each other.
- Daily Intelligence should use recent daily news intake and produce Daily Brief + Daily Social Pack.
- Weekly Intelligence should use weekly news intake, weekly categorization, weekly events, next-week calendar, and periodic narrative model as its primary source.
- Daily Intelligence Core may be used as optional continuity context for Weekly, but it must not be the primary Weekly source or override weekly news-source narrative.
- Monthly / Yearly are reserved periods; type/model support may exist before full product implementation.
- Social Packs must derive hooks, conflict, payoff, risk contrast, and CTA from the reviewed period narrative. They must not invent a separate narrative disconnected from the reviewed period brief.
- If themes overlap across periods, the copy should explain what changed, what extended, or what faded. Do not repeat generic statements such as "AI is important" or "rates are important" without a difference-aware angle.
- Daily / Weekly / Social surfaces should reinforce the content funnel: Social Pack → Daily / Weekly Intelligence → Account → Future Pro Interest.
- Periodic intelligence architecture must not require Supabase schema changes unless explicitly approved.

Weekly Revision Workflow Rules:

- Weekly Intelligence may support revisions only through an explicit reviewed workflow; do not overwrite a published weekly row as an implicit draft.
- A week may have multiple revisions only after the approved revision migration is applied.
- Public Weekly routes must prefer the canonical published weekly row when the revision schema is available.
- Only one canonical published weekly should exist per week_start / week_end range.
- Previous canonical revisions should be preserved for audit/history and marked non-canonical or archived when a newer revision is published.
- Production Supabase migration for weekly revisions requires backup, review, and explicit approval before execution.
- Until the migration is applied, Weekly generation should keep the locked behavior and clearly explain that revision workflow requires migration.

Intelligence Distribution Layer Rules:

- Distribution preferences may organize frequency, categories, and channels for future intelligence delivery.
- v1.42.0 enables In-App preference only; LINE, Email, and Push channels must remain future / disabled until a later approved delivery system exists.
- Distribution Queue is an operational foundation view, not a sending queue.
- Draft / Reviewed / Published status may be shown in Admin, but it must not imply external delivery has occurred.
- No LINE push, email, push notification, marketing automation, conversion attribution, or user profiling may be added without explicit approval.
- Distribution analytics may record lightweight published / viewed operational events only. They must not include raw email, LINE user ID, watchlist symbols, portfolio holdings, auth tokens, or notification tokens.
- Any future external delivery requires explicit opt-in persistence, delivery logs, pause/unsubscribe controls, human review, and compliance approval.

Question Driven Intelligence Rules:

- Daily and Weekly Intelligence should begin from a central market question, not a generic summary.
- Every question-led output should include key answer, evidence, counter-evidence, watch next, and I-Xuan View.
- Social Packs should assign different roles to each slide: question, answer, evidence, counter-evidence / risk, and I-Xuan View + CTA.
- Do not repeat the same thesis across multiple slides.
- Avoid generic analyst phrases such as 市場訊號正在轉向, 投資人持續觀察, 風險偏好受到壓力, 值得關注, 持續關注, 市場情緒變化, 事件背後的市場訊號, AI敘事仍有吸引力.
- Question-driven outputs remain public education and market interpretation only; they must not become buy/sell recommendations, target prices, return promises, or automated trading instructions.

Weekly Persistence / Social Layout Rules:

- Weekly generation must never silently claim success when Supabase persistence fails or the same-week revision workflow is locked.
- If the revision schema is unavailable and a published weekly already exists for the range, Admin must show the existing weekly id/slug, blocked reason, migration requirement, and next action.
- Weekly revision migration SQL must remain manually reviewed and explicitly applied; application code must not auto-apply database migrations.
- Social Packs must apply format-specific layout constraints before rendering.
- IG Feed / Carousel 4:5 and Story / Reels 9:16 are separate output systems with separate text limits.
- Social Pack text must be compressed before rendering; slide 5 must never render full long-form I-Xuan View if it exceeds the safe card limit.
- Footer, page number, URL, and disclaimer must remain visible and must not overlap body content.

Social Intelligence Rewrite Rules:

- Social Packs should be generated as slide-native conversion cards, not compressed brief pages.
- Daily Social Pack roles are Hook, What the market is seeing, Real risk, Watch next, and I-Xuan View.
- Weekly Social Pack roles are Weekly question, What changed this week, The one thing that matters, Next week catalysts, and I-Xuan Weekly View.
- Each slide should introduce new information and avoid duplicating the same thesis.
- Cards should avoid both paragraph walls and one-line underfilled slides.
- Daily Social Pack source priority must be: Daily current news / event signal, Daily question-driven insight, Daily Brief / Daily Core fields, then Daily-only fallback.
- Weekly Social Pack source priority must be: Weekly major events, Weekly upcoming events / next-week catalysts, Weekly periodic narrative, Weekly-only I-Xuan View, then Weekly-only fallback.
- Hard rule: Daily Social Pack and Weekly Social Pack are different products. Daily must answer what happened today, today's biggest market question, and what to watch today. Weekly must answer what changed this week, what next-week catalysts matter, and whether the weekly thesis is extending, reversing, or rotating.
- Weekly Social Pack must not directly reuse Daily Social Pack generator output.
- Weekly Social Pack must not use Daily Core as its primary narrative source; Daily Core may only provide optional continuity context.
- Weekly Social Pack must not prioritize generic shared `questionDriven` output if that output was built from Daily continuity context rather than weekly events and upcoming catalysts.
- Daily and Weekly Slide 1 questions must not be the same.
- Daily and Weekly Slide 2 evidence must not be the same evidence set or play the same information role.
- Daily and Weekly Slide 5 I-Xuan View must not be almost identical with only "today" / "this week" wording changed.
- Daily and Weekly Social Packs must not share generic AI / rates / valuation fallback copy.
- Do not use the same fallback copy to fill Daily and Weekly cards.
- Do not merely relabel the same content as Daily or Weekly while ignoring period-specific narrative separation.

Social Pack Period Divergence QA:

- After any Social Pack, Daily engine, or Weekly engine change, manually compare Daily Social Pack against Weekly Social Pack.
- Daily Slide 1 vs Weekly Slide 1: the market question must not be identical.
- Daily Slide 2 vs Weekly Slide 2: the information role must not be identical.
- Daily Slide 3 vs Weekly Slide 3: Daily should emphasize today's signal; Weekly should emphasize the weekly market thesis or week-level axis.
- Daily Slide 4 vs Weekly Slide 4: Daily should emphasize today's watch next; Weekly should emphasize next-week catalysts.
- Daily Slide 5 vs Weekly Slide 5: I-Xuan View must be period-specific and not only a "today" / "this week" word swap.
- If the Daily and Weekly card sets look interchangeable, QA fails.

Social Pack Incident Prevention Rules:

- Before changing Social Pack generation, rendering, quality guard, source selection, or export eligibility, read `docs/SOCIAL_PACK_INCIDENT_REVIEW_20260609.md`.
- Social Pack must not be declared complete from build, lint, or mobile smoke alone.
- Weekly Social Pack requires production-like regression because it depends on selected review source, same-week canonical published source, generated text, rendered slide text, caption text, quality guard, and export controls.
- Weekly regression must include the case where the selected weekly draft is review / non-canonical while a same-week published canonical weekly exists.
- Weekly regression must confirm canonical export source selection.
- Weekly regression must confirm selected metadata and export source metadata are separated.
- Weekly regression must inspect rendered slide text, not only generator output.
- Weekly regression must inspect caption text separately from slide text.
- Weekly regression must confirm `Quality issues = 0`.
- Weekly regression must confirm `Source eligible = true`.
- Weekly regression must confirm `Export eligible = true`.
- Weekly regression must confirm Export Current Pack is enabled.
- Weekly regression must confirm Download PNG is enabled and the downloaded PNG is visually checked.
- Weekly regression must confirm Copy caption is enabled and the copied caption is checked.
- If production screenshots show failure, do not attribute it to cache unless production HEAD SHA, route, rendered diagnostics, and actual issue text have been verified.
- Every Social Pack hotfix must update the incident log or governance docs, not only isolated version files.
- Do not switch back to App / Pro mainline while Social Pack export remains blocked.

## I. Growth Rules

Current stage:

- Seed user acquisition.

Focus:

- Content.
- Daily Intelligence.
- Weekly Intelligence.
- LINE distribution.
- Existing relationship channels.

Not focus:

- Paid ads.
- Aggressive monetization.
- Premature checkout.
- Signal-selling funnels.

Primary channels:

- LINE.
- Facebook.
- Threads.
- Existing FCN clients.

## J. AI Agent Handoff Rules

Every new AI session should read these files before making roadmap, architecture, or product-flow decisions:

1. `docs/PROJECT_CONTEXT.md`
2. `docs/PROJECT_RULES.md`
3. `docs/ROADMAP.md`
4. `docs/VERSION_HISTORY.md`

After reading, the agent should:

- Inspect `git status`.
- Check the relevant implementation files.
- Confirm whether the request is docs-only, UI-only, data-layer, auth, LINE, analytics, or product strategy.
- Avoid touching protected systems unless explicitly requested.

## K. Definition of Done

For any functional or UI change:

- `npm run lint` passes.
- `npm run build` passes.
- Desktop route check is completed for affected routes.
- Mobile 390px check is completed for affected routes.
- No horizontal overflow.
- No broken routes.
- No hydration errors.
- No console errors for the changed flow.
- External links use safe `target` / `rel` where applicable.
- Public UI does not expose internal debugging labels unless it is an intentional admin surface.

For Social Pack / Weekly Export changes:

- Production HEAD SHA is confirmed.
- Production Admin UI confirms `Content quality: passed`.
- `Quality issues = 0`.
- `Source eligible = true`.
- `Export eligible = true`.
- Export Current Pack is enabled.
- Download PNG is enabled.
- Copy caption is enabled.
- Actual downloaded PNG is visually checked.
- Same-week review/canonical case is checked.
- Docs are updated.
- User confirms the production result.

Fixture pass, build pass, lint pass, and mobile smoke pass are supporting checks only. They do not satisfy Social Pack Definition of Done.

For documentation-only changes, lint/build should still be run when requested by the task.
