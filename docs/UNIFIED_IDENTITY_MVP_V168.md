# v1.68.0 — App ↔ Pro Unified Identity MVP

## Purpose

v1.68.0 completes the first real App to Pro login experience without removing the legacy Pro login fallback.

Target flow:

```text
User logs into app.ixuan.ai
→ clicks 開啟 IXAI Pro
→ App creates a short-lived one-time launch code
→ Legacy Pro validates the code against the App
→ Legacy Pro creates a short-lived MVP Pro session
→ user lands in the Pro dashboard without seeing /login
```

This is an identity bridge MVP. It is not a full Supabase migration, paid Pro authorization system, portfolio engine, FCN engine, broker integration, or trading system.

## Current v1.67 State

v1.67 proved the handoff:

- App exposes `/api/pro/launch`.
- App verifies the browser Supabase access token.
- App creates a short-lived one-time launch code.
- Legacy Pro `/sso/receive` validates the code.
- Legacy Pro showed a validated identity screen, but users still had to continue through the legacy login model.

## v1.68 MVP Goal

v1.68 changes only the post-validation Legacy Pro behavior:

- Valid launch code creates a local `ixai_sso_v1` MVP session.
- Legacy Pro stores that session in the existing `ixai_token` slot so the current shell can open `/dashboard`.
- The dashboard can render a degraded state if legacy FastAPI JWT data requests fail.
- API 401 responses for the MVP SSO marker do not immediately clear the session and redirect to `/login`.
- Existing legacy `/login` and FastAPI JWT auth remain intact.

## App Launch Flow

App side remains stable:

```text
ProSsoLaunchButton
→ getSupabaseAuthorizationHeaders()
→ POST /api/pro/launch
→ Next route validates Supabase Bearer token
→ one-time code is stored in App runtime memory
→ browser redirects to Legacy Pro /sso/receive?code=...
```

The App launch endpoint does not put Supabase access tokens, refresh tokens, or service role keys in the URL.

## Legacy Pro Receive / Session Flow

Legacy Pro:

```text
/sso/receive?code=...
→ GET {App}/api/pro/launch?code=...
→ valid response returns sanitized identity
→ createLegacySsoSession()
→ localStorage.ixai_token = ixai_sso_v1...
→ redirect to /dashboard
```

The `ixai_sso_v1` marker is explicitly a UI-session bridge, not a backend JWT and not a paid entitlement.

## Session Model

MVP session characteristics:

- Storage: localStorage, because Legacy Pro already uses localStorage for `ixai_token`.
- TTL: short-lived local Pro MVP session.
- Scope: Legacy Pro UI access only.
- Backend API access: not granted by the marker.
- Entitlement: unchanged; paid Pro access remains controlled by backend membership / entitlements.

If protected FastAPI calls return 401 under the MVP marker, the UI should stay in Pro and show degraded states rather than forcing users back to `/login`.

## Security Constraints

Required constraints preserved:

- Launch code is short-lived.
- Launch code is one-time use.
- Supabase access token is not in the URL.
- Supabase refresh token is never exposed.
- Service role keys are not used.
- Raw launch codes and tokens are not logged.
- Legacy Pro login fallback remains available.
- SSO session does not equal paid Pro access.

Known MVP limitation:

- The Legacy Pro MVP session uses localStorage because the current Pro app is localStorage-token based. This should be replaced by a safer cookie / Supabase session model in v1.69+.
- App launch code storage is runtime memory only and is not multi-region durable.
- Logout is not fully synchronized between App and Pro.

## Fallback Behavior

Failure states:

- Missing code.
- Expired code.
- Replayed code.
- App validation unavailable.

Failure UX:

```text
IXAI Pro 連線未完成。
請重新從 App 開啟 IXAI Pro，或使用 Pro 登入頁。
```

Users can return to the App or use the legacy Pro login page.

## Deferred

Deferred to v1.69+:

- Real Supabase session inside Legacy Pro.
- Backend Supabase JWT validation for protected portfolio / FCN APIs.
- Logout synchronization.
- Persistent launch-code store.
- Removal of duplicate Pro login.
- Stripe, billing, broker, portfolio engine, FCN engine, and trading features.

## Rollback Plan

1. Revert Legacy Pro `/sso/receive` to validation-only behavior.
2. Remove `ixai_sso_v1` session creation.
3. Keep App `/api/pro/launch` or disable the `開啟 IXAI Pro` CTA.
4. Existing legacy `/login` remains the fallback.

## Files Expected To Change

App:

- `docs/UNIFIED_IDENTITY_MVP_V168.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/ROADMAP.md`
- `docs/VERSION_HISTORY.md`

Legacy Pro:

- `app/sso/receive/page.tsx`
- `app/lib/sso-session.ts`
- `app/lib/api.ts`
- `README.md`
