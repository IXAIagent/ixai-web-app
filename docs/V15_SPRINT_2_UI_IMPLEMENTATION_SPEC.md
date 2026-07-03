# V15 Sprint 2 UI Implementation Specification

Planning date: 2026-07-03

Source documents:

- `docs/V15_UX_AUDIT.md`
- `docs/V15_SPRINT_1_IA_NAVIGATION_REDESIGN_PLAN.md`
- `docs/V15_DESIGN_SYSTEM_2.md`

Purpose: convert the V15 UX Audit, IA plan, and Design System 2.0 into a React UI implementation specification for V15 Sprint 2 through Sprint 4. This document is the UI development baseline for the V15 Product Experience Redesign.

Scope: documentation only. No React, TSX, CSS, product logic, routing, schema, auth, billing, broker, trading, recommendation, scheduler, or AI provider changes are included.

## 1. Product Vision

IXAI is no longer an engineering dashboard; IXAI is an AI Wealth Workspace.

The Home first screen must always answer:

- 今天我的資產怎麼樣？
- 今天有哪些風險？
- 今天市場有什麼重點？
- 我下一步該做什麼？

Product posture:

- Investment monitoring.
- Risk awareness.
- Explain-only intelligence.
- No trading instruction.
- No buy/sell/hold recommendation.
- No target price.

## 2. Home Implementation

### Target order

1. Hero Summary
2. Morning Brief
3. Portfolio Snapshot
4. Today's Alerts
5. Market Snapshot
6. Quick Actions
7. Recent Activity
8. Diagnostics, collapsed by default

### First-screen requirement

The first screen must answer the four Product Vision questions before any diagnostics appear.

### Keep components

- Workspace page shell and authenticated route shell.
- Morning Brief card logic where already available.
- Existing portfolio, market, risk, FCN, notification, and activity data adapters where safe.
- Existing runtime-safe fallback helpers.
- Existing i18n and localization provider.

### Remove from primary Home order

Remove means remove from the first-screen primary hierarchy, not delete the component.

- `LiveMarketDataStatus` as a first-screen block.
- i18n foundation status card as a first-screen block.
- localization preview as a first-screen block.
- provider/cache/runtime readiness cards as primary content.
- beta/system readiness cards as primary content.

### Rename components for UI intent

| Current component / surface | Future UI intent |
| --- | --- |
| Workspace market status | Market Snapshot |
| Workspace health summary | Diagnostics Panel |
| Morning Brief v14 card | Daily Brief Card |
| Live quote status | Market Data Status, secondary |
| Localization preview | Locale & Region Preview, Settings only |

### New components

- `HomeHeroSummary`
- `HomeMorningBriefCard`
- `HomePortfolioSnapshotCard`
- `HomeTodaysAlertsCard`
- `HomeMarketSnapshotCard`
- `HomeQuickActions`
- `HomeRecentActivity`
- `HomeDiagnosticsPanel`

### Home empty states

- No portfolio: show CTA to add first asset.
- No FCN: show optional CTA to add FCN.
- No watchlist: show CTA to add watched symbol.
- No Morning Brief: show CTA to generate Morning Brief.
- No alerts: show calm "no issues requiring attention" message.

## 3. Portfolio Implementation

### Target order

1. Portfolio Hero
2. Total Assets
3. Today's Performance
4. Allocation
5. Risk Summary
6. Holdings
7. Recent Changes
8. Diagnostics

### First-screen requirement

The first screen must show what the user owns, what changed today, and whether there is a meaningful risk signal.

### Keep components

- Holdings data and portfolio adapters.
- Portfolio valuation logic.
- Existing safe fallback behavior.
- Existing holdings list/table where usable.

### Move to Diagnostics

- Portfolio Truth.
- Canonical Readback.
- Persistence Layer.
- Source Status.
- Market provider/cache details.

### New components

- `PortfolioHero`
- `PortfolioTotalAssetsCard`
- `PortfolioPerformanceCard`
- `PortfolioAllocationCard`
- `PortfolioRiskSummaryCard`
- `PortfolioHoldingsSection`
- `PortfolioRecentChanges`
- `PortfolioDiagnosticsPanel`

### UI copy rules

- Use "我的資產資料" instead of "Portfolio Truth".
- Use "儲存狀態" instead of "Persistence Layer".
- Use "資料狀態" instead of "Source Status".

## 4. FCN Implementation

### Target order

1. FCN Hero
2. Risk Summary
3. Upcoming Observation
4. Coupon Schedule
5. Upcoming Maturity
6. Positions
7. Diagnostics

### First-screen requirement

The first screen must show whether the user's FCN positions are safe, need attention, or are near danger.

### Keep components

- FCN risk data.
- FCN schedule data.
- Lifecycle and position data.
- Existing manual price fallback behavior.

### Move to Diagnostics

- Readback status.
- Repository source.
- External provider state.
- Risk engine internals.
- Manual price adapter details.

### New components

- `FcnHero`
- `FcnRiskSummaryCard`
- `FcnUpcomingObservationCard`
- `FcnCouponScheduleCard`
- `FcnUpcomingMaturityCard`
- `FcnPositionsSection`
- `FcnDiagnosticsPanel`

### UI copy rules

- Worst-of -> 表現最弱標的.
- Distance to KI -> 距離 KI.
- Distance to Strike -> 距離履約價.
- Observation -> 觀察日.
- Coupon -> 配息.
- KO -> KO 狀態.

## 5. Risk Implementation

### Target order

1. Today's Risk
2. Risk Explanation
3. Top Risk Drivers
4. Concentration
5. Exposure
6. Diagnostics

### First-screen requirement

The first screen must answer "今天風險如何？" and "為什麼？"

### Keep components

- Existing risk calculations and summaries.
- Existing FCN risk and exposure inputs.
- Existing safe fallback behavior.

### Move to Diagnostics

- Risk Engine score dump.
- Signal counts.
- Shared holdings readback.
- Source status.
- Data readiness internals.

### New components

- `TodaysRiskCard`
- `RiskExplanationCard`
- `TopRiskDriversSection`
- `ConcentrationRiskCard`
- `ExposureSummaryCard`
- `RiskDiagnosticsPanel`

### UI copy rules

- Use calm labels: 安全, 注意, 危險, 暫無資料.
- Do not use fear-based language.
- Do not imply investment advice.

## 6. Intelligence Implementation

### Target order

1. Today's Market
2. Portfolio Impact
3. AI Summary
4. News
5. Watchlist
6. Diagnostics

### First-screen requirement

The first screen must feel like a market and workspace brief, not a source inventory.

### Keep components

- Existing intelligence cards where safe.
- Existing Morning Brief or market intelligence sources.
- Existing news and watchlist inputs.
- Existing explain-only safety framing.

### Move to Diagnostics

- Portfolio Truth source cards.
- Market Service source cards.
- Market Cache source cards.
- Valuation source cards.
- FCN schedule/risk source cards.
- Intelligence foundation and readiness flags.

### New components

- `TodaysMarketCard`
- `PortfolioImpactCard`
- `AiMarketSummaryCard`
- `NewsSummarySection`
- `WatchlistIntelligenceSection`
- `IntelligenceDiagnosticsPanel`

### UI copy rules

- Start with "what changed" and "why it matters".
- Never lead with readiness, foundation, or source inventory.
- Keep recommendation safety language visible but secondary.

## 7. Copilot Implementation

### Required sections

1. Suggested Questions
2. Recent Conversations
3. Empty State
4. Conversation

### First-screen requirement

The user should immediately know what they can ask.

### Suggested Questions examples

- 今天有哪些 FCN 快 KI？
- 今天最大的風險是什麼？
- 哪些新聞影響我的 Portfolio？
- 幫我整理今日 Morning Brief。
- 我的資產配置有什麼需要留意？
- 哪些 watchlist 標的今天變動較大？

### New components

- `CopilotSuggestedQuestions`
- `CopilotRecentConversations`
- `CopilotEmptyState`
- `CopilotConversationShell`
- `CopilotSafetyNotice`

### UI copy rules

- Prompts must be explain-only.
- Do not suggest buy/sell/hold.
- Do not request target prices.
- If data is missing, explain what is missing and offer a safe next step.

## 8. Navigation Mapping

| Current | New |
| --- | --- |
| Home | 首頁 |
| Portfolio | 我的資產 -> 投資組合 |
| FCN | 我的資產 -> FCN |
| Input | 我的資產 -> 新增資產 |
| Stock Input | 我的資產 -> 新增資產 -> 股票 / ETF |
| Crypto Input | 我的資產 -> 新增資產 -> Crypto |
| FCN Input | 我的資產 -> 新增資產 -> FCN |
| Watchlist | 市場 -> Watchlist |
| Intelligence | AI -> Intelligence |
| Copilot | AI -> Copilot |
| Notifications | 通知 |
| Timeline | 通知 -> Timeline |
| Settings | 設定 |
| Health | Settings -> Advanced -> 系統狀態 |
| Beta | Settings -> Advanced -> Beta Program |
| Diagnostics | Settings -> Advanced -> Diagnostics |

Navigation implementation rules:

- Existing URLs can remain stable during Sprint 2.
- Navigation grouping and labels can change before route migration.
- Health and Beta must not remain first-level primary destinations.
- Mobile navigation should expose only the most important user jobs.

## 9. Component Migration Matrix

| Current Component / Surface | Future Component / Surface | Priority |
| --- | --- | --- |
| `WorkspaceMarketStatus` | Market Snapshot Card | P1 |
| `LiveMarketDataStatus` | Market Data Diagnostic Card | P2 |
| `WorkspaceHealthSummary` | Diagnostics Panel | P2 |
| `WorkspaceHealthCenter` | Settings Advanced System Status | P3 |
| `BetaReadinessDashboard` | Settings Advanced Beta Program | P3 |
| `WorkspaceMorningBriefV14Card` | Daily Brief Card | P0 |
| `BriefShareActions` | Brief Action Bar | P1 |
| `PortfolioTruthSummary` | Portfolio Data Status Diagnostic | P2 |
| `PortfolioPersistenceSummary` | Portfolio Storage Diagnostic | P2 |
| `PortfolioValuationSummary` | Portfolio Summary / Valuation Card | P0 |
| `LivePortfolioValuationCard` | Portfolio Market Data Diagnostic | P2 |
| `RiskEngineSummary` | Today's Risk Card | P0 |
| `LiveRiskAdapterCard` | Risk Data Diagnostic | P2 |
| `GlobalRiskCenterWorkspace` | Risk Page Composition | P0 |
| `FcnRiskSummary` | FCN Risk Summary Card | P0 |
| `FcnScheduleSummary` | Upcoming Schedule Card | P1 |
| `LiveFcnUnderlyingStatusCard` | FCN Market Data Diagnostic | P2 |
| `FCNCenterWorkspace` | FCN Page Composition | P0 |
| `IntelligenceSummary` | AI Market Summary Card | P0 |
| `IntelligenceV2Summary` | Intelligence Diagnostic / Safety Panel | P2 |
| `IntelligenceCenterWorkspace` | Intelligence Page Composition | P0 |
| `WorkspaceCopilotSummary` | Copilot Suggested Questions + Conversation | P0 |
| `NotificationCenterSummary` | Today's Alerts / Notifications Section | P1 |
| `WorkspaceTimelineSummary` | Timeline Events Section | P1 |
| `SettingsRuntimeDiagnosticsControl` | Settings Advanced Diagnostics Control | P3 |

## 10. Component Priority

### P0: first screen required

P0 components must appear in the first screen or immediately after the hero.

Examples:

- Home Hero Summary.
- Daily Brief Card.
- Portfolio Snapshot.
- Today's Risk Card.
- FCN Risk Summary.
- Copilot Suggested Questions.

### P1: main content

P1 components form the primary content after the first screen.

Examples:

- Holdings.
- Upcoming Schedule.
- Market Snapshot.
- Alerts.
- Watchlist.
- Recent Activity.

### P2: collapsible

P2 components are useful but should be collapsible or visually secondary.

Examples:

- Market data status.
- Source status.
- Data freshness.
- Risk score breakdown.
- Valuation source detail.

### P3: Advanced

P3 components belong under Settings -> Advanced.

Examples:

- Health.
- Beta.
- Diagnostics.
- Runtime/system status.
- Provider/cache internals.
- Activation/foundation status.

## 11. Mobile Rules

Mobile Home maximum first-pass hierarchy:

1. Hero
2. Morning Brief
3. Portfolio
4. Alerts
5. Quick Actions

Mobile requirements:

- Do not require more than two scrolls before the user sees the core Home value.
- The first screen must not contain diagnostics.
- Cards stack one column.
- KPI values must stay readable.
- Long labels must wrap without overlap.
- Tables should become compact rows or summary cards.
- Secondary diagnostics must stay collapsed by default.

Mobile order by page:

- Portfolio: Hero, Total Assets, Today's Performance, Allocation, Holdings.
- FCN: Hero, Risk Summary, Upcoming Observation, Coupon, Positions.
- Risk: Today's Risk, Explanation, Drivers, Exposure.
- Intelligence: Today's Market, AI Summary, Portfolio Impact, News.
- Copilot: Suggested Questions, Empty/Conversation, Recent Conversations.

## 12. Animation Rules

Allowed:

- Fade.
- Slide.
- Skeleton loading.

Rules:

- Animation must clarify state change.
- Loading skeletons should match final card shape.
- Motion should be short and subtle.
- Respect reduced-motion preferences.

Forbidden:

- Large decorative animation.
- Flashing states.
- Constant motion.
- Animated diagnostics that distract from primary content.
- Animation that changes layout height unpredictably.

## 13. Accessibility

### Color contrast

- All text must meet readable contrast.
- Risk color must never be the only signal.
- Status badges must include text.

### Keyboard navigation

- All interactive controls must be keyboard reachable.
- Focus order follows visual order.
- Collapsible diagnostics must be keyboard operable.

### Screen reader

- Cards need meaningful headings.
- Icon-only controls require accessible labels.
- Status updates should have text equivalents.

### ARIA

- Use ARIA only when semantic HTML is insufficient.
- Dialogs, tabs, menus, collapsible panels, and icon buttons need correct labels and state.

### Focus states

- Visible focus required.
- Focus states must not be hidden by custom styling.
- Mobile and desktop focus behavior should remain predictable.

## 14. Success Metrics

After redesign:

- A new user understands the product purpose within 30 seconds.
- A new user finds Portfolio within 60 seconds.
- A new user understands today's risk within 60 seconds.
- Morning Brief exposure on Home increases.
- Health / Diagnostics click rate decreases.
- Users reach FCN safety status faster.
- Users can identify next action from Home without opening diagnostics.
- Mobile users can understand Home value within two scrolls.

Measurement notes:

- These metrics should be evaluated through authenticated visual QA and lightweight user testing.
- Health / Diagnostics click rate decreasing is positive only if no support burden increases.

## 15. Sprint Implementation Order

### Sprint 2.1: Home

- Implement Home hierarchy.
- Add Home Hero Summary.
- Add Morning Brief, Portfolio Snapshot, Today's Alerts, Market Snapshot, Quick Actions, Recent Activity.
- Collapse diagnostics by default.

### Sprint 2.2: Portfolio

- Reorder Portfolio first screen.
- Add Total Assets, Today's Performance, Allocation, Risk Summary.
- Move truth/readback/persistence details to Diagnostics.

### Sprint 2.3: FCN

- Reorder FCN around safety, KI, observation, coupon, maturity, and positions.
- Move readback/provider/repository details to Diagnostics.

### Sprint 2.4: Risk

- Add Today's Risk and Risk Explanation.
- Move score breakdown and signal counts below primary content.

### Sprint 2.5: Intelligence

- Reframe Intelligence as Today's Market, Portfolio Impact, AI Summary, News, Watchlist.
- Move source inventory and readiness details to Diagnostics.

### Sprint 2.6: Copilot

- Add Suggested Questions.
- Add Recent Conversations.
- Add useful empty state.
- Ensure prompts remain explain-only.

### Sprint 3: Navigation

- Apply new navigation grouping.
- Move Health and Beta under Settings -> Advanced.
- Validate desktop and mobile navigation.

### Sprint 4: Design Polish

- Normalize card styling.
- Normalize empty states.
- Normalize risk visual language.
- Normalize icons and focus states.
- Complete responsive QA.

## Out of Scope

This UI implementation spec does not authorize:

- React code changes in this document-only step.
- TSX changes in this document-only step.
- CSS changes in this document-only step.
- Route migrations without separate approval.
- Auth changes.
- Supabase schema changes.
- Migrations.
- RLS or membership changes.
- Billing or Stripe changes.
- Broker or trading integration.
- Buy/sell/hold recommendation logic.
- Target price generation.
- Scheduler, Telegram, LINE, or email delivery activation.
- AI provider or OpenAI behavior changes.
- Portfolio, FCN, Risk, valuation, or market provider core logic changes.
