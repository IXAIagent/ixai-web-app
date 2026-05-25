const RISK_ROWS = [
  ["AI 股票", "高度相關", "觀察 AI 供應鏈曝險是否過度集中。"],
  ["總經利率", "中度壓力", "US 10Y 與 DXY 仍是估值判讀的關鍵輸入。"],
  ["Crypto", "中性", "流動性語氣納入監控，但在示意狀態下並非主導因子。"],
  ["FCN basket", "觀察", "波動聚集時，Worst-of 敏感度會提高。"],
];

export function ProRiskMap() {
  return (
    <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.82)]">
      <div className="border-b border-[var(--ixai-border)] px-4 py-3.5 sm:px-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          Portfolio Intelligence 預覽
        </p>
        <h2 className="mt-1 text-base font-semibold text-[var(--ixai-forest)]">
          風險曝險示意圖
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
