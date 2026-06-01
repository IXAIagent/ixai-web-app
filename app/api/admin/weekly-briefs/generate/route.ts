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
    const debug = summary.debug
      ? {
          ...summary.debug,
          listCountAfterSave: drafts.length,
        }
      : undefined;
    console.info(
      "[IXAI WEEKLY WORKFLOW]",
      JSON.stringify({
        blocked_reason: debug?.blockedReason ?? null,
        draft_id: draft.id,
        final_response_sent: true,
        final_status: debug?.finalStatus ?? summary.status,
        generation_completed: true,
        generation_started: true,
        list_count_after_save: drafts.length,
        save_completed: debug?.saveCompleted ?? summary.status === "generated",
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
      summary: debug ? { ...summary, debug } : summary,
      persistence: {
        readable: isWeeklyPersistenceReadable(),
        revisionSchemaAvailable,
        writable: isWeeklyPersistenceWritable(),
      },
    });
  } catch (error) {
    const revisionSchemaAvailable = await isWeeklyRevisionSchemaAvailableAsync();
    console.info(
      "[IXAI WEEKLY WORKFLOW]",
      JSON.stringify({
        final_response_sent: true,
        final_status: "failed",
        generation_completed: false,
        generation_started: true,
        postgrest_code:
          error instanceof WeeklyPersistenceError ? error.postgrestCode ?? null : null,
        save_failed_reason:
          error instanceof Error ? error.message : "Weekly draft generation failed.",
      }),
    );
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
        debug: {
          generationStarted: true,
          generationCompleted: false,
          saveAttempted: true,
          saveCompleted: false,
          finalStatus: "failed",
          postgrestCode:
            error instanceof WeeklyPersistenceError ? error.postgrestCode : undefined,
          saveFailedReason:
            error instanceof Error ? error.message : "Weekly draft generation failed.",
        },
        persistence: {
          readable: isWeeklyPersistenceReadable(),
          revisionSchemaAvailable,
          writable: isWeeklyPersistenceWritable(),
        },
      },
      { status: 502 },
    );
  }
}
