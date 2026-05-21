# IXAI Ecosystem — Claude UX / Product Experience Audit v1.17.5

**Date**: 2026-05-21
**Mode**: Audit only. No code modifications. No PWA implementation.
**Scope**:

- Public App: `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app` (v1.17.5)
- Pro Dashboard: `/Users/itsunkuo/Desktop/IXAI_PROJECTS/frontend/ixai-website-clean` (post-v4.1, shared-identity foundation landed)

**Complements** (does not duplicate):

- `docs/audit-v1.17.5-public.md` — engineering / security audit (admin gate, API hash, publish durability)
- `docs/audit-v1.17.5-pro.md` — Pro Dashboard engineering audit (env vars, auth, metadata)
- `docs/pwa-readiness.md` — manifest / service worker / offline state inventory

This document is **product experience**: hierarchy, attention flow, mobile readiness, conversion funnel, brand trust, cross-app consistency.

---

## 1. Executive summary

IXAI has crossed an architectural threshold: shared identity, ecosystem bridges, daily-brief auto-drafting, ProEngineSurface, and a published-intelligence layer are all in place. The product **structurally** looks like a two-tier AI financial intelligence ecosystem.

The UX, however, still **reads** like two related-but-different tools rather than one ecosystem with two surfaces. The Public App is closer to the brand vision than the Pro Dashboard. The Pro Dashboard still feels like an engineering / admin panel rather than an AI Wealth Operating System.

**Health score (subjective, illustrative):**

| Dimension | Public App | Pro Dashboard |
|---|---|---|
| First-time user understanding | 75 | 55 |
| Visual hierarchy | 80 | 65 |
| Mobile experience | 75 | 50 |
| Conversion funnel clarity | 70 | n/a (closed product) |
| Brand identity / I-Xuan trust | 80 | 55 |
| Ecosystem feeling | 70 | 50 |
| **Composite** | **75** | **55** |

**Verdict before PWA work begins:** the Pro Dashboard's product feeling is the single biggest gap. PWA implementation will hard-code today's UX into a "feels-like-app" experience. If Pro Dashboard is hardened-as-PWA today, users will install something that still looks engineering. Fix the most expensive product-experience issues **before** PWA install creates permanence.

---

## 2. What currently works well

### Public App

- **Five-tier daily workflow on homepage** (`app/page.tsx`) — today's headline → free intelligence → personal monitoring → this-week depth → premium. Tiers are labelled (`免費情報`, `個人監控`, `本週深度`, `IXAI Pro`) and reinforced by `SectionDivider`.
- **Mobile top bar shows today's headline** (`components/layout/mobile-top-insight.tsx`) — the morning user gets value before any scroll. Live-subscribes to `subscribeToEditorialUpdates`.
- **`RiskFocus` opens above `MarketPulse`** — insight before data. Matches the brand line "IXAI 先看風險，再看機會."
- **Sidebar grouped into 5 workflow tiers** (Daily / Market / Personal / Membership / Brand) with gold eyebrow headers — navigation reinforces the homepage hierarchy.
- **Shared identity copy is consistent** — `ixaiIdentity.sharedAccountMessage` is reused across `/account`, `EcosystemBridge`, `OnboardingCard`. The promise "Public + Pro share one IXAI Account" is delivered as copy even though backend sync isn't built yet.
- **Brand voice is disciplined** — almost every paragraph repeats the "先看風險，再看機會 / 不是交易入口，是風險觀察層" framing. Compliance tone holds.
- **`/about` and `/ixai` give the brand real depth** — founder narrative, four beliefs, community channels, philosophy. Not a placeholder.
- **`OnboardingCard` is non-blocking** — interest-selection nudge that auto-hides once completed. Doesn't force a signup wall.
- **Pro engine preview** (`ProEngineSurface` at Tier 3.5 on homepage) — the user sees what Pro looks like *inside* the free experience, with a clean Preview / Locked badge per surface.
- **EcosystemBridge is contextual** — different copy for `variant="public"` vs `variant="pro"`, so each side knows where the other one is.

### Pro Dashboard

- **Engine API surface (v4) is stable** — `engine-summary`, `market-engine`, fail-soft status bands (healthy / partial / degraded / unavailable), localized narratives. Backend is genuinely production-grade.
- **Locale system is comprehensive** — 5 locales × 17 namespaces, regression-tested via `scripts/test-i18n.mjs`. No raw keys leak on the UI.
- **Compliance layer is layered** — backend `compliance_filter` + frontend `sanitizeAdviceText` + regex regression tests. Forbidden trading vocabulary cannot leak through any path inspected.
- **DB pool, request dedup, engine cache** — under the hood, the Pro Dashboard is hardened. The product feeling gap is **only** in the visible UI, not the foundation.
- **Public App ecosystem bridge exists** — Pro Dashboard now has a return path to Public App per the v1.15 connection work.

---

## 3. Top 10 UX problems (ranked)

1. **Pro Dashboard still looks like an engineering admin panel.** Black-zinc terminal palette, dense mono-font tables, `P0 / P1 / P2 · …` SectionDividers, `STATUS: WATCH` uppercase pills. A paying user opening this for the first time will not feel "AI Wealth Operating System" — they will feel "internal tool." This is the #1 risk to monetization.
2. **Public App homepage has too many top-of-page cards.** Order is `OnboardingCard → LaunchIntro → RiskFocus → MarketPulse` — four full-width sections before the first divider. Each is useful in isolation; together they crowd the first fold and dilute the headline. (`app/page.tsx:42-46`)
3. **`LaunchIntro` competes with `RiskFocus` for attention.** Both render large cream/forest panels with eyebrow + h2 + body + CTA. New visitors don't know which is the "what is IXAI?" card vs which is "today's insight." This is a v1.7 vs v1.14 layering scar.
4. **Pro Dashboard has no daily-headline equivalent.** Public App opens with "今日 Risk Focus is X." Pro opens with `t("page.dashboard")` ("Dashboard") and a generic subtitle. A paid user has no "today's morning takeaway" landing experience parallel to the public side.
5. **Two Pro destinations from Public App.** `/pro` (in-app Preview) and `ixaiEcosystem.proDashboardUrl` (external Vercel domain) both exist. CTAs across LaunchIntro, EcosystemBridge, /ixai, /about each pick one or the other inconsistently. User mental model gets muddled. (Confirmed in `audit-v1.17.5-public.md` Medium #4.)
6. **Pro Dashboard sidebar is 10 flat peers** (auth/me / 投資總覽 / 資產 / FCN / AI 分析 / 市場 / 警示 / 資產輸入 / 匯入 / 帳戶 / 設定). No tiering. The Public App's grouped sidebar (Daily / Market / Personal / Membership / Brand) is a better pattern that hasn't been ported.
7. **FCN education on `/fcn` reads like a product feature page, not education.** A non-professional user looking up "what is FCN?" doesn't get a primer; they get IXAI's monitoring promise. Misses the lead-gen / education funnel.
8. **Pro Dashboard `/dashboard` page is 492 lines, `/intelligence` 531, `/fcn` 544, `/portfolio` 537.** God-pages with many inline grids and ad-hoc cards. Reading them feels heavy because there's no scannable hierarchy ladder (still flagged from prior v4.1 audit, unchanged).
9. **Public App has both `OnboardingCard` and `EcosystemBridge` showing on the homepage simultaneously for first-time users.** Both occupy similar visual space, both say "let me orient you" — user gets two onboarding prompts instead of one.
10. **Mobile top bar headline can clash with `RiskFocus` content below.** Both render the same `riskFocus.title`. On mobile, scrolling 2 cm reveals the same sentence in larger type. Could be felt as a duplicate. Either truncate top-bar version, or change content (e.g. show regime label only).

---

## 4. Public App issues (UX / product experience)

### 4.1 First-time user understanding

| Aspect | Status | Notes |
|---|---|---|
| Within 5s the user knows IXAI is daily market intelligence | **OK** | LaunchIntro + mobile top headline carry the message |
| User knows the app is free | **OK** | "免費市場 intelligence" appears in LaunchIntro |
| User knows IXAI Pro is deeper AI risk monitoring | **OK** | Tier 5 + `/pro` + `/ixai` are explicit |
| User knows the brand is 一玄 (I-Xuan) | **Partial** | Brand link is in About / footer; not surfaced on hero |
| Public → Pro journey feels natural | **OK** | EcosystemBridge + ProEngineSurface + tier hint do the work |

### 4.2 Homepage hierarchy

Tier 1 currently renders **4** cards before the first divider:

```
OnboardingCard       (new — interest selection, dismissible)
LaunchIntro          (new — "免費市場 intelligence" hero)
RiskFocus            (today's headline)
MarketPulse          (data tiles)
```

Pre-v1.7 the audit recommended "insight before data." With v1.14+ additions, the first fold has **two product-explainer cards** above the daily headline. New visitors get explanation; returning users get noise.

**Recommendation**: collapse `LaunchIntro` to a slimmer one-liner for returning users, OR conditionally render only for first-visit users (mirror `OnboardingCard`'s mounted-state logic). Use `memory.lastVisitedAt` from the existing personalization layer.

### 4.3 Page-by-page UX

#### `/` (homepage)
- Strong tier structure; weakened by Tier 1 card stack (see 4.2).
- `ProEngineSurface` at Tier 3.5 is a smart bridge — gives users a Pro taste without leaving free product. Visual weight is appropriate.
- WeeklyBriefPreview + MarketOverview pairing at Tier 4 reads well.
- `EcosystemBridge` at the top of Tier 5 (just before ProCta) duplicates ProCta's message. Consider merging or dropping one.

#### `/daily-brief`
- 31-line page — wrapper for `DailyBriefUnifiedArchive` component. Most of the depth lives in that component; couldn't inspect heavy detail in this audit pass.
- Brief detail at `/daily-brief/[slug]` uses `DailyBriefLocalDetail`. Editorial content lives in this client component, server-rendered on demand per build output.

#### `/weekly-brief`
- 107 lines; standalone narrative page. Acceptable depth.

#### `/market`
- 55 lines (`MarketPulse` + `MarketOverview` only). Feels light for a page titled "Market." A first-time user expecting market depth lands here and gets the same 6 pulse tiles from the homepage plus the market overview from homepage Tier 4. **Duplicate experience**.
- **Recommendation**: differentiate `/market` from homepage Tier 4 — add a sector summary or correlation matrix that isn't on the homepage.

#### `/fcn`
- Educational content but framed as product feature. The first paragraph is "IXAI 監控..." rather than "什麼是 FCN?" — misses the educational lead-gen funnel.
- For non-professionals (the target Public App audience), this page should answer: *what is an FCN, what is KI/KO/Worst-of, why do I care, what does IXAI do about it*.

#### `/pro`
- Strong hero, IXAI Pro Preview eyebrow, 4-step architecture, 4 preview cards, 6 capabilities. Detailed and confidence-building.
- However: this page exists **in addition to** `/ixai` (also 219 lines, also a Pro-education page). Two product-education pages = which is canonical? Users following different links land in different educational depths.

#### `/ixai`
- "Pro Education" framing, 4 preview blocks A/B/C/D. Conceptually overlaps significantly with `/pro`.
- **Recommendation**: either merge `/pro` + `/ixai`, or differentiate hard (e.g. `/ixai` = "product story / vision", `/pro` = "what you get / pricing").

#### `/about`
- 218 lines. Founder narrative, 4 beliefs, community contacts. Builds trust.
- Logo placeholder uses `/logo/ixuan-logo.png`. Production-ready if the asset is shipped.

#### `/watchlist`
- 11-line page — wrapper for `WatchlistManager`. Personal monitoring entry point.
- Audit cannot verify mobile fitness without rendering — see Section 6.

#### `/account` (new)
- "我的 IXAI" hero + 3-tier (FREE / PERSONAL / PRO) card grid + "Why login?" rationale.
- Strong identity-layer framing. The "登入不是為了限制閱讀" copy is reassuring.
- Risk: page exposes 3-tier framing that isn't backed by real auth yet (per `audit-v1.17.5-public.md` Medium #1, identity is copy-ready, not data-ready).

### 4.4 Mobile-first claim verification

- Mobile top bar with today's headline: ✅
- Mobile bottom nav: ✅ (`MobileNav` 6 tabs)
- Sticky positioning: ✅ (top + bottom both fixed)
- Tap targets `py-2` on bottom nav: borderline OK for 44px iOS guideline (might be ~32px — verify on device)
- Homepage on iPhone-15 viewport: stacks single column; should test scroll fatigue with 11 sections + dividers
- `/account`, `/about`, `/ixai`, `/pro` heavy hero panels: should test that the cream-on-forest contrast holds on outdoor screen brightness

### 4.5 Brand & trust

- ✅ I-Xuan logo present
- ✅ Disclaimer in footer (`市場資料與內容僅供資訊參考`)
- ✅ Founder narrative on `/about`
- ✅ Compliance-safe wording (`不是交易入口` framing repeated)
- ⚠️ Production OG image was added in v1.14.1 — verify it actually renders on Twitter / LINE preview
- ⚠️ `proFeatures` from `lib/mock-data.ts` — copy origin doesn't matter if it reads natural, but flag for awareness

---

## 5. Pro Dashboard issues (UX / product experience)

### 5.1 Does it feel like an AI Wealth Operating System?

**No, not yet.** Symptoms:

- **Terminal-style palette** (`bg-black text-white`, `border-zinc-800`, `font-mono` everywhere) reads as engineering tool, not premium financial workspace
- **`P0 · Executive summary` / `P1 · Contextual intelligence` / `P2 · Deep analysis`** dividers expose engineering jargon — these are framework labels, not investor labels
- **`STATUS: WATCH` uppercase pills** look like log levels
- **Mono-font numeric tables** with `border-zinc-800 px-2 py-2` cells read like a debug dashboard
- **AppShell sticky top mobile bar** has brand + nav + chips = 3 rows of chrome before content

### 5.2 Does it feel like part of IXAI ecosystem?

- Brand consistency with Public App: **weak**
  - Public App: cream/forest/gold editorial palette, Geist sans+mono, `I-Xuan` logo present
  - Pro Dashboard: zinc/black terminal palette, no I-Xuan visual identity, no editorial fonts
  - These look like products from two different companies
- Ecosystem bridge to Public App: **present but new** (v1.15 commit `d6a1cdc`) — exists, not yet evaluated on device

### 5.3 Internal admin feeling

The 10-item sidebar (`auth/me / 投資總覽 / 資產 / FCN / AI 分析 / 市場 / 警示 / 資產輸入 / 匯入 / 帳戶 / 設定`) is flat and includes operational items (`資產輸入`, `匯入`) at the same level as analysis items (`AI 分析`, `風險`). User can't tell what they should look at daily vs operational tasks they only do occasionally.

The Public App's grouping pattern (Daily / Market / Personal / Membership / Brand) is the obvious port.

### 5.4 Risk-first hierarchy clarity

- Dashboard page **does** lead with Today Focus + Risk Overview — direction is correct
- But the visual weight is identical to "Asset Allocation" and "Top Alerts" below — no real Tier 1 vs Tier 2 separation
- `intelligence_confidence` is rendered as a raw 0-100 number; investor-readable framing missing

### 5.5 Information density appropriate?

For a paid product targeting professional / advisor / high-net-worth users:

- The Pro Dashboard's density is **appropriate** for desktop-first workflow (this is a workstation tool)
- But density currently masquerades as "engineering" rather than "professional terminal"
- Same data, more deliberate typography + breathing room + brand palette would shift the read from "engineer's view" to "trader's view"

### 5.6 Key actions obvious?

- Position add: `/input` exists but is buried in nav, not surfaced on dashboard
- Import CSV: `/import` exists, same problem
- Risk drill-down: `/intelligence` exists, no "see why" link from dashboard's risk cards
- The dashboard is **read-only by feel** even though write paths exist

### 5.7 Premium-enough feeling

If a user paid $X/month for IXAI Pro and the URL their account opens to today is `ixai-website-clean.vercel.app/dashboard` — the URL itself feels unfinished (`-website-clean`, `.vercel.app`). Combined with the engineering aesthetic, the perceived value is significantly below what the backend actually delivers.

---

## 6. Mobile / PWA readiness (UX angle only)

> Engineering PWA readiness already covered in `docs/pwa-readiness.md`. This section is about **product experience** — what an installed PWA would feel like.

### 6.1 Public App

| Aspect | Status |
|---|---|
| Mobile-first design | ✅ (mobile top + bottom + grid breakpoints) |
| Tap targets ≥ 44px | ⚠️ need device verification — `py-2` rounded items are borderline |
| Daily Brief readability on mobile | Need to test on iPhone SE viewport |
| Card density on mobile | Tier-stacking on small viewport may cause scroll fatigue (5 tiers × 2-3 cards = ~12 scrolls to bottom) |
| Sticky top + sticky bottom + scroll | Likely OK; verify keyboard-open on `/watchlist` doesn't break sticky |
| Install-from-Safari readiness | Manifest exists (per pwa-readiness.md); icons exist; OG image exists |
| Installed PWA opens to which screen? | Currently `/` — same as web. **No `start_url` differentiation** for "morning use" experience |

### 6.2 Pro Dashboard

| Aspect | Status |
|---|---|
| Desktop-first declared, mobile not broken expected | Mostly holds, but `text-xs` everywhere on mobile is on the legibility floor |
| Tables / wide grids | `md:grid-cols-5` forms (`/input`) may cramp on tablet portrait |
| Sticky mobile top bar | 3-row chrome — eats ~120px before content |
| Tap targets | Many `text-xs border zinc-800 px-2 py-1` — definitely below 44px iOS guideline |
| Mobile-installed PWA viability | Currently low priority per product positioning (desktop-first) but if installed will feel cramped |

### 6.3 PWA-specific UX considerations

**Before PWA install creates permanence, verify:**

- Daily Brief detail (`/daily-brief/[slug]`) renders properly on small viewport — most-likely-installed page
- "Add to home screen" prompt timing: don't prompt on first visit (too aggressive); prompt after 2+ Daily Brief reads (engaged user)
- Install icon should match `I-Xuan` brand identity — not a generic IXAI text mark
- Offline state for `/daily-brief` (today's brief should be readable offline once visited)
- Pro Dashboard installable separately or via Public App "Open in Pro" pattern? — needs explicit decision

---

## 7. Conversion funnel (Public → Pro)

### 7.1 Current funnel paths

```
Homepage Tier 1 (LaunchIntro) → "了解 IXAI Pro" → /pro
Homepage Tier 3.5 (ProEngineSurface) → "進入 IXAI Pro" → external Pro Dashboard
Homepage Tier 5 (ProCta) → "了解 IXAI Pro" → /ixai
Sidebar (Membership / IXAI Pro) → /ixai
Mobile bottom nav (Pro) → /ixai
/about → various contact links → LINE / Email
```

### 7.2 Funnel diagnosis

- **Three Pro education pages exist**: `/pro` (260 lines), `/ixai` (219 lines), and the inline `/ixai` link from the bottom nav. Users can land in different depths via different paths and get different stories.
- **Pro Dashboard URL is exposed as `ixai-website-clean.vercel.app`** — breaks the perception of paid product polish at the moment of conversion
- **No mid-page lead-gen capture** — there's no "下載 IXAI Pro 試用申請表 / 預約 30 分鐘 advisor 諮詢" form anywhere visible. Conversion relies on user actively clicking external LINE / Email
- **`/pro` CTAs**: "進入 IXAI Pro Dashboard" + "申請 IXAI Pro" + "聯絡一玄" — 3 simultaneous CTAs split intent

### 7.3 Compliance / overpromise check

- ✅ "不是交易入口" framing repeated
- ✅ No guaranteed returns language seen
- ✅ "風險導向" emphasized over "勝率"
- ⚠️ "AI Wealth Operating System" is a strong claim — ensure copy backs it with concrete capabilities (currently it does via ProEngineSurface preview, OK)
- ⚠️ Pro Dashboard delivers backend that can support the claim; product UX doesn't yet match the claim's perceived premium-ness (see §5)

### 7.4 Conversion friction inventory

| Step | Friction |
|---|---|
| Notice Pro exists | Low — multiple touchpoints |
| Understand what Pro does | Medium — two/three education pages with overlapping content |
| Decide to upgrade | High — no pricing, no plan structure visible, no "start trial" affordance |
| Initiate contact | Medium — LINE / Email contact links but no in-product form |
| Land in Pro Dashboard | Medium-High — external URL with `-website-clean.vercel.app` looks unfinished |

---

## 8. Brand / trust audit

### 8.1 IXAI ↔ I-Xuan layer relationship

**Currently consistent in copy, inconsistent in visual identity.**

- Copy: every page mentions "IXAI" as the product and "一玄 / I-Xuan Investment Co. Ltd." as the trust brand. Footer disclaimer is signed `© I-Xuan Investment Co. Ltd.` Brand foundation is in place.
- Visual: Public App carries the I-Xuan editorial palette (cream / forest / gold) and serif heading on `/account`/`/pro`. Pro Dashboard does **not** — zinc/black terminal palette, no I-Xuan logo, no editorial typography. Two products that should feel like one ecosystem feel like two companies.

### 8.2 Founder / company credibility

- `/about` has founder narrative, 4 beliefs, community channels — strong
- Verify in production: contact CTAs (LINE / Email) actually route to real channels (per `audit-v1.17.5-public.md` Medium #2 — values come from `getPrimaryContactLinks()`, depends on real env config)

### 8.3 Disclaimers

- Footer disclaimer: present, compliant
- Pro Dashboard `/dashboard` page: not visibly verified to render the same disclaimer band
- `/ixai` and `/pro` (product pitch pages): should verify a "本資訊不構成投資建議" disclaimer is present somewhere on each marketing page

### 8.4 Dead-looking / placeholder UI

- ✅ No "Lorem ipsum" or `TODO` placeholder copy found
- ⚠️ `proFeatures` strings from `lib/mock-data.ts` — verify they're not "draft 1" copy lingering from earlier iterations
- ⚠️ Sidebar bottom "Risk State" panel on Pro Dashboard says "Risk-on 偏正向，但利率仍是估值壓力源。" — hardcoded string. Either dynamic or remove (dynamic is the long-term right call)

### 8.5 Brand naming consistency

| Where | What | Issue |
|---|---|---|
| `ixaiIdentity.ecosystemName` | "IXAI Ecosystem" | ✅ |
| `ixaiIdentity.publicAppName` | "IXAI Public App" | OK |
| `ixaiIdentity.proDashboardName` | "IXAI Pro Dashboard" | OK |
| Footer / About | "I-Xuan Investment Co. Ltd." | Trust brand — consistent |
| Pro Dashboard sidebar header | "IXAI / Intelligence OS / Daily market command layer" | Different framing — no I-Xuan reference |
| URL `ixai-website-clean.vercel.app` | the actual Pro Dashboard prod URL | Breaks polish; should map to `pro.ixai.app` or similar |

---

## 9. Ecosystem consistency

### 9.1 Shared identity status

- `ixaiIdentity.sharedAccountMessage` is shipped across both `EcosystemBridge` variants, `OnboardingCard`, `/account` page
- `ixaiIdentity.watchlistSyncCopy` is referenced — promise is "Watchlist syncs Public ↔ Pro" — **not yet backed by data layer** (per public engineering audit)
- The copy promise is ahead of the implementation. Acceptable for "future" framing, risky if users sign in expecting their Public watchlist on Pro

### 9.2 Cross-app navigation

- Public → Pro: 3 paths (`/pro`, ProEngineSurface, EcosystemBridge), 2 destinations (`/pro` internal preview vs external Pro Dashboard URL)
- Pro → Public: `EcosystemBridge` (added in v1.15) — single back-path, OK direction. Verify production has the bridge wired into AppShell

### 9.3 Naming consistency table

| Concept | Public App says | Pro Dashboard says |
|---|---|---|
| The user's personal asset list | `自選觀察 / Watchlist` | `投資組合 / Portfolio` |
| The morning intelligence | `Daily Brief / 每日簡報` | `Today Focus / 今日重點` |
| Premium tier | `IXAI Pro` | `IXAI Pro` ✅ |
| Risk band names | n/a (free side has narrative only) | `clear / watch / elevated / critical` (English enum) |
| Regime names | uses `Risk-on / Risk-off / Neutral` localized | `RISK_ON / DEFENSIVE / HIGH_VOLATILITY` (uppercase enum, English) |

The two apps use different vocabularies for the same concepts. This is the single biggest "feels like two products" cue.

### 9.4 Shared visual identity gaps

- Public uses cream `bg: #f5f0e6`, forest `#09291f`, gold `#b08d57`, Geist sans/mono
- Pro uses black `bg-black`, zinc-800 borders, default sans
- **No shared design tokens file** — colors are CSS vars in Public, hard-coded Tailwind in Pro

---

## 10. Recommended fixes by priority

### P0 — Must fix before PWA implementation

These get hard-coded into the installed app once PWA ships.

1. **Pro Dashboard brand reskin (palette + typography).** Adopt the I-Xuan cream/forest/gold tokens. Keep Pro's density (it's appropriate for desktop workstation use) but change the surface from "terminal" to "editorial finance terminal." Estimate: 3-5 days. This is the single highest-leverage change before PWA install.
2. **Public App homepage Tier 1 collapse.** Render `LaunchIntro` only for first-visit users (use `memory.lastVisitedAt`). Returning users see `RiskFocus → MarketPulse` immediately. Estimate: 2 hours.
3. **Pro Dashboard sidebar grouping.** Port the Public App's 5-tier grouping pattern (Daily / Market / Personal / Membership / Brand). Estimate: 1 day.
4. **Single Pro destination.** Pick `/pro` OR external Dashboard URL — not both — for the "进入 IXAI Pro" CTA on free homepage. Estimate: 1 hour.
5. **Pro Dashboard production URL.** Move from `ixai-website-clean.vercel.app` to `pro.ixai.app` (or similar branded subdomain) **before PWA install fixes the URL to a user's home screen**. Estimate: 2 hours config.
6. **Pro Dashboard daily-headline.** Add a `Today Risk Focus` band at the top of `/dashboard` parallel to Public App's `RiskFocus`. Pull from the same `getLatestPublishedIntelligence` source or equivalent. Estimate: 1 day.

### P1 — Should fix soon (post-P0, pre-paid-launch)

1. **`/fcn` rewrite as education-first.** Open with "什麼是 FCN?" not "IXAI 監控..." Add KI/KO/Worst-of visual primer with an analogy. Estimate: 1-2 days copy + design.
2. **Merge `/pro` + `/ixai` OR differentiate them hard.** Pick one canonical "what is IXAI Pro" page; redirect the other or repurpose. Estimate: 4 hours decision + 1 day execution.
3. **Pro Dashboard P0/P1/P2 dividers → investor labels.** `今日重點 / 市場與風險狀態 / 深入分析` instead of `P0 · Executive summary`. Estimate: 4 hours.
4. **Single regime vocabulary across both apps.** Decide once: are regimes `Risk-On / Risk-Off / Defensive`, or `RISK_ON / DEFENSIVE`? Apply consistently. Estimate: 1 day.
5. **Pro Dashboard "key actions" surfacing.** From `/dashboard`, deep-link to `/input` (add position) and `/import` from a top-row CTA strip. Estimate: 4 hours.
6. **Shared design tokens file** (`src/design/tokens.ts` shared between repos via npm-workspace or copied symlink). Estimate: 1 day setup + 1 day adoption per repo.
7. **Mobile tap-target audit.** Verify every clickable element ≥ 44 px hit area on iOS guideline. Especially mobile bottom nav, `/account` toggles, watchlist row links. Estimate: 1 day audit + 1 day fixes.

### P2 — Can wait

1. Dynamic "Risk State" panel in sidebar (currently hardcoded)
2. `/market` differentiation from homepage Tier 4 (sector view, correlation matrix)
3. Investor-friendly framing of `intelligence_confidence` (0-100 → "信心度: 高 / 中 / 低")
4. Pro Dashboard god-pages refactor (dashboard/intelligence/fcn/portfolio still 500+ lines)
5. WeeklyBrief / DailyBrief detail pages PWA-offline support
6. Sidebar Risk State dynamic data feed
7. Public App `/account` 3-tier framing wired to real account state once auth lands

---

## 11. Suggested next sprint order

This sequencing optimises for: (a) fix-it-once-not-twice (PWA cements UX), (b) protect monetization (Pro feels premium), (c) preserve daily-use rhythm.

### Sprint A — "Brand and ecosystem consistency" (1 week)

Owner deliverable: Pro Dashboard and Public App look like one product.

1. P0 #1: Pro Dashboard brand reskin (3-5 days)
2. P0 #3: Pro Dashboard sidebar grouping (1 day)
3. P0 #5: Pro Dashboard production URL move (config)
4. P0 #6: Pro Dashboard daily-headline band (1 day)
5. P1 #3: Investor labels for P0/P1/P2 dividers (4 hours)
6. P1 #4: Single regime vocabulary decision + apply (1 day)

### Sprint B — "Funnel clarity and onboarding" (3-4 days)

1. P0 #2: Tier 1 collapse for returning users (2 hours)
2. P0 #4: Single Pro destination decision (1 hour)
3. P1 #2: Merge or differentiate `/pro` + `/ixai` (1 day)
4. P1 #1: `/fcn` as education-first (2 days)
5. P1 #5: Pro Dashboard key-action surfacing (4 hours)

### Sprint C — "PWA-ready polish" (2-3 days, after Sprint A + B land)

1. P1 #7: Mobile tap-target audit + fixes (2 days)
2. Verify all v1.14.1 OG / social preview assets render in production
3. Decide: PWA install prompt timing (engaged user, not first visit)
4. Decide: Pro Dashboard installs as separate PWA or only via Public App

### Sprint D — "PWA implementation" (1-2 weeks)

Only after Sprint A + B + C land. Otherwise PWA install bakes in unfinished UX.

### Sprint E — P2 cleanup (ongoing)

Take from P2 list as bandwidth allows.

---

## 12. Closing notes (no implementation in this audit)

This document deliberately did not propose new components, refactor patterns, or detailed designs. The next step is to **decide which P0 items go into Sprint A** and let an implementation pass propose the precise component-level changes from there.

**Two product-level decisions are blocking everything else:**

1. **Is the Pro Dashboard going to look like an "AI Wealth Operating System" or stay engineering-flavoured?** Answer determines whether Sprint A even happens. The cost is real (1 week minimum), but the perceived value gain is the highest-ROI change in the audit.
2. **Are `/pro` and `/ixai` redundant?** Answer determines Sprint B sequencing.

Once those two decisions are made, the rest of the priority list flows naturally.

**What I observed that the user did not ask about:**

- Pre-existing audits already cover engineering / security / PWA infrastructure thoroughly. This audit avoids duplicating them.
- The Public App is genuinely close to production-quality. The bottleneck for the ecosystem is the Pro Dashboard's perceived premium-ness, not its engineering.
- Shipping PWA before the brand reskin would lock in a sub-premium feel for paying users on their home screens. Sequencing matters.

---

**End of audit. No code modified. No PWA implementation started.**

Next deliverable expected: implementation kickoff for whichever Sprint A items the user approves.
