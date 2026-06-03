import type { LucideIcon } from "lucide-react";

// v1.64.2 — Shared icon container for any feature/card/badge icon that
// sits on a light (cream / white) surface. Codifies the Icon Contrast
// Rule (PROJECT_RULES §C, added in v1.64.1):
//
//   - dark forest background
//   - gold or cream symbol depending on intent
//   - visible border (≥ 0.32 forest opacity)
//   - 36×36 by default, 32×32 for `sm`
//   - readable at normal browser zoom on cream / white surfaces
//
// Tones:
//   "gold"   — accent / brand moment (default). Forest container, gold symbol.
//   "cream"  — confirmation / success moment. Forest container, cream symbol.
//
// Sizes:
//   "md" — 36×36 (default; primary card icons)
//   "sm" — 32×32 (compact / aside / disclaimer rows)
//
// Forbidden by design: pale-gold-tint container on cream, gold symbol
// without a container, off-token Tailwind utility colors. If a usage
// can't be solved with `<FeatureIcon>`, write a one-off comment
// explaining why — but consumers should prefer this primitive.

const SIZE_CLASSES = {
  md: {
    container: "h-9 w-9",
    glyph: "h-4 w-4",
  },
  sm: {
    container: "h-8 w-8",
    glyph: "h-3.5 w-3.5",
  },
} as const;

const TONE_GLYPH_COLOR = {
  gold: "text-[var(--ixai-gold)]",
  cream: "text-[var(--ixai-cream)]",
} as const;

export type FeatureIconSize = keyof typeof SIZE_CLASSES;
export type FeatureIconTone = keyof typeof TONE_GLYPH_COLOR;

export function FeatureIcon({
  icon: Icon,
  size = "md",
  tone = "gold",
  shadow = true,
  className = "",
}: {
  icon: LucideIcon;
  size?: FeatureIconSize;
  tone?: FeatureIconTone;
  shadow?: boolean;
  className?: string;
}) {
  const { container, glyph } = SIZE_CLASSES[size];
  const glyphColor = TONE_GLYPH_COLOR[tone];
  const shadowClass = shadow ? "shadow-[0_6px_14px_rgba(9,41,31,0.12)]" : "";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg border border-[rgba(9,41,31,0.34)] bg-[var(--ixai-forest)] ${container} ${shadowClass} ${className}`.trim()}
    >
      <Icon className={`${glyph} ${glyphColor}`} aria-hidden="true" />
    </span>
  );
}
