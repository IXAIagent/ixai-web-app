import { GitBranch, ShieldCheck, TriangleAlert } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import type {
  WorkspaceIntegrationAudit,
  WorkspaceIntegrationIssueSeverity,
  WorkspaceIntegrationStatus as WorkspaceIntegrationStatusValue,
} from "@/src/lib/workspace/integration/integration-types";

const STATUS_CLASS: Record<WorkspaceIntegrationStatusValue, string> = {
  broken:
    "border-[color-mix(in_srgb,var(--ixai-risk-critical)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_9%,white)] text-[var(--ixai-forest)]",
  healthy:
    "border-[color-mix(in_srgb,var(--ixai-risk-clear)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-clear)_10%,white)] text-[var(--ixai-forest)]",
  warning:
    "border-[color-mix(in_srgb,var(--ixai-gold)_44%,transparent)] bg-[rgba(255,250,240,0.82)] text-[var(--ixai-forest)]",
};

const SEVERITY_CLASS: Record<WorkspaceIntegrationIssueSeverity, string> = {
  critical:
    "border-[color-mix(in_srgb,var(--ixai-risk-critical)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_9%,white)]",
  info: "border-[var(--ixai-border)] bg-white/75",
  warning:
    "border-[color-mix(in_srgb,var(--ixai-gold)_44%,transparent)] bg-[rgba(255,250,240,0.82)]",
};

function formatTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: WorkspaceIntegrationStatusValue }) {
  return (
    <span
      className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[status]}`}
    >
      {status.toUpperCase()}
    </span>
  );
}

export function WorkspaceIntegrationStatus({
  audit,
}: {
  audit: WorkspaceIntegrationAudit;
}) {
  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={GitBranch} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Workspace Full Integration Review
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              Workspace Integration Status
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              Internal diagnostics for the data lineage between Truth Layer, Market Cache,
              Market Service, Valuation, Risk, FCN Risk, and FCN Schedule. This is a
              static/service-level audit and does not run provider network tests.
            </p>
          </div>
        </div>
        <StatusBadge status={audit.overallStatus} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {[
          ["Modules", audit.moduleCount],
          ["Healthy", audit.healthyModules],
          ["Warning", audit.warningModules],
          ["Broken", audit.brokenModules],
        ].map(([label, value]) => (
          <article
            className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
            key={label}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              {label}
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold text-[var(--ixai-forest)]">
              {value}
            </p>
          </article>
        ))}
      </div>

      <article className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
            Lineage Flow
          </p>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {audit.lineageNodes.map((node) => (
            <div
              className="rounded-lg border border-[var(--ixai-border)] bg-white/75 p-3"
              key={node.id}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                    {node.source}
                  </p>
                  <h3 className="mt-2 text-sm font-semibold text-[var(--ixai-forest)]">
                    {node.name}
                  </h3>
                </div>
                <StatusBadge status={node.status} />
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                Target: {node.target}
              </p>
            </div>
          ))}
        </div>
      </article>

      <article className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
        <div className="flex items-center gap-2">
          <TriangleAlert className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
            Detected Issues
          </p>
        </div>
        <div className="mt-4 grid gap-3">
          {audit.issues.map((issue, index) => (
            <div
              className={`rounded-lg border p-3 ${SEVERITY_CLASS[issue.severity]}`}
              key={`${issue.module}-${issue.severity}-${index}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--ixai-forest)]">
                  {issue.module}
                </p>
                <span className="rounded-full border border-[var(--ixai-border)] bg-white/70 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase text-[var(--ixai-forest-soft)]">
                  {issue.severity}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                {issue.message}
              </p>
            </div>
          ))}
          {audit.issues.length === 0 ? (
            <div className="rounded-lg border border-[var(--ixai-border)] bg-white/75 p-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
              No integration issues detected by the static/service-level audit.
            </div>
          ) : null}
        </div>
      </article>

      <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-3 text-xs leading-5 text-[var(--ixai-forest-soft)]">
        Generated {formatTimestamp(audit.generatedAt)}. Diagnostics are internal architecture
        validation only. They do not change auth, schema, broker sync, trading logic,
        investment recommendations, or FCN pricing.
      </p>
    </section>
  );
}
