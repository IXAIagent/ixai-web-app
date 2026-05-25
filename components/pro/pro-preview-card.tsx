import type { LucideIcon } from "lucide-react";

export function ProPreviewCard({
  eyebrow,
  icon: Icon,
  title,
  value,
  note,
}: {
  eyebrow: string;
  icon: LucideIcon;
  title: string;
  value: string;
  note: string;
}) {
  return (
    <article className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)]">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
          {eyebrow}
        </p>
      </div>
      <h3 className="mt-3 text-base font-semibold leading-6 text-[var(--ixai-forest)]">
        {title}
      </h3>
      <p className="mt-2 font-mono text-xl font-semibold text-[var(--ixai-forest)]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">{note}</p>
    </article>
  );
}
