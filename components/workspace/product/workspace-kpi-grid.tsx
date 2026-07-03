import type { LucideIcon } from "lucide-react";

export type WorkspaceKpiTone = "critical" | "default" | "success" | "warning";

export type WorkspaceKpiItem = {
  description?: string;
  icon?: LucideIcon;
  label: string;
  tone?: WorkspaceKpiTone;
  value: string;
};

const toneClass: Record<WorkspaceKpiTone, string> = {
  critical: "border-[color-mix(in_srgb,var(--ixai-risk-critical)_28%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_7%,white)]",
  default: "border-[var(--ixai-border)] bg-white/68",
  success: "border-[color-mix(in_srgb,var(--ixai-risk-clear)_30%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-clear)_8%,white)]",
  warning: "border-[color-mix(in_srgb,var(--ixai-risk-watch)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_9%,white)]",
};

export function WorkspaceKpiCard({ item }: { item: WorkspaceKpiItem }) {
  const Icon = item.icon;

  return (
    <article className={`rounded-lg border p-4 ${toneClass[item.tone ?? "default"]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
            {item.label}
          </p>
          <p className="mt-3 text-2xl font-semibold text-[var(--ixai-forest)]">
            {item.value}
          </p>
        </div>
        {Icon ? (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)]">
            <Icon className="h-5 w-5 text-[var(--ixai-gold)]" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      {item.description ? (
        <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
          {item.description}
        </p>
      ) : null}
    </article>
  );
}

export function WorkspaceKpiGrid({ items }: { items: WorkspaceKpiItem[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <WorkspaceKpiCard item={item} key={item.label} />
      ))}
    </div>
  );
}
