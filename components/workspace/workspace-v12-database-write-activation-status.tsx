"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { DatabaseZap, RefreshCw } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import {
  getV12DatabaseWriteActivationStatus,
  type V12DatabaseWriteActivationStatus,
  type V12ModuleWriteStatus,
} from "@/src/lib/workspace/database-write-activation";

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[var(--ixai-border)] bg-white/70 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
      {children}
    </span>
  );
}

function ModuleCard({ item }: { item: V12ModuleWriteStatus }) {
  return (
    <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
          {item.module}
        </h3>
        <Pill>{item.status}</Pill>
      </div>
      <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
        {item.guard.reason}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Pill>guard: {item.guard.enabled ? "enabled" : "disabled"}</Pill>
        <Pill>source: {item.guard.source}</Pill>
        <Pill>database: {item.databaseReady ? "ready" : "not ready"}</Pill>
        <Pill>fallback: {item.fallbackActive ? "active" : "inactive"}</Pill>
      </div>
    </article>
  );
}

export function WorkspaceV12DatabaseWriteActivationStatus() {
  const [status, setStatus] = useState<V12DatabaseWriteActivationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(false);

  async function refresh() {
    setIsLoading(true);
    try {
      const next = await getV12DatabaseWriteActivationStatus();
      if (!mountedRef.current) return;
      setStatus(next);
    } catch (error) {
      if (!mountedRef.current) return;
      console.warn("[IXAI SETTINGS] V12 write activation diagnostics unavailable", error);
      setStatus(null);
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
          <FeatureIcon icon={DatabaseZap} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              V12 Database Write Activation
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
              First guarded database writes
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              Watchlist and Alert History can use controlled database writes only when explicit guards are enabled. Portfolio and FCN writes remain readiness-only, and local fallback stays active.
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
        <Pill>workspace: {status?.bootstrap.source ?? "loading"}</Pill>
        <Pill>created: {status?.bootstrap.created ? "yes" : "no"}</Pill>
        <Pill>fallback: {status?.bootstrap.fallbackUsed ? "active" : "inactive"}</Pill>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {status ? (
          <>
            <ModuleCard item={status.watchlist} />
            <ModuleCard item={status.alertHistory} />
            {status.disabledModules.map((item) => (
              <ModuleCard item={item} key={item.module} />
            ))}
          </>
        ) : (
          <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4 text-sm text-[var(--ixai-forest-soft)]">
            Loading V12 write activation diagnostics...
          </article>
        )}
      </div>

      <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
        {status?.safeNextAction ?? "V12 diagnostics do not write during render."} No migration, auth redirect, broker integration, trading logic, AI recommendation, or database-only cutover is introduced.
      </p>
    </section>
  );
}
