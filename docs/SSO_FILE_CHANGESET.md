# IXAI SSO File Changeset

Version: `v1.61.1`

Purpose: identify the expected file-level impact for the future App to Pro SSO prototype before any authentication code is changed.

Status: design review only. No production authentication behavior is changed by this document.

## A. Feasibility Verdict

Verdict: GO with constraints.

Legacy Pro can realistically migrate toward Supabase Auth, but not as a one-file change. The current Legacy Pro app is built around FastAPI email/password login, a backend-issued JWT, and `localStorage` key `ixai_token`. Moving it to unified Supabase Auth requires changing the Legacy Pro session source, protected route gate, API authorization header, and backend validation model together.

Recommended target:

```text
App Supabase Auth
→ Supabase access token
→ Backend Supabase JWT validation
→ Account link lookup
→ Membership / entitlement authorization
→ Legacy Pro dashboard access
```

Recommended fallback only if direct migration is too risky:

```text
App Supabase Auth
→ Next / backend token exchange
→ short-lived Pro bridge token
→ Legacy Pro session
```

## B. App Files

Repository: `/Users/itsunkuo/Desktop/IXAI_PROJECTS/app/ixai-web-app`

Likely files for v1.62+ code work:

| File | Expected Change | Risk |
| --- | --- | --- |
| `src/lib/supabase/client.ts` | Confirm browser Supabase session retrieval for Pro launch. | Low |
| `src/lib/supabase/server.ts` | Confirm server-side session / token verification helpers remain compatible. | Medium |
| `src/lib/pro/account-link.ts` | Reuse account-link status before launching Pro. | Low |
| `src/lib/pro/access.ts` | Keep Pro access state separate from paid entitlement. | Low |
| `src/lib/pro/feature-gates.ts` | Preserve entitlement decisions; do not replace with SSO. | Low |
| `app/api/pro/account-link/route.ts` | May remain as account-link boundary; future launch flow can depend on linked status. | Medium |
| `app/api/pro/access/route.ts` | May expose SSO readiness / linked state to Pro CTA surfaces. | Medium |
| `app/api/pro/entitlements/route.ts` | Preserve backend entitlement proxy and avoid browser-to-FastAPI direct access. | Low |
| `app/api/auth/session-debug/route.ts` | Useful for non-sensitive SSO prototype diagnostics. | Medium |
| `components/pro/pro-lab-connection-card.tsx` | Update future Pro launch CTA behavior after prototype approval. | Medium |
| `components/pro/pro-workspace-hub.tsx` | Surface SSO readiness / launch states without changing entitlement rules. | Medium |
| `app/pro/page.tsx` | Future launch entry may call SSO launch flow. | Medium |
| `app/account/page.tsx` | Keep Account as status surface for App identity, account link, membership, and SSO readiness. | Medium |
| `middleware.ts` | No current dependency confirmed. Add only if future server-side route protection requires it. | High |

Potential new files for v1.62+:

- `app/api/pro/sso-launch/route.ts`
- `src/lib/pro/sso-launch.ts`
- `src/lib/auth/supabase-token.ts`

Do not add these in v1.61.1.

## C. Backend Files

Repository: `/Users/itsunkuo/Desktop/IXAI_PROJECTS/backend/ixai_agent`

Likely files for v1.62+ code work:

| File | Expected Change | Risk |
| --- | --- | --- |
| `app/core/security.py` | Keep existing backend JWT logic during rollback period. Add non-breaking Supabase validation helpers elsewhere if possible. | High |
| `app/api/deps.py` | Add dependency that accepts and validates Supabase JWT for selected endpoints. | High |
| `app/api/v1/endpoints/auth.py` | Preserve legacy login during beta; do not remove until v1.65+. | High |
| `app/api/v1/endpoints/integrations.py` | Reuse Supabase account-link contract. | Medium |
| `app/api/v1/endpoints/membership.py` | Use account link / entitlement with Supabase identity. | Medium |
| `app/api/v1/endpoints/entitlements.py` | Use account link / entitlement with Supabase identity. | Medium |
| `app/api/v1/endpoints/admin_entitlements.py` | No SSO dependency; preserve internal-token protection. | Medium |
| `app/services/integrations/account_link_service.py` | Ensure Supabase `sub` maps to backend account reliably. | Medium |
| `app/services/membership_service.py` | Keep plan / entitlement decisions server-authoritative. | Medium |
| Protected product endpoints | Future endpoints must accept Supabase-authenticated account context before serving Pro data. | High |

Potential new files for v1.62+:

- `app/core/supabase_jwt.py`
- `app/api/deps_supabase.py`
- `tests/test_supabase_jwt_auth_v162.py`
- `tests/test_sso_launch_v162.py`

Do not add these in v1.61.1.

## D. Legacy Pro Files

Repository: `/Users/itsunkuo/Desktop/IXAI_PROJECTS/frontend/ixai-website-clean`

Likely files for v1.62+ code work:

| File | Current Role | Expected Change | Risk |
| --- | --- | --- | --- |
| `app/lib/api.ts` | Stores / reads `ixai_token`, builds `Authorization: Bearer` header, calls backend. | Switch primary auth header from legacy JWT to Supabase access token or bridge token. | High |
| `app/login/page.tsx` | Legacy Pro login form against FastAPI JWT auth. | Convert into SSO entry / fallback legacy login notice during beta. | High |
| `app/register/page.tsx` | Legacy backend registration. | Retire or gate behind explicit fallback; App signup should become primary. | High |
| `app/components/layout/AppShell.tsx` | Protected shell checks `getToken()` and redirects to `/login`. | Replace token check with Supabase session / SSO state. | High |
| `app/page.tsx` | Redirect / landing behavior. | Route based on SSO readiness rather than localStorage token only. | Medium |
| `app/lib/ecosystem.ts` | Cross-product links. | Ensure App to Pro launch links point to approved SSO path. | Low |
| Dashboard routes using `AppShell` | Protected product surfaces. | Must inherit new auth session source and entitlement state. | High |

Potential new files for v1.62+:

- `app/lib/supabase.ts`
- `app/lib/pro-session.ts`
- `app/auth/callback/page.tsx`
- `app/sso/launch/page.tsx`

Do not add these in v1.61.1.

## E. Components That Must Not Be Moved Yet

Do not migrate these wholesale during SSO work:

- Legacy `AppShell` navigation.
- Legacy JWT login form as production primary login.
- Legacy direct browser-to-FastAPI protected request model.
- Legacy `localStorage` token persistence as the main session model.

These can remain available as rollback or reference surfaces during beta.

## F. SSO File Change Rule

Future SSO implementation must change identity, account-link, and entitlement code together. A partial change that only redirects App users to Legacy Pro without updating Legacy Pro session validation is not true SSO and should fail QA.

