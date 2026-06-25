import type { MorningBriefRiskSummary } from "@/src/lib/morning-brief";

export function MorningRiskCard({ summary }: { summary: MorningBriefRiskSummary }) {
  return (
    <article className="rounded-xl border border-[var(--ixai-border)] bg-white/68 p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
        Risk
      </p>
      <h3 className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
        {summary.riskLevel.replaceAll("_", " ").toUpperCase()}
      </h3>
      <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
        Source: {summary.sourceEngine}. Score {summary.riskScore ?? "N/A"}.
      </p>
      <div className="mt-3 grid gap-2">
        {summary.criticalDrivers.slice(0, 2).map((driver) => (
          <p
            className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-3 text-xs leading-5 text-[var(--ixai-forest-soft)]"
            key={driver}
          >
            {driver}
          </p>
        ))}
        {summary.criticalDrivers.length === 0 ? (
          <p className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-3 text-xs leading-5 text-[var(--ixai-forest-soft)]">
            No critical drivers are available.
          </p>
        ) : null}
      </div>
    </article>
  );
}
