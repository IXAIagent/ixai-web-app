import type { WorkspaceDatabaseWriteResult } from "@/src/lib/workspace/platform/platform-types";

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

export async function previewPortfolioWriteCutover(): Promise<WorkspaceDatabaseWriteResult> {
  return skippedResult(
    "v10-portfolio-write-cutover-disabled",
    "Portfolio database write cutover is diagnostics-only and does not call write services during render.",
  );
}

export async function previewFcnWriteCutover(): Promise<WorkspaceDatabaseWriteResult> {
  return skippedResult(
    "v10-fcn-write-cutover-disabled",
    "FCN database write cutover is diagnostics-only and does not call write services during render.",
  );
}

export async function previewWatchlistWriteCutover(): Promise<WorkspaceDatabaseWriteResult> {
  return skippedResult(
    "v10-watchlist-write-cutover-disabled",
    "Watchlist database write cutover preview is read-only; V12 explicit write actions own guarded database writes.",
  );
}

export async function previewAlertHistoryWriteCutover(): Promise<WorkspaceDatabaseWriteResult> {
  return skippedResult(
    "v10-alert-history-write-cutover-disabled",
    "Alert History database write preview is read-only; V12 explicit write actions own guarded database writes.",
  );
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
