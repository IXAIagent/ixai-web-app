"use client";

import { useEffect, useState } from "react";
import { Bell, RefreshCw } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { getWorkspaceAlertSummary } from "@/src/lib/alerts";
import type { WorkspaceAlertSeverity, WorkspaceAlertSummary } from "@/src/lib/alerts";

const SEVERITY_CLASS: Record<WorkspaceAlertSeverity, string> = {
  critical:
    "border-[color-mix(in_srgb,var(--ixai-risk-critical)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_9%,white)]",
  high:
    "border-[color-mix(in_srgb,var(--ixai-risk-watch)_40%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_10%,white)]",
  info: "border-[var(--ixai-border)] bg-white/70",
  warning:
    "border-[color-mix(in_srgb,var(--ixai-gold)_44%,transparent)] bg-[rgba(255,250,240,0.82)]",
};

export function AlertSummary() {
  const [summary, setSummary] = useState<WorkspaceAlertSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refresh() {
    setIsLoading(true);
    setSummary(await getWorkspaceAlertSummary());
    setIsLoading(false);
  }

  useEffect(() => {
    queueMicrotask(() => void refresh());
  }, []);

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={Bell} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Alert Engine
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
              Monitoring alert cards
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              Deterministic alerts are generated from Watchlist, Risk, FCN Risk, FCN Schedule, and market availability. Delivery is not implemented.
            </p>
          </div>
        </div>
        <button
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] disabled:opacity-60 sm:w-fit"
          disabled={isLoading}
          onClick={() => void refresh()}
          type="button"
        >
          <RefreshCw className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          {isLoading ? "讀取中" : "重新整理"}
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {[
          ["Open Alerts", summary?.alertCount ?? "--"],
          ["Critical", summary?.criticalCount ?? "--"],
          ["High", summary?.highCount ?? "--"],
          ["Warning", summary?.warningCount ?? "--"],
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

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {summary?.alerts.slice(0, 8).map((alert) => (
          <article
            className={`rounded-xl border p-4 ${SEVERITY_CLASS[alert.severity]}`}
            key={alert.id}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-[var(--ixai-forest)]">
                  {alert.title}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--ixai-forest-soft)]">
                  {alert.category} · {alert.sourceEngine}
                </p>
              </div>
              <span className="rounded-full border border-[var(--ixai-border)] bg-white/70 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                {alert.severity}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
              {alert.message}
            </p>
          </article>
        ))}
      </div>

      {summary ? (
        <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          {summary.informationalOnlyDisclaimer}
        </p>
      ) : null}
    </section>
  );
}
