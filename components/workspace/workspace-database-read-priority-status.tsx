"use client";

import { useEffect, useState } from "react";
import { Database, RefreshCw } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import {
  getWorkspaceDatabaseReadPriorityStatus,
  type WorkspaceDatabaseReadPriorityStatus as WorkspaceDatabaseReadPriorityStatusValue,
} from "@/src/lib/workspace/database-read-priority-status";

export function WorkspaceDatabaseReadPriorityStatus() {
  const [status, setStatus] = useState<WorkspaceDatabaseReadPriorityStatusValue | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refresh() {
    setIsLoading(true);
    setStatus(await getWorkspaceDatabaseReadPriorityStatus());
    setIsLoading(false);
  }

  useEffect(() => {
    queueMicrotask(() => void refresh());
  }, []);

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={Database} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              V10 Database Read Priority
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
              Database-first read status
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              Portfolio, FCN, Watchlist, and Alert History now attempt database readback first, then preserve Truth Layer and local fallback behavior.
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
          {isLoading ? "讀取中" : "重新整理"}
        </button>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-4">
        {(status?.items ?? []).map((item) => (
          <article
            className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
            key={item.label}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
                {item.label}
              </h3>
              <span className="rounded-full border border-[var(--ixai-border)] bg-white/70 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                {item.source}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-[var(--ixai-border)] bg-white/70 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                fallback: {item.fallbackUsed ? "active" : "inactive"}
              </span>
              <span className="rounded-full border border-[var(--ixai-border)] bg-white/70 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                database: {item.databaseReady ? "ready" : "not ready"}
              </span>
            </div>
            {item.warning ? (
              <p className="mt-3 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                {item.warning}
              </p>
            ) : null}
          </article>
        ))}
      </div>

      <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
        {status?.informationalOnlyDisclaimer ??
          "V10.10 read priority diagnostics are loading. No migrations, auth changes, RLS changes, write-path cutover, broker integration, or recommendation logic are introduced."}
      </p>
    </section>
  );
}
