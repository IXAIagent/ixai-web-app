# v3.04 — Asset Input Center

## Objective

v3.04 creates the canonical Workspace entry point for asset onboarding:

```text
Login
↓
IXAI Workspace
↓
Asset Input
↓
Portfolio / Risk / Intelligence
```

The goal is not to add a new engine or data model. The goal is to make it obvious where a logged-in user should create holdings before expecting Portfolio Center, Risk Center, FCN Center, or Intelligence Center to read them.

## Scope

- Add `/my-ixai/input` as the user-facing Asset Input Center.
- Add Workspace child routes for:
  - `/my-ixai/input/stock`
  - `/my-ixai/input/crypto`
  - `/my-ixai/input/fcn`
- Move FCN Wizard ownership from public `/fcn` into `/my-ixai/input/fcn`.
- Keep public `/fcn` as education, Worst-of explanation, KI / KO explanation, risk examples, and CTA into Workspace.
- Add Asset Input to Workspace navigation.
- Add quick asset shortcuts to Workspace Home.

## Information Architecture

Workspace should now read as:

```text
Workspace Home
Portfolio Center
Asset Input
├─ Stock
├─ ETF
├─ Crypto
└─ FCN
Risk Center
FCN Center
Intelligence Center
Settings
```

## Public FCN Boundary

Public `/fcn` remains a public education and conversion surface.

It should not own:

- FCN Wizard.
- FCN data entry.
- Portfolio readback.
- Personal FCN monitoring workflow.

It may keep:

- FCN education.
- Worst-of explanation.
- KI / KO explanation.
- Risk examples.
- FAQ / advisory context.
- CTA into Workspace Asset Input.

## Workspace FCN Ownership

`/my-ixai/input/fcn` now owns the FCN Wizard.

This keeps the user's mental model simple:

```text
登入
→ Workspace
→ Asset Input
→ 新增 FCN
→ Portfolio / Risk / FCN Center readback
```

## Route Changes

- `/my-ixai/input`: Asset Input Center landing page.
- `/my-ixai/input/fcn`: FCN Wizard route.
- `/my-ixai/input/stock`: Stock / ETF input foundation placeholder.
- `/my-ixai/input/crypto`: Crypto input foundation placeholder.
- `/fcn`: Public education-only surface with Workspace CTA.

## Navigation Changes

Workspace navigation now includes:

- Workspace Home.
- Portfolio Center.
- Asset Input.
- Risk Center.
- FCN Center.
- Intelligence Center.
- Settings.
- 返回官網.

Public navigation remains separate and does not show Workspace-only module lists.

## Out of Scope

v3.04 does not add:

- Supabase schema changes.
- Migrations.
- New API routes.
- Broker integrations.
- Market data providers.
- Recommendation logic.
- Auth changes.
- Membership changes.
- Payment.
- Trading functionality.

## Validation Checklist

- `/my-ixai/input` loads.
- `/my-ixai/input/fcn` loads and shows FCN Wizard.
- `/my-ixai/input/stock` loads as foundation placeholder.
- `/my-ixai/input/crypto` loads as foundation placeholder.
- `/fcn` loads without FCN Wizard.
- Workspace navigation shows Asset Input.
- Workspace Home shows quick asset shortcuts.
- Mobile layout has no horizontal overflow.
- `git diff --check` passes.
- `npm run lint` passes.
- `npm run build` passes.
- `QA_PORT=3001 npm run qa:mobile` passes.

## Next

v3.05 can begin separating Risk Center ownership or polishing Asset Input child routes, but should not add provider integrations until the Workspace IA is stable.
