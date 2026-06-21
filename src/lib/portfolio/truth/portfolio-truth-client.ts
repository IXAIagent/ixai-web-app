"use client";

import { getSupabaseAuthorizationHeaders } from "@/src/lib/supabase/client";
import { buildPortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-center";
import { loadPendingPortfolioInputs } from "@/src/lib/portfolio/input/input-truth-bridge";
import type { PortfolioDashboardSummary } from "@/src/lib/portfolio/dashboard";
import type { PortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-types";
import type { CryptoPosition } from "@/src/types/crypto-position";
import type { FCNPosition } from "@/src/types/fcn-position";
import type { StockPosition } from "@/src/types/stock-position";

type PositionResponse<T> = {
  ok?: boolean;
  positions?: T[];
};

type DashboardResponse = {
  ok?: boolean;
  summary?: PortfolioDashboardSummary;
};

async function readPositions<T>(
  path: string,
  headers: HeadersInit,
): Promise<{ error: boolean; positions: T[] }> {
  try {
    const response = await fetch(path, {
      cache: "no-store",
      headers,
    });

    if (!response.ok) {
      return { error: true, positions: [] };
    }

    const payload = (await response.json()) as PositionResponse<T>;
    return { error: false, positions: payload.positions ?? [] };
  } catch {
    return { error: true, positions: [] };
  }
}

async function readPortfolioDashboard(
  headers: HeadersInit,
): Promise<{ error: boolean; summary: PortfolioDashboardSummary | null }> {
  try {
    const response = await fetch("/api/portfolio/dashboard", {
      cache: "no-store",
      headers,
    });

    if (!response.ok) {
      return { error: true, summary: null };
    }

    const payload = (await response.json()) as DashboardResponse;
    return { error: false, summary: payload.summary ?? null };
  } catch {
    return { error: true, summary: null };
  }
}

export async function loadPortfolioTruthReadback(): Promise<PortfolioTruthReadback> {
  const pendingInputs = loadPendingPortfolioInputs();
  const authHeaders = await getSupabaseAuthorizationHeaders();

  if (!authHeaders) {
    return buildPortfolioTruthReadback({
      cryptoPositions: [],
      fcnPositions: [],
      pendingInputs,
      portfolioDashboardSummary: null,
      stockPositions: [],
      unauthenticated: true,
    });
  }

  const [fcn, stock, crypto, dashboard] = await Promise.all([
    readPositions<FCNPosition>("/api/fcn", authHeaders),
    readPositions<StockPosition>("/api/stocks", authHeaders),
    readPositions<CryptoPosition>("/api/crypto", authHeaders),
    readPortfolioDashboard(authHeaders),
  ]);

  return buildPortfolioTruthReadback({
    cryptoError: crypto.error,
    cryptoPositions: crypto.positions,
    fcnError: fcn.error,
    fcnPositions: fcn.positions,
    pendingInputs,
    portfolioDashboardError: dashboard.error,
    portfolioDashboardSummary: dashboard.summary,
    stockError: stock.error,
    stockPositions: stock.positions,
  });
}
