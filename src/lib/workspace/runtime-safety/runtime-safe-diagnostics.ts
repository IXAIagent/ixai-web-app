import { runWorkspaceSafe, runWorkspaceSafeSync } from "@/src/lib/workspace/runtime-safety/runtime-safe-result";
import type {
  WorkspaceSafeDiagnosticsFallback,
  WorkspaceSafeResult,
} from "@/src/lib/workspace/runtime-safety/runtime-safe-types";

export function buildWorkspaceDiagnosticsFallback(
  label: string,
  error = "workspace_diagnostics_unavailable",
): WorkspaceSafeDiagnosticsFallback {
  return {
    error,
    label,
    safeFallback: true,
    status: "unavailable",
  };
}

export async function runWorkspaceDiagnosticsSafe<TData>(
  label: string,
  task: () => Promise<TData>,
  fallback: TData,
): Promise<WorkspaceSafeResult<TData>> {
  return runWorkspaceSafe(label, task, fallback);
}

export function buildWorkspaceDiagnosticsSafe<TData>(
  label: string,
  task: () => TData,
  fallback: TData,
): WorkspaceSafeResult<TData> {
  return runWorkspaceSafeSync(label, task, fallback);
}
