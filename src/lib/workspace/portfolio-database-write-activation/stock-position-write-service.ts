"use client";

import { getSupabaseAuthorizationHeaders } from "@/src/lib/supabase/client";
import { getOrCreateV13WorkspacePortfolioId, saveLastV13PortfolioWriteResult } from "@/src/lib/workspace/portfolio-database-write-activation/portfolio-write-service";
import type {
  V13PortfolioWriteResult,
  V13StockPositionWriteInput,
} from "@/src/lib/workspace/portfolio-database-write-activation/portfolio-write-activation-types";
import { getV13PortfolioWriteGuard } from "@/src/lib/workspace/portfolio-database-write-activation/portfolio-write-activation-guards";

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
    module: "stock_position",
    operation: "create_position",
    sourceAction: input.sourceAction,
    status: "skipped",
    target: "fallback",
  };
}

function normalizeStockCurrency(currency: string) {
  return ["USD", "TWD", "USDT", "HKD", "JPY"].includes(currency) ? currency : "USD";
}

function normalizeStockMarket(market: string) {
  return ["US", "TW", "HK", "JP"].includes(market) ? market : "OTHER";
}

export async function saveStockPositionWithV13DatabaseWrite(
  input: V13StockPositionWriteInput,
): Promise<V13PortfolioWriteResult> {
  const sourceAction = input.sourceAction ?? "asset_input_stock_submit";
  const guard = getV13PortfolioWriteGuard("stock_position");

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
    module: "stock_position",
    operation: "create_position",
    portfolioId: portfolioId ?? undefined,
    sourceAction,
    status: "fallback",
    target: "fallback",
  };

  if (!portfolioId) {
    result.errorMessage = "Portfolio database id is unavailable; stock local fallback remains active.";
    saveLastV13PortfolioWriteResult(result);
    return result;
  }

  try {
    const headers = await getSupabaseAuthorizationHeaders();

    if (!headers) {
      result.errorMessage = "No authenticated Supabase session; stock local fallback remains active.";
      saveLastV13PortfolioWriteResult(result);
      return result;
    }

    result.databaseAttempted = true;
    const response = await fetch("/api/stocks", {
      body: JSON.stringify({
        averageCost: input.costBasis,
        currency: normalizeStockCurrency(input.currency),
        market: normalizeStockMarket(input.market),
        metadata: {
          source: "v13_portfolio_database_write_activation",
          sourceAction,
        },
        name: input.assetName || null,
        portfolioId,
        positionType: "equity",
        quantity: input.quantity,
        symbol: input.ticker.toUpperCase(),
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
      result.errorMessage = payload?.message ?? "Stock database write failed.";
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
    result.errorMessage = error instanceof Error ? error.message : "Stock database write failed.";
    result.status = "failed";
    saveLastV13PortfolioWriteResult(result);
    return result;
  }
}
