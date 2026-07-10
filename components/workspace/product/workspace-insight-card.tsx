import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { WorkspaceStatusBadge, type WorkspaceStatusBadgeVariant } from "@/components/workspace/product/workspace-status-badge";

export type WorkspaceInsightCardTone = "critical" | "default" | "success" | "warning";

const toneClass: Record<WorkspaceInsightCardTone, string> = {
  critical: "border-[rgba(153,27,27,0.28)] bg-[rgba(153,27,27,0.06)]",
  default: "border-[var(--ixai-border)] bg-white/68",
  success: "border-[color-mix(in_srgb,var(--ixai-risk-clear)_32%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-clear)_8%,white)]",
  warning: "border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.08)]",
};

export function WorkspaceInsightCard({
  actionHref,
  actionLabel = "Inspect",
  badge,
  badgeVariant = "normal",
  icon: Icon,
  summary,
  title,
  tone = "default",
  why,
}: {
  actionHref?: string;
  actionLabel?: string;
  badge?: string;
  badgeVariant?: WorkspaceStatusBadgeVariant;
  icon?: LucideIcon;
  summary: string;
  title: string;
  tone?: WorkspaceInsightCardTone;
  why: string;
}) {
  return (
    <article className={`rounded-lg border p-4 ${toneClass[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {badge ? <WorkspaceStatusBadge variant={badgeVariant}>{badge}</WorkspaceStatusBadge> : null}
          <h3 className="mt-3 text-base font-semibold text-[var(--ixai-forest)]">{title}</h3>
        </div>
        {Icon ? (
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--ixai-border)] bg-white/58">
            <Icon className="h-5 w-5 text-[var(--ixai-gold)]" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <div className="mt-3 grid gap-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
        <p>
          <span className="font-semibold text-[var(--ixai-forest)]">What happened: </span>
          {summary}
        </p>
        <p>
          <span className="font-semibold text-[var(--ixai-forest)]">Why it matters: </span>
          {why}
        </p>
      </div>
      {actionHref ? (
        <Link
          className="mt-4 inline-flex rounded-full border border-[var(--ixai-border)] bg-white/68 px-3 py-2 text-xs font-semibold text-[var(--ixai-forest)] transition hover:border-[var(--ixai-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ixai-gold)]"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </article>
  );
}
