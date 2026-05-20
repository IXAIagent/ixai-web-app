import { intelligenceFeedItems } from "@/src/lib/daily-intelligence";

export function IntelligenceFeed() {
  return (
    <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.82)] shadow-[0_16px_44px_rgba(9,41,31,0.05)]">
      <div className="border-b border-[var(--ixai-border)] px-4 py-3 sm:px-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          Intelligence Feed
        </p>
        <h2 className="mt-1 text-base font-semibold text-[var(--ixai-forest)]">
          快速市場摘要
        </h2>
      </div>
      <div className="divide-y divide-[var(--ixai-border)]">
        {intelligenceFeedItems.map((item) => (
          <article
            className="grid gap-3 px-4 py-4 transition hover:bg-[rgba(9,41,31,0.035)] sm:px-5 md:grid-cols-[7rem_1fr]"
            key={item.title}
          >
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                {item.category}
              </p>
              <p className="mt-1 text-[11px] text-[var(--ixai-ink-muted)]">
                {item.updatedLabel}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-6 text-[var(--ixai-forest)]">
                {item.title}
              </h3>
              <p className="mt-1 text-sm leading-6 text-[var(--ixai-ink-muted)]">
                {item.summary}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
