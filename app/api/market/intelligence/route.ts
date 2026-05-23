import { getMarketIntelligence } from "@/src/lib/market-data/intelligence";
import { MARKET_DATA_DISCLAIMER } from "@/src/lib/market-data/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const intelligence = await getMarketIntelligence();

  return Response.json({
    ...intelligence,
    disclaimer: MARKET_DATA_DISCLAIMER,
  });
}
