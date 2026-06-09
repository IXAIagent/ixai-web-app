# FCN Intelligence Layer v1.84

Date: 2026-06-09

## Objective

v1.84 adds the first FCN Intelligence Layer on top of:

```text
Portfolio
→ FCN Foundation
→ Worst-of Engine
→ Risk Engine
```

The layer turns deterministic FCN risk calculations into human-readable monitoring narratives.

## Scope

In scope:

- Risk narrative.
- Worst-of narrative.
- Concentration narrative.
- Near-KI narrative.
- Additive dashboard fields.
- Minimal UI on `/risk` and `/pro`.

Out of scope:

- No migration.
- No Supabase schema change.
- No auth change.
- No entitlement or membership logic.
- No AI API integration.
- No external market data API.
- No trading language.

## Data Sources

v1.84 only uses existing data:

- FCN positions.
- FCN underlyings.
- Worst-of Engine output.
- Risk Engine output.

No external market data is fetched and no generated market prices are inferred.

## Intelligence Functions

New file:

- `src/lib/fcn/intelligence.ts`

Functions:

- `buildRiskNarrative()`
- `buildWorstOfNarrative()`
- `buildConcentrationNarrative()`
- `buildNearKiNarrative()`
- `buildFcnIntelligenceSummary()`

## Dashboard Fields

Additive fields in dashboard summary:

- `intelligenceSummary`
- `riskNarrative`
- `worstOfNarrative`
- `concentrationNarrative`
- `nearKiNarrative`

Existing API fields are not removed or renamed.

## Example Output

Risk narrative:

```text
Portfolio FCN risk is moderate because part of the stored FCN set requires closer monitoring around KI distance and worst-of movement.
```

Worst-of narrative:

```text
Current weakest underlyings are MDB and AFRM, based on stored return calculations across FCN positions.
```

Concentration narrative:

```text
Portfolio exposure is concentrated in TSLA, MDB and AFRM, based on repeated FCN underlying appearances.
```

Near-KI narrative:

```text
2 FCN underlyings are currently near KI thresholds and should remain on the monitoring list.
```

## Compliance Boundary

All FCN Intelligence output must remain:

```text
Monitoring and risk-awareness only. Not investment advice.
```

The layer must not output:

- product recommendations.
- trading instructions.
- target prices.
- return promises.
- automated execution language.

## UI

The `FCN Intelligence MVP` block renders only on:

- `/risk`
- `/pro`

It does not render on `/portfolio` or `/fcn`.

## Validation

Required:

- `git diff --check`
- `npm run lint`
- `npm run build`

## Next

Recommended next step:

- v1.85 — SaaS Membership / Feature Gate.

This should gate FCN Risk and Intelligence workflows through membership / entitlement logic rather than frontend hiding alone.
