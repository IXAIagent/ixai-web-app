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
Public Landing → Intelligence Preview → Onboarding → AI Intelligence Workspace → Future Pro Intelligence
```

Prefer CTA wording such as "建立 Intelligence Layer", "查看 Intelligence Preview", "開始 Onboarding", "連接 LINE 接收情報", and "開啟 AI Intelligence Workspace".

Share routes under `/share` are public acquisition surfaces. They must stay educational, risk-aware, and connected to onboarding / preview / LINE without implying investment advice or live personalized monitoring.

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

## H. Definition of Done

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
