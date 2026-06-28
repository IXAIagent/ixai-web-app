import type { WorkspaceSafeError, WorkspaceSafeResult } from "@/src/lib/workspace/runtime-safety/runtime-safe-types";
import { recordWorkspaceRuntimeLoop } from "@/src/lib/workspace/runtime-safety/runtime-loop-detector";

export function toWorkspaceSafeError(error: unknown): WorkspaceSafeError {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name || "Error",
    };
  }

  return {
    message: "unknown_error",
    name: "UnknownError",
  };
}

export async function runWorkspaceSafe<TData>(
  label: string,
  task: () => Promise<TData>,
  fallback: TData,
): Promise<WorkspaceSafeResult<TData>> {
  recordWorkspaceRuntimeLoop(`safe-refresh:${label}`, { label });

  try {
    return {
      data: await task(),
      error: null,
      label,
      ok: true,
    };
  } catch (error) {
    return {
      data: fallback,
      error: toWorkspaceSafeError(error),
      label,
      ok: false,
      safeFallback: true,
    };
  }
}

export function runWorkspaceSafeSync<TData>(
  label: string,
  task: () => TData,
  fallback: TData,
): WorkspaceSafeResult<TData> {
  recordWorkspaceRuntimeLoop(`safe-sync:${label}`, { label });

  try {
    return {
      data: task(),
      error: null,
      label,
      ok: true,
    };
  } catch (error) {
    return {
      data: fallback,
      error: toWorkspaceSafeError(error),
      label,
      ok: false,
      safeFallback: true,
    };
  }
}
