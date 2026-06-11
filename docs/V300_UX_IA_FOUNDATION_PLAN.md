# v3.00 UX / IA Foundation Plan

Date: 2026-06-11

Objective: prepare IXAI for the transition from Engine Foundation architecture to Product Workspace architecture.

This release does not add investment features, market data providers, broker integrations, recommendation logic, auth changes, schema changes, migrations, or API routes.

## 1. Product Principle

v3.00 does not add features. It reorganizes product surfaces.

The reason is practical:

- Portfolio Center is overloaded.
- The App now has enough engines and foundations.
- Users need a workspace structure, not another technical module.
- Future development should move in small, verifiable slices.

## 2. Public Layer Preservation

The public content layer remains separate from the workspace layer.

Public routes remain:

| Route | Role |
| --- | --- |
| `/` | Market homepage |
| `/daily-brief` | Daily Brief |
| `/market` | Market overview |
| `/weekly-brief` | Weekly Intelligence |
| `/fcn` | FCN education |
| `/about` | About I-Xuan |

Do not remove, redirect, or merge these routes into `/my-ixai`.

## 3. Workspace Route Foundation

v3.00 introduces the route foundation for:

```text
/my-ixai
/my-ixai/home
/my-ixai/portfolio
/my-ixai/risk
/my-ixai/fcn
/my-ixai/intelligence
/my-ixai/settings
```

The new routes are placeholders only. They establish information architecture and navigation, not business logic.

## 4. Center Responsibilities

### Home

Future logged-in landing page.

Owns:

- Portfolio summary.
- Risk summary.
- FCN alerts.
- Intelligence summary.

### Portfolio Center

Owns:

- Assets.
- Positions.
- Market data.
- Valuation.
- Allocation.
- Exposure.
- Asset input and import entry points.

No longer the future owner of:

- Concentration.
- Correlation.
- Scenario.
- Stress Test.
- FCN Risk.
- News / commentary.

### Risk Center

Owns:

- Concentration.
- Correlation.
- Scenario.
- Stress Test.
- Risk summaries.
- Monitoring prompts.

### FCN Center

Owns:

- FCN positions.
- FCN Risk.
- Worst-of.
- KI / KO monitoring.
- Observation schedules.
- Coupon schedules.
- Global FCN support.

### Intelligence Center

Owns:

- Daily Intelligence.
- Weekly Intelligence.
- News.
- Commentary.
- Recommendation surfaces.
- Social Pack distribution as a reviewed intelligence asset.

### Settings

Owns:

- Account.
- Membership.
- Notifications.
- Language.
- Region.
- Broker connections.
- Data privacy and preferences.

## 5. Global Requirements

The IA must remain compatible with:

- United States.
- Taiwan.
- Hong Kong.
- China.
- Japan.
- Korea.
- Europe.
- Singapore.
- Crypto assets.
- FCN structured products.

The IA must remain compatible with:

- `zh-TW`.
- `zh-CN`.
- `en-US`.
- `ja-JP`.
- `ko-KR`.

No center may assume US-only, Taiwan-only, English-only, stock-only, or FCN-only workflows.

## 6. Route Impact

New route placeholders:

- `/my-ixai`
- `/my-ixai/home`
- `/my-ixai/risk`
- `/my-ixai/fcn`
- `/my-ixai/intelligence`
- `/my-ixai/settings`

Existing routes preserved:

- `/my-ixai/portfolio`
- `/my-ixai/input`
- `/my-ixai/portfolio/assets`
- `/portfolio`
- `/risk`
- `/fcn`
- `/pro`
- `/daily-brief`
- `/weekly-brief`
- `/market`

## 7. Navigation Impact

Desktop sidebar and mobile drawer gain workspace entries:

- Workspace Home.
- Portfolio Center.
- Risk Center.
- FCN Center.
- Intelligence Center.
- Asset Input.
- Portfolio Assets.
- Settings.

Mobile bottom nav remains unchanged because its `我的` item already treats `/my-ixai` routes as active.

## 8. Component Decomposition Plan

Do not split `PortfolioCenterDashboard` in v3.00 foundation. Use v3.00 to mark the ownership boundaries first.

Recommended follow-up:

1. Extract Portfolio-only cards into a Portfolio Center component group.
2. Move concentration, correlation, scenario, and stress-test sections to Risk Center.
3. Move FCN-specific sections to FCN Center.
4. Move news, commentary, and recommendation surfaces to Intelligence Center.
5. Move membership, notification, language, region, and broker connection surfaces to Settings.

## 9. Mobile UX Preparation

Requirements:

- Placeholder routes must be single-column on mobile.
- Navigation must not create horizontal overflow.
- Cards must use responsive grids.
- CTA links must remain tappable at 390px.
- Bottom nav should continue to identify `/my-ixai/*` as the user's workspace.

## 10. Explicitly Out of Scope

v3.00 foundation does not include:

- New investment features.
- New market data providers.
- Broker integrations.
- Recommendation logic changes.
- Schema changes.
- Migrations.
- API route changes.
- Auth changes.
- Membership or entitlement logic changes.
- Portfolio Center module relocation.
- Public route removals.

## 11. Validation Checklist

Required:

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

Recommended manual checks:

- `/my-ixai`
- `/my-ixai/home`
- `/my-ixai/portfolio`
- `/my-ixai/risk`
- `/my-ixai/fcn`
- `/my-ixai/intelligence`
- `/my-ixai/settings`

Viewports:

- 375px.
- 768px.
- 1280px.

## 12. Next Step

After v3.00 is reviewed visually, proceed to v3.01 as the first actual decomposition step. v3.01 should move one module family only, preferably Risk Center ownership of Concentration / Correlation / Scenario / Stress Test.
