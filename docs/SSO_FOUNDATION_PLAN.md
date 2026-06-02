# IXAI v1.60.0 — Unified Login Foundation

This document records the identity architecture review for preparing true App → Pro shared login.

This is planning and architecture only. It does not enable production SSO, remove the legacy Pro login, build Stripe, connect brokers, build portfolio engines, or modify production authentication behavior.

## 1. Current Identity Map

```text
Production App: app/ixai-web-app
  Supabase Auth browser session
  → Supabase access token
  → Next API Bearer verification
  → Backend account-link / membership / entitlement proxy

Legacy Pro: frontend/ixai-website-clean
  FastAPI JWT login
  → browser localStorage ixai_token
  → direct browser-to-backend protected API calls

Backend: backend/ixai_agent
  FastAPI users table
  → custom HS256 JWT
  → accounts / account_memberships
  → subscriptions / entitlements
```

## 2. Repository Auth Audit

### Production App

Path: `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app`

Current auth providers:

- Supabase Auth is the production App account provider.
- Lightweight `ixai_identity` cookie still exists for older email/session and LINE readiness surfaces.
- LINE login is an identity/connectivity layer, not the primary App auth source.

Session model:

- Browser Supabase client persists Supabase session in `sessionStorage`.
- Client code calls `supabase.auth.getSession()` and sends the Supabase `access_token` to trusted Next API routes as `Authorization: Bearer`.
- Next API routes verify the Bearer token by calling Supabase `/auth/v1/user`.
- Lightweight `ixai_identity` is HMAC-signed, HTTP-only, and useful for legacy public/account identity continuity, but is not sufficient for backend account-link.

JWT model:

- Supabase issues the App access token JWT.
- The App does not mint its own SSO JWT for Pro.
- Next API routes currently do not validate Supabase JWT signature locally; they validate by asking Supabase Auth for the current user.

User identifier:

- Supabase `user.id` is the source external identity.
- User email is used as a secondary lookup / display value only.

Membership / entitlement flow:

```text
Supabase user
→ /api/pro/account-link
→ backend /api/v1/integrations/supabase/account-link
→ backend accounts.external_provider = supabase
→ backend accounts.external_user_id = Supabase user id
→ subscriptions / entitlements
→ /api/pro/membership and /api/pro/entitlements
→ Account / Pro feature gates
```

Trust boundaries:

- Browser may hold Supabase access token.
- Browser must call App Next API, not backend protected endpoints directly.
- Next API is the server-side bridge to backend.
- Backend account-link / membership endpoints currently trust the Next proxy by network and route design; production hardening still needs a server-to-server secret or signed request.

Security assumptions:

- Supabase Auth controls App session lifecycle.
- Supabase access tokens are short-lived and refresh through the Supabase client.
- Backend does not receive Supabase refresh tokens.
- Backend account link does not grant paid Pro access by itself.

### Legacy Pro

Path: `/Users/itsunkuo/Desktop/IXAI_PROJECTS/frontend/ixai-website-clean`

Current auth provider:

- Legacy FastAPI backend auth via `/api/v1/auth/auth/login`.

Session model:

- Browser stores `ixai_token` in `localStorage`.
- All protected legacy API calls attach `Authorization: Bearer <ixai_token>`.
- AppShell redirects to `/login` when `ixai_token` is absent.

JWT model:

- Backend custom HS256 JWT created by `backend/ixai_agent/app/core/security.py`.
- JWT subject is backend `users.id`.
- Expiry uses backend `ACCESS_TOKEN_EXPIRE_MINUTES`.

User identifier:

- Backend `users.id` is the current authenticated identifier.
- Email/password belongs to backend user table, not Supabase Auth.

Trust boundaries:

- Browser directly calls FastAPI protected endpoints.
- Legacy frontend trusts `NEXT_PUBLIC_API_BASE_URL`.
- Backend validates custom JWT via `OAuth2PasswordBearer`.

Security assumptions:

- Legacy Pro users are backend users with password hashes.
- Legacy Pro does not understand Supabase sessions today.
- App account password cannot be assumed to work in Legacy Pro.

### Backend

Path: `/Users/itsunkuo/Desktop/IXAI_PROJECTS/backend/ixai_agent`

Current auth providers:

- FastAPI email/password auth against `users`.
- Custom HS256 JWT for protected Pro APIs.
- Supabase account-link endpoint creates / finds backend shadow user and account from Supabase identity payload.

Session / JWT model:

- `/api/v1/auth/auth/login` returns backend JWT.
- `OAuth2PasswordBearer` reads Bearer token and `decode_access_token()` validates with backend `SECRET_KEY`.
- Supabase-linked backend users receive an unusable shadow password hash so they cannot log in as normal password users unless explicitly migrated.

User / account / entitlement model:

- `users`: backend auth identity.
- `accounts`: portfolio ownership root; now stores `external_provider`, `external_user_id`, `external_email`, and `pro_access_status`.
- `account_memberships`: account ownership / membership.
- `subscriptions`: plan layer (`free`, `personal`, `pro`, `enterprise`).
- `entitlements`: feature gate layer (`daily_brief`, `weekly_brief`, `watchlist`, `portfolio`, `fcn_monitoring`, `risk_engine`, `ai_copilot`).

Trust boundaries:

- Existing protected portfolio endpoints trust backend JWT only.
- Account-link / membership / entitlement query endpoints are intended for App Next API proxy.
- Admin entitlement endpoint is protected by `IXAI_ADMIN_INTERNAL_TOKEN`.

Security assumptions:

- `SECRET_KEY` must be set in production-like environments.
- Production CORS is explicit; localhost defaults apply only in development.
- Backend has not yet implemented Supabase JWT validation for protected portfolio/FCN routes.

## 3. Current Identity Flow Diagrams

### App Account Link Flow

```text
Browser Supabase sessionStorage
→ supabase.auth.getSession()
→ access_token
→ POST /api/pro/account-link with Authorization: Bearer
→ Next API verifies token with Supabase Auth
→ Next API sends provider/external_user_id/email to backend
→ Backend creates/finds account
→ Backend ensures Free membership + entitlements
→ App shows Account Link Linked
```

### Legacy Pro Login Flow

```text
Legacy Pro /login
→ POST backend /api/v1/auth/auth/login
→ backend validates email/password against users.hashed_password
→ backend JWT returned
→ localStorage ixai_token
→ direct browser API calls to FastAPI with Authorization: Bearer
```

### Current Trust Gap

```text
App Supabase user id
≠
Legacy Pro localStorage backend JWT session

Account link exists in backend accounts table,
but Legacy Pro still cannot use Supabase session as login.
```

## 4. Can Legacy Pro Migrate To Supabase Auth?

Yes, but it is not a one-file change. Legacy Pro can migrate to Supabase Auth if it stops treating backend JWT as the browser session source and adopts the App identity model.

Components that must change:

- `frontend/ixai-website-clean/app/lib/api.ts`
  - replace `ixai_token` localStorage model with Supabase session / App-issued bridge token.
- `frontend/ixai-website-clean/app/login/page.tsx`
  - replace backend email/password login with Supabase sign-in or App redirect.
- `frontend/ixai-website-clean/app/register/page.tsx`
  - remove backend register as primary identity creation.
- `frontend/ixai-website-clean/app/components/layout/AppShell.tsx`
  - replace `getToken()` gate with Supabase/App identity gate.
- Backend protected endpoints
  - either validate Supabase JWT directly or accept a trusted backend session produced by a token exchange endpoint.

Dependencies:

- Backend must know how to resolve Supabase user id to backend account/user.
- Backend must protect portfolio / FCN data by entitlements.
- App and Legacy Pro must agree on logout behavior.
- Deployment env must include Supabase URL / anon key or an App-managed SSO exchange endpoint.

Blockers:

- Legacy Pro currently calls FastAPI directly from the browser.
- Backend protected endpoints currently expect backend JWT, not Supabase JWT.
- No server-to-server signed request layer protects account-link / membership endpoints yet.
- No production true SSO callback / token exchange endpoint exists.

Complexity estimate:

- Option A direct Supabase migration: Medium to High.
- Option B JWT exchange bridge: Medium.
- Full retirement of legacy login: High because all protected API assumptions must be tested.

Risk level:

- Medium if done behind a beta flag and limited to test users.
- High if the legacy login is removed before backend endpoint authorization is fully migrated.

## 5. SSO Architecture Options

### Option A — Unified Supabase Auth

Flow:

```text
App / Legacy Pro browser
→ Supabase Auth
→ Supabase access token
→ Backend validates Supabase JWT / claims
→ Backend resolves accounts.external_provider = supabase
→ Entitlement checks
```

Pros:

- Single identity source.
- Avoids custom SSO server.
- Supabase manages JWT issuance, refresh token rotation, session lifecycle, and OAuth/email flows.
- Aligns with current App identity and account-link direction.

Cons:

- Backend must implement Supabase JWT validation or call Supabase user/claims endpoint safely.
- Legacy Pro must replace localStorage backend JWT login.
- Logout and token refresh behavior must be coordinated in both frontends.

Security implications:

- Backend must validate issuer, audience, expiry, signature, and user id.
- Backend must not trust email alone.
- Backend should map Supabase `sub` to account external identity.
- Entitlement checks remain backend-side.

Operational complexity:

- Moderate.
- Requires env config and backend verification logic, but avoids maintaining a separate auth service.

Recommendation:

- Recommended as target architecture whenever practical.

### Option B — JWT Exchange Bridge

Flow:

```text
App Supabase access token
→ Next API verifies Supabase user
→ Next API calls backend token-exchange endpoint
→ Backend returns short-lived backend JWT scoped to linked account
→ Legacy Pro stores temporary backend token
→ Existing FastAPI protected endpoints continue to work
```

Pros:

- Smaller Legacy Pro change.
- Existing backend protected endpoints can keep using backend JWT initially.
- Useful as an intermediate beta SSO bridge.

Cons:

- Creates another token lifecycle.
- Requires strong anti-replay and short expiry.
- Requires a secure exchange endpoint and exact logout behavior.
- Still does not fully retire legacy auth.

Security implications:

- Exchange endpoint must validate Supabase token and account link.
- Backend token must be short-lived, audience-scoped, and ideally bound to account/entitlements.
- Replay prevention requires nonce, state, TTL, and one-time code or signed redirect.

Operational complexity:

- Moderate to High.
- Easier migration path, but more moving parts than pure Supabase.

Recommendation:

- Recommended only as a transitional bridge if direct Supabase validation is too disruptive.

### Option C — Separate Custom SSO Server

Flow:

```text
App login
→ Custom SSO server
→ App and Pro consume custom sessions
→ Backend validates custom tokens
```

Pros:

- Full control over token exchange, session, and scopes.

Cons:

- Highest maintenance burden.
- Duplicates capabilities Supabase already provides.
- Increases attack surface and operational work.

Security implications:

- Requires custom refresh, revocation, rotation, logout, key management, and audit trail.

Operational complexity:

- High.

Recommendation:

- Not recommended unless IXAI outgrows Supabase Auth or requires a custom enterprise IdP layer.

## 6. Recommended Architecture

Target recommendation:

```text
Supabase Auth = single identity source
Backend accounts = product/account/portfolio ownership layer
Backend subscriptions / entitlements = authorization layer
Next API = transitional proxy and UI orchestration layer
Legacy Pro = gradually migrated away from backend password login
```

Rationale:

- Supabase Auth uses JWT access tokens plus refresh tokens for sessions, and integrates with user management and JWT claims.
- Supabase sessions provide a short-lived access token and refresh token model; this matches the current App Bearer bridge.
- IXAI already uses Supabase Auth in the production App and already maps Supabase user id to backend account identity.

Recommended near-term route:

1. Keep current App login unchanged.
2. Add a protected, beta-only SSO prototype for Legacy Pro.
3. Prefer backend Supabase JWT validation for new protected Pro APIs.
4. If direct validation is too large, use a short-lived JWT exchange bridge as transitional only.
5. Retire legacy password login after beta testing proves the shared identity path.

## 7. Security Model

Identity verification:

- Supabase user id must be verified through a valid Supabase access token.
- Backend must use `external_provider = supabase` and `external_user_id = Supabase user id` as the stable link.
- Email is secondary metadata, not the identity key.

JWT validation:

- Target: backend validates Supabase JWT locally via Supabase signing keys / JWKS or verified claims API.
- Transitional: Next API can verify Supabase user and call backend through signed server-to-server requests.
- Never trust an unverified `external_user_id` sent directly by browser.

Session trust model:

- Browser may hold Supabase access token.
- Browser should not receive backend admin tokens or service role tokens.
- Backend protected data endpoints should enforce account + entitlement checks.

Token exchange requirements for Option B:

- One-time authorization code or short-lived exchange JWT.
- TTL measured in minutes, not days.
- Bind token to Supabase user id, backend account id, audience, and issued-at timestamp.
- Reject replayed nonce / code.
- Log exchange without logging token or email.

Replay prevention:

- Use nonce/state in redirect flows.
- Store used exchange codes until expiry.
- Require HTTPS.
- Never place long-lived tokens in URL fragments or query strings.

Logout behavior:

- App logout signs out Supabase.
- Legacy Pro must clear local session on shared logout.
- If Option B is used, backend exchange token expiry should limit stale access even if localStorage is not cleared.
- Full logout synchronization requires a future cross-app logout event or redirect flow.

Account-link behavior:

- Account link creates/fetches backend account.
- Account link does not grant paid Pro.
- Entitlement remains the source of feature access.

Failure modes:

- Supabase token invalid: return not authenticated.
- Backend account not linked: show connect account first.
- Backend unavailable: fail closed and keep Portfolio / FCN / Risk locked.
- Entitlement missing: show Free / locked / beta policy state.
- Token exchange failed: keep Legacy Pro login available during rollout.

## 8. Migration Plan

### Phase 1 — Audit + Documentation

Deliverables:

- This document.
- Current identity maps and trust boundaries.
- Recommendation for Supabase as single identity source.

Risks:

- None to production behavior.

Rollback:

- Remove or revise documentation only.

Estimate:

- 0.5–1 engineering day.

### Phase 2 — SSO Prototype

Deliverables:

- Beta-only prototype path.
- Option A prototype: backend validates Supabase JWT for one low-risk endpoint.
- Or Option B prototype: short-lived token exchange endpoint for Legacy Pro.
- Server-to-server protection for account-link / membership calls.

Risks:

- Incorrect token validation.
- Confusing dual-session behavior.

Rollback:

- Keep legacy login unchanged.
- Disable SSO prototype flag.

Estimate:

- 2–4 engineering days.

### Phase 3 — Beta Test Users

Deliverables:

- Limited Supabase-linked users can enter Legacy Pro without separate password.
- Account link and entitlements enforced.
- Audit logs for login path, not tokens.

Risks:

- Session mismatch between App and Legacy Pro.
- Logout inconsistency.

Rollback:

- Disable beta SSO flag and require legacy login credentials again.

Estimate:

- 3–5 engineering days.

### Phase 4 — Production Rollout

Deliverables:

- Shared login enabled for all linked App users.
- Legacy Pro direct password login becomes secondary fallback.
- Backend entitlement checks protect Portfolio / FCN / Risk.

Risks:

- Production auth outage.
- Misconfigured Supabase JWT validation.

Rollback:

- Re-enable legacy login as primary.
- Disable shared-login redirect.

Estimate:

- 1–2 weeks including QA.

### Phase 5 — Legacy Login Retirement

Deliverables:

- Legacy Pro login screen becomes App redirect / SSO entry.
- Backend password login retired or restricted to admin/dev only.
- `ixai_token` localStorage removed or replaced by secure session strategy.

Risks:

- Existing beta users without App accounts need migration.

Rollback:

- Keep legacy password login endpoint available behind a flag until migration closes.

Estimate:

- 1–2 weeks depending on user migration and endpoint coverage.

## 9. Engineering Dependencies

- Supabase project configuration for redirect URLs.
- Backend Supabase JWT validation strategy.
- Server-to-server secret or signed request between Next API and backend.
- Legacy Pro auth client refactor.
- Entitlement enforcement on any real Portfolio / FCN / Risk endpoint before production data is exposed.
- Logout / token refresh QA across both frontends.

## 10. Sources

Supabase Auth reference:

- Supabase Auth uses JWTs for authentication and supports password, magic link, social login, and SSO.
- Supabase sessions are represented by a JWT access token and refresh token.
- Supabase access tokens include claims such as issuer and session id, and are intended to be short-lived.

Official references:

- https://supabase.com/docs/guides/auth
- https://supabase.com/docs/guides/auth/sessions
- https://supabase.com/docs/guides/auth/jwt-fields
