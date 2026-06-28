const DEFAULT_TIMEOUT_MS = 3000;
const DEFAULT_AUTO_INTERVAL_MS = 10_000;
const DEFAULT_THRESHOLD = 3;

type BudgetRecord = {
  autoRanAt: number;
  firstTriggeredAt: number;
  triggerCount: number;
};

export type RuntimeBudgetOptions = {
  auto?: boolean;
  intervalMs?: number;
  threshold?: number;
  timeoutMs?: number;
};

const budgetRecords = new Map<string, BudgetRecord>();

function now() {
  return Date.now();
}

function isBrowserHidden() {
  return typeof document !== "undefined" && document.visibilityState === "hidden";
}

function shouldSkipByBudget(key: string, options: RuntimeBudgetOptions) {
  const current = now();
  const record = budgetRecords.get(key) ?? {
    autoRanAt: 0,
    firstTriggeredAt: current,
    triggerCount: 0,
  };
  const windowMs = options.intervalMs ?? DEFAULT_AUTO_INTERVAL_MS;
  const threshold = options.threshold ?? DEFAULT_THRESHOLD;

  if (current - record.firstTriggeredAt > windowMs) {
    record.firstTriggeredAt = current;
    record.triggerCount = 0;
  }

  record.triggerCount += 1;

  if (options.auto && current - record.autoRanAt < windowMs) {
    budgetRecords.set(key, record);
    return true;
  }

  if (record.triggerCount > threshold) {
    budgetRecords.set(key, record);
    return true;
  }

  if (options.auto) {
    record.autoRanAt = current;
  }

  budgetRecords.set(key, record);
  return false;
}

export async function runWorkspaceRuntimeBudget<T>(
  key: string,
  task: () => Promise<T> | T,
  fallback: T,
  options: RuntimeBudgetOptions = {},
): Promise<T> {
  if (options.auto && isBrowserHidden()) {
    return fallback;
  }

  if (shouldSkipByBudget(key, options)) {
    return fallback;
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  try {
    return await Promise.race([
      Promise.resolve().then(task),
      new Promise<T>((resolve) => {
        setTimeout(() => resolve(fallback), timeoutMs);
      }),
    ]);
  } catch {
    return fallback;
  }
}

export function scheduleWorkspaceIdleTask(
  task: () => void,
  timeoutMs = DEFAULT_TIMEOUT_MS,
) {
  if (typeof window === "undefined") {
    return () => {};
  }

  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(task, { timeout: timeoutMs });
    return () => window.cancelIdleCallback(id);
  }

  const id = globalThis.setTimeout(task, Math.min(timeoutMs, 250));
  return () => globalThis.clearTimeout(id);
}

export function resetWorkspaceRuntimeBudget() {
  budgetRecords.clear();
}
