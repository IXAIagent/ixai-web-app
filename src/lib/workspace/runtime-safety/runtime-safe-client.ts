import { runWorkspaceSafeSync } from "@/src/lib/workspace/runtime-safety/runtime-safe-result";
import type { WorkspaceSafeResult } from "@/src/lib/workspace/runtime-safety/runtime-safe-types";

export function isWorkspaceBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function readWorkspaceStorageSafe(
  label: string,
  key: string,
  storage: "localStorage" | "sessionStorage" = "localStorage",
): WorkspaceSafeResult<string | null> {
  if (!isWorkspaceBrowser()) {
    return {
      data: null,
      error: null,
      label,
      ok: true,
      safeFallback: true,
    };
  }

  return runWorkspaceSafeSync(label, () => window[storage].getItem(key), null);
}

export function writeWorkspaceStorageSafe(
  label: string,
  key: string,
  value: string,
  storage: "localStorage" | "sessionStorage" = "localStorage",
): WorkspaceSafeResult<boolean> {
  if (!isWorkspaceBrowser()) {
    return {
      data: false,
      error: null,
      label,
      ok: true,
      safeFallback: true,
    };
  }

  return runWorkspaceSafeSync(
    label,
    () => {
      window[storage].setItem(key, value);
      return true;
    },
    false,
  );
}
