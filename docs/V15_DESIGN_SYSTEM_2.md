# V15 Design System 2.0

Planning date: 2026-07-03

Source documents:

- `docs/V15_UX_AUDIT.md`
- `docs/V15_SPRINT_1_IA_NAVIGATION_REDESIGN_PLAN.md`

Scope: documentation-only design system specification for the V15 Product Experience Redesign. This document defines UX, layout, copy, status, and component rules for future implementation. It does not change product code.

## 1. Design Principles

### User language first

Primary UI must speak in user-facing investment monitoring language. Technical terms may exist only in secondary diagnostics or Settings -> Advanced.

Preferred wording:

- 我的資產
- 今日風險
- 需要留意
- 資料來源
- 更新狀態
- 系統狀態
- 進階診斷

Avoid leading with:

- Engine
- Runtime
- Provider
- Cache
- Source status
- Readback
- Diagnostics
- Activation
- Foundation

### First screen answers "what should I know today?"

Every major Workspace page must answer the user's immediate question before showing operational details.

- Home: 今天我的資產、風險、FCN、市場、下一步是什麼？
- Portfolio: 我的資產總覽與主要變化是什麼？
- FCN: 哪些產品安全、需要注意、或接近危險？
- Risk: 今天風險如何，原因是什麼？
- Intelligence: 今天市場與我的 workspace 有什麼重點？
- Copilot: 我可以問什麼，下一步可以做什麼？

### Engineering information is secondary diagnostics

Provider, cache, runtime, data source, readiness, persistence, readback, and activation details should be secondary. They can appear:

- Below primary content.
- Inside collapsible diagnostics.
- In Settings -> Advanced.
- In user-facing status language first, with exact technical labels only as metadata.

### Investment monitoring, not advice

IXAI is an investment monitoring and risk awareness workspace. UI copy must avoid investment-advice tone.

Allowed:

- 監控
- 提醒
- 風險變化
- 需要留意
- 資料暫缺
- 可進一步查看

Not allowed:

- 建議買進
- 建議賣出
- 買 / 賣 / 持有
- 保證
- 一定會
- 目標價

## 2. Layout System

### Workspace page shell

Every authenticated Workspace page should use a consistent shell:

- Compact page header.
- Clear page purpose.
- One primary summary section.
- Main content grid.
- Secondary diagnostics below main content.
- Mobile-first stacking.

Page shell order:

1. Page title and short outcome-oriented subtitle.
2. Hero summary section.
3. Primary dashboard cards.
4. Detail sections and tables.
5. Secondary diagnostics.
6. Legal/safety/disclaimer copy where required.

### Hero summary section

Purpose:

- Establish what the page is about.
- Show the most important state in one glance.
- Provide one primary next action.

Rules:

- Use one concise title.
- Use one sentence of body copy.
- Include no more than 3 headline metrics.
- Include 1 primary CTA and up to 1 secondary CTA.
- Do not include provider/cache/runtime diagnostics.

### Primary dashboard cards

Purpose:

- Answer the user's first decision/context question.
- Show the highest-value state for the page.

Rules:

- Cards should be scannable in 3 seconds.
- Each card should have one clear status or number.
- Each card should include a next step when action is possible.
- Avoid nested cards.
- Avoid large technical footers.

### Secondary diagnostics cards

Purpose:

- Provide confidence, data status, or system status without dominating the user flow.

Rules:

- Place below primary content.
- Prefer collapsed or compact layout.
- Use user-facing labels first.
- Exact internal labels can be shown as metadata.
- Do not block the page unless the issue prevents the primary user task.

### Detail tables

Purpose:

- Support comparison, scanning, and follow-up.

Rules:

- Table headers must use user-facing terms.
- Important status should be visible without horizontal scrolling on mobile.
- Mobile may convert dense rows into stacked summary rows.
- Empty table states must include a next action.
- Diagnostics columns should be hidden or secondary by default.

### Mobile stacking rules

Mobile order:

1. Hero summary.
2. Most urgent card.
3. Primary CTA.
4. Remaining dashboard cards.
5. Detail lists.
6. Diagnostics.

Mobile rules:

- No first-screen diagnostic blocks.
- No clipped labels.
- No horizontal overflow unless the data table explicitly requires it.
- Long translations must wrap cleanly.
- KPI numbers must remain readable but not oversized.

## 3. Card System

### Daily Brief Card

Purpose:

- Summarize what matters today across portfolio, FCN, risk, and market context.

Priority:

- Primary on Home and Intelligence.

Necessary fields:

- Brief title.
- Last updated time.
- 3 to 5 key points.
- One next action.

Forbidden content:

- Buy/sell/hold suggestions.
- Target prices.
- Raw provider/cache details.
- Long diagnostics.

Empty state:

- "今日摘要尚未產生。"
- CTA: "產生 Morning Brief"

### Portfolio Summary Card

Purpose:

- Show the user's asset picture at a glance.

Priority:

- Primary on Home and Portfolio.

Necessary fields:

- Total value or unavailable state.
- Daily movement or data-unavailable fallback.
- Asset count.
- Top allocation or concentration note.

Forbidden content:

- Portfolio Truth.
- Persistence Layer.
- Canonical Readback.
- Raw source status as the card title.

Empty state:

- "尚未新增資產。"
- CTA: "新增第一筆資產"

### Risk Status Card

Purpose:

- Communicate today's risk state and why it matters.

Priority:

- Primary on Home and Risk.

Necessary fields:

- Risk state: 安全 / 注意 / 危險 / 暫無資料.
- Top 1 to 3 drivers.
- Last updated time or data freshness.

Forbidden content:

- Engine-first labels.
- Score dump without explanation.
- Fear-based language.
- Investment advice.

Empty state:

- "目前資料不足，無法完整判斷風險。"
- CTA: "補齊資產資料"

### FCN Status Card

Purpose:

- Surface FCN products that are safe, need attention, or near danger.

Priority:

- Primary on Home and FCN.

Necessary fields:

- Safety bucket count.
- Nearest KI distance.
- Next observation date.
- Next coupon or maturity if available.

Forbidden content:

- Raw repository status.
- Provider path details.
- Risk engine internals as primary copy.

Empty state:

- "尚未新增 FCN。"
- CTA: "新增 FCN"

### Market Snapshot Card

Purpose:

- Show market context and watchlist movement relevant to the user.

Priority:

- Primary on Home and Market.
- Secondary on Portfolio and Intelligence.

Necessary fields:

- Market state.
- Top watchlist movement.
- Quote freshness.
- Data-unavailable fallback.

Forbidden content:

- Cache implementation details.
- Provider boundary explanations as primary copy.
- Raw fetch or API errors.

Empty state:

- "尚未追蹤市場標的。"
- CTA: "新增 Watchlist"

### Alert Card

Purpose:

- Show a user-facing event or state that needs attention.

Priority:

- Primary on Notifications and Timeline.
- Secondary on Home.

Necessary fields:

- Severity.
- Plain-language reason.
- Affected asset or product.
- Timestamp or event date.
- Next action.

Forbidden content:

- Alert engine readback.
- Internal rule IDs as primary copy.
- Fear-based language.

Empty state:

- "目前沒有需要處理的提醒。"
- CTA: "查看 Timeline"

### Copilot Suggestion Card

Purpose:

- Give users safe, explain-only prompts.

Priority:

- Primary on Copilot.
- Secondary on Home and Intelligence.

Necessary fields:

- Prompt title.
- One-line explanation.
- Category: Portfolio, FCN, Risk, Market, Brief.

Forbidden content:

- Buy/sell/hold prompts.
- Target price prompts.
- Guaranteed outcome wording.
- Hidden source-engine labels as visible titles.

Empty state:

- "目前沒有對話紀錄。"
- CTA: "選擇一個問題開始"

### Diagnostic Card

Purpose:

- Show system, data, or integration status without disrupting the main workflow.

Priority:

- Secondary or Advanced only.

Necessary fields:

- User-facing status label.
- Short explanation.
- Optional technical metadata.
- Optional retry/refresh action.

Forbidden content:

- Dominating first-screen layout.
- Blocking user tasks unless truly required.
- Raw stack traces or implementation errors.

Empty state:

- "目前沒有進階診斷資訊。"
- CTA: "重新檢查"

## 4. Status Language

Primary UI replacements:

| Engineering term | User-facing term |
| --- | --- |
| provider | 資料來源 |
| cache | 更新狀態 |
| runtime | 系統狀態 |
| readiness | 準備中 / 尚未啟用 |
| diagnostics | 進階診斷 |
| unavailable | 暫無資料 |
| fallback | 使用備用資料 |
| stale | 資料稍舊 |
| source status | 資料狀態 |
| readback | 讀取結果 |
| persistence | 儲存狀態 |
| engine | 分析 |
| activation | 啟用狀態 |
| foundation | 基礎能力 |

Badge replacements:

| Current badge | User-facing badge |
| --- | --- |
| READY | 可用 |
| PARTIAL | 部分可用 |
| FAILED | 無法取得 |
| BLOCKED | 需要處理 |
| LOCAL | 本機暫存 |
| FALLBACK | 備用資料 |
| PERSISTED | 已儲存 |
| UNKNOWN | 未知 |

## 5. Risk Visual Language

### Color usage

Green:

- Safe.
- Normal.
- No immediate attention needed.
- Data is fresh enough for monitoring.

Yellow:

- Attention needed.
- Data is partial or slightly stale.
- FCN is moving closer to KI or strike.
- Risk driver exists but is not critical.

Red:

- High attention.
- Near KI / KO / severe concentration / critical alert.
- User should review details.
- Do not use panic or urgent trading language.

Gray:

- No data.
- Not configured.
- Not applicable.
- Temporarily unavailable.

### Status labels

Use:

- 安全
- 注意
- 危險
- 暫無資料

Avoid:

- Guaranteed safety.
- Crisis language.
- "Must act now."
- Investment recommendation tone.

### FCN KI / KO / Observation rules

KI:

- Show distance to KI with clear label.
- If near KI, use 注意 or 危險 depending on threshold.
- Explain "距離 KI 較近，需要留意標的走勢."

KO:

- Show KO state as monitoring status.
- Do not imply outcome certainty.

Observation:

- Show next observation date prominently.
- Use date and relative label when possible.
- If date is missing, show a data-completion CTA instead of an error.

## 6. Typography Rules

Hero title:

- Largest page-level type.
- 1 line preferred, 2 lines maximum.
- Must describe the user outcome, not the module name only.

Section title:

- Short and specific.
- Use user task language.
- Avoid engineering labels.

Card title:

- 3 to 6 words preferred.
- Describes what the card tells the user.
- Avoid raw system names.

KPI number:

- Large enough to scan.
- Always paired with a label and fallback state.
- Do not use color alone to communicate meaning.

Body copy:

- One to two short sentences.
- Plain language.
- Avoid abstract product taxonomy.

Metadata:

- Small and quiet.
- Used for timestamps, data freshness, and optional source details.
- Must not overpower the main content.

Disclaimer:

- Short, consistent, and calm.
- Use monitoring/risk-awareness language.
- Do not repeat on every small card unless legally required.

## 7. Icon Rules

Where icons are useful:

- Primary navigation.
- Page headers.
- Summary cards.
- Empty states.
- Status badges.
- CTAs.

Rules:

- Icons must support comprehension, not replace text.
- Every icon-only control needs an accessible label.
- Use consistent icon meanings across pages.
- Avoid decorative icon clutter.
- Health and diagnostics icons should be visually quiet.
- FCN and Risk icons must align with 安全 / 注意 / 危險 logic.
- Do not use warning icons for neutral informational states.

Suggested icon semantics:

- Portfolio: assets / chart / wallet equivalent.
- FCN: structured product / shield / calendar equivalent.
- Risk: shield / alert triangle for attention only.
- Market: line chart.
- Copilot: message / spark for assistant entry.
- Settings: gear.
- Advanced diagnostics: activity / terminal-like icon only in Advanced.

## 8. Empty States

### No portfolio

Message:

- "尚未新增資產。新增第一筆資產後，IXAI 會整理你的資產、配置與風險。"

CTA:

- "新增第一筆資產"

Avoid:

- Missing repository.
- No readback.
- Persistence unavailable.

### No FCN

Message:

- "尚未新增 FCN。新增產品後，IXAI 會追蹤 KI、觀察日、配息與到期狀態。"

CTA:

- "新增 FCN"

Avoid:

- FCN engine unavailable.
- Repository empty.

### No watchlist

Message:

- "尚未追蹤標的。加入 watchlist 後，可以快速查看價格變化與市場狀態。"

CTA:

- "新增追蹤標的"

Avoid:

- Quote provider missing.
- Cache empty.

### No alerts

Message:

- "目前沒有需要處理的提醒。"

CTA:

- "查看 Timeline"

Avoid:

- Alert engine no data.

### No market data

Message:

- "目前暫無行情資料。你仍然可以查看已儲存的資產與手動輸入資訊。"

CTA:

- "稍後重新整理"

Avoid:

- Failed fetch.
- Provider error.

### No Morning Brief

Message:

- "今日 Morning Brief 尚未產生。"

CTA:

- "產生 Morning Brief"

Avoid:

- Brief builder unavailable.
- API missing.

### Copilot no history

Message:

- "還沒有對話紀錄。選一個問題開始整理你的 Workspace。"

CTA:

- "選擇問題開始"

Avoid:

- Session empty.
- Source engine unavailable.

## 9. Loading / Error States

### Loading skeleton

Use:

- Card skeletons for primary summaries.
- Row skeletons for tables.
- Short loading labels for buttons.

Avoid:

- Full-page blank states.
- Spinners without context.
- Technical loading messages.

### Partial data

Show:

- "部分資料可用"
- What is available.
- What is missing.
- Whether user action can fix it.

Do not:

- Hide the whole page.
- Show raw API errors as primary content.

### Failed source

Show:

- "資料來源暫時無法取得"
- Safe fallback if available.
- Retry action if appropriate.

Do not:

- Expose stack traces.
- Blame the user.
- Suggest trading action.

### Unavailable market quote

Show:

- "暫無即時行情"
- Last known data if safe.
- Manual price fallback if available.

Do not:

- Use provider failure as page title.

### Blocked auth

Show:

- Clear account or login action.
- Do not disguise account gate as Workspace content.
- Protected route QA must treat this as blocked, not a successful Workspace render.

### Graceful fallback

Show:

- The usable part of the page.
- A calm explanation.
- A next step.

Do not:

- Block unrelated content.
- Retry indefinitely.

## 10. Navigation Rules

### Primary navigation

Primary navigation should contain user jobs:

- 首頁
- 我的資產
- 市場
- AI
- 通知
- 設定

### Secondary navigation

Secondary navigation can expose:

- Portfolio.
- FCN.
- Watchlist.
- Intelligence.
- Morning Brief.
- Timeline.

### Settings -> Advanced

Move these to Advanced:

- Health.
- Beta.
- Diagnostics.
- Provider health.
- Runtime/system status.
- Cache status.
- Data readiness.

### Health / Beta

Health and Beta must not be first-level navigation for ordinary users.

Use:

- Settings -> Advanced -> 系統狀態
- Settings -> Advanced -> Beta Program

### Mobile navigation

Mobile navigation must prioritize:

1. 首頁
2. 我的資產
3. 市場
4. AI
5. 設定

Notifications can appear as a top action or badge depending on layout.

## 11. Page-specific Design Rules

### Home

Must lead with:

- Asset snapshot.
- Risk snapshot.
- FCN attention.
- Market brief.
- Next actions.

Must not lead with:

- Live Quote Status.
- i18n foundation.
- localization preview.
- provider/cache/runtime diagnostics.

### Portfolio

Must lead with:

- Total assets.
- Daily movement.
- Allocation.
- Concentration or risk marker.

Diagnostics placement:

- Below holdings and allocation.
- Collapsible where possible.

### FCN

Must lead with:

- 安全 / 注意 / 危險.
- Nearest KI.
- Next observation.
- Coupon and maturity context.

Diagnostics placement:

- Data path, repository, manual price, provider, and engine details stay secondary.

### Risk

Must lead with:

- Today's risk level.
- Top drivers.
- User-facing explanation.

Diagnostics placement:

- Score breakdown and signal counts below the summary.

### Intelligence

Must lead with:

- Today's brief.
- Portfolio impact.
- FCN implications.
- Risk and market context.

Must not lead with:

- Source inventory.
- Readiness cards.
- Safety flags as the main content.

### Copilot

Must lead with:

- Prompt suggestions.
- Explain-only boundaries.
- Starter actions.

Must not lead with:

- Empty chat shell only.
- Source-engine metadata.

### Watchlist

Must lead with:

- Top moves.
- Watch items needing attention.
- Market state.

Diagnostics placement:

- Quote source and update status are secondary.

### Notifications

Must lead with:

- Need attention.
- Reminders.
- Read or dismissed states.

Must not lead with:

- Alert engine readback.

### Timeline

Must lead with:

- Next 7 days.
- Next 30 days.
- FCN observation/coupon/maturity.

Must not lead with:

- Dated readback language.

### Settings

Must lead with:

- Account.
- Language and region.
- Notifications.
- Data and privacy.

Advanced includes:

- System status.
- Beta Program.
- Diagnostics.

## 12. Copywriting Rules

Forbidden as primary visible copy:

- Engine
- Runtime
- Provider
- Cache
- Source status
- Readback
- Diagnostics
- Activation
- Foundation

Allowed only in Advanced / Diagnostics:

- Exact provider name.
- Cache age.
- Runtime status.
- Source status.
- Readback result.
- Activation status.
- Foundation readiness.

Primary copy rules:

- Start with the user consequence.
- Explain missing data without technical blame.
- Prefer verbs over nouns.
- Keep CTAs short.
- Use calm risk language.

Examples:

- Instead of "Risk Engine unavailable": "暫時無法完整判斷風險."
- Instead of "Market provider cache stale": "行情資料稍舊."
- Instead of "Portfolio readback empty": "尚未新增資產."
- Instead of "FCN repository source missing": "尚未新增 FCN 資料."

## 13. Compliance Language

Do not use:

- buy
- sell
- hold
- 建議買進
- 建議賣出
- 建議持有
- 保證
- 預測一定
- 必漲
- 必跌
- 目標價

Use:

- 監控
- 提醒
- 風險變化
- 需要留意
- 資料變動
- 可進一步查看
- 暫無資料
- 目前觀察到

Required posture:

- Explain-only.
- Monitoring-first.
- Risk-awareness-first.
- No trading instruction.
- No personalized investment recommendation.

## 14. Implementation Checklist

Use this checklist for V15 Sprint 2 / Sprint 3 UI redesign.

Navigation:

- Primary navigation uses user jobs.
- Health and Beta move to Settings -> Advanced.
- Mobile navigation does not expose diagnostics as a main item.

Home:

- First screen answers assets, risk, FCN, market, and next action.
- Diagnostics move below primary dashboard.
- Empty portfolio/FCN/watchlist states include CTAs.

Portfolio:

- Total assets and allocation come first.
- Holdings are readable on mobile.
- Truth/readback/persistence details are secondary.

FCN:

- Safety buckets come first.
- KI, observation, coupon, and maturity are prominent.
- Provider and repository details are secondary.

Risk:

- Today's risk state comes first.
- Top drivers are written in user language.
- Engine details are below the summary.

Intelligence:

- Reads like a market/workspace brief.
- Source inventory is secondary.
- No recommendation language.

Copilot:

- Prompt suggestions are visible.
- Prompts are explain-only.
- No buy/sell/hold or target price prompts.

Design system:

- Cards follow the card system definitions.
- Status terms use user-facing replacements.
- Empty states avoid engineering errors.
- Loading/error states degrade gracefully.
- Risk colors follow Green / Yellow / Red / Gray rules.

Validation:

- Desktop first screen communicates page purpose.
- Mobile first screen communicates page purpose.
- zh-TW and en-US primary copy is natural.
- No raw engineering terms appear before Advanced / Diagnostics.
- No product logic, auth, schema, billing, broker, trading, scheduler, or AI provider behavior changes are required by this design system.
