# V15 Sprint 1 IA Navigation Redesign Plan

Planning date: 2026-07-03

Source: `docs/V15_UX_AUDIT.md`

Scope: documentation-only IA, navigation, and page hierarchy plan. No product code changes are included in this plan.

## 1. Current IA Problem Summary

The current authenticated Workspace has enough functional breadth for beta use, but the information architecture is still organized around implementation modules rather than investor jobs.

Primary IA issues:

- First-level navigation exposes too many internal or operational destinations.
- Health and Beta are visible as daily Workspace routes even though they are diagnostic and governance surfaces.
- Home mixes welcome content, live quote status, localization readiness, Morning Brief, center cards, and diagnostics before answering the user's daily investment questions.
- Portfolio leads with truth/readback/persistence concepts before total assets, allocation, movement, and risk.
- FCN contains strong domain coverage but overexposes data path, readback, repository, provider, and risk-engine framing.
- Risk is organized around engine output and signal counts before plain user risk.
- Intelligence behaves like a source/capability inventory rather than a market or workspace brief.
- Copilot lacks visible starter prompts and task-oriented entry points.
- Engineering language such as provider, cache, runtime, source status, readiness, readback, and diagnostics appears in primary UI.

The V15 IA goal is to make IXAI feel like a daily investment workspace first, while preserving advanced system confidence tools for users who need them.

## 2. Proposed New Navigation

Recommended primary navigation:

- 首頁
- 我的資產
- 市場
- AI
- 通知
- 設定

Recommended expanded structure:

- 首頁
  - Daily investment dashboard
- 我的資產
  - 投資組合
  - FCN
  - 新增資產
- 市場
  - Watchlist
  - 市場概況
- AI
  - Morning Brief
  - Copilot
  - Intelligence
- 通知
  - Notifications
  - Timeline
- 設定
  - 個人化
  - 語言與地區
  - 資料與隱私
  - Advanced
    - 系統狀態
    - Beta Program
    - Diagnostics

Routing can stay stable in Sprint 2 if needed. The first implementation can change labels, grouping, sidebar hierarchy, and page entry points before changing URLs.

## 3. User-facing Route Grouping

| User group | Existing routes | User job |
| --- | --- | --- |
| 首頁 | `/my-ixai/home`, `/my-ixai` | See today's portfolio, risk, FCN attention items, market brief, and next actions. |
| 我的資產 | `/my-ixai/portfolio`, `/my-ixai/fcn`, `/my-ixai/input`, `/my-ixai/input/stock`, `/my-ixai/input/crypto`, `/my-ixai/input/fcn` | Manage holdings and structured products. |
| 市場 | `/my-ixai/watchlist`, market status surfaces | Track prices, watchlist changes, and market context. |
| AI | `/my-ixai/copilot`, `/my-ixai/intelligence`, Morning Brief surfaces | Ask questions, generate explain-only summaries, and review market/workspace insights. |
| 通知 | `/my-ixai/notifications`, `/my-ixai/timeline` | Review alerts, upcoming events, FCN observations, coupons, and maturities. |
| 設定 | `/my-ixai/settings` | Manage preferences, language, region, account, and advanced system status. |
| Advanced | `/my-ixai/health`, `/my-ixai/beta`, diagnostics/status components | Verify system status and beta readiness without crowding daily workflows. |

## 4. Routes to Keep Primary

Keep these as primary or near-primary destinations:

- `/my-ixai/home`
- `/my-ixai/portfolio`
- `/my-ixai/fcn`
- `/my-ixai/watchlist`
- `/my-ixai/copilot`
- `/my-ixai/intelligence`
- `/my-ixai/notifications`
- `/my-ixai/settings`

Primary route treatment rules:

- The first screen must be user-outcome-first.
- Engineering diagnostics must not appear before the main summary.
- Empty states must tell the user what to do next.
- CTAs should use verbs: 新增, 檢查, 查看, 產生, 更新.

## 5. Routes to Move Under Settings -> Advanced

Move these out of first-level daily navigation:

- `/my-ixai/health`
- `/my-ixai/beta`

Treat these surfaces as advanced or internal sections:

- Runtime diagnostics
- Provider health
- Cache status
- Data source readiness
- Database activation status
- Product layer status
- Cutover status
- Beta readiness checklist
- System QA summaries

Recommended labels:

- Health Center -> 系統狀態
- Beta Dashboard -> Beta Program
- Diagnostics -> 進階檢查

## 6. Home Dashboard Information Hierarchy

Home should become the daily investment command center.

First screen hierarchy:

1. Daily header
   - Date, market session state, last updated time.
   - Keep this compact.
2. Asset snapshot
   - Total portfolio value.
   - Daily movement or data-unavailable fallback.
   - Top allocation.
   - Missing data warning only if needed.
3. Risk snapshot
   - Today's risk level.
   - Top 3 risk drivers.
   - One CTA: 檢查風險.
4. FCN attention
   - Nearest KI.
   - Next observation.
   - Next coupon or maturity.
   - Worst-of name if available.
   - One CTA: 查看 FCN.
5. Market brief
   - Top watchlist movement.
   - Market context.
   - One CTA: 查看市場.
6. Next actions
   - 新增資產
   - 產生 Morning Brief
   - 詢問 Copilot

Move below the fold or into Settings -> Advanced:

- Live Quote Status
- Provider/cache details
- i18n foundation status
- localization preview
- runtime readiness
- database/readback diagnostics

## 7. Portfolio Page Hierarchy

Portfolio should start with the user's asset picture, not the data architecture.

Recommended hierarchy:

1. Portfolio summary
   - Total assets.
   - Daily movement.
   - Asset count.
   - Data freshness.
2. Allocation and exposure
   - Stocks / ETFs.
   - Crypto.
   - FCN.
   - Concentration warning if relevant.
3. Holdings table/cards
   - Symbol or product name.
   - Quantity / notional.
   - Current value.
   - Movement.
   - Risk marker.
4. Missing input / data quality
   - Only show if there is a user action.
   - Example: 補上成本或到期日.
5. Diagnostics
   - My asset data / readback.
   - Storage status.
   - Source status.
   - Market provider/cache details.

Replacement direction:

- Portfolio Truth -> 我的資產資料
- Persistence Layer -> 儲存狀態
- Canonical Readback -> 正式資料讀取結果

## 8. FCN Page Hierarchy

FCN should be organized around safety and time-sensitive events.

Recommended hierarchy:

1. Safety summary
   - 安全 / 注意 / 危險 counts.
   - Worst position.
   - Nearest KI distance.
2. Immediate attention
   - Products near KI.
   - Products near strike.
   - Missing price or date inputs.
3. Upcoming schedule
   - Next observation.
   - Next coupon.
   - Maturity.
4. Product list
   - Product name.
   - Underlyings.
   - Worst-of.
   - KI distance.
   - Strike distance.
   - Coupon.
   - Observation status.
5. Diagnostics
   - Readback status.
   - Repository source.
   - Manual price status.
   - External provider status.
   - Risk engine details.

Primary user labels:

- Worst-of -> 表現最弱標的
- Distance to KI -> 距離 KI
- Distance to Strike -> 距離履約價
- Observation -> 觀察日
- Coupon -> 配息

## 9. Risk Page Hierarchy

Risk should answer "今天風險如何？" before showing model details.

Recommended hierarchy:

1. Today's risk level
   - Low / Medium / High / Critical equivalent labels.
   - One plain explanation sentence.
2. Top risk drivers
   - Concentration.
   - FCN KI proximity.
   - Market movement.
   - Missing or stale data.
3. Exposure summary
   - Asset class exposure.
   - Worst exposure.
   - High concentration items.
4. FCN risk
   - KI/strike/observation-driven risks.
5. Data confidence
   - Only visible if missing/stale data affects risk.
6. Diagnostics
   - Risk Engine score breakdown.
   - Signal counts.
   - Source/readback details.

Risk copy rule:

- Start with the user-facing consequence.
- Put scoring mechanics after the consequence.

## 10. Intelligence Page Hierarchy

Intelligence should become a market/workspace brief.

Recommended hierarchy:

1. Today's brief
   - What changed.
   - Why it matters.
   - What to watch next.
2. Portfolio impact
   - Holdings most affected.
   - Exposure context.
3. FCN implications
   - Underlyings with movement.
   - KI/observation relevance.
4. Risk and alerts
   - Top risk warnings.
   - Missing data warnings.
5. Source detail
   - Market service.
   - Cache status.
   - Portfolio valuation source.
   - FCN schedule/risk source.

Avoid making the first screen a list of internal source cards.

## 11. Copilot Prompt Suggestion Model

Copilot should always provide starter prompts, even when data is incomplete.

Recommended prompt categories:

- Portfolio
  - 整理今日投資組合變化
  - 找出資產配置是否過度集中
- FCN
  - 找出最需要注意的 FCN
  - 解釋距離 KI 最近的產品
- Risk
  - 告訴我今天主要風險
  - 哪些資料缺失會影響風險判斷？
- Market
  - 摘要今天市場重點
  - 哪些 watchlist 標的值得注意？
- Brief
  - 幫我產生 Morning Brief
  - 幫我整理今天下一步

Prompt behavior rules:

- Prompts must be explain-only.
- Do not imply buy/sell/hold recommendations.
- Do not imply target price generation.
- If data is missing, prompt should offer a safe explanation path.
- Source-engine metadata should be hidden behind details.

## 12. Engineering-language Replacement Rules

General rule:

- Primary UI uses user language.
- Secondary diagnostics may use technical language with explanation.
- Advanced diagnostics may preserve exact internal labels where useful.

Replacement rules:

| Engineering language | Primary UI replacement |
| --- | --- |
| Provider | 資料來源 |
| Cache | 更新狀態 |
| Runtime | 系統 |
| Runtime Health | 系統狀態 |
| Readiness | 準備中 / 尚未啟用 |
| Diagnostics | 進階檢查 |
| Source Status | 資料狀態 |
| Readback | 讀取結果 |
| Persistence | 儲存狀態 |
| Truth Layer | 正式資產資料 |
| Engine | 分析 |
| Signal Counts | 風險訊號 |
| Foundation | 基礎能力 |
| Fallback | 暫用資料 |
| Stale | 可能過期 |
| Partial | 部分可用 |
| Unavailable | 暫時無法取得 |

Badge rules:

- READY -> 可用
- PARTIAL -> 部分可用
- FAILED -> 無法取得
- BLOCKED -> 需要處理
- LOCAL -> 本機暫存
- FALLBACK -> 暫用資料
- PERSISTED -> 已儲存

## 13. V15 Sprint 2 Implementation Checklist

Recommended Sprint 2 scope: Home / Dashboard redesign and navigation grouping.

Implementation checklist:

- Define the new navigation configuration.
- Group current routes into 首頁, 我的資產, 市場, AI, 通知, 設定.
- Move Health and Beta entry points under Settings -> Advanced in navigation.
- Keep existing route URLs unless a separate routing migration is approved.
- Create Home daily dashboard hierarchy:
  - asset snapshot
  - risk snapshot
  - FCN attention
  - market brief
  - next actions
- Move live quote/provider/cache/status cards below primary summaries.
- Rename visible technical labels using the replacement rules.
- Add safe empty-state copy for missing portfolio data.
- Add Copilot prompt suggestions as visible starter cards.
- Verify desktop and mobile first screen hierarchy.
- Verify zh-TW and en-US primary labels.
- Confirm no auth, database, schema, RLS, billing, broker, trading, scheduler, AI provider, or recommendation logic changes.

Definition of done for Sprint 2:

- Home first screen answers the five daily questions from the UX Audit.
- First-level navigation is user-job-oriented.
- Health and Beta are no longer primary daily destinations.
- Provider/cache/runtime/readiness diagnostics are secondary.
- No product behavior changes beyond IA, labels, and page hierarchy.

## 14. Out of Scope

This plan does not include:

- Product code changes.
- Route migrations.
- Database changes.
- Supabase schema changes.
- Migrations.
- RLS, auth, or membership changes.
- Billing or Stripe changes.
- Broker integration.
- Trading flows.
- Buy/sell/hold recommendations.
- Target prices.
- AI provider or OpenAI behavior changes.
- Scheduler, Telegram, LINE, or email delivery activation.
- Portfolio, FCN, Risk, or valuation engine logic changes.
- New market data provider behavior.
- Replacing the existing V13.8 localization work.
