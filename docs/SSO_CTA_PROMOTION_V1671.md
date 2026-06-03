# v1.67.1 — Promote Pro SSO CTA

## Purpose

v1.67.0 added the App to Pro launch endpoint and `ProSsoLaunchButton`, but the primary `/pro` experience still led with product education and consulting CTAs. Users could miss the actual SSO launch prototype.

v1.67.1 promotes the SSO launch action into the primary user flow without changing token behavior, auth logic, backend behavior, or Legacy Pro receive logic.

## Current Problem

- `/api/pro/launch` exists.
- `ProSsoLaunchButton` exists.
- Legacy Pro `/sso/receive` exists.
- The visible `/pro` hero still led with `申請 Pro 測試`, `預約 FCN 健檢`, and `了解顧問服務`.
- `/account` rendered the launch action inside the Pro card, but the button could be visually buried below status, membership, and entitlement details.

## Fix Strategy

Make the SSO prototype visible where users naturally look first:

```text
/pro hero
Primary: 開啟 IXAI Pro
Secondary: 了解 FCN 監控
Tertiary: 預約顧問諮詢
```

For `/account`, the Pro card should show `開啟 IXAI Pro` near the top of the card, before deeper membership and entitlement details.

## Security / Scope Boundaries

This version does not change:

- `/api/pro/launch` short-lived code behavior.
- Legacy Pro `/sso/receive`.
- Supabase Auth.
- Backend account link.
- Membership / entitlement logic.
- Daily / Weekly generation.
- Provider ingestion.
- FCN education content.

## QA Requirements

- `/pro` first screen must include `開啟 IXAI Pro`.
- `/account` should include `開啟 IXAI Pro` in the Pro card when the card renders.
- If auth state blocks launch, the button fallback must tell users to sign in or use legacy Pro login.
- Visual QA should verify the visible text instead of only producing screenshots.

## Rollback Plan

If CTA promotion creates confusion or visual regression:

1. Revert `/pro` hero CTA to the v1.67.0 order.
2. Remove the top-of-card launch button from `/account`.
3. Keep `/api/pro/launch`, `ProSsoLaunchButton`, and Legacy Pro `/sso/receive` intact.
4. Re-run lint, build, diff check, mobile QA, and visual QA.
