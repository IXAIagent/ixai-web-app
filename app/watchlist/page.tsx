import { WatchlistManager } from "@/components/watchlist/watchlist-manager";

export const metadata = {
  title: "自選觀察",
  description: "建立你的 IXAI 個人市場觀察清單，追蹤關注標的與未來 AI 風險提醒基礎。",
  openGraph: {
    title: "IXAI 自選觀察",
    description: "建立個人市場觀察清單，作為未來 AI 風險提醒與個人化 intelligence 的基礎。",
  },
  twitter: {
    card: "summary_large_image",
    title: "IXAI 自選觀察",
    description: "追蹤關注標的與個人市場觀察。",
  },
};

export default function WatchlistPage() {
  return <WatchlistManager />;
}
