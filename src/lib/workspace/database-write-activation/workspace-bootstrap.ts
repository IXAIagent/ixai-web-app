"use client";

import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";
import type { V12WorkspaceBootstrapResult, V12WriteGuard } from "@/src/lib/workspace/database-write-activation/database-write-activation-types";

type WorkspaceRow = {
  id: string;
};

async function readCurrentUserId() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) {
    return { supabase: null, userId: null };
  }

  try {
    const { data } = await supabase.auth.getUser();
    return { supabase, userId: data.user?.id ?? null };
  } catch {
    return { supabase, userId: null };
  }
}

export async function getV12WorkspaceBootstrapStatus(input?: {
  allowCreate?: boolean;
  guard?: V12WriteGuard;
}): Promise<V12WorkspaceBootstrapResult> {
  const checkedAt = new Date().toISOString();
  const { supabase, userId } = await readCurrentUserId();

  if (!supabase) {
    return {
      blockingReason: "Supabase browser client is not configured.",
      checkedAt,
      created: false,
      fallbackUsed: true,
      source: "unavailable",
    };
  }

  if (!userId) {
    return {
      blockingReason: "No authenticated workspace user was available; fallback remains active.",
      checkedAt,
      created: false,
      fallbackUsed: true,
      source: "fallback",
    };
  }

  try {
    const { data: existing, error: readError } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle<WorkspaceRow>();

    if (existing?.id) {
      return {
        checkedAt,
        created: false,
        fallbackUsed: false,
        source: "database",
        workspaceId: existing.id,
      };
    }

    if (readError) {
      return {
        blockingReason: readError.message,
        checkedAt,
        created: false,
        fallbackUsed: true,
        source: "fallback",
      };
    }

    if (!input?.allowCreate || !input.guard?.enabled) {
      return {
        blockingReason: input?.guard?.reason ?? "Workspace bootstrap creation is diagnostics-only.",
        checkedAt,
        created: false,
        fallbackUsed: true,
        source: "skipped",
      };
    }

    const { data: created, error: createError } = await supabase
      .from("workspaces")
      .insert({
        metadata: { created_by: "v12_workspace_database_write_activation" },
        name: "IXAI Workspace",
        owner_id: userId,
        status: "active",
      })
      .select("id")
      .single<WorkspaceRow>();

    if (createError || !created?.id) {
      return {
        blockingReason: createError?.message ?? "Workspace creation returned no workspace id.",
        checkedAt,
        created: false,
        fallbackUsed: true,
        source: "fallback",
      };
    }

    await supabase.from("workspace_members").upsert(
      {
        role: "owner",
        status: "active",
        user_id: userId,
        workspace_id: created.id,
      },
      { onConflict: "workspace_id,user_id" },
    );

    return {
      checkedAt,
      created: true,
      fallbackUsed: false,
      source: "database",
      workspaceId: created.id,
    };
  } catch (error) {
    return {
      blockingReason: error instanceof Error ? error.message : "Workspace bootstrap failed safely.",
      checkedAt,
      created: false,
      fallbackUsed: true,
      source: "fallback",
    };
  }
}
