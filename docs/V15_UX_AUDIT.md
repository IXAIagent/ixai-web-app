# V15 UX Audit

Review date: 2026-07-03

Audit mode: local Workspace UX audit with source-level fallback.

Production authenticated state was not reusable and was intentionally stopped. Localhost was started and `/my-ixai/home` was checked, but the local browser session also rendered the account gate instead of a true Workspace page. Per audit instruction, this report does not treat the account gate as Workspace content. The findings below are based on source-level inspection of `app/my-ixai/*` routes and the actual Workspace components under `components/workspace`, `components/portfolio`, `components/fcn`, `components/risk`, `components/intelligence`, `components/copilot`, and `components/market`.

## Executive Summary

IXAI's authenticated Workspace has a strong technical foundation, but the current UX still reads too much like an internal engineering console. The main user journeys are present: Home, Portfolio, FCN, Risk, Intelligence, Copilot, Watchlist, Notifications, Timeline, Settings, Health, and Beta. However, the first-level experience often prioritizes source status, provider health, cache state, readback layers, readiness checks, and runtime diagnostics before the investor's core questions.

The biggest UX opportunity for V15 is to move from "system capability dashboard" to "daily investment workspace." Users should first see what changed, what needs attention, and what action to take next. Diagnostics should remain available, but mostly as secondary detail or Settings -> Advanced.

Highest-priority UX themes:

- Home should feel like a daily investment desk, not a status board.
- Portfolio should lead with total assets, allocation, movement, and risk, not truth/readback/persistence layers.
- FCN should lead with safe / attention / danger, nearest KI, upcoming observation, coupon, and maturity.
- Risk should answer "today's risk level and drivers" before showing engine internals.
- Intelligence should behave like a market/workspace brief, not a collection of source summaries.
- Copilot needs visible prompt suggestions and task entry points.
- Health and Beta should move out of first-level navigation into Settings -> Advanced.
- Provider/cache/runtime/readiness language should be downgraded or translated into user-facing language.

## Current UX Scorecard

| Area | Score | UX status | Primary issue |
| --- | ---: | --- | --- |
| Home | 5/10 | Functionally broad, emotionally unclear | First screen mixes welcome, live quote status, i18n/localization status, brief, and center cards before answering what matters today. |
| Portfolio | 5/10 | Data-rich but too technical | Truth, persistence, valuation, source status, and market diagnostics appear before a user-first asset overview. |
| Input | 6/10 | More task-oriented than other areas | Asset input flows are understandable, but still use foundation/workspace-entry/future capability language. |
| FCN | 6/10 | Strong domain coverage | Useful FCN risk/schedule data exists, but readback/data path/provider blocks compete with safety and observation priorities. |
| Risk | 5/10 | Powerful but engine-forward | Risk pages expose source/readiness/signal-count concepts before a plain "today's risk" answer. |
| Intelligence | 4/10 | Too source-summary oriented | Reads like a system intelligence inventory rather than a market brief. |
| Copilot | 4/10 | Not enough assistant affordance | The page is summary-first and lacks prompt suggestions or a clear conversational starting point. |
| Watchlist | 5/10 | Basic monitoring concept is clear | Needs stronger "what changed / what needs attention" hierarchy and less quote-source detail. |
| Notifications | 6/10 | Purpose is clear | Needs user urgency grouping and less alert-engine/readback framing. |
| Timeline | 6/10 | Useful event concept | Should emphasize upcoming obligations and FCN events over dated readback/system framing. |
| Settings | 7/10 | Most understandable area | Main settings are grouped, but runtime diagnostics and foundation cards should move into Advanced. |
| Health / Beta | 4/10 | Useful internally | Should not be first-level workspace navigation for ordinary beta users. |

## Top 20 UX Issues

1. Home does not immediately answer "今天我的資產怎麼樣？"
2. Home exposes Live Quote Status, i18n foundation, localization preview, and status cards too early.
3. Portfolio leads with truth/readback/persistence concepts instead of total assets, allocation, and risk.
4. Portfolio uses internal terms such as Portfolio Truth, Persistence Layer, Canonical Readback, Data Source, and Source Status.
5. FCN has the right domain data, but raw readback/data path/provider details are too prominent.
6. FCN should lead with safety state, nearest KI, worst-of performance, next observation, coupon, and maturity.
7. Risk feels like Risk Engine output rather than "today's risk and why."
8. Intelligence feels like a capability/readiness center, not a market summary.
9. Copilot has no obvious prompt suggestions or starter tasks.
10. Health and Beta appear as primary Workspace destinations even though they are governance/diagnostic pages.
11. Provider, cache, runtime, source, readiness, readback, persistence, and diagnostics language appears throughout user-facing UI.
12. Empty states often describe system readiness rather than the next user step.
13. CTA hierarchy is inconsistent; some pages have clear buttons while others are mostly passive summaries.
14. Page hierarchy often places infrastructure status above user outcome summaries.
15. Some route labels are module names rather than user jobs.
16. Technical badges like local, fallback, partial, persisted, and unavailable need user-facing explanations.
17. Mobile first screen likely requires too much scrolling before the user sees the page's main value.
18. Diagnostics are repeated across Home, Portfolio, FCN, Intelligence, Settings, Health, and Beta.
19. Translation and terminology are improved, but several labels still feel literal or engineering-led.
20. Navigation is too deep and too module-oriented for daily investor use.

## Page-by-page Audit

### Home

Evidence inspected:

- `app/my-ixai/home/page.tsx`
- `components/market/live-market-data-status.tsx`
- `components/workspace/workspace-morning-brief-v14-card.tsx`
- workspace health, i18n, localization, and beta status components

Current UX:

Home has a welcome hero and useful entry points to Portfolio and FCN, but the page quickly becomes a collection of system readiness and capability modules. The live quote status, i18n foundation, localization preview, Morning Brief, center cards, and diagnostic-style summaries compete for attention.

Recommended direction:

- First screen should answer:
  - 今天我的資產怎麼樣？
  - 今天有什麼風險？
  - 哪些 FCN 要注意？
  - 有什麼市場重點？
  - 我下一步該看哪裡？
- Move provider/cache/i18n/localization readiness into secondary diagnostics.
- Use a daily summary structure: Assets, Risk, FCN Attention, Market Brief, Next Action.

### Portfolio

Evidence inspected:

- `app/my-ixai/portfolio/page.tsx`
- `components/portfolio/portfolio-truth-summary.tsx`
- `components/portfolio/portfolio-persistence-summary.tsx`
- `components/portfolio/portfolio-valuation-summary.tsx`
- `components/portfolio/live-portfolio-valuation-card.tsx`
- `components/market/workspace-market-status.tsx`

Current UX:

Portfolio has rich data, but it opens with implementation trust layers: truth summary, persistence summary, valuation summary, live valuation status, source status, and market status. These are useful internally, but ordinary users expect total assets, today's movement, allocation, concentration, and risk first.

Recommended direction:

- First card: total portfolio value, daily change, main allocation, risk indicator.
- Second layer: holdings, allocation chart, top movers, missing inputs.
- Third layer: diagnostics such as readback/source/cache/provider.
- Replace "Portfolio Truth" with "我的資產資料".
- Replace "Persistence Layer" with "儲存狀態" or hide behind Advanced.

### Input

Evidence inspected:

- `app/my-ixai/input/page.tsx`
- `app/my-ixai/input/stock/page.tsx`
- `app/my-ixai/input/crypto/page.tsx`
- `app/my-ixai/input/fcn/page.tsx`

Current UX:

Input is one of the clearer areas because it is task-oriented: add stock, crypto, or FCN. However, it still contains wording like foundation, workspace entry, intelligence workflow, future CRUD, CSV, and broker sync.

Recommended direction:

- Keep the asset-type entry structure.
- Replace future capability language with plain user guidance.
- Add stronger "what you need before starting" copy.
- Use review/confirm language before saving.

### Watchlist

Evidence inspected:

- `app/my-ixai/watchlist/page.tsx`
- `components/market/*`

Current UX:

The page direction is understandable, but the Watchlist area still mixes monitoring language with quote/source/service framing. A user should first know what changed, what needs attention, and what to watch today.

Recommended direction:

- Show top price moves and watch alerts first.
- Keep market source status as a small secondary line.
- Make empty state actionable: "新增你想追蹤的標的".

### Notifications

Evidence inspected:

- `app/my-ixai/notifications/page.tsx`
- `components/workspace/notification-center-summary.tsx`

Current UX:

Notifications has a clear purpose, but source copy references alert engine readback and local notification cards. This sounds internal and should be softened.

Recommended direction:

- Group by urgency: 需要處理, 提醒, 已讀.
- Show clear action labels: 查看資產, 查看 FCN, 稍後提醒.
- Hide delivery/runtime details unless in Settings.

### Timeline

Evidence inspected:

- `app/my-ixai/timeline/page.tsx`
- `components/workspace/workspace-timeline-summary.tsx`

Current UX:

Timeline is valuable for FCN coupon, observation, maturity, and dated alerts. The core concept is strong, but page copy should emphasize "接下來發生什麼" rather than readback.

Recommended direction:

- Lead with next 7 days / next 30 days.
- Highlight FCN observation and coupon events.
- Use task copy: "今天要注意", "本週要確認".

### Copilot

Evidence inspected:

- `app/my-ixai/copilot/page.tsx`
- `components/copilot/workspace-copilot-summary.tsx`

Current UX:

Copilot currently reads more like a summary runner than an assistant. The component has a "Run summary" style action and exposes source-engine style metadata. It does not appear to provide strong prompt suggestions or conversational starter cards.

Recommended direction:

- Add prompt suggestion cards:
  - 整理今日投資組合風險
  - 找出需要注意的 FCN
  - 解釋今天市場重點
  - 幫我準備 Morning Brief
- Keep explain-only safety boundaries, but do not let them make the page feel empty.
- Hide source-engine metadata behind details.

### Health

Evidence inspected:

- `app/my-ixai/health/page.tsx`
- `components/workspace/workspace-health-center.tsx`
- workspace diagnostic/status components

Current UX:

Health Center is useful for system confidence, but it is a diagnostic surface: market API, quote cache, runtime safety, data quality, i18n readiness, localization, and brief readiness. It should not compete with daily user workflows.

Recommended direction:

- Move to Settings -> Advanced -> System Status.
- Rename Runtime Health to 系統狀態.
- Keep diagnostics collapsible.

### Beta

Evidence inspected:

- `app/my-ixai/beta/page.tsx`
- `components/workspace/beta-readiness-dashboard.tsx`

Current UX:

Beta is release-governance oriented. It is useful for internal validation and invite-only rollout, but not as first-level daily navigation.

Recommended direction:

- Move to Settings -> Advanced -> Beta Program.
- Keep release notes and QA checklist for internal users.

### Risk

Evidence inspected:

- `app/my-ixai/risk/page.tsx`
- `components/risk/global-risk-center-workspace.tsx`
- `components/risk/risk-engine-summary.tsx`
- `components/risk/live-risk-adapter-card.tsx`

Current UX:

Risk has meaningful data, but it is framed around Global Risk Center, Risk Engine, signal counts, source status, shared holdings readback, and readiness. Users need a plain risk answer first.

Recommended direction:

- First screen: 今天風險等級, top 3 drivers, worst exposure, what changed.
- Separate FCN risk, concentration risk, market risk, and data confidence.
- Move engine score details below the user summary.

### FCN

Evidence inspected:

- `app/my-ixai/fcn/page.tsx`
- `components/fcn/fcn-center-workspace.tsx`
- `components/fcn/fcn-risk-summary.tsx`
- `components/fcn/fcn-schedule-summary.tsx`
- `components/fcn/live-fcn-underlying-status-card.tsx`

Current UX:

FCN has strong specialist coverage: KI distance, strike distance, worst-of, KO, observation, coupon, maturity, manual prices, lifecycle, and risk. The issue is hierarchy. Data path, readback status, repository source, persistence, manual prices, risk engine, and external provider blocks are too visible.

Recommended direction:

- Lead with safety buckets: 安全, 注意, 危險.
- Show nearest KI / nearest observation / next coupon / worst performer first.
- Put raw readback and provider details in an Advanced diagnostics section.

### Intelligence

Evidence inspected:

- `app/my-ixai/intelligence/page.tsx`
- `components/intelligence/intelligence-center-workspace.tsx`
- `components/intelligence/intelligence-summary.tsx`
- `components/intelligence/intelligence-v2-summary.tsx`

Current UX:

Intelligence reads like a source/capability center: Portfolio Truth, Market Service, Market Cache, Portfolio Valuation, Risk, FCN Risk, FCN Schedule, v2 foundation, workspace intelligence context, and safety flags. This is helpful internally but does not yet feel like a market brief.

Recommended direction:

- Reframe as "今日市場摘要".
- Group by: market moves, portfolio impact, FCN implications, risk warnings, next actions.
- Keep source readiness and safety flags secondary.

### Settings

Evidence inspected:

- `app/my-ixai/settings/page.tsx`
- `components/workspace/settings-runtime-diagnostics-control.tsx`
- i18n and localization preference components

Current UX:

Settings is relatively strong. Account, notification, language, region/currency, broker, and data settings are natural groups. The main issue is that diagnostics/foundation cards are visible too high for ordinary users.

Recommended direction:

- Keep locale and region/currency controls.
- Move runtime diagnostics, foundation cards, and system readiness into Advanced.
- Make "Coming soon" labels specific and useful.

## Navigation / IA Audit

Current route structure is complete but too module-oriented. Several first-level destinations are internal or operational: Health, Beta, diagnostics-heavy status pages, and readiness surfaces. This creates a feeling that the Workspace is built around the system implementation rather than the investor's daily flow.

Recommended IA:

- 首頁
- 我的資產
  - 投資組合
  - FCN
- 市場
  - Watchlist
  - 市場概況
- AI
  - Morning Brief
  - Copilot
- 通知
- 設定
  - 個人化
  - 語言與地區
  - 資料與隱私
  - Advanced
    - 系統狀態
    - Beta Program
    - Diagnostics

Health and Beta should not be first-level navigation for regular beta users.

## Engineering-language Replacement Table

| Current / engineering language | Recommended user language |
| --- | --- |
| Live Quote Status | 即時行情狀態 |
| Cache | 更新狀態 |
| Provider | 資料來源 |
| Runtime Health | 系統狀態 |
| Readiness | 尚未啟用 / 準備中 |
| Diagnostics | 進階檢查 |
| Source Status | 資料狀態 |
| Data Quality | 資料完整度 |
| Market Provider Boundary | 行情資料範圍 |
| Portfolio Truth Layer | 我的資產資料 |
| Portfolio Truth | 我的資產資料 |
| Persistence Layer | 儲存狀態 |
| Canonical Readback | 正式資料讀取結果 |
| Readback | 讀取結果 |
| Repository Source | 資料儲存來源 |
| Source Engine | 產生來源 |
| Risk Engine | 風險分析 |
| Signal Counts | 風險訊號 |
| Foundation Risk Score | 基礎風險分數 |
| Workspace intelligence context | Workspace 摘要背景 |
| Market Service | 行情服務 |
| Manual Prices | 手動價格 |
| Fallback | 暫用資料 |
| Stale | 可能過期 |
| Unavailable | 暫時無法取得 |
| Partial | 部分可用 |
| Persisted | 已儲存 |
| Local | 本機暫存 |

## Recommended Home Redesign

The Home first screen should answer five questions:

1. 今天我的資產怎麼樣？
2. 今天有什麼風險？
3. 哪些 FCN 要注意？
4. 有什麼市場重點？
5. 我下一步該看哪裡？

Recommended first-screen structure:

- Daily header: date, market status, last update.
- Asset snapshot: total value, daily movement, top allocation, missing data warning.
- Risk snapshot: risk level, top 3 drivers, one CTA to Risk.
- FCN attention: nearest KI, next observation, next coupon, one CTA to FCN.
- Market brief: top watchlist moves and market context.
- Next action rail: 新增資產, 檢查風險, 查看 FCN, 產生 Morning Brief.

Diagnostics should move below a collapsible "System status" section or Settings -> Advanced.

## Recommended UX Sprint Plan

### V15 Sprint 1: UX Audit & IA Redesign

- Finalize navigation structure.
- Define user-facing terminology.
- Move Health/Beta/Diagnostics into Settings -> Advanced.
- Create page hierarchy specs for Home, Portfolio, FCN, Risk, Intelligence, and Copilot.

### V15 Sprint 2: Home / Dashboard Redesign

- Build the daily investment desk first screen.
- Add asset, risk, FCN, market, and next-action summary blocks.
- Downgrade live quote/cache/provider details.

### V15 Sprint 3: Portfolio / FCN / Risk Redesign

- Reorder Portfolio around total assets, allocation, movement, and risk.
- Reorder FCN around safety, KI, observation, coupon, maturity.
- Reorder Risk around daily risk level and drivers.

### V15 Sprint 4: Design System 2.0 + Empty States

- Normalize cards, badges, icons, empty states, and CTA patterns.
- Add mobile-first hierarchy checks.
- Standardize user-language translations for technical states.

## Screenshots / Evidence

Authenticated production screenshots are intentionally not used because the production authenticated state could not be reused. Local browser verification also reached the account gate.

Evidence used in this audit:

- Local route check: `http://localhost:3001/my-ixai/home` rendered account gate, so browser UX scan was stopped.
- Source-level route scan:
  - `app/my-ixai/home/page.tsx`
  - `app/my-ixai/portfolio/page.tsx`
  - `app/my-ixai/input/page.tsx`
  - `app/my-ixai/input/stock/page.tsx`
  - `app/my-ixai/input/crypto/page.tsx`
  - `app/my-ixai/input/fcn/page.tsx`
  - `app/my-ixai/watchlist/page.tsx`
  - `app/my-ixai/notifications/page.tsx`
  - `app/my-ixai/timeline/page.tsx`
  - `app/my-ixai/copilot/page.tsx`
  - `app/my-ixai/health/page.tsx`
  - `app/my-ixai/beta/page.tsx`
  - `app/my-ixai/risk/page.tsx`
  - `app/my-ixai/fcn/page.tsx`
  - `app/my-ixai/intelligence/page.tsx`
  - `app/my-ixai/settings/page.tsx`
- Component-level source scan:
  - `components/workspace/*`
  - `components/portfolio/*`
  - `components/fcn/*`
  - `components/risk/*`
  - `components/intelligence/*`
  - `components/copilot/*`
  - `components/market/*`

Screenshot artifacts from blocked browser attempts should be treated only as authentication evidence, not Workspace UX evidence.

## Completion Criteria for UX Redesign

V15 UX redesign should be considered complete only when:

- Home first screen answers assets, risk, FCN attention, market context, and next action.
- Portfolio first screen shows total assets, allocation, movement, and risk before diagnostics.
- FCN first screen shows safety state, nearest KI, next observation, coupon, and worst-of.
- Risk first screen shows today's risk level, top drivers, and what changed.
- Intelligence reads like a market/workspace brief.
- Copilot has useful prompt suggestions and obvious starter actions.
- Health and Beta are removed from first-level navigation.
- Provider/cache/source/runtime/readiness details are secondary diagnostics.
- Empty states tell users what to do next.
- Mobile first screen remains understandable without long diagnostic scrolling.
- zh-TW, en-US, ja-JP, zh-CN, and ko-KR terminology is consistent for primary navigation and state labels.
- No authenticated route uses the account gate as a false-positive Workspace page in QA.
