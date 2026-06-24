import { saveAlertEventToDatabase } from "@/src/lib/alerts/persistence";
import { getWorkspaceAlertSummary } from "@/src/lib/alerts";
import { saveFcnPositionToDatabase } from "@/src/lib/persistence/fcn";
import { saveStockPositionToDatabase as savePortfolioStockPositionToDatabase } from "@/src/lib/persistence/portfolio";
import { saveWatchlistItemToDatabase } from "@/src/lib/watchlist/persistence";
import type { WorkspaceDatabaseWriteResult } from "@/src/lib/workspace/platform/platform-types";

const WRITE_CUTOVER_ENABLED = false;

function skippedResult(operationId: string, message: string): WorkspaceDatabaseWriteResult {
  return {
    errorMessage: message,
    fallbackUsed: true,
    operationId,
    success: false,
    target: "skipped",
    writtenAt: new Date().toISOString(),
  };
}

function normalizeWriteResult(input: {
  fallbackMessage: string;
  ok: boolean;
  operationId: string;
  sourceStatus?: string;
  warning?: string;
}): WorkspaceDatabaseWriteResult {
  return {
    errorMessage: input.ok ? undefined : input.warning ?? input.fallbackMessage,
    fallbackUsed: !input.ok,
    operationId: input.operationId,
    success: input.ok,
    target: input.ok ? "database" : "local",
    writtenAt: new Date().toISOString(),
  };
}

export async function previewPortfolioWriteCutover(): Promise<WorkspaceDatabaseWriteResult> {
  if (!WRITE_CUTOVER_ENABLED) {
    return skippedResult(
      "v10-portfolio-write-cutover-disabled",
      "Portfolio database write cutover is feature-guarded and disabled by default.",
    );
  }

  const result = await savePortfolioStockPositionToDatabase({
    assetClass: "stock",
  });

  return normalizeWriteResult({
    fallbackMessage: "Portfolio local fallback remains active.",
    ok: result.ok,
    operationId: "v10-portfolio-write-cutover-preview",
    sourceStatus: result.sourceStatus,
    warning: result.warning,
  });
}

export async function previewFcnWriteCutover(): Promise<WorkspaceDatabaseWriteResult> {
  if (!WRITE_CUTOVER_ENABLED) {
    return skippedResult(
      "v10-fcn-write-cutover-disabled",
      "FCN database write cutover is feature-guarded and disabled by default.",
    );
  }

  const result = await saveFcnPositionToDatabase();

  return normalizeWriteResult({
    fallbackMessage: "FCN Draft Store fallback remains active.",
    ok: result.ok,
    operationId: "v10-fcn-write-cutover-preview",
    sourceStatus: result.sourceStatus,
    warning: result.warning,
  });
}

export async function previewWatchlistWriteCutover(): Promise<WorkspaceDatabaseWriteResult> {
  if (!WRITE_CUTOVER_ENABLED) {
    return skippedResult(
      "v10-watchlist-write-cutover-disabled",
      "Watchlist database write cutover is feature-guarded and disabled by default.",
    );
  }

  const result = await saveWatchlistItemToDatabase();

  return normalizeWriteResult({
    fallbackMessage: "Watchlist local fallback remains active.",
    ok: result.ok,
    operationId: "v10-watchlist-write-cutover-preview",
    sourceStatus: result.sourceStatus,
    warning: result.warning,
  });
}

export async function previewAlertHistoryWriteCutover(): Promise<WorkspaceDatabaseWriteResult> {
  if (!WRITE_CUTOVER_ENABLED) {
    return skippedResult(
      "v10-alert-history-write-cutover-disabled",
      "Alert history database write cutover is feature-guarded and disabled by default.",
    );
  }

  const alert = (await getWorkspaceAlertSummary()).alerts[0];

  if (!alert) {
    return skippedResult(
      "v10-alert-history-no-alert",
      "No deterministic alert card is available for a guarded alert history write preview.",
    );
  }

  const result = await saveAlertEventToDatabase(alert);

  return normalizeWriteResult({
    fallbackMessage: "Deterministic Alert Engine fallback remains active.",
    ok: result.ok,
    operationId: result.dedupeKey,
    sourceStatus: result.sourceStatus,
    warning: result.warning,
  });
}

export async function getWorkspaceWriteCutoverPreview() {
  const [portfolio, fcn, watchlist, alerts] = await Promise.all([
    previewPortfolioWriteCutover(),
    previewFcnWriteCutover(),
    previewWatchlistWriteCutover(),
    previewAlertHistoryWriteCutover(),
  ]);

  return {
    alerts,
    fcn,
    portfolio,
    watchlist,
  };
}
