# v1.67.2 — Account Icon Cleanup

## Purpose

v1.67.1 promoted the App to Pro SSO launch CTA, but `/account` still had a few lower-page icon treatments that did not consistently follow the shared icon system. The remaining risk was concentrated in the `關注清單與接收偏好` section and its child components.

v1.67.2 is a focused visual cleanup only.

## Scope

Changed account-related light-card icons only:

- `components/account/watchlist-intelligence-lite.tsx`
- `components/intelligence/line-delivery-foundation-card.tsx`
- Project docs / QA record

Not changed:

- SSO logic.
- `/api/pro/launch`.
- Legacy Pro receive route.
- Pro CTA placement.
- Backend.
- Auth.
- Daily / Weekly generation.
- Provider logic.
- FCN education content.
- Page layout.

## Icon Rule Applied

Any icon used as a card / section marker on `/account` light surfaces must use the shared `FeatureIcon` primitive or the exact shared visual rule:

- forest background.
- gold or cream glyph.
- visible border.
- minimum 32px.
- no custom black square.
- no pale line icon on cream.

Inline button glyphs remain allowed when they follow button text color and are not standalone card markers.

## Sources Fixed

`WatchlistIntelligenceLite`:

- `ListChecks` section marker for `你的關注清單記憶`.
- `LineChart` section marker for `建議閱讀路徑`.

`LineDeliveryFoundationCard`:

- Header `MessageCircle` wrapper.
- `Clock8` section marker for `偏好類型`.
- `ShieldCheck` disclaimer icon.

## QA Notes

Unauthenticated visual QA cannot reach the logged-in `/account` lower workspace content because the account route renders the account-entry shell. The code-level grep confirms the lower account section now uses `FeatureIcon` for card / section marker icons.

Authenticated manual QA should confirm that the `IXAI 正在整理你的市場記憶` and `LINE 情報接收偏好` sections no longer show off-style custom icon blocks.

## Rollback Plan

If the updated icon treatment creates visual regression:

1. Revert `components/account/watchlist-intelligence-lite.tsx`.
2. Revert `components/intelligence/line-delivery-foundation-card.tsx`.
3. Keep v1.67.0 / v1.67.1 SSO launch and CTA promotion changes intact.
4. Re-run lint, build, diff check, mobile QA, and visual QA.
