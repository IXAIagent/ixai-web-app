# IXAI Pro Preview Dashboard

v1.37.3 adds `/pro-preview` as a sample-only product surface for the future IXAI
Pro member experience.

## Purpose

`/pro` remains the public conversion page. `/pro-preview` shows what future Pro
members may see after upgrade:

- Personal Intelligence Overview
- Portfolio Intelligence Preview
- FCN Risk Intelligence Preview
- AI Alert Preview
- Pro waitlist CTA

## Sample-Only Guardrail

The preview does not display real personal data. It does not provide investment
advice, buy/sell instructions, target prices or performance promises. All cards
are marked as preview/sample intelligence.

## Future Gated Dashboard Path

Future phases can connect this surface to:

1. Stripe or enterprise entitlement.
2. Server-side membership checks.
3. User portfolio and watchlist persistence.
4. FCN monitoring records.
5. AI alert workflows.

Until then, `/pro-preview` remains public-safe and conversion-focused.

## Why Not Replace `/pro`

The `/pro` page explains the offer and captures intent. The preview dashboard
shows the product shape. Keeping them separate makes the funnel easier to
understand:

```text
Public Intelligence
  -> /pro conversion page
  -> /pro-preview sample dashboard
  -> waitlist
  -> future paid Pro dashboard
```
