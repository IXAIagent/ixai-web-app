import { buildWorkspaceApiLimitedData, buildWorkspaceApiRouteResponse } from "@/src/lib/workspace/api/workspace-api-server";

export async function GET() {
  return Response.json(
    buildWorkspaceApiRouteResponse({
      data: buildWorkspaceApiLimitedData("health"),
      endpoint: "health",
      sourceStatus: "limited",
    }),
  );
}
