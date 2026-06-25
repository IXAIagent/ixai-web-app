import type { LegacyFcnRiskSummary } from "@/src/lib/risk/legacy-risk-engine";

function formatPercent(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "--";
  return `${Math.round(value * 10) / 10}%`;
}

export function FcnRiskSummaryCard({ summary }: { summary: LegacyFcnRiskSummary }) {
  const topPosition = summary.topRiskPositions[0];

  return (
    <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
        FCN Worst-of Risk
      </p>
      <h3 className="mt-3 text-lg font-semibold text-[var(--ixai-forest)]">
        {summary.criticalCount} critical · {summary.highRiskCount} high
      </h3>
      <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
        Worst-of, KI distance, strike distance, and KO readiness are calculated from stored FCN underlyings only.
      </p>
      {topPosition ? (
        <div className="mt-4 rounded-lg border border-[var(--ixai-border)] bg-white/68 p-3">
          <p className="text-sm font-semibold text-[var(--ixai-forest)]">
            {topPosition.name}
          </p>
          <p className="mt-2 text-xs leading-5 text-[var(--ixai-forest-soft)]">
            Worst-of {topPosition.worstOfSymbol ?? "--"} · KI distance{" "}
            {formatPercent(topPosition.nearestKiDistancePercent)} · {topPosition.riskLevel}
          </p>
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-[var(--ixai-border)] bg-white/68 p-3 text-sm text-[var(--ixai-forest-soft)]">
          No FCN positions are available for V15 risk readback.
        </p>
      )}
    </article>
  );
}
