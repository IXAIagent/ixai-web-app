import type {
  WorkspaceApiEndpoint,
  WorkspaceApiRouteResponse,
  WorkspaceApiSourceStatus,
} from "@/src/lib/workspace/api/workspace-api-types";

const SERVER_SAFE_WARNINGS: Partial<Record<WorkspaceApiEndpoint, string>> = {
  "daily-brief":
    "Daily Brief server route is limited because the full workspace brief depends on client-local fallback readback.",
  graph:
    "Workspace Graph server route is limited because the full graph depends on browser-local fallback readback.",
  health:
    "Workspace Health server route is limited because full health scoring depends on the client workspace graph.",
  intelligence:
    "Intelligence server route is limited because full readback depends on client-local workspace sources.",
  notifications:
    "Notifications server route is limited because read/unread state is browser-local.",
  timeline:
    "Timeline server route is limited because full timeline readback depends on client-local FCN and alert sources.",
};

export function buildWorkspaceApiRouteResponse<TData>(input: {
  data: TData;
  endpoint: WorkspaceApiEndpoint;
  sourceStatus?: WorkspaceApiSourceStatus;
  warnings?: string[];
}): WorkspaceApiRouteResponse<TData> {
  const warning = SERVER_SAFE_WARNINGS[input.endpoint];
  const warnings = [...(input.warnings ?? []), ...(warning ? [warning] : [])];

  return {
    data: input.data,
    generatedAt: new Date().toISOString(),
    ok: true,
    sourceStatus: input.sourceStatus ?? (warnings.length > 0 ? "limited" : "ready"),
    warnings,
  };
}

export function buildWorkspaceApiLimitedData(endpoint: WorkspaceApiEndpoint) {
  return {
    endpoint,
    mode: "server_safe_limited",
    readOnly: true,
    summary:
      "This endpoint is available as a read-only platform foundation. Full personalized readback remains client-side until local fallback sources are normalized for server execution.",
  };
}
