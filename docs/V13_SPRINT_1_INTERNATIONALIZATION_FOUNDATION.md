# V13 Sprint 1 — Internationalization Foundation

## Background

V12 Runtime Stabilization is complete. V14 Beta Sprint 1, Sprint 2, Sprint 3, and Beta Release Review are complete. IXAI now returns to the V13 internationalization mainline.

V13.0 established the first shared locale foundation. V13 Sprint 1 expands that foundation into a more complete, extensible i18n architecture for Public App and Workspace surfaces.

## Scope

Included:

- Shared namespace dictionary layer.
- Locale key and namespace conventions.
- Translation helper.
- Translation packs for `zh-TW` and `en-US`.
- Compatibility fallback packs for the previously supported locale options.
- `LocaleContext`, `LocaleProvider`, `useLocale()`, and `useTranslation()`.
- Shared Language Switcher.
- localStorage + cookie locale persistence.
- Workspace wiring for Home, Settings, Health, and Beta.
- Public wiring for Landing, Navigation, and Footer.

Not included:

- Full page-by-page translation.
- Region formatting.
- Currency formatting.
- Market-localized content behavior.
- Supabase preference sync.
- Auth, RLS, schema, migration, membership, billing, broker, trading, recommendation, scheduler, delivery, AI provider, OpenAI, Portfolio engine, FCN engine, Risk engine, or Intelligence engine changes.

## Dictionary Layer

Dictionary source:

```text
src/lib/i18n/dictionaries.ts
```

Namespaces:

- `common`
- `navigation`
- `workspace`
- `settings`
- `health`
- `beta`
- `errors`
- `buttons`
- `labels`

Locale key convention:

```text
namespace.camelCaseKey
```

Examples:

- `navigation.workspaceHome`
- `workspace.heroTitle`
- `settings.languageTitle`
- `health.refresh`
- `beta.dashboardTitle`
- `buttons.changeLanguage`

The dictionary layer also keeps legacy aliases such as `dictionary.publicNav`, `dictionary.workspaceNav`, `dictionary.settingsLanguage`, and `dictionary.language` so existing components can migrate gradually.

## Translation Packs

V13 Sprint 1 includes full foundation packs for:

- `zh-TW`
- `en-US`

The existing locale options remain available:

- `zh-CN`
- `ja-JP`
- `ko-KR`

Those compatibility locales currently reuse the foundation fallback packs and remain candidates for fuller translation in later V13 work.

## Locale Provider

Shared provider:

```text
LocaleProvider
```

Shared hooks:

```text
useLocale()
useTranslation(namespace)
```

The provider is mounted at the root layout so Public App and Workspace share the same locale state.

## Language Switcher

The shared Language Switcher remains:

```text
components/i18n/language-switcher.tsx
```

It supports compact and full modes. At minimum, the Sprint 1 foundation supports:

- 繁體中文
- English

The UI still lists the existing V13.0 locale options for continuity.

## Locale Persistence

Storage key:

```text
ixai.locale
```

Cookie:

```text
ixai.locale
```

Policy:

- localStorage is the primary browser persistence layer.
- Cookie is written as a same-site readiness layer.
- Unsupported locale values fall back to `zh-TW`.
- Server fallback remains `zh-TW`.
- No Supabase read or write is enabled.

## Workspace Integration

Sprint 1 wires the shared locale system into:

- Workspace Home.
- Workspace Settings.
- Workspace Health Center.
- V14 Beta Readiness Dashboard.
- Desktop Workspace navigation.
- Mobile Workspace drawer.
- Mobile Workspace navigation where already connected.

The Home and Settings pages include an i18n foundation status card to prove the same provider and Language Switcher work inside Workspace surfaces without converting full server pages into client-only pages.

## Public Integration

Sprint 1 wires the shared locale system into:

- Public Landing hero copy and CTA labels.
- Public desktop navigation.
- Public mobile drawer and mobile navigation where already connected.
- Public Footer disclaimer and Pro link label.

Full Public page body translation is intentionally deferred.

## Validation Checklist

Required:

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

Manual expectations:

- Public Landing renders.
- Workspace Home renders.
- Workspace Settings renders.
- Workspace Health renders.
- Workspace Beta renders.
- Language Switcher changes connected labels.
- Locale persists after refresh through localStorage + cookie.
- No hydration warning.
- No runtime error.

## Sprint 2 Recommendation

V13 Sprint 2 should cover:

- Region preference foundation.
- Currency display foundation.
- Locale-aware number/date formatting helpers.
- Market-region label conventions.
- More complete page dictionary migration for the connected V13 Sprint 1 surfaces.

V15 remains unchanged and should not be pulled into this i18n Sprint.
