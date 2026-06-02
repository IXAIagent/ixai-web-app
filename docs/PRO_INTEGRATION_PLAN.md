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
