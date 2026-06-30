# V13 Sprint 4 Authenticated Workspace Translation Audit

Review date: 2026-06-30

## Background

V13 Sprint 3 repaired visible translation coverage across primary Public and Workspace surfaces, but production signed-in review still found English copy inside authenticated Workspace pages. The clearest finding was `/my-ixai/portfolio`, where the Portfolio Persistence Layer card still displayed English labels such as `Portfolio Persistence Layer`, `Canonical position readback`, `Total Positions`, `Source Status`, `Asset Breakdown`, and `Persistence Warnings` while `zh-TW` mode was active.

Sprint 4 exists because authenticated Workspace pages include engine and readback surfaces that Sprint 3 did not fully cover. V13 completion must be judged by signed-in Workspace verification, not only by public pages, navigation, and foundation wiring.

## Audit Scope

Routes reviewed:

- `/my-ixai/home`
- `/my-ixai/portfolio`
- `/my-ixai/input`
- `/my-ixai/watchlist`
- `/my-ixai/notifications`
- `/my-ixai/timeline`
- `/my-ixai/copilot`
- `/my-ixai/health`
- `/my-ixai/beta`
- `/my-ixai/risk`
- `/my-ixai/fcn`
- `/my-ixai/intelligence`
- `/my-ixai/settings`

Primary source areas inspected:

- `components/portfolio/*`
- `components/risk/*`
- `components/fcn/*`
- `components/intelligence/*`
- `components/workspace/*`
- `components/watchlist/*`
- `components/alerts/*`
- `components/daily-brief/*`
- `src/lib/*` outputs that are displayed directly in UI

## Fixed Surfaces

This first authenticated repair pass focused on the highest-confidence production finding and nearby Portfolio route readback cards.

Fixed:

- Portfolio page hero, holdings summary, risk snapshot, quick actions, and compliance disclaimer now use dictionary-backed labels.
- Portfolio Truth Summary now uses dictionary-backed labels for holdings, known notional, readiness, allocation, top exposure, pending input, data health, and missing-data note headings.
- Portfolio Persistence Summary now uses dictionary-backed labels for:
  - Portfolio Persistence Layer
  - Canonical position readback
  - Total Positions
  - Persisted
  - Local Draft
  - Fallback
  - Source Status
  - Asset Breakdown
  - Persistence Warnings
  - Stock / Crypto / FCN / Cash / Unknown
  - database-read-priority and api:fcn source labels / warning messages
- Portfolio Valuation Summary now uses dictionary-backed labels for valuation headings, metric cards, allocation, source status badges, position valuation, valuation warnings, and monitoring disclaimer.
- Portfolio Live Valuation card now uses dictionary-backed labels for live valuation title, metric cards, source status, missing quotes, manual fallback, stale quotes, and fallback/error messages.
- FCN Live Underlying Status card now uses dictionary-backed labels for live underlying title, metric cards, status, missing/stale quotes, and fallback/error messages.

## Translation Helper Layer

Sprint 4 adds a shared display-label helper for authenticated Workspace readback labels:

- `useWorkspaceDisplayLabels()`
- `sourceStatusLabel()`
- `assetTypeLabel()`
- `sourceNameLabel()`
- `warningMessageLabel()`

This helper maps deterministic engine/service output to UI labels without changing engine contracts. Examples include:

- `persisted`, `local`, `fallback`, `partial`, `unavailable`
- `local draft`, `database ready`, `fallback active`, `source status`
- `stock`, `crypto`, `fcn`, `cash`, `unknown`
- `api:fcn`, `database-read-priority`, `portfolio-persistence-service`

## Dictionary Expansion

New or expanded namespaces:

- `portfolio`
- `persistence`
- `valuation`
- `risk`
- `fcn`
- `intelligence`
- `watchlist`
- `notifications`
- `timeline`
- `copilot`
- `diagnostics`
- `sourceStatus`
- `assetTypes`
- `warnings`
- `dataHealth`

The goal is to make future authenticated Workspace translation repairs additive and consistent.

## Known Remaining Untranslated Areas

Sprint 4 is not a claim of full Workspace translation completion.

Known remaining:

- Deep Risk Center readback sections still include English labels from deterministic risk summaries and legacy card labels.
- Deep Intelligence Center readback sections still include English labels from deterministic source cards, flow cards, and warning summaries.
- FCN Center has remaining English labels in lifecycle, pending input, schedule, and detailed risk sections beyond the live underlying card.
- Input forms still include field labels and validation messages that require a dedicated form-copy pass.
- Watchlist, Notifications, Timeline, Copilot, and Daily Brief legacy/deep panels require signed-in visual verification beyond static source audit.
- Some engine-produced messages remain displayed as-is until a dedicated source-output mapping pass classifies them.

## Why Engine Contracts Stayed Unchanged

Authenticated Workspace pages display output from Portfolio Truth, Portfolio Persistence, Portfolio Valuation, FCN live risk, Risk Intelligence, and Workspace Intelligence layers. These contracts are shared by multiple centers and are part of the deterministic readback architecture.

Sprint 4 localizes at the UI display layer only. It does not change:

- Portfolio / FCN / Risk / Intelligence engine core logic
- API contracts
- Supabase schema
- Migrations
- RLS / auth / membership behavior
- Broker, trading, recommendation, scheduler, billing, or AI behavior

## Manual Verification Checklist

Verify in production or production-like authenticated Workspace:

- Public Landing can switch `zh-TW` / `en-US`.
- Workspace sidebar displays `zh-TW`.
- `/my-ixai/portfolio` main cards display `zh-TW`, especially Portfolio Persistence Layer labels.
- `/my-ixai/home` main cards display `zh-TW`.
- `/my-ixai/risk` main cards display `zh-TW` where Sprint 3/4 coverage exists, and remaining deep labels are tracked.
- `/my-ixai/fcn` main cards display `zh-TW` where Sprint 3/4 coverage exists, including live underlying card.
- `/my-ixai/intelligence` main cards display `zh-TW` where Sprint 3 coverage exists, and remaining deep labels are tracked.
- `/my-ixai/settings` displays `zh-TW`.
- `en-US` mode remains normal.
- Console errors: 0.
- Page errors: 0.
- No hydration mismatch.
- No runtime fatal error.

If local auth is unavailable, record: authenticated visual verification not completed locally.

## Recommended Next Steps

1. Run authenticated production visual verification for all Workspace routes.
2. Create a targeted follow-up for Risk / Intelligence deep readback label mapping.
3. Create a targeted follow-up for FCN Center lifecycle and schedule copy.
4. Create a dedicated form-copy pass for Stock / Crypto / FCN input validation labels.
5. Treat deeper dictionary migration as V13 maintenance unless production review finds user-blocking untranslated copy.
