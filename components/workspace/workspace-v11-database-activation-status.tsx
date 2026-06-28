"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Database, RefreshCw } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { getV11DatabaseActivationReport } from "@/src/lib/workspace/database-activation";
import type { V11DatabaseActivationReport } from "@/src/lib/workspace/database-activation";
import { getV11DatabaseCutoverStatus } from "@/src/lib/workspace/database-cutover";
import type { V11DatabaseCutoverStatus } from "@/src/lib/workspace/database-cutover";

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[var(--ixai-border)] bg-white/70 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
      {children}
    </span>
  );
}

export function WorkspaceV11DatabaseActivationStatus() {
  const [report, setReport] = useState<V11DatabaseActivationReport | null>(null);
  const [cutover, setCutover] = useState<V11DatabaseCutoverStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(false);

  async function refresh() {
    setIsLoading(true);
    try {
      const [activation, cutoverStatus] = await Promise.all([
        getV11DatabaseActivationReport(),
        getV11DatabaseCutoverStatus(),
      ]);
      if (!mountedRef.current) return;
      setReport(activation);
      setCutover(cutoverStatus);
    } catch (error) {
      if (!mountedRef.current) return;
      console.warn("[IXAI SETTINGS] V11 database activation diagnostics unavailable", error);
      setReport(null);
      setCutover(null);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    mountedRef.current = true;

    queueMicrotask(() => {
      if (!cancelled) void refresh();
    });

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, []);

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={Database} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              V11 Database Activation
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
              Database activation and cutover readiness
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              Migration files are prepared, database readback is validated, controlled writes stay guard-first, and remote migration execution remains manual. Truth Layer and local fallback stay active.
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
        <Pill>{report?.activationPhase ?? "loading"}</Pill>
        <Pill>migration: {report?.migrationReadiness ?? "loading"}</Pill>
        <Pill>missing tables: {report?.missingTables.length ?? 0}</Pill>
        <Pill>blocking issues: {report?.blockingIssues.length ?? 0}</Pill>
        <Pill>writes: {cutover?.controlledWrite.guard.enabled ? "enabled" : "disabled"}</Pill>
        <Pill>remote migration: {cutover?.migrationReadiness.remoteMigrationExecuted ? "executed" : "not executed"}</Pill>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
            Readback validation
          </h3>
          <div className="mt-3 grid gap-2">
            {(report?.readbackValidation ?? []).map((item) => (
              <div
                className="rounded-lg border border-[var(--ixai-border)] bg-white/60 p-3"
                key={item.module}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-[var(--ixai-forest)]">
                    {item.module}
                  </span>
                  <Pill>{item.canRead ? "can read" : "fallback"}</Pill>
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                  rows={item.rowCount}; source={item.source}; fallback={item.fallbackUsed ? "active" : "inactive"}
                  {item.blockingReason ? `; ${item.blockingReason}` : ""}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
            Write activation readiness
          </h3>
          <div className="mt-3 grid gap-2">
            {(report?.writeReadiness ?? []).map((item) => (
              <div
                className="rounded-lg border border-[var(--ixai-border)] bg-white/60 p-3"
                key={item.module}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-[var(--ixai-forest)]">
                    {item.module}
                  </span>
                  <Pill>{item.canWrite ? "write ready" : "guarded"}</Pill>
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                  missing={item.missingRequirements.length}; fallback={item.fallbackAvailable ? "available" : "missing"}; {item.recommendedNextStep}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
            Controlled write activation
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            {cutover?.controlledWrite.summary ?? "Loading V11.20 guarded write readiness..."}
          </p>
          <div className="mt-3 grid gap-2">
            {(cutover?.controlledWrite.modules ?? []).map((item) => (
              <div
                className="rounded-lg border border-[var(--ixai-border)] bg-white/60 p-3"
                key={item.module}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-[var(--ixai-forest)]">
                    {item.module}
                  </span>
                  <Pill>{item.guardEnabled ? "guard enabled" : "guard disabled"}</Pill>
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                  readiness={item.readiness}; attempted={item.databaseAttempted ? "yes" : "no"}; fallback={item.fallbackActive ? "active" : "inactive"}
                  {item.blockingReason ? `; ${item.blockingReason}` : ""}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
            Remote migration readiness
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            {cutover?.migrationReadiness.safeNextAction ?? "Loading V11.30 migration readiness..."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill>{cutover?.migrationReadiness.status ?? "loading"}</Pill>
            <Pill>manual migration: required</Pill>
            <Pill>remote executed: {cutover?.migrationReadiness.remoteMigrationExecuted ? "yes" : "no"}</Pill>
            <Pill>checks: {cutover?.migrationReadiness.checks.length ?? 0}</Pill>
          </div>
        </article>
      </div>

      <div className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
        <p>{report?.safeNextAction ?? "Loading safe next action..."}</p>
        <p className="mt-2">
          No remote migration is executed by this UI. Broker, Yahoo, Binance, trading, AI recommendations, auth redirects, Truth Layer removal, and local fallback removal remain out of scope.
        </p>
      </div>
    </section>
  );
}
