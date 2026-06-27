import { NextRequest, NextResponse } from "next/server";

import { getYahooQuoteSnapshot } from "@/src/lib/market-data/yahoo/yahoo-quote-provider";

export const runtime = "nodejs";

const MAX_SYMBOLS = 30;
const SYMBOL_PATTERN = /^[A-Z0-9.^=_-]{1,24}$/;

function parseSymbols(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("symbols") ?? "";
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((symbol) => symbol.trim().toUpperCase())
        .filter(Boolean),
    ),
  );
}

export async function GET(request: NextRequest) {
  const symbols = parseSymbols(request);

  if (symbols.length === 0) {
    return NextResponse.json(
      {
        error: "At least one symbol is required.",
        ok: false,
        sourceStatus: "unavailable",
      },
      { status: 400 },
    );
  }

  if (symbols.length > MAX_SYMBOLS) {
    return NextResponse.json(
      {
        error: `A maximum of ${MAX_SYMBOLS} symbols is supported per request.`,
        ok: false,
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
        ok: false,
        sourceStatus: "unavailable",
      },
      { status: 400 },
    );
  }

  try {
    const snapshot = await getYahooQuoteSnapshot(symbols);

    return NextResponse.json({
      data: snapshot,
      generatedAt: new Date().toISOString(),
      ok: true,
      sourceStatus: snapshot.dataQuality,
      warnings: snapshot.missingQuoteSymbols.map(
        (symbol) => `Yahoo quote unavailable for ${symbol}.`,
      ),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Yahoo quote request failed.",
        generatedAt: new Date().toISOString(),
        ok: false,
        sourceStatus: "unavailable",
      },
      { status: 200 },
    );
  }
}
