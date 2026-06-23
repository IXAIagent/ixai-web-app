import type { WorkspaceApiGatewayStatus } from "@/src/lib/workspace/api/workspace-api-types";

export function getWorkspaceApiGatewayStatus(): WorkspaceApiGatewayStatus {
  return {
    endpoints: [
      { endpoint: "graph", mode: "service_only", readOnly: true },
      { endpoint: "health", mode: "service_only", readOnly: true },
      { endpoint: "timeline", mode: "service_only", readOnly: true },
      { endpoint: "notifications", mode: "service_only", readOnly: true },
      { endpoint: "intelligence", mode: "service_only", readOnly: true },
      { endpoint: "daily-brief", mode: "service_only", readOnly: true },
    ],
    generatedAt: new Date().toISOString(),
    routeHandlersEnabled: true,
    summary:
      "Workspace API Gateway exposes read-only V6.10 route handlers. Routes use server-safe limited responses when full personalized readback depends on browser-local fallbacks.",
  };
}
