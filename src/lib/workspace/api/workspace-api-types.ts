export type WorkspaceApiEndpoint =
  | "daily-brief"
  | "graph"
  | "health"
  | "intelligence"
  | "migration-health"
  | "notifications"
  | "timeline";

export type WorkspaceApiSourceStatus =
  | "limited"
  | "partial"
  | "ready"
  | "unavailable";

export interface WorkspaceApiReadback<TData> {
  data: TData | null;
  endpoint: WorkspaceApiEndpoint;
  generatedAt: string;
  ok: boolean;
  warning?: string;
}

export interface WorkspaceApiRouteResponse<TData> {
  data: TData;
  generatedAt: string;
  ok: boolean;
  sourceStatus: WorkspaceApiSourceStatus;
  warnings: string[];
}

export interface WorkspaceApiGatewayStatus {
  endpoints: Array<{
    endpoint: WorkspaceApiEndpoint;
    mode: "service_only";
    readOnly: boolean;
  }>;
  generatedAt: string;
  routeHandlersEnabled: boolean;
  summary: string;
}
