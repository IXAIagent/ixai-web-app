import type {
  EditorialProviderCacheDiagnostics,
  EditorialProviderCacheEntry,
} from "@/src/lib/editorial/providers/provider-types";

const memoryCache = new Map<string, EditorialProviderCacheEntry<unknown>>();

function expiresAt(ttlMs: number) {
  return new Date(Date.now() + ttlMs).toISOString();
}

export function setProviderCache<T>(key: string, value: T, ttlMs: number) {
  const entry: EditorialProviderCacheEntry<T> = {
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt(ttlMs),
    key,
    state: "fresh",
    value,
  };

  memoryCache.set(key, entry as EditorialProviderCacheEntry<unknown>);
  return entry;
}

export function getProviderCache<T>(key: string): EditorialProviderCacheEntry<T> | null {
  const entry = memoryCache.get(key) as EditorialProviderCacheEntry<T> | undefined;

  if (!entry) {
    return null;
  }

  if (new Date(entry.expiresAt).getTime() < Date.now()) {
    return {
      ...entry,
      state: "stale",
    };
  }

  return {
    ...entry,
    state: "fresh",
  };
}

export function buildProviderCacheDiagnostics(): EditorialProviderCacheDiagnostics {
  const entries = [...memoryCache.values()];
  const now = Date.now();
  const freshEntries = entries.filter((entry) => new Date(entry.expiresAt).getTime() >= now).length;

  return {
    entries: entries.length,
    freshEntries,
    staleEntries: entries.length - freshEntries,
  };
}
