const RISK_ROWS = [
  ["AI equities", "High relevance", "Watch concentration in AI supply chain exposure."],
  ["Macro rates", "Medium pressure", "US 10Y and DXY remain key valuation inputs."],
  ["Crypto", "Neutral", "Liquidity tone is monitored but not dominant in sample state."],
  ["FCN basket", "Watch", "Worst-of sensitivity rises when volatility clusters."],
];

export function ProRiskMap() {
  return (
    <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.82)]">
      <div className="border-b border-[var(--ixai-border)] px-4 py-3.5 sm:px-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          Portfolio Intelligence Preview
        </p>
        <h2 className="mt-1 text-base font-semibold text-[var(--ixai-forest)]">
          Sample risk exposure map
        </h2>
      </div>
      <div className="divide-y divide-[var(--ixai-border)]">
        {RISK_ROWS.map(([category, state, note]) => (
          <article
            className="grid gap-2 px-4 py-4 sm:px-5 md:grid-cols-[10rem_9rem_1fr]"
            key={category}
          >
            <p className="font-mono text-sm font-semibold text-[var(--ixai-forest)]">
              {category}
            </p>
            <span className="w-fit rounded-md border border-[rgba(176,141,87,0.26)] bg-[rgba(176,141,87,0.1)] px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ixai-forest)]">
              {state}
            </span>
            <p className="text-sm leading-7 text-[var(--ixai-ink-muted)]">{note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
