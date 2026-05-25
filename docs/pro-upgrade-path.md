# IXAI Pro Upgrade Path

v1.37.2 adds the public Pro conversion surface and entitlement-aware UI without
Stripe, checkout, paywalls, or auth changes.

## Public vs Pro Strategy

Public Intelligence:

- Daily Brief
- Weekly Intelligence
- Market Intelligence
- FCN education
- Distribution capture
- Free membership foundation

IXAI Pro:

- Personal Portfolio Intelligence
- FCN Risk Intelligence
- AI Market Memory & Alerts
- Future premium Daily / Weekly workflows

Public builds trust and daily usage. Pro turns the same intelligence identity
into personal monitoring workflows.

## Why No Stripe Yet

The current goal is to validate conversion intent before introducing billing.
Email capture and the membership repository create a durable free member row and
store Pro waitlist intent. Stripe can later update the same `ixai_memberships`
record from trusted server webhooks.

## Waitlist Data Flow

```text
Pro CTA
  -> EmailCapture(surface = pro_waitlist)
  -> /api/distribution/subscribe
  -> ixai_distribution_subscribers metadata.intent = pro_waitlist
  -> ixai_memberships metadata.intent = pro_waitlist
  -> subscriber profile tags: pro_waitlist + pro_candidate
  -> admin membership snapshot aggregates waitlist / candidates
```

No new table is introduced in this phase.

## Entitlement-Aware UI

`src/lib/membership/entitlements.ts` centralizes pure deterministic rules:

- `canAccessPro()`
- `canAccessFCN()`
- `canAccessDailyPremium()`
- `canAccessWeeklyPremium()`
- `getPlanLabel()`
- `getEntitlementSummary()`
- `getUpgradeReason(feature)`

The UI can explain why a capability is Pro without performing async database
lookups or creating a real paywall.

## Analytics

The Pro path uses the existing analytics abstraction:

- `pro_cta_click`
- `pro_waitlist_submit`
- `pro_waitlist_success`
- `pro_waitlist_error`

Payloads include surface, requested feature, path where available, and
membership plan. Sensitive fields are still sanitized by the analytics provider.

## Future Stripe / Gated Intelligence Path

Future phases can add:

1. Stripe Checkout.
2. Verified webhook writes to `ixai_memberships`.
3. Server-side entitlement checks.
4. Premium Daily / Weekly sections.
5. FCN Risk Workspace gating.
6. Pro dashboard handoff.

Do not let client-side UI directly grant paid entitlements.
