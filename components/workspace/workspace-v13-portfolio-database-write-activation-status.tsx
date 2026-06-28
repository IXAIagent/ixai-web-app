"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { DatabaseZap, RefreshCw } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import {
  V13_PORTFOLIO_WRITE_STATUS_EVENT,
  getV13PortfolioWriteDiagnostics,
  type V13PortfolioWriteDiagnostics,
  type V13PortfolioWriteGuard,
} from "@/src/lib/workspace/portfolio-database-write-activation";

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[var(--ixai-border)] bg-white/70 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
      {children}
    </span>
  );
}

function GuardCard({ guard, label }: { guard: V13PortfolioWriteGuard; label: string }) {
  return (
    <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
          {label}
        </h3>
        <Pill>{guard.enabled ? "enabled" : "disabled"}</Pill>
      </div>
      <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
        {guard.reason}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Pill>module: {guard.module}</Pill>
        <Pill>source: {guard.source}</Pill>
      </div>
    </article>
  );
}

export function WorkspaceV13PortfolioDatabaseWriteActivationStatus() {
  const [status, setStatus] = useState<V13PortfolioWriteDiagnostics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refresh() {
    setIsLoading(true);
    try {
      const next = await getV13PortfolioWriteDiagnostics();
      setStatus(next);
    } catch (error) {
      console.warn("[IXAI SETTINGS] V13 portfolio write diagnostics unavailable", error);
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => void refresh());
    window.addEventListener(V13_PORTFOLIO_WRITE_STATUS_EVENT, refresh);

    return () => window.removeEventListener(V13_PORTFOLIO_WRITE_STATUS_EVENT, refresh);
  }, []);

  const guardSet = status?.readiness.guardSet;
  const lastWrite = status?.lastWriteResult;

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={DatabaseZap} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              V13 Portfolio Database Write Activation
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
              Portfolio / Stock / Crypto guarded writes
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              Stock and Crypto inputs keep local pending fallback first, then attempt Supabase writes only when explicit V12 global and V13 module guards are enabled. Diagnostics are read-only.
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

      <div className="mt-5 flex flex-wrap gap-2">
        <Pill>{status?.phase ?? "loading"}</Pill>
        <Pill>database: {status?.readiness.databaseReady ? "ready" : "not ready"}</Pill>
        <Pill>fallback: {status?.readiness.fallbackEnabled ? "active" : "inactive"}</Pill>
        <Pill>diagnostics: {guardSet?.diagnosticsReadOnly ? "read-only" : "write-capable"}</Pill>
        <Pill>read: {status?.readPriority.join(" -> ") ?? "loading"}</Pill>
      </div>

      {guardSet ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <GuardCard guard={guardSet.portfolioDatabaseWriteEnabled} label="Portfolio write" />
          <GuardCard guard={guardSet.stockPositionDatabaseWriteEnabled} label="Stock position write" />
          <GuardCard guard={guardSet.cryptoPositionDatabaseWriteEnabled} label="Crypto position write" />
          <GuardCard guard={guardSet.fcnDatabaseWriteEnabled} label="FCN write" />
        </div>
      ) : null}

      <article className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
            Latest explicit write action
          </h3>
          <Pill>{lastWrite?.status ?? "none"}</Pill>
        </div>
        <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
          {lastWrite
            ? `${lastWrite.module} ${lastWrite.operation}: target=${lastWrite.target}; fallback=${lastWrite.fallbackUsed ? "active" : "inactive"}`
            : "No V13 Portfolio / Stock / Crypto database write action has been recorded in this browser."}
        </p>
        {lastWrite?.errorMessage ? (
          <p className="mt-2 text-xs leading-5 text-[var(--ixai-forest-soft)]">
            {lastWrite.errorMessage}
          </p>
        ) : null}
      </article>

      <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
        V13 does not run migrations, change RLS/auth, enable FCN writes, connect broker/market providers, add trading logic, or add AI recommendations. FCN database write activation is deferred to V14.
      </p>
    </section>
  );
}
