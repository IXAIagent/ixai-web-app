import { getSupabaseClientConfig } from "@/src/lib/supabase/client";
import type { WatchlistItem } from "@/src/lib/watchlist";
import type { IXAISession, WatchlistSyncState } from "@/src/types/identity";

const SYNC_KEY = "ixai.watchlist.sync.v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function syncKey(userId?: string) {
  return userId ? `${SYNC_KEY}:${userId}` : SYNC_KEY;
}

export function getWatchlistSyncState(session: IXAISession): WatchlistSyncState {
  if (session.mode !== "authenticated" || !session.user) {
    return {
      mode: "local",
      label: "Guest local",
      message: "登入後可同步到你的 IXAI account，支援未來跨裝置使用。",
    };
  }

  if (!getSupabaseClientConfig()) {
    return {
      mode: "unavailable",
      label: "Account ready",
      message: "已建立 IXAI account；Supabase table 尚未接上前，仍以本機保存。",
    };
  }

  const lastSyncedAt = canUseStorage()
    ? window.localStorage.getItem(syncKey(session.user.id)) ?? undefined
    : undefined;

  return {
    mode: "account",
    label: "Saved to your IXAI account",
    lastSyncedAt,
    message: "自選觀察已準備同步至你的 IXAI account。",
  };
}

export async function syncWatchlistToAccount(
  session: IXAISession,
  items: WatchlistItem[],
): Promise<WatchlistSyncState> {
  const config = getSupabaseClientConfig();

  if (session.mode !== "authenticated" || !session.user || !session.accessToken) {
    return getWatchlistSyncState(session);
  }

  if (!config) {
    return getWatchlistSyncState(session);
  }

  try {
    await fetch(`${config.url}/rest/v1/ixai_watchlists?user_id=eq.${session.user.id}`, {
      method: "DELETE",
      headers: {
        apikey: config.anonKey,
        authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (items.length > 0) {
      await fetch(`${config.url}/rest/v1/ixai_watchlists`, {
        method: "POST",
        headers: {
          apikey: config.anonKey,
          authorization: `Bearer ${session.accessToken}`,
          "content-type": "application/json",
          prefer: "return=minimal",
        },
        body: JSON.stringify(
          items.map((item) => ({
            user_id: session.user?.id,
            symbol: item.symbol,
            name: item.name,
            asset_type: item.assetType,
            market: item.market,
            note: item.note ?? null,
            added_at: item.addedAt,
          })),
        ),
      });
    }

    const lastSyncedAt = new Date().toISOString();
    if (canUseStorage()) {
      window.localStorage.setItem(syncKey(session.user.id), lastSyncedAt);
    }

    return {
      mode: "account",
      label: "Saved to your IXAI account",
      lastSyncedAt,
      message: "自選觀察已同步到 IXAI account。",
    };
  } catch {
    return {
      mode: "unavailable",
      label: "Sync pending",
      message: "同步暫時無法完成，本機資料已保留。",
    };
  }
}
