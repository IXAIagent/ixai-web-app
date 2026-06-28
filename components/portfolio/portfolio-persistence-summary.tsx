"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Database, RefreshCw } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { INPUT_TRUTH_BRIDGE_EVENT } from "@/src/lib/portfolio/input/input-truth-bridge";
import { getWorkspacePortfolioPersistenceSummary } from "@/src/lib/portfolio/persistence";
import type {
  PortfolioPersistenceResult,
  PortfolioPersistenceSourceStatus,
} from "@/src/lib/portfolio/persistence";
import { runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

const STATUS_CLASS: Record<PortfolioPersistenceSourceStatus, string> = {
  fallback:
    "border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] text-[var(--ixai-forest-soft)]",
  local:
    "border-[color-mix(in_srgb,var(--ixai-gold)_44%,transparent)] bg-[rgba(176,141,87,0.08)] text-[var(--ixai-forest)]",
  partial:
    "border-[color-mix(in_srgb,var(--ixai-risk-watch)_40%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_10%,white)] text-[var(--ixai-forest)]",
  persisted:
    "border-[color-mix(in_srgb,var(--ixai-risk-clear)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-clear)_10%,white)] text-[var(--ixai-forest)]",
  unavailable:
    "border-[color-mix(in_srgb,var(--ixai-risk-critical)_32%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_8%,white)] text-[var(--ixai-forest)]",
};

function formatTime(value: string | undefined) {
  if (!value) {
    return "--";
  }

  try {
    return new Intl.DateTimeFormat("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
      month: "2-digit",
      second: "2-digit",
    }).format(new Date(value));
  } catch {
    return "--";
  }
}

function StatusBadge({ status }: { status: PortfolioPersistenceSourceStatus }) {
  return (
    <span
      className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[status]}`}
    >
      {status.toUpperCase()}
    </span>
  );
}

export function PortfolioPersistenceSummary() {
  const [result, setResult] = useState<PortfolioPersistenceResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(false);

  async function refreshPersistence() {
    setIsLoading(true);
    const safeResult = await runWorkspaceSafe(
      "workspace-portfolio-persistence-summary",
      getWorkspacePortfolioPersistenceSummary,
      null,
    );

    if (!mountedRef.current) {
      return;
    }

    setResult(safeResult.data);
    setIsLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    mountedRef.current = true;

    queueMicrotask(() => {
      if (!cancelled) {
        void refreshPersistence();
      }
    });

    function syncPersistence() {
      if (!cancelled) {
        void refreshPersistence();
      }
    }

    window.addEventListener(INPUT_TRUTH_BRIDGE_EVENT, syncPersistence);
    window.addEventListener("ixai:portfolio-input:changed", syncPersistence);
    window.addEventListener("storage", syncPersistence);

    return () => {
      cancelled = true;
      mountedRef.current = false;
      window.removeEventListener(INPUT_TRUTH_BRIDGE_EVENT, syncPersistence);
      window.removeEventListener("ixai:portfolio-input:changed", syncPersistence);
      window.removeEventListener("storage", syncPersistence);
    };
  }, []);

  const summaryCards = useMemo(() => {
    const summary = result?.summary;

    return [
      {
        label: "Total Positions",
        note: "Persisted + local + fallback readback",
        value: summary ? String(summary.totalPositions) : "--",
      },
      {
        label: "Persisted",
        note: "Existing API / durable readback",
        value: summary ? String(summary.persistedPositions) : "--",
      },
      {
        label: "Local Draft",
        note: "Input bridge and FCN draft store",
        value: summary ? String(summary.localPositions) : "--",
      },
      {
        label: "Fallback",
        note: "Legacy recent input fallback",
        value: summary ? String(summary.fallbackPositions) : "--",
      },
    ];
  }, [result]);

  const assetBreakdown = useMemo(() => {
    const summary = result?.summary;

    return [
      { label: "Stock", value: summary?.stockPositions ?? 0 },
      { label: "Crypto", value: summary?.cryptoPositions ?? 0 },
      { label: "FCN", value: summary?.fcnPositions ?? 0 },
      { label: "Cash", value: summary?.cashPositions ?? 0 },
      { label: "Unknown", value: summary?.unknownPositions ?? 0 },
    ];
  }, [result]);

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={Database} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Portfolio Persistence Layer
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
              Canonical position readback
            </h2>
          </div>
        </div>
        <button
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 sm:w-fit"
          disabled={isLoading}
          onClick={() => void refreshPersistence()}
          type="button"
        >
          <RefreshCw className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          {isLoading ? "讀取中" : "重新讀取"}
        </button>
      </div>

      <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
        v5.00 adds a canonical persistence readback abstraction across persisted API records, local pending input, FCN drafts, and legacy fallback data. This is not a schema migration or database redesign.
      </p>

      {result?.summary.totalPositions === 0 ? (
        <div className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          No persisted, local draft, or fallback portfolio positions are available yet. Add an asset to populate Workspace readback.
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article
            className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
            key={card.label}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              {card.label}
            </p>
            <p className="mt-2 break-words font-mono text-2xl font-semibold text-[var(--ixai-forest)]">
              {card.value}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
              {card.note}
            </p>
          </article>
        ))}
      </div>

      {result ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                  Source Status
                </p>
                <h3 className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
                  {result.summary.sourceStatus.toUpperCase()}
                </h3>
              </div>
              <StatusBadge status={result.summary.sourceStatus} />
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
              Last updated: {formatTime(result.summary.lastUpdated)} · Generated:{" "}
              {formatTime(result.generatedAt)}
            </p>
            <p className="mt-3 text-xs leading-5 text-[var(--ixai-forest-soft)]">
              {result.informationalOnlyDisclaimer}
            </p>
          </article>

          <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              Asset Breakdown
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-5 lg:grid-cols-1">
              {assetBreakdown.map((item) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2"
                  key={item.label}
                >
                  <p className="text-sm font-semibold text-[var(--ixai-forest)]">
                    {item.label}
                  </p>
                  <p className="font-mono text-sm font-semibold text-[var(--ixai-forest-soft)]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </div>
      ) : null}

      {result && result.summary.warnings.length > 0 ? (
        <article className="mt-5 rounded-xl border border-[rgba(176,141,87,0.30)] bg-[rgba(176,141,87,0.08)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
            Persistence Warnings
          </p>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            {result.summary.warnings.slice(0, 6).map((warning) => (
              <li
                className="rounded-lg border border-[rgba(176,141,87,0.24)] bg-white/60 p-3"
                key={warning.id}
              >
                <span className="font-semibold text-[var(--ixai-forest)]">
                  {warning.sourceName}:
                </span>{" "}
                {warning.message}
              </li>
            ))}
          </ul>
        </article>
      ) : null}
    </section>
  );
}
