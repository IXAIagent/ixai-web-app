// v1.6.3 (U1): page-level conceptual section band.
// Used to separate large groups on the homepage (market state → today's
// intelligence → personal observations → editorial → pro CTA) so readers
// get a scannable anchor between sections.
//
// Visual weight is deliberately lighter than SectionHeader so it does not
// compete with section titles — only marks the *between-sections* boundary.

import type { ReactNode } from "react";

import { Eyebrow } from "./eyebrow";

type Variant = "default" | "premium";

export function SectionDivider({
  label,
  hint,
  variant = "default",
  children,
}: Readonly<{
  label: string;
  hint?: string;
  /** v1.7: `premium` strengthens the band so the IXAI Pro tier reads
   *  distinctly from free tiers without redesigning ProCta itself. */
  variant?: Variant;
  children?: ReactNode;
}>) {
  const lineClass =
    variant === "premium"
      ? "h-px flex-1 bg-[rgba(176,141,87,0.55)]"
      : "h-px flex-1 bg-[rgba(176,141,87,0.28)]";
  return (
    <div className="flex items-baseline gap-2 pt-0.5 sm:gap-3 sm:pt-1">
      <Eyebrow density="extra-wide">{label}</Eyebrow>
      <span className={lineClass} aria-hidden />
      {hint ? (
        <span className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--ixai-ink-muted)] sm:inline">
          {hint}
        </span>
      ) : null}
      {children}
    </div>
  );
}
