# UX Product Role Correction v1.63.1

Status: product-role correction and UX cleanup implementation record.

v1.63.1 corrects a product role confusion introduced by the v1.63.0 Taiwan UX cleanup. The issue was not localization quality; it was product positioning. The App should remain the public market intelligence, education, membership, and account entry surface. IXAI Pro is the advanced investment workspace. FCN Monitoring belongs to Pro, not to the free App surface.

## 1. Product Role Boundary

### IXAI App

The App is the public and member entry surface.

It should provide:

- Public market intelligence.
- Daily Brief / Weekly Intelligence reading.
- FCN education and risk-awareness concepts.
- Account setup and preference memory.
- Membership / Pro connection status.
- Clear routes into IXAI Pro.

It should not provide:

- Free FCN monitoring workspace.
- Personal FCN position monitoring.
- Personal portfolio analysis.
- Paid Pro feature simulation that looks like a live product.
- Engineering / backend / entitlement language for normal users.

### IXAI Pro

IXAI Pro is the advanced investment workspace.

It may eventually provide:

- Portfolio Intelligence.
- FCN Monitoring.
- Risk Engine.
- Personal market memory.
- AI risk alerts.

Current Pro status:

- App account / backend account link is connected.
- Membership and entitlement foundation exists.
- Pro workspace remains beta / gated.
- No Stripe, broker connection, real portfolio data, real FCN data, trading execution, or investment advice is live.

## 2. FCN Page Positioning

`/fcn` must be an FCN education and introduction page.

It should explain:

- What an FCN is.
- Why FCN monitoring matters.
- KI / KO / Worst-of / coupon calendar concepts.
- Why personal FCN monitoring belongs in IXAI Pro.
- How to learn more about IXAI Pro or request Pro testing.

It must not render:

- App-local FCN Monitoring skeleton.
- FCN Holdings placeholder as if it were a free feature.
- KI / KO Watch as an active App workspace.
- Worst-of Monitor as a free App module.

Reason:

FCN Monitoring is a personal structured-product workflow. Even when framed as risk monitoring, it can imply personal product risk conclusions. It must stay in the Pro / paid / beta layer and remain clearly non-advisory.

## 3. Daily / Weekly Page Cleanup

Daily and Weekly archive pages should prioritize reading.

They should show:

- A short hero.
- Latest / archive entry points.
- Clear CTA into the actual Daily / Weekly content.

They should not foreground:

- Public Intelligence Engine architecture cards.
- Module maps.
- Provider / coverage / engine explanation.
- Long educational product architecture.

Those details belong in admin, docs, or product explainer surfaces, not the primary reading pages.

## 4. Pro Page Icon / CTA Rules

`/pro` may show the Pro workspace and the existing Pro Lab entry, but all icons and CTAs must remain legible on light cards.

Rules:

- Icon containers on light cards should use forest / cream contrast or stronger borders.
- Key buttons must have visible text labels.
- Do not rely on pale gold line icons alone.
- Disabled, beta, and locked states must be visually distinct.
- Main CTA wording should be clear: `開啟 IXAI Pro`, `查看 Pro 測試區`, `綁定帳號`.

## 5. Account Information Architecture

`/account` should be organized around user mental models:

1. 帳號狀態
2. Pro 串接
3. 會員方案
4. 功能權限

Normal users should not see raw engineering terms:

- backend
- entitlement
- feature gate
- skeleton
- API reason

Acceptable user-facing replacements:

- 系統連線
- 帳號綁定
- 會員方案
- 功能權限
- Pro 保留功能

## 6. Pages Corrected In v1.63.1

- `/fcn`
- `/daily-brief`
- `/weekly-brief`
- `/pro`
- `/account`

## 7. Rollback Plan

If v1.63.1 causes a UX or QA regression:

1. Restore `/fcn` to the previous gated route.
2. Re-add the removed archive-page cards only if the reading pages lose required navigation.
3. Restore prior account card ordering.
4. Re-run `npm run lint`, `npm run build`, `git diff --check`, and mobile QA.
5. Keep this document as the source-of-truth for App / Pro / FCN product role separation.

## 8. Out Of Scope

- SSO.
- Auth / Supabase / JWT changes.
- Daily / Weekly generation engine.
- Provider logic.
- Backend.
- Legacy Pro.
- Stripe.
- Portfolio / FCN / Risk real data.
- Full app redesign.
