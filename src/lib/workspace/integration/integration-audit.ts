import { buildFcnPortfolioRiskSummary } from "@/src/lib/fcn/risk/fcn-risk-engine";
import { buildFcnPortfolioScheduleSummary } from "@/src/lib/fcn/schedule/fcn-schedule-engine";
import {
  getMarketCacheSnapshot,
  getMarketReadiness,
  getMarketQuote,
  getMarketQuotes,
} from "@/src/lib/market/market-service";
import { buildPortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-center";
import { buildPortfolioValuation } from "@/src/lib/portfolio/valuation/portfolio-valuation-engine";
import { buildPortfolioPersistenceSummary } from "@/src/lib/portfolio/persistence/persistence-summary";
import { buildMorningBrief } from "@/src/lib/morning-brief/brief-engine";
import { buildMorningNewsPlaceholder } from "@/src/lib/morning-brief/brief-news-placeholder";
import { buildMarketDataSnapshot } from "@/src/lib/market-data";
import { buildMorningMarketDataSummary } from "@/src/lib/morning-brief/brief-market-data-adapter";
import { buildIntelligenceV2Report } from "@/src/lib/intelligence/v2";
import { getSaasFoundationReadiness } from "@/src/lib/saas-foundation";
import { buildLiveProviderReadinessReport } from "@/src/lib/market-data/live-provider-readiness";
import { buildPortfolioLiveValuationReadiness } from "@/src/lib/valuation";
import { buildBrokerHealthDiagnostics } from "@/src/lib/broker";
import { buildRiskAutomationReadinessReport } from "@/src/lib/risk/automation-readiness";
import { buildLegacyFcnRiskSummary } from "@/src/lib/risk/legacy-risk-engine/fcn-risk-engine";
import { buildLegacyPortfolioRiskSummary } from "@/src/lib/risk/legacy-risk-engine/portfolio-risk-engine";
import { buildPortfolioRiskSummary } from "@/src/lib/risk/risk-engine";
import { buildWorkspaceNotificationSummary } from "@/src/lib/notifications/notification-engine";
import { checkAlertTablesReadiness, listPersistentAlertEvents } from "@/src/lib/alerts/persistence";
import { checkFcnTablesReadiness, listPersistentFcnPositions } from "@/src/lib/persistence/fcn";
import { checkOwnershipActivationReadiness, getWorkspaceOwnershipStatus } from "@/src/lib/persistence/ownership";
import { checkPortfolioTablesReadiness, listPortfolioPositions } from "@/src/lib/persistence/portfolio";
import { getLivePortfolioPersistenceReadiness } from "@/src/lib/persistence/portfolio/portfolio-live-service";
import { getLiveFcnPersistenceReadiness } from "@/src/lib/persistence/fcn/fcn-live-service";
import { getLiveAlertHistoryReadiness } from "@/src/lib/alerts/persistence/alert-live-service";
import { getLiveWatchlistPersistenceReadiness } from "@/src/lib/watchlist/persistence/watchlist-live-service";
import { getDatabaseMigrationHealthReport } from "@/src/lib/persistence/migrations";
import { getWorkspaceDatabaseActivationReport } from "@/src/lib/persistence/sync";
import { checkWatchlistTablesReadiness, listPersistentWatchlistItems } from "@/src/lib/watchlist/persistence";
import { resolveDatabaseReadPriority } from "@/src/lib/workspace/database-read-priority";
import { getV11DatabaseActivationReport } from "@/src/lib/workspace/database-activation";
import { getV11DatabaseCutoverStatus } from "@/src/lib/workspace/database-cutover";
import { getV12DatabaseWriteActivationStatus } from "@/src/lib/workspace/database-write-activation";
import { getV13PortfolioWriteDiagnostics } from "@/src/lib/workspace/portfolio-database-write-activation";
import { getV14FcnWriteDiagnostics } from "@/src/lib/workspace/fcn-database-activation";
import { getWorkspacePlatformCutoverStatus } from "@/src/lib/workspace/platform";
import { buildWorkspaceGraphSummary } from "@/src/lib/workspace/graph/workspace-graph-engine";
import { buildWorkspaceHealthScore } from "@/src/lib/workspace/health/workspace-health-engine";
import { getWorkspaceApiGatewayStatus } from "@/src/lib/workspace/api/workspace-api-status";
import { buildWorkspaceTimelineSummary } from "@/src/lib/workspace/timeline/timeline-engine";
import type {
  WorkspaceDataLineageNode,
  WorkspaceIntegrationAudit,
  WorkspaceIntegrationIssue,
  WorkspaceIntegrationStatus,
} from "@/src/lib/workspace/integration/integration-types";

type ModuleAudit = {
  issues: WorkspaceIntegrationIssue[];
  node: WorkspaceDataLineageNode;
};

function functionAvailable(value: unknown) {
  return typeof value === "function";
}

function buildNode(input: {
  id: string;
  name: string;
  source: string;
  status: WorkspaceIntegrationStatus;
  target: string;
}): WorkspaceDataLineageNode {
  return input;
}

function getStatus(input: {
  hasFallback?: boolean;
  requiredExports: boolean[];
  warnings?: boolean;
}): WorkspaceIntegrationStatus {
  if (input.requiredExports.some((available) => !available)) {
    return "broken";
  }

  if (input.warnings || !input.hasFallback) {
    return "warning";
  }

  return "healthy";
}

function missingExportIssue(input: {
  available: boolean;
  exportName: string;
  module: string;
}): WorkspaceIntegrationIssue | null {
  if (input.available) {
    return null;
  }

  return {
    message: `Expected export ${input.exportName} is not available.`,
    module: input.module,
    severity: "critical",
  };
}

function compactIssues(
  issues: Array<WorkspaceIntegrationIssue | null | undefined>,
): WorkspaceIntegrationIssue[] {
  return issues.filter((issue): issue is WorkspaceIntegrationIssue => Boolean(issue));
}

export function auditTruthLayer(): ModuleAudit {
  const moduleName = "Truth Layer";
  const buildReadbackAvailable = functionAvailable(buildPortfolioTruthReadback);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [buildReadbackAvailable],
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available: buildReadbackAvailable,
        exportName: "buildPortfolioTruthReadback",
        module: moduleName,
      }),
    ]),
    node: buildNode({
      id: "truth-layer",
      name: moduleName,
      source: "Input Truth Bridge + FCN / Stock / Crypto / Portfolio APIs",
      status,
      target: "Portfolio, Valuation, Risk, Intelligence",
    }),
  };
}

export function auditPersistenceLayer(): ModuleAudit {
  const moduleName = "Portfolio Persistence";
  const persistenceAvailable = functionAvailable(buildPortfolioPersistenceSummary);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [persistenceAvailable],
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available: persistenceAvailable,
        exportName: "buildPortfolioPersistenceSummary",
        module: moduleName,
      }),
    ]),
    node: buildNode({
      id: "portfolio-persistence-layer",
      name: moduleName,
      source: "Persisted APIs + Input Truth Bridge + FCN Draft Store + fallback inputs",
      status,
      target: "Portfolio Truth + Valuation + Risk + Intelligence",
    }),
  };
}

export function auditMarketLayer(): ModuleAudit {
  const moduleName = "Market Service";
  const quoteAvailable = functionAvailable(getMarketQuote);
  const quotesAvailable = functionAvailable(getMarketQuotes);
  const readinessAvailable = functionAvailable(getMarketReadiness);
  const readiness = readinessAvailable ? getMarketReadiness() : null;
  const hasProviderMetadata = (readiness?.readiness.providerCount ?? 0) > 0;
  const status = getStatus({
    hasFallback: true,
    requiredExports: [
      quoteAvailable,
      quotesAvailable,
      readinessAvailable,
      hasProviderMetadata,
    ],
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available: quoteAvailable,
        exportName: "getMarketQuote",
        module: moduleName,
      }),
      missingExportIssue({
        available: quotesAvailable,
        exportName: "getMarketQuotes",
        module: moduleName,
      }),
      missingExportIssue({
        available: readinessAvailable,
        exportName: "getMarketReadiness",
        module: moduleName,
      }),
      hasProviderMetadata
        ? null
        : {
            message: "Provider registry metadata is unavailable.",
            module: moduleName,
            severity: "critical",
          },
    ]),
    node: buildNode({
      id: "market-service-layer",
      name: moduleName,
      source: "Market Cache Layer",
      status,
      target: "Valuation / Risk / FCN Risk consumers",
    }),
  };
}

export function auditMarketCacheLayer(): ModuleAudit {
  const moduleName = "Market Cache";
  const cacheSnapshotAvailable = functionAvailable(getMarketCacheSnapshot);
  const cacheSnapshot = cacheSnapshotAvailable ? getMarketCacheSnapshot() : null;
  const status = getStatus({
    hasFallback: true,
    requiredExports: [cacheSnapshotAvailable],
    warnings: cacheSnapshot?.metadata.entryCount === 0,
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available: cacheSnapshotAvailable,
        exportName: "getMarketCacheSnapshot",
        module: moduleName,
      }),
      cacheSnapshot?.metadata.entryCount === 0
        ? {
            message:
              "Market cache is memory-only and currently empty until Workspace quote requests populate it.",
            module: moduleName,
            severity: "warning",
          }
        : null,
    ]),
    node: buildNode({
      id: "market-cache-layer",
      name: moduleName,
      source: "Yahoo Finance / Binance providers",
      status,
      target: "Market Service quote facade",
    }),
  };
}

export function auditValuationLayer(): ModuleAudit {
  const moduleName = "Portfolio Valuation";
  const valuationAvailable = functionAvailable(buildPortfolioValuation);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [valuationAvailable],
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available: valuationAvailable,
        exportName: "buildPortfolioValuation",
        module: moduleName,
      }),
    ]),
    node: buildNode({
      id: "valuation-layer",
      name: moduleName,
      source: "Portfolio Truth + Market Service quotes",
      status,
      target: "Portfolio Center + Risk Engine",
    }),
  };
}

export function auditRiskLayer(): ModuleAudit {
  const moduleName = "Portfolio Risk";
  const riskAvailable = functionAvailable(buildPortfolioRiskSummary);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [riskAvailable],
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available: riskAvailable,
        exportName: "buildPortfolioRiskSummary",
        module: moduleName,
      }),
    ]),
    node: buildNode({
      id: "risk-layer",
      name: moduleName,
      source: "Portfolio Valuation",
      status,
      target: "Risk Center + Intelligence Center",
    }),
  };
}

export function auditFcnRiskLayer(): ModuleAudit {
  const moduleName = "FCN Risk";
  const fcnRiskAvailable = functionAvailable(buildFcnPortfolioRiskSummary);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [fcnRiskAvailable],
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available: fcnRiskAvailable,
        exportName: "buildFcnPortfolioRiskSummary",
        module: moduleName,
      }),
    ]),
    node: buildNode({
      id: "fcn-risk-layer",
      name: moduleName,
      source: "FCN positions + Market Service quotes + manual overlays",
      status,
      target: "FCN Center + Risk Center",
    }),
  };
}

export function auditFcnScheduleLayer(): ModuleAudit {
  const moduleName = "FCN Schedule";
  const scheduleAvailable = functionAvailable(buildFcnPortfolioScheduleSummary);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [scheduleAvailable],
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available: scheduleAvailable,
        exportName: "buildFcnPortfolioScheduleSummary",
        module: moduleName,
      }),
    ]),
    node: buildNode({
      id: "fcn-schedule-layer",
      name: moduleName,
      source: "FCN observation schedules + maturity dates + draft schedules",
      status,
      target: "FCN Center schedule readback",
    }),
  };
}

export function auditWorkspaceGraphLayer(): ModuleAudit {
  const moduleName = "Workspace Graph";
  const graphAvailable = functionAvailable(buildWorkspaceGraphSummary);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [graphAvailable],
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available: graphAvailable,
        exportName: "buildWorkspaceGraphSummary",
        module: moduleName,
      }),
    ]),
    node: buildNode({
      id: "workspace-graph-layer",
      name: moduleName,
      source: "Workspace module services",
      status,
      target: "Health / Timeline / Notifications / API Gateway",
    }),
  };
}

export function auditWorkspaceNotificationLayer(): ModuleAudit {
  const moduleName = "Notification Center";
  const notificationAvailable = functionAvailable(buildWorkspaceNotificationSummary);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [notificationAvailable],
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available: notificationAvailable,
        exportName: "buildWorkspaceNotificationSummary",
        module: moduleName,
      }),
    ]),
    node: buildNode({
      id: "workspace-notification-layer",
      name: moduleName,
      source: "Alert Engine cards",
      status,
      target: "Notification Center",
    }),
  };
}

export function auditWorkspaceHealthLayer(): ModuleAudit {
  const moduleName = "Workspace Health";
  const healthAvailable = functionAvailable(buildWorkspaceHealthScore);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [healthAvailable],
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available: healthAvailable,
        exportName: "buildWorkspaceHealthScore",
        module: moduleName,
      }),
    ]),
    node: buildNode({
      id: "workspace-health-layer",
      name: moduleName,
      source: "Workspace Graph",
      status,
      target: "Workspace Home diagnostics",
    }),
  };
}

export function auditWorkspaceTimelineLayer(): ModuleAudit {
  const moduleName = "Timeline Engine";
  const timelineAvailable = functionAvailable(buildWorkspaceTimelineSummary);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [timelineAvailable],
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available: timelineAvailable,
        exportName: "buildWorkspaceTimelineSummary",
        module: moduleName,
      }),
    ]),
    node: buildNode({
      id: "workspace-timeline-layer",
      name: moduleName,
      source: "FCN Schedule + Alert Engine",
      status,
      target: "Timeline Center",
    }),
  };
}

export function auditWorkspaceApiGatewayLayer(): ModuleAudit {
  const moduleName = "Workspace API Gateway";
  const gatewayStatusAvailable = functionAvailable(getWorkspaceApiGatewayStatus);
  const gatewayStatus = gatewayStatusAvailable ? getWorkspaceApiGatewayStatus() : null;
  const status = getStatus({
    hasFallback: true,
    requiredExports: [gatewayStatusAvailable],
    warnings: gatewayStatus?.routeHandlersEnabled === false,
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available: gatewayStatusAvailable,
        exportName: "getWorkspaceApiGatewayStatus",
        module: moduleName,
      }),
      gatewayStatus?.routeHandlersEnabled === false
        ? {
            message:
              "Workspace API Gateway is service-layer only; read-only route handlers are deferred for client-service safety.",
            module: moduleName,
            severity: "info",
          }
        : null,
    ]),
    node: buildNode({
      id: "workspace-api-gateway-layer",
      name: moduleName,
      source: "Workspace Graph / Health / Timeline / Notifications services",
      status,
      target: "Future read-only API endpoints",
    }),
  };
}

export function auditV7PortfolioPersistenceFoundation(): ModuleAudit {
  const moduleName = "V7 Portfolio Persistence Foundation";
  const available = functionAvailable(listPortfolioPositions);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [available],
    warnings: true,
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available,
        exportName: "listPortfolioPositions",
        module: moduleName,
      }),
      {
        message:
          "Persistent portfolio tables are draft-only; runtime continues to preserve local/fallback readback.",
        module: moduleName,
        severity: "info",
      },
    ]),
    node: buildNode({
      id: "v7-portfolio-persistence-foundation",
      name: moduleName,
      source: "Future persisted portfolio tables",
      status,
      target: "Portfolio Truth + Workspace Graph",
    }),
  };
}

export function auditV7OwnershipFoundation(): ModuleAudit {
  const moduleName = "V7 Workspace Ownership Foundation";
  const available = functionAvailable(getWorkspaceOwnershipStatus);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [available],
    warnings: true,
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available,
        exportName: "getWorkspaceOwnershipStatus",
        module: moduleName,
      }),
      {
        message:
          "Ownership is conservative and limited unless authenticated owner context is explicitly provided.",
        module: moduleName,
        severity: "info",
      },
    ]),
    node: buildNode({
      id: "v7-workspace-ownership-foundation",
      name: moduleName,
      source: "Existing session context when available",
      status,
      target: "Future multi-user workspace persistence",
    }),
  };
}

export function auditV7SyncFoundation(): ModuleAudit {
  const moduleName = "V7 Workspace Sync Foundation";
  return {
    issues: [
      {
        message:
          "Workspace Sync is readiness/reporting only; no background job or write operation is implemented.",
        module: moduleName,
        severity: "info",
      },
    ],
    node: buildNode({
      id: "v7-workspace-sync-foundation",
      name: moduleName,
      source: "Persistent readiness + local fallback + Truth Layer + Workspace Graph",
      status: "warning",
      target: "Future sync orchestration",
    }),
  };
}

export function auditV7FcnPersistenceFoundation(): ModuleAudit {
  const moduleName = "V7 FCN Persistence Foundation";
  const available = functionAvailable(listPersistentFcnPositions);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [available],
    warnings: true,
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available,
        exportName: "listPersistentFcnPositions",
        module: moduleName,
      }),
      {
        message:
          "FCN persistence preserves /api/fcn and local draft fallback; coupon schedule tables remain draft-only.",
        module: moduleName,
        severity: "info",
      },
    ]),
    node: buildNode({
      id: "v7-fcn-persistence-foundation",
      name: moduleName,
      source: "/api/fcn + FCN Draft Store",
      status,
      target: "FCN Center + FCN Risk + FCN Schedule",
    }),
  };
}

export function auditV7WatchlistPersistenceFoundation(): ModuleAudit {
  const moduleName = "V7 Watchlist Persistence Foundation";
  const available = functionAvailable(listPersistentWatchlistItems);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [available],
    warnings: true,
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available,
        exportName: "listPersistentWatchlistItems",
        module: moduleName,
      }),
      {
        message:
          "Watchlist persistence keeps local/fallback behavior until durable tables are explicitly migrated.",
        module: moduleName,
        severity: "info",
      },
    ]),
    node: buildNode({
      id: "v7-watchlist-persistence-foundation",
      name: moduleName,
      source: "Future watchlists + watchlist_items tables",
      status,
      target: "Watchlist + Alerts + Notifications",
    }),
  };
}

export function auditV7AlertPersistenceFoundation(): ModuleAudit {
  const moduleName = "V7 Alert Persistence Foundation";
  const available = functionAvailable(listPersistentAlertEvents);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [available],
    warnings: true,
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available,
        exportName: "listPersistentAlertEvents",
        module: moduleName,
      }),
      {
        message:
          "Alert persistence is history foundation only; delivery and background jobs remain out of scope.",
        module: moduleName,
        severity: "info",
      },
    ]),
    node: buildNode({
      id: "v7-alert-persistence-foundation",
      name: moduleName,
      source: "Future alert_history table",
      status,
      target: "Alerts + Notifications",
    }),
  };
}

export function auditV8DatabaseActivationDiagnostics(): ModuleAudit {
  const moduleName = "V8 Database Activation";
  const required = [
    functionAvailable(checkPortfolioTablesReadiness),
    functionAvailable(checkFcnTablesReadiness),
    functionAvailable(checkWatchlistTablesReadiness),
    functionAvailable(checkAlertTablesReadiness),
    functionAvailable(checkOwnershipActivationReadiness),
    functionAvailable(getWorkspaceDatabaseActivationReport),
  ];
  const status = getStatus({
    hasFallback: true,
    requiredExports: required,
    warnings: true,
  });

  return {
    issues: [
      {
        message:
          "Database activation is diagnostics/readiness only. Migrations are draft-only and runtime fallback remains active.",
        module: moduleName,
        severity: "info",
      },
    ],
    node: buildNode({
      id: "v8-database-activation-diagnostics",
      name: moduleName,
      source: "Database activation adapters + schema drafts",
      status,
      target: "Settings diagnostics + future activation workflow",
    }),
  };
}

export function auditV9RealPersistenceProgram(): ModuleAudit {
  const moduleName = "V9 Real Persistence";
  const required = [
    functionAvailable(getLivePortfolioPersistenceReadiness),
    functionAvailable(getLiveFcnPersistenceReadiness),
    functionAvailable(getLiveWatchlistPersistenceReadiness),
    functionAvailable(getLiveAlertHistoryReadiness),
    functionAvailable(getDatabaseMigrationHealthReport),
  ];
  const status = getStatus({
    hasFallback: true,
    requiredExports: required,
    warnings: true,
  });

  return {
    issues: [
      {
        message:
          "Real persistence is guarded and fallback-safe. Writes are readiness-gated and sync remains plan-only.",
        module: moduleName,
        severity: "info",
      },
    ],
    node: buildNode({
      id: "v9-real-persistence-program",
      name: moduleName,
      source: "V8 database adapters + local/draft fallback",
      status,
      target: "Settings diagnostics + future live persistence workflow",
    }),
  };
}

export function auditV10DatabaseReadPriority(): ModuleAudit {
  const moduleName = "V10 Database Read Priority";
  const required = [functionAvailable(resolveDatabaseReadPriority)];
  const status = getStatus({
    hasFallback: true,
    requiredExports: required,
    warnings: true,
  });

  return {
    issues: [
      {
        message:
          "Database read priority is database-first and fallback-preserving. V10.10 does not execute migrations or cut over write paths.",
        module: moduleName,
        severity: "info",
      },
    ],
    node: buildNode({
      id: "v10-database-read-priority",
      name: moduleName,
      source: "Database live readback",
      status,
      target: "Truth Layer + local fallback consumers",
    }),
  };
}

export function auditV10PlatformCutover(): ModuleAudit {
  const moduleName = "V10 Platform Cutover";
  const available = functionAvailable(getWorkspacePlatformCutoverStatus);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [available],
    warnings: true,
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available,
        exportName: "getWorkspacePlatformCutoverStatus",
        module: moduleName,
      }),
      {
        message:
          "V10.20-V10.70 platform cutover is readiness-only: guarded writes, dry-run sync, migration prep, and production diagnostics do not execute remote migrations or destructive reconciliation.",
        module: moduleName,
        severity: "info",
      },
    ]),
    node: buildNode({
      id: "v10-platform-cutover",
      name: moduleName,
      source: "Ownership + membership + guarded writes + sync reconciliation + migration prep",
      status,
      target: "Settings diagnostics + Workspace Graph",
    }),
  };
}

export function auditV11DatabaseActivationFoundation(): ModuleAudit {
  const moduleName = "V11 Database Activation Foundation";
  const available = functionAvailable(getV11DatabaseActivationReport);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [available],
    warnings: true,
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available,
        exportName: "getV11DatabaseActivationReport",
        module: moduleName,
      }),
      {
        message:
          "V11.10 prepares migration files and database activation diagnostics. Remote migration execution and write-path cutover remain out of scope.",
        module: moduleName,
        severity: "info",
      },
    ]),
    node: buildNode({
      id: "v11-database-activation-foundation",
      name: moduleName,
      source: "V11 migration draft + client-safe database readiness checks",
      status,
      target: "Settings diagnostics + Workspace Graph + V11.20 write activation planning",
    }),
  };
}

export function auditV11DatabaseCutoverProgram(): ModuleAudit {
  const moduleName = "V11 Database Cutover";
  const available = functionAvailable(getV11DatabaseCutoverStatus);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [available],
    warnings: true,
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available,
        exportName: "getV11DatabaseCutoverStatus",
        module: moduleName,
      }),
      {
        message:
          "V11.20/V11.30 adds guarded write activation readiness and remote migration review only. Diagnostics do not write during render and do not execute remote migrations.",
        module: moduleName,
        severity: "info",
      },
    ]),
    node: buildNode({
      id: "v11-database-cutover-program",
      name: moduleName,
      source: "V11 activation report + controlled write guard + migration review checklist",
      status,
      target: "Settings diagnostics + Workspace Graph + manual migration workflow",
    }),
  };
}

export function auditV12DatabaseWriteActivation(): ModuleAudit {
  const moduleName = "V12 Database Write Activation";
  const available = functionAvailable(getV12DatabaseWriteActivationStatus);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [available],
    warnings: true,
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available,
        exportName: "getV12DatabaseWriteActivationStatus",
        module: moduleName,
      }),
      {
        message:
          "V12.00 enables guarded Watchlist and Alert History database write paths only when explicit guards are enabled. Portfolio and FCN writes remain disabled/readiness-only.",
        module: moduleName,
        severity: "info",
      },
    ]),
    node: buildNode({
      id: "v12-database-write-activation",
      name: moduleName,
      source: "V11 tables + explicit V12 write guards + local fallback",
      status,
      target: "Settings diagnostics + Workspace Graph + future controlled writes",
    }),
  };
}

export function auditV13PortfolioDatabaseWriteActivation(): ModuleAudit {
  const moduleName = "V13 Portfolio Database Write Activation";
  const available = functionAvailable(getV13PortfolioWriteDiagnostics);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [available],
    warnings: true,
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available,
        exportName: "getV13PortfolioWriteDiagnostics",
        module: moduleName,
      }),
      {
        message:
          "V13.00 enables Portfolio / Stock / Crypto guarded write diagnostics and explicit-submit write attempts only when guards are enabled. FCN writes remain disabled for V14.",
        module: moduleName,
        severity: "info",
      },
    ]),
    node: buildNode({
      id: "v13-portfolio-database-write-activation",
      name: moduleName,
      source: "Asset Input submit + V12 global guard + V13 module guards + local fallback",
      status,
      target: "Portfolio Center + Settings diagnostics + Workspace Graph",
    }),
  };
}

export function auditV14FcnDatabaseActivation(): ModuleAudit {
  const moduleName = "V14 FCN Database Activation";
  const available = functionAvailable(getV14FcnWriteDiagnostics);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [available],
    warnings: true,
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available,
        exportName: "getV14FcnWriteDiagnostics",
        module: moduleName,
      }),
      {
        message:
          "V14.00 enables FCN guarded write diagnostics and explicit-submit write attempts only when V12 global and V14 FCN guards are enabled. Draft Store, Truth Layer, /api/fcn readback, and local fallback remain intact.",
        module: moduleName,
        severity: "info",
      },
    ]),
    node: buildNode({
      id: "v14-fcn-database-activation",
      name: moduleName,
      source: "FCN Wizard submit + V12 global guard + V14 FCN module guards + Draft Store fallback",
      status,
      target: "FCN Center + Settings diagnostics + Workspace Graph",
    }),
  };
}

export function auditV15LegacyRiskEngineMigration(): ModuleAudit {
  const moduleName = "V15 Legacy Risk Engine Migration";
  const portfolioAvailable = functionAvailable(buildLegacyPortfolioRiskSummary);
  const fcnAvailable = functionAvailable(buildLegacyFcnRiskSummary);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [portfolioAvailable, fcnAvailable],
    warnings: true,
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available: portfolioAvailable,
        exportName: "buildLegacyPortfolioRiskSummary",
        module: moduleName,
      }),
      missingExportIssue({
        available: fcnAvailable,
        exportName: "buildLegacyFcnRiskSummary",
        module: moduleName,
      }),
      {
        message:
          "V15.00 is a read-only pure calculation migration for portfolio risk, FCN worst-of, KI/strike/KO distance, concentration, and exposure. It performs no database writes and does not add trading or recommendation logic.",
        module: moduleName,
        severity: "info",
      },
    ]),
    node: buildNode({
      id: "v15-legacy-risk-engine-migration",
      name: moduleName,
      source: "Portfolio Truth Layer + FCN readback + local fallback data",
      status,
      target: "Risk Center + Home diagnostics + Settings diagnostics + Workspace Graph",
    }),
  };
}

export function auditV16MorningBriefEngine(): ModuleAudit {
  const moduleName = "V16 Morning Brief Engine";
  const briefAvailable = functionAvailable(buildMorningBrief);
  const newsPlaceholderAvailable = functionAvailable(buildMorningNewsPlaceholder);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [briefAvailable, newsPlaceholderAvailable],
    warnings: true,
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available: briefAvailable,
        exportName: "buildMorningBrief",
        module: moduleName,
      }),
      missingExportIssue({
        available: newsPlaceholderAvailable,
        exportName: "buildMorningNewsPlaceholder",
        module: moduleName,
      }),
      {
        message:
          "V16.00 is a read-only Morning Brief Engine using Portfolio, V15 Risk, FCN, and News Placeholder adapters. It does not add Telegram, scheduler, broker, trading, AI recommendation, SQL, or database writes.",
        module: moduleName,
        severity: "info",
      },
    ]),
    node: buildNode({
      id: "v16-morning-brief-engine",
      name: moduleName,
      source: "V15 Legacy Risk Engine + Portfolio / FCN adapters + News Placeholder",
      status,
      target: "Workspace Home + future Web / Telegram / API surfaces",
    }),
  };
}

export function auditV17MarketDataProviderFoundation(): ModuleAudit {
  const moduleName = "V17 Market Data Provider Foundation";
  const marketDataAvailable = functionAvailable(buildMarketDataSnapshot);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [marketDataAvailable],
    warnings: true,
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available: marketDataAvailable,
        exportName: "buildMarketDataSnapshot",
        module: moduleName,
      }),
      {
        message:
          "V17.00 creates provider contracts and a manual placeholder provider only. Yahoo, Binance, broker, and external market APIs remain disabled.",
        module: moduleName,
        severity: "info",
      },
    ]),
    node: buildNode({
      id: "v17-market-data-provider-foundation",
      name: moduleName,
      source: "Manual placeholder provider + provider interface",
      status,
      target: "Morning Brief / Intelligence v2 / future provider integration",
    }),
  };
}

export function auditV18MorningBriefLiveDataReadiness(): ModuleAudit {
  const moduleName = "V18 Morning Brief Live Data Readiness";
  const adapterAvailable = functionAvailable(buildMorningMarketDataSummary);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [adapterAvailable],
    warnings: true,
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available: adapterAvailable,
        exportName: "buildMorningMarketDataSummary",
        module: moduleName,
      }),
      {
        message:
          "V18.00 allows Morning Brief to accept V17 market snapshot metadata while live external feeds remain disabled.",
        module: moduleName,
        severity: "info",
      },
    ]),
    node: buildNode({
      id: "v18-morning-brief-live-data-readiness",
      name: moduleName,
      source: "V16 Morning Brief + V17 Market Data Snapshot",
      status,
      target: "Home Morning Brief preview + future delivery surfaces",
    }),
  };
}

export function auditV19IntelligenceCenterV2Foundation(): ModuleAudit {
  const moduleName = "V19 Intelligence Center v2 Foundation";
  const intelligenceAvailable = functionAvailable(buildIntelligenceV2Report);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [intelligenceAvailable],
    warnings: true,
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available: intelligenceAvailable,
        exportName: "buildIntelligenceV2Report",
        module: moduleName,
      }),
      {
        message:
          "V19.00 is deterministic and read-only. It does not add external LLM calls, AI recommendations, broker actions, or trading instructions.",
        module: moduleName,
        severity: "info",
      },
    ]),
    node: buildNode({
      id: "v19-intelligence-center-v2-foundation",
      name: moduleName,
      source: "V15 Risk + V16 Morning Brief + V17 Market Data placeholder",
      status,
      target: "Intelligence Center",
    }),
  };
}

export function auditV20SaasFoundationReadiness(): ModuleAudit {
  const moduleName = "V20 SaaS Foundation Readiness";
  const saasAvailable = functionAvailable(getSaasFoundationReadiness);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [saasAvailable],
    warnings: true,
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available: saasAvailable,
        exportName: "getSaasFoundationReadiness",
        module: moduleName,
      }),
      {
        message:
          "V20.00 adds SaaS readiness metadata only. Billing provider, subscription enforcement, auth changes, and schema changes remain disabled.",
        module: moduleName,
        severity: "info",
      },
    ]),
    node: buildNode({
      id: "v20-saas-foundation-readiness",
      name: moduleName,
      source: "Plan / usage / subscription / team readiness metadata",
      status,
      target: "Settings diagnostics + future SaaS platform work",
    }),
  };
}

export function auditV21MarketDataLiveProviderReadiness(): ModuleAudit {
  const moduleName = "V21 Market Data Live Provider Readiness";
  const available = functionAvailable(buildLiveProviderReadinessReport);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [available],
    warnings: true,
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available,
        exportName: "buildLiveProviderReadinessReport",
        module: moduleName,
      }),
      {
        message:
          "V21.00 models Yahoo, Binance, Futu, and IBKR provider readiness as disabled placeholders only. No external fetch or live API is enabled.",
        module: moduleName,
        severity: "info",
      },
    ]),
    node: buildNode({
      id: "v21-market-data-live-provider-readiness",
      name: moduleName,
      source: "Provider config / health / quote model / cache policy readiness",
      status,
      target: "Future live market data integration",
    }),
  };
}

export function auditV22PortfolioLiveValuationReadiness(): ModuleAudit {
  const moduleName = "V22 Portfolio Live Valuation Readiness";
  const available = functionAvailable(buildPortfolioLiveValuationReadiness);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [available],
    warnings: true,
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available,
        exportName: "buildPortfolioLiveValuationReadiness",
        module: moduleName,
      }),
      {
        message:
          "V22.00 prepares valuation input and quote-status models only. It does not fetch quotes, run a new valuation engine, or price FCNs.",
        module: moduleName,
        severity: "info",
      },
    ]),
    node: buildNode({
      id: "v22-portfolio-live-valuation-readiness",
      name: moduleName,
      source: "Future quote snapshots + manual fallback status",
      status,
      target: "Portfolio / FCN / Risk / Morning Brief future valuation inputs",
    }),
  };
}

export function auditV23BrokerIntegrationFoundation(): ModuleAudit {
  const moduleName = "V23 Broker Integration Foundation";
  const available = functionAvailable(buildBrokerHealthDiagnostics);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [available],
    warnings: true,
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available,
        exportName: "buildBrokerHealthDiagnostics",
        module: moduleName,
      }),
      {
        message:
          "V23.00 adds broker interface and diagnostics only. Broker live APIs, position sync, trading, and order execution remain disabled.",
        module: moduleName,
        severity: "info",
      },
    ]),
    node: buildNode({
      id: "v23-broker-integration-foundation",
      name: moduleName,
      source: "Manual broker placeholder + disabled Futu / IBKR provider metadata",
      status,
      target: "Future broker sync readiness",
    }),
  };
}

export function auditV24RiskAutomationReadiness(): ModuleAudit {
  const moduleName = "V24 Risk Automation Readiness";
  const available = functionAvailable(buildRiskAutomationReadinessReport);
  const status = getStatus({
    hasFallback: true,
    requiredExports: [available],
    warnings: true,
  });

  return {
    issues: compactIssues([
      missingExportIssue({
        available,
        exportName: "buildRiskAutomationReadinessReport",
        module: moduleName,
      }),
      {
        message:
          "V24.00 models risk rules and triggers only. Scheduler, notification sender, trading actions, and recommendations remain disabled.",
        module: moduleName,
        severity: "info",
      },
    ]),
    node: buildNode({
      id: "v24-risk-automation-readiness",
      name: moduleName,
      source: "Risk rule / trigger / alert evaluation readiness",
      status,
      target: "Future risk automation and notification delivery",
    }),
  };
}

function overallStatus(nodes: WorkspaceDataLineageNode[]): WorkspaceIntegrationStatus {
  if (nodes.some((node) => node.status === "broken")) {
    return "broken";
  }

  if (nodes.some((node) => node.status === "warning")) {
    return "warning";
  }

  return "healthy";
}

export function buildWorkspaceIntegrationAudit(): WorkspaceIntegrationAudit {
  const audits = [
    auditTruthLayer(),
    auditPersistenceLayer(),
    auditMarketCacheLayer(),
    auditMarketLayer(),
    auditValuationLayer(),
    auditRiskLayer(),
    auditFcnRiskLayer(),
    auditFcnScheduleLayer(),
    auditWorkspaceGraphLayer(),
    auditWorkspaceNotificationLayer(),
    auditWorkspaceHealthLayer(),
    auditWorkspaceTimelineLayer(),
    auditWorkspaceApiGatewayLayer(),
    auditV7PortfolioPersistenceFoundation(),
    auditV7OwnershipFoundation(),
    auditV7SyncFoundation(),
    auditV7FcnPersistenceFoundation(),
    auditV7WatchlistPersistenceFoundation(),
    auditV7AlertPersistenceFoundation(),
    auditV8DatabaseActivationDiagnostics(),
    auditV9RealPersistenceProgram(),
    auditV10DatabaseReadPriority(),
    auditV10PlatformCutover(),
    auditV11DatabaseActivationFoundation(),
    auditV11DatabaseCutoverProgram(),
    auditV12DatabaseWriteActivation(),
    auditV13PortfolioDatabaseWriteActivation(),
    auditV14FcnDatabaseActivation(),
    auditV15LegacyRiskEngineMigration(),
    auditV16MorningBriefEngine(),
    auditV17MarketDataProviderFoundation(),
    auditV18MorningBriefLiveDataReadiness(),
    auditV19IntelligenceCenterV2Foundation(),
    auditV20SaasFoundationReadiness(),
    auditV21MarketDataLiveProviderReadiness(),
    auditV22PortfolioLiveValuationReadiness(),
    auditV23BrokerIntegrationFoundation(),
    auditV24RiskAutomationReadiness(),
  ];
  const lineageNodes = audits.map((audit) => audit.node);
  const issues = audits.flatMap((audit) => audit.issues);

  return {
    brokenModules: lineageNodes.filter((node) => node.status === "broken").length,
    generatedAt: new Date().toISOString(),
    healthyModules: lineageNodes.filter((node) => node.status === "healthy").length,
    issues,
    lineageNodes,
    moduleCount: lineageNodes.length,
    overallStatus: overallStatus(lineageNodes),
    warningModules: lineageNodes.filter((node) => node.status === "warning").length,
  };
}
