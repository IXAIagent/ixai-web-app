import { WatchlistExperienceWorkspace } from "@/components/watchlist/watchlist-experience-workspace";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/watchlist",
  description:
    "IXAI Markets Workspace 整理 watchlist、market movers、market news 與今日市場影響。",
  title: "Markets | 我的 IXAI",
});

export default function MyIxaiWatchlistPage() {
  return <WatchlistExperienceWorkspace />;
}
