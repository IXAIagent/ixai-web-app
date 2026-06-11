type InputReviewSection = {
  items: Array<[string, string]>;
  title: string;
};

type InputReviewSummaryProps = {
  assetType: string;
  sections: InputReviewSection[];
  title?: string;
};

export function InputReviewSummary({
  assetType,
  sections,
  title = "Input Review",
}: InputReviewSummaryProps) {
  return (
    <section className="rounded-2xl border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.82)] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            {title}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-[var(--ixai-forest)]">
            {assetType}
          </h3>
        </div>
        <span className="w-fit rounded-full border border-[rgba(9,41,31,0.14)] bg-white/70 px-3 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
          Local review only
        </span>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {sections.map((section) => (
          <article
            className="rounded-xl border border-[var(--ixai-border)] bg-white/70 p-3"
            key={section.title}
          >
            <h4 className="text-sm font-semibold text-[var(--ixai-forest)]">
              {section.title}
            </h4>
            <dl className="mt-3 grid gap-2">
              {section.items.map(([label, value]) => (
                <div className="grid gap-1" key={label}>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                    {label}
                  </dt>
                  <dd className="break-words text-sm font-semibold text-[var(--ixai-forest)]">
                    {value || "未填"}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
