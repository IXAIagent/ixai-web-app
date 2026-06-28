const WINDOW_MS = 5000;
const DEFAULT_THRESHOLD = 20;
const STORAGE_FLAG = "ixai.runtime.diagnostics";

type RuntimeLoopBucket = {
  count: number;
  firstSeenAt: number;
  lastWarnedAt: number;
};

const buckets = new Map<string, RuntimeLoopBucket>();

function canUseWindow() {
  return typeof window !== "undefined";
}

function isDiagnosticsEnabled() {
  if (process.env.NEXT_PUBLIC_IXAI_RUNTIME_DIAGNOSTICS === "1") {
    return true;
  }

  if (!canUseWindow()) {
    return false;
  }

  try {
    return window.localStorage.getItem(STORAGE_FLAG) === "1";
  } catch {
    return false;
  }
}

function runtimeThreshold() {
  const raw = process.env.NEXT_PUBLIC_IXAI_RUNTIME_DIAGNOSTICS_THRESHOLD;
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_THRESHOLD;

  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_THRESHOLD;
}

export function recordWorkspaceRuntimeLoop(key: string, details?: Record<string, unknown>) {
  if (!isDiagnosticsEnabled()) {
    return;
  }

  const now = Date.now();
  const existing = buckets.get(key);
  const bucket =
    existing && now - existing.firstSeenAt <= WINDOW_MS
      ? existing
      : {
          count: 0,
          firstSeenAt: now,
          lastWarnedAt: 0,
        };

  bucket.count += 1;
  buckets.set(key, bucket);

  const threshold = runtimeThreshold();

  if (bucket.count < threshold || now - bucket.lastWarnedAt <= WINDOW_MS) {
    return;
  }

  bucket.lastWarnedAt = now;
  console.warn("[IXAI Runtime Diagnostics] repeated runtime activity", {
    count: bucket.count,
    details,
    key,
    threshold,
    windowMs: WINDOW_MS,
  });
}

export function resetWorkspaceRuntimeLoopDiagnostics() {
  buckets.clear();
}
