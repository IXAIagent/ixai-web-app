import type { NextRequest } from "next/server";
import { isAdminRequestAuthorized } from "@/src/lib/admin/auth";
import {
  generateWeeklyIntelligenceDraft,
  isWeeklyPersistenceReadable,
  isWeeklyPersistenceWritable,
  listWeeklyDraftsAsync,
} from "@/src/lib/editorial/weekly";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isAdminRequestAuthorized(request)) {
    return Response.json(
      {
        status: "unauthorized",
        message: "Missing or invalid admin session.",
      },
      { status: 401 },
    );
  }

  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "1";
  const { draft, intake, summary } = await generateWeeklyIntelligenceDraft({ force });
  const drafts = await listWeeklyDraftsAsync();

  return Response.json({
    draft,
    drafts,
    intake,
    summary,
    persistence: {
      readable: isWeeklyPersistenceReadable(),
      writable: isWeeklyPersistenceWritable(),
    },
  });
}
