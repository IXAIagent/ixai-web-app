# V15 Release Review RC2

Review date: 2026-07-03

Review type: V15 Release Candidate 2 production verification / release gate.

Source commits:

- V13.8 Localization: `db557ef`
- V15 Product Experience Framework: `a85d57d`
- V15 Home Redesign: `c94faa2`
- V15 Wave 1 Core Workspace Experience: `3909e09`
- V15 Wave 2 AI / Information Experience: `72455be`
- V15 Wave 3 Platform Experience: `f2871cc`
- V15 RC1 Review: `docs/V15_RELEASE_REVIEW_RC1.md`

Scope: release gate verification for V15 Workspace navigation, Workspace journey, platform pages, localization, responsive readiness, accessibility, performance, and release readiness. This review does not add product features, UI changes, code changes, routing changes, API changes, schema changes, auth changes, engine changes, provider changes, trading, recommendation, scheduler, or AI behavior.

## 1. Executive Summary

Release Gate: PARTIAL PASS.

V15 is source-level ready for PR / preview because the committed Workspace redesign consistently uses the V15 AI Wealth Workspace product hierarchy and keeps engineering diagnostics demoted. However, RC2 cannot mark the release gate as full PASS because authenticated production verification did not reach the real Workspace content.

Production verification attempted to use `.auth/production-storage-state.json` against `https://app.ixuan.ai` across desktop, tablet, and mobile. All audited Workspace routes returned HTTP 200 but rendered the account gate headed by `建立你的 IXAI intelligence workspace。` instead of the actual authenticated Workspace. This means visual QA, real navigation QA, console QA, network QA, and responsive QA for signed-in production content remain blocked.

Recommendation: proceed with RC2 as a documented PARTIAL PASS, then push / open PR / deploy preview only if the team accepts that invite-only Beta must wait for a fresh authenticated production Workspace verification pass.

## 2. Production Verification Evidence

Authenticated storage state:

- Path checked: `.auth/production-storage-state.json`
- Result: state exists, but did not unlock real Workspace content.
- Gate result: blocked by account gate.

Production scan:

- Base URL: `https://app.ixuan.ai`
- Viewports: desktop `1440x1000`, tablet `834x1112`, mobile `390x844`
- Screenshots: `/tmp/ixai-v15-rc2-production-verification`
- Total route / viewport checks: 36
- Console errors observed during blocked account-gate scan: 0
- Failed requests observed during blocked account-gate scan: 0

Blocked routes:

| Route | Desktop | Tablet | Mobile | Result |
| --- | --- | --- | --- | --- |
| `/my-ixai/home` | Account gate | Account gate | Account gate | Blocked |
| `/my-ixai/portfolio` | Account gate | Account gate | Account gate | Blocked |
| `/my-ixai/fcn` | Account gate | Account gate | Account gate | Blocked |
| `/my-ixai/risk` | Account gate | Account gate | Account gate | Blocked |
| `/my-ixai/intelligence` | Account gate | Account gate | Account gate | Blocked |
| `/my-ixai/copilot` | Account gate | Account gate | Account gate | Blocked |
| `/my-ixai/watchlist` | Account gate | Account gate | Account gate | Blocked |
| `/my-ixai/notifications` | Account gate | Account gate | Account gate | Blocked |
| `/my-ixai/timeline` | Account gate | Account gate | Account gate | Blocked |
| `/my-ixai/settings` | Account gate | Account gate | Account gate | Blocked |
| `/my-ixai/health` | Account gate | Account gate | Account gate | Blocked |
| `/my-ixai/beta` | Account gate | Account gate | Account gate | Blocked |

Evidence sample:

- `/my-ixai/home`
- HTTP status: `200`
- Final URL: `https://app.ixuan.ai/my-ixai/home`
- Page title: `Home | 我的 IXAI | IXAI`
- First heading: `建立你的 IXAI intelligence workspace。`
- Result: account gate, not true Workspace Home.

## 3. Workspace Navigation Verification

Source-level result: PASS.

Confirmed V15 primary IA:

- 首頁
- 我的資產
- 市場
- AI
- 提醒
- 設定

Desktop navigation:

- `components/layout/sidebar.tsx` groups Workspace navigation into the V15 IA.
- Health and Beta are not primary sidebar groups.

Mobile navigation:

- `components/layout/mobile-nav.tsx` limits the Workspace bottom navigation to five entries: 首頁, 資產, 市場, AI, 設定.

Drawer:

- `components/layout/mobile-drawer.tsx` follows the same IA and places System Health / Beta under Settings.

Settings / Advanced:

- `components/settings/settings-experience-workspace.tsx` presents Settings as the platform hub.
- Health is positioned as System Health under Advanced.
- Beta is positioned under About / Beta.

Production visual result: blocked by account gate.

## 4. Workspace Journey Verification

Source-level result: PASS with V15.1 polish items.

The main Workspace routes follow the V15 journey pattern:

- Hero
- KPI
- Summary
- Main content
- Details
- Diagnostics

Confirmed shared product primitives:

- `WorkspaceProductHero`
- `WorkspaceKpiGrid`
- `WorkspaceProductSection`
- `WorkspaceDiagnosticsPanel`

Routes reviewed at source level:

- Home
- Portfolio
- FCN
- Risk
- Intelligence
- Copilot
- Watchlist
- Notifications
- Timeline
- Settings
- Health
- Beta

Production visual result: blocked by account gate.

## 5. Platform Verification

Source-level result: PASS.

Health:

- Health is no longer a first-level navigation item.
- `components/workspace/platform/workspace-health-experience.tsx` positions it as Settings / Advanced / System Health.
- Uses `WorkspaceDiagnosticsPanel` for advanced health details.

Beta:

- Beta is no longer a first-level navigation item.
- `components/workspace/platform/workspace-beta-experience.tsx` positions it as About / Beta.
- Uses `WorkspaceDiagnosticsPanel` for beta readiness and release metadata.

Diagnostics:

- Settings, Health, Beta, and major Workspace pages demote technical details into `WorkspaceDiagnosticsPanel`.
- Diagnostics are intended to be collapsed by default.

Production visual result: blocked by account gate.

## 6. Diagnostics Checklist

Source-level result: PASS with P1 copy polish.

Confirmed:

- Runtime / provider / cache / readback / diagnostics / engine / source wording is not used as the first-screen product hierarchy for the main V15 pages.
- Technical wording is mostly contained inside collapsed diagnostics, legacy detail components, metadata, or page metadata.

Remaining P1 items:

- Some diagnostics descriptions still include source / provider / runtime vocabulary.
- Some nested legacy components still expose engine / readback wording when diagnostics are expanded.
- Page metadata still contains technical words such as provider, cache, runtime, readiness, and readback. This is not visible first-screen UX, but can be cleaned later.

## 7. Localization Checklist

Source-level result: PARTIAL PASS.

Confirmed:

- V13.8 localization work is committed.
- V15 primary Workspace product copy is mostly Traditional Chinese and user-facing.
- No raw i18n key rendering was found in the V15 source-level review.

Remaining P1 / P2 items:

- Some V15 user-facing copy is hard-coded Traditional Chinese instead of dictionary-backed.
- Some legacy input and diagnostics components still include English technical words.
- Some source-level strings include `placeholder`, especially in Intelligence / Watchlist / Risk fallback wording.
- Production authenticated visual QA for `zh-TW`, `zh-CN`, `en-US`, `ja-JP`, and `ko-KR` remains blocked.

## 8. Responsive Checklist

Source-level result: PARTIAL PASS.

Confirmed:

- Desktop shell uses consistent max-width page shells and responsive grids.
- Mobile bottom nav is limited to five items.
- Drawer groups match the new IA.
- V15 cards and KPI grids use responsive Tailwind breakpoints.

Blocked:

- Desktop visual QA on true production Workspace.
- Tablet visual QA on true production Workspace.
- Mobile visual QA on true production Workspace.
- Long translation wrapping and card overflow on authenticated data.

Reason: production authenticated state reached account gate instead of real Workspace content.

## 9. Accessibility Checklist

Source-level result: PARTIAL PASS.

Confirmed:

- Navigation uses semantic links / buttons.
- Drawer close behavior and labels exist.
- Icon buttons generally keep text labels in the V15 surfaces.
- Page hierarchy is designed around hero title and section headings.

Needs production visual QA:

- Focus visibility.
- Keyboard traversal through drawer, bottom nav, cards, and collapsed diagnostics.
- Color contrast under real data and long localized strings.
- Heading hierarchy after nested legacy diagnostic components render.

## 10. Performance Checklist

Validation result: PASS for build-time checks.

Confirmed:

- `git diff --check`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS.
- Production blocked scan observed 0 console errors and 0 failed requests while rendering the account gate.

Not yet verified:

- Console errors on true authenticated Workspace.
- Failed network requests on true authenticated Workspace.
- Hydration mismatch on true authenticated Workspace.
- Real route-to-route performance after signed-in data loads.

## 11. Release Gate Result

Release Gate: PARTIAL PASS.

P0 issues:

| Priority | Issue | Impact | Required action |
| --- | --- | --- | --- |
| P0 | Authenticated production Workspace verification is blocked by account gate. | Cannot claim production visual, responsive, console, network, hydration, or route journey PASS for actual Workspace content. | Create / reuse a production account with completed Workspace setup, save fresh authenticated state, rerun RC2 production scan across desktop/tablet/mobile. |

P1 issues:

| Priority | Issue | Impact | Required action |
| --- | --- | --- | --- |
| P1 | Some diagnostics descriptions still use source / provider / runtime vocabulary. | Acceptable in collapsed diagnostics, but not ideal for V15 product language. | Clean in V15.1 copy polish. |
| P1 | Some legacy nested diagnostics components expose engine / readback wording. | Can leak technical language when advanced panels are expanded. | Replace visible labels or keep strictly under Advanced. |
| P1 | Some V15 copy is hard-coded Traditional Chinese rather than dictionary-backed. | Non-zh locales may be incomplete. | Migrate V15 copy into dictionaries after release gate. |
| P1 | Production locale visual QA is blocked. | Cannot confirm `zh-CN`, `en-US`, `ja-JP`, `ko-KR` page quality. | Run authenticated multilingual visual QA after account gate is cleared. |

P2 issues:

| Priority | Issue | Impact | Required action |
| --- | --- | --- | --- |
| P2 | Page metadata still contains technical wording. | Low user impact; metadata is not the primary UI. | Clean gradually. |
| P2 | Input / asset-management long-tail pages are not fully V15 redesigned. | Lower-priority route consistency gap. | Track for V15.1 / V15.2. |
| P2 | Diagnostics may be heavy when expanded. | Potential but unproven performance cost. | Consider lazy loading only if production traces show need. |

## 12. Release Readiness

Ready for:

- Push: Yes, if the team accepts RC2 as a documented PARTIAL PASS.
- PR: Yes, as a release candidate PR with the P0 account-gate verification blocker documented.
- Preview: Yes.

Not ready for:

- Invite-only Beta without one more authenticated production Workspace QA pass.

Invite-only Beta gate:

- Requires a signed-in production Workspace that bypasses the account gate.
- Requires desktop, tablet, and mobile route screenshots.
- Requires no console errors on actual Workspace pages.
- Requires no failed requests on actual Workspace pages.
- Requires no hydration mismatch on actual Workspace pages.
- Requires route journey verification from Home through Settings.

## 13. Release Checklist

| Item | Status | Evidence |
| --- | --- | --- |
| Docs | Partial pass | RC1 and RC2 docs exist; RC2 newly records release gate. |
| Roadmap | Pass | V15 Wave 3 completion is reflected in roadmap docs. |
| Version History | Pass | V15 Wave 3 completion is reflected in version history. |
| Product Context | Pass | `docs/V15_PRODUCT_EXPERIENCE_CONTEXT.md` records V15 product direction. |
| Navigation | Source pass | Sidebar, mobile nav, drawer, Settings Advanced match V15 IA. |
| Design System | Source pass | V15 pages use shared product primitives. |
| Workspace Experience | Source pass | Core pages follow Hero / KPI / Summary / Main / Diagnostics. |
| Localization | Partial pass | V13.8 complete; V15 dictionary migration and production locale QA remain. |
| Lint | Pass | `npm run lint` passed on 2026-07-03. |
| Build | Pass | `npm run build` passed on 2026-07-03. |
| Working Tree | Partial pass | Only RC review docs are uncommitted after RC2 creation. |
| Production visual QA | Blocked | Account gate shown on all audited routes / viewports. |

## 14. Final Recommendation

RC2 should be treated as a documented PARTIAL PASS.

The V15 product experience work is ready to move toward PR / preview, but invite-only Beta should not start until the P0 production account-gate blocker is cleared and authenticated production Workspace visual QA passes.
