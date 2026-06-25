import type { LegacyPortfolioRiskSummary } from "@/src/lib/risk/legacy-risk-engine";

function formatValue(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "--";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

export function PortfolioRiskSummaryCard({
  summary,
}: {
  summary: LegacyPortfolioRiskSummary;
}) {
  return (
    <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
        Portfolio Risk
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[var(--ixai-forest)]">
            {summary.riskLevel.replaceAll("_", " ").toUpperCase()}
          </h3>
          <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            {summary.positionCount} position(s), {formatValue(summary.totalKnownNotional)} known notional.
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full border border-[var(--ixai-border)] bg-white px-2.5 py-1 font-mono text-xs font-semibold text-[var(--ixai-forest)]">
          Score {summary.riskScore ?? "N/A"}
        </span>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {summary.assetClassExposure.slice(0, 4).map((bucket) => (
          <div className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-3" key={bucket.label}>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              {bucket.label}
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--ixai-forest)]">
              {bucket.positionCount} position(s) · {formatValue(bucket.percent)}%
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
