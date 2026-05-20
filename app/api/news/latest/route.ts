import {
  getFallbackNewsIntakeResult,
  getLatestNewsIntakeResult,
} from "@/src/lib/news/providers";
import type { NewsCategory } from "@/src/types/news";

export const dynamic = "force-dynamic";

const categoryMap: Record<string, NewsCategory> = {
  macro: "Macro",
  ai: "AI / Tech",
  tech: "AI / Tech",
  crypto: "Crypto",
  rates: "Rates",
  equities: "Equities",
  risk: "Risk",
  geopolitics: "Geopolitics",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const categoryParam = url.searchParams.get("category")?.toLowerCase();
  const forceFallback = url.searchParams.get("fallback") === "1";
  const limitParam = Number(url.searchParams.get("limit") ?? "10");
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(Math.trunc(limitParam), 1), 25)
    : 10;
  const result = forceFallback
    ? getFallbackNewsIntakeResult()
    : await getLatestNewsIntakeResult();
  const category = categoryParam ? categoryMap[categoryParam] : undefined;
  const items = result.items
    .filter((item) => (category ? item.category === category : true))
    .slice(0, limit);

  return Response.json({
    ...result,
    items,
    itemCount: items.length,
    requestedCategory: category ?? null,
    limit,
  });
}
