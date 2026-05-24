import type { NextRequest } from "next/server";
import { isAdminRequestAuthorized } from "@/src/lib/admin/auth";
import {
  WeeklyPersistenceError,
  getWeeklyDraftByIdAsync,
  isWeeklyPersistenceReadable,
  isWeeklyPersistenceWritable,
  listWeeklyDraftsAsync,
  updateWeeklyDraftAsync,
} from "@/src/lib/editorial/weekly";

export const dynamic = "force-dynamic";

type WeeklyRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: WeeklyRouteContext) {
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
  const draft = await getWeeklyDraftByIdAsync(id);

  if (!draft) {
    return Response.json({ status: "not_found" }, { status: 404 });
  }

  return Response.json({ draft });
}

export async function PATCH(request: NextRequest, context: WeeklyRouteContext) {
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
  const body = await request.json().catch(() => ({}));
  const patch = Object.fromEntries(
    Object.entries({
      title: body.title,
      summary: body.summary,
      sections: body.sections,
      editorialNotes: body.editorialNotes,
      complianceNote: body.complianceNote,
      status: body.status,
      updatedBy: "editorial_studio",
    }).filter(([, value]) => value !== undefined),
  ) as Parameters<typeof updateWeeklyDraftAsync>[1];

  let draft: Awaited<ReturnType<typeof updateWeeklyDraftAsync>> = null;
  try {
    draft = await updateWeeklyDraftAsync(id, patch);
  } catch (error) {
    // v1.30.3 — Save / Mark as Review previously masked Supabase failures
    // by silently writing to the in-memory layer. Now we surface the real
    // failure so the admin UI can flag the row as not-yet-durable.
    return Response.json(
      {
        status: "persistence_failed",
        message:
          error instanceof WeeklyPersistenceError
            ? `Supabase persistence unavailable — weekly update was not written. ${error.message}`
            : error instanceof Error
              ? error.message
              : "Supabase weekly update failed.",
        persistence: {
          readable: isWeeklyPersistenceReadable(),
          writable: isWeeklyPersistenceWritable(),
        },
      },
      { status: 502 },
    );
  }

  if (!draft) {
    return Response.json({ status: "not_found_or_locked" }, { status: 404 });
  }

  return Response.json({
    draft,
    drafts: await listWeeklyDraftsAsync(),
    persistence: {
      readable: isWeeklyPersistenceReadable(),
      writable: isWeeklyPersistenceWritable(),
    },
  });
}
