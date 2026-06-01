import type { NextRequest } from "next/server";
import { isAdminRequestAuthorized } from "@/src/lib/admin/auth";
import {
  isWeeklyPersistenceReadable,
  isWeeklyPersistenceWritable,
  isWeeklyRevisionSchemaAvailableAsync,
  listAdminWeeklyDraftsAsync,
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
    const status =
      result.error === "not_found"
        ? 404
        : result.error === "persistence_failed"
          ? 502
          : 400;

    const message =
      result.error === "validation_failed"
        ? "Weekly content must include title, summary, market highlights, and IXAI Intelligence Summary before publishing."
        : result.error === "persistence_failed"
          ? `Supabase persistence unavailable — weekly publish was not written. ${
              "message" in result && result.message ? result.message : ""
            }`.trim()
          : "Weekly draft cannot be published in its current state.";

    return Response.json(
      {
        status: result.error,
        draft: result.draft,
        message,
        persistence: {
          readable: isWeeklyPersistenceReadable(),
          revisionSchemaAvailable: await isWeeklyRevisionSchemaAvailableAsync(),
          writable: isWeeklyPersistenceWritable(),
        },
      },
      { status },
    );
  }

  // v1.30.3 — defense-in-depth: refuse to claim success unless the
  // returned draft actually came back with status === "published". The
  // saveWeeklyDraftAsync path should already throw on failure, but if
  // anything in the chain regresses we want a loud, surfaced error
  // instead of a silent fake success.
  if (!result.draft || result.draft.status !== "published") {
    return Response.json(
      {
        status: "persistence_failed",
        draft: result.draft,
        message:
          "Weekly publish did not return a published row. Supabase write may not have landed.",
        persistence: {
          readable: isWeeklyPersistenceReadable(),
          revisionSchemaAvailable: await isWeeklyRevisionSchemaAvailableAsync(),
          writable: isWeeklyPersistenceWritable(),
        },
      },
      { status: 502 },
    );
  }

  return Response.json({
    draft: result.draft,
    drafts: await listAdminWeeklyDraftsAsync(),
    persistence: {
      readable: isWeeklyPersistenceReadable(),
      revisionSchemaAvailable: await isWeeklyRevisionSchemaAvailableAsync(),
      writable: isWeeklyPersistenceWritable(),
    },
    note: "Manual publish completed after editorial review.",
  });
}
