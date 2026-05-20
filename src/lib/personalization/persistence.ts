import { readPersonalMemory, writePersonalMemory } from "@/src/lib/personalization/memory";
import { getSupabaseClientConfig } from "@/src/lib/supabase/client";
import {
  getWatchlist,
  type WatchlistItem,
} from "@/src/lib/watchlist";
import type {
  IXAISession,
  IntelligenceInterest,
  PersonalMemory,
  PersistenceStatus,
} from "@/src/types/identity";

const PREFERENCES_KEY = "ixai.user.preferences.v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function preferenceKey(userId?: string) {
  return userId ? `${PREFERENCES_KEY}:${userId}` : PREFERENCES_KEY;
}

function hasSupabaseSession(session: IXAISession) {
  return Boolean(
    getSupabaseClientConfig() &&
      session.mode === "authenticated" &&
      session.user?.id &&
      session.accessToken,
  );
}

function authHeaders(session: IXAISession) {
  const config = getSupabaseClientConfig();

  if (!config || !session.accessToken) {
    return null;
  }

  return {
    apikey: config.anonKey,
    authorization: `Bearer ${session.accessToken}`,
  };
}

function pendingStatus(message = "Supabase persistence is not available. Local fallback is active."): PersistenceStatus {
  return {
    mode: "pending",
    label: "Sync pending",
    message,
  };
}

export function getLocalPreferences(userId?: string): IntelligenceInterest[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(preferenceKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalPreferences(
  preferences: IntelligenceInterest[],
  userId?: string,
) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(preferenceKey(userId), JSON.stringify(preferences));
}

export async function loadUserWatchlist(session: IXAISession): Promise<{
  items: WatchlistItem[];
  status: PersistenceStatus;
}> {
  const config = getSupabaseClientConfig();
  const headers = authHeaders(session);

  if (!config || !headers || !session.user?.id) {
    return {
      items: getWatchlist(),
      status: session.mode === "authenticated"
        ? pendingStatus("Account active, but Supabase watchlist persistence is not configured.")
        : {
            mode: "local",
            label: "Local only",
            message: "Guest watchlist is stored on this device.",
          },
    };
  }

  try {
    const response = await fetch(
      `${config.url}/rest/v1/ixai_watchlists?user_id=eq.${session.user.id}&order=added_at.desc`,
      { headers },
    );

    if (!response.ok) {
      throw new Error("Unable to load Supabase watchlist.");
    }

    const rows = await response.json() as Array<{
      symbol: string;
      name: string;
      asset_type: WatchlistItem["assetType"];
      market: WatchlistItem["market"];
      note: string | null;
      added_at: string;
      updated_at?: string;
    }>;

    return {
      items: rows.map((row) => ({
        symbol: row.symbol,
        name: row.name,
        assetType: row.asset_type,
        market: row.market,
        note: row.note ?? undefined,
        addedAt: row.added_at,
      })),
      status: {
        mode: "synced",
        label: "Synced",
        message: "Watchlist loaded from your IXAI account.",
        lastSyncedAt: new Date().toISOString(),
      },
    };
  } catch {
    return {
      items: getWatchlist(),
      status: pendingStatus("Could not load Supabase watchlist. Local fallback is active."),
    };
  }
}

export async function saveUserWatchlist(
  session: IXAISession,
  items: WatchlistItem[],
): Promise<PersistenceStatus> {
  const config = getSupabaseClientConfig();
  const headers = authHeaders(session);

  if (!config || !headers || !session.user?.id) {
    return session.mode === "authenticated"
      ? pendingStatus("Account active, but Supabase watchlist persistence is not configured.")
      : {
          mode: "local",
          label: "Local only",
          message: "Guest watchlist is stored on this device.",
        };
  }

  try {
    await fetch(`${config.url}/rest/v1/ixai_watchlists?user_id=eq.${session.user.id}`, {
      method: "DELETE",
      headers,
    });

    if (items.length > 0) {
      const response = await fetch(`${config.url}/rest/v1/ixai_watchlists`, {
        method: "POST",
        headers: {
          ...headers,
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
            updated_at: new Date().toISOString(),
          })),
        ),
      });

      if (!response.ok) {
        throw new Error("Unable to save Supabase watchlist.");
      }
    }

    return {
      mode: "synced",
      label: "Synced",
      message: "Watchlist saved to your IXAI account.",
      lastSyncedAt: new Date().toISOString(),
    };
  } catch {
    return pendingStatus("Could not save to Supabase. Local watchlist remains intact.");
  }
}

export async function loadUserPreferences(session: IXAISession): Promise<{
  preferences: IntelligenceInterest[];
  status: PersistenceStatus;
}> {
  const config = getSupabaseClientConfig();
  const headers = authHeaders(session);

  if (!config || !headers || !session.user?.id) {
    return {
      preferences: getLocalPreferences(session.user?.id),
      status: session.mode === "authenticated"
        ? pendingStatus("Account active, but Supabase preferences are not configured.")
        : {
            mode: "local",
            label: "Local only",
            message: "Guest preferences are stored on this device.",
          },
    };
  }

  try {
    const response = await fetch(
      `${config.url}/rest/v1/ixai_user_preferences?user_id=eq.${session.user.id}&select=preferred_categories&limit=1`,
      { headers },
    );

    if (!response.ok) {
      throw new Error("Unable to load preferences.");
    }

    const rows = await response.json() as Array<{ preferred_categories?: IntelligenceInterest[] }>;
    const preferences = rows[0]?.preferred_categories ?? getLocalPreferences(session.user.id);
    saveLocalPreferences(preferences, session.user.id);

    return {
      preferences,
      status: {
        mode: "synced",
        label: "Synced",
        message: "Preferences loaded from your IXAI account.",
        lastSyncedAt: new Date().toISOString(),
      },
    };
  } catch {
    return {
      preferences: getLocalPreferences(session.user?.id),
      status: pendingStatus("Could not load Supabase preferences. Local fallback is active."),
    };
  }
}

export async function saveUserPreferences(
  session: IXAISession,
  preferences: IntelligenceInterest[],
): Promise<PersistenceStatus> {
  saveLocalPreferences(preferences, session.user?.id);
  const config = getSupabaseClientConfig();
  const headers = authHeaders(session);

  if (!config || !headers || !session.user?.id) {
    return session.mode === "authenticated"
      ? pendingStatus("Account active, but Supabase preferences are not configured.")
      : {
          mode: "local",
          label: "Local only",
          message: "Guest preferences are stored on this device.",
        };
  }

  try {
    const response = await fetch(`${config.url}/rest/v1/ixai_user_preferences?on_conflict=user_id`, {
      method: "POST",
      headers: {
        ...headers,
        "content-type": "application/json",
        prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        user_id: session.user.id,
        preferred_categories: preferences,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error("Unable to save preferences.");
    }

    return {
      mode: "synced",
      label: "Synced",
      message: "Preferences saved to your IXAI account.",
      lastSyncedAt: new Date().toISOString(),
    };
  } catch {
    return pendingStatus("Could not save preferences to Supabase. Local fallback is active.");
  }
}

export async function loadProfileMemory(session: IXAISession): Promise<{
  memory: PersonalMemory;
  status: PersistenceStatus;
}> {
  const config = getSupabaseClientConfig();
  const headers = authHeaders(session);

  if (!hasSupabaseSession(session) || !config || !headers || !session.user?.id) {
    return {
      memory: readPersonalMemory(session.user?.id),
      status: session.mode === "authenticated"
        ? pendingStatus("Account active, but Supabase profile memory is not configured.")
        : {
            mode: "local",
            label: "Local only",
            message: "Guest memory is stored on this device.",
          },
    };
  }

  try {
    const response = await fetch(
      `${config.url}/rest/v1/ixai_profile_memory?user_id=eq.${session.user.id}&select=watched_symbols,recently_viewed_sections,last_visit_at,onboarding_completed&limit=1`,
      { headers },
    );

    if (!response.ok) {
      throw new Error("Unable to load profile memory.");
    }

    const rows = await response.json() as Array<{
      watched_symbols?: string[];
      recently_viewed_sections?: string[];
      last_visit_at?: string;
      onboarding_completed?: boolean;
    }>;
    const localMemory = readPersonalMemory(session.user.id);
    const row = rows[0];
    const memory = row
      ? {
          ...localMemory,
          watchedSymbols: row.watched_symbols ?? [],
          recentlyViewedSections: row.recently_viewed_sections ?? [],
          lastVisitAt: row.last_visit_at ?? localMemory.lastVisitAt,
          onboardingCompleted: Boolean(row.onboarding_completed),
        }
      : localMemory;

    writePersonalMemory(memory, session.user.id);

    return {
      memory,
      status: {
        mode: "synced",
        label: "Synced",
        message: "Profile memory loaded from your IXAI account.",
        lastSyncedAt: new Date().toISOString(),
      },
    };
  } catch {
    return {
      memory: readPersonalMemory(session.user?.id),
      status: pendingStatus("Could not load Supabase memory. Local fallback is active."),
    };
  }
}

export async function saveProfileMemory(
  session: IXAISession,
  memory: PersonalMemory,
): Promise<PersistenceStatus> {
  writePersonalMemory(memory, session.user?.id);
  const config = getSupabaseClientConfig();
  const headers = authHeaders(session);

  if (!config || !headers || !session.user?.id) {
    return session.mode === "authenticated"
      ? pendingStatus("Account active, but Supabase profile memory is not configured.")
      : {
          mode: "local",
          label: "Local only",
          message: "Guest memory is stored on this device.",
        };
  }

  try {
    const response = await fetch(`${config.url}/rest/v1/ixai_profile_memory?on_conflict=user_id`, {
      method: "POST",
      headers: {
        ...headers,
        "content-type": "application/json",
        prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        user_id: session.user.id,
        watched_symbols: memory.watchedSymbols,
        recently_viewed_sections: memory.recentlyViewedSections,
        last_visit_at: memory.lastVisitAt,
        onboarding_completed: memory.onboardingCompleted,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error("Unable to save profile memory.");
    }

    return {
      mode: "synced",
      label: "Synced",
      message: "Profile memory saved to your IXAI account.",
      lastSyncedAt: new Date().toISOString(),
    };
  } catch {
    return pendingStatus("Could not save memory to Supabase. Local fallback is active.");
  }
}
