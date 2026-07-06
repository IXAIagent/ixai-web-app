import type {
  EditorialProviderFallbackState,
  EditorialProviderHealth,
} from "@/src/lib/editorial/providers/provider-types";

export function buildProviderFallbackState({
  cachedAvailable,
  health,
  storyCount,
}: {
  cachedAvailable: boolean;
  health: EditorialProviderHealth[];
  storyCount: number;
}): EditorialProviderFallbackState {
  const healthy = health.filter((item) => item.status === "healthy");
  const degraded = health.filter((item) => item.status === "degraded");
  const primaryAvailable = healthy.length > 0;
  const secondaryAvailable = degraded.length > 0;
  const limitedBriefAvailable = storyCount > 0 || cachedAvailable;

  return {
    activeSource: primaryAvailable
      ? "primary"
      : secondaryAvailable
        ? "secondary"
        : cachedAvailable
          ? "cached"
          : limitedBriefAvailable
            ? "limited_brief"
            : "empty_state",
    cachedAvailable,
    fallbackReady: primaryAvailable || secondaryAvailable || cachedAvailable || limitedBriefAvailable,
    limitedBriefAvailable,
    primaryAvailable,
    secondaryAvailable,
  };
}
