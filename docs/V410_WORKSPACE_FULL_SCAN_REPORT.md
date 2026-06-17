# V410 Workspace Full Scan Report

Date: 2026-06-17

Scope: audit-only scan after `v4.09 Workspace Market Integration`.

This report reviews the active IXAI workspace project, routes, navigation, components, data wiring, UI consistency, and documentation sync before the next implementation sprint. It does not change product code, auth, Supabase schema, API contracts, trading logic, or investment recommendation behavior.

## Scan Scope

Docs read:

- `docs/PROJECT_CONTEXT.md`
- `docs/PROJECT_MAP.md`
- `docs/ROADMAP.md`
- `docs/VERSION_HISTORY.md`
- `docs/PROJECT_RULES.md`

Primary routes inspected:

- `/my-ixai`
- `/my-ixai/home`
- `/my-ixai/portfolio`
- `/my-ixai/input`
- `/my-ixai/input/stock`
- `/my-ixai/input/crypto`
- `/my-ixai/input/fcn`
- `/my-ixai/risk`
- `/my-ixai/fcn`
- `/my-ixai/intelligence`
- `/my-ixai/settings`
- `/login`
- `/register`
- `/account`
- `/`

Primary component and library areas inspected:

- `components/layout/`
- `components/portfolio/`
- `components/fcn/`
- `components/risk/`
- `components/intelligence/`
- `components/market/`
- `src/lib/portfolio/truth/`
- `src/lib/portfolio/input/`
- `src/lib/fcn/`
- `src/lib/risk/`
- `src/lib/intelligence/`
- `src/lib/market/`
- `app/api/fcn`
- `app/api/stocks`
- `app/api/crypto`
- `app/api/portfolio/dashboard`

Existing QA scripts listed:

- `npm run qa:mobile`
- `npm run qa:visual`

They were not run in this audit because the request asked to list available QA scripts first and avoid blindly running large tests.

## Current Workspace Route Map

| Route | Status | Data Source | Notes |
| --- | --- | --- | --- |
| `/my-ixai` | Placeholder / stale copy | Static | Still uses `WorkspacePlaceholder` and v3.00 wording. It is a directory route, not the real workspace home. |
| `/my-ixai/home` | Usable entry / static | Static route links | Provides workspace cards and shortcuts, but has stale v3.02 copy and no readback summary. |
| `/my-ixai/portfolio` | Partially wired | Portfolio Truth Layer + local Recent Inputs | Shows Portfolio Truth readback, counts-based allocation, top symbols, and recent local inputs. Active route does not render the v4.09 Workspace Market Status component. |
| `/my-ixai/input` | Usable hub | Static route links | Canonical Asset Input Center. |
| `/my-ixai/input/stock` | Local-only input | React state / local preview | Does not write to `/api/stocks` or Supabase. |
| `/my-ixai/input/crypto` | Local-only input | React state / local preview | Does not write to `/api/crypto` or Supabase. |
| `/my-ixai/input/fcn` | Local draft input | `ixai.fcn.drafts.v308` + recent inputs | FCN Wizard currently saves local FCN drafts and recent inputs only; it does not POST `/api/fcn` in the active inspected code. |
| `/my-ixai/risk` | Working readback | Portfolio Truth Layer + FCN helpers + Market Service metadata | Global Risk Center is real and includes v4.03 Risk Intelligence readback plus v4.09 Workspace Market Status. |
| `/my-ixai/fcn` | Working readback | `/api/fcn` + local manual price overlay | FCN Intelligence Center reads persisted FCN positions from Supabase via `/api/fcn`. Manual prices use `ixai.fcn.manual-prices.v320`. |
| `/my-ixai/intelligence` | Working readback | Portfolio Truth Layer + Risk Intelligence + FCN helpers + Market Service metadata | Intelligence Center is real and includes v4.09 Workspace Market Status. |
| `/my-ixai/settings` | Placeholder | Static | Settings route is still a v3.00 placeholder with links to account and notifications. |
| `/login` | Working auth page | Auth form | Success redirect is configured for `/my-ixai/home`. |
| `/register` | Working auth page | Auth form | Success redirect is configured for `/my-ixai/home`. |
| `/account` | Transitional page | Session / account context | Correctly positioned as legacy transition into Workspace. |
| `/` | Public landing | Public content | Public home remains separate from Workspace. |

## Page-by-Page Status

### Workspace Home

Completed:

- User-readable workspace entry cards.
- Links to Portfolio, Asset Input, Risk, FCN, Intelligence, and Settings.
- Quick asset-input shortcuts.

Placeholder / gaps:

- No Portfolio Truth Layer readback.
- No Workspace Market Status.
- Stale v3.02 wording remains in visible copy.

### Portfolio Center

Completed:

- Uses `PortfolioTruthSummary`.
- Reads shared Portfolio Truth Layer from `/api/fcn`, `/api/stocks`, `/api/crypto`, and `/api/portfolio/dashboard`.
- Shows holdings summary, counts-based allocation, known notional, top symbol occurrences, source health, and missing-data warnings.
- Shows local `RecentInputsPanel`.

Placeholder / gaps:

- Risk Snapshot is explicitly placeholder copy.
- Recent Inputs are local-only and separate from Portfolio Truth.
- Active `/my-ixai/portfolio/page.tsx` does not render `WorkspaceMarketStatus`.
- v4.09 added `WorkspaceMarketStatus` to `components/portfolio/portfolio-center-dashboard.tsx`, but the active route renders `PortfolioTruthSummary` directly and does not import `PortfolioCenterDashboard`.

### Asset Input

Completed:

- Asset Input hub exists.
- Stock, Crypto, and FCN routes exist.
- Stock and Crypto forms provide field entry and preview.
- FCN Wizard supports basic info, barrier terms, observation frequency, schedule, underlyings, and review-style metadata.

Placeholder / gaps:

- Stock input is local mock state only.
- Crypto input is local mock state only.
- FCN Wizard currently saves local drafts and local recent inputs only.
- Active FCN Wizard does not POST `/api/fcn`, so newly entered FCN drafts do not flow into FCN Center's Supabase readback.
- Form copy still says `v3.08` and `FCN Draft`, which contradicts later v3.09+ documentation claiming API persistence.

### Risk Center

Completed:

- Real Global Risk Center route.
- Uses Portfolio Truth Layer.
- Uses FCN v3.20 helper output and manual price overlay.
- Shows concentration risk, top exposure, FCN worst-of, data quality risk, source status, and upcoming FCN events.
- Shows Workspace Market Status from v4.09.

Placeholder / gaps:

- Stock / Crypto / Grid / Dual risk engines remain readiness cards, not full engines.
- Foundation Score remains deterministic and FCN-led.
- Uses status colors such as `emerald`, `amber`, `rose`, and `slate`, which should be checked against `docs/PROJECT_RULES.md` token rules before a UI cleanup.

### FCN Center

Completed:

- Reads `/api/fcn` with authenticated Supabase headers.
- Displays FCN positions, notional, underlyings, lifecycle, manual price overlay, timeline, risk status, risk score, KI distance, and concentration.
- Manual price overlay key is `ixai.fcn.manual-prices.v320`.

Placeholder / gaps:

- Archive / restore actions are disabled and not persisted.
- Manual prices are local-only and not Supabase-backed.
- FCN Center does not read `ixai.fcn.drafts.v308`; therefore local FCN drafts created by the inspected wizard are not visible in FCN Center.
- Missing current prices remain `UNKNOWN`; no live market provider is enabled.

### Intelligence Center

Completed:

- Real Intelligence Center route.
- Uses Portfolio Truth Layer.
- Uses Risk Intelligence Layer.
- Reuses FCN highlights and upcoming event readback.
- Shows market readiness and provider-health metadata.
- Shows Daily, Weekly, Market entry points, news readiness, commentary readiness, source status, and compliance footer.

Placeholder / gaps:

- News feed is readiness/foundation only.
- AI commentary is readiness/foundation only.
- No external news provider, LLM provider, or portfolio-aware news routing is connected.

### Settings

Completed:

- Route exists.
- Links to account and notification settings.

Placeholder / gaps:

- Still a v3.00 placeholder.
- No real membership settings, language, region, broker connections, privacy controls, notification rules, or data management UI.

## Data Wiring Status

### Portfolio Truth Layer

Status: working but only reflects persisted API records.

The active Truth Layer uses:

- `/api/fcn`
- `/api/stocks`
- `/api/crypto`
- `/api/portfolio/dashboard`

Consumers:

- Portfolio Center: yes, via `PortfolioTruthSummary`.
- Risk Center: yes, via `loadPortfolioTruthReadback()`.
- Intelligence Center: yes, via `loadPortfolioTruthReadback()`.

Important limitation:

- Stock, Crypto, and FCN input forms inspected in this scan do not write to those APIs. Therefore a user can create a local input draft and still see zero records in Portfolio Truth.

### FCN Draft Store

Status: still present as legacy/local compatibility.

Key:

- `ixai.fcn.drafts.v308`

Writers:

- `components/fcn/fcn-wizard.tsx`

Readers:

- `loadFcnDrafts()` exists in `src/lib/portfolio/input/fcn-draft-store.ts`.
- The active FCN Center does not read this store in the inspected code.

Risk:

- The product currently has two FCN paths: local draft input and Supabase `/api/fcn` readback. They are not unified.

### Recent Inputs

Status: local-only UX helper.

Key:

- `ixai.portfolio.recent-inputs.v306`

Consumers:

- Portfolio Center `RecentInputsPanel`.
- FCN Draft Store legacy import fallback.

Risk:

- Recent Inputs make input activity visible, but they are not Portfolio Truth records and should not be interpreted as persisted holdings.

### FCN Center Readback

Status: real persisted readback.

Data path:

```text
Supabase session
→ GET /api/fcn
→ fcn_positions / fcn_underlyings
→ FCN Intelligence Center
→ local manual price overlay for risk calculations
```

Manual price overlay:

- `ixai.fcn.manual-prices.v320`

### Workspace Market Status

Status: partially integrated.

Rendered in:

- Risk Center.
- Intelligence Center.

Not rendered in the active Portfolio route:

- The shared `WorkspaceMarketStatus` component exists.
- `PortfolioCenterDashboard` imports it.
- Active `/my-ixai/portfolio/page.tsx` does not render `PortfolioCenterDashboard`, so the market status is not visible on Portfolio Center.

## UI Consistency Issues

- Mixed visible version labels remain: v3.00, v3.02, v3.08, v3.20, v4.01, v4.03, v4.04, and v4.09. Some labels are useful provenance; others are stale product copy.
- FCN Wizard says v3.08 local draft flow even though later docs describe v3.09+ API persistence.
- Workspace Home still references v3.02 transition copy.
- `/my-ixai` root still reads like v3.00 route foundation.
- Risk Center and Portfolio Truth badges use off-token Tailwind colors such as `emerald`, `amber`, `rose`, and `slate`; `docs/PROJECT_RULES.md` prefers IXAI status tokens for Pro / Account / Portfolio / Risk surfaces.
- Mobile bottom navigation groups Asset Input under Portfolio matching and Settings under Intelligence matching. This is probably a five-slot compromise, but Settings is not a distinct mobile bottom-nav item.
- Stock / Crypto forms clearly say local mock state, but the broader workspace can still make users expect those inputs to appear in Portfolio Truth.
- Some CTA / card labels remain English-first (`Workspace`, `Readiness`, `Portfolio Truth Layer`, `Foundation Score`) while other parts are Chinese-first.

## Legacy Wording / Stale Version References

High-priority stale visible copy:

- `app/my-ixai/page.tsx`: v3.00 route foundation copy.
- `app/my-ixai/home/page.tsx`: v3.02 copy.
- `components/fcn/fcn-wizard.tsx`: v3.08 local draft copy and FCN Draft success wording.

Lower-priority stale or technical wording:

- `components/layout/mobile-nav.tsx` and `components/layout/mobile-drawer.tsx` contain v1.32.1 comments only.
- `components/portfolio/portfolio-center-dashboard.tsx` contains many v1/v2 mock engine sections and appears disconnected from the active Portfolio route.
- Several internal labels expose version names where user-facing copy could be simpler in a future polish pass.

## Broken or Risky Navigation

No hard dead links were found in the primary desktop sidebar, mobile drawer, or mobile bottom nav during static inspection.

Risky navigation / IA notes:

- `/my-ixai` is still a placeholder directory page, while `/my-ixai/home` is the real workspace home.
- Mobile bottom nav does not expose Settings as its own bottom item.
- Asset Input is available in desktop/sidebar and mobile drawer, but bottom nav only highlights it as part of Portfolio.
- `/my-ixai/portfolio/assets` exists but is not a primary workspace nav item.

## Placeholder Areas

- `/my-ixai`
- `/my-ixai/settings`
- Workspace Home readback panels.
- Portfolio Risk Snapshot.
- Stock / Crypto input persistence.
- FCN Wizard API persistence.
- Stock / Crypto / Grid / Dual risk engines.
- News feed provider integration.
- AI commentary integration.
- Live market data.
- Broker sync.
- Archive / restore persistence in FCN Center.

## Recommended Next Versions

### v4.10 Market Data Layer

Goal:

- Turn Market Service from metadata/mock readiness into the first approved market-data read model.

Recommended scope:

- Do not start with external providers.
- First fix the active Portfolio Center market-status rendering gap.
- Define current-price source precedence for FCN: stored price, manual overlay, future market provider.
- Add stale timestamp and provider-source labels.
- Keep live providers disabled unless separately approved.

### v4.11 FCN Risk Engine

Goal:

- Reconcile FCN input, FCN persistence, FCN risk, and FCN Center readback into one path.

Recommended scope:

- Decide whether FCN Wizard should POST `/api/fcn` again, or whether local drafts need an explicit draft-to-position lifecycle.
- Remove or clearly relabel stale v3.08 draft copy.
- Preserve `ixai.fcn.drafts.v308` only as a compatibility/import layer until a product decision is made.
- Add KO distance and strike distance only after source-price semantics are settled.

### v4.12 Unified Dashboard

Goal:

- Make Workspace Home the user-facing unified dashboard across Portfolio, FCN, Risk, Intelligence, and Market status.

Recommended scope:

- Use Portfolio Truth Layer, Global Risk Center summary, FCN Intelligence summary, and Market Service status.
- Do not rebuild individual centers.
- Avoid duplicating business logic in the home page.

## Immediate Fix List

1. Add `WorkspaceMarketStatus` to the active `/my-ixai/portfolio/page.tsx` route, or update docs to state Portfolio market status is pending.
2. Resolve FCN Wizard data path mismatch: active wizard is local draft only, while FCN Center reads `/api/fcn`.
3. Update visible FCN Wizard copy that still says v3.08 local draft / Supabase later.
4. Update Workspace Home stale v3.02 copy.
5. Update `/my-ixai` root placeholder copy or redirect users to `/my-ixai/home`.
6. Clarify Stock / Crypto inputs as local-only until they POST to existing APIs.
7. Review status color classes against `docs/PROJECT_RULES.md`.
8. Decide whether `components/portfolio/portfolio-center-dashboard.tsx` is legacy, inactive, or should be split into smaller historical demo surfaces.

## Do-Not-Touch List

Do not change without an explicit sprint:

- Auth provider / session behavior.
- Supabase schema, migrations, RLS, or table contracts.
- Existing API response contracts.
- Membership / entitlement logic.
- FCN risk formulas beyond documented rules.
- Manual price localStorage key.
- FCN draft localStorage key.
- Recent Inputs localStorage key.
- Market provider external connectivity.
- Broker sync.
- AI / LLM providers.
- News providers.
- Trading, order execution, buy/sell instructions, target prices, or return promises.
- Public Daily / Weekly editorial flows.
- Social Pack.
- Legacy fallback stores before a migration plan exists.

## Validation

Validation run during this audit:

- `git status -sb`: branch `feature/v4.09-workspace-market-integration`; docs-only working tree changes.
- `git diff --check`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS.

Build route output confirmed the relevant workspace routes are present:

- `/my-ixai`
- `/my-ixai/home`
- `/my-ixai/portfolio`
- `/my-ixai/input`
- `/my-ixai/input/stock`
- `/my-ixai/input/crypto`
- `/my-ixai/input/fcn`
- `/my-ixai/risk`
- `/my-ixai/fcn`
- `/my-ixai/intelligence`
- `/my-ixai/settings`
