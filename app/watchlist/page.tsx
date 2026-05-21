import { WatchlistManager } from "@/components/watchlist/watchlist-manager";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  title: "自選觀察",
  description: "建立你的 IXAI 個人市場觀察清單，追蹤關注標的與未來 AI 風險提醒基礎。",
});

export default function WatchlistPage() {
  return <WatchlistManager />;
}
