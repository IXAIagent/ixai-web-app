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

For documentation-only changes, lint/build should still be run when requested by the task.
