"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { getV11DatabaseActivationReport } from "@/src/lib/workspace/database-activation";
import type { V11DatabaseActivationReport } from "@/src/lib/workspace/database-activation";
import { getV11DatabaseCutoverStatus } from "@/src/lib/workspace/database-cutover";
import type { V11DatabaseCutoverStatus } from "@/src/lib/workspace/database-cutover";
import { getV12DatabaseWriteActivationStatus } from "@/src/lib/workspace/database-write-activation";
import type { V12DatabaseWriteActivationStatus } from "@/src/lib/workspace/database-write-activation";
import {
  getV13PortfolioWriteDiagnostics,
  type V13PortfolioWriteDiagnostics,
} from "@/src/lib/workspace/portfolio-database-write-activation";
import { getWorkspacePlatformCutoverStatus } from "@/src/lib/workspace/platform";
import type { WorkspacePlatformCutoverStatus } from "@/src/lib/workspace/platform";

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[var(--ixai-border)] bg-white/70 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
      {children}
    </span>
  );
}

export function WorkspacePlatformCutoverStatus() {
  const [status, setStatus] = useState<WorkspacePlatformCutoverStatus | null>(null);
  const [v11Status, setV11Status] = useState<V11DatabaseActivationReport | null>(null);
  const [v11Cutover, setV11Cutover] = useState<V11DatabaseCutoverStatus | null>(null);
  const [v12Status, setV12Status] = useState<V12DatabaseWriteActivationStatus | null>(null);
  const [v13Status, setV13Status] = useState<V13PortfolioWriteDiagnostics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refresh() {
    setIsLoading(true);
    const [platform, v11, cutover, v12, v13] = await Promise.all([
      getWorkspacePlatformCutoverStatus(),
      getV11DatabaseActivationReport(),
      getV11DatabaseCutoverStatus(),
      getV12DatabaseWriteActivationStatus(),
      getV13PortfolioWriteDiagnostics(),
    ]);
    setStatus(platform);
    setV11Status(v11);
    setV11Cutover(cutover);
    setV12Status(v12);
    setV13Status(v13);
    setIsLoading(false);
  }

  useEffect(() => {
    queueMicrotask(() => void refresh());
  }, []);

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={ShieldCheck} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              V10 Platform Cutover
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
              Platform readiness diagnostics
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              Ownership, membership, guarded writes, dry-run reconciliation, migration preparation, and production readiness are checked without changing auth, RLS, schema, or fallback behavior.
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
        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
            Ownership enforcement
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            {status?.access.reason ?? "Loading ownership readiness..."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill>role: {status?.access.role ?? "unknown"}</Pill>
            <Pill>read: {status?.access.canRead ? "yes" : "no"}</Pill>
            <Pill>write: {status?.access.canWrite ? "yes" : "guarded"}</Pill>
            <Pill>manage: {status?.access.canManage ? "yes" : "no"}</Pill>
          </div>
        </article>

        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
            Membership foundation
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            {status?.membership.summary ?? "Loading membership readiness..."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill>{status?.membership.sourceStatus ?? "loading"}</Pill>
            <Pill>fallback: {status?.membership.fallbackUsed ? "active" : "inactive"}</Pill>
            <Pill>members: {status?.membership.members.length ?? 0}</Pill>
          </div>
        </article>

        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
            Guarded write cutover
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            Database write cutover remains feature-guarded. Existing local, draft, and deterministic fallback writes stay available.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill>portfolio: {status?.writeCutover.portfolio.target ?? "loading"}</Pill>
            <Pill>fcn: {status?.writeCutover.fcn.target ?? "loading"}</Pill>
            <Pill>watchlist: {status?.writeCutover.watchlist.target ?? "loading"}</Pill>
            <Pill>alerts: {status?.writeCutover.alerts.target ?? "loading"}</Pill>
          </div>
        </article>

        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
            Sync reconciliation
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            {status?.reconciliation.summary ?? "Loading dry-run reconciliation plan..."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill>checked: {status?.reconciliation.totalItemsChecked ?? 0}</Pill>
            <Pill>actions: {status?.reconciliation.actionsProposed ?? 0}</Pill>
            <Pill>blocked: {status?.reconciliation.blockedItems ?? 0}</Pill>
            <Pill>safe apply: {status?.reconciliation.safeToApply ? "yes" : "no"}</Pill>
          </div>
        </article>

        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
            Migration execution prep
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            {status?.migrationPrep.summary ?? "Loading migration preparation..."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill>{status?.migrationPrep.status ?? "loading"}</Pill>
            <Pill>remote executed: {status?.migrationPrep.remoteMigrationExecuted ? "yes" : "no"}</Pill>
            <Pill>tables: {status?.migrationPrep.expectedTables.length ?? 0}</Pill>
          </div>
        </article>

        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
            Production readiness
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            {status?.productionReadiness.summary ?? "Loading production readiness..."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill>{status?.productionReadiness.overallStatus ?? "loading"}</Pill>
            <Pill>backup: {status?.productionReadiness.backupReadiness ?? "loading"}</Pill>
            <Pill>audit: {status?.productionReadiness.auditLogReadiness ?? "loading"}</Pill>
            <Pill>fallback: {status?.productionReadiness.fallbackStatus ?? "loading"}</Pill>
          </div>
        </article>

        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
            Database activation
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            {v11Status?.safeNextAction ?? "Loading V11 database activation readiness..."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill>{v11Status?.activationPhase ?? "loading"}</Pill>
            <Pill>migration: {v11Status?.migrationReadiness ?? "loading"}</Pill>
            <Pill>missing: {v11Status?.missingTables.length ?? 0}</Pill>
            <Pill>writes: guarded</Pill>
          </div>
        </article>

        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
            V11 controlled cutover
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            {v11Cutover?.summary ?? "Loading V11.20/V11.30 cutover readiness..."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill>writes: {v11Cutover?.controlledWrite.guard.enabled ? "enabled" : "disabled"}</Pill>
            <Pill>migration: {v11Cutover?.migrationReadiness.status ?? "loading"}</Pill>
            <Pill>manual required: {v11Cutover?.migrationReadiness.manualMigrationRequired ? "yes" : "no"}</Pill>
            <Pill>remote executed: {v11Cutover?.migrationReadiness.remoteMigrationExecuted ? "yes" : "no"}</Pill>
          </div>
        </article>

        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
            V12 write activation
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            {v12Status?.summary ?? "Loading V12 guarded write activation status..."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill>watchlist: {v12Status?.watchlist.status ?? "loading"}</Pill>
            <Pill>alerts: {v12Status?.alertHistory.status ?? "loading"}</Pill>
            <Pill>portfolio: disabled</Pill>
            <Pill>fcn: disabled</Pill>
          </div>
        </article>

        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
            V13 portfolio writes
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            {v13Status?.summary ?? "Loading V13 Portfolio / Stock / Crypto write activation status..."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill>
              portfolio:{" "}
              {v13Status?.readiness.guardSet.portfolioDatabaseWriteEnabled.enabled
                ? "enabled"
                : "guarded"}
            </Pill>
            <Pill>
              stock:{" "}
              {v13Status?.readiness.guardSet.stockPositionDatabaseWriteEnabled.enabled
                ? "enabled"
                : "guarded"}
            </Pill>
            <Pill>
              crypto:{" "}
              {v13Status?.readiness.guardSet.cryptoPositionDatabaseWriteEnabled.enabled
                ? "enabled"
                : "guarded"}
            </Pill>
            <Pill>fcn: disabled</Pill>
          </div>
        </article>
      </div>

      <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
        Platform cutover diagnostics are internal readiness metadata only. Sync apply is disabled by default, writes are guarded, no remote migration was executed, and no broker, trading, or AI recommendation logic is introduced.
      </p>
    </section>
  );
}
