import type {
  MarketDataPoint,
  MarketDataProviderDescriptor,
} from "@/src/lib/market-data/market-data-types";

export interface MarketDataProvider {
  descriptor: MarketDataProviderDescriptor;
  getQuote(symbol: string): Promise<MarketDataPoint>;
  getQuotes(symbols: string[]): Promise<MarketDataPoint[]>;
}

export function normalizeMarketDataSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

export function uniqueMarketDataSymbols(symbols: string[]) {
  return Array.from(
    new Set(symbols.map(normalizeMarketDataSymbol).filter(Boolean)),
  );
}
