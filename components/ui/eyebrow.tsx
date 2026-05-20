// v1.6.3 (U1): canonical IXAI eyebrow label.
// Replaces 28+ inline duplicates of the gold uppercase tracking-wide pattern.
// Keeps brand identity (gold accent on cream background) consistent.

import type { ReactNode } from "react";

type Tone = "gold" | "forest" | "muted" | "cream";

const TONE_CLASS: Record<Tone, string> = {
  gold: "text-[var(--ixai-gold)]",
  forest: "text-[var(--ixai-forest)]",
  muted: "text-[var(--ixai-ink-muted)]",
  cream: "text-[var(--ixai-cream)]",
};

type Density = "regular" | "wide" | "extra-wide";

const DENSITY_CLASS: Record<Density, string> = {
  regular: "tracking-[0.18em]",
  wide: "tracking-[0.22em]",
  "extra-wide": "tracking-[0.28em]",
};

export function Eyebrow({
  children,
  tone = "gold",
  density = "wide",
  mono = false,
  className = "",
}: Readonly<{
  children: ReactNode;
  tone?: Tone;
  density?: Density;
  /** Use Geist Mono — matches the existing forest-panel eyebrows in market-pulse / sidebar. */
  mono?: boolean;
  className?: string;
}>) {
  return (
    <p
      className={`text-[11px] font-medium uppercase ${DENSITY_CLASS[density]} ${TONE_CLASS[tone]} ${mono ? "font-mono" : ""} ${className}`}
    >
      {children}
    </p>
  );
}
