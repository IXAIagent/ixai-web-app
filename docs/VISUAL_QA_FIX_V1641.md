# IXAI v1.64.1 — Visual QA Fix

**Status:** Fix-only. Targeted at the specific issues found in live visual QA after v1.64.0.
**Scope:** Public Intelligence Engine block placement; low-contrast icons on /pro, /account, /portfolio, /risk; /pro CTA text visibility.
**Out of scope:** SSO, auth, Daily/Weekly generation engine, FCN education content, backend, full design-system pass.

---

## 1. What was still wrong after v1.64.0

Three live-QA findings:

1. **Public Intelligence Engine block was still being rendered on Daily and Weekly pages.** v1.63.1 was supposed to leave these pages reading-first, but the `<PublicIntelligenceEngine>` component was still injected by `DailyBriefUnifiedArchive` (`/daily-brief`), by `app/daily-brief/[slug]/page.tsx`, by `components/daily-brief/daily-brief-local-detail.tsx`, and by `app/weekly-brief/[slug]/page.tsx`. The v1.64.0 audit assumed those pages were already clean; the audit was wrong.

2. **Pale-gold-outline icons on beige cards.** The shared `LockedFeatureCard` rendered a 28×28 icon container with `bg-white/55` + `text-[var(--ixai-gold)]` — gold-on-cream-on-cream, very faint. This card is used by `FeatureGatedPage`, which is the entire body of `/portfolio` and `/risk`. The same pale-gold-on-cream pattern appeared on `/account` in `watchlist-intelligence-lite.tsx` and on the disclaimer aside within the same component.

3. **Off-token utility classes on Pro module surfaces.** `FeatureGatedPage` used `border-amber-700/20 bg-amber-50/80 text-amber-950` for the locked-state instruction box; `LockedFeatureCard` used `border-emerald-700/20 bg-emerald-50/70 text-emerald-950` for the enabled state. Both bypass the IXAI risk-token palette.

4. **/pro CTA text visibility:** verified during the fix. All /pro CTAs already route through `.ixai-cta-cream` and `.ixai-cta-forest` design-token classes (cream-on-forest and forest-on-cream). No change required for this item.

---

## 2. Pages fixed

| Surface | Issue | Fix |
|---|---|---|
| `/daily-brief` | PIE rendered via `DailyBriefUnifiedArchive` | Removed import + render; left placement-rule comment |
| `/daily-brief/[slug]` (server) | PIE rendered directly | Removed import + render |
| `/daily-brief/[slug]` (local detail) | PIE rendered by `DailyBriefLocalDetail` | Removed import + render |
| `/weekly-brief/[slug]` | PIE rendered directly | Removed import + render |
| `/portfolio`, `/risk` | Pale icon + amber/emerald off-token boxes via `FeatureGatedPage` + `LockedFeatureCard` | Forest+gold icon containers; risk-watch + risk-clear color-mix tokens |
| `/account` (page) | Bare gold leading glyphs on cream feedback buttons | Leading glyphs now use forest color (match button text); trailing arrows stay gold |
| `/account` (WatchlistIntelligenceLite) | Brain icon in faint gold-tint container + ShieldCheck in faint gold-tint aside | Both converted to forest+gold pattern with shadow |

Pages NOT modified (already in correct shape):
- `/weekly-brief` (index) — never carried PIE
- `/pro` page hero — all CTAs already token-driven
- `/pro` workspace hub — already updated in v1.64.0 with FCN-primary hierarchy + token pills

PIE block was **kept** on the homepage (`components/home/intelligence-landing.tsx:185`) and on `/share` + `/share/intelligence/[slug]` per the placement rule.

---

## 3. Icon contrast rule (codified in PROJECT_RULES)

Card icons and badge icons on light (cream / white) surfaces must follow:

- **Container:** dark forest background (`bg-[var(--ixai-forest)]`).
- **Symbol:** gold (`text-[var(--ixai-gold)]`) for accent moments, cream (`text-[var(--ixai-cream)]`) for state-success / confirmation moments.
- **Border:** visible — at least `border-[rgba(9,41,31,0.32)]`. Optional soft shadow `shadow-[0_4px_10px_rgba(9,41,31,0.10)]` for elevated cards.
- **Size:** at least 32×32 (`h-8 w-8`); prefer 36×36 (`h-9 w-9`) for primary card icons.
- **Glyph:** ≥ 16×16 (`h-4 w-4`).

Inline button glyphs (16×16 alongside button text) are allowed without a container, but their color **must** match the button's text color, not a faint accent. Trailing forward-action glyphs (e.g., ArrowRight, ArrowUpRight) may keep `text-[var(--ixai-gold)]` as a forward-cue accent.

Forbidden patterns:
- `bg-[rgba(176,141,87,0.10)]` / `bg-[rgba(176,141,87,0.13)]` icon container on cream surface (faint gold-on-cream).
- Pale gold icons (`text-[var(--ixai-gold)]` at h-4 w-4) on `bg-white/55` without a container.
- Off-token Tailwind utility colors for state pills: `border-emerald-*`, `bg-emerald-*`, `text-emerald-*`, `border-amber-*`, `bg-amber-*`, `text-amber-*`, `border-red-*`, `bg-red-*`, `text-red-*`. Use the v1.39.3 `color-mix(in srgb, var(--ixai-risk-*), ...)` pattern instead.

---

## 4. Public Intelligence Engine placement rule (codified in PROJECT_RULES)

`<PublicIntelligenceEngine>` is a **homepage and acquisition surface** component. It explains the IXAI public intelligence engine architecture (Market Pulse / Macro Watch / AI Tech Watch / Crypto Watch / FCN Awareness / Risk Regime).

| Surface | Render? | Why |
|---|---|---|
| Homepage `/` | **Yes** | Tells first-time visitors what the engine includes |
| `/share` | **Yes** | Off-site acquisition landing |
| `/share/intelligence/[slug]` | **Yes** | Off-site acquisition landing |
| `/daily-brief` (archive) | **No** | Reading-first; v1.62.1 narrative engine guarantees |
| `/daily-brief/[slug]` (detail) | **No** | Reading-first |
| `/weekly-brief` (archive) | **No** | Reading-first |
| `/weekly-brief/[slug]` (detail) | **No** | Reading-first |
| `/pro`, `/pro-preview`, `/pro-intelligence` | **No** | Pro is the conversion surface, not the architecture explainer |
| `/account` | **No** | Workspace surface |

Future contributors: do not re-add `<PublicIntelligenceEngine>` to Daily / Weekly / Pro / Account pages without an explicit product decision. Search hits during code review should fail the diff if a Daily/Weekly page reintroduces the import.

---

## 5. Files changed

| File | Change |
|---|---|
| `components/daily-brief/daily-brief-unified-archive.tsx` | Remove PIE import + render |
| `components/daily-brief/daily-brief-local-detail.tsx` | Remove PIE import + render |
| `app/daily-brief/[slug]/page.tsx` | Remove PIE import + render |
| `app/weekly-brief/[slug]/page.tsx` | Remove PIE import + render |
| `components/pro/locked-feature-card.tsx` | Forest+gold icon container; risk-clear color-mix tokens for enabled state; no off-token emerald |
| `components/pro/feature-gated-page.tsx` | Replace amber gate-instruction box with forest-iconed risk-watch color-mix block |
| `components/account/watchlist-intelligence-lite.tsx` | Brain icon container (line ~44) + ShieldCheck aside (line ~178) converted to forest+gold |
| `app/account/page.tsx` | Feedback button leading glyphs (MessageSquare, Bug) now use forest text color |
| `docs/VISUAL_QA_FIX_V1641.md` | New: this document |
| `docs/PROJECT_CONTEXT.md` | Current Version → v1.64.1 |
| `docs/ROADMAP.md` | Current Version → v1.64.1; v1.64.1 entry |
| `docs/VERSION_HISTORY.md` | v1.64.1 entry |
| `docs/PROJECT_RULES.md` | Add Icon Contrast Rule + PIE Placement Rule sections |

No SSO, auth, Supabase, JWT, backend, content engine, generator, provider, broker, or payment touched. No FCN education content changed.

---

## 6. Rollback plan

Per-file:
- PIE removal: `git checkout HEAD -- <each affected file>` restores the import + render block.
- LockedFeatureCard: file-level revert; no consumers changed.
- FeatureGatedPage amber block: file-level revert.
- WatchlistIntelligenceLite icon: file-level revert.
- Account page glyphs: file-level revert.

No SQL, no env, no data migration. Rollback is safe at file level.

---

## 7. Validation gate

After implementation:
- `npm run lint` clean
- `npm run build` green; route manifest preserved
- `git diff --check` no whitespace errors
- `QA_PORT=3001 npm run qa:mobile` 15/15 PASS
- Manual visual inspection: `/daily-brief`, `/weekly-brief`, `/pro`, `/account`, `/portfolio`, `/risk` — confirm no PIE block on Daily/Weekly, confirm strong forest+gold icon contrast on /portfolio + /risk locked states, confirm /account feedback button glyphs are readable.

No commit, no push per the v1.64.1 directive. The user reviews and decides commit scope.
