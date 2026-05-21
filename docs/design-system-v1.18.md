# IXAI Design System v1.18

**Date**: 2026-05-21
**Direction**: Bloomberg Terminal × Apple × Linear × Notion
**Audience**: developers of both IXAI repos
**Scope**: shared visual language for Public App + Pro Dashboard. No business logic, no routing, no Supabase changes.

---

## 1. Direction and feeling

| We want | We don't want |
|---|---|
| Calm intelligence | Crypto neon |
| Institutional AI | Cyberpunk |
| Premium research terminal | Startup gradient overload |
| Low visual noise | "Marketing website" hero illustrations |
| Confidence + clarity | Engineering admin panel |
| Bloomberg-style information density (when needed) | Cramming every pixel |
| Apple-grade typographic restraint | 10+ font-sizes |
| Linear-style interaction discipline | Random animations |
| Notion-grade reading comfort | Wall-of-mono |

Two surface modes (one product, two roles):

- **Public App** = *editorial intelligence media layer* → **light editorial surface** (cream paper, forest text)
- **Pro Dashboard** = *operating system / intelligence workspace* → **dark workspace surface** (deep forest, cream text)

Both use the **same brand color triad** (forest / gold / cream), the **same typography scale**, the **same spacing scale**, and the **same component vocabulary**. Only the surface direction inverts.

---

## 2. Typography system (highest priority)

### 2.1 The scale (10 named sizes, 3 weights)

| Token | Size / line-height | Weight | Tracking | Usage |
|---|---|---|---|---|
| `display-xl` | 32px / 40px | 600 | -0.01em | page hero h1 |
| `display-lg` | 24px / 32px | 600 | -0.005em | panel h1 on hero panels (RiskFocus, /pro hero) |
| `heading-md` | 16px / 24px | 600 | 0 | panel h2 (`SectionCard` title) |
| `heading-sm` | 14px / 20px | 600 | 0 | sub-section h3 within panels |
| `body-md` | 14px / 22px | 400 | 0 | default body text (paragraphs, table cells) |
| `body-sm` | 13px / 20px | 400 | 0 | secondary body (meta lines, sub-text) |
| `label-md` | 11px / 14px | 500 | 0.18em uppercase | eyebrows, panel meta (e.g. "Daily intelligence") |
| `label-sm` | 10px / 12px | 500 | 0.22em uppercase | small eyebrows (sidebar groups) |
| `mono-md` | 13px / 18px | 500 | 0 | KPI value, tabular numeric |
| `mono-sm` | 11px / 14px | 500 | 0 | compact data row, timestamp |

### 2.2 Weight discipline

Use **three weights only**: 400 (body), 500 (mono / labels), 600 (headings + key values). No 300, no 700+. Heavier weight is for KPI numbers in mono, not for emphasis text.

### 2.3 Chinese readability rules

- Body text: `line-height: 1.6-1.7` for paragraphs containing Chinese. The Public App body already sets `1.7` — keep this.
- Do **not** use `tracking-tight` on Chinese — it crushes character spacing.
- Do **not** use `text-[10px]` for body content. Reserve 10px for label-sm only.
- Mixed Chinese-English paragraphs: prefer `font-sans` (Geist supports both well). Reserve `font-mono` for Latin / numeric only.
- Avoid uppercase Chinese — it doesn't exist and forces visual hacks.

### 2.4 Tracking discipline

- `display-xl`, `display-lg`: slight negative tracking (`-0.01em`, `-0.005em`) — premium feel
- `heading-md`, `heading-sm`, body: no tracking adjustment
- `label-md`, `label-sm`: wide tracking (`0.18em`, `0.22em`) only because uppercase Latin needs it
- Cap label tracking at `0.28em` (current pages have up to `0.32em` — too far apart, harder to read)

### 2.5 Where each token is used

| Surface | Token |
|---|---|
| Page H1 (`/`, `/dashboard`, `/intelligence`) | `display-xl` desktop / `display-lg` mobile |
| Hero panel H1 (RiskFocus title, /pro hero) | `display-lg` |
| `TerminalPanel` / `SectionCard` title | `heading-md` |
| Sub-section h3 inside panels | `heading-sm` |
| Paragraph body | `body-md` |
| Caption / secondary | `body-sm` |
| Eyebrow on panel header | `label-md` |
| Sidebar group label | `label-sm` |
| KPI numeric value | `mono-md` |
| Table cell numeric / timestamp | `mono-sm` |

### 2.6 Anti-patterns to retire

- ❌ `text-2xl md:text-3xl` for every page H1 — use `display-xl` token
- ❌ `text-[11px] font-medium uppercase tracking-[0.22em]` inline — use `<Eyebrow>` primitive (label-md)
- ❌ `text-xs` for table body rows on Pro Dashboard — use `body-sm` (13px)
- ❌ `font-mono` on navigation labels — sans is calmer
- ❌ Mixing 4+ weights on one page

---

## 3. Spacing system

### 3.1 The scale

`4 / 8 / 12 / 16 / 24 / 32` — six steps, mapped to Tailwind `1 / 2 / 3 / 4 / 6 / 8`.

### 3.2 Usage rules

| Context | Internal padding | Internal gap | Between siblings |
|---|---|---|---|
| Compact card / data row | 12 (p-3) | 8 (gap-2) | — |
| Standard card | 16 (p-4) | 12 (gap-3) | — |
| Hero card / page-level panel | 20-24 (p-5 sm:p-6) | 16 (gap-4) | — |
| Card stack inside a section | — | — | 16 (gap-4) |
| Section to section (mobile) | — | — | 20 (gap-5) |
| Section to section (desktop) | — | — | 24 (gap-6) |
| Section to section (between major tiers) | — | — | 32 (gap-8) reserved |
| Page-container top/bottom | 16-24 (py-4 sm:py-6) | — | — |
| Page-container side | 12-24 (px-3 sm:px-5 lg:px-6) | — | — |

### 3.3 Anti-patterns to retire

- ❌ `gap-3.5`, `py-3.5`, `px-2.5` — these are half-steps that fight the scale. Pick the nearest standard step.
- ❌ `p-4 sm:p-5` AND `p-4 sm:p-6` mixed in adjacent components — pick one cadence per surface.
- ❌ `mt-4` / `mt-6` / `mb-5` inline on a child element to fake spacing — use parent `gap-*` or `space-y-*`.

### 3.4 Vertical rhythm helper

For page containers, declare ONE of:

```tsx
className="flex flex-col gap-5 sm:gap-6"        // standard editorial page
className="flex flex-col gap-4 sm:gap-5"        // compact workspace page
className="flex flex-col gap-6 sm:gap-8"        // hero / landing page
```

Don't stack `space-y-4 mb-6 mt-5` combinations.

---

## 4. Color hierarchy

### 4.1 Brand triad (shared, both repos)

| Token | Value | Role |
|---|---|---|
| `--ixai-forest` | `#09291f` (Public) / `#061a14` (Pro) | Brand dark, primary surface for Pro, accent surface for Public |
| `--ixai-cream` | `#f5f0e6` | Brand light, primary text on Pro, primary surface for Public |
| `--ixai-gold` | `#b08d57` | Accent — eyebrows, gold separators, premium cues |

### 4.2 Semantic tokens (proposed unification — same names, surface-appropriate values)

Both repos define the **same token names**. Concrete values differ by surface mode.

| Token | Public (light editorial) | Pro (dark workspace) | Role |
|---|---|---|---|
| `--ixai-surface` | `#f5f0e6` (cream) | `#061a14` (forest deep) | Page background |
| `--ixai-surface-card` | `rgba(255,250,240,0.82)` | `rgba(15, 39, 30, 0.6)` | Card on top of surface |
| `--ixai-surface-elevated` | `#fffaf0` (paper) | `#0a211a` (forest-soft) | Hero panel / elevated card |
| `--ixai-text-strong` | `#10231b` (forest ink) | `#f5f0e6` (cream) | Body strong |
| `--ixai-text-muted` | `#64736b` | `rgba(245,240,230,0.70)` | Secondary text |
| `--ixai-text-subtle` | `rgba(16,35,27,0.55)` | `rgba(245,240,230,0.48)` | Hint / placeholder |
| `--ixai-border-subtle` | `#ded4c0` | `rgba(176,141,87,0.22)` | Default 1px border |
| `--ixai-border-strong` | `rgba(176,141,87,0.4)` | `rgba(176,141,87,0.45)` | Section separator |
| `--ixai-accent` | `#b08d57` (gold) | `#b08d57` (gold) | Brand accent |
| `--ixai-risk-clear` | `#5b7b6a` | `#7a9d8a` | Calm / clear state |
| `--ixai-risk-watch` | `#b08d57` | `#d4b58a` | Watch / attention |
| `--ixai-risk-elevated` | `#a86b3c` | `#d4946a` | Elevated risk |
| `--ixai-risk-critical` | `#9b3a3a` | `#d27a7a` | Critical risk |

Risk colors are **desaturated**. No emerald-500 / red-500. Bloomberg / Linear restraint.

### 4.3 What's not allowed

- ❌ Neon glow / box-shadow with bright color
- ❌ Linear gradients with brand colors (gold→forest gradients say "crypto exchange")
- ❌ `text-emerald-300`, `text-red-300`, `border-red-500/50` Tailwind colors — use the `--ixai-risk-*` tokens
- ❌ Any color saturation above ~50% — institutional aesthetic requires muted tones
- ❌ Pure white (`#ffffff`) text on dark — use cream `#f5f0e6` for warmth

### 4.4 Surface separation pattern

In the dark workspace (Pro Dashboard), card hierarchy uses:

```
surface (#061a14)
  └─ card (rgba(15,39,30,0.6))         ← default card
     └─ nested element (rgba(245,240,230,0.04))   ← input fields, sub-cards
```

In the light editorial (Public App), card hierarchy uses:

```
surface (#f5f0e6)
  └─ card (rgba(255,250,240,0.82))    ← default card
     └─ elevated (#fffaf0)              ← hero / featured panel
```

Each level should differ from its parent by ~3-5% lightness — enough to read, not enough to feel layered/heavy.

---

## 5. Icon system

### 5.1 Library

**`lucide-react`** — single icon library across both repos. Reasons:

- Stroke-based, matches Apple / Linear / Notion weight
- Tree-shakable per icon
- Free, MIT, no API key
- Comprehensive set (~1400 icons)

### 5.2 Sizing scale

| Token | Size | Usage |
|---|---|---|
| `icon-xs` | 12px | inline with body-sm |
| `icon-sm` | 14px | inline with body-md, sidebar nav |
| `icon-md` | 16px | default action icon (buttons) |
| `icon-lg` | 20px | section header icon |
| `icon-xl` | 24px | hero / empty-state icon |

### 5.3 Style rules

- `strokeWidth: 1.5` everywhere (matches Apple / Linear). Don't mix 1.5 and 2.
- Color: inherit from parent (`stroke="currentColor"` — lucide default)
- Spacing: `gap-1.5` between icon and label for `icon-sm`, `gap-2` for `icon-md`
- Don't decorate UI with icons. Use icons functionally: actions, states, navigation, never as ornament

### 5.4 Permitted icons (style guide)

For consistency, prefer the following icons for recurring concepts:

| Concept | Icon |
|---|---|
| Risk / warning | `AlertTriangle` |
| Status: healthy | `CircleCheck` |
| Status: watch | `CircleDashed` |
| Status: critical | `OctagonAlert` |
| Add | `Plus` |
| Settings | `Settings` |
| Watchlist | `Bookmark` |
| Daily brief | `Newspaper` |
| Weekly brief | `BookOpen` |
| Market | `LineChart` |
| Account | `UserRound` |
| Pro | `Sparkles` |
| External link | `ArrowUpRight` |
| Drill down | `ChevronRight` |

### 5.5 What's not allowed

- ❌ Emoji as icons (📈 ⚠️ ✅) — inconsistent rendering across OS
- ❌ Tabler / Heroicons / Feather mixed in
- ❌ Custom SVG icons unless brand assets (logo)

---

## 6. Sidebar refinement (Pro Dashboard primary target)

### 6.1 Goal

Transform from "admin panel nav" to "institutional intelligence navigation."

### 6.2 Pattern

Group nav items into 5 tiers with `label-sm` group headers in gold:

```
Daily
  · 投資總覽       (dashboard)
  · 每日簡報       (daily-brief equivalent if exposed)
  · AI 分析        (intelligence)

Market
  · 市場           (market)
  · 警示           (alerts)

Personal
  · 資產           (portfolio)
  · FCN           (fcn)
  · 資產輸入       (input)
  · 匯入           (import)

Membership
  · 帳戶           (accounts)
  · 設定           (settings)

Brand
  · 登出           (auth/logout)
```

### 6.3 Visual rules

- Background: `--ixai-surface` (forest)
- Inactive nav: `body-sm` cream-text at 55% alpha
- Hover: cream-text at 80% alpha + 4% cream background tint
- Active: cream-text at 100% alpha + 8% gold background tint + 2px gold left-border
- Group header: `label-sm` gold at 70% alpha, `px-3 mb-1`
- Item: `px-3 py-2` (8 vertical = consistent with body line-height)
- Group-to-group gap: 16 (gap-4)
- No mono font (use Geist sans)
- No emoji
- No badges unless critical (keep visual noise low)

### 6.4 What's not allowed

- ❌ Item count badges next to nav labels ("Alerts (3)")
- ❌ Icons on every nav item — only on group headers if anywhere
- ❌ Tooltip on every item
- ❌ Collapsible groups (this is desktop-first; users want stable nav)

---

## 7. Dashboard information density

### 7.1 Principles

1. **One primary focus per fold.** Hero panel (RiskFocus / Today Focus) is the only `display-lg` size content above the fold. Everything else is supporting.
2. **Three weight tiers, not equal cards.** Hero panel > standard panels > inline data rows. Each tier visually distinct.
3. **Wrap, don't shrink.** When information would force text below 13px, wrap to a second row instead. Don't crush readability.
4. **Group related, separate unrelated.** Use `SectionDivider` between conceptual tiers (already the v1.7 model). Within a tier, use `gap-4` to group, `gap-6` to separate.
5. **Numbers in mono, prose in sans.** Mixed paragraphs use sans; KPI strips use mono. No `font-mono` on multi-line body.

### 7.2 Card construction recipe

```
[Card]
  Eyebrow (label-md, gold)
  Title (heading-md, text-strong)
  ── optional sub-section divider (border-subtle) ──
  Body (body-md, text-strong)
  Meta footer (body-sm, text-muted)
```

Padding: `p-4` standard, `p-5 sm:p-6` for hero, `p-3` for compact data row.

### 7.3 KPI strip recipe (Pro Dashboard)

```
[Card]
  Eyebrow (label-md)
  Status badge (RiskPill)
  ── separator ──
  Metric row x N:
    label (label-md, muted)  ·  value (mono-md, strong)  ·  hint (body-sm, subtle)
```

Each metric on its own row, never crowded onto one line beyond 3 KPIs.

### 7.4 What's not allowed

- ❌ Equal-weight 4-card grids without dividers
- ❌ "Density modes" that hide content (compactMode should tighten spacing, not remove information)
- ❌ Tables with `border-collapse` and visible vertical borders — prefer horizontal dividers only

---

## 8. Public + Pro unification

### 8.1 Visual unification rules

| Element | Public | Pro | Unification |
|---|---|---|---|
| Brand color | cream + forest + gold | forest + cream + gold | **shared triad** |
| Body font | Geist Sans | Geist Sans | **shared** |
| Numeric font | Geist Mono | Geist Mono | **shared** |
| Typography scale | display/heading/body/label/mono tokens | same tokens | **shared** |
| Spacing scale | 4/8/12/16/24/32 | same | **shared** |
| Icon library | lucide-react | lucide-react | **shared (after adoption)** |
| Eyebrow / Section header pattern | gold uppercase + heading | same | **shared** |
| Card recipe | SectionCard + SectionHeader | TerminalPanel (rename later?) | **same recipe, different name OK** |
| Primary surface direction | light (cream) | dark (forest) | **inverse by role — intentional** |
| Risk color palette | desaturated | desaturated | **shared (`--ixai-risk-*`)** |

### 8.2 Naming alignment

Defer rename of `TerminalPanel` → `Panel` to keep code changes minimal in this sprint. The visual unification matters more than the symbol name.

### 8.3 What stays divergent (by role)

- Surface direction (light vs dark) — intentional, reflects editorial vs workspace use
- Page-level container width: Public uses `max-w-7xl`, Pro can use wider for tabular workspace pages — case-by-case
- Mobile bottom nav: Public has it (mobile-first), Pro doesn't (desktop-first)

---

## 9. Token implementation (CSS variable layer)

Both repos' `globals.css` define the same shared token names. The concrete values differ only in surface direction.

### 9.1 Public App `globals.css` proposed additions

```css
:root {
  /* existing tokens stay — additive only */

  /* v1.18 design system: shared token layer */
  --ixai-surface: var(--ixai-cream);
  --ixai-surface-card: rgba(255, 250, 240, 0.82);
  --ixai-surface-elevated: var(--ixai-paper);
  --ixai-text-strong: var(--ixai-forest);
  --ixai-text-muted: var(--ixai-ink-muted);
  --ixai-text-subtle: rgba(16, 35, 27, 0.55);
  --ixai-border-subtle: var(--ixai-border);
  --ixai-border-strong: rgba(176, 141, 87, 0.40);
  --ixai-accent: var(--ixai-gold);
  --ixai-risk-clear: #5b7b6a;
  --ixai-risk-watch: #b08d57;
  --ixai-risk-elevated: #a86b3c;
  --ixai-risk-critical: #9b3a3a;
}
```

### 9.2 Pro Dashboard `globals.css` proposed additions

```css
:root {
  /* existing tokens stay — additive only */

  /* v1.18 design system: shared token layer */
  --ixai-paper: #0a211a;
  --ixai-ink-muted: rgba(245, 240, 230, 0.70);
  --ixai-border: rgba(176, 141, 87, 0.22);
  --ixai-surface: var(--ixai-forest);
  --ixai-surface-card: rgba(15, 39, 30, 0.60);
  --ixai-surface-elevated: var(--ixai-forest-soft);
  --ixai-text-strong: var(--ixai-cream);
  --ixai-text-muted: var(--ixai-ink-muted);
  --ixai-text-subtle: rgba(245, 240, 230, 0.48);
  --ixai-border-subtle: var(--ixai-border);
  --ixai-border-strong: rgba(176, 141, 87, 0.45);
  --ixai-accent: var(--ixai-gold);
  --ixai-risk-clear: #7a9d8a;
  --ixai-risk-watch: #d4b58a;
  --ixai-risk-elevated: #d4946a;
  --ixai-risk-critical: #d27a7a;
}
```

**Important**: both repos use the **same token names**. Code can reference `var(--ixai-text-muted)` and look right in either.

### 9.3 Typography utility classes (both repos)

Add to globals.css after `:root`:

```css
/* v1.18 typography tokens */
.ds-display-xl { font-size: 32px; line-height: 40px; font-weight: 600; letter-spacing: -0.01em; }
.ds-display-lg { font-size: 24px; line-height: 32px; font-weight: 600; letter-spacing: -0.005em; }
.ds-heading-md { font-size: 16px; line-height: 24px; font-weight: 600; }
.ds-heading-sm { font-size: 14px; line-height: 20px; font-weight: 600; }
.ds-body-md    { font-size: 14px; line-height: 22px; font-weight: 400; }
.ds-body-sm    { font-size: 13px; line-height: 20px; font-weight: 400; }
.ds-label-md   { font-size: 11px; line-height: 14px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; }
.ds-label-sm   { font-size: 10px; line-height: 12px; font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase; }
.ds-mono-md    { font-size: 13px; line-height: 18px; font-weight: 500; font-family: var(--font-mono); }
.ds-mono-sm    { font-size: 11px; line-height: 14px; font-weight: 500; font-family: var(--font-mono); }
```

Adoption is opt-in. Components migrate gradually; nothing breaks.

---

## 10. Minimal-risk implementation plan

### Phase A — Foundation (this sprint)

1. ✅ Write this document
2. ✅ Land shared tokens in both repos' `globals.css` (additive only — no existing token redefined)
3. ✅ Land typography utility classes in both repos
4. ✅ Fix Pro Dashboard's `body { font-family: Arial }` regression (was missed during the dark forest reskin)
5. ✅ Refine Pro Dashboard sidebar to grouped 5-tier pattern
6. ✅ Lint + build both repos clean
7. Report deferred items as Phase B / C

### Phase B — Primitive adoption (next sprint, ~2 days)

8. Adopt typography utility classes inside `<Eyebrow>`, `<SectionDivider>`, `<SectionTitle>`, `<MetricCard>` primitives (Public App)
9. Adopt token names inside Pro Dashboard `TerminalPanel`, `StatusBadge`, `RiskPill` primitives
10. Add `lucide-react` to both repos, replace 3-5 existing inline SVG icons (if any) as proof
11. Replace P0/P1/P2 SectionDivider labels with investor-readable labels (`今日重點 / 市場與風險 / 深入分析`)

### Phase C — Surface sweep (next sprint, ~3 days)

12. Apply token system to Pro Dashboard `/dashboard` page hero strip + KPI cards
13. Apply token system to Pro Dashboard `/intelligence` page section dividers
14. Replace remaining `text-zinc-*`, `border-zinc-*`, `bg-zinc-*` in Pro Dashboard with semantic tokens
15. Public App: replace 1-2 ad-hoc `text-[11px] uppercase tracking-[0.22em]` inlines (audit found 28+ originally; v1.6.3 cleared the dashboard ones)

### Phase D — Icon adoption (next sprint, ~2 days)

16. Audit all current icon usage across both repos
17. Replace inline SVG / emoji icons with lucide-react
18. Standardize stroke-width = 1.5, color = currentColor, sizes per scale

### Phase E — Pre-PWA polish (right before PWA sprint)

19. Production URL move: `ixai-website-clean.vercel.app` → `pro.ixai.app` or similar
20. Final mobile tap-target sweep
21. Verify OG / social preview rendering
22. PWA install prompt timing decision

---

## 11. What this sprint deliberately does not change

- ❌ Routes, APIs, Supabase schemas, backend logic, deployment flow
- ❌ Component public APIs (props don't change)
- ❌ Page architecture (no page rewrites)
- ❌ Brand identity (forest / gold / cream stays)
- ❌ Editorial CMS / admin auth flow
- ❌ Engine APIs (engine-summary / market-engine signatures stable)
- ❌ Existing token names (we only **add** new ones)
- ❌ Animation / motion (no transitions added in this pass; keep static)

## 12. Success criteria

After Phase A lands:

- [ ] Both repos define the same `--ixai-surface*`, `--ixai-text-*`, `--ixai-border-*`, `--ixai-risk-*` token names
- [ ] Both repos use Geist Sans body (Pro Dashboard's Arial regression fixed)
- [ ] Pro Dashboard sidebar shows 5 grouped tiers with gold `label-sm` group headers
- [ ] `npm run lint` clean both repos
- [ ] `npm run build` clean both repos
- [ ] No visual regression on Public App homepage / pages
- [ ] Pro Dashboard `/dashboard` still renders all its data — only chrome refined
- [ ] No new dependencies added (lucide-react deferred to Phase D)

After Phases B-D: components stop using inline tracking / size literals and migrate to `ds-*` utility classes or token references; risk colors stop using raw Tailwind palette.

---

**Owner**: ecosystem team
**Status**: Phase A landing in this sprint; B-E deferred to next sprints to keep PR size small and reviewable.
