"use client";

import { parseDraftNumber, type FCNDraftUnderlying } from "@/src/lib/portfolio/input/fcn-draft-store";

export type V14FcnApiUnderlyingInput = {
  currentPrice?: number;
  initialPrice?: number;
  kiPrice?: number;
  koPrice?: number;
  market?: string;
  metadata?: Record<string, unknown>;
  name?: string;
  strikePrice?: number;
  symbol: string;
  weightPct?: number;
};

export function normalizeFcnDraftUnderlyingsForWrite(
  underlyings: FCNDraftUnderlying[],
): V14FcnApiUnderlyingInput[] {
  return underlyings
    .map((underlying) => ({
      currentPrice: parseDraftNumber(underlying.currentPrice) ?? undefined,
      initialPrice: parseDraftNumber(underlying.initialPrice) ?? undefined,
      kiPrice: parseDraftNumber(underlying.kiPrice) ?? undefined,
      koPrice: parseDraftNumber(underlying.koPrice) ?? undefined,
      market: underlying.market?.trim() || undefined,
      metadata: {
        source: "v14_fcn_database_activation",
      },
      name: underlying.name?.trim() || undefined,
      strikePrice: parseDraftNumber(underlying.strikePrice) ?? undefined,
      symbol: underlying.symbol.trim().toUpperCase(),
      weightPct: parseDraftNumber(underlying.weightPct) ?? undefined,
    }))
    .filter((underlying) => underlying.symbol);
}
