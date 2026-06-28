type RuntimeLogLevel = "error" | "warn";

const seenRuntimeMessages = new Set<string>();

function normalizeMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "unknown_error";
}

function logWorkspaceRuntime(
  level: RuntimeLogLevel,
  label: string,
  error: unknown,
  details?: Record<string, unknown>,
) {
  const message = normalizeMessage(error);
  const key = `${level}:${label}:${message}:${JSON.stringify(details ?? {})}`;

  if (seenRuntimeMessages.has(key)) {
    return;
  }

  seenRuntimeMessages.add(key);

  const payload = {
    details,
    label,
    message,
  };

  if (level === "error") {
    console.error("[IXAI Runtime]", payload);
    return;
  }

  console.warn("[IXAI Runtime]", payload);
}

export function logWorkspaceRuntimeWarning(
  label: string,
  error: unknown,
  details?: Record<string, unknown>,
) {
  logWorkspaceRuntime("warn", label, error, details);
}

export function logWorkspaceRuntimeError(
  label: string,
  error: unknown,
  details?: Record<string, unknown>,
) {
  logWorkspaceRuntime("error", label, error, details);
}
