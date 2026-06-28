"use client";

import { useEffect, useState } from "react";
import { Database, RefreshCw } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { getAlertPersistenceReadiness } from "@/src/lib/alerts/persistence";
import { getFcnPersistenceReadiness } from "@/src/lib/persistence/fcn";
import { getWorkspaceOwnershipStatus } from "@/src/lib/persistence/ownership";
import { getPortfolioPersistenceReadiness } from "@/src/lib/persistence/portfolio";
import { getWorkspaceSyncReadiness } from "@/src/lib/persistence/sync";
import { getWatchlistPersistenceReadiness } from "@/src/lib/watchlist/persistence";

type ReadinessItem = {
  label: string;
  status: string;
  summary: string;
  warnings: string[];
};

export function WorkspacePersistenceReadiness() {
  const [items, setItems] = useState<ReadinessItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function refresh() {
    setIsLoading(true);
    try {
      const [
        portfolio,
        ownership,
        sync,
        fcn,
        watchlist,
        alerts,
      ] = await Promise.all([
        getPortfolioPersistenceReadiness(),
        Promise.resolve(getWorkspaceOwnershipStatus()),
        getWorkspaceSyncReadiness(),
        getFcnPersistenceReadiness(),
        getWatchlistPersistenceReadiness(),
        getAlertPersistenceReadiness(),
      ]);

      setItems([
        {
          label: "Portfolio Persistence",
          status: portfolio.sourceStatus,
          summary: portfolio.summary,
          warnings: portfolio.warnings,
        },
        {
          label: "Ownership",
          status: ownership.status,
          summary: ownership.summary,
          warnings: ownership.warnings,
        },
        {
          label: "Workspace Sync",
          status: sync.sourceStatus,
          summary: sync.summary,
          warnings: sync.warnings.map((warning) => warning.message),
        },
        {
          label: "FCN Persistence",
          status: fcn.sourceStatus,
          summary: fcn.summary,
          warnings: fcn.warnings,
        },
        {
          label: "Watchlist Persistence",
          status: watchlist.sourceStatus,
          summary: watchlist.summary,
          warnings: watchlist.warnings,
        },
        {
          label: "Alert Persistence",
          status: alerts.sourceStatus,
          summary: alerts.summary,
          warnings: alerts.warnings,
        },
      ]);
    } catch (error) {
      console.warn("[IXAI SETTINGS] persistence readiness diagnostics unavailable", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
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
              V7 Persistence Readiness
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
              Data Persistence Program diagnostics
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              Internal platform readiness for future durable storage. Existing local/draft fallback remains preserved.
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

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {items.map((item) => (
          <article
            className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
            key={item.label}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
                {item.label}
              </h3>
              <span className="rounded-full border border-[var(--ixai-border)] bg-white/70 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                {item.status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
              {item.summary}
            </p>
            {item.warnings.length > 0 ? (
              <p className="mt-3 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                {item.warnings[0]}
              </p>
            ) : null}
          </article>
        ))}
      </div>

      <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
        V7 persistence readiness is diagnostics only. No migrations are applied, no auth behavior changes, and no trading or investment recommendation logic is introduced.
      </p>
    </section>
  );
}
