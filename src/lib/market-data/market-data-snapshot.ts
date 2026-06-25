import { getDefaultMarketDataProvider } from "@/src/lib/market-data/provider-registry";
import { buildMarketDataDiagnostics } from "@/src/lib/market-data/market-data-diagnostics";
import {
  uniqueMarketDataSymbols,
} from "@/src/lib/market-data/market-data-provider-interface";
import type { MarketDataSnapshot } from "@/src/lib/market-data/market-data-types";

export const DEFAULT_PROGRAM_A_MARKET_DATA_SYMBOLS = [
  "AAPL",
  "TSLA",
  "NVDA",
  "MSFT",
  "BTCUSDT",
  "ETHUSDT",
] as const;

export async function buildMarketDataSnapshot(
  symbols: string[] = [...DEFAULT_PROGRAM_A_MARKET_DATA_SYMBOLS],
): Promise<MarketDataSnapshot> {
  const provider = getDefaultMarketDataProvider();
  const quotes = await provider.getQuotes(uniqueMarketDataSymbols(symbols));

  return {
    dataQuality: "placeholder",
    diagnostics: buildMarketDataDiagnostics(),
    generatedAt: new Date().toISOString(),
    providerStatus: provider.descriptor.providerStatus,
    quotes,
    source: "manual",
    warnings: [
      "V17 uses a manual placeholder provider only; no Yahoo, Binance, broker, or external market API is connected.",
      "Prices remain null until an approved future provider sprint supplies live or delayed data.",
    ],
  };
}

export function buildEmptyMarketDataSnapshot(): MarketDataSnapshot {
  return {
    dataQuality: "unavailable",
    diagnostics: buildMarketDataDiagnostics(),
    generatedAt: new Date().toISOString(),
    providerStatus: "unavailable",
    quotes: [],
    source: "placeholder",
    warnings: ["Market data snapshot is unavailable; downstream modules should keep fallback behavior."],
  };
}
