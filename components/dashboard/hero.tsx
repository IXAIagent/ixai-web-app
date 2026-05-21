export function Hero() {
  return (
    <section className="overflow-hidden rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.18)]">
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.25fr_0.75fr] lg:p-8">
        <div className="max-w-3xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
            IXAI
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-normal sm:text-4xl">
            AI Wealth Intelligence Platform
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[rgba(245,240,230,0.72)]">
            一套每天打開的 AI wealth intelligence platform，將市場情報、風險脈絡與資產觀察整理成可持續使用的金融決策節奏。
          </p>
        </div>

        <div className="grid content-between gap-4 border-t border-white/10 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[rgba(245,240,230,0.42)]">
              今日閱讀框架
            </p>
            <p className="mt-2 text-lg font-medium">Daily Brief + Intelligence OS</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["閱讀", "判斷", "監控"].map((item) => (
              <div
                className="rounded-lg border border-white/10 bg-white/[0.045] p-3"
                key={item}
              >
                <p className="text-sm font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
