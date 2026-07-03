import { WatchlistExperienceWorkspace } from "@/components/watchlist/watchlist-experience-workspace";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/watchlist",
  description:
    "IXAI Workspace Watchlist 整理 local/fallback watchlist readback、Market Service quote status 與 monitoring-only context。",
  title: "Watchlist | 我的 IXAI",
});

export default function MyIxaiWatchlistPage() {
  return <WatchlistExperienceWorkspace />;
}
