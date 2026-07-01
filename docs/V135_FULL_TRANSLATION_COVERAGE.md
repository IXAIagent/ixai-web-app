# V13.5 Full Translation Coverage Program

Review date: 2026-07-01

## Background

V13 Sprint 1 through Sprint 4 established the shared locale provider, dictionary namespaces, region / currency display foundation, and the first authenticated Workspace translation repairs. Translation Maintenance Batch 1, Batch 2, and Batch 3 then confirmed that deeper authenticated Workspace pages still needed source-level coverage work, especially Risk, Intelligence, Settings diagnostics, and non-English locale packs.

V13.5 continues that maintenance track as a product translation coverage program. It is not a product feature sprint and does not claim every historical content surface is fully translated.

## Scope

Covered routes and surfaces:

- Public landing and shared navigation dictionary coverage.
- Workspace navigation dictionary coverage.
- `/my-ixai/home`
- `/my-ixai/settings`
- `/my-ixai/health`
- `/my-ixai/beta`
- `/my-ixai/risk`
- `/my-ixai/intelligence`
- Shared status, action, label, risk, intelligence, and settings diagnostics copy.

Locales covered:

- `zh-TW`
- `zh-CN`
- `en-US`
- `ja-JP`
- `ko-KR`

## Changes Applied

- Added locale-specific dictionary pack mapping for `zh-CN`, `ja-JP`, and `ko-KR` instead of mapping those locales directly to `zh-TW` or `en-US`.
- Expanded `risk` dictionary keys for visible Risk Center titles, summary cards, status labels, buttons, empty states, and disclaimers.
- Expanded `intelligence` dictionary keys for Intelligence Center hero copy, summary cards, readback sections, empty states, and CTA labels.
- Expanded `settings` dictionary keys for runtime-safe diagnostics cards and manual diagnostics control copy.
- Wired Settings runtime diagnostics UI to `useTranslation("settings")`.
- Wired high-exposure Risk Center UI labels to `useTranslation("risk")`.
- Wired high-exposure Intelligence Center UI labels to `useTranslation("intelligence")`.
- Preserved engine output contracts and localized display labels only at the UI layer.

## Hard-Coded Scan Summary

The source scan targeted hard-coded English strings in:

- `app/**/*.tsx`
- `components/**/*.tsx`
- `src/lib/**/*.ts`
- `src/lib/**/*.tsx`

High-priority findings addressed in this batch:

- Settings diagnostics card titles and helper copy.
- Risk Center hero, summary cards, Risk Engine summary, section titles, empty states, and CTA copy.
- Intelligence Center hero, summary cards, readback sections, empty states, and CTA copy.
- Non-English locale mapping for `zh-CN`, `ja-JP`, and `ko-KR`.

Remaining hard-coded strings are mostly:

- Authored public/editorial content.
- Internal diagnostics details.
- Engine-generated deterministic messages.
- Compliance disclaimers that need product/legal review before localization changes.
- Legacy preview/admin surfaces outside the authenticated Workspace priority path.

## Error And Fallback Policy

V13.5 does not change runtime error handling, Supabase behavior, auth behavior, API contracts, service worker behavior, valuation logic, risk scoring logic, FCN engine logic, market provider logic, broker/trading behavior, billing, scheduler, notification delivery, or AI provider behavior.

Translation fallback remains dictionary-based:

- Missing keys still return the explicit fallback or `namespace.key`.
- Engine output remains stable.
- Display mapping owns user-facing localization.

## Validation Checklist

Required validation:

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

Manual verification recommended after deploy:

- Switch `zh-TW`, `zh-CN`, `en-US`, `ja-JP`, and `ko-KR`.
- Open Public Landing.
- Open `/my-ixai/home`.
- Open `/my-ixai/settings`.
- Open `/my-ixai/risk`.
- Open `/my-ixai/intelligence`.
- Confirm no raw i18n keys render.
- Confirm no missing translation warnings, hydration mismatch, runtime fatal error, or route instability.

## Out Of Scope

- Auth changes.
- Supabase schema, migrations, RLS, or API contract changes.
- Valuation engine changes.
- Risk scoring logic changes.
- FCN engine changes.
- Market provider behavior changes.
- Broker, trading, recommendations, billing, scheduler, notification delivery, or AI provider changes.
- Full manual translation of every historical article, admin tool, or legacy preview page.

## Next Recommended Work

- Signed-in production Workspace visual QA for all five locales.
- Targeted FCN deep-page translation cleanup.
- Targeted Portfolio / Input form long-tail translation cleanup.
- Editorial/public long-form content localization policy.
