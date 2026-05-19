import { WatchlistManager } from "@/components/watchlist/watchlist-manager";

export const metadata = {
  title: "自選觀察 | IXAI",
  description: "以 local-first 方式建立你的 IXAI 個人市場觀察清單。",
};

export default function WatchlistPage() {
  return <WatchlistManager />;
}
