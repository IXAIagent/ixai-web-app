import type { LegacyConcentrationRiskSummary } from "@/src/lib/risk/legacy-risk-engine";

export function ConcentrationRiskSummaryCard({
  summary,
}: {
  summary: LegacyConcentrationRiskSummary;
}) {
  return (
    <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
        Concentration / Exposure
      </p>
      <h3 className="mt-3 text-lg font-semibold text-[var(--ixai-forest)]">
        {summary.riskLevel.replaceAll("_", " ").toUpperCase()}
      </h3>
      <div className="mt-4 grid gap-2">
        {summary.topExposures.slice(0, 5).map((exposure) => (
          <div
            className="flex items-center justify-between gap-3 rounded-lg border border-[var(--ixai-border)] bg-white/68 p-3"
            key={exposure.symbol}
          >
            <span className="text-sm font-semibold text-[var(--ixai-forest)]">
              {exposure.symbol}
            </span>
            <span className="font-mono text-xs font-semibold text-[var(--ixai-forest-soft)]">
              {exposure.occurrenceCount}x
            </span>
          </div>
        ))}
        {summary.topExposures.length === 0 ? (
          <p className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-3 text-sm text-[var(--ixai-forest-soft)]">
            No shared symbols are available yet.
          </p>
        ) : null}
      </div>
    </article>
  );
}
