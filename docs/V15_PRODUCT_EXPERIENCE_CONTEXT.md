# V15 Product Experience Context

Created: 2026-07-03

Purpose: canonical product context for all V15 Product Experience Redesign work. Future Sprint 2, Sprint 3, and Sprint 4 UI work should read this file before changing Workspace product surfaces.

## Vision

IXAI is moving from Developer Workspace to AI Wealth Workspace.

The product should no longer feel like an engineering dashboard that exposes provider, cache, runtime, readback, readiness, and diagnostics first. It should feel like a daily investment workspace that helps users understand what matters today.

Every Workspace first screen should answer:

- 今天我的資產如何？
- 今天有哪些風險？
- 今天市場如何？
- 下一步做什麼？

## Current V15 Status

Completed:

- V15 UX Audit.
- V15 Sprint 1 IA / Navigation Redesign Plan.
- V15 Design System 2.0.
- V15 Sprint 2 UI Implementation Specification.
- V15 Sprint 2.1 Home Redesign.
- V15 Sprint 2.1a Dashboard Polish.
- V15 Wave 1 — Portfolio Experience.
  - Home, Portfolio, FCN, and Risk now share the V15 page hierarchy.
  - Diagnostics are collapsed below user-facing summaries.

Next:

- Sprint 2.5 Intelligence Redesign.
- Sprint 2.6 Copilot Redesign.
- Sprint 3 Navigation Redesign.
- Sprint 4 Design Polish.

## UX Principles

- User language first.
- First-screen clarity before technical completeness.
- Morning Brief, Portfolio, Risk, Alerts, Market, and Quick Actions are primary.
- Provider, runtime, cache, source status, readiness, readback, and diagnostics are secondary.
- Health and Beta should live under Settings -> Advanced.
- Empty states must tell users what to do next.
- Mobile must show the page purpose within the first two scrolls.

## Dashboard Principles

Use this order for Home:

```text
Hero Summary
↓
Morning Brief
↓
Portfolio Snapshot
↓
Today's Alerts
↓
Market Snapshot
↓
Quick Actions
↓
Recent Activity
↓
Diagnostics, collapsed by default
```

Use the same product hierarchy for other Workspace pages:

```text
Hero / Summary
↓
KPI Row
↓
Primary user-facing cards
↓
Detail sections
↓
Secondary diagnostics
```

Wave 1 applies this hierarchy to:

- Home.
- Portfolio.
- FCN.
- Risk.

## Navigation Principles

Primary navigation should be user-job-oriented:

- 首頁.
- 我的資產.
- 市場.
- AI.
- 通知.
- 設定.

Route grouping:

- Portfolio, FCN, and Add Asset belong under 我的資產.
- Watchlist and market overview belong under 市場.
- Morning Brief, Intelligence, and Copilot belong under AI.
- Notifications and Timeline belong under 通知.
- Health, Beta, diagnostics, provider health, and runtime status belong under Settings -> Advanced.

## Design Principles

- Hero is largest.
- Hero includes a KPI row answering assets, risk, alerts, and market status.
- Morning Brief is second-most prominent on Home.
- Portfolio Snapshot is the primary asset card.
- Alerts should be grouped into Critical, Warning, and Info.
- Market Snapshot should show user-facing market context, not provider/cache/runtime details.
- Quick Actions should use icon + clear button labels.
- Recent Activity should show only the latest five items on Home.
- Diagnostics should be collapsed by default.

## Copywriting Principles

Avoid as primary visible copy:

- Engine.
- Runtime.
- Provider.
- Cache.
- Source status.
- Readback.
- Diagnostics.
- Activation.
- Foundation.
- Readiness.

Preferred language:

- 系統狀態.
- 資料來源.
- 更新狀態.
- 進階診斷.
- 暫無資料.
- 使用備用資料.
- 資料稍舊.
- 需要留意.
- 風險變化.

## Implementation Principles

V15 work may change:

- UX.
- IA.
- Navigation.
- Dashboard layout.
- Design system usage.
- Copywriting.
- Component hierarchy.
- Card composition.
- Spacing and visual polish.

V15 work must not add or change without separate approval:

- API.
- Database.
- Supabase schema.
- Migrations.
- Auth.
- RLS or membership.
- Risk Engine logic.
- FCN Engine logic.
- Morning Brief Engine logic.
- Market Service behavior.
- Provider behavior.
- Scheduler.
- Trading.
- Buy/sell/hold recommendation.
- Target price.
- AI provider or model behavior.
- Billing.

## Compliance Principles

IXAI is monitoring and risk awareness, not investment advice.

Use:

- 監控.
- 提醒.
- 風險變化.
- 需要留意.
- 可進一步查看.

Do not use:

- 建議買進.
- 建議賣出.
- 買 / 賣 / 持有.
- 保證.
- 預測一定.
- 目標價.

## Source Documents

- `docs/V15_UX_AUDIT.md`.
- `docs/V15_SPRINT_1_IA_NAVIGATION_REDESIGN_PLAN.md`.
- `docs/V15_DESIGN_SYSTEM_2.md`.
- `docs/V15_SPRINT_2_UI_IMPLEMENTATION_SPEC.md`.
