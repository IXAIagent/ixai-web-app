# V13 Sprint 2 — Region / Currency / Localization

## Background

V13 Sprint 1 completed the shared internationalization foundation: namespace dictionaries, `LocaleProvider`, `useTranslation()`, Language Switcher, and shared Public / Workspace locale persistence.

V13 Sprint 2 completes the first region, currency, and localization display foundation. It is formatting and preference infrastructure only. It does not add exchange rates, change valuation engines, or introduce investment features.

## Scope

Included:

- Region metadata for `TW`, `US`, `HK`, `JP`, `KR`, and `EU`.
- Currency metadata for `USD`, `TWD`, `HKD`, `JPY`, `EUR`, and `KRW`.
- Intl-based formatting helpers:
  - `formatCurrency()`
  - `formatCurrencyCompact()`
  - `formatNumber()`
  - `formatPercent()`
  - `formatDate()`
  - `formatDateTime()`
  - `formatRelativeDateLabel()`
- Local-only selected region and display currency preferences.
- Persistence through `ixai.region` and `ixai.currency` localStorage + cookie keys.
- `LocalizationProvider` and `useLocalization()`.
- Workspace Settings Region / Currency / Localization card.
- Lightweight display wiring for Public Landing, Footer, Workspace Home, Workspace Settings, Health Center, and Beta Dashboard.
- zh-TW / en-US dictionary updates for localization labels and examples.

Not included:

- Real-time exchange rates.
- Exchange-rate provider.
- Portfolio Valuation Engine changes.
- FCN / Portfolio / Risk engine logic changes.
- Live market provider behavior changes.
- Supabase preference sync.
- Auth, RLS, schema, migration, API contract, billing, broker, trading, recommendation, scheduler, Telegram, LINE, email delivery, AI provider, OpenAI, or LLM behavior changes.

## Region Foundation

Region metadata lives under:

```text
src/lib/i18n/regions.ts
```

Supported regions:

- `TW` — Taiwan
- `US` — United States
- `HK` — Hong Kong
- `JP` — Japan
- `KR` — Korea
- `EU` — Europe

Metadata includes:

- region code
- display name
- default locale
- default currency
- default timezone
- market label
- date format style
- number format style

## Currency Foundation

Currency metadata lives under:

```text
src/lib/i18n/currencies.ts
```

Supported display currencies:

- `USD`
- `TWD`
- `HKD`
- `JPY`
- `EUR`
- `KRW`

Metadata includes:

- currency code
- symbol
- display name
- decimal precision

The formatting helpers use `Intl.NumberFormat`. They do not convert values between currencies and do not fetch exchange rates.

## Date / Time / Number Localization

Shared helpers live under:

```text
src/lib/i18n/formatters.ts
```

The helpers use locale and region metadata to format dates, date-times, numbers, percentages, currency, and compact currency display.

`formatRelativeDateLabel()` is deterministic and intentionally simple:

- Today
- Tomorrow
- Yesterday
- In N days
- N days ago
- fallback formatted date

## Region / Currency Preference

Local-only preference keys:

```text
ixai.region
ixai.currency
```

Cookie keys:

```text
ixai.region
ixai.currency
```

Policy:

- localStorage is the primary browser persistence layer.
- Cookie is the secondary readiness layer.
- Unsupported region falls back to `TW`.
- Unsupported currency falls back to `TWD`.
- No Supabase read.
- No Supabase write.

## Settings Integration

Workspace Settings now includes a Region / Currency / Localization card showing:

- Current locale.
- Current region.
- Current display currency.
- Default timezone.
- Supported regions.
- Supported currencies.
- Formatting examples.

Users can switch selected region and display currency from the card. The change is display-only and persisted locally.

## Public / Workspace Wiring

Public wiring:

- Landing localization preview.
- Footer localization preview.

Workspace wiring:

- Home localization preview.
- Settings localization card.
- Health Center localization status item.
- Beta Dashboard localization display check.

These surfaces prove the formatter and preference layer can be read by Public App and Workspace without requiring full page translation.

## Boundaries

V13 Sprint 2 does not:

- Fetch real-time exchange rates.
- Add exchange-rate providers.
- Change Portfolio valuation math.
- Change FCN risk math.
- Change live market provider behavior.
- Add broker integration.
- Add trading.
- Add recommendation logic.
- Add scheduler, Telegram, LINE, email, or push delivery.
- Change auth, RLS, schema, migrations, API contracts, membership, billing, AI provider, OpenAI, or LLM behavior.

## Validation Checklist

Required:

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

Browser smoke:

- Public Landing loads.
- Language Switcher still changes connected labels.
- Region / Currency preference can be changed.
- Refresh preserves `ixai.region` and `ixai.currency`.
- Workspace Settings localization card renders.
- `/my-ixai/home` loads.
- `/my-ixai/settings` loads.
- `/my-ixai/health` loads.
- `/my-ixai/beta` loads.
- Console errors = 0.
- Page errors = 0.
- No hydration mismatch.
- No runtime fatal error.

## V13 Mainline Status

V13 mainline foundation is complete after Sprint 2:

- V13.0 Locale foundation.
- V13 Sprint 1 i18n dictionary/provider foundation.
- V13 Sprint 2 region/currency/localization display foundation.

Deeper dictionary migration can continue as maintenance, but it is not a blocker for the next product track.

## Recommended Next Phase

Recommended next options:

1. V14 Beta Production Verification / Invite-only Pilot.
2. V15 AI Wealth OS planning.
3. Deeper dictionary migration as maintenance.
