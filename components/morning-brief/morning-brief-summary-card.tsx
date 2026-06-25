import type { MorningBriefPortfolioSummary } from "@/src/lib/morning-brief";

function formatValue(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "--";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

export function MorningBriefSummaryCard({
  summary,
}: {
  summary: MorningBriefPortfolioSummary;
}) {
  const topClass = summary.assetClassExposure
    .filter((item) => item.positionCount > 0)
    .sort((a, b) => (b.percent ?? 0) - (a.percent ?? 0))[0];

  return (
    <article className="rounded-xl border border-[var(--ixai-border)] bg-white/68 p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
        Portfolio
      </p>
      <h3 className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
        {summary.positionCount} position(s)
      </h3>
      <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
        Known notional {formatValue(summary.totalKnownNotional)} · data quality {summary.dataQuality}.
      </p>
      <p className="mt-3 rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-3 text-xs leading-5 text-[var(--ixai-forest-soft)]">
        Top asset class: {topClass?.label ?? "--"} {topClass?.percent !== null && topClass?.percent !== undefined ? `· ${formatValue(topClass.percent)}%` : ""}
      </p>
    </article>
  );
}
