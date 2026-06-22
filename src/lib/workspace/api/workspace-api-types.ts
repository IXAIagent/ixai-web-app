export type WorkspaceApiEndpoint =
  | "graph"
  | "health"
  | "notifications"
  | "timeline";

export interface WorkspaceApiReadback<TData> {
  data: TData | null;
  endpoint: WorkspaceApiEndpoint;
  generatedAt: string;
  ok: boolean;
  warning?: string;
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
