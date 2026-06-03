# IXAI v1.66.0 — Homepage Conversion Redesign

Status: implementation plan + UX source of truth.

Scope: homepage `/` conversion redesign for Taiwan investors.

Out of scope:

- SSO, Auth, Supabase, JWT.
- Backend / Pro backend / legacy Pro login.
- Daily / Weekly generation, provider ingestion, Content Engine.
- Broker integration, Stripe, payments, trading features.

## 1. Current Homepage Problem

The homepage has carried too much internal product architecture language:

- "Intelligence Layer", "Product Flow", "Public Intelligence Engine", and
  delivery/system wording read like an engineering map.
- The first screen explains IXAI as a system, but does not quickly explain
  why a Taiwan investor should care.
- FCN is present, but not framed strongly enough as the moat behind IXAI Pro.
- App, Pro, and consulting roles are mentioned, but the next action is not
  obvious enough.

The result: the page introduces IXAI, but does not convert clearly.

## 2. New Homepage Strategy

The homepage must explain in roughly 10 seconds:

1. IXAI is 一玄's AI investment intelligence assistant.
2. I-Xuan is credible because IXAI comes from FCN advisory, market monitoring,
   and risk-aware investment workflow.
3. FCN, portfolio, and risk monitoring are the advanced Pro use cases.
4. App, Pro, and consulting each have a separate role.
5. The visitor should choose one next step: read Daily Brief, learn FCN, apply
   for Pro test, or book advisory consultation.

Public homepage tone:

```text
一玄投資顧問能力 + IXAI AI 投資情報系統
```

Not:

```text
technical system diagram / product architecture page
```

## 3. Target Audience

Primary audience:

- Taiwan investors who follow US equities, Taiwan AI supply chain, ETF,
  crypto, and FCN products.
- Investors who have too much market information and need an interpretation
  workflow.
- FCN investors who understand coupon but need education around Worst-of,
  KI / KO, observation dates, volatility, and concentration risk.
- High-net-worth clients or prospective advisory clients who may need
  structured-product checkups or portfolio diagnosis.

## 4. App / Pro / Consulting Split

| Layer | Role | User Promise | CTA |
| --- | --- | --- | --- |
| App | Public intelligence + education + account activation | Read market intelligence and build investment understanding. | 閱讀每日晨報 |
| IXAI Pro | Paid / invited professional monitoring workspace | Monitor FCN, portfolio, and risk changes. | 申請 Pro 測試 |
| Consulting | High-touch advisory service | Book FCN checkup, portfolio diagnosis, or high-net-worth advisory. | 預約顧問諮詢 |

The homepage must not imply:

- Pro is automatically free.
- App gives personalized advice.
- Consulting is replaced by AI.
- IXAI provides buy/sell signals, target prices, return promises, or automated
  trading.

## 5. FCN Moat Messaging

FCN is the homepage's key differentiation point.

Required message:

- Most investors see coupon first.
- Real FCN risk sits in Worst-of, KI, KO, observation dates, volatility, and
  underlying concentration.
- App provides FCN education.
- IXAI Pro turns FCN risk into a monitoring workflow.
- Consulting provides human review for FCN checkups and portfolio diagnosis.

Headline:

```text
FCN 監控，是 IXAI Pro 的核心差異。
```

## 6. CTA Hierarchy

Primary homepage CTA:

```text
閱讀每日晨報
```

Secondary CTA:

```text
了解 FCN 監控
```

Third CTA:

```text
申請 Pro 測試
```

Final CTA cluster:

- 閱讀每日晨報
- 了解 FCN
- 申請 Pro 測試
- 預約顧問諮詢

## 7. Files Expected To Change

- `app/page.tsx`
- `components/home/intelligence-landing.tsx`
- `scripts/qa-mobile.mjs`
- `scripts/qa-visual.mjs`
- `docs/HOMEPAGE_CONVERSION_REDESIGN_V166.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/ROADMAP.md`
- `docs/VERSION_HISTORY.md`

No auth, backend, provider, or content-generation files should change.

## 8. Rollback Plan

If the new homepage underperforms or creates visual regressions:

1. Revert `components/home/intelligence-landing.tsx`.
2. Revert `app/page.tsx` metadata if needed.
3. Revert QA script expected-text changes.
4. Keep this document as product rationale unless the strategy itself changes.
5. Re-run `npm run lint`, `npm run build`, `QA_PORT=3001 npm run qa:mobile`,
   and `QA_PORT=3002 npm run qa:visual`.

Rollback does not affect data, auth, backend, SSO, Daily / Weekly generation,
or provider ingestion.
