"use client";

import {
  buildEmptyWorkspaceIntelligenceReportV14,
  getWorkspaceIntelligenceReportV14,
} from "@/src/lib/workspace/intelligence";
import { buildWorkspaceMorningBrief } from "@/src/lib/workspace/morning-brief/workspace-brief-engine";
import type { WorkspaceMorningBrief } from "@/src/lib/workspace/morning-brief/workspace-brief-types";
import { logWorkspaceRuntimeWarning } from "@/src/lib/workspace/runtime-safety";

const CACHE_TTL_MS = 30_000;

let cachedBrief: WorkspaceMorningBrief | null = null;
let cachedAt = 0;

function isFresh() {
  return cachedBrief && Date.now() - cachedAt < CACHE_TTL_MS;
}

export function buildEmptyWorkspaceMorningBrief(): WorkspaceMorningBrief {
  return buildWorkspaceMorningBrief({
    intelligence: buildEmptyWorkspaceIntelligenceReportV14(),
  });
}

export async function getWorkspaceMorningBriefV14(options: { force?: boolean } = {}) {
  if (!options.force && isFresh()) {
    return cachedBrief as WorkspaceMorningBrief;
  }

  try {
    const brief = buildWorkspaceMorningBrief({
      intelligence: await getWorkspaceIntelligenceReportV14(options),
    });

    cachedBrief = brief;
    cachedAt = Date.now();
    return brief;
  } catch (error) {
    logWorkspaceRuntimeWarning("workspace-morning-brief-fallback", error);
    return buildEmptyWorkspaceMorningBrief();
  }
}
