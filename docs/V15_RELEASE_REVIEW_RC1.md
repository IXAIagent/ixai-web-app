# V15 Release Review RC1

Review date: 2026-07-03

Source commits:

- V13.8 Localization: `db557ef`
- V15 Product Experience Framework: `a85d57d`
- V15 Home Redesign: `c94faa2`
- V15 Wave 1 Core Workspace Experience: `3909e09`
- V15 Wave 2 AI / Information Experience: `72455be`
- V15 Wave 3 Platform Experience: `f2871cc`

Scope: source-level release review for Workspace UX, navigation, diagnostics, localization, copywriting, responsive readiness, accessibility, performance, and release governance. Authenticated visual QA was not completed in this pass.

## 1. Executive Summary

Release rating: Nearly Ready.

V15 is close to Beta readiness because the major Workspace surfaces now share the AI Wealth Workspace hierarchy: Hero, KPI, Summary, Main Content, Details, and collapsed Diagnostics. The core pages have moved away from engineering dashboard language toward user-facing investment monitoring language, and Health / Beta have been demoted into Settings.

V15 should not be treated as fully Ready until authenticated production visual QA passes on desktop and mobile. The remaining release risk is mostly presentation and copy polish, not runtime architecture or business logic.

Recommendation: proceed to PR / preview deployment after this RC1 review, then run authenticated production visual QA before invite-only Beta.

## 2. Workspace UX Review

| Page | Score | RC1 Notes |
| --- | ---: | --- |
| Home | 8.5/10 | Strong first-screen hierarchy with hero KPI row, Morning Brief prominence, portfolio snapshot, alerts, market snapshot, quick actions, activity, and collapsed diagnostics. |
| Portfolio | 8/10 | User-facing asset summary is much clearer. Remaining polish: some diagnostic child components still contain technical labels when expanded. |
| FCN | 8/10 | Better risk-first flow: status, observation, schedule, positions, diagnostics. Remaining polish: existing FCN detail components still expose source/status terms in lower sections. |
| Risk | 8/10 | Good today-risk framing. Remaining polish: embedded legacy risk components still contain Engine terminology inside lower / diagnostic areas. |
| Intelligence | 7.5/10 | Better "Today's Market" and portfolio impact framing. Remaining polish: diagnostic child summaries still contain readback/source vocabulary when expanded. |
| Copilot | 8/10 | Suggested questions and empty state make it feel like an assistant entry point. Conversation remains summary-style, not a full chat experience, which is acceptable for RC1. |
| Watchlist | 7.5/10 | Market tracking framing is clearer. Remaining polish: old WatchlistSummary in diagnostics still has watchlist engine/readback text. |
| Notifications | 8/10 | Better reminder center with priority grouping and delivery preview. Remaining polish: local readback terms remain in diagnostic child content. |
| Timeline | 8/10 | Much clearer recent-events page with today / next 7 days grouping. Remaining polish: existing summary in diagnostics still uses engine labels. |
| Settings | 8/10 | Settings now works as the platform hub. Advanced placement for Health / Beta / diagnostics is correct. |
| Navigation | 8.5/10 | Desktop IA is now user-job oriented: Home, Assets, Market, AI, Alerts, Settings. |
| Mobile | 8/10 | Bottom nav is now five items and maps to the new IA. Authenticated visual QA is still required. |

## 3. Consistency Review

Confirmed consistent:

- Hero: V15 pages use `WorkspaceProductHero` or a comparable V15 platform shell.
- KPI: Core Workspace pages use `WorkspaceKpiGrid` and hero KPI rows.
- Summary: page intros now explain the user job first.
- Section: content is grouped with `WorkspaceProductSection`.
- Diagnostics: diagnostics are consistently demoted to `WorkspaceDiagnosticsPanel`.
- Quick Actions: Home and related pages use action buttons as primary entry points.
- Spacing: V15 pages generally use `max-w-7xl`, responsive padding, 8px-ish rounded cards, and restrained card grids.
- Cards: most new cards follow the V15 cream/forest/gold design language.

Remaining consistency gaps:

- Older nested detail components still have their own legacy card shapes.
- Some lower diagnostic content uses monospace technical labels.
- Authenticated visual QA is needed to catch mobile wrapping and card density issues.

## 4. Navigation Review

Desktop:

- Primary groups are now: 首頁, 我的資產, 市場, AI, 提醒, 設定.
- Health and Beta are no longer desktop sidebar first-level entries.
- Settings is the correct destination for platform controls.

Mobile:

- Bottom navigation is now exactly five items: 首頁, 資產, 市場, AI, 設定.
- Mobile drawer follows the same product IA and places System Health / Beta under Settings.

Drawer:

- Drawer includes System Health and Beta under the Settings group only.
- Drawer remains the place for deeper mobile navigation.

Settings / Advanced:

- Health is positioned as Settings -> Advanced -> System Health.
- Beta is positioned as Settings -> About -> Beta.
- Diagnostics are collapsed under Advanced.

## 5. Copy Review

Engineering terms still present in source-level scan:

| File | Location | Term | Recommendation |
| --- | --- | --- | --- |
| `components/watchlist/watchlist-experience-workspace.tsx` | Diagnostics panel KPI | `Watchlist Source` | Replace in V15.1 with `追蹤資料` or keep only inside advanced diagnostics. |
| `components/intelligence/intelligence-experience-workspace.tsx` | Loading / helper copy | `placeholder` | Replace with `暫時顯示安全預設內容`. |
| `components/watchlist/watchlist-experience-workspace.tsx` | Loading copy | `placeholder` | Replace with `暫時顯示安全預設內容`. |
| `components/risk/risk-experience-workspace.tsx` | Diagnostics description | `Risk engine`, `provider/runtime` | Acceptable only because it is inside collapsed diagnostics; V15.1 can localize it. |
| `components/portfolio/portfolio-experience-workspace.tsx` | Diagnostics description | `Portfolio Truth`, `Persistence`, `Valuation source` | Acceptable in diagnostics; V15.1 can replace with user-language labels. |
| `components/fcn/fcn-experience-workspace.tsx` | Diagnostics description | `risk source`, `schedule source` | Acceptable in diagnostics; V15.1 can replace with user-language labels. |
| `components/copilot/workspace-copilot-summary.tsx` | Existing detail component | `sourceEngine` | Keep hidden below primary content or replace in V15.1. |
| `components/notifications/notification-center-summary.tsx` | Existing detail component | `sourceEngine`, `localReadback` | Keep in diagnostics; replace in V15.1 if visible in primary flow. |
| `components/workspace/workspace-health-center.tsx` | Advanced content | cache / readiness vocabulary | Acceptable under Settings -> Advanced. |
| `components/workspace/settings-runtime-diagnostics-control.tsx` | Advanced diagnostics | runtime / diagnostics vocabulary | Acceptable under collapsed diagnostics. |

Conclusion: first-screen copy is mostly clean. Remaining technical language is concentrated in diagnostics or legacy detail components.

## 6. Localization Review

Source-level review found:

- Mixed English remains intentionally in product nouns such as FCN, Portfolio, Copilot, Beta, Watchlist, Morning Brief, AI, and Workspace.
- Some new V15 copy is hard-coded Traditional Chinese rather than dictionary-backed.
- Some legacy diagnostic components still contain English technical labels.
- Placeholder-like English appears in form fields and older input pages, mostly outside the V15 main release surfaces.
- No raw i18n keys were found in the V15 primary page wrappers during source review.

Recommendation for V15.1:

- Move new V15 Wave 1-3 user-facing copy into dictionaries.
- Review `ja-JP`, `ko-KR`, and `zh-CN` visual output on authenticated production.
- Keep intentional finance/product nouns as-is unless product language decides otherwise.

## 7. Empty State Review

| Page | Empty State Assessment |
| --- | --- |
| Home | Friendly placeholders for missing portfolio, alerts, market, and activity. |
| Portfolio | Graceful missing valuation / allocation / holdings placeholders. |
| FCN | Graceful no-position and schedule placeholders. |
| Risk | Graceful no-signal / insufficient-data wording. |
| Intelligence | Graceful market summary and portfolio impact placeholders. |
| Copilot | Strong friendly empty state plus suggested questions. |
| Watchlist | Clear no-watchlist CTA. |
| Notifications | Clear no-notifications message. |
| Timeline | Clear no-events message. |
| Settings | Cards show available / preparing / not enabled states. |
| Health | Health summary uses safe loading / unknown state. |
| Beta | Beta checklist remains informational, not blocking. |

Overall: acceptable for RC1.

## 8. Responsive Review

Desktop: source-level structure is responsive, using grid breakpoints and max-width page shells.

Tablet: likely acceptable based on Tailwind grids, but not visually verified.

Mobile: bottom navigation has been simplified to five items and drawer groups follow the new IA.

Authenticated visual QA: Blocked in this review. Previous local checks reached the account gate instead of authenticated Workspace content. RC1 cannot claim full responsive QA until a signed-in production or local Workspace session is available.

## 9. Accessibility Review

Keyboard:

- Navigation links and buttons use semantic `Link` / `button`.
- Mobile drawer supports close overlay, ESC close, and link close behavior.

ARIA:

- Mobile drawer and nav have labels.
- Icon-only controls include labels where needed.

Focus:

- Native focus should work for links/buttons.
- Visual focus styling should be visually checked in authenticated QA.

Contrast:

- Forest / cream / gold system appears consistent.
- Some low-contrast legacy diagnostic cards should be checked visually.

Heading hierarchy:

- V15 pages generally have one hero `h1` and section headings.
- Nested legacy diagnostic components may introduce additional headings; acceptable in collapsed advanced content.

## 10. Performance Review

No obvious source-level performance blockers:

- Page wrappers use existing read-only services.
- Async calls are wrapped with existing safe runtime helpers where used.
- Diagnostics are collapsed by default, reducing first-screen cognitive load.
- No repeated hero or KPI duplicate was observed in source-level review.
- Some pages include legacy summary components inside diagnostics; acceptable for RC1 but may increase DOM size when expanded.

V15.1 should consider lazy-loading heavy diagnostics if production performance traces show cost.

## 11. Tech Debt

V15.1 candidates:

1. Dictionary migration for new V15 hard-coded Traditional Chinese copy.
2. Replace remaining `placeholder` wording with user-facing fallback copy.
3. Rename diagnostic labels from source/provider/runtime language to user-facing Advanced labels.
4. Review legacy detail components inside diagnostics for duplicate cards and nested headings.
5. Authenticated mobile visual QA across 390px, tablet, and desktop widths.
6. Add visual regression screenshots for Home, Portfolio, FCN, Risk, Intelligence, Copilot, Watchlist, Notifications, Timeline, Settings, Health, and Beta.
7. Confirm drawer active state for grouped routes such as `/my-ixai/fcn`, `/my-ixai/risk`, `/my-ixai/health`, and `/my-ixai/beta`.
8. Ensure `Morning Brief` navigation target is not confusing because it currently routes through Home rather than a dedicated Workspace brief route.
9. Review lower Input pages, Portfolio Assets, and older center components for V15 language parity.
10. Consider lazy-loading diagnostics panels if production route performance needs improvement.

## 12. Release Recommendation

Push: Yes, after RC1 doc is reviewed.

PR: Yes.

Beta: Nearly Ready. Proceed to preview / PR and then run authenticated production visual QA. Invite-only Beta should wait until authenticated visual QA confirms no account gate, no layout breakage, no console errors, and acceptable mobile behavior.

## 13. V15 Release Checklist

| Item | Status | Evidence |
| --- | --- | --- |
| Lint | Pass | `npm run lint` passed on 2026-07-03. |
| Build | Pass | `npm run build` passed on 2026-07-03. |
| Diff check | Pass | `git diff --check` passed on 2026-07-03. |
| Working tree before RC1 | Clean | Confirmed before RC1 doc creation. |
| V13.8 commit | Done | `db557ef`. |
| Product Experience Framework commit | Done | `a85d57d`. |
| Home Redesign commit | Done | `c94faa2`. |
| Wave 1 commit | Done | `3909e09`. |
| Wave 2 commit | Done | `72455be`. |
| Wave 3 commit | Done | `f2871cc`. |
| Docs | RC1 added | This document records release review. |
| Navigation | Pass | Desktop and mobile IA updated in Wave 3. |
| Design System | Pass with V15.1 polish | V15 pages use shared product primitives; legacy diagnostics still need polish. |
| Authenticated visual QA | Blocked | Requires signed-in production/local Workspace session. |
| Release rating | Nearly Ready | Ready for PR / preview; Beta requires authenticated visual QA. |
