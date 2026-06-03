# IXAI v1.64.0 — App UX / FCN Education / Pro Conversion Redesign

**Status:** Planning + first implementation cut.
**Scope:** Public app communication problem — App vs. Pro vs. 顧問服務 role clarity.
**Out of scope:** SSO, Auth, Supabase, Backend, JWT, Daily/Weekly generation engine, provider ingestion, trading features, broker integration, Stripe.
**Read-before-edit baseline:** v1.62.1 content engine, v1.63 Taiwan UX cleanup, v1.63.1 product role correction. v1.64.0 extends these — it does not contradict them.

---

## 1. Current UX problems

After auditing `/`, `/fcn`, `/pro`, `/daily-brief`, `/weekly-brief`, `/account` against the v1.63.1 role-correction brief, the remaining communication gaps are:

1. **/fcn already moved away from monitoring skeleton (v1.63.1) but stops short of converting.** Current page is education-only: hero, "什麼是 FCN", 4 concept cards (KI/KO/Worst-of/coupon), one paragraph on why monitoring matters, one Pro CTA. It does **not** explain why high-net-worth investors actually buy FCN, never shows a concrete worked example, never frames the "manual Excel + 對帳單 + 業務通知" pain that makes monitoring hard, and never offers a consulting CTA (預約 FCN 健檢).

2. **/pro is functionally complete but does not sell.** `ProWorkspaceHub` (268 lines) handles entitlement state correctly — Pro Lab login, App-internal Pro modules, account-link status, plan label, beta gating. But the hero copy ("IXAI Pro 正在與 App 帳號整合中") reads like a status notice, not a value proposition. The three modules render as equally-weighted cards even though FCN Monitoring is the moat. No pain-point section between hero and modules. No consulting CTA.

3. **Consulting service has no dedicated entry surface.** The user is head of 一玄投資 and provides FCN 健檢 / 投資組合診斷 / 高資產客戶諮詢. None of the public pages today carry a "預約諮詢" or "申請 FCN 健檢" CTA. The product funnel terminates at "申請 Pro 測試" but Pro testing ≠ consulting engagement.

4. **Homepage `IntelligenceLanding` does not differentiate App / Pro / 顧問服務 roles up front.** The hero sells "讓 AI 開始理解你的投資世界" and the bottom row offers Pro Preview + LINE + Onboarding CTAs. There is no explicit "App = free education, Pro = monitoring, 顧問 = high-touch" tri-fold.

5. **/daily-brief and /weekly-brief are already reading-first (v1.63.1).** Per the v1.64 brief, removing "Public Intelligence Engine" architecture blocks from these pages is **already done**. No regression risk here unless future work adds them back.

6. **/account is already simplified to user-facing wording (v1.63).** "會員方案", "功能權限", "已連線" replaced the engineering vocabulary. No further simplification is needed in this cut.

7. **Icon contrast on /pro module cards uses gold-on-cream which can read as faint.** The icon container at `pro-workspace-hub.tsx:237-239` uses `bg-[var(--ixai-forest)]` (good — deep green container) with `text-[var(--ixai-gold)]` glyph (good — gold symbol). Contrast is actually fine. The risk pill at line 240-242 uses `border-emerald-700/20 bg-emerald-50/70 text-emerald-950` which is off-token — should use the IXAI risk-clear token if a "available" state stays in the design.

---

## 2. App / Pro / 顧問服務 role split (this is the v1.64.0 anchor)

```
┌───────────────────────────────────────────────────────────────────────────┐
│  IXAI App (公開 + 免費 + 註冊會員)                                          │
│  • 每日晨報 / 每週情報                                                       │
│  • 市場狀態 / 風險焦點                                                       │
│  • FCN 教育 (本頁，不含監控)                                                 │
│  • 顧問服務導流                                                              │
│  • Pro 入口 + 測試申請                                                       │
└───────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼ 透過綁定帳號 → 進階監控
┌───────────────────────────────────────────────────────────────────────────┐
│  IXAI Pro (測試版 / 受邀 / 未來付費工作區)                                  │
│  • FCN 監控 (主打)                                                          │
│  • 投資組合分析                                                              │
│  • 風險中心                                                                  │
│  • AI 投資工作台 (未來)                                                      │
└───────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼ 高資產 / 結構型商品 / 投資組合審視
┌───────────────────────────────────────────────────────────────────────────┐
│  一玄投資顧問服務 (high-touch, 1:1)                                          │
│  • FCN 健檢                                                                  │
│  • 投資組合診斷                                                              │
│  • 高資產客戶諮詢                                                            │
│  • 個別顧問服務                                                              │
└───────────────────────────────────────────────────────────────────────────┘
```

**Don't confuse the three.** App is education + lead capture. Pro is software. Consulting is human judgement.

---

## 3. /fcn strategy — Education → Conversion

Keep the existing 5 sections, **add 4 more** so the page reads in this order:

1. **Hero** (existing) — "先理解 FCN 的風險結構，再談監控。" Hero CTAs stay: 了解 IXAI Pro + 申請 Pro 測試. **Add a third CTA:** 預約 FCN 健檢 → routes to `/feedback?intent=fcn_consultation` (existing route, intent param is the lead capture vector).
2. **什麼是 FCN** (existing) — keep as-is.
3. **為什麼高資產投資人會用 FCN** (NEW) — three bullet pillars: 現金流 / 盤整市場收益 / 客製化條件. Reframes FCN positively before introducing risk; avoids the "FCN is bad" misread.
4. **真實風險 — 4 concept cards** (existing KI/KO/Worst-of/observation cards) — keep.
5. **實境舉例** (NEW) — single-card explainer with TSLA/MDB/AFRM worst-of example. Non-advisory framing; uses "若" / "假設" language.
6. **為什麼需要監控** (existing one-paragraph block) — keep.
7. **為什麼今日很難做到** (NEW) — call out Excel + 對帳單 + 業務通知 + 多檔多標的的人工追蹤痛點. Sets up the Pro moat.
8. **IXAI Pro 的 FCN 監控** (existing Pro CTA block) — expand into a list: KI/KO 追蹤、Worst-of 監控、配息與觀察日、風險等級、標的集中度、AI 風險提醒. Label clearly: **「完整 FCN 監控屬於 IXAI Pro 功能」**.
9. **顧問服務 CTA** (NEW) — single block: "如果你手上已有多檔 FCN 或正在評估結構型商品，可以先做 FCN 健檢。" Routes to feedback intent.
10. **合規說明** (NEW) — short, single-line: "本頁為教育與風險說明，不構成個別投資建議。" Token-aware muted ink color.

Result: ~10 sections, all education + conversion. Zero monitoring widgets. Same file path (`app/fcn/page.tsx`), grows from 151 → ~300 lines.

---

## 4. Homepage information architecture

`components/home/intelligence-landing.tsx` already does most of what v1.64.0 asks. The minimum-risk cut for v1.64.0:

- **No structural rebuild.** Keep the 6 existing sections (Hero, Today Preview, What Differs, Delivery Models, Product Flow, Footer CTAs).
- **One copy change:** add a one-line tri-fold under the hero copy block — "App: 公開市場情報與教育 · Pro: 投資組合與 FCN 監控 · 顧問服務: FCN 健檢與一對一諮詢" — so first-time visitors immediately see the role split.
- **No new module cards.** Resist adding a "FCN moat" or "Consulting" module to the landing — those belong on `/fcn` and `/pro`. The landing's job is positioning, not enumeration.

**Deferred to v1.65+:** full landing rewrite, hero CTA reordering, removing the "Today Intelligence Preview" sample cards.

---

## 5. /pro conversion page strategy

Keep `ProWorkspaceHub` logic — it correctly handles backend health, account link, entitlements, beta gating. The v1.64.0 cut **wraps** the hub with a marketing prelude:

1. **Page-level hero** (NEW, lives in `app/pro/page.tsx`, not inside the hub) — "IXAI Pro：給需要持續監控風險的投資人與顧問。" + the App-vs-Pro line. This replaces the hub's current "正在與 App 帳號整合中" hero as the user's first read.
2. **Pain points** (NEW) — three short cards: FCN 不只看配息 / 投資組合風險會集中 / 市場資訊太多 / 人工追蹤容易漏掉日期與風險.
3. **Module hierarchy rebalance** (modify hub) — instead of 3 equal cards, FCN module gets a wider span (`lg:col-span-2`) and a primary visual treatment. Portfolio + Risk stay as smaller secondary cards. The order stays: FCN first, then Portfolio, then Risk.
4. **Consulting CTA block** (NEW) — beneath the modules: "需要人為審視？預約一玄投資顧問服務。" Routes to feedback intent.
5. **Disclaimer** (existing) — keep.

Result: page.tsx grows from 12 lines → ~120 lines. Hub stays largely intact (~280 lines, +12 for hierarchy class change).

---

## 6. Account page simplification strategy

Per the v1.63.1 audit, `/account` is already in good shape: hero, AccountPanel, ProLabConnectionCard, WatchlistIntelligenceLite, ConnectLineCard, LineDeliveryFoundationCard, feedback section, "why account" explainer. No engineering jargon visible to the user.

**v1.64.0 action:** none in this cut. Defer Account rebalance to v1.65.

---

## 7. Taiwan investor copywriting principles

- **正體中文 first, English second.** Section eyebrows can stay English (Intelligence Preview, Risk Watch, etc.) for institutional feel — that's a v1.62 brand decision. Body copy in 正體中文.
- **No engineering vocabulary in public pages.** "Entitlement / backend / feature gate / skeleton / beta" → "會員方案 / 系統連線 / 功能權限 / 開發中 / 測試版". Admin keeps technical terms.
- **No buy/sell language.** "監控 / 觀察 / 提醒 / 教育" instead of "建議買入 / 賣出 / 建議部位".
- **No guaranteed returns.** "風險意識 / 風險觀察 / 教育" instead of "穩賺 / 保證收益 / 必漲".
- **Short paragraphs.** ≤3 sentences per paragraph. Lists over walls of text on mobile.
- **Consulting CTAs use action verbs:** "預約 FCN 健檢" / "預約諮詢" / "申請投資組合診斷" — not "聯絡我們".

---

## 8. Before / after page map

| Route | v1.63.1 (today) | v1.64.0 (this cut) | Change weight |
|---|---|---|---|
| `/` | Marketing landing, 6 sections, no role tri-fold | Same + 1-line App/Pro/顧問 split under hero | Trivial |
| `/fcn` | Education, 5 sections, single Pro CTA, no consulting CTA | Education + conversion, 10 sections, includes consulting CTA, worked example, pain-of-manual block, expanded Pro moat list | **Major** |
| `/pro` | Hub-only stub (12 lines), no marketing prelude | Marketing hero + pain points + module hierarchy rebalance (FCN first/wide) + consulting CTA + existing hub | **Major** |
| `/daily-brief` | Reading-first archive (v1.63.1) | No change | None |
| `/weekly-brief` | Reading-first archive (v1.63.1) | No change | None |
| `/account` | Already simplified (v1.63) | No change | None |
| `/share`, `/welcome`, `/onboarding` | Acquisition routes | No change | None |

---

## 9. Files expected to change

| File | Change | Approx lines |
|---|---|---|
| `app/fcn/page.tsx` | Extend with 5 new sections (high-net-worth, worked example, manual pain, expanded Pro moat, consulting CTA, compliance footer) | 151 → ~300 |
| `app/pro/page.tsx` | Wrap hub with marketing prelude (hero + pain points + module hierarchy override + consulting CTA) | 12 → ~120 |
| `components/pro/pro-workspace-hub.tsx` | Rebalance module grid so FCN spans wider; keep all logic | 268 → ~280 |
| `components/home/intelligence-landing.tsx` | Add 1-line App/Pro/顧問 tri-fold under hero copy | +6 lines |
| `docs/APP_UX_REDESIGN_V164.md` | This document | +new |
| `docs/PROJECT_CONTEXT.md` | Current Version → v1.64.0; new capability paragraph | +small |
| `docs/ROADMAP.md` | Current Version → v1.64.0; v1.64.0 entry | +small |
| `docs/VERSION_HISTORY.md` | v1.64.0 entry with Why / What / Key Decisions / Out of Scope | +small |

Total: ~8 files. **No** schema, API, generator, auth, identity, content engine, or Supabase changes.

---

## 10. Rollback plan

Each page change is single-file and additive. Rollback is per-file via `git checkout HEAD -- <path>`:

- **/fcn rollback:** `git checkout HEAD -- app/fcn/page.tsx`. Restores v1.63.1 5-section education layout.
- **/pro rollback:** `git checkout HEAD -- app/pro/page.tsx components/pro/pro-workspace-hub.tsx`. Restores 12-line stub + balanced 3-module hub.
- **Homepage rollback:** `git checkout HEAD -- components/home/intelligence-landing.tsx`. Trivial — only 6 lines added.
- **Doc rollback:** the redesign doc is new; remove. Version bumps revert with the file checkouts.

No data migrations. No SQL. No auth or session impact. No analytics event-schema impact. Rollback safe at file level, fast at branch level (`git revert` per commit).

---

## 11. What this cut **does not** do

- Does not touch SSO (deferred to v1.62 launch endpoint per SSO_IMPLEMENTATION_PLAN).
- Does not touch backend, Supabase, auth, identity, or membership entitlements.
- Does not modify Daily/Weekly content generation or the social pack engine.
- Does not introduce FCN Monitoring as a free App feature (preserves v1.63.1 role separation).
- Does not introduce new analytics events. The existing `feedback` lead-capture path absorbs the new consulting CTAs.
- Does not add Stripe, paywall, or any payment surface.
- Does not rewrite the homepage architecture (deferred to v1.65+).
- Does not simplify /account (already done in v1.63).

## 12. Validation gate

After implementation:
- `npm run lint` clean
- `npm run build` green; 68+ routes present
- `QA_PORT=3001 npm run qa:mobile` 12/12 PASS
- Manual visual inspection of `/`, `/fcn`, `/pro`, `/account`, `/daily-brief`, `/weekly-brief`

No commit, no push. The user reviews and decides whether v1.64.0 ships as one PR or as `/fcn` + `/pro` as two separate commits.
