# IXAI v1.65.0 — Pro Module Product Pages Redesign

Status: UX / product communication implementation plan and release record.

v1.65.0 redesigns `/pro`, `/portfolio`, and `/risk` as product-value pages. The goal is to help Taiwan users understand what IXAI Pro is, why it matters, and why Portfolio / FCN / Risk belong in the Pro layer instead of reading like empty permission skeletons.

## 1. Current Problem

After v1.64.2, icon contrast is stable, but the Pro module pages still read too much like gated implementation surfaces:

- `/pro` explains account linking and test status before clearly explaining product value.
- `/portfolio` and `/risk` still use `FeatureGatedPage`, so users see permission / locked framing before understanding what the product solves.
- CTA hierarchy is too technical: users see access state, but not why they should apply for Pro testing or consultant service.
- FCN, Portfolio, and Risk appear as equal modules, even though FCN monitoring is the strongest product wedge for the target Taiwan investor audience.

## 2. Why Icon Fixes Were Not Enough

v1.64.1 and v1.64.2 fixed low-contrast icons and codified the shared `FeatureIcon` system. That made the UI readable, but it did not fix the page narrative.

Readable icons do not answer:

- What problem does IXAI Pro solve?
- Why is Pro different from the public App?
- Why should FCN investors care?
- What will Portfolio Analysis and Risk Center actually help monitor?
- Why should a user apply for Pro testing or book a consulting review?

v1.65.0 therefore changes page structure and copy, not just visual treatment.

## 3. New Page Strategy

Role split:

```text
App = education / public intelligence / lead capture
Pro = paid professional monitoring workspace
Consulting = personalized high-touch advisory service
```

Page strategy:

- `/pro`: conversion page for IXAI Pro as the advanced monitoring workspace.
- `/portfolio`: product-value page explaining future Portfolio Analysis, not a locked placeholder.
- `/risk`: product-value page explaining Risk Center value, not a locked placeholder.
- `/fcn`: remains education / introduction per v1.63.1 and v1.64.0. FCN Monitoring is described as a Pro capability.

## 4. Pro Positioning

Hero message:

> IXAI Pro：為需要持續監控風險的投資人打造。

IXAI Pro concentrates:

- FCN Monitoring: KI / KO, Worst-of, coupon observation dates, underlying concentration.
- Portfolio Analysis: asset allocation, positions, concentration, overlap.
- Risk Center: market regime, scenario monitoring, AI risk alerts.

The Pro page should not lead with "please link account" or "beta skeleton." Account-link state may remain in `/account`, but `/pro` should explain value first.

## 5. Portfolio Positioning

Portfolio Analysis should help users understand risk across products:

- Stocks, ETFs, crypto assets, and FCNs can overlap.
- Risk is often thematic rather than position-by-position.
- AI / tech exposure, USD liquidity, crypto risk, and FCN underlyings can interact.

Example framing:

> If an investor holds TSLA stock, an AI ETF, and an FCN linked to TSLA, the products look different but may still concentrate on the same risk source.

Actual monitoring remains Pro-only and future gated.

## 6. Risk Positioning

Risk Center should explain why market risk cannot be reduced to one stock price:

- Rates, USD, tech valuations, crypto liquidity, and geopolitics can all affect portfolio risk.
- FCN investors need visibility into Worst-of deterioration and KI distance.
- Risk Center is a monitoring / awareness workflow, not a trading signal engine.

Example framing:

> If market volatility rises while an FCN Worst-of underlying approaches KI, investors should revisit total exposure instead of only looking at coupon.

## 7. App vs Pro Separation

App provides:

- Public market intelligence.
- Daily / Weekly reading.
- FCN education.
- Account and membership entry.
- Lead capture into Pro and consulting.

Pro provides:

- Advanced monitoring workspace.
- Portfolio / FCN / Risk modules.
- Future paid or invited beta access.

Consulting provides:

- Human review.
- FCN health check.
- Portfolio diagnosis.
- High-touch advisory service.

## 8. CTA Strategy

Primary CTAs:

- `申請 Pro 測試`
- `預約 FCN 健檢`
- `預約投資組合診斷`
- `預約風險健檢`
- `了解顧問服務`

CTA rules:

- Use `/account` for Pro testing / account path.
- Use `/feedback?intent=...` for consulting lead capture.
- Do not imply Stripe, paid checkout, broker connection, or live monitoring.

## 9. Files Expected To Change

- `app/pro/page.tsx`
- `app/portfolio/page.tsx`
- `app/risk/page.tsx`
- `scripts/qa-mobile.mjs`
- `docs/PROJECT_CONTEXT.md`
- `docs/ROADMAP.md`
- `docs/VERSION_HISTORY.md`

Optional only if needed:

- `components/pro/pro-workspace-hub.tsx`

## 10. Rollback Plan

If v1.65.0 causes UX or QA regressions:

1. Revert `/pro`, `/portfolio`, and `/risk` route files to v1.64.2.
2. Restore `scripts/qa-mobile.mjs` expectations for gated-page copy.
3. Keep this document as product role source-of-truth.
4. Re-run lint, build, diff check, mobile QA, and visual QA.

Rollback is file-level only. No auth, backend, data, schema, SSO, provider, or content-engine state is touched.

## 11. Out Of Scope

- SSO.
- Auth / Supabase / JWT.
- Backend / legacy Pro.
- Daily / Weekly generation.
- Provider ingestion.
- Stripe / payment.
- Broker integration.
- Real portfolio / FCN data.
- Trading features.
- Investment advice.
