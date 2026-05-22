# IXAI Shared Identity Layer

v1.17 prepares IXAI Public App and IXAI Pro Dashboard for future shared identity.
This document is architectural only. It does not implement cross-domain auth, payment, entitlement, or session migration.

## Current Status

- Public App supports Guest mode, localStorage watchlist, local preferences, and Supabase Auth-ready UI.
- v1.20 adds Public App `/login` and `/register` pages for Supabase email/password identity when the anon env vars are configured.
- `/account` shows whether the user is in Guest mode or signed in, plus future Watchlist sync, notification, and Pro handoff status.
- Pro Dashboard has its own login/session model and portfolio workspace.
- Public App and Pro Dashboard are connected by ecosystem navigation and CTA links.
- Watchlist, preferences, and intelligence memory are not yet shared between apps.

## Isolation Boundaries

- Public App tokens and Pro Dashboard tokens remain isolated.
- Public watchlist remains local/Supabase-ready inside the Public App only. Current user copy should say: "目前此裝置保存；登入後將逐步支援跨裝置同步。"
- Pro portfolio, FCN, and risk engine data remain inside the Pro Dashboard.
- No cross-domain cookie sharing is used in v1.17.
- v1.20 does not merge Public App and Pro Dashboard auth sessions.

## Future Shared Auth Direction

Preferred direction:

1. Standardize on one IXAI Account identity provider.
2. Use Supabase Auth or an equivalent managed auth layer as the shared account foundation.
3. Store user profile, preferences, watchlist, and intelligence memory under the same `user_id`.
4. Keep Pro entitlement separate from authentication.
5. Add role/entitlement checks only after the account foundation is stable.

v1.20 database preparation:

- `ixai_user_profiles` stores user profile metadata scoped by `auth.users.id`.
- `ixai_user_preferences` keeps existing preferred categories and adds future flags for Watchlist sync, Pro handoff, and opt-in notification preferences.
- RLS policies require `auth.uid()` to match the user-owned row.

## Session Sharing Plan

Short term:

- Keep current auth systems isolated.
- Continue showing shared identity copy and bridge UX.
- Avoid cross-domain cookie hacks.

Medium term:

- Move both apps under a shared domain strategy.
- Use a single auth domain and redirect-based login flow.
- Add account handoff after sign-in, not silent token copying.

Possible future domains:

- `ixai.ai`
- `app.ixai.ai`
- `pro.ixai.ai`

## Shared Watchlist Architecture

Future shared watchlist should support:

- symbols
- names
- asset type
- market
- user notes
- source app
- created/updated timestamps

The Public App watchlist becomes the lightweight daily habit layer.
The Pro Dashboard can later consume the same watchlist as an input to portfolio intelligence, FCN monitoring, AI risk alerts, and morning brief generation.

## Shared Intelligence Memory

Future shared memory should support:

- watched symbols
- preferred categories
- recently viewed sections
- last visit timestamp
- risk interpretation preferences
- Pro workspace context

Do not implement vector memory or AI memory until the relational account foundation is stable.

## Security Considerations

- Do not expose service role keys to the client.
- Do not share raw auth tokens across unrelated origins.
- Use RLS policies for user-owned watchlist and preference data.
- Keep Pro entitlement and payment checks server-side.
- Do not auto-import Public watchlists into Pro without user consent.

## v1.17 Scope

v1.17 only adds shared identity language, config, docs, and UI placeholders.
True shared auth, shared database persistence, and Pro entitlement remain deferred.

## v1.20 Scope

v1.20 begins the Public App account foundation:

- Email/password login and register pages are available when Supabase anon env vars are configured.
- Guest mode remains valid and does not block content access.
- Public App account state is stored client-side with Supabase anon auth tokens only; service role keys remain server-only.
- Watchlist sync, notification preferences, shared Pro login, entitlement, and payment are still future phases.
