"use client";

import type { WorkspaceAlertCard } from "@/src/lib/alerts";
import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";
import type { V12DatabaseWriteResult } from "@/src/lib/workspace/database-write-activation/database-write-activation-types";
import { getV12WriteGuard } from "@/src/lib/workspace/database-write-activation/write-guard";
import { getV12WorkspaceBootstrapStatus } from "@/src/lib/workspace/database-write-activation/workspace-bootstrap";

type AlertHistoryRow = {
  id: string;
};

function buildDedupeKey(alert: WorkspaceAlertCard) {
  return `${alert.sourceEngine}:${alert.id}`;
}

function fallbackResult(input: {
  blockingReason?: string;
  databaseAttempted?: boolean;
  errorMessage?: string;
  guardEnabled: boolean;
  operation?: "insert" | "update" | "upsert";
  workspaceId?: string;
}): V12DatabaseWriteResult {
  return {
    blockingReason: input.blockingReason,
    databaseAttempted: input.databaseAttempted ?? false,
    errorMessage: input.errorMessage,
    fallbackUsed: true,
    guardEnabled: input.guardEnabled,
    module: "alert_history",
    operation: input.operation ?? "upsert",
    success: false,
    target: "fallback",
    workspaceId: input.workspaceId,
    writtenAt: new Date().toISOString(),
  };
}

export async function saveAlertHistoryWithV12DatabaseWrite(
  alert: WorkspaceAlertCard,
): Promise<V12DatabaseWriteResult> {
  const guard = getV12WriteGuard("alert_history");

  if (!guard.enabled) {
    return fallbackResult({
      blockingReason: guard.reason,
      guardEnabled: false,
    });
  }

  const bootstrap = await getV12WorkspaceBootstrapStatus({ allowCreate: true, guard });
  const supabase = createSupabaseBrowserClient();

  if (!supabase || !bootstrap.workspaceId) {
    return fallbackResult({
      blockingReason: bootstrap.blockingReason ?? "Workspace bootstrap did not provide a workspace id.",
      guardEnabled: true,
      workspaceId: bootstrap.workspaceId,
    });
  }

  const { data: userData } = await supabase.auth.getUser();
  const ownerId = userData.user?.id;

  if (!ownerId) {
    return fallbackResult({
      blockingReason: "Authenticated user is required for user-scoped alert history writes.",
      guardEnabled: true,
      workspaceId: bootstrap.workspaceId,
    });
  }

  try {
    const dedupeKey = buildDedupeKey(alert);
    const { data: existing } = await supabase
      .from("alert_history")
      .select("id")
      .eq("workspace_id", bootstrap.workspaceId)
      .eq("dedupe_key", dedupeKey)
      .limit(1)
      .maybeSingle<AlertHistoryRow>();

    const payload = {
      category: alert.category,
      created_at: alert.createdAt,
      dedupe_key: dedupeKey,
      message: alert.message,
      metadata: { alert_id: alert.id, source: "v12_workspace_database_write_activation" },
      owner_id: ownerId,
      severity: alert.severity,
      source_engine: alert.sourceEngine,
      source_status: "persisted",
      title: alert.title,
      updated_at: new Date().toISOString(),
      user_id: ownerId,
      workspace_id: bootstrap.workspaceId,
    };

    const result = existing?.id
      ? await supabase.from("alert_history").update(payload).eq("id", existing.id)
      : await supabase.from("alert_history").insert(payload);

    if (result.error) {
      return fallbackResult({
        databaseAttempted: true,
        errorMessage: result.error.message,
        guardEnabled: true,
        operation: existing?.id ? "update" : "insert",
        workspaceId: bootstrap.workspaceId,
      });
    }

    return {
      databaseAttempted: true,
      fallbackUsed: false,
      guardEnabled: true,
      module: "alert_history",
      operation: existing?.id ? "update" : "insert",
      success: true,
      target: "database",
      workspaceId: bootstrap.workspaceId,
      writtenAt: new Date().toISOString(),
    };
  } catch (error) {
    return fallbackResult({
      databaseAttempted: true,
      errorMessage: error instanceof Error ? error.message : "Alert history database write failed safely.",
      guardEnabled: true,
      workspaceId: bootstrap.workspaceId,
    });
  }
}
