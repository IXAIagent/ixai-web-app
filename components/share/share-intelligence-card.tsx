import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ShareIntelligenceItem } from "@/src/lib/share/intelligence";

export function ShareIntelligenceCard({
  item,
  compact = false,
}: {
  compact?: boolean;
  item: ShareIntelligenceItem;
}) {
  const Icon = item.icon;

  return (
    <article className="h-full rounded-lg border border-[rgba(176,141,87,0.3)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-5">
      <div className="flex items-center gap-2 text-[var(--ixai-gold)]">
        <Icon className="h-4 w-4 stroke-current" aria-hidden="true" />
        <p className="font-mono text-[11px] uppercase tracking-[0.18em]">{item.category}</p>
      </div>
      <h2 className="mt-3 text-lg font-semibold leading-7 text-[var(--ixai-forest)]">
        {item.title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
        {compact ? item.description : item.summary}
      </p>
      <Link
        className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--ixai-border)] px-3 py-2 text-xs font-semibold text-[var(--ixai-forest)]"
        href={`/share/intelligence/${item.slug}`}
      >
        打開這張 Intelligence
        <ArrowRight className="h-3.5 w-3.5 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
      </Link>
    </article>
  );
}
