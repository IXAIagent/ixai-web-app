# V19E — Workspace UX Review & Beta QA

## Executive Summary

V19E is a source-level Workspace product QA pass for the authenticated Workspace experience after V19 Sprint D final polish.

Overall UX Score: **8.2 / 10**

Beta readiness verdict: **Near Ready**

The Workspace now reads much more like one coherent AI Investment Monitoring product. The primary pages consistently lead with a hero, KPI context, user-facing cards, and collapsed Advanced sections. The biggest remaining risk is not architecture or backend reliability; it is final product-language cleanup in legacy components that are still mounted inside Advanced panels or reachable through older deep links.

This review is based on source-level QA. It does not claim live authenticated browser visual QA, production console QA, or screenshot-based mobile QA.

## Scope

Audited Workspace pages:

- Today
- Portfolio
- Markets
- Risk
- Timeline
- Morning Brief
- Notifications
- Intelligence
- Copilot
- FCN

Out of scope:

- API changes
- Database changes
- Auth changes
- Business logic changes
- Market provider changes
- Scheduler changes
- AI model changes
- FCN engine changes
- Risk engine changes
- Trading / recommendation / billing

## Page QA Scorecard

| Page | 30-second understanding | Core question | Above-fold engineering wording | Visual consistency | Mobile source review | Empty states | Loading states | Error states | Accessibility source review | Score |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Today | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | 8.6 |
| Portfolio | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | 8.5 |
| Markets | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | 8.3 |
| Risk | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | 8.4 |
| Timeline | PASS | PASS | PASS | PASS | PASS | PASS | Limited | PASS | PASS | 8.0 |
| Morning Brief | PASS | PASS | PASS | PASS | PASS | PASS | Limited | PASS | PASS | 8.1 |
| Notifications | PASS | PASS | PASS | PASS | PASS | PASS | Limited | PASS | PASS | 8.2 |
| Intelligence | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | 8.2 |
| Copilot | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS | 8.1 |
| FCN | PASS | PASS | PASS | PASS | PASS | PASS | Limited | PASS | PASS | 8.4 |

## Core Question Review

### Today

Question: What do I need to know today?

Result: PASS

Evidence:

- Hero answers the day-level question directly.
- KPI row covers portfolio, risk, market, and next event.
- The first interaction path points to Portfolio and Morning Brief.
- Diagnostics remain collapsed at the bottom.

### Portfolio

Question: How is my money doing?

Result: PASS

Evidence:

- Hero prioritizes estimated value, today's P/L, largest position, gain/loss.
- Asset classes and holdings are clearly below the primary summary.
- Empty states explain that assets must be added first.

### Markets

Question: What happened today?

Result: PASS

Evidence:

- Markets is framed as external events that affect the user.
- Watchlist, movers, news, and calendar are kept separate from Portfolio value.
- Missing quote / incomplete data states are user-facing.

### Risk

Question: What deserves attention?

Result: PASS

Evidence:

- Risk is positioned as a decision center.
- Cards explain why each risk matters and what is affected.
- Engine components remain inside Advanced.

### Timeline

Question: What happens next?

Result: PASS

Evidence:

- Timeline groups events by Today, Tomorrow, and This Week.
- Empty states explain when events will appear.
- Technical source details stay in Advanced.

### Morning Brief

Question: What happened?

Result: PASS

Evidence:

- Morning Brief is now a narrative report with summary bullets.
- Portfolio, Markets, Risk, and Next sections are readable before raw sections.
- Advanced contains raw sections and quality details.

### Notifications

Question: What requires my attention?

Result: PASS

Evidence:

- Notifications are grouped by High, Medium, Information, Completed, and History.
- Cards include Why, Affects, and Action.
- Delivery preview remains in Advanced.

### Intelligence

Question: What does today's market mean for me?

Result: PASS

Evidence:

- Intelligence explains market meaning, portfolio impact, confidence, and items worth monitoring.
- Technical support cards are behind Advanced.

### Copilot

Question: What can I ask?

Result: PASS

Evidence:

- Landing prompt and suggested question cards answer the purpose immediately.
- Conversation empty state encourages useful starting questions.
- Advanced contains context and safety boundary.

### FCN

Question: Which FCNs need attention?

Result: PASS

Evidence:

- Hero leads with safety / attention / danger, KI distance, observation, and coupon context.
- Position cards focus on Worst-of, KI, Observation, Coupon, Market Signals, and Confidence.
- Data status and deeper checks are in Advanced.

## Engineering Wording Audit

Search terms:

- provider
- runtime
- cache
- readback
- engine
- placeholder
- diagnostics
- fetch
- internal
- api route
- source label

Result: **PASS with Advanced-only caveat**

Findings:

- The main V19 product surfaces no longer expose these words as primary hero, section title, or above-the-fold page framing.
- Technical terms still exist inside Advanced panels, legacy helper components, form placeholders, comments, and diagnostics-only components.
- This is acceptable for V19E as long as Advanced remains collapsed by default.

## Visual Consistency Review

Result: PASS

Consistent patterns observed:

- `WorkspaceProductHero`
- `WorkspaceProductSection`
- `WorkspaceKpiGrid`
- `WorkspaceEmptyState`
- `WorkspaceLoadingCard`
- `WorkspaceStateMessage`
- `WorkspaceDiagnosticsPanel`

Remaining consistency gap:

- Some legacy cards inside Advanced use older typography and copy. They are not first-layer UX blockers, but should be cleaned in V19.10 or V20 design cleanup.

## Mobile Review

Result: PASS source-level / Needs visual verification

Source-level positives:

- Main pages use responsive grids with mobile-first stacking.
- Primary actions become full-width or stacked where needed.
- Cards generally use `grid gap-*`, `sm:*`, `md:*`, `lg:*`, and `xl:*` breakpoints.
- Hero actions stack vertically on mobile.

Needs browser verification:

- Long KPI labels on small phones.
- Wide holdings rows on Portfolio.
- FCN position cards with many metadata rows.
- Notifications three-column section collapsing.

## Empty State Review

Result: PASS

Observed improvements:

- "No assets yet" explains adding first position.
- "No upcoming events" explains FCN positions, reminders, and watched assets.
- "No notifications right now" explains future alert personalization.
- "No market focus yet" points to creating a watchlist.
- Risk empty state explains that no elevated risks exist today.

Remaining gap:

- Some legacy nested components still use older empty-state language inside Advanced.

## Loading State Review

Result: PASS with minor gaps

Observed improvements:

- Shared loading state uses skeletons and friendly copy.
- Today and Markets explain that missing pieces will be shown clearly.

Minor gaps:

- Timeline, Morning Brief, Notifications, and FCN rely more on immediate fallback content than explicit skeletons.
- This is acceptable for Beta but should be standardized further.

## Error State Review

Result: PASS

Observed improvements:

- Shared state messages avoid fetch/runtime/internal language.
- Incomplete data is framed as unavailable or incomplete user information.

Remaining gap:

- Advanced-only legacy components may still expose technical error strings.

## Accessibility Review

Result: PASS source-level / Needs browser verification

Source-level positives:

- Pages use clear hero H1 and section H2/H3 patterns.
- Buttons have visible text labels.
- Icons are decorative with `aria-hidden` where appropriate.
- Loading cards use `aria-busy`.
- Advanced uses native `details` / `summary`.

Needs browser verification:

- Keyboard focus contrast across all CTA states.
- Screen reader order for dense KPI grids.
- Color contrast in low-opacity secondary text on the dark hero side cards.

## Top 20 Findings

1. Live authenticated browser QA is still required before Beta sign-off.
2. Mobile visual QA is source-level only in this pass.
3. Legacy Advanced components still contain engineering copy.
4. Some Advanced labels still use "Readback" or "Provider" by design.
5. Portfolio holdings table may need visual testing for narrow mobile widths.
6. FCN cards include dense metadata and may need a mobile compaction pass.
7. Notifications "Information / Completed / History" section needs phone viewport QA.
8. Timeline has friendly empty states but limited explicit loading state.
9. Morning Brief has limited explicit loading state because fallback report renders quickly.
10. FCN has limited explicit loading state because risk/schedule sections render progressively.
11. Copilot prompt is UI-only and does not send a conversation request; this is expected but should be clear in Beta notes.
12. Intelligence still mounts advanced summary components when Advanced opens; this is acceptable but should remain collapsed.
13. Home Advanced still contains detailed diagnostic labels; acceptable if collapsed.
14. Some metadata still mixes English product labels with Chinese copy; this may be intentional but should be reviewed in localization QA.
15. Some legacy form placeholders contain "placeholder" as JSX prop names, not visible product wording.
16. Error-state wording is improved, but legacy nested components inside Advanced may still leak technical errors.
17. Hero KPI values can be long; source now wraps values, but browser QA should confirm.
18. The Workspace now has many pages using similar layouts; route-level hierarchy should be validated with a real first-time tester.
19. Advanced panels use native `details`; keyboard behavior should be verified in browser.
20. Final production QA should include console, network, and hydration checks on the authenticated Workspace.

## Go / No-Go Checklist

| Gate | Status |
| --- | --- |
| Product missions are clear | PASS |
| Core question answerable per page | PASS |
| No diagnostics above the fold | PASS |
| Shared hero/card hierarchy | PASS |
| Empty states are user-facing | PASS |
| Loading states are user-facing | PASS |
| Error states avoid implementation language | PASS |
| Mobile source structure | PASS |
| Accessibility source structure | PASS |
| Authenticated browser visual QA | PENDING |
| Production console/network QA | PENDING |

## Beta Recommendation

Recommendation: **Proceed to authenticated browser QA / Beta RC**, not broad public release.

Rationale:

- Product language and page missions are coherent enough for Beta.
- Remaining issues are visual QA, legacy Advanced cleanup, and production verification, not core UX architecture blockers.
