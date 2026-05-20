import {
  saveUserWatchlist,
} from "@/src/lib/personalization/persistence";
import { getSupabaseClientConfig } from "@/src/lib/supabase/client";
import type { WatchlistItem } from "@/src/lib/watchlist";
import type { IXAISession, WatchlistSyncState } from "@/src/types/identity";

export function getWatchlistSyncState(session: IXAISession): WatchlistSyncState {
  if (session.mode !== "authenticated" || !session.user) {
    return {
      mode: "local",
      label: "Local only",
      message: "Guest watchlist is stored on this device. Login enables account sync.",
    };
  }

  if (!getSupabaseClientConfig() || !session.accessToken) {
    return {
      mode: "pending",
      label: "Sync pending",
      message: "IXAI account is active, but Supabase persistence is not available yet.",
    };
  }

  return {
    mode: "synced",
    label: "Saved to your IXAI account",
    message: "Watchlist can sync to your IXAI account.",
  };
}

export async function syncWatchlistToAccount(
  session: IXAISession,
  items: WatchlistItem[],
): Promise<WatchlistSyncState> {
  const status = await saveUserWatchlist(session, items);

  return {
    mode: status.mode === "synced" ? "synced" : status.mode === "pending" ? "pending" : "local",
    label: status.label,
    message: status.message,
    lastSyncedAt: status.lastSyncedAt,
  };
}
