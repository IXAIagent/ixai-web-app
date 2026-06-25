"use client";

import { getSupabaseAuthorizationHeaders } from "@/src/lib/supabase/client";
import { getV13PortfolioWriteGuard } from "@/src/lib/workspace/portfolio-database-write-activation/portfolio-write-activation-guards";
import type {
  V13CryptoPositionWriteInput,
  V13PortfolioWriteResult,
} from "@/src/lib/workspace/portfolio-database-write-activation/portfolio-write-activation-types";
import { getOrCreateV13WorkspacePortfolioId, saveLastV13PortfolioWriteResult } from "@/src/lib/workspace/portfolio-database-write-activation/portfolio-write-service";

function skippedResult(input: {
  guard: ReturnType<typeof getV13PortfolioWriteGuard>;
  sourceAction: string;
}): V13PortfolioWriteResult {
  return {
    checkedAt: new Date().toISOString(),
    databaseAttempted: false,
    errorMessage: input.guard.reason,
    fallbackUsed: true,
    guard: input.guard,
    module: "crypto_position",
    operation: "create_position",
    sourceAction: input.sourceAction,
    status: "skipped",
    target: "fallback",
  };
}

export async function saveCryptoPositionWithV13DatabaseWrite(
  input: V13CryptoPositionWriteInput,
): Promise<V13PortfolioWriteResult> {
  const sourceAction = input.sourceAction ?? "asset_input_crypto_submit";
  const guard = getV13PortfolioWriteGuard("crypto_position");

  if (!guard.enabled) {
    const result = skippedResult({ guard, sourceAction });
    saveLastV13PortfolioWriteResult(result);
    return result;
  }

  const { portfolioId } = await getOrCreateV13WorkspacePortfolioId(sourceAction);
  const result: V13PortfolioWriteResult = {
    checkedAt: new Date().toISOString(),
    databaseAttempted: false,
    fallbackUsed: true,
    guard,
    module: "crypto_position",
    operation: "create_position",
    portfolioId: portfolioId ?? undefined,
    sourceAction,
    status: "fallback",
    target: "fallback",
  };

  if (!portfolioId) {
    result.errorMessage = "Portfolio database id is unavailable; crypto local fallback remains active.";
    saveLastV13PortfolioWriteResult(result);
    return result;
  }

  try {
    const headers = await getSupabaseAuthorizationHeaders();

    if (!headers) {
      result.errorMessage = "No authenticated Supabase session; crypto local fallback remains active.";
      saveLastV13PortfolioWriteResult(result);
      return result;
    }

    result.databaseAttempted = true;
    const response = await fetch("/api/crypto", {
      body: JSON.stringify({
        averageCost: input.costBasis,
        currency: input.currency ?? "USDT",
        exchange: input.source ?? null,
        metadata: {
          source: "v13_portfolio_database_write_activation",
          sourceAction,
        },
        name: input.asset,
        portfolioId,
        positionType: "spot",
        quantity: input.quantity,
        strategyType: "holding",
        symbol: input.asset.toUpperCase(),
      }),
      cache: "no-store",
      headers: {
        ...headers,
        "content-type": "application/json",
      },
      method: "POST",
    });

    const payload = await response.json().catch(() => null) as { position?: { id?: string }; message?: string } | null;

    if (!response.ok) {
      result.errorMessage = payload?.message ?? "Crypto database write failed.";
      result.status = "failed";
      saveLastV13PortfolioWriteResult(result);
      return result;
    }

    result.fallbackUsed = false;
    result.positionId = payload?.position?.id;
    result.status = "succeeded";
    result.target = "database";
    saveLastV13PortfolioWriteResult(result);
    return result;
  } catch (error) {
    result.errorMessage = error instanceof Error ? error.message : "Crypto database write failed.";
    result.status = "failed";
    saveLastV13PortfolioWriteResult(result);
    return result;
  }
}
