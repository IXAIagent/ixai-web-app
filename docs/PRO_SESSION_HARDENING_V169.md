# v1.69.0 — Pro Session Hardening

## Purpose

v1.69.0 stabilizes the App to Pro session after the v1.68 Unified Identity MVP.

Target behavior:

```text
App logged in
→ click 開啟 IXAI Pro
→ Legacy Pro dashboard opens
→ refresh keeps the user in Pro
→ protected Pro routes understand the SSO session consistently
→ logout clears the Pro session predictably
```

This is session hardening, not a full Supabase migration.

## v1.68 Current Session Model

v1.68 created a local `ixai_sso_v1` marker after Legacy Pro validated the App launch code. The marker allowed the current `AppShell` to enter `/dashboard`, but it was MVP-level:

- Session shape was not explicit enough.
- Helper functions were partially compatibility-oriented.
- API behavior depended on recognizing the marker at request time.
- Refresh worked only as long as the marker was present and unexpired.

## v1.69 Session Hardening Goal

v1.69 upgrades the local bridge marker to a structured session object and centralizes all Pro session helpers.

The goal is:

- One helper layer for legacy JWT and App SSO sessions.
- Predictable expiry enforcement.
- No duplicate page-level localStorage parsing.
- SSO session is accepted by protected Pro UI routes.
- SSO session is not sent to FastAPI as a backend JWT.
- Backend 401 under SSO does not destroy the local SSO session unless the session is expired.

## SSO Session Format

Legacy Pro stores the SSO session as a localStorage MVP bridge:

```ts
type IxaiSsoSession = {
  type: "ixai_sso_v2";
  provider: "supabase";
  appUserIdTail: string;
  maskedEmail?: string;
  issuedAt: number;
  expiresAt: number;
  source: "ixai-app";
};
```

Storage:

- `ixai_sso_session`: structured JSON object.
- `ixai_token`: marker token with `ixai_sso_v2.` prefix so the existing shell can detect a session.

This remains temporary. It should be replaced by a safer cookie / Supabase-backed session in v1.70+.

## Refresh Behavior

On refresh:

1. Legacy Pro calls `getProSession()`.
2. If a valid legacy FastAPI JWT exists, the user remains in the legacy session.
3. If a valid `ixai_sso_v2` object exists, the helper restores the SSO marker into `ixai_token`.
4. If the SSO session is expired, both the SSO object and marker are cleared.
5. If no session exists, protected routes return to `/login`.

## Protected Route Behavior

Protected routes accept either:

- Existing legacy JWT session.
- `ixai_sso_v2` App SSO session.

The SSO session is limited-access beta workspace identity. It opens the Pro UI but does not unlock backend-protected portfolio / FCN / risk data.

Current Legacy Pro route names include:

- `/dashboard`
- `/portfolio`
- `/fcn`
- `/market`
- `/alerts`
- `/intelligence`

The product wording may refer to future `/market-intelligence` or `/ai-risk-alerts`; in the current legacy repo those map conceptually to `/intelligence`, `/market`, and `/alerts`.

## API Behavior

The API wrapper must:

- Send real legacy JWT tokens to FastAPI as `Authorization: Bearer`.
- Never send `ixai_sso_v2` as a FastAPI JWT.
- Keep the local SSO session when protected APIs return 401.
- Let pages show degraded / placeholder state instead of forcing `/login`.

This keeps the identity bridge separate from backend authorization.

## Logout Behavior

Legacy Pro logout:

- Clears legacy `ixai_token`.
- Clears legacy fallback `token`.
- Clears `ixai_sso_session`.
- Redirects to `/login`.

App / Pro logout synchronization is deferred. Logging out of Legacy Pro does not currently log the user out of Supabase App.

## Security Limitations

Preserved constraints:

- App launch code remains short-lived and one-time use.
- No Supabase access token in URL.
- No Supabase refresh token exposure.
- No service role key exposure.
- No raw token logging.
- Existing Legacy Pro login fallback remains.

Known limitations:

- `ixai_sso_v2` is stored in localStorage because Legacy Pro still uses localStorage token gates.
- The session marker is not a backend JWT and must not authorize real data.
- App/Pro logout sync is not implemented.
- Multi-region durable launch-code storage is not implemented.

## Rollback Plan

1. Revert Legacy Pro `app/lib/sso-session.ts` to v1.68 behavior.
2. Revert `/sso/receive` to creating `ixai_sso_v1`.
3. Keep App `/api/pro/launch` unchanged.
4. Legacy `/login` remains available throughout rollback.

## Files Expected To Change

App:

- `docs/PRO_SESSION_HARDENING_V169.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/ROADMAP.md`
- `docs/VERSION_HISTORY.md`

Legacy Pro:

- `app/lib/sso-session.ts`
- `app/lib/api.ts`
- `app/sso/receive/page.tsx`
- `README.md`
