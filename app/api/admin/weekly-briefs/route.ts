import type { NextRequest } from "next/server";
import { isAdminRequestAuthorized } from "@/src/lib/admin/auth";
import {
  isWeeklyPersistenceReadable,
  isWeeklyPersistenceWritable,
  listWeeklyDraftsAsync,
} from "@/src/lib/editorial/weekly";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAdminRequestAuthorized(request)) {
    return Response.json(
      {
        status: "unauthorized",
        message: "Missing or invalid admin session.",
      },
      { status: 401 },
    );
  }

  const drafts = await listWeeklyDraftsAsync();

  return Response.json({
    drafts,
    persistence: {
      readable: isWeeklyPersistenceReadable(),
      writable: isWeeklyPersistenceWritable(),
    },
    note: "Weekly drafts are generated for editorial review only. Publish remains manual.",
  });
}
