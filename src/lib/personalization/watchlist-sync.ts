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
      label: "本機保存",
      message: "目前此裝置保存；登入後將逐步支援跨裝置同步。",
    };
  }

  if (!getSupabaseClientConfig()) {
    return {
      mode: "pending",
      label: "等待同步",
      message: "IXAI Account 已啟用；跨裝置同步與 Pro handoff 將分階段開放。",
    };
  }

  return {
    mode: "synced",
    label: "已連接 IXAI Account",
    message: "自選觀察已準備連接帳戶；跨裝置同步功能將逐步開放。",
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
