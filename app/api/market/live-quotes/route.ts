import { NextRequest, NextResponse } from "next/server";

import {
  getMarketCacheSnapshot,
  getMarketQuotes,
  getProviderHealth,
} from "@/src/lib/market/market-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_SYMBOLS = 30;
const SYMBOL_PATTERN = /^[A-Z0-9.^=_-]{1,24}$/;

function normalizeSymbol(symbol: string) {
  const normalized = symbol.trim().toUpperCase();

  if (normalized === "BTC" || normalized === "ETH" || normalized === "BNB") {
    return `${normalized}USDT`;
  }

  return normalized;
}

function parseSymbols(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("symbols") ?? "";
  return Array.from(
    new Set(
      raw
        .split(",")
        .map(normalizeSymbol)
        .filter(Boolean),
    ),
  );
}

export async function GET(request: NextRequest) {
  const symbols = parseSymbols(request);
  const generatedAt = new Date().toISOString();

  if (symbols.length === 0) {
    return NextResponse.json(
      {
        error: "At least one symbol is required.",
        generatedAt,
        ok: false,
        quotes: [],
        sourceStatus: "unavailable",
      },
      { status: 400 },
    );
  }

  if (symbols.length > MAX_SYMBOLS) {
    return NextResponse.json(
      {
        error: `A maximum of ${MAX_SYMBOLS} symbols is supported per request.`,
        generatedAt,
        ok: false,
        quotes: [],
        sourceStatus: "unavailable",
      },
      { status: 400 },
    );
  }

  const invalidSymbols = symbols.filter((symbol) => !SYMBOL_PATTERN.test(symbol));

  if (invalidSymbols.length > 0) {
    return NextResponse.json(
      {
        error: `Invalid symbol(s): ${invalidSymbols.join(", ")}`,
        generatedAt,
        ok: false,
        quotes: [],
        sourceStatus: "unavailable",
      },
      { status: 400 },
    );
  }

  try {
    const quotes = await getMarketQuotes(symbols);
    const statuses = quotes.map((result) => result.sourceStatus);
    const sourceStatus = statuses.every((status) => status === "unavailable")
      ? "unavailable"
      : statuses.some((status) => status === "unavailable" || status === "stale")
        ? "partial"
        : statuses.some((status) => status === "fallback")
          ? "fallback"
          : statuses.some((status) => status === "delayed")
            ? "delayed"
            : "live";

    return NextResponse.json({
      cache: getMarketCacheSnapshot(),
      generatedAt: new Date().toISOString(),
      health: getProviderHealth(),
      ok: true,
      quotes,
      requestedSymbols: symbols,
      sourceStatus,
      warnings: quotes
        .filter((result) => result.error)
        .map((result) => `${result.symbol || result.requestedSymbol}: ${result.error?.message}`),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Live quote request failed.",
        generatedAt: new Date().toISOString(),
        ok: false,
        quotes: [],
        sourceStatus: "unavailable",
      },
      { status: 200 },
    );
  }
}
