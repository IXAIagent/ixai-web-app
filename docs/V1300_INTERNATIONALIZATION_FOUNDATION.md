# V13.0 Internationalization Foundation

## Background

IXAI is a Global Multi-Asset, Multi-Broker, Multi-Market, Multi-Language AI Risk Platform. The product direction includes Traditional Chinese, Simplified Chinese, English, Japanese, and Korean while keeping engines market-agnostic and non-advisory.

V13.0 establishes the first shared internationalization foundation for the Public App and Workspace. It is not a full-site translation release and does not add product features.

## Why Public Language Switcher Is Not Public Settings

Public users should be able to choose a language without registering or entering Workspace. A full Public Settings page would blur the public website and Workspace settings boundaries.

V13.0 therefore adds a compact Public Language Switcher inside existing public navigation surfaces. Workspace Settings remains the place where authenticated users can manage the same locale state in a fuller settings card.

## Shared Locale State Design

The shared locale layer lives under:

```text
src/lib/i18n/
├─ locales.ts
├─ locale-store.ts
├─ dictionaries.ts
├─ use-locale.ts
└─ index.ts
```

Shared component:

```text
components/i18n/language-switcher.tsx
```

Public and Workspace surfaces both use this component and the same locale store.

## Supported Locales

Default:

- `zh-TW` — 繁體中文

Supported:

- `zh-CN` — 简体中文
- `en-US` — English
- `ja-JP` — 日本語
- `ko-KR` — 한국어

Unsupported locale values fall back to `zh-TW`.

## Storage Policy

Storage key:

```text
ixai.locale
```

Cookie:

```text
ixai.locale
```

Behavior:

- Locale is stored in browser `localStorage`.
- Locale is also written to a same-site cookie for future server/readiness use.
- No Supabase read.
- No Supabase write.
- No `ixai_user_preferences` optional sync.
- Browser language detection is a future option, but V13.0 does not auto-overwrite a user's explicit selection.
- SSR and hydration must be safe; server fallback is `zh-TW`.

## Public / Workspace Behavior

Public App:

- Public users can change language without registration.
- Desktop public sidebar includes a compact Language Switcher near the lower navigation area.
- Mobile drawer includes the same Language Switcher near the footer.
- Public navigation labels connected in V13.0 read the shared locale state.
- No Public Settings page is added.

Workspace:

- Workspace sidebar and mobile navigation labels connected in V13.0 read the same locale state.
- Workspace Settings Language card is now available.
- The Language card shows the current locale and a full Language Switcher.
- Workspace Settings explains that Public App and Workspace share this preference.
- Workspace Settings also states this version uses localStorage + cookie and may sync to user preferences in the future.

## Translation Scope

V13.0 translated only the foundation-level labels:

- Public navigation labels.
- Workspace sidebar labels.
- Mobile drawer labels.
- Mobile bottom navigation labels.
- Language Switcher labels.
- Workspace Settings Language card copy.

Not translated in V13.0:

- Daily Brief article content.
- Weekly Intelligence article content.
- FCN / Portfolio / Risk data.
- Symbols, tickers, product codes, issuer names, or market data.
- Admin editorial content.
- Full Public App pages.
- Full Workspace page bodies.

Unconnected copy remains in the original language.

## Out Of Scope

- No full content translation.
- No product feature work.
- No auth behavior change.
- No RLS / schema / migration change.
- No Supabase preference sync.
- No billing.
- No broker, trading, or recommendation behavior.
- No scheduler or notification delivery activation.
- No changes to Portfolio / FCN / Risk / Intelligence engines.

## Validation Checklist

Required local validation:

- `git diff --check`
- `npm run lint`
- `npm run build`
- `QA_PORT=3001 npm run qa:mobile`

Manual behavior checklist:

- Public user opens `/`, switches to English, refreshes, and still sees English on connected navigation labels.
- Public user closes/reopens the browser and locale persists through `ixai.locale`.
- Authenticated user switches on Public App, enters Workspace, and Workspace Settings Language shows the same locale.
- Workspace user switches to Japanese, returns to Public App, and connected public navigation labels show Japanese.
- Invalid `localStorage.setItem("ixai.locale", "invalid")` falls back to `zh-TW` without crashing.

## Future Work

- Expand dictionaries page-by-page.
- Add server-side locale reading where useful.
- Add browser-language suggestion without overwriting explicit user choice.
- Add user preference persistence only after a separate Supabase/RLS review.
- Add QA automation for locale switching and refresh persistence.
