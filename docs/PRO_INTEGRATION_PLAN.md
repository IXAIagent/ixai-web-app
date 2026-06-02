# IXAI Pro Integration Plan

This document records the v1.51 integration foundation between the active IXAI App, the IXAI Pro legacy dashboard prototype, and the FastAPI backend.

## Current Project Separation

IXAI currently has two frontend worlds:

- `app/ixai-web-app`: the active production app at `app.ixuan.ai`.
- `frontend/ixai-website-clean`: the IXAI Pro Legacy Dashboard Prototype at `https://ixai-website-clean.vercel.app/`.

The Pro legacy dashboard is already connected to `backend/ixai_agent`, the FastAPI backend that contains portfolio, FCN, crypto, alerts, account, preference, import, and intelligence endpoints.

The production app is not yet connected to the backend for portfolio / FCN / risk data. Its current architecture uses Supabase identity, Next API routes, public intelligence, account preferences, Daily / Weekly editorial workflows, and Social Intelligence tooling.

## Future Integration Goal

The long-term goal is:

```text
app.ixuan.ai
├─ /account
│  └─ account identity, preference memory, backend health, future portfolio readiness
└─ /pro-intelligence
   └─ future portfolio / FCN / risk intelligence backed by ixai_agent
```

Production app routes such as `/account` and `/pro-intelligence` should gradually connect to backend portfolio, FCN, and risk data through a controlled server-side boundary.

## Explicitly Not Doing

v1.51 does not:

- Move or copy the whole legacy frontend.
- Migrate legacy JWT login.
- Use `localStorage` token auth in the production app.
- Let the browser directly call protected FastAPI endpoints.
- Connect Stripe or paid entitlement.
- Load real portfolio, FCN, broker, or trading data into the production app.
- Redesign the Pro Dashboard.
- Rewrite auth, LINE Login, LIFF, Supabase, Daily / Weekly generation, or admin workflows.

## Required Foundation

The integration should happen in small steps:

1. Project map and Pro integration docs.
2. Next API server-side backend proxy.
3. Backend health check.
4. Supabase user → backend account mapping design.
5. Backend account bridge implementation.
6. Reusable widget migration from the legacy dashboard.
7. Pro route flow connection into `/account` and `/pro-intelligence`.

## v1.51.0 Foundation

v1.51.0 introduces the first formal IXAI App → Backend connection:

- `/api/backend/health`
- Server-side fetch to `IXAI_BACKEND_URL`.
- Development-only fallback to `http://localhost:8000`.
- Tries backend `GET /health`, then `GET /readyz` if needed.
- Does not expose the full backend URL.
- Does not handle user data.
- Does not require auth.
- Does not let the browser call backend directly.

It also adds a visible Pro Lab connection:

- `/account`: Pro integration card with backend health status.
- `/pro`: external IXAI Pro Lab entry.
- `/pro-preview`: external IXAI Pro Lab entry.

External Pro Lab links must use plain anchors:

```tsx
<a href="https://ixai-website-clean.vercel.app/" target="_blank" rel="noreferrer">
```

Do not use Next.js `Link` for external Pro Lab navigation.

## v1.51.1 App User to Pro Access Identity Bridge

v1.51.1 adds the first Pro access identity bridge inside the production app.

Principles:

- App registration / login can connect a user to Pro identity.
- Pro identity connection does not automatically grant paid Pro access.
- Full Pro rights remain controlled by entitlement, subscription, or manual approval.
- Stripe is not connected in this phase.
- Legacy Pro JWT login is not migrated.
- Browser clients still do not call protected FastAPI endpoints directly.

Pro access statuses:

```text
not_connected
connected
preview
active
expired
revoked
```

Current rules:

- Not signed in: `not_connected`.
- Signed in with no Pro record: `connected`.
- Free membership with Pro waitlist / candidate / manual preview metadata: `preview`.
- Pro or Enterprise membership with active status and valid expiry: `active`.
- Expired membership or expired timestamp: `expired`.
- Cancelled membership: `revoked`.
- Unknown lookup failure: safe fallback keeps paid capabilities closed.

Current access matrix:

| Status | Open Pro Lab | Portfolio | FCN | Billing required |
| --- | --- | --- | --- | --- |
| `not_connected` | No | No | No | No |
| `connected` | No | No | No | Yes for full Pro |
| `preview` | Yes | No | No | Yes for full Pro |
| `active` | Yes | Yes | Yes | No |
| `expired` | No | No | No | Yes |
| `revoked` | No | No | No | Yes |

## Future Billing / Entitlement Model

The future model should remain explicit:

- Free App Account: public intelligence, account memory, onboarding, and Pro interest.
- Pro Preview: manual or preview access to Pro Lab / sample workflows.
- Pro Active Subscription: paid or approved entitlement for portfolio / FCN / risk intelligence.
- Pro Expired: previously active, now inactive until renewed.
- Pro Revoked: access removed by cancellation, compliance, or manual admin decision.
- Manual Access: staff-approved access for beta users, FCN clients, or controlled demos.
- Future Stripe Subscription: Stripe webhook updates membership / entitlement state server-side.

v1.51.1 does not collect payment. It only creates the entitlement-aware identity model.

## Future Backend Account Mapping

Before real portfolio / FCN data flows into the production app, the backend should support an explicit account bridge.

Potential backend endpoints:

```text
POST /api/v1/integrations/supabase/account-link
GET /api/v1/accounts/by-external-user/{provider}/{external_user_id}
```

Equivalent designs are acceptable if they preserve:

- Supabase user id as external identity.
- Backend account / portfolio ownership mapping.
- Server-side token handling.
- No browser-direct protected FastAPI calls.
- No portfolio or FCN data until mapping is verified.

## v1.51.2 Supabase User to Backend Account Link

v1.51.2 clarifies the identity gap between the production app and the legacy Pro Lab.

Current state:

- App users live in Supabase Auth.
- Pro Lab users live in the backend FastAPI JWT `users` table.
- These are not the same identity yet.
- App credentials cannot log into the legacy Pro Lab unless a separate Pro Lab account exists.
- This is why an app.ixuan.ai user may fail to sign in at `ixai-website-clean.vercel.app/login`.

UX rule:

- `/account` must not imply that App credentials directly open the legacy Pro Lab.
- External Pro Lab links are preview / explanation links only.
- Button copy should prefer `View Pro Lab Preview` or `Learn about Pro Integration`, not `Open IXAI Pro`.
- Pro Lab links must explain that the environment is separate and App login is not shared yet.

Target state:

- App remains the primary login surface.
- Supabase user becomes the source identity.
- A Next API route verifies the Supabase user server-side.
- Backend receives a controlled server-side request to create or find a linked backend account.
- Backend returns a backend account id, backend user id, and access state.
- Browser never receives backend admin secrets, service tokens, or protected FastAPI credentials.
- Legacy Pro Lab login should not remain the long-term entry point.

Backend contract options to design before implementation:

Option A, create-or-find:

```text
POST /api/v1/integrations/supabase/account-link
```

Request from Next server only:

```json
{
  "provider": "supabase",
  "external_user_id": "<supabase_user_id>",
  "email": "<email>",
  "name": "<optional display name>"
}
```

Response:

```json
{
  "backend_account_id": "...",
  "backend_user_id": "...",
  "pro_access_status": "connected|preview|active|expired|revoked",
  "created": true
}
```

Option B, lookup:

```text
GET /api/v1/accounts/by-external-user/{provider}/{external_user_id}
```

Recommendation:

- Option A is better for create-or-find identity linking.
- Option B is better for later read-only lookup.
- Before either endpoint is implemented, backend must verify that the request came from the trusted Next server.

Entitlement rule:

- App signup creates identity only.
- App signup does not grant paid Pro access.
- Pro access requires entitlement state: `connected`, `preview`, `active`, `expired`, or `revoked`.
- Future billing starts with manual approval, then Stripe later.
- No automatic Pro access is granted just because a user signs up.

## v1.52.0 Supabase User to Backend Account Link Foundation

v1.52.0 implements the first production-app account-link boundary without changing backend code.

Backend audit result:

- `backend/ixai_agent` has FastAPI JWT auth and protected account APIs.
- It has `User`, `Account`, `AccountMembership`, portfolio, FCN, crypto, alert, and intelligence models.
- It does not currently have `external_user_id`, `provider`, `integrations`, `account-link`, or by-external-user lookup support.
- Existing account APIs cannot directly support Supabase user linking without a backend contract.

Production app additions:

- `POST /api/pro/account-link`
- `/api/pro/access` accountLink status
- `/account` Account Link Status
- `/account` `Connect Pro Account` action

Account-link request payload prepared by the Next server:

```json
{
  "provider": "supabase",
  "external_user_id": "<supabase_user_id>",
  "email": "<email>",
  "name": "<optional display name>"
}
```

Safe states:

```text
not_started
linked
backend_not_configured
backend_contract_missing
error
```

If the backend endpoint is not available yet, the production app returns:

```json
{
  "ok": false,
  "status": "backend_contract_missing",
  "message": "Backend account-link endpoint is not available yet."
}
```

Security boundaries:

- The browser calls only the Next API route.
- The browser does not call protected FastAPI endpoints directly.
- Supabase tokens are used only to verify App identity inside the Next route.
- Backend secrets, service tokens, and full backend URLs are not returned to the client.
- User email is not logged by the account-link route.

Entitlement boundary:

- Account link is identity infrastructure only.
- Account link does not activate paid Pro access.
- Portfolio / FCN data remains disabled until backend mapping and entitlement are complete.
- Stripe remains future work.

## Backend Boundary Rules

Production frontend should eventually talk to backend through Next API routes:

```text
Browser
→ app.ixuan.ai Next API route
→ ixai_agent FastAPI backend
```

Avoid:

```text
Browser
→ direct protected FastAPI endpoint
```

The backend boundary should not expose:

- Backend secrets.
- Service tokens.
- Supabase service role keys.
- Full backend internal URLs.
- Portfolio or FCN data before identity mapping is approved.

## v1.53.1 Account Link End-to-End Verification

Verification status:

- Backend local health passed against a temporary E2E SQLite database.
- Backend `POST /api/v1/integrations/supabase/account-link` passed direct local testing:
  - first request returned `created: true`
  - second identical request returned `created: false`
  - `pro_access_status` remained `connected`
  - backend `User`, `Account`, and owner `AccountMembership` were created
- Frontend `/api/backend/health` reached the backend through the development fallback and returned `ok: true`.
- Frontend production server smoke test with `IXAI_BACKEND_URL=http://localhost:8000` returned `backendUrlConfigured: true` and `ok: true`.
- Frontend `/api/pro/account-link` correctly returned `401 not_authenticated` without a Supabase Bearer token.

Known blocker:

- Full App → Next API → Backend account-link verification still requires an authenticated Supabase browser session or valid Supabase access token.
- No auth bypass or schema change should be added for this test.

Local DB note:

- The existing local `ixai.db` was not upgraded because its Alembic version marker is behind existing tables.
- E2E backend verification used a temporary database at `/tmp/ixai_v1531_e2e.db`.

## v1.54 Real Account Linking Verification

Verification status:

- Backend temporary E2E database `/tmp/ixai_v154_e2e.db` upgraded cleanly to `0009_supabase_account_link`.
- Backend health and readiness passed on `localhost:8000`.
- Backend direct account-link test passed:
  - first request returned `created: true`
  - repeated request returned `created: false`
  - `pro_access_status` remained `connected`
- Frontend production server smoke test with `IXAI_BACKEND_URL=http://localhost:8000` returned `backendUrlConfigured: true` and `ok: true`.
- Frontend unauthenticated `POST /api/pro/account-link` correctly returned `401 not_authenticated`.

Current blocker:

- Real browser-click E2E from `/account` requires an authenticated Supabase App session.
- Local and production browser checks both reached the account entry shell, not an authenticated Account workspace.
- No auth bypass, Supabase schema change, or legacy Pro login migration should be added just to force this verification.

Next verification step:

- Log in with a real Supabase App account, then click `/account` `Connect Pro Account`.
- Expected result: Next API returns linked state, backend creates/finds account link, and Account Link Status becomes `Linked`.

## v1.54.1 Real Supabase Session Button Test

Verification status:

- Backend temporary E2E database `/tmp/ixai_v1541_e2e.db` upgraded cleanly to `0009_supabase_account_link`.
- Backend health and readiness passed on `localhost:8000`.
- Frontend local server was started with `IXAI_BACKEND_URL=http://localhost:8000`.
- Frontend `/api/backend/health` returned `backendUrlConfigured: true` and `ok: true`.
- Frontend unauthenticated `POST /api/pro/account-link` correctly returned `401 not_authenticated`.

Blocked:

- Local `/account` and production `/account` both showed the unauthenticated Account entry shell.
- No valid Supabase browser session or access token was available for the button-click test.
- The `Connect Pro Account` click cannot be verified without a real logged-in App user session.

Decision:

- Do not bypass Supabase auth.
- Do not inject fake cookies or create a parallel login path.
- Do not weaken the App → Next API → Backend boundary.

Next step:

- Sign in with a real Supabase App account and repeat the `/account` button test.
- Expected success criteria remain: `POST /api/pro/account-link` returns `ok: true`, backend creates/finds the account link, and Account Link Status becomes `Linked`.

## v1.54.2 Auth Session Recovery / Debug

Purpose:

- Diagnose why local / production `/account` could not reach an authenticated Supabase App state during v1.54.1.
- Add a safe server-side session debug endpoint without exposing Supabase tokens, refresh tokens, cookie values, full email, or full user id.

Root cause found:

- IXAI App currently stores the Supabase browser session in client-side `sessionStorage`.
- Next API routes cannot read that client storage directly.
- `/api/pro/access` can use a Supabase Bearer token when the client provides one, and can otherwise fall back to the older lightweight `ixai_identity` server cookie.
- `/api/pro/account-link` correctly requires a Supabase Bearer identity because backend account linking needs the Supabase user id.
- The older lightweight identity cookie contains email / membership continuity only; it does not contain the Supabase user id and must not be used to create backend account links.

Debug endpoint:

```text
GET /api/auth/session-debug
```

Returns only non-sensitive diagnostics:

- whether a valid Supabase Bearer session was detected
- whether a lightweight server cookie session was detected
- whether a user id / email is present without returning the values
- cookie count and masked cookie-name categories
- source: `bearer`, `server-cookie`, or `none`

Current blocker:

- A real logged-in browser session or valid Supabase access token is still required to complete the `/account` `Connect Pro Account` button test.
- Do not bypass Supabase auth, inject fake cookies, or use lightweight identity as a backend account-link identity.

Verification notes:

- Unauthenticated local request returned `source: none`, `hasSupabaseSession: false`, and `hasUser: false`.
- Lightweight `ixai_identity` cookie request returned `source: server-cookie`, `hasUser: true`, and `userIdPresent: false`.
- With lightweight identity only, `/api/pro/access` can show manual `connected` status, but `/api/pro/account-link` correctly remains `401 not_authenticated`.
- This confirms the required next test input is a real Supabase Bearer session, not a lightweight identity cookie.

## v1.54.3 Supabase Bearer Token Client Bridge

Purpose:

- Make the App → Next API account-link bridge explicit and auditable.
- Keep Supabase auth in the browser, but pass the current Supabase `access_token` to Next API routes as an `Authorization: Bearer` header when the user clicks account-link controls.

Client bridge:

```text
Browser Supabase session
→ supabase.auth.getSession()
→ session.access_token
→ Authorization: Bearer <access_token>
→ /api/pro/account-link
→ backend account-link
```

Implementation notes:

- `getSupabaseAuthorizationHeaders()` centralizes token-to-Bearer header creation.
- `/api/pro/access` and `/api/pro/account-link` use the same client-side Bearer bridge.
- `/api/pro/account-link` continues to reject anonymous requests and lightweight `ixai_identity`-only requests.
- No fake identity fallback, auth rewrite, Supabase schema change, backend change, Stripe, Portfolio, or FCN data access was added.

Expected authenticated result:

- `GET /api/auth/session-debug` with the Bearer header should report `source: bearer`, `hasSupabaseSession: true`, and `userIdPresent: true`.
- `POST /api/pro/account-link` should return `ok: true`.
- Account Link Status should become `Linked`.
- Linked remains identity-only and does not activate paid Pro access.

## v1.55.0 Membership Foundation

Purpose:

- Add the first shared membership / entitlement foundation between the IXAI App
  and IXAI Pro backend.
- Keep App account linking separate from paid Pro activation.
- Preserve Portfolio / FCN / Risk Engine as locked capabilities until future
  entitlement and product releases explicitly open them.

Membership source:

```text
Supabase App user
→ Next API Bearer verification
→ backend account link
→ backend membership / entitlements
→ sanitized /api/pro/membership response
→ /account Pro card
```

Default linked account state:

```text
plan_code = free
status = active
provider = manual
```

Default Free entitlements:

| Entitlement | Enabled |
| --- | --- |
| `daily_brief` | Yes |
| `weekly_brief` | Yes |
| `watchlist` | Yes |
| `pro_preview` | No |
| `portfolio` | No |
| `fcn_monitoring` | No |
| `risk_engine` | No |
| `ai_copilot` | No |

Production app behavior:

- `/api/pro/membership` verifies the Supabase Bearer token before calling the backend.
- The browser still does not call protected FastAPI endpoints directly.
- `/account` can display Membership as Free / Personal / Pro / Enterprise and
  show entitlement locks.
- Linked account does not equal paid Pro.
- Billing will come later; no Stripe or payment UI exists in v1.55.0.

Backend requirement:

- Production backend must run the v1.55 membership migration before
  `/api/pro/membership` can return backend membership state.
- Future migration execution should use protected CI/CD, paid Render Shell /
  Jobs, Railway one-off command, or a strongly authenticated internal mechanism.

## v1.56.0 Unified Identity Foundation

Purpose:

- Establish the first true SaaS feature-gate foundation for IXAI App and IXAI Pro.
- Treat Membership as the identity / plan layer.
- Treat Entitlements as the permission / feature-access layer.

Backend entitlement source:

```text
GET /api/v1/entitlements/me
```

Frontend proxy:

```text
GET /api/pro/entitlements
```

Current expected Free account state:

```text
plan = free
daily_brief = true
weekly_brief = true
watchlist = true
portfolio = false
fcn_monitoring = false
risk_engine = false
ai_copilot = false
```

Feature gate foundation:

- `canAccessPortfolio()`
- `canAccessFCN()`
- `canAccessRiskEngine()`

The `/account` Pro card can now show a Membership badge such as `FREE`,
`PERSONAL`, `PRO`, or `ENTERPRISE`, while keeping locked Pro capabilities
visibly separate from enabled Free features.

Still not included:

- Stripe.
- Billing.
- Portfolio Center.
- FCN Center.
- Risk Engine UI.
- AI Copilot.

## v1.56.1 Feature Gate UI

Purpose:

- Make the v1.56 entitlement layer visible inside the Account experience.
- Show users which future Pro capabilities are currently locked without
  implying paid access, broker connectivity, or real portfolio/FCN data.

Account UI additions:

- Portfolio Intelligence feature gate.
- FCN Monitoring feature gate.
- Risk Engine feature gate.

Current Free plan behavior:

- Daily Brief, Weekly Brief, and Watchlist remain enabled.
- Portfolio Intelligence remains locked.
- FCN Monitoring remains locked.
- Risk Engine remains locked.

Implementation:

- Reuses `src/lib/pro/feature-gates.ts`.
- Uses `canAccessPortfolio()`, `canAccessFCN()`, and
  `canAccessRiskEngine()` as the UI source of truth.
- Adds a small locked feature card with `Reserved for Pro` and
  `Upgrade path coming soon` messaging.

Out of scope:

- Stripe.
- Billing.
- Payment UI.
- Real Portfolio / FCN data.
- Risk Engine workflow UI.
- Legacy Pro frontend migration.

## v1.57.0 Pro Connection Completion

Purpose:

- Complete the first product-entry connection between IXAI App and IXAI Pro.
- Ensure identity, membership, entitlements, Account UI, and Pro module
  entrances all read the same feature-gate state.

Frontend changes:

- `/portfolio` now renders a Portfolio Intelligence feature-gated entrance.
- `/fcn` now renders an FCN Monitoring feature-gated entrance.
- `/risk` now renders a Risk Engine feature-gated entrance.
- `/pro` and `/pro-preview` can show Pro module availability from the same
  membership / entitlement state used by `/account`.

Free plan behavior:

- Portfolio Intelligence: `Reserved for Pro`.
- FCN Monitoring: `Reserved for Pro`.
- Risk Engine: `Reserved for Pro`.

Backend counterpart:

- Backend adds an internal-only manual entitlement test endpoint protected by
  `IXAI_ADMIN_INTERNAL_TOKEN`.
- Manual entitlement is for internal QA before Stripe and must not be treated as
  public billing or payment functionality.

Still not included:

- Stripe.
- Billing.
- Broker API.
- Real Portfolio / FCN data.
- Payment UI.
- Legacy Pro frontend migration.

## v1.58.0 Unified Pro Product Integration

Purpose:

- Move IXAI Pro from "linked identity plus locked entrances" into an in-app
  beta workspace.
- Make app.ixuan.ai the primary Pro product surface.
- Keep the legacy Pro Lab as reference-only, not the main login destination.

Beta Open Access policy:

```text
if betaOpenAccess && authenticated && accountLink.status = linked:
  portfolio = true
  fcn_monitoring = true
  risk_engine = true
```

Current beta behavior:

- Authenticated and account-linked users can enter `/portfolio`, `/fcn`, and
  `/risk` workspace skeletons.
- Free membership may still display as `FREE / BETA TESTER`.
- Portfolio / FCN / Risk workspaces show beta placeholders only.

Not included:

- Stripe.
- Billing.
- Broker API.
- Real Portfolio data.
- Real FCN data.
- Trading execution.
- Personalized investment advice.

Legacy Pro Lab:

- `frontend/ixai-website-clean` remains a legacy reference project.
- It is no longer the primary Pro product entry.
- New Pro workspace is inside `app.ixuan.ai`.

## Reusable Legacy Assets

High-value legacy assets to consider later:

- `RiskPill`
- `StatusBadge`
- `SummaryCard`
- `PortfolioEnginePanel`
- `MarketEnginePanel`
- `ScenarioSensitivityPanel`
- `DashboardTodayFocus`
- FCN position / schedule display pattern.
- Asset allocation layout.
- Alert center taxonomy.
- Backend API client contract ideas.

Do not directly migrate:

- Legacy JWT login.
- `localStorage` token auth.
- Direct browser-to-FastAPI protected requests.
- Whole legacy `AppShell` navigation.
- Terminal-heavy visual style.

## Recommended v1.51 Sequence

```text
v1.51.0
Project map + Pro integration plan + backend health proxy + Pro Lab link

v1.51.1
Backend health proxy QA + production env readiness

v1.51.2
Supabase user to backend account mapping design

v1.51.3
Backend account bridge prototype

v1.51.4+
Small reusable Pro widget migration
```
