import { getMarketQuotes } from "@/src/lib/market/providers";
import {
  MARKET_DATA_DISCLAIMER,
  type MarketQuotesResponse,
} from "@/src/lib/market-data/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const symbols = (url.searchParams.get("symbols") ?? "")
    .split(",")
    .map((symbol) => symbol.trim())
    .filter(Boolean);

  const requestedSymbols = symbols.length > 0 ? symbols : ["BTC", "ETH", "SPY"];
  const quotes = await getMarketQuotes(requestedSymbols);

  return Response.json(
    {
      quotes,
      disclaimer: MARKET_DATA_DISCLAIMER,
      requestedSymbols,
      generatedAt: new Date().toISOString(),
    } satisfies MarketQuotesResponse,
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    },
  );
}
