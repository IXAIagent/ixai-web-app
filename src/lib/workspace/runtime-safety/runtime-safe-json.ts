import { runWorkspaceSafeSync } from "@/src/lib/workspace/runtime-safety/runtime-safe-result";
import type { WorkspaceSafeResult } from "@/src/lib/workspace/runtime-safety/runtime-safe-types";

export function parseWorkspaceJsonSafe<TData>(
  label: string,
  raw: string | null | undefined,
  fallback: TData,
): WorkspaceSafeResult<TData> {
  if (!raw) {
    return {
      data: fallback,
      error: null,
      label,
      ok: true,
    };
  }

  return runWorkspaceSafeSync(label, () => JSON.parse(raw) as TData, fallback);
}
