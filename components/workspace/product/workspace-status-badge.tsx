export type WorkspaceStatusBadgeVariant =
  | "beta"
  | "critical"
  | "green"
  | "healthy"
  | "high"
  | "low"
  | "normal"
  | "red"
  | "unknown"
  | "urgent"
  | "warning"
  | "yellow";

const variantClass: Record<WorkspaceStatusBadgeVariant, string> = {
  beta: "border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.12)] text-[var(--ixai-gold)]",
  critical: "border-[rgba(153,27,27,0.28)] bg-[rgba(153,27,27,0.08)] text-red-900",
  green: "border-[color-mix(in_srgb,var(--ixai-risk-clear)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-clear)_9%,white)] text-[var(--ixai-forest)]",
  healthy: "border-[color-mix(in_srgb,var(--ixai-risk-clear)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-clear)_9%,white)] text-[var(--ixai-forest)]",
  high: "border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.10)] text-[var(--ixai-forest)]",
  low: "border-[var(--ixai-border)] bg-white/62 text-[var(--ixai-forest-soft)]",
  normal: "border-[var(--ixai-border)] bg-white/68 text-[var(--ixai-forest)]",
  red: "border-[rgba(153,27,27,0.28)] bg-[rgba(153,27,27,0.08)] text-red-900",
  unknown: "border-[var(--ixai-border)] bg-white/58 text-[var(--ixai-forest-soft)]",
  urgent: "border-[rgba(153,27,27,0.28)] bg-[rgba(153,27,27,0.08)] text-red-900",
  warning: "border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.10)] text-[var(--ixai-forest)]",
  yellow: "border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.10)] text-[var(--ixai-forest)]",
};

export function WorkspaceStatusBadge({
  children,
  variant = "unknown",
}: {
  children: string;
  variant?: WorkspaceStatusBadgeVariant;
}) {
  return (
    <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${variantClass[variant]}`}>
      {children}
    </span>
  );
}
