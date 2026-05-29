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

## B. Current Product Status

The current IXAI public app is live and deployed on Vercel, with `https://app.ixuan.ai` as the production public domain.

## Current Product State

Current Version:

`v1.40.5a`

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

Public Intelligence Engine now includes foundation-level modules for Market Pulse, Macro Watch, AI / Tech Watch, Crypto Watch, FCN Awareness, and Risk Regime. v1.40.3a adds production polish for compliance language, mobile rhythm, CTA hierarchy, and Public-to-Account narrative continuity.

Watchlist Intelligence Lite now surfaces onboarding watchlist seed, selected markets, and intelligence preferences inside the Account Intelligence Workspace. It maps user interests to Public Intelligence modules without implying holdings, portfolio analysis, personal FCN risk conclusions, or trading recommendations.

LINE Delivery Foundation now adds local/session-first delivery preferences, Account delivery readiness UI, and opt-in / pause / unsubscribe concepts without activating real LINE push automation. Delivery language separates Public, Account, and Future Pro intelligence delivery.

Mobile Visual QA readiness now adds a lightweight 390px browser smoke check for public, account/pro gated, and admin surfaces. The QA script verifies route load, no obvious application/hydration error text, no horizontal overflow, and route-specific key UI text.

Current Highest Priorities:

1. Portfolio Intelligence.
2. AI Alert Engine.
3. Dynamic Intelligence Provider Integration.
4. Durable Preference Persistence.

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
- FCN intelligence with risk-first education and future personal monitoring workflows.
- Portfolio risk workflow and personal market memory.
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
- Auth and identity architecture remains protected and should not be rewritten without explicit approval.
- Watchlist Intelligence Lite remains local/session-first.
- Durable watchlist persistence remains future work unless explicitly approved.
- Watchlist relevance is topic-level and not personalized investment advice.
- LINE Delivery remains readiness-only.
- Real push automation requires explicit opt-in persistence, delivery logs, unsubscribe/pause controls, and approval before production launch.
- Delivery preferences remain local/session-first unless persistence migration is explicitly approved.
- Visual QA is smoke-level and should be expanded before App Store / Google Play submission.
- Browser binaries should not be committed.
- CTA and product wording should reinforce one flow: Public Landing → Onboarding → AI Intelligence Workspace → Future Pro Interest. Intelligence Preview is secondary, not the default next step after onboarding.
- Share pages are acquisition surfaces; keep them educational, intelligence-first, and clearly connected to onboarding / preview / LINE.

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
