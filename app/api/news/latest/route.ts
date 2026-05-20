import {
  getFallbackNewsIntakeResult,
  getLatestNewsIntakeResult,
} from "@/src/lib/news/providers";
import type { NewsCategory } from "@/src/types/news";

export const dynamic = "force-dynamic";

const categoryMap: Record<string, NewsCategory> = {
  macro: "macro",
  ai: "ai_tech",
  tech: "ai_tech",
  ai_tech: "ai_tech",
  crypto: "crypto",
  rates: "rates",
  equities: "equities",
  taiwan: "taiwan",
  semiconductors: "semiconductors",
  semi: "semiconductors",
  risk: "risk",
  geopolitics: "geopolitics",
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
    .filter((item) =>
      category ? item.category === category || item.tags?.includes(category) : true,
    )
    .slice(0, limit);

  return Response.json({
    ...result,
    items,
    itemCount: items.length,
    sourceStatus: result.sourceStatus ?? result.sources,
    requestedCategory: category ?? null,
    limit,
  });
}
