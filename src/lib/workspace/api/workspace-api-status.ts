import type { WorkspaceApiGatewayStatus } from "@/src/lib/workspace/api/workspace-api-types";

export function getWorkspaceApiGatewayStatus(): WorkspaceApiGatewayStatus {
  return {
    endpoints: [
      { endpoint: "graph", mode: "service_only", readOnly: true },
      { endpoint: "health", mode: "service_only", readOnly: true },
      { endpoint: "timeline", mode: "service_only", readOnly: true },
      { endpoint: "notifications", mode: "service_only", readOnly: true },
    ],
    generatedAt: new Date().toISOString(),
    routeHandlersEnabled: false,
    summary:
      "Workspace API Gateway is implemented as a read-only service layer in V5.50. Route handlers are deferred because the current Workspace services depend on client-only readback and browser-local fallbacks.",
  };
}
