export type WorkspaceSafeError = {
  message: string;
  name: string;
};

export type WorkspaceSafeResult<TData> = {
  data: TData;
  error: WorkspaceSafeError | null;
  label: string;
  ok: boolean;
  safeFallback?: boolean;
};

export type WorkspaceSafeDiagnosticsStatus = "degraded" | "ready" | "unavailable";

export type WorkspaceSafeDiagnosticsFallback = {
  error: string;
  label: string;
  safeFallback: true;
  status: WorkspaceSafeDiagnosticsStatus;
};
