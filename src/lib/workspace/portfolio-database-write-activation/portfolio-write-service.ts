"use client";

import { getSupabaseAuthorizationHeaders } from "@/src/lib/supabase/client";
import type {
  V13PortfolioWriteGuard,
  V13PortfolioWriteResult,
} from "@/src/lib/workspace/portfolio-database-write-activation/portfolio-write-activation-types";
import { getV13PortfolioWriteGuard } from "@/src/lib/workspace/portfolio-database-write-activation/portfolio-write-activation-guards";

type ApiPortfolio = {
  id?: string;
  name?: string;
  status?: string;
};

export const V13_PORTFOLIO_WRITE_STATUS_STORAGE_KEY =
  "ixai.workspace.portfolio-db-write.v1300";
export const V13_PORTFOLIO_WRITE_STATUS_EVENT =
  "ixai:workspace:portfolio-db-write:v1300";

function baseResult(input: {
  guard: V13PortfolioWriteGuard;
  operation: V13PortfolioWriteResult["operation"];
  sourceAction: string;
}): V13PortfolioWriteResult {
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

export function saveLastV13PortfolioWriteResult(result: V13PortfolioWriteResult) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(V13_PORTFOLIO_WRITE_STATUS_STORAGE_KEY, JSON.stringify(result));
    window.dispatchEvent(new CustomEvent(V13_PORTFOLIO_WRITE_STATUS_EVENT, { detail: result }));
  } catch {
    // Diagnostics metadata must never break input fallback.
  }
}

export function loadLastV13PortfolioWriteResult(): V13PortfolioWriteResult | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(V13_PORTFOLIO_WRITE_STATUS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as V13PortfolioWriteResult) : null;
  } catch {
    return null;
  }
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
        "Created by V13 guarded Portfolio database write activation after explicit Asset Input submit.",
      name: "IXAI Workspace Portfolio",
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

export async function getOrCreateV13WorkspacePortfolioId(
  sourceAction: string,
): Promise<{ portfolioId: string | null; result: V13PortfolioWriteResult }> {
  const guard = getV13PortfolioWriteGuard("portfolio");
  const result = baseResult({
    guard,
    operation: "create_portfolio",
    sourceAction,
  });

  if (!guard.enabled) {
    result.status = "skipped";
    result.errorMessage = guard.reason;
    saveLastV13PortfolioWriteResult(result);
    return { portfolioId: null, result };
  }

  try {
    const headers = await getSupabaseAuthorizationHeaders();

    if (!headers) {
      result.status = "fallback";
      result.errorMessage = "No authenticated Supabase session; local fallback remains active.";
      saveLastV13PortfolioWriteResult(result);
      return { portfolioId: null, result };
    }

    result.databaseAttempted = true;
    let portfolioId = await fetchFirstPortfolioId(headers);

    if (!portfolioId) {
      portfolioId = await createWorkspacePortfolio(headers);
    }

    if (!portfolioId) {
      result.status = "failed";
      result.target = "fallback";
      result.errorMessage = "Portfolio database read/create did not return a portfolio id.";
      saveLastV13PortfolioWriteResult(result);
      return { portfolioId: null, result };
    }

    result.fallbackUsed = false;
    result.portfolioId = portfolioId;
    result.status = "succeeded";
    result.target = "database";
    saveLastV13PortfolioWriteResult(result);
    return { portfolioId, result };
  } catch (error) {
    result.status = "failed";
    result.errorMessage =
      error instanceof Error ? error.message : "Portfolio database write failed.";
    saveLastV13PortfolioWriteResult(result);
    return { portfolioId: null, result };
  }
}
