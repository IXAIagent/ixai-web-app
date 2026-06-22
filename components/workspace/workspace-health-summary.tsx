"use client";

import { useEffect, useState } from "react";
import { HeartPulse, RefreshCw } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { getWorkspaceHealthScore } from "@/src/lib/workspace/health";
import type { WorkspaceHealthScore } from "@/src/lib/workspace/health";

export function WorkspaceHealthSummary() {
  const [health, setHealth] = useState<WorkspaceHealthScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refresh() {
    setIsLoading(true);
    setHealth(await getWorkspaceHealthScore());
    setIsLoading(false);
  }

  useEffect(() => {
    queueMicrotask(() => void refresh());
  }, []);

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={HeartPulse} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Workspace Health Engine
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
              Health score readback
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              Deterministic 0–100 infrastructure health score across Portfolio, Risk, FCN, Market, Schedule, and Intelligence.
            </p>
          </div>
        </div>
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] disabled:opacity-60"
          disabled={isLoading}
          onClick={() => void refresh()}
          type="button"
        >
          <RefreshCw className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          {isLoading ? "計算中" : "重新計算"}
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[0.7fr_1.3fr]">
        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
            Overall Health
          </p>
          <p className="mt-3 font-mono text-5xl font-semibold text-[var(--ixai-forest)]">
            {health?.overallHealth ?? "--"}
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            Informational infrastructure score only.
          </p>
        </article>
        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
            Dimensions
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {health?.summaries.map((item) => (
              <div
                className="rounded-lg border border-[var(--ixai-border)] bg-white/70 p-3"
                key={item.key}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--ixai-forest)]">
                    {item.key}
                  </p>
                  <p className="font-mono text-sm font-semibold text-[var(--ixai-forest-soft)]">
                    {item.score}
                  </p>
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                  {item.summary}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>

      {health && health.warnings.length > 0 ? (
        <article className="mt-5 rounded-xl border border-[rgba(176,141,87,0.30)] bg-[rgba(176,141,87,0.08)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
            Health Warnings
          </p>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            {health.warnings.map((warning) => (
              <li className="rounded-lg border border-[rgba(176,141,87,0.24)] bg-white/60 p-3" key={warning}>
                {warning}
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      {health ? (
        <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          {health.informationalOnlyDisclaimer}
        </p>
      ) : null}
    </section>
  );
}
