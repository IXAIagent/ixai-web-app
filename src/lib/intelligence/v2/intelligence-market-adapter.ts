import type { MarketDataSnapshot } from "@/src/lib/market-data";

export function buildIntelligenceMarketContext(snapshot?: MarketDataSnapshot | null) {
  if (!snapshot) {
    return "Market context is unavailable; no provider call is attempted.";
  }

  return `${snapshot.quotes.length} manual placeholder quote(s); provider status ${snapshot.providerStatus}; external providers disabled.`;
}
