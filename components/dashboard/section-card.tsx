export function SectionCard({
  children,
  className = "",
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <section
      className={`rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.82)] shadow-[0_12px_36px_rgba(9,41,31,0.045)] sm:shadow-[0_20px_60px_rgba(9,41,31,0.06)] ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  action,
}: Readonly<{
  eyebrow: string;
  title: string;
  action?: string;
}>) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[var(--ixai-border)] px-4 py-3.5 sm:gap-4 sm:px-5 sm:py-4">
      <div>
        <p className="ds-label-md text-[var(--ixai-gold)]" style={{ letterSpacing: "0.22em" }}>
          {eyebrow}
        </p>
        <h2 className="mt-1 text-[15px] font-semibold leading-5 text-[var(--ixai-forest)] sm:text-base sm:leading-6">
          {title}
        </h2>
      </div>
      {action ? (
        <span className="hidden rounded-lg border border-[var(--ixai-border)] px-3 py-1.5 text-xs font-medium text-[var(--ixai-forest-soft)] sm:inline-flex">
          {action}
        </span>
      ) : null}
    </div>
  );
}
