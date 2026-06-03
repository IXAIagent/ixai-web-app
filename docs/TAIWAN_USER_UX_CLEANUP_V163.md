# Taiwan User UX Cleanup v1.63.0

Status: UX cleanup implementation guide and release record.

v1.63.0 improves the production app for Taiwan users by localizing user-facing copy, reducing mixed English / engineering language, and separating normal user information from internal system diagnostics.

## 1. Current UX Problems

- User-facing pages mix Traditional Chinese with English product / engineering labels.
- `/account` exposes too much implementation language such as backend identity, entitlement, account link, and beta workspace.
- `/pro`, `/portfolio`, `/fcn`, and `/risk` read like internal feature-gate prototypes instead of user-facing Pro entry surfaces.
- Daily / Weekly archive labels still use `Daily Brief` and `Weekly Intelligence` in visible UI.
- Some Pro module pages mention skeletons, backend state, or entitlement internals that normal users do not need.

## 2. English Terms Found In User-Facing Pages

High-priority terms found during v1.63 audit:

- `Portfolio Intelligence`
- `FCN Monitoring`
- `Risk Engine`
- `Watchlist Intelligence Lite`
- `Daily Brief`
- `Weekly Intelligence`
- `Backend`
- `Connected`
- `Linked`
- `Membership`
- `Entitlement`
- `Feature Gate`
- `Beta Enabled`
- `Reserved for Pro`
- `Coming soon`
- `skeleton`
- `workspace`
- `Open IXAI Pro Lab`

Brand / product terms allowed to remain:

- `IXAI`
- `IXAI Pro`
- `AI`
- `FCN`
- `ETF`
- `BTC`
- `ETH`
- API / backend / provider terms in admin or technical docs only.

## 3. Pages With Too Much Text

- `/account`: too many status cards and long Pro integration paragraphs.
- `/pro`: previously explained old Pro Lab, in-app beta workspace, SSO, backend, and module state in one surface.
- `/portfolio`, `/fcn`, `/risk`: paragraphs over-explained beta / skeleton / entitlement behavior.
- `/pro-preview`: sample data copy mixed `Preview`, `Portfolio`, `risk intelligence`, and future billing language.

## 4. Engineering / Debug Information To Hide From Normal Users

Normal user pages should not foreground:

- Raw backend status strings.
- Provider health.
- Coverage score.
- Supabase session state.
- Scheduler status.
- OpenAI provider status.
- Raw entitlement status.
- Feature gate internals.
- API route / endpoint wording.

User-facing replacement terms:

- `Backend` → `系統連線`
- `Account Link` → `帳號綁定`
- `Membership` → `會員方案`
- `Entitlement` → `功能權限`
- `Feature Gate` → `Pro 保留功能`
- `Connected` → `已連線`
- `Linked` → `已綁定`

Admin pages may keep technical detail, but should label those sections as internal:

- `營運控制台`
- `系統狀態`
- `內容產線`
- `發布佇列`
- `來源健康度`
- `排程狀態`

## 5. Chinese Copywriting Principles

- Prefer short Traditional Chinese headings.
- Keep product names such as IXAI, IXAI Pro, AI, FCN, ETF, BTC, and ETH.
- Avoid developer terms in public / account / Pro pages.
- Do not use `backend`, `entitlement`, `feature gate`, or `skeleton` in normal user-facing copy.
- Use one-sentence explanations where possible.
- Keep compliance notes short and direct.
- Say what users can do now before explaining future integration.

## 6. Before / After Wording Table

| Before | After |
| --- | --- |
| Portfolio Intelligence | 投資組合分析 |
| FCN Monitoring | FCN 監控 |
| Risk Engine | 風險中心 |
| Market Intelligence | 市場情報 |
| Watchlist | 關注清單 |
| Membership | 會員方案 |
| Connected | 已連線 |
| Linked | 已綁定 |
| Backend | 系統連線 |
| Feature Gate | Pro 保留功能 |
| Entitlement | 功能權限 |
| Preview | 預覽 |
| Daily Brief | 每日晨報 |
| Weekly Intelligence | 每週情報 |
| Open IXAI Pro Lab | 開啟 IXAI Pro |
| Legacy lab reference only | 舊版 Pro 參考入口 |
| Beta Enabled | 測試可用 |
| Reserved for Pro | Pro 保留功能 |
| Coming soon | 未來將逐步開放 |
| workspace skeleton | 測試版模組 |

## 7. Pages Changed

- `/account`
- `/pro`
- `/pro-preview`
- `/portfolio`
- `/fcn`
- `/risk`
- `/daily-brief`
- `/weekly-brief`

Notes:

- The requested `/daily` and `/weekly` routes do not currently exist in the App Router. The active public routes are `/daily-brief` and `/weekly-brief`.
- Admin routes were not redesigned; technical detail remains allowed there.

## 8. Rollback Plan

If v1.63.0 causes UX or QA regressions:

1. Revert user-facing copy changes in the affected pages/components.
2. Keep this document as the UX source-of-truth.
3. Restore prior QA text expectations in `scripts/qa-mobile.mjs`.
4. Re-run `npm run lint`, `npm run build`, `git diff --check`, and 390px mobile QA.
5. Reattempt localization in smaller page-specific patches.

## 9. Out Of Scope

- SSO.
- Auth / Supabase / JWT changes.
- Daily / Weekly content generation engine.
- Provider logic.
- Backend / legacy Pro changes.
- Stripe.
- Portfolio / FCN / Risk real data.
- Full app redesign.
