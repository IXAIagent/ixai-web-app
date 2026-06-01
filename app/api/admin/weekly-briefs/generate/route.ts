import type { NextRequest } from "next/server";
import { isAdminRequestAuthorized } from "@/src/lib/admin/auth";
import {
  WeeklyPersistenceError,
  generateWeeklyIntelligenceDraft,
  isWeeklyPersistenceReadable,
  isWeeklyPersistenceWritable,
  isWeeklyRevisionSchemaAvailableAsync,
  listAdminWeeklyDraftsAsync,
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

  try {
    const { draft, intake, summary } = await generateWeeklyIntelligenceDraft({ force });
    const drafts = await listAdminWeeklyDraftsAsync();
    const revisionSchemaAvailable = await isWeeklyRevisionSchemaAvailableAsync();
    console.info(
      "[IXAI WEEKLY WORKFLOW]",
      JSON.stringify({
        draft_id: draft.id,
        generation_completed: true,
        generation_started: true,
        list_count_after_save: drafts.length,
        save_completed: summary.status === "generated",
        weekly_slug: draft.slug,
        weekly_status: draft.status,
        revision_schema_available: revisionSchemaAvailable,
        revision_number: draft.revisionNumber ?? 1,
      }),
    );

    return Response.json({
      draft,
      drafts,
      intake,
      summary,
      persistence: {
        readable: isWeeklyPersistenceReadable(),
        revisionSchemaAvailable,
        writable: isWeeklyPersistenceWritable(),
      },
    });
  } catch (error) {
    // v1.30.3 — generate writes via saveWeeklyDraftAsync, which now throws
    // on durable persistence failure. Surface the error so the admin UI
    // does not show a phantom draft that never landed in Supabase.
    return Response.json(
      {
        status: "persistence_failed",
        message:
          error instanceof WeeklyPersistenceError
            ? `Supabase persistence unavailable — weekly draft was not written. ${error.message}`
            : error instanceof Error
              ? error.message
              : "Weekly draft generation failed.",
        persistence: {
          readable: isWeeklyPersistenceReadable(),
          revisionSchemaAvailable: await isWeeklyRevisionSchemaAvailableAsync(),
          writable: isWeeklyPersistenceWritable(),
        },
      },
      { status: 502 },
    );
  }
}
