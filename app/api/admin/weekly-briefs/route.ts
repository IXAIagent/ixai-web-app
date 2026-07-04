import type { NextRequest } from "next/server";
import { isAdminRequestAuthorized } from "@/src/lib/admin/auth";
import {
  isWeeklyPersistenceReadable,
  isWeeklyPersistenceWritable,
  isWeeklyRevisionSchemaAvailableAsync,
  listAdminWeeklyDraftsAsync,
} from "@/src/lib/editorial/weekly";
import { buildWeeklyBriefPublishHealth } from "@/src/lib/editorial/brief-health";

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

  // v1.30.5 — Editorial Studio only sees durable rows. Static fallback
  // weekly briefs cannot be edited via PATCH and would 404 if selected.
  const drafts = await listAdminWeeklyDraftsAsync();
  const revisionSchemaAvailable = await isWeeklyRevisionSchemaAvailableAsync();

  return Response.json({
    drafts,
    health: buildWeeklyBriefPublishHealth({ drafts }),
    persistence: {
      readable: isWeeklyPersistenceReadable(),
      revisionSchemaAvailable,
      writable: isWeeklyPersistenceWritable(),
    },
    note: "Weekly drafts are generated for editorial review only. Publish remains manual.",
  });
}
