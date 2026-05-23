"use client";

import { useEffect, useMemo, useState } from "react";

type UseLiveResourceOptions<T> = {
  fetcher: (signal: AbortSignal) => Promise<T>;
  refreshIntervalMs: number;
  initialData?: T;
  getUpdatedAt?: (data: T) => string | undefined;
  pauseWhenHidden?: boolean;
};

export function useLiveResource<T>({
  fetcher,
  refreshIntervalMs,
  initialData,
  getUpdatedAt,
  pauseWhenHidden = true,
}: UseLiveResourceOptions<T>) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | undefined>(() =>
    initialData ? getUpdatedAt?.(initialData) : undefined,
  );

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let isInFlight = false;
    let hasLoadedData = Boolean(initialData);
    let activeController: AbortController | undefined;

    function clearRefreshTimer() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }

    function scheduleNextRefresh() {
      clearRefreshTimer();
      timeoutId = setTimeout(() => {
        if (pauseWhenHidden && document.hidden) {
          scheduleNextRefresh();
          return;
        }

        void loadResource();
      }, refreshIntervalMs);
    }

    async function loadResource() {
      if (isInFlight) {
        return;
      }

      isInFlight = true;
      activeController = new AbortController();

      if (isMounted) {
        setIsLoading(!hasLoadedData);
        setIsRefreshing(hasLoadedData);
      }

      try {
        const nextData = await fetcher(activeController.signal);

        if (!isMounted) {
          return;
        }

        hasLoadedData = true;
        setData(nextData);
        setLastUpdatedAt(getUpdatedAt?.(nextData) ?? new Date().toISOString());
        setErrorMessage(null);
      } catch (error) {
        if (!isMounted || activeController.signal.aborted) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : "更新失敗，稍後自動重試");
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsRefreshing(false);
          scheduleNextRefresh();
        }
        isInFlight = false;
      }
    }

    function handleVisibilityChange() {
      if (!pauseWhenHidden) {
        return;
      }

      if (document.hidden) {
        clearRefreshTimer();
        return;
      }

      void loadResource();
    }

    void loadResource();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      activeController?.abort();
      clearRefreshTimer();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetcher, getUpdatedAt, initialData, pauseWhenHidden, refreshIntervalMs]);

  return useMemo(
    () => ({
      data,
      errorMessage,
      isLoading,
      isRefreshing,
      lastUpdatedAt,
    }),
    [data, errorMessage, isLoading, isRefreshing, lastUpdatedAt],
  );
}
