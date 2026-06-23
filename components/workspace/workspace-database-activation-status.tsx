"use client";

import { useEffect, useState } from "react";
import { DatabaseZap, RefreshCw } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { getAlertDatabaseActivationReadiness } from "@/src/lib/alerts/persistence";
import { getFcnDatabaseActivationReadiness } from "@/src/lib/persistence/fcn";
import { checkOwnershipActivationReadiness } from "@/src/lib/persistence/ownership";
import { getPortfolioDatabaseActivationReadiness } from "@/src/lib/persistence/portfolio";
import { getWorkspaceDatabaseActivationReport } from "@/src/lib/persistence/sync";
import { getWatchlistDatabaseActivationReadiness } from "@/src/lib/watchlist/persistence";

type ActivationItem = {
  label: string;
  migrationStatus: string;
  runtimeRequired: boolean;
  sourceStatus: string;
  summary: string;
  warnings: string[];
};

export function WorkspaceDatabaseActivationStatus() {
  const [items, setItems] = useState<ActivationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function refresh() {
    setIsLoading(true);
    const [portfolio, fcn, watchlist, alerts, ownership, sync] = await Promise.all([
      getPortfolioDatabaseActivationReadiness(),
      getFcnDatabaseActivationReadiness(),
      getWatchlistDatabaseActivationReadiness(),
      getAlertDatabaseActivationReadiness(),
      checkOwnershipActivationReadiness(),
      getWorkspaceDatabaseActivationReport(),
    ]);

    setItems([
      {
        label: "Portfolio Database",
        migrationStatus: portfolio.migrationStatus,
        runtimeRequired: portfolio.runtimeRequired,
        sourceStatus: portfolio.sourceStatus,
        summary: portfolio.summary,
        warnings: portfolio.warnings,
      },
      {
        label: "FCN Database",
        migrationStatus: fcn.migrationStatus,
        runtimeRequired: fcn.runtimeRequired,
        sourceStatus: fcn.sourceStatus,
        summary: fcn.summary,
        warnings: fcn.warnings,
      },
      {
        label: "Watchlist Database",
        migrationStatus: watchlist.migrationStatus,
        runtimeRequired: watchlist.runtimeRequired,
        sourceStatus: watchlist.sourceStatus,
        summary: watchlist.summary,
        warnings: watchlist.warnings,
      },
      {
        label: "Alert Database",
        migrationStatus: alerts.migrationStatus,
        runtimeRequired: alerts.runtimeRequired,
        sourceStatus: alerts.sourceStatus,
        summary: alerts.summary,
        warnings: alerts.warnings,
      },
      {
        label: "Ownership Database",
        migrationStatus: ownership.migrationStatus,
        runtimeRequired: ownership.runtimeRequired,
        sourceStatus: ownership.sourceStatus,
        summary: ownership.summary,
        warnings: ownership.warnings,
      },
      {
        label: "Workspace Sync Activation",
        migrationStatus: sync.migrationStatus,
        runtimeRequired: sync.runtimeRequired,
        sourceStatus: sync.sourceStatus,
        summary: sync.summary,
        warnings: sync.warnings,
      },
    ]);
    setIsLoading(false);
  }

  useEffect(() => {
    queueMicrotask(() => void refresh());
  }, []);

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={DatabaseZap} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              V8 Database Activation
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
              Database activation diagnostics
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              Internal readiness for optional database tables. Migration status remains draft only and runtime fallback remains active.
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
                {item.sourceStatus}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
              {item.summary}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-[var(--ixai-border)] bg-white/70 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                migration: {item.migrationStatus}
              </span>
              <span className="rounded-full border border-[var(--ixai-border)] bg-white/70 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                runtime required: {item.runtimeRequired ? "yes" : "no"}
              </span>
            </div>
            {item.warnings[0] ? (
              <p className="mt-3 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                {item.warnings[0]}
              </p>
            ) : null}
          </article>
        ))}
      </div>

      <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
        Database activation diagnostics are internal only. No migrations are applied automatically, no writes are enabled by default, and local fallback behavior remains preserved.
      </p>
    </section>
  );
}
