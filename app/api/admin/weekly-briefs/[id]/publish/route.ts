import type { NextRequest } from "next/server";
import { isAdminRequestAuthorized } from "@/src/lib/admin/auth";
import {
  isWeeklyPersistenceReadable,
  isWeeklyPersistenceWritable,
  listWeeklyDraftsAsync,
  publishWeeklyDraftAsync,
} from "@/src/lib/editorial/weekly";

export const dynamic = "force-dynamic";

type WeeklyPublishRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: WeeklyPublishRouteContext) {
  if (!isAdminRequestAuthorized(request)) {
    return Response.json(
      {
        status: "unauthorized",
        message: "Missing or invalid admin session.",
      },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const result = await publishWeeklyDraftAsync(id);

  if (result.error) {
    return Response.json(
      {
        status: result.error,
        draft: result.draft,
        message:
          result.error === "validation_failed"
            ? "Weekly content must include title, summary, market highlights, and IXAI Intelligence Summary before publishing."
            : "Weekly draft cannot be published in its current state.",
      },
      { status: result.error === "not_found" ? 404 : 400 },
    );
  }

  return Response.json({
    draft: result.draft,
    drafts: await listWeeklyDraftsAsync(),
    persistence: {
      readable: isWeeklyPersistenceReadable(),
      writable: isWeeklyPersistenceWritable(),
    },
    note: "Manual publish completed after editorial review.",
  });
}
