import { NextRequest } from "next/server";
import { isAdminRequestAuthorized } from "@/src/lib/admin/auth";
import {
  isDailyIntelligencePersistenceReadable,
  isDailyIntelligencePersistenceWritable,
} from "@/src/lib/editorial/persistence";
import { buildDailyBriefPublishHealth } from "@/src/lib/editorial/brief-health";
import {
  getDraftsAsync,
  publishDraftWithPersistenceStatusAsync,
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

  const drafts = await getDraftsAsync();

  return Response.json({
    drafts,
    health: buildDailyBriefPublishHealth({ drafts }),
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
    const result = await publishDraftWithPersistenceStatusAsync(payload.id);

    if (!result) {
      return Response.json({ status: "not_found" }, { status: 404 });
    }

    if (!result.persistence.durable && result.persistence.fallbackReason === "supabase_write_failed") {
      return Response.json(
        {
          status: "persistence_failed",
          draft: result.draft,
          drafts: result.drafts,
          health: buildDailyBriefPublishHealth({ drafts: result.drafts }),
          message:
            "Daily publish was not written to durable persistence. The memory fallback is not public-readback visible and is not treated as a successful publish.",
          persistence: {
            ...result.persistence,
            readable: isDailyIntelligencePersistenceReadable(),
            writable: isDailyIntelligencePersistenceWritable(),
          },
        },
        { status: 502 },
      );
    }

    return Response.json({
      draft: result.draft,
      drafts: result.drafts,
      health: buildDailyBriefPublishHealth({ drafts: result.drafts }),
      persistence: {
        ...result.persistence,
        readable: isDailyIntelligencePersistenceReadable(),
        writable: isDailyIntelligencePersistenceWritable(),
      },
    });
  }

  if (payload.action === "save" && payload.draft) {
    const drafts = await saveDraftAsync(payload.draft);

    return Response.json({
      drafts,
      health: buildDailyBriefPublishHealth({ drafts }),
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
