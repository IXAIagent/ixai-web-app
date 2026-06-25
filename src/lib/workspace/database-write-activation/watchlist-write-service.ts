"use client";

import { normalizeWatchlistSymbol } from "@/src/lib/watchlist";
import type { WorkspaceWatchlistAssetType } from "@/src/lib/watchlist/watchlist-types";
import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";
import type { V12DatabaseWriteResult } from "@/src/lib/workspace/database-write-activation/database-write-activation-types";
import { getV12WriteGuard } from "@/src/lib/workspace/database-write-activation/write-guard";
import { getV12WorkspaceBootstrapStatus } from "@/src/lib/workspace/database-write-activation/workspace-bootstrap";

export interface V12WatchlistItemWriteInput {
  alertAbove?: number;
  alertBelow?: number;
  assetType?: WorkspaceWatchlistAssetType;
  name?: string;
  note?: string;
  symbol: string;
  targetPrice?: number;
}

type WatchlistRow = {
  id: string;
};

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
    module: "watchlist",
    operation: input.operation ?? "upsert",
    success: false,
    target: "fallback",
    workspaceId: input.workspaceId,
    writtenAt: new Date().toISOString(),
  };
}

async function ensureDefaultWatchlist(workspaceId: string, ownerId: string): Promise<string | null> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) {
    return null;
  }

  const { data: existing } = await supabase
    .from("watchlists")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("owner_id", ownerId)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<WatchlistRow>();

  if (existing?.id) {
    return existing.id;
  }

  const { data: created, error } = await supabase
    .from("watchlists")
    .insert({
      metadata: { created_by: "v12_workspace_database_write_activation" },
      name: "Default Watchlist",
      owner_id: ownerId,
      status: "active",
      user_id: ownerId,
      workspace_id: workspaceId,
    })
    .select("id")
    .single<WatchlistRow>();

  return error ? null : created?.id ?? null;
}

export async function saveWatchlistItemWithV12DatabaseWrite(
  item: V12WatchlistItemWriteInput,
): Promise<V12DatabaseWriteResult> {
  const guard = getV12WriteGuard("watchlist");
  const symbol = normalizeWatchlistSymbol(item.symbol);

  if (!guard.enabled) {
    return fallbackResult({
      blockingReason: guard.reason,
      guardEnabled: false,
    });
  }

  if (!symbol) {
    return fallbackResult({
      blockingReason: "Watchlist symbol is required before a database write can be attempted.",
      guardEnabled: true,
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
      blockingReason: "Authenticated user is required for user-scoped watchlist writes.",
      guardEnabled: true,
      workspaceId: bootstrap.workspaceId,
    });
  }

  try {
    const watchlistId = await ensureDefaultWatchlist(bootstrap.workspaceId, ownerId);
    if (!watchlistId) {
      return fallbackResult({
        blockingReason: "Default watchlist could not be prepared; local fallback remains active.",
        databaseAttempted: true,
        guardEnabled: true,
        workspaceId: bootstrap.workspaceId,
      });
    }

    const { data: existing } = await supabase
      .from("watchlist_items")
      .select("id")
      .eq("workspace_id", bootstrap.workspaceId)
      .eq("watchlist_id", watchlistId)
      .eq("symbol", symbol)
      .limit(1)
      .maybeSingle<WatchlistRow>();

    const payload = {
      alert_above: item.alertAbove ?? null,
      alert_below: item.alertBelow ?? null,
      asset_type: item.assetType ?? "unknown",
      metadata: { source: "v12_workspace_database_write_activation" },
      name: item.name?.trim() || symbol,
      note: item.note?.trim() || null,
      owner_id: ownerId,
      source_status: "persisted",
      symbol,
      target_price: item.targetPrice ?? null,
      updated_at: new Date().toISOString(),
      user_id: ownerId,
      watchlist_id: watchlistId,
      workspace_id: bootstrap.workspaceId,
    };

    const result = existing?.id
      ? await supabase.from("watchlist_items").update(payload).eq("id", existing.id)
      : await supabase.from("watchlist_items").insert(payload);

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
      module: "watchlist",
      operation: existing?.id ? "update" : "insert",
      success: true,
      target: "database",
      workspaceId: bootstrap.workspaceId,
      writtenAt: new Date().toISOString(),
    };
  } catch (error) {
    return fallbackResult({
      databaseAttempted: true,
      errorMessage: error instanceof Error ? error.message : "Watchlist database write failed safely.",
      guardEnabled: true,
      workspaceId: bootstrap.workspaceId,
    });
  }
}
