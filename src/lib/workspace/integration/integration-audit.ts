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
