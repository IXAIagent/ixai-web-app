# v1.67.0 — App ↔ Pro SSO Launch Prototype

## Purpose

v1.67.0 starts the first low-risk App to Pro SSO launch prototype.

The goal is not to replace the legacy IXAI Pro login yet. The goal is to prove that a logged-in App user can launch IXAI Pro with a short-lived identity handoff that the legacy Pro frontend can receive and validate.

## Current App → Pro State

- `app/ixai-web-app` is the production public App and uses Supabase Auth.
- `frontend/ixai-website-clean` is the legacy IXAI Pro Lab and still uses FastAPI JWT stored as `ixai_token`.
- `backend/ixai_agent` owns accounts, memberships, entitlements, and the existing account-link endpoint.
- App users can link an App identity to a backend account, but the legacy Pro Lab does not yet share the App login session.
- App CTAs previously opened the legacy Pro Lab login directly, which proved product continuity but did not provide SSO.

## Prototype Scope

v1.67.0 adds:

- An App launch endpoint: `/api/pro/launch`.
- A short-lived, one-time App launch code.
- A Legacy Pro receive route: `/sso/receive`.
- A validation path where Legacy Pro can ask the App to validate the launch code.
- A fallback path to the existing Legacy Pro login.

v1.67.0 intentionally does not:

- Remove the legacy Pro login.
- Issue a production Pro JWT.
- Store a Pro token in localStorage.
- Expose Supabase refresh tokens.
- Replace backend JWT auth.
- Modify membership or entitlement rules.
- Add payment, broker, portfolio, FCN calculation, or trading functionality.

## App-Side Launch Design

1. The logged-in App user clicks `開啟 IXAI Pro`.
2. The browser obtains the existing Supabase access token through the existing client helper.
3. The browser calls `POST /api/pro/launch` with `Authorization: Bearer <Supabase access token>`.
4. The App server validates the Supabase token through the existing Supabase user endpoint.
5. The App server creates a one-time launch code with a short expiry.
6. The App returns a redirect URL to the Legacy Pro receive route:

```text
https://ixai-website-clean.vercel.app/sso/receive?code=<one-time-code>&source=ixai-app
```

The raw Supabase token is never placed in the URL.

## Legacy Pro Receiving Design

1. Legacy Pro loads `/sso/receive`.
2. The page reads the `code` query parameter.
3. The page calls the App validation endpoint:

```text
GET https://app.ixuan.ai/api/pro/launch?code=<one-time-code>
```

4. If valid, Legacy Pro displays:

```text
已接收 App 帳號身份，正在準備進入 IXAI Pro。
```

5. If invalid, expired, or replayed, Legacy Pro displays:

```text
連線已逾時，請重新從 App 開啟 IXAI Pro 或使用 Pro 登入頁。
```

This version proves the identity handoff. It does not yet silently authenticate the legacy dashboard.

## Token / Identity Handling

- Launch code TTL: 2 minutes.
- Launch code behavior: one-time use.
- Launch code storage: App runtime memory for prototype only.
- Stored identity: masked email, Supabase user id tail, and source metadata only.
- Supabase access token: accepted only by the App launch endpoint and never forwarded to Legacy Pro.
- Supabase refresh token: never accessed or forwarded.
- Service role keys: not used.

## Security Boundaries

- Browser can only request a launch code from the App if it already has a valid Supabase access token.
- Legacy Pro only receives a short-lived launch code, not a Supabase token.
- Validation returns sanitized identity only.
- Replayed codes fail.
- Expired codes fail.
- Failure falls back to the existing Legacy Pro login.

Prototype limitations:

- Runtime-memory launch code storage is not suitable for multi-region production SSO.
- A server restart clears pending launch codes.
- Logout is not synchronized between App and Pro yet.
- No production Pro JWT is issued in this version.

## Rollback Plan

- Remove or stop using the `/api/pro/launch` endpoint.
- Revert Pro CTAs to the legacy Pro Lab login URL.
- Remove Legacy Pro `/sso/receive`.
- Existing App auth, account-link, membership, entitlements, and legacy Pro login remain intact.

## Files Expected To Change

App:

- `app/api/pro/launch/route.ts`
- `components/pro/pro-sso-launch-button.tsx`
- `components/pro/pro-workspace-hub.tsx`
- `components/pro/pro-lab-connection-card.tsx`
- `docs/SSO_LAUNCH_PROTOTYPE_V167.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/ROADMAP.md`
- `docs/VERSION_HISTORY.md`

Legacy Pro:

- `app/sso/receive/page.tsx`

Backend:

- No backend changes expected in v1.67.0.

## v1.68 Preview

v1.68 should decide whether the next prototype issues a short-lived Pro JWT through a protected backend exchange endpoint or moves Legacy Pro directly toward Supabase Auth. The v1.67 prototype should be reviewed before either path is implemented.
