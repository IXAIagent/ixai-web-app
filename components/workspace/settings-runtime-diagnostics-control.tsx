"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, RefreshCw } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { useTranslation } from "@/src/lib/i18n";
import { runWorkspaceRuntimeBudget } from "@/src/lib/workspace/runtime-safety";

type DiagnosticsStatus = "idle" | "ready" | "running" | "skipped" | "unavailable";

type DiagnosticsCard = {
  detail: string;
  key: string;
  status: DiagnosticsStatus;
  title: string;
};

function interpolate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (nextTemplate, [key, value]) => nextTemplate.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function buildInitialCards(t: (key: string, fallback?: string) => string): DiagnosticsCard[] {
  return [
  {
    detail: t("diagnosticsWorkspaceIntegrationIdle"),
    key: "workspace-integration",
    status: "idle",
    title: t("diagnosticsWorkspaceIntegrationTitle"),
  },
  {
    detail: t("diagnosticsPlatformCutoverIdle"),
    key: "platform-cutover",
    status: "idle",
    title: t("diagnosticsPlatformCutoverTitle"),
  },
  {
    detail: t("diagnosticsDatabaseActivationIdle"),
    key: "database-activation",
    status: "idle",
    title: t("diagnosticsDatabaseActivationTitle"),
  },
  {
    detail: t("diagnosticsMigrationHealthIdle"),
    key: "migration-health",
    status: "idle",
    title: t("diagnosticsMigrationHealthTitle"),
  },
  {
    detail: t("diagnosticsRuntimeStabilizationIdle"),
    key: "runtime-stabilization",
    status: "idle",
    title: t("diagnosticsRuntimeStabilizationTitle"),
  },
  {
    detail: t("diagnosticsWorkspaceGraphIdle"),
    key: "workspace-graph",
    status: "idle",
    title: t("diagnosticsWorkspaceGraphTitle"),
  },
  ];
}

function statusLabel(status: DiagnosticsStatus) {
  if (status === "ready") return "ready";
  if (status === "running") return "running";
  if (status === "skipped") return "deferred";
  if (status === "unavailable") return "fallback";
  return "paused";
}

export function SettingsRuntimeDiagnosticsControl() {
  const { t } = useTranslation("settings");
  const [cards, setCards] = useState<DiagnosticsCard[]>(() => buildInitialCards(t));
  const [isRunning, setIsRunning] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  async function runDiagnostics() {
    const initialCards = buildInitialCards(t);
    setIsRunning(true);
    setCards((current) =>
      current.map((card) => ({
        ...card,
        detail:
          card.status === "idle"
            ? t("diagnosticsRequested")
            : card.detail,
        status: "running",
      })),
    );

    const fallbackCards = initialCards.map((card) => ({
      ...card,
      detail: t("diagnosticsFallback"),
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
                ? interpolate(t("diagnosticsIntegrationReady"), {
                    count: integration.value.moduleCount,
                    status: integration.value.overallStatus,
                  })
                : t("diagnosticsIntegrationFallback"),
            key: "workspace-integration",
            status: integration.status === "fulfilled" ? "ready" : "unavailable",
            title: t("diagnosticsWorkspaceIntegrationTitle"),
          },
          {
            detail:
              platform.status === "fulfilled"
                ? interpolate(t("diagnosticsPlatformReady"), {
                    source: platform.value.access.source,
                    status: platform.value.sourceStatus,
                  })
                : t("diagnosticsPlatformFallback"),
            key: "platform-cutover",
            status: platform.status === "fulfilled" ? "ready" : "unavailable",
            title: t("diagnosticsPlatformCutoverTitle"),
          },
          {
            detail:
              databaseActivation.status === "fulfilled"
                ? interpolate(t("diagnosticsDatabaseReady"), {
                    count: databaseActivation.value.missingTables.length,
                    phase: databaseActivation.value.activationPhase,
                  })
                : t("diagnosticsDatabaseFallback"),
            key: "database-activation",
            status: databaseActivation.status === "fulfilled" ? "ready" : "unavailable",
            title: t("diagnosticsDatabaseActivationTitle"),
          },
          {
            detail:
              migration.status === "fulfilled"
                ? interpolate(t("diagnosticsMigrationReady"), {
                    count: migration.value.expectedTables.length,
                    status: migration.value.sourceStatus,
                  })
                : t("diagnosticsMigrationFallback"),
            key: "migration-health",
            status: migration.status === "fulfilled" ? "ready" : "unavailable",
            title: t("diagnosticsMigrationHealthTitle"),
          },
          {
            detail:
              readPriority.status === "fulfilled"
                ? interpolate(t("diagnosticsReadPriorityReady"), {
                    count: readPriority.value.items.length,
                    status: readPriority.value.sourceStatus,
                  })
                : t("diagnosticsReadPriorityFallback"),
            key: "runtime-stabilization",
            status: readPriority.status === "fulfilled" ? "ready" : "unavailable",
            title: t("diagnosticsRuntimeStabilizationTitle"),
          },
          {
            detail:
              graph.status === "fulfilled"
                ? interpolate(t("diagnosticsGraphReady"), {
                    count: graph.value.moduleCount,
                    status: graph.value.sourceStatus,
                  })
                : t("diagnosticsGraphFallback"),
            key: "workspace-graph",
            status: graph.status === "fulfilled" ? "ready" : "unavailable",
            title: t("diagnosticsWorkspaceGraphTitle"),
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
              {t("runtimeDiagnosticsEyebrow")}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
              {t("runtimeDiagnosticsTitle")}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              {t("runtimeDiagnosticsBody")}
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
          {isRunning ? t("runtimeDiagnosticsRunning") : t("runtimeDiagnosticsRun")}
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
        {t("runtimeDiagnosticsDisclaimer")}
      </p>
    </section>
  );
}
