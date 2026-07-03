import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

export function WorkspaceEmptyState({
  actionHref,
  actionLabel,
  body,
  icon: Icon,
  title,
}: {
  actionHref?: string;
  actionLabel?: string;
  body: string;
  icon?: LucideIcon;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-5 text-[var(--ixai-forest)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          {Icon ? (
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)]">
              <Icon className="h-5 w-5 text-[var(--ixai-gold)]" aria-hidden="true" />
            </span>
          ) : null}
          <div>
            <p className="text-base font-semibold">{title}</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ixai-forest-soft)]">
              {body}
            </p>
          </div>
        </div>
        {actionHref && actionLabel ? (
          <Link
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/78 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] sm:w-fit"
            href={actionHref}
          >
            {actionLabel}
            <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
