"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, RefreshCw } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { runWorkspaceRuntimeBudget } from "@/src/lib/workspace/runtime-safety";

type DiagnosticsStatus = "idle" | "ready" | "running" | "skipped" | "unavailable";

type DiagnosticsCard = {
  detail: string;
  key: string;
  status: DiagnosticsStatus;
  title: string;
};

const INITIAL_CARDS: DiagnosticsCard[] = [
  {
    detail: "Advanced diagnostics are paused on initial render to keep Settings route entry lightweight.",
    key: "workspace-integration",
    status: "idle",
    title: "Workspace Integration Status",
  },
  {
    detail: "Platform cutover diagnostics run only after a manual request.",
    key: "platform-cutover",
    status: "idle",
    title: "Platform Cutover Status",
  },
  {
    detail: "Database activation diagnostics run only after a manual request.",
    key: "database-activation",
    status: "idle",
    title: "Database Activation Status",
  },
  {
    detail: "Migration health is deferred so Settings never blocks on mount.",
    key: "migration-health",
    status: "idle",
    title: "Migration Health",
  },
  {
    detail: "Runtime stabilization status is documented and does not auto-run builders on mount.",
    key: "runtime-stabilization",
    status: "idle",
    title: "Runtime Stabilization Status",
  },
  {
    detail: "Workspace Graph diagnostics are not aggregated until requested.",
    key: "workspace-graph",
    status: "idle",
    title: "Workspace Graph Diagnostics",
  },
];

function statusLabel(status: DiagnosticsStatus) {
  if (status === "ready") return "ready";
  if (status === "running") return "running";
  if (status === "skipped") return "deferred";
  if (status === "unavailable") return "fallback";
  return "paused";
}

export function SettingsRuntimeDiagnosticsControl() {
  const [cards, setCards] = useState<DiagnosticsCard[]>(INITIAL_CARDS);
  const [isRunning, setIsRunning] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  async function runDiagnostics() {
    setIsRunning(true);
    setCards((current) =>
      current.map((card) => ({
        ...card,
        detail:
          card.status === "idle"
            ? "Diagnostics requested. This section is running with a runtime budget."
            : card.detail,
        status: "running",
      })),
    );

    const fallbackCards = INITIAL_CARDS.map((card) => ({
      ...card,
      detail: "Diagnostics reached the runtime budget and fell back safely.",
      status: "unavailable" as const,
    }));

    const nextCards = await runWorkspaceRuntimeBudget(
      "settings-runtime-diagnostics-manual",
      async () => {
        const [
          integrationModule,
          readPriorityModule,
          platformModule,
          databaseActivationModule,
          migrationModule,
          graphModule,
        ] = await Promise.all([
          import("@/src/lib/workspace/integration/integration-service"),
          import("@/src/lib/workspace/database-read-priority-status"),
          import("@/src/lib/workspace/platform"),
          import("@/src/lib/workspace/database-activation"),
          import("@/src/lib/persistence/migrations"),
          import("@/src/lib/workspace/graph"),
        ]);
        const [integration, readPriority, platform, databaseActivation, migration, graph] =
          await Promise.allSettled([
            Promise.resolve(integrationModule.getWorkspaceIntegrationAudit()),
            readPriorityModule.getWorkspaceDatabaseReadPriorityStatus(),
            platformModule.getWorkspacePlatformCutoverStatus(),
            databaseActivationModule.getV11DatabaseActivationReport(),
            migrationModule.getDatabaseMigrationHealthReport(),
            graphModule.getWorkspaceGraphSummary(),
          ]);

        return [
          {
            detail:
              integration.status === "fulfilled"
                ? `${integration.value.moduleCount} modules checked; status ${integration.value.overallStatus}.`
                : "Workspace integration audit fell back safely.",
            key: "workspace-integration",
            status: integration.status === "fulfilled" ? "ready" : "unavailable",
            title: "Workspace Integration Status",
          },
          {
            detail:
              platform.status === "fulfilled"
                ? `Platform cutover status ${platform.value.sourceStatus}; access ${platform.value.access.source}.`
                : "Platform cutover diagnostics fell back safely.",
            key: "platform-cutover",
            status: platform.status === "fulfilled" ? "ready" : "unavailable",
            title: "Platform Cutover Status",
          },
          {
            detail:
              databaseActivation.status === "fulfilled"
                ? `Activation phase ${databaseActivation.value.activationPhase}; missing tables ${databaseActivation.value.missingTables.length}.`
                : "Database activation diagnostics fell back safely.",
            key: "database-activation",
            status: databaseActivation.status === "fulfilled" ? "ready" : "unavailable",
            title: "Database Activation Status",
          },
          {
            detail:
              migration.status === "fulfilled"
                ? `Migration health ${migration.value.sourceStatus}; expected tables ${migration.value.expectedTables.length}.`
                : "Migration health diagnostics fell back safely.",
            key: "migration-health",
            status: migration.status === "fulfilled" ? "ready" : "unavailable",
            title: "Migration Health",
          },
          {
            detail:
              readPriority.status === "fulfilled"
                ? `Read priority ${readPriority.value.sourceStatus}; ${readPriority.value.items.length} modules checked.`
                : "Runtime stabilization read-priority check fell back safely.",
            key: "runtime-stabilization",
            status: readPriority.status === "fulfilled" ? "ready" : "unavailable",
            title: "Runtime Stabilization Status",
          },
          {
            detail:
              graph.status === "fulfilled"
                ? `Workspace Graph ${graph.value.sourceStatus}; ${graph.value.moduleCount} modules summarized.`
                : "Workspace Graph diagnostics fell back safely.",
            key: "workspace-graph",
            status: graph.status === "fulfilled" ? "ready" : "unavailable",
            title: "Workspace Graph Diagnostics",
          },
        ] satisfies DiagnosticsCard[];
      },
      fallbackCards,
      { threshold: 2, timeoutMs: 3000 },
    );

    if (!mountedRef.current) {
      return;
    }

    setCards(nextCards);
    setIsRunning(false);
  }

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={Activity} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Runtime-safe diagnostics
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
              Settings diagnostics are manual
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              Heavy Workspace diagnostics are paused on route entry. Run them manually when needed; each run has a runtime budget and falls back safely.
            </p>
          </div>
        </div>
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] disabled:opacity-60"
          disabled={isRunning}
          onClick={() => void runDiagnostics()}
          type="button"
        >
          <RefreshCw className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          {isRunning ? "Running" : "Run diagnostics"}
        </button>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {cards.map((card) => (
          <article
            className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
            key={card.key}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
                {card.title}
              </h3>
              <span className="rounded-full border border-[var(--ixai-border)] bg-white/70 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase text-[var(--ixai-forest-soft)]">
                {statusLabel(card.status)}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
              {card.detail}
            </p>
          </article>
        ))}
      </div>

      <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
        Diagnostics are read-only. No migrations, auth behavior, RLS, membership, billing, broker, trading, recommendation, scheduler, or notification delivery changes are introduced.
      </p>
    </section>
  );
}
