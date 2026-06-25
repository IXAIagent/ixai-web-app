"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, ShieldAlert } from "lucide-react";

import { ConcentrationRiskSummaryCard } from "@/components/risk/concentration-risk-summary-card";
import { FcnRiskSummaryCard } from "@/components/risk/fcn-risk-summary-card";
import { PortfolioRiskSummaryCard } from "@/components/risk/portfolio-risk-summary-card";
import { getWorkspaceLegacyRiskEngineSnapshot } from "@/src/lib/risk/legacy-risk-engine";
import type { LegacyRiskEngineSnapshot } from "@/src/lib/risk/legacy-risk-engine";

type LoadState = "error" | "loading" | "ready";

export function LegacyRiskEngineStatus({ compact = false }: { compact?: boolean }) {
  const [snapshot, setSnapshot] = useState<LegacyRiskEngineSnapshot | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  const loadSnapshot = useCallback(async () => {
    setLoadState("loading");
    try {
      setSnapshot(await getWorkspaceLegacyRiskEngineSnapshot());
      setLoadState("ready");
    } catch {
      setSnapshot(null);
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadSnapshot();
    });
  }, [loadSnapshot]);

  if (compact) {
    return (
      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              V15 Legacy Risk Engine
            </p>
            <h2 className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
              Read-only risk migration status
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              {snapshot
                ? `${snapshot.portfolioRisk.riskLevel} portfolio risk · ${snapshot.fcnRisk.highRiskCount + snapshot.fcnRisk.criticalCount} FCN high/critical.`
                : "Loading V15 risk calculation snapshot."}
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--ixai-border)] bg-white px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
            {loadState === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            DB writes: off
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            V15 Legacy Risk Engine Migration
          </p>
          <h2 className="mt-2 flex items-center gap-2 text-xl font-semibold text-[var(--ixai-forest)]">
            <ShieldAlert className="h-5 w-5 text-[var(--ixai-gold)]" aria-hidden="true" />
            Legacy-aligned risk readback
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            Pure calculation layer for portfolio risk, FCN worst-of, KI/strike/KO distance, concentration, and exposure. It reads existing Workspace data and performs no database writes.
          </p>
        </div>
        <button
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-forest)] px-3 py-2 text-sm font-semibold text-[var(--ixai-cream)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
          disabled={loadState === "loading"}
          onClick={() => void loadSnapshot()}
          type="button"
        >
          {loadState === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin text-[var(--ixai-gold)]" aria-hidden="true" />
          ) : (
            <RefreshCw className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          )}
          Refresh
        </button>
      </div>

      {snapshot ? (
        <>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <PortfolioRiskSummaryCard summary={snapshot.portfolioRisk} />
            <FcnRiskSummaryCard summary={snapshot.fcnRisk} />
            <ConcentrationRiskSummaryCard summary={snapshot.concentrationRisk} />
          </div>
          <div className="mt-4 rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
            <p className="text-sm font-semibold text-[var(--ixai-forest)]">
              Diagnostics
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              Phase {snapshot.diagnostics.phase}; source {snapshot.diagnostics.dataSource}; fallback preserved: yes; DB writes enabled: no.
            </p>
            <p className="mt-2 text-xs leading-6 text-[var(--ixai-forest-soft)]">
              {snapshot.informationalOnlyDisclaimer}
            </p>
            <p className="mt-2 text-xs leading-6 text-[var(--ixai-forest-soft)]">
              Trading instructions: none. Recommendation logic: disabled. Render path: read-only diagnostics.
            </p>
          </div>
        </>
      ) : (
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800">
          {loadState === "error"
            ? "V15 risk snapshot could not be calculated. Existing Risk Center content remains available."
            : "Loading V15 risk snapshot."}
        </p>
      )}
    </section>
  );
}
