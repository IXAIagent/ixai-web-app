import type { MorningBriefFcnSummary } from "@/src/lib/morning-brief";

function formatPercent(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "--";
  return `${Math.round(value * 10) / 10}%`;
}

export function MorningFcnCard({ summary }: { summary: MorningBriefFcnSummary }) {
  const topPosition = summary.topRiskPositions[0];

  return (
    <article className="rounded-xl border border-[var(--ixai-border)] bg-white/68 p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
        FCN
      </p>
      <h3 className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
        {summary.criticalCount} critical · {summary.highRiskCount} high
      </h3>
      <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
        Insufficient data: {summary.insufficientDataCount}. Repeated underlyings: {summary.repeatedUnderlyings.length}.
      </p>
      {topPosition ? (
        <p className="mt-3 rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-3 text-xs leading-5 text-[var(--ixai-forest-soft)]">
          {topPosition.name}: worst-of {topPosition.worstOfSymbol ?? "--"} · KI {formatPercent(topPosition.kiDistancePercent)} · strike {formatPercent(topPosition.strikeDistancePercent)}
        </p>
      ) : (
        <p className="mt-3 rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-3 text-xs leading-5 text-[var(--ixai-forest-soft)]">
          No FCN risk position is available.
        </p>
      )}
    </article>
  );
}
