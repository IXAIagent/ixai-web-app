import { NextRequest } from "next/server";
import { isAdminRequestAuthorized } from "@/src/lib/admin/auth";
import {
  isDailyIntelligencePersistenceReadable,
  isDailyIntelligencePersistenceWritable,
} from "@/src/lib/editorial/persistence";
import {
  getDraftsAsync,
  publishDraftAsync,
  saveDraftAsync,
} from "@/src/lib/editorial/repository";
import type { DailyBriefDraft } from "@/src/types/editorial";

export const dynamic = "force-dynamic";

function unauthorized() {
  return Response.json(
    {
      status: "unauthorized",
      message: "Missing or invalid admin session.",
    },
    { status: 401 },
  );
}

export async function GET(request: NextRequest) {
  if (!isAdminRequestAuthorized(request)) {
    return unauthorized();
  }

  return Response.json({
    drafts: await getDraftsAsync(),
    persistence: {
      readable: isDailyIntelligencePersistenceReadable(),
      writable: isDailyIntelligencePersistenceWritable(),
    },
  });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequestAuthorized(request)) {
    return unauthorized();
  }

  const payload = (await request.json().catch(() => ({}))) as {
    action?: "save" | "publish";
    draft?: DailyBriefDraft;
    id?: string;
  };

  if (payload.action === "publish" && payload.id) {
    return Response.json({
      drafts: await publishDraftAsync(payload.id),
      persistence: {
        readable: isDailyIntelligencePersistenceReadable(),
        writable: isDailyIntelligencePersistenceWritable(),
      },
    });
  }

  if (payload.action === "save" && payload.draft) {
    return Response.json({
      drafts: await saveDraftAsync(payload.draft),
      persistence: {
        readable: isDailyIntelligencePersistenceReadable(),
        writable: isDailyIntelligencePersistenceWritable(),
      },
    });
  }

  return Response.json(
    {
      status: "bad_request",
      message: "Unsupported editorial action.",
    },
    { status: 400 },
  );
}
