# V13 Sprint 3 — Translation Coverage Repair

## Background

V13.0, V13 Sprint 1, and V13 Sprint 2 completed the shared locale, dictionary, provider, region, currency, and localization foundation. A follow-up UI coverage pass found that this was not the same as product translation coverage: after switching to `zh-TW`, several primary Workspace surfaces still showed visible English strings.

Sprint 3 repairs the first product-facing translation coverage layer. It does not add product features and does not change data, auth, schema, market, AI, broker, trading, scheduler, or billing behavior.

## Problem

The i18n infrastructure was complete, but visible UI coverage was incomplete.

Observed gaps:

- Workspace sidebar and mobile drawer had dictionary wiring, but several zh-TW values still remained English.
- Workspace Home used mostly hard-coded server-component strings.
- Workspace Settings used hard-coded card labels, status labels, and helper copy.
- Workspace Morning Brief rendered engine contract strings directly in the UI.
- Workspace Intelligence rendered deterministic engine card strings directly.
- Health Center and Beta Dashboard had English status labels, checklist labels, and boundary copy.
- Settings Region / Currency / Localization card had a few fixed English aria/label strings.
- Public Landing remains partially translated beyond its already-connected hero and navigation copy.

## Audit Summary

Primary files inspected:

- `components/layout/sidebar.tsx`
- `components/layout/mobile-drawer.tsx`
- `components/layout/footer.tsx`
- `components/home/intelligence-landing.tsx`
- `app/my-ixai/home/page.tsx`
- `app/my-ixai/settings/page.tsx`
- `components/workspace/workspace-health-center.tsx`
- `components/workspace/beta-readiness-dashboard.tsx`
- `components/workspace/workspace-morning-brief-v14-card.tsx`
- `components/workspace/brief-share-actions.tsx`
- `components/workspace/workspace-intelligence-v14-summary.tsx`
- `src/lib/workspace/morning-brief/*`
- `src/lib/workspace/intelligence/*`

The Morning Brief and Workspace Intelligence engines keep stable English contracts. Sprint 3 localizes their display layer with dictionary-based labels and display-only summary mapping instead of changing engine output contracts.

## Fixed Surfaces

- Workspace navigation:
  - Sidebar labels now have zh-TW Workspace names for Home, Portfolio, Asset Input, Watchlist, Notifications, Timeline, Copilot, Health, Beta, Risk, FCN, Intelligence, Settings, and Back to public site.
  - Mobile drawer aria labels and footer boundary copy now use dictionary labels.
- Workspace Home:
  - Hero, CTA labels, Live Intelligence snapshot, Workspace center cards, Asset Onboarding, and runtime-safe boundary copy now use dictionary keys through a small client translation bridge.
- Workspace Settings:
  - Hero, settings area labels, statuses, language helper note, CTA text, and footer boundary copy now use dictionary keys.
- Workspace Morning Brief:
  - Title, subtitle, Run brief button, status/source/warnings labels, section titles, severity/status labels, disclaimer, and Share / Export actions now use dictionary keys.
  - zh-TW uses display-only section summary mapping while preserving engine contracts.
- Workspace Intelligence:
  - Main title/body, readiness cards, severity/status labels, type labels, disclaimer, and zh-TW display summaries now use dictionary keys.
- Health Center:
  - Stable labels, pending refresh state, localization item label, status pills, and read-only safety disclaimer now use dictionary keys.
- Beta Dashboard:
  - Checklist labels/details, status counters, production QA copy, localization display check, and status labels now use dictionary keys.
- Settings localization card:
  - Aria labels and date style label now use dictionary keys.

## Known Remaining Hard-Coded Strings

Sprint 3 focuses on primary Workspace coverage and first Public Landing coverage. Remaining areas are intentionally not treated as blockers for this Sprint:

- Public Landing long-form body sections still contain some Chinese-first marketing copy outside the hero/navigation/footer.
- Deep Workspace centers such as Portfolio, FCN, Risk, Watchlist, Timeline, Notifications, Copilot, and historical diagnostics still contain engine/readback strings that need page-specific dictionary migration.
- Admin and editorial tools remain out of scope.
- Daily Brief / Weekly article content remains authored content, not UI translation.
- Engine contract strings remain stable and should be localized only in UI display helpers.

## Out Of Scope

- Auth changes.
- Supabase schema, migrations, RLS, membership, or API contract changes.
- Broker integration, trading, recommendations, target prices, or valuation engine changes.
- Scheduler, Telegram, LINE, email, or push delivery activation.
- AI provider, OpenAI, LLM behavior, or AI model calls.
- Portfolio / FCN / Risk engine core logic.
- Live market provider behavior or exchange-rate provider behavior.

## Validation Checklist

Required:

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

Browser smoke:

- Public Landing `zh-TW` / `en-US` switch remains functional.
- Locale persists after refresh.
- Workspace sidebar shows zh-TW labels.
- Workspace Home primary content shows zh-TW labels.
- Workspace Morning Brief primary labels show zh-TW.
- Workspace Settings localization card works in `zh-TW` and `en-US`.
- `/my-ixai/health` and `/my-ixai/beta` primary labels show zh-TW / en-US correctly.
- Console errors = 0.
- Page errors = 0.
- No hydration mismatch.
- No runtime fatal error.

## Next Recommendation

After Sprint 3, V13 completion criteria should require visible zh-TW coverage on primary Public / Workspace surfaces, not only i18n infrastructure completion. Recommended next work is a maintenance translation migration for deep Workspace centers and long-form Public Landing sections, or V14 Beta production verification if release work has priority.
