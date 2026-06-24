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
      source: "Future alert_events table",
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
