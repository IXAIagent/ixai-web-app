# IXAI Project Map

This document classifies the main IXAI project folders so future AI agents do not confuse the active production app with legacy prototypes or side projects.

## Active Project Roles

```text
/Users/itsunkuo/Desktop/IXAI_PROJECTS
├─ app/ixai-web-app
│  └─ Active Production App
├─ backend/ixai_agent
│  └─ Active backend mainline candidate
├─ frontend/ixai-website-clean
│  └─ IXAI Pro Legacy Dashboard Prototype
└─ brand/ixuan-brand-site
   └─ Brand / Social Kit
```

## app/ixai-web-app

Role:

- Active Production App.
- Current Vercel / public app mainline.
- Owns the public IXAI experience: landing, onboarding, Daily Brief, Weekly Intelligence, Share Intelligence, Account, Pro Preview, Admin Editorial Studio, and Social Intelligence Pack Studio.

Production data ownership update:

- `app/ixai-web-app` now owns the real Portfolio / FCN production data layer.
- Production persistence contracts include `portfolios`, `fcn_positions`, `fcn_underlyings`, `stock_positions`, and `crypto_positions`.
- v1.87 adds the App-native Multi-Asset Portfolio abstraction for FCN, Stocks, Crypto, Grid, Dual, and Cash.
- v1.88 adds `/my-ixai/portfolio` as the first App-native Portfolio Center UI, while `/portfolio` remains the Portfolio Input route.
- v1.89 adds an IXAI Architecture Map inside `/my-ixai/portfolio` so users can see enabled Portfolio, Risk, Intelligence, Membership, and Readback modules.
- v1.90 adds `/my-ixai/input` as the Asset Input Hub and introduces the App-native global asset input model foundation for Manual Input, CSV Import, Broker Sync, Exchange Sync, Bank Statement Import, global regions, and multi-language readiness.
- v1.91 adds `/my-ixai/portfolio/assets` as the mock-only Asset Management Center for Portfolio CRUD Foundation. It validates CRUD UI and state behavior but does not write to Supabase.
- v1.92 adds the formal Portfolio Account → Asset → Position data model foundation and additive Supabase schema foundation for future persistent asset CRUD.
- Future Pro features should be built inside `app/ixai-web-app` instead of migrating the whole legacy frontend.
- Legacy Pro is reference-only and should gradually retire as App-native Portfolio, FCN, and Risk workflows mature.

Current architecture:

- Next.js App Router.
- Supabase / Next API routes / editorial static and dynamic intelligence.
- Public Intelligence, Account Intelligence, Social Intelligence, Daily / Weekly engines, and admin workflows.
- Multi-Asset Portfolio architecture:

```text
Portfolio
├─ FCN
├─ Stocks
├─ Crypto
├─ Grid
├─ Dual
└─ Cash
```

Portfolio data model foundation:

```text
Portfolio Account
↓
Portfolio Asset
↓
Portfolio Position
```

- Portfolio route split:
  - `/portfolio`: Portfolio Input, creation, and product explanation.
  - `/my-ixai/portfolio`: Portfolio Center dashboard, readback, and architecture visualization.
  - `/my-ixai/input`: Asset Input Hub, global input model foundation, CSV / broker / market / language readiness.
  - `/my-ixai/portfolio/assets`: Asset Management Center, mock CRUD foundation, future persistent asset CRUD staging area.

This is the future product mainline.

Social Pack Note:

- Social Pack is a distribution asset for reviewed intelligence. It is not the core judgment engine.
- Do not let Social Pack hotfixes or export tooling destabilize Daily / Weekly intelligence, account memory, Portfolio Intelligence, or Pro workflow development.
- Future Social Pack work must follow `docs/SOCIAL_PACK_INCIDENT_REVIEW_20260609.md`.

## backend/ixai_agent

Role:

- Active backend mainline candidate.
- FastAPI service for portfolio, FCN, crypto, cash, account, intelligence, alert, import, preferences, and market endpoints.

Current architecture:

- FastAPI.
- SQLAlchemy.
- Alembic.
- Local SQLite for development with PostgreSQL-compatible migration direction.
- JWT auth currently separate from the production frontend's Supabase identity model.

Future integration should happen through a clear boundary, likely a Next API proxy / backend client layer that maps Supabase identity to backend account context.

## frontend/ixai-website-clean

Role:

- IXAI Pro Legacy Dashboard Prototype.
- Not the production frontend.
- Valuable as a reference for future Account / Pro / Portfolio Intelligence surfaces.

Current architecture:

- Next.js App Router.
- FastAPI JWT auth.
- `localStorage` token storage.
- Direct browser-to-FastAPI protected requests via `NEXT_PUBLIC_API_BASE_URL`.

High-value reusable modules:

- `RiskPill`
- `StatusBadge`
- `SummaryCard`
- `PortfolioEnginePanel`
- `MarketEnginePanel`
- `ScenarioSensitivityPanel`
- `DashboardTodayFocus`
- FCN position / schedule display pattern
- Asset allocation layout
- Alert center taxonomy
- Backend API client contract ideas

Not recommended for direct migration:

- Legacy JWT login.
- `localStorage` token auth.
- Direct browser-to-FastAPI protected requests.
- Whole `AppShell` navigation.
- Terminal-heavy visual style.

Migration strategy:

- Do not move the whole legacy frontend into production.
- Reuse selected UI patterns, portfolio widgets, FCN risk information architecture, and backend contract ideas.
- First build a backend integration boundary in `app/ixai-web-app`, then migrate small reusable widgets.

## brand/ixuan-brand-site

Role:

- Brand / Social Kit side project.
- Useful for brand reference, content direction, and future visual/social assets.
- Not the production IXAI app mainline.

## Naming Guidance

Future agents should treat `frontend/ixai-website-clean` as a legacy reference project. If the folder is renamed later, `legacy-pro-dashboard` would be a clearer name, but no folder should be moved or deleted without explicit approval.
