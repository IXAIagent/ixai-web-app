import type { NextRequest } from "next/server";
import { isAdminRequestAuthorized } from "@/src/lib/admin/auth";
import {
  isWeeklyPersistenceReadable,
  isWeeklyPersistenceWritable,
  listAdminWeeklyDraftsAsync,
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

  // v1.30.5 — Editorial Studio only sees durable rows. Static fallback
  // weekly briefs cannot be edited via PATCH and would 404 if selected.
  const drafts = await listAdminWeeklyDraftsAsync();

  return Response.json({
    drafts,
    persistence: {
      readable: isWeeklyPersistenceReadable(),
      writable: isWeeklyPersistenceWritable(),
    },
    note: "Weekly drafts are generated for editorial review only. Publish remains manual.",
  });
}
