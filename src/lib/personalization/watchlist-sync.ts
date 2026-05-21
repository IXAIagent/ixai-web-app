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
      message: "Guest 自選觀察會保存在此裝置；登入同步開放後可跨裝置使用。",
    };
  }

  if (!getSupabaseClientConfig() || !session.accessToken) {
    return {
      mode: "pending",
      label: "等待同步",
      message: "IXAI 帳戶已啟用，但跨裝置同步尚未完成設定。",
    };
  }

  return {
    mode: "synced",
    label: "已保存到 IXAI 帳戶",
    message: "自選觀察可同步到你的 IXAI 帳戶。",
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
