const ROWS = [
  ["市場情報", "每日晨報、每週情報、市場觀察", "個人化市場記憶與風險脈絡"],
  ["關注清單", "基礎自選觀察", "關注清單情報與主題提醒"],
  ["FCN", "教育與概念範例", "個人 FCN worst-of / KI / coupon 監控"],
  ["風險警示", "公開市場風險觀察", "AI 風險提醒與個人化門檻"],
];

export function ProComparison() {
  return (
    <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.82)]">
      <div className="border-b border-[var(--ixai-border)] px-4 py-3.5 sm:px-5 sm:py-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          公開版 vs Pro
        </p>
        <h2 className="mt-1 text-base font-semibold text-[var(--ixai-forest)]">
          免費版提供市場情報，Pro 提供個人化分析。
        </h2>
      </div>
      <div className="divide-y divide-[var(--ixai-border)]">
        {ROWS.map(([capability, publicLayer, proLayer]) => (
          <article
            className="grid gap-3 px-4 py-4 sm:px-5 md:grid-cols-[11rem_1fr_1fr]"
            key={capability}
          >
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--ixai-gold)]">
              {capability}
            </p>
            <p className="text-sm leading-7 text-[var(--ixai-forest-soft)]">{publicLayer}</p>
            <p className="rounded-lg border border-[rgba(176,141,87,0.24)] bg-[rgba(176,141,87,0.08)] p-3 text-sm leading-7 text-[var(--ixai-forest)]">
              {proLayer}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
