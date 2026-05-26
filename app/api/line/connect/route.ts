import type { NextRequest } from "next/server";
import { readIdentitySession } from "@/src/lib/auth/session";
import { getLineConfigState } from "@/src/lib/line/config";
import { linkLineIdentity, resolveUnifiedIdentity } from "@/src/lib/line/identity-merge";
import { log } from "@/src/lib/log";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await readIdentitySession();

  if (!session) {
    return Response.json(
      {
        message: "Identity session required.",
        ok: false,
      },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      source?: unknown;
    };
    const source =
      typeof body.source === "string" && body.source.trim()
        ? body.source.trim().slice(0, 80)
        : "line_connect_card";
    const unifiedBefore = await resolveUnifiedIdentity(session);

    if (unifiedBefore.line_identity) {
      return Response.json({
        connect: {
          expiresAt: null,
          linkToken: null,
          lineOfficialAccountUrl: getLineConfigState().officialAccountUrl,
          status: "connected",
        },
        intelligence_sync_ready: true,
        line_connected: true,
        ok: true,
        status: "connected",
        unified_identity: {
          membership_plan: unifiedBefore.membership?.plan ?? session.membership_plan,
          tags: unifiedBefore.unified_tags,
        },
      });
    }

    const result = await linkLineIdentity({
      session,
      source,
    });
    const unifiedAfter = await resolveUnifiedIdentity(session);
    const lineConfig = getLineConfigState();

    return Response.json({
      connect: {
        expiresAt: result.pending?.expiresAt ?? null,
        linkToken: result.pending?.token ?? null,
        lineOfficialAccountUrl: lineConfig.officialAccountUrl,
        status: result.status,
      },
      intelligence_sync_ready: Boolean(unifiedAfter.line_identity),
      line_connected: Boolean(unifiedAfter.line_identity),
      ok: true,
      status: result.status,
      unified_identity: {
        membership_plan: unifiedAfter.membership?.plan ?? result.membership.plan,
        tags: unifiedAfter.unified_tags,
      },
    });
  } catch (error) {
    log.warn("[ixai.line.connect] failed", error);

    return Response.json(
      {
        message: "Unable to create LINE connection contract.",
        ok: false,
      },
      { status: 502 },
    );
  }
}
