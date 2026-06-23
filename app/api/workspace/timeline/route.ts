import { buildWorkspaceApiLimitedData, buildWorkspaceApiRouteResponse } from "@/src/lib/workspace/api/workspace-api-server";

export async function GET() {
  return Response.json(
    buildWorkspaceApiRouteResponse({
      data: buildWorkspaceApiLimitedData("timeline"),
      endpoint: "timeline",
      sourceStatus: "limited",
    }),
  );
}
