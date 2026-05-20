// v1.6.3 (U2): small KPI tile used inside SectionCard or as a standalone
// summary card. Standardises the eyebrow + value + change + status footer
// pattern that was hand-coded in market-overview and market-pulse.
//
// Stays brand-faithful: cream / paper / forest text on the light surface,
// gold for the eyebrow.

import type { ReactNode } from "react";

import { Eyebrow } from "./eyebrow";

export function MetricCard({
  label,
  value,
  change,
  status,
  hint,
  trailing,
  className = "",
}: Readonly<{
  label: string;
  value: ReactNode;
  /** Right-aligned secondary value, typically a daily change percentage. */
  change?: ReactNode;
  /** Small label rendered as a pill in the footer (e.g. data-source state). */
  status?: ReactNode;
  /** Free-text hint, rendered below the status line. */
  hint?: ReactNode;
  /** Right-side block aligned with the eyebrow row (e.g. <DirectionPill />). */
  trailing?: ReactNode;
  className?: string;
}>) {
  return (
    <div
      className={`rounded-lg border border-[var(--ixai-border)] bg-white/42 p-4 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <Eyebrow tone="forest" density="regular">
          {label}
        </Eyebrow>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="font-mono text-xl font-semibold leading-7 text-[var(--ixai-forest)]">
          {value}
        </p>
        {change ? (
          <p className="font-mono text-sm font-medium text-[var(--ixai-forest-soft)]">
            {change}
          </p>
        ) : null}
      </div>

      {(status || hint) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] leading-5 text-[var(--ixai-ink-muted)]">
          {status ? (
            <span className="rounded-md border border-[var(--ixai-border)] px-2 py-0.5 font-medium text-[var(--ixai-forest-soft)]">
              {status}
            </span>
          ) : null}
          {hint ? <span>{hint}</span> : null}
        </div>
      )}
    </div>
  );
}
