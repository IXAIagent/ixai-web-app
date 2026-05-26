import { LockKeyhole } from "lucide-react";
import type { IntelligenceSurface } from "@/src/lib/intelligence/access";
import { getSurfaceAccessState } from "@/src/lib/intelligence/access";
import { PreviewBadge } from "@/components/pro/preview-badge";

export function ProLockCard({
  note,
  surface,
  title,
}: {
  note: string;
  surface: IntelligenceSurface;
  title: string;
}) {
  const access = getSurfaceAccessState(surface);

  return (
    <article className="relative min-w-0 overflow-hidden rounded-lg border border-[rgba(176,141,87,0.28)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <PreviewBadge label="Locked Preview" surface={surface} />
        <LockKeyhole className="h-4 w-4 shrink-0 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold leading-6 text-[var(--ixai-forest)]">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">{note}</p>
      <p className="mt-3 border-t border-[var(--ixai-border)] pt-3 text-xs leading-6 text-[var(--ixai-ink-muted)]">
        {access.upgradePrompt}
      </p>
    </article>
  );
}
