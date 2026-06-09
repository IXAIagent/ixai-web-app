# v1.86 — Membership & Entitlement Foundation

## Objective

v1.86 establishes the first IXAI SaaS permission foundation after Portfolio, FCN, Worst-of, Risk Engine, Intelligence Layer, and Portfolio Dashboard are already present.

This version does not implement payment. It only defines membership tiers, entitlement calculation, feature gating, and UI plan display so future Free / Basic / Pro workflows can be introduced without rewriting Portfolio / FCN / Risk logic.

## Scope

- Define App membership tiers: `free`, `basic`, `pro`.
- Define entitlement matrix:
  - Portfolio.
  - FCN.
  - Risk.
  - Pro.
- Add additive dashboard fields:
  - `membershipTier`.
  - `entitlements`.
- Add `/pro` visible membership guard.
- Add Membership Status display on `/pro` and `/account`.
- Preserve Legacy Pro compatibility through `resolveLegacyProAccess()`.

## Out of Scope

- No Stripe.
- No LINE Pay.
- No ECPay / NewebPay.
- No OpenAI billing.
- No Supabase schema migration.
- No auth redesign.
- No Social Pack changes.
- No Daily / Weekly Intelligence changes.

## Existing Assets Used

v1.86 uses existing membership/profile assets only:

- `ixai_memberships`.
- `ixai_user_profiles` compatibility surface.

No new table is introduced.

## Membership Matrix

| Plan | Portfolio | FCN | Risk | Pro |
| --- | --- | --- | --- | --- |
| Free | Yes | Yes | Yes | No |
| Basic | Yes | Yes | Yes | No |
| Pro | Yes | Yes | Yes | Yes |

## Entitlement Fields

`src/lib/membership/entitlements.ts` exposes:

- `getMembershipTier()`.
- `getEntitlements()`.
- `resolveLegacyProAccess()`.
- `canAccessPro()`.
- `canAccessPortfolio()`.
- `canAccessFCN()`.
- `canAccessRisk()`.

The App entitlement contract is:

```ts
{
  canViewPortfolio: boolean;
  canViewFcn: boolean;
  canViewRisk: boolean;
  canViewPro: boolean;
}
```

## Legacy Pro Compatibility

`resolveLegacyProAccess()` treats legacy Pro flags as Pro access when a membership/profile-like row contains:

- `legacy_pro`.
- `legacyPro`.
- `metadata.legacy_pro`.
- `metadata.legacyPro`.
- `metadata.manual_access`.
- `metadata.preview_access`.

This preserves manual/legacy Pro compatibility without migrating Legacy Pro JWT or localStorage session architecture into the production App.

## Dashboard Extension

`src/lib/portfolio/dashboard.ts` adds:

- `membershipTier`.
- `entitlements`.

These fields are additive and do not break existing Portfolio / FCN / Risk readback response fields.

## Route Guard Behavior

`/pro` now shows a visible membership guard through `MembershipStatusCard`:

- Free / Basic users see `IXAI Pro Membership Required`.
- Pro users see Pro available.
- The guard does not redirect and therefore cannot create a redirect loop.
- Existing Pro SSO CTA remains unchanged.

Because the App's Supabase session is client-side, the MVP guard is a client-visible entitlement guard backed by the server dashboard entitlement response. Future server-enforced paid surfaces should use the same entitlement contract in API routes.

## UI

`Membership Status` appears on:

- `/pro`.
- `/account`.

It displays:

- Current Plan.
- Available Features.
- Pro locked/available state.

## Validation Checklist

- `git diff --check`.
- `npm run lint`.
- `npm run build`.

## Known Limitations

- No payment flow exists yet.
- `/pro` is still a product/conversion page with a visible Pro requirement guard; it is not a full paid-only server route.
- Backend membership route remains separate from the new App entitlement contract.
- Future paid APIs must enforce entitlement server-side and must not rely only on frontend hiding.

## Next

v1.87 should plan:

- Upgrade flow.
- Pricing page.
- Legacy Pro migration / retirement path.
- Server-enforced feature gates for paid Pro-only APIs.
