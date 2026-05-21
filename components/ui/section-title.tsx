// v1.6.3 (U1): mid-tier h3 used inside SectionCard bodies for sub-sections.
// Lives between SectionHeader (panel-level h2) and inline labels — gives
// pages a real typographic ladder instead of the binary big-H1 / dense-xs
// split flagged in the audit.

import type { ReactNode } from "react";

type Tone = "forest" | "cream";

const TONE_CLASS: Record<Tone, string> = {
  forest: "text-[var(--ixai-forest)]",
  cream: "text-[var(--ixai-cream)]",
};

export function SectionTitle({
  children,
  tone = "forest",
  className = "",
}: Readonly<{
  children: ReactNode;
  tone?: Tone;
  className?: string;
}>) {
  return (
    <h3
      className={`ds-heading-sm ${TONE_CLASS[tone]} ${className}`}
    >
      {children}
    </h3>
  );
}
