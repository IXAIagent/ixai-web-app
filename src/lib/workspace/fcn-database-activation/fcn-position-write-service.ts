"use client";

import { getSupabaseAuthorizationHeaders } from "@/src/lib/supabase/client";
import {
  parseDraftNumber,
  type FCNDraftRecord,
} from "@/src/lib/portfolio/input/fcn-draft-store";
import type {
  V14FcnDraftWriteInput,
  V14FcnWriteGuard,
  V14FcnWriteResult,
} from "@/src/lib/workspace/fcn-database-activation/fcn-database-activation-types";
import { getV14FcnWriteGuard } from "@/src/lib/workspace/fcn-database-activation/fcn-database-activation-guards";
import { normalizeFcnDraftScheduleForPositionWrite } from "@/src/lib/workspace/fcn-database-activation/fcn-schedule-write-service";
import { normalizeFcnDraftUnderlyingsForWrite } from "@/src/lib/workspace/fcn-database-activation/fcn-underlying-write-service";
import {
  parseWorkspaceJsonSafe,
  readWorkspaceStorageSafe,
  writeWorkspaceStorageSafe,
} from "@/src/lib/workspace/runtime-safety";

type ApiPortfolio = {
  id?: string;
  status?: string;
};

type ApiFcnPosition = {
  currency?: string;
  id?: string;
  name?: string;
  notionalAmount?: number | null;
  underlyings?: Array<{ symbol?: string }>;
};

export const V14_FCN_WRITE_STATUS_STORAGE_KEY = "ixai.workspace.fcn-db-write.v1400";
export const V14_FCN_WRITE_STATUS_EVENT = "ixai:workspace:fcn-db-write:v1400";

function baseResult(input: {
  guard: V14FcnWriteGuard;
  operation: V14FcnWriteResult["operation"];
  sourceAction: string;
}): V14FcnWriteResult {
  return {
    checkedAt: new Date().toISOString(),
    databaseAttempted: false,
    fallbackUsed: true,
    guard: input.guard,
    module: input.guard.module,
    operation: input.operation,
    sourceAction: input.sourceAction,
    status: "skipped",
    target: "fallback",
  };
}

export function saveLastV14FcnWriteResult(result: V14FcnWriteResult) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    writeWorkspaceStorageSafe(
      "v14-fcn-write-result-save",
      V14_FCN_WRITE_STATUS_STORAGE_KEY,
      JSON.stringify(result),
    );
    window.dispatchEvent(new CustomEvent(V14_FCN_WRITE_STATUS_EVENT, { detail: result }));
  } catch {
    // Diagnostics metadata must never block FCN local fallback.
  }
}

export function loadLastV14FcnWriteResult(): V14FcnWriteResult | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawResult = readWorkspaceStorageSafe(
    "v14-fcn-write-result-read",
    V14_FCN_WRITE_STATUS_STORAGE_KEY,
  );
  const parsedResult = parseWorkspaceJsonSafe<V14FcnWriteResult | null>(
    "v14-fcn-write-result-parse",
    rawResult.data,
    null,
  );

  return parsedResult.data;
}

async function safeJson(response: Response) {
  return response.json().catch(() => null) as Promise<unknown>;
}

function firstPortfolioId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as { portfolio?: ApiPortfolio; portfolios?: ApiPortfolio[] };

  if (record.portfolio?.id) {
    return record.portfolio.id;
  }

  return record.portfolios?.find((portfolio) => portfolio.status !== "archived")?.id ?? null;
}

async function fetchFirstPortfolioId(headers: HeadersInit) {
  const response = await fetch("/api/portfolio", {
    cache: "no-store",
    headers,
  });

  if (!response.ok) {
    return null;
  }

  return firstPortfolioId(await safeJson(response));
}

async function createWorkspacePortfolio(headers: HeadersInit) {
  const response = await fetch("/api/portfolio", {
    body: JSON.stringify({
      baseCurrency: "USD",
      description:
        "Created by V14 guarded FCN database write activation after explicit FCN Wizard submit.",
      name: "IXAI FCN Workspace Portfolio",
    }),
    cache: "no-store",
    headers: {
      ...headers,
      "content-type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    return null;
  }

  return firstPortfolioId(await safeJson(response));
}

async function getOrCreateV14FcnPortfolioId(
  headers: HeadersInit,
  sourceAction: string,
): Promise<{ portfolioId: string | null; result?: V14FcnWriteResult }> {
  const guard = getV14FcnWriteGuard("fcn_position");
  const result = baseResult({
    guard,
    operation: "create_fcn_position",
    sourceAction,
  });

  if (!guard.enabled) {
    result.errorMessage = guard.reason;
    saveLastV14FcnWriteResult(result);
    return { portfolioId: null, result };
  }

  let portfolioId = await fetchFirstPortfolioId(headers);

  if (!portfolioId) {
    portfolioId = await createWorkspacePortfolio(headers);
  }

  if (!portfolioId) {
    result.databaseAttempted = true;
    result.errorMessage = "Portfolio database read/create did not return a portfolio id.";
    result.status = "failed";
    saveLastV14FcnWriteResult(result);
    return { portfolioId: null, result };
  }

  return { portfolioId };
}

function normalizeSymbols(draft: FCNDraftRecord) {
  return draft.underlyings
    .map((underlying) => underlying.symbol.trim().toUpperCase())
    .filter(Boolean)
    .sort();
}

function sameDraftPosition(draft: FCNDraftRecord, position: ApiFcnPosition) {
  const draftNotional = parseDraftNumber(draft.notionalAmount);
  const positionSymbols = (position.underlyings ?? [])
    .map((underlying) => underlying.symbol?.trim().toUpperCase())
    .filter(Boolean)
    .sort();

  return (
    position.name?.trim().toLowerCase() === draft.name.trim().toLowerCase() &&
    position.currency === draft.currency &&
    (draftNotional === null || position.notionalAmount === draftNotional) &&
    normalizeSymbols(draft).join("|") === positionSymbols.join("|")
  );
}

async function findExistingFcnPosition(headers: HeadersInit, draft: FCNDraftRecord) {
  const response = await fetch("/api/fcn", {
    cache: "no-store",
    headers,
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await safeJson(response)) as { ok?: boolean; positions?: ApiFcnPosition[] } | null;

  if (!payload?.ok || !Array.isArray(payload.positions)) {
    return null;
  }

  return payload.positions.find((position) => sameDraftPosition(draft, position)) ?? null;
}

function buildPayload(draft: FCNDraftRecord, portfolioId: string, includeSchedule: boolean) {
  return {
    couponRatePct: parseDraftNumber(draft.couponRatePct) ?? undefined,
    currency: draft.currency,
    issuer: draft.issuer?.trim() || undefined,
    kiPct: parseDraftNumber(draft.kiPct) ?? undefined,
    koPct: parseDraftNumber(draft.koPct) ?? undefined,
    metadata: {
      draftId: draft.id,
      observationFrequency: draft.observationFrequency,
      source: "v14_fcn_database_activation",
      tenor: draft.tenor,
    },
    name: draft.name,
    notionalAmount: parseDraftNumber(draft.notionalAmount) ?? undefined,
    observationSchedule: includeSchedule
      ? normalizeFcnDraftScheduleForPositionWrite(draft.schedule)
      : [],
    portfolioId,
    strikePct: parseDraftNumber(draft.strikePct) ?? undefined,
    underlyings: normalizeFcnDraftUnderlyingsForWrite(draft.underlyings),
  };
}

export async function saveFcnDraftWithV14DatabaseWrite(
  input: V14FcnDraftWriteInput,
): Promise<V14FcnWriteResult> {
  const sourceAction = input.sourceAction ?? "fcn_wizard_submit";
  const aggregateGuard = getV14FcnWriteGuard("fcn");
  const positionGuard = getV14FcnWriteGuard("fcn_position");
  const underlyingGuard = getV14FcnWriteGuard("fcn_underlying");
  const scheduleGuard = getV14FcnWriteGuard("fcn_schedule");
  const result = baseResult({
    guard: positionGuard,
    operation: "create_fcn_position",
    sourceAction,
  });

  if (!aggregateGuard.enabled || !positionGuard.enabled || !underlyingGuard.enabled) {
    result.errorMessage = [
      aggregateGuard.reason,
      positionGuard.reason,
      underlyingGuard.reason,
    ].join(" ");
    saveLastV14FcnWriteResult(result);
    return result;
  }

  if (input.draft.schedule.length > 0 && !scheduleGuard.enabled) {
    result.errorMessage =
      "FCN observation schedule exists in the local draft, but the V14 schedule guard is disabled. Database write skipped to avoid partial FCN persistence; local fallback remains active.";
    saveLastV14FcnWriteResult(result);
    return result;
  }

  try {
    const headers = await getSupabaseAuthorizationHeaders();

    if (!headers) {
      result.status = "fallback";
      result.errorMessage = "No authenticated Supabase session; FCN local fallback remains active.";
      saveLastV14FcnWriteResult(result);
      return result;
    }

    const { portfolioId, result: portfolioResult } = await getOrCreateV14FcnPortfolioId(
      headers,
      sourceAction,
    );

    if (!portfolioId) {
      const next = portfolioResult ?? result;
      next.fallbackUsed = true;
      next.target = "fallback";
      saveLastV14FcnWriteResult(next);
      return next;
    }

    const existing = await findExistingFcnPosition(headers, input.draft);

    if (existing?.id) {
      result.databaseAttempted = true;
      result.errorMessage = "Matching FCN position already exists; duplicate database write skipped.";
      result.fallbackUsed = false;
      result.portfolioId = portfolioId;
      result.positionId = existing.id;
      result.status = "skipped";
      result.target = "skipped";
      result.underlyingCount = existing.underlyings?.length ?? 0;
      saveLastV14FcnWriteResult(result);
      return result;
    }

    const payload = buildPayload(input.draft, portfolioId, scheduleGuard.enabled);
    result.databaseAttempted = true;
    result.portfolioId = portfolioId;
    result.scheduleCount = payload.observationSchedule.length;
    result.underlyingCount = payload.underlyings.length;

    const response = await fetch("/api/fcn", {
      body: JSON.stringify(payload),
      cache: "no-store",
      headers: {
        ...headers,
        "content-type": "application/json",
      },
      method: "POST",
    });
    const responsePayload = (await safeJson(response)) as
      | { ok?: boolean; position?: ApiFcnPosition; message?: string }
      | null;

    if (!response.ok || !responsePayload?.ok) {
      result.errorMessage =
        responsePayload?.message ?? "FCN database write failed; local fallback remains active.";
      result.status = "failed";
      result.target = "fallback";
      saveLastV14FcnWriteResult(result);
      return result;
    }

    result.fallbackUsed = false;
    result.positionId = responsePayload.position?.id;
    result.status = "succeeded";
    result.target = "database";
    saveLastV14FcnWriteResult(result);
    window.dispatchEvent(new CustomEvent("ixai:portfolio:changed"));
    return result;
  } catch (error) {
    result.errorMessage =
      error instanceof Error ? error.message : "FCN database write failed.";
    result.status = "failed";
    result.target = "fallback";
    saveLastV14FcnWriteResult(result);
    return result;
  }
}
