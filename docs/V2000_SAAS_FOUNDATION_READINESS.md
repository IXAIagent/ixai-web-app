# V20.00 SaaS Foundation Readiness

## Goal

V20 adds SaaS readiness metadata for future plans, usage, subscription, and team workspace work.

## Scope

- Adds `src/lib/saas-foundation/`.
- Adds subscription, usage, team, and plan readiness metadata.
- Surfaces Program A status in Workspace Home and Settings.

## Boundaries

- No Stripe or billing provider integration.
- No subscription enforcement.
- No entitlement enforcement.
- No auth, membership, RLS, schema, SQL, migration, or payment behavior changes.

## Next

Future SaaS platform work can add controlled persistence, billing, and entitlement flows after explicit review.
