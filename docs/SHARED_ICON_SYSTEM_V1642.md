# IXAI v1.64.2 — Shared Icon System + Visual Screenshot QA

**Status:** Implementation + screenshot QA tooling.
**Scope:** Single shared `<FeatureIcon>` primitive that codifies the Icon Contrast Rule (PROJECT_RULES §C, v1.64.1). Migration of /pro, /account, /portfolio, /risk consumers. Screenshot script.
**Out of scope (per the v1.64.2 brief):** Daily / Weekly content, Public Intelligence Engine, FCN education content, Pro copywriting, Account layout, SSO, Auth, Backend, Provider, any generation engine.

---

## 1. Why this cut

After v1.64.1, the icon-contrast rule was codified in PROJECT_RULES but each consumer still inline-styled its own 36×36 forest container. That created drift surface area:

- Tiny size differences (`h-9` vs `h-10`)
- Slight border-opacity variations (`0.24` / `0.28` / `0.32` / `0.34`)
- Inconsistent shadow specs
- New v1.64.0 pages (`/pro`, `/fcn`) had repeated `<span>` markup in place of a shared component

A future contributor could easily slip a pale-gold-on-cream pattern back in. The shared primitive removes that risk and makes the rule self-enforcing: if you want a card icon, you import `<FeatureIcon>` and you cannot mis-size it.

---

## 2. Shared icon rule (codified in code)

`components/ui/feature-icon.tsx` exports `<FeatureIcon>`. Default usage:

```tsx
import { Brain } from "lucide-react";
import { FeatureIcon } from "@/components/ui/feature-icon";

<FeatureIcon icon={Brain} />
```

Renders:
- 36×36 dark-forest container
- gold glyph
- `border-[rgba(9,41,31,0.34)]`
- `shadow-[0_6px_14px_rgba(9,41,31,0.12)]`

Props:
| Prop | Type | Default | Notes |
|---|---|---|---|
| `icon` | `LucideIcon` | — | Required |
| `size` | `"md"` \| `"sm"` | `"md"` | md = 36×36 (h-9 w-9), sm = 32×32 (h-8 w-8) |
| `tone` | `"gold"` \| `"cream"` | `"gold"` | gold for accent, cream for success/confirmation |
| `shadow` | `boolean` | `true` | Drop the shadow for inline rows / asides |
| `className` | `string` | `""` | For positioning (`mt-0.5`, `shrink-0` overrides) only |

Minimum sizes enforced:
- `md` = 36×36 → meets the "≥ 36×36" Icon Contrast Rule for primary cards
- `sm` = 32×32 → meets the "≥ 32×32" floor for compact / aside rows

The component does not let you go smaller — that's intentional.

---

## 3. Files changed

| File | Change |
|---|---|
| `components/ui/feature-icon.tsx` | **NEW** — shared `<FeatureIcon>` primitive |
| `components/pro/locked-feature-card.tsx` | Migrated locked / enabled icon to `<FeatureIcon>` (used by /portfolio, /risk) |
| `components/pro/feature-gated-page.tsx` | Migrated gate-instruction ShieldCheck to `<FeatureIcon>` (used by /portfolio, /risk) |
| `components/account/watchlist-intelligence-lite.tsx` | Migrated Brain card icon + ShieldCheck disclaimer aside to `<FeatureIcon>` (used by /account) |
| `components/pro/pro-workspace-hub.tsx` | Migrated 3 module icons to `<FeatureIcon>` (used by /pro) |
| `app/pro/page.tsx` | Migrated pain-point card icons + App-vs-Pro AlarmClock to `<FeatureIcon>` |
| `scripts/qa-visual.mjs` | **NEW** — Playwright-driven screenshot QA for /pro /account /portfolio /risk |
| `package.json` | New `qa:visual` script |
| `.gitignore` | Ignore `/tmp` (screenshots are local artefacts) |
| `docs/SHARED_ICON_SYSTEM_V1642.md` | **NEW** — this document |
| `docs/PROJECT_CONTEXT.md` | Current Version → v1.64.2 |
| `docs/ROADMAP.md` | Current Version → v1.64.2; v1.64.2 entry |
| `docs/VERSION_HISTORY.md` | v1.64.2 entry (Why / What / Key Decisions / Out of Scope) |

**Not modified** (per the v1.64.2 "do not change" list):
- Daily / Weekly content surfaces
- `<PublicIntelligenceEngine>` and its consumers
- `/fcn` education page (icons are already in v1.64.0 correct shape; not in v1.64.2 scope)
- /pro copy, /account layout
- All home component children (`brief-gateway`, `pricing-what`, `important-events`, etc.) — deferred to a future design-system pass

---

## 4. Pages visually checked

Screenshot QA captured PNGs for the four target surfaces via `npm run qa:visual` at 390×844 mobile viewport:

- `/pro`
- `/account`
- `/portfolio`
- `/risk`

Screenshots saved to `tmp/visual-qa/<route>-<timestamp>.png` (gitignored).

---

## 5. Screenshot QA result

See report section.

The Playwright script lands on each route, waits 1.5s for client-side hydration + Pro entitlement fetches to settle, and saves a full-page PNG. The screenshots can be opened in any image viewer and compared against the pre-v1.64.2 baseline to verify:

- No pale-gold-on-cream icon containers in the main cards.
- All forest icon containers at consistent 36×36 size with consistent border + shadow.
- Button text remains readable (CTA cream-on-forest + forest-on-cream unchanged).
- Layout intact — `<FeatureIcon>` is a drop-in span replacement; no flex/grid math changed.

---

## 6. Rollback plan

`<FeatureIcon>` is additive — the previous inline `<span>` markup can be restored at any time per consumer file. Safe rollback paths:

- **Per-consumer rollback:** `git checkout HEAD -- <consumer>.tsx`. The `<FeatureIcon>` import becomes unused; remove the import line.
- **Full v1.64.2 rollback:** revert the commit. Working tree returns to v1.64.1 state. `components/ui/feature-icon.tsx` becomes dead code — safe to leave for now or delete in a follow-up.
- **Visual diff verification:** the screenshot QA script can be re-run before and after to compare PNGs side by side.

No SQL, no env, no data, no auth, no API surface touched. Rollback is fully local-file-level.

---

## 7. Validation gate

- `npm run lint` clean
- `npm run build` green; route manifest preserved
- `git diff --check` no whitespace errors
- `QA_PORT=3001 npm run qa:mobile` 15/15 PASS (no regression vs v1.64.1)
- `QA_PORT=3001 npm run qa:visual` captures 4 PNGs at `tmp/visual-qa/`

No commit, no push per the v1.64.2 directive. The user reviews and decides commit scope.
